// خادم «لمّة» — Node.js بدون أي مكتبات خارجية
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { attach } = require('./ws');
const { Room } = require('./public/engine.js');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const rooms = new Map();
const conns = new Map(); // memberId -> {ws, rtts:[]}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

function newCode() {
  let c;
  do { c = String(1000 + Math.floor(Math.random() * 9000)); } while (rooms.has(c));
  return c;
}

function rttOf(id) {
  const c = conns.get(id);
  if (!c || !c.rtts.length) return 0;
  const s = c.rtts.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function makeRoom() {
  const code = newCode();
  const room = new Room(code, {
    send(id, obj) { const c = conns.get(id); if (c && c.ws.open) c.ws.send(JSON.stringify(obj)); },
    rtt: rttOf,
    now: () => Date.now(),
  });
  room.hostKey = Math.random().toString(36).slice(2);
  rooms.set(code, room);
  return room;
}

function _unused(req, limit) {
  return new Promise((res, rej) => {
    const chunks = []; let n = 0;
    req.on('data', (d) => { n += d.length; if (n > limit) { rej(new Error('big')); req.destroy(); } else chunks.push(d); });
    req.on('end', () => res(Buffer.concat(chunks).toString('utf8')));
    req.on('error', rej);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (p === '/api/create' && req.method === 'POST') {
      const room = makeRoom();
      return json(res, 200, { code: room.code, hostKey: room.hostKey });
    }
    if (p === '/api/exists') {
      const r = rooms.get(url.searchParams.get('room'));
      return json(res, 200, { ok: !!r, players: r ? r.players.size : 0 });
    }
    if (p === '/healthz') return json(res, 200, { ok: true, rooms: rooms.size });

    // ملفات ثابتة
    let file = p === '/' || /^\/(r|screen)\/?/.test(p) ? '/index.html' : p;
    file = path.normalize(path.join(PUB, file));
    if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('غير موجود'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': file.endsWith('.html') ? 'no-cache' : 'public, max-age=300' });
      res.end(data);
    });
  } catch (e) {
    json(res, 400, { ok: false, error: String(e.message || e) });
  }
});

attach(server, '/ws', (ws) => {
  let room = null, memberId = null, pingK = 0;
  const pings = {};
  const timer = setInterval(() => {
    if (!memberId) return;
    pingK++;
    pings[pingK] = Date.now();
    ws.send(JSON.stringify({ t: 'ping', k: pingK }));
    ws.ping();
  }, 2000);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (msg.t === 'pong') {
      const at = pings[msg.k];
      if (at && memberId && conns.has(memberId)) {
        const c = conns.get(memberId);
        c.rtts.push(Date.now() - at); if (c.rtts.length > 7) c.rtts.shift();
        delete pings[msg.k];
      }
      return;
    }
    if (msg.t === 'join') {
      room = rooms.get(String(msg.room || ''));
      if (!room) { ws.send(JSON.stringify({ t: 'error', code: 'noroom', msg: 'الغرفة غير موجودة أو انتهت' })); return; }
      const makeHost = !!msg.hostKey && msg.hostKey === room.hostKey;
      const r = room.join({ id: msg.id, token: msg.token, name: msg.name, emoji: msg.emoji, role: msg.role === 'display' ? 'display' : 'player', makeHost });
      if (r.error) { ws.send(JSON.stringify({ t: 'error', code: 'full', msg: r.error })); return; }
      if (makeHost) delete room.hostKey;
      memberId = r.member.id;
      const old = conns.get(memberId);
      if (old && old.ws !== ws) { try { old.ws.send(JSON.stringify({ t: 'replaced' })); old.ws.close(); } catch (e) {} }
      conns.set(memberId, { ws, rtts: [], room: room.code });
      ws.send(JSON.stringify({ t: 'welcome', id: memberId, token: r.member.token, room: room.code, rejoined: r.rejoined }));
      room.changed();
      return;
    }
    if (room && memberId) room.handle(memberId, msg);
  });

  ws.on('close', () => {
    clearInterval(timer);
    if (room && memberId) {
      const c = conns.get(memberId);
      if (c && c.ws === ws) { conns.delete(memberId); room.disconnect(memberId); }
    }
  });
});

// تنظيف الغرف الفارغة ونقل الاستضافة عند الغياب الطويل
setInterval(() => {
  rooms.forEach((room, code) => {
    room.tick();
    if (room.isEmptyFor(40 * 60 * 1000)) { room.clearTimers(); rooms.delete(code); }
  });
}, 5000);

server.listen(PORT, () => console.log('لمّة تعمل على المنفذ ' + PORT));
