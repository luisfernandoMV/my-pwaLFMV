import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Splash from './components/Splash'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-shell">
      <Splash />
      <header className="app-header" style={{background:'#0ea5a4',color:'white',padding:12}}>
        <h1 style={{margin:0,fontSize:18}}>My PWA LFMV</h1>
      </header>
      <main style={{padding:16}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <img src={viteLogo} className="logo" alt="Vite logo" style={{width:48}} />
          <img src={reactLogo} className="logo react" alt="React logo" style={{width:48}} />
        </div>
        <h2>Bienvenido</h2>
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
