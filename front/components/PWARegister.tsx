'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('SW registered:', registration.scope)
        })
        .catch(err => {
          console.error('SW registration failed:', err)
        })
    }
  }, [])

  return null
}
