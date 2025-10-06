import { useEffect } from 'react'

export default function Splash() {
  useEffect(() => {
    const el = document.getElementById('splash')
    if (el) {
      // fade out the static splash after React mounts
      el.style.transition = 'opacity 300ms ease-out'
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 350)
    }
  }, [])

  return null
}
