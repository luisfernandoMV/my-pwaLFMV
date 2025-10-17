import { useEffect, useState } from 'react'

const BACKEND_URL = (window && window.location && window.location.hostname === 'localhost') ? 'http://localhost:4001' : ''

async function getVapidPublicKey() {
  const url = BACKEND_URL ? `${BACKEND_URL}/api/vapidPublicKey` : '/api/vapidPublicKey'
  const res = await fetch(url)
  if (!res.ok) throw new Error('No VAPID key: ' + res.status)
  const data = await res.json()
  return data.publicKey
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushManager() {
  const [status, setStatus] = useState('unknown')
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(Notification.permission)
  }, [])

  async function subscribe() {
    try {
      const permission = await Notification.requestPermission()
      setStatus(permission)
      if (permission !== 'granted') return
      const reg = await navigator.serviceWorker.ready
      const vapidKey = await getVapidPublicKey()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })
      // enviar la suscripción al backend
      const subscribeUrl = BACKEND_URL ? `${BACKEND_URL}/api/subscribe` : '/api/subscribe'
      const res = await fetch(subscribeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error('subscribe failed: ' + res.status + ' ' + txt)
      }
      alert('Suscrito a notificaciones (demo)')
    } catch (err) {
      console.error('subscribe error', err)
  const anyErr: any = err
  const msg = anyErr && anyErr.message ? anyErr.message : String(anyErr)
      setLastError(msg)
      alert('Fallo al suscribir: ' + msg)
    }
  }

  async function sendTest() {
    try {
      const pushUrl = BACKEND_URL ? `${BACKEND_URL}/api/push-test` : '/api/push-test'
      const res = await fetch(pushUrl, { method: 'POST' })
      let data
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      console.log('push test response', data)
      alert('Push test enviado (revisa dispositivo)')
    } catch (err) {
      console.error('push test failed', err)
      alert('Fallo al enviar push test')
    }
  }

  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <div>Notificaciones: <strong>{status}</strong></div>
      <button onClick={subscribe}>Permitir notificaciones</button>
      <button onClick={sendTest}>Enviar notificación de prueba</button>
      {lastError ? <div style={{color:'crimson',marginLeft:8}}>Error: {lastError}</div> : null}
    </div>
  )
}
