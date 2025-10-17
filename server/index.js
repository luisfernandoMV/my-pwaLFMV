require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { saveEntries } = require('./db')

const PORT = process.env.PORT || 4001
const app = express()
app.use(express.json())
// Allow CORS for development (be careful in production)
app.use(cors())

// --- Web Push (VAPID) demo storage ---
const webpush = require('web-push')
const fs = require('fs')
const vapidFile = './vapid.json'
let vapidKeys
if (fs.existsSync(vapidFile)) {
  vapidKeys = JSON.parse(fs.readFileSync(vapidFile))
} else if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
  vapidKeys = { publicKey: process.env.VAPID_PUBLIC, privateKey: process.env.VAPID_PRIVATE }
  fs.writeFileSync(vapidFile, JSON.stringify(vapidKeys))
} else {
  // generate and persist
  vapidKeys = webpush.generateVAPIDKeys()
  fs.writeFileSync(vapidFile, JSON.stringify(vapidKeys))
}
webpush.setVapidDetails('mailto:example@domain.com', vapidKeys.publicKey, vapidKeys.privateKey)

// store subscriptions in-memory (for demo only)
const subscriptions = []

app.get('/api/vapidPublicKey', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey })
})

app.post('/api/subscribe', (req, res) => {
  const sub = req.body
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'invalid subscription' })
  subscriptions.push(sub)
  res.json({ ok: true })
})

app.post('/api/push-test', async (req, res) => {
  try {
    const payload = JSON.stringify({ title: 'Notificación de prueba', body: 'Hola desde el backend!' })
    const results = []
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload)
        results.push({ endpoint: sub.endpoint, ok: true })
      } catch (err) {
        results.push({ endpoint: sub.endpoint, ok: false, error: err.message })
      }
    }
    return res.json({ ok: true, results })
  } catch (err) {
    console.error('push-test error', err)
    return res.status(500).json({ error: 'push failed' })
  }
})

app.post('/api/sync-entries', async (req, res) => {
  try {
    const { entries } = req.body
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries must be an array' })
    const inserted = await saveEntries(entries)
    return res.json({ ok: true, inserted })
  } catch (err) {
    console.error('Error saving entries', err)
    return res.status(500).json({ error: 'internal' })
  }
})

app.get('/', (req, res) => res.send('my-pwa backend'))

app.listen(PORT, () => console.log('Server listening on', PORT))
