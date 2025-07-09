const express = require('express');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const logins = require('./logins');
const app = express();
const PORT = 3000;
const file = path.join(__dirname, 'storage.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { trailMap: [], history: [] });

function craftNick(size = 6) {
  const chars = 'abcde23456789fghijklmnopqrstuvwxz';
  let nick = '';
  while (nick.length < size) {
    const spot = Math.floor(Math.random() * chars.length);
    nick += chars[spot];
  }
  return nick;
}

function setTimer(minutes = 30) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function clockedOut(when) {
  return new Date(when) < new Date();
}

/*
async function igniteMemory() {
  await db.write();
  db.data ||= { trailMap: [], history: [] }; 
  await db.read();
}*/


async function igniteMemory() {
  await db.read();
  db.data ||= { trailMap: [], history: [] }; 
  await db.write();
}

function storeRoute(code, url, expiry) {
  const exists = db.data.trailMap.find(r => r.code === code);
  if (exists) return false;
  db.data.trailMap.push({
    code,
    url,
    created: new Date().toISOString(),
    expiry,
    total: 0
  });
  db.write();
  return true;
}

function grabRoute(code) {
  return db.data.trailMap.find(r => r.code === code);
}

function trackVisit(code, from, place) {
  const link = grabRoute(code);
  if (!link) return;
  link.total += 1;
  db.data.history.push({
    code,
    time: new Date().toISOString(),
    source: from || 'unknown',
    place
  });
  db.write();
}

function showHistory(code) {
  return db.data.history.filter(r => r.code === code);
}

app.use(express.json());
app.use(logins);

app.post('/shorturls', async (req, res) => {
  const { url, validity, shortcode } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: ' wrong URL' });
  }

  const chosen = shortcode || craftNick();
  const expiry = setTimer(validity || 30);
  const added = storeRoute(chosen, url, expiry);

  if (!added) return res.status(409).json({ error: 'Shortcode exists' });

  res.status(201).json({
    shortLink: `http://localhost:${PORT}/${chosen}`,
    expiry
  });
});

// ✅ GET /:code — Redirect to long URL
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const record = grabRoute(code);
  if (!record) return res.status(404).json({ error: 'Not found' });
  if (clockedOut(record.expiry)) return res.status(410).json({ error: 'Link expired' });

  trackVisit(code, req.get('referer'), req.ip);
  res.redirect(record.url);
});

// ✅ GET /shorturls/:code — View analytics
app.get('/shorturls/:code', async (req, res) => {
  const { code } = req.params;
  const record = grabRoute(code);
  if (!record) return res.status(404).json({ error: 'Not found' });

  const visits = showHistory(code);
  res.json({
    original: record.url,
    created: record.created,
    expires: record.expiry,
    totalClicks: record.total,
    visits
  });
});

// Start server
igniteMemory().then(() => {
  app.listen(PORT, () => {
    console.log(`🔗 LinkMage ready on http://localhost:${PORT}`);
  });
});
