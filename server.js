const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    return { items: [], locations: [], picklists: [], transactions: [] };
  }
}
function saveData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple helpers
function ensureDefaults(d){
  d.items = d.items || [];
  d.locations = d.locations || ["A-01-01","A-01-02","A-01-03","B-02-01","B-02-02","B-02-03"];
  d.picklists = d.picklists || [];
  d.transactions = d.transactions || [];
}

app.get('/api/state', (req, res) => {
  const d = loadData(); ensureDefaults(d); res.json(d);
});

app.get('/api/items', (req, res) => {
  const d = loadData(); ensureDefaults(d); res.json(d.items);
});

app.post('/api/items', (req, res) => {
  const { id, name, qty, location, minQty } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  const d = loadData(); ensureDefaults(d);
  const exists = d.items.find(it => it.id === id);
  if (exists) {
    exists.qty = Number(exists.qty) + Number(qty || 0);
    if (location) exists.location = location;
  } else {
    d.items.push({ id, name, qty: Number(qty||0), location: location || null, minQty: Number(minQty||0) });
  }
  d.transactions.push({ id: 't_' + Date.now(), type: 'receive', itemId: id, qty: Number(qty||0), at: new Date().toISOString() });
  saveData(d);
  res.json({ ok: true });
});

app.post('/api/inventory/adjust', (req, res) => {
  const { itemId, delta, reason } = req.body;
  const d = loadData(); ensureDefaults(d);
  d.items = d.items.map(it => it.id === itemId ? { ...it, qty: Number(it.qty) + Number(delta) } : it);
  d.transactions.push({ id: 't_' + Date.now(), type: reason || 'adjust', itemId, qty: Number(delta), at: new Date().toISOString() });
  saveData(d);
  res.json({ ok: true });
});

app.post('/api/move', (req, res) => {
  const { itemId, to } = req.body;
  const d = loadData(); ensureDefaults(d);
  d.items = d.items.map(it => it.id === itemId ? { ...it, location: to } : it);
  d.transactions.push({ id: 't_' + Date.now(), type: 'move', itemId, to, at: new Date().toISOString() });
  saveData(d);
  res.json({ ok: true });
});

app.post('/api/picklists', (req, res) => {
  const { name, lines } = req.body;
  const d = loadData(); ensureDefaults(d);
  const pl = { id: 'pl_' + Date.now(), name: name || ('Pick ' + new Date().toISOString()), lines, status: 'open', createdAt: new Date().toISOString() };
  d.picklists.push(pl);
  d.transactions.push({ id: 't_' + Date.now(), type: 'picklist_create', picklistId: pl.id, at: new Date().toISOString() });
  saveData(d);
  res.json(pl);
});

app.post('/api/picklists/:id/complete', (req, res) => {
  const id = req.params.id;
  const d = loadData(); ensureDefaults(d);
  const pl = d.picklists.find(p => p.id === id);
  if (!pl) return res.status(404).json({ error: 'not found' });
  pl.status = 'done';
  pl.doneAt = new Date().toISOString();
  pl.lines.forEach(ln => {
    d.items = d.items.map(it => it.id === ln.itemId ? { ...it, qty: Math.max(0, Number(it.qty) - Number(ln.qty)) } : it);
  });
  d.transactions.push({ id: 't_' + Date.now(), type: 'pick_complete', picklistId: id, at: new Date().toISOString() });
  saveData(d);
  res.json({ ok: true });
});

app.get('/api/locations', (req, res) => {
  const d = loadData(); ensureDefaults(d); res.json(d.locations);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server started on port', port));