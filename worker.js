// «لمّة» على Cloudflare Workers — كل غرفة Durable Object يشغّل نفس محرك اللعبة
import Engine from './public/engine.js';
const { Room } = Engine;

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const validCode = (c) => /^\d{4}$/.test(c || '');

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (p === '/api/create' && request.method === 'POST') {
      for (let i = 0; i < 12; i++) {
        const code = String(1000 + Math.floor(Math.random() * 9000));
        const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
        const r = await stub.fetch('https://room/init', { method: 'POST' });
        if (r.status === 200) return json(Object.assign({ code }, await r.json()));
      }
      return json({ ok: false, error: 'busy' }, 503);
    }
    if (p === '/api/exists') {
      const code = url.searchParams.get('room');
      if (!validCode(code)) return json({ ok: false, players: 0 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
      return stub.fetch('https://room/exists');
    }
    if (p === '/ws') {
      const code = url.searchParams.get('room');
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
      if (!validCode(code)) return new Response('bad room', { status: 400 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
      return stub.fetch(request);
    }
    if (p === '/healthz') return json({ ok: true });
    // صفحات التطبيق: /r/1234 و /screen/1234 تفتح نفس الصفحة
    if (/^\/(r|screen)\//.test(p)) return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    return env.ASSETS.fetch(request);
  },
};

export class RoomDO {
  constructor(state, env) {
    this.state = state;
    this.room = null;
    this.conns = new Map(); // memberId -> {ws, rtts}
  }
  makeRoom() {
    const self = this;
    this.room = new Room('----', {
      send(id, obj) { const c = self.conns.get(id); if (c) { try { c.ws.send(JSON.stringify(obj)); } catch (e) {} } },
      rtt(id) { const c = self.conns.get(id); if (!c || !c.rtts.length) return 0; const s = c.rtts.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; },
      now: () => Date.now(),
    });
    this.room.hostKey = Math.random().toString(36).slice(2);
    this.tickT = setInterval(() => { if (this.room) this.room.tick(); }, 5000);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/init') {
      if (this.room && !this.room.isEmptyFor(40 * 60 * 1000)) return json({ ok: false }, 409);
      if (this.room) { this.room.clearTimers(); clearInterval(this.tickT); }
      this.makeRoom();
      return json({ hostKey: this.room.hostKey });
    }
    if (url.pathname === '/exists') return json({ ok: !!this.room, players: this.room ? this.room.players.size : 0 });
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      this.handleSocket(server, new URL(request.url).searchParams.get('room'));
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response('not found', { status: 404 });
  }
  handleSocket(ws, code) {
    let memberId = null, pingK = 0;
    const pings = {};
    const send = (o) => { try { ws.send(JSON.stringify(o)); } catch (e) {} };
    const timer = setInterval(() => { if (!memberId) return; pingK++; pings[pingK] = Date.now(); send({ t: 'ping', k: pingK }); }, 2000);
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data)); } catch (e) { return; }
      if (msg.t === 'pong') {
        const at = pings[msg.k]; const c = memberId && this.conns.get(memberId);
        if (at && c) { c.rtts.push(Date.now() - at); if (c.rtts.length > 7) c.rtts.shift(); delete pings[msg.k]; }
        return;
      }
      const room = this.room;
      if (msg.t === 'join') {
        if (!room) { send({ t: 'error', code: 'noroom', msg: 'الغرفة غير موجودة أو انتهت' }); return; }
        room.code = String(msg.room || code || room.code);
        const makeHost = !!msg.hostKey && msg.hostKey === room.hostKey;
        const r = room.join({ id: msg.id, token: msg.token, name: msg.name, emoji: msg.emoji, role: msg.role === 'display' ? 'display' : 'player', makeHost });
        if (r.error) { send({ t: 'error', code: 'full', msg: r.error }); return; }
        if (makeHost) room.hostKey = null;
        memberId = r.member.id;
        const old = this.conns.get(memberId);
        if (old && old.ws !== ws) { try { old.ws.send(JSON.stringify({ t: 'replaced' })); old.ws.close(1000, 'replaced'); } catch (e) {} }
        this.conns.set(memberId, { ws, rtts: [] });
        send({ t: 'welcome', id: memberId, token: r.member.token, room: room.code, rejoined: r.rejoined });
        room.changed();
        return;
      }
      if (room && memberId) room.handle(memberId, msg);
    });
    const closed = () => {
      clearInterval(timer);
      if (this.room && memberId) {
        const c = this.conns.get(memberId);
        if (c && c.ws === ws) { this.conns.delete(memberId); this.room.disconnect(memberId); }
      }
    };
    ws.addEventListener('close', closed);
    ws.addEventListener('error', closed);
  }
}
