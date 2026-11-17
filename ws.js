// خادم WebSocket بسيط بدون مكتبات خارجية (RFC 6455) — نصوص فقط
'use strict';
const crypto = require('crypto');
const { EventEmitter } = require('events');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MSG = 8 * 1024 * 1024;

class WSConn extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.frags = [];
    this.open = true;
    socket.setNoDelay(true);
    socket.on('data', (d) => this._onData(d));
    socket.on('close', () => this._closed());
    socket.on('error', () => this._closed());
  }
  _closed() {
    if (!this.open) return;
    this.open = false;
    this.emit('close');
  }
  _onData(chunk) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, chunk]) : chunk;
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1];
      const fin = (b0 & 0x80) !== 0;
      const op = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) {
        if (this.buf.length < 4) return;
        len = this.buf.readUInt16BE(2); off = 4;
      } else if (len === 127) {
        if (this.buf.length < 10) return;
        const hi = this.buf.readUInt32BE(2), lo = this.buf.readUInt32BE(6);
        len = hi * 4294967296 + lo; off = 10;
      }
      if (len > MAX_MSG) { this.close(); return; }
      const maskOff = off;
      if (masked) off += 4;
      if (this.buf.length < off + len) return;
      let payload = this.buf.subarray(off, off + len);
      if (masked) {
        const m = this.buf.subarray(maskOff, maskOff + 4);
        const out = Buffer.allocUnsafe(len);
        for (let i = 0; i < len; i++) out[i] = payload[i] ^ m[i & 3];
        payload = out;
      } else {
        payload = Buffer.from(payload);
      }
      this.buf = this.buf.subarray(off + len);
      this._frame(fin, op, payload);
      if (!this.open) return;
    }
  }
  _frame(fin, op, payload) {
    if (op === 0x8) { this._send(0x8, Buffer.alloc(0)); this.socket.end(); this._closed(); return; }
    if (op === 0x9) { this._send(0xA, payload); return; }
    if (op === 0xA) return;
    if (op === 0x1 || op === 0x2 || op === 0x0) {
      this.frags.push(payload);
      if (fin) {
        const msg = Buffer.concat(this.frags).toString('utf8');
        this.frags = [];
        this.emit('message', msg);
      }
    }
  }
  _send(op, payload) {
    if (!this.open) return;
    const len = payload.length;
    let header;
    if (len < 126) { header = Buffer.from([0x80 | op, len]); }
    else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x80 | op; header[1] = 126; header.writeUInt16BE(len, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x80 | op; header[1] = 127; header.writeUInt32BE(Math.floor(len / 4294967296), 2); header.writeUInt32BE(len >>> 0, 6); }
    try { this.socket.write(Buffer.concat([header, payload])); } catch (e) { this._closed(); }
  }
  send(str) { this._send(0x1, Buffer.from(str, 'utf8')); }
  ping() { this._send(0x9, Buffer.alloc(0)); }
  close() { if (!this.open) return; this._send(0x8, Buffer.alloc(0)); try { this.socket.end(); } catch (e) {} this._closed(); }
}

function attach(server, path, onConn) {
  server.on('upgrade', (req, socket) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname !== path || (req.headers.upgrade || '').toLowerCase() !== 'websocket') {
      socket.destroy(); return;
    }
    const key = req.headers['sec-websocket-key'];
    if (!key) { socket.destroy(); return; }
    const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
    onConn(new WSConn(socket), req, url);
  });
}

module.exports = { attach };
