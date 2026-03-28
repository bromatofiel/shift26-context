'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function SharePage() {
  const searchParams = useSearchParams()
  
  const title = searchParams.get('title')
  const text = searchParams.get('text')
  const url = searchParams.get('url')

  useEffect(() => {
    if (url || text) {
      console.log("Contenu reçu :", { title, text, url })
      // Ici, vous pouvez par exemple pré-remplir un formulaire
    }
  }, [title, text, url])

  return (
    <div>
      <h1>Contenu partagé reçu !</h1>
      <p>Titre : {title}</p>
      <p>Lien : {url}</p>
    </div>
  )
}