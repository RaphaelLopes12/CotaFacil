import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cotafacil_tema'

export function useTema() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo !== null) {
      return salvo === 'escuro'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, temaEscuro ? 'escuro' : 'claro')
    document.documentElement.setAttribute('data-tema', temaEscuro ? 'escuro' : 'claro')
  }, [temaEscuro])

  const toggleTema = () => setTemaEscuro(prev => !prev)

  return { temaEscuro, toggleTema }
}
