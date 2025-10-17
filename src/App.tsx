import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Splash from './components/Splash'
import ActivityForm from './components/ActivityForm'
import ActivityList from './components/ActivityList'
import { addActivity, getAllActivities, type Activity } from './utils/indexedDB'
import PushManager from './components/PushManager'

function App() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Activity[]>([])
  const [online, setOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    // load activities from IndexedDB on mount
    getAllActivities().then(setItems).catch((err) => console.error(err))

    function onOnline() {
      setOnline(true)
    }
    function onOffline() {
      setOnline(false)
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  async function handleSave(activity: Activity) {
    try {
      await addActivity(activity)
      const all = await getAllActivities()
      setItems(all)
    } catch (err) {
      console.error('Error guardando actividad', err)
    }
  }

  return (
    <div className="app-shell">
      <Splash />
      <header className="app-header" style={{background:'#0ea5a4',color:'white',padding:12}}>
        <h1 style={{margin:0,fontSize:18}}>My PWA LFMV</h1>
      </header>
      <main style={{padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h2 style={{margin:0}}>Bienvenido</h2>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{width:10,height:10,borderRadius:10,background: online ? '#10b981' : '#ef4444'}} aria-hidden />
            <small>{online ? 'Online' : 'Offline'}</small>
          </div>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <img src={viteLogo} className="logo" alt="Vite logo" style={{width:48}} />
          <img src={reactLogo} className="logo react" alt="React logo" style={{width:48}} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:12}}>
          <section>
            <h3>Agregar actividad</h3>
            <ActivityForm onSave={handleSave} />
            <div style={{marginTop:12}}>
              <PushManager />
            </div>
          </section>
          <section>
            <h3>Actividades guardadas</h3>
            <ActivityList items={items} />
          </section>
        </div>
        <div className="card">
          <button onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
