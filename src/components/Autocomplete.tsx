import { useState, useRef, useEffect } from 'react'

interface AutocompleteProps {
  id: string
  value: string
  onChange: (value: string) => void
  sugestoes: string[]
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}

export function Autocomplete({
  id,
  value,
  onChange,
  sugestoes,
  placeholder,
  required,
  autoFocus
}: AutocompleteProps) {
  const [aberto, setAberto] = useState(false)
  const [filtradas, setFiltradas] = useState<string[]>([])
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (value.length >= 2) {
      const termo = value.toLowerCase()
      const matches = sugestoes
        .filter(s => s.toLowerCase().includes(termo) && s.toLowerCase() !== termo)
        .slice(0, 5)
      setFiltradas(matches)
      setAberto(matches.length > 0)
    } else {
      setFiltradas([])
      setAberto(false)
    }
    setIndiceSelecionado(-1)
  }, [value, sugestoes])

  const handleSelect = (sugestao: string) => {
    onChange(sugestao)
    setAberto(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!aberto || filtradas.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceSelecionado(prev => (prev < filtradas.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceSelecionado(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && indiceSelecionado >= 0) {
      e.preventDefault()
      handleSelect(filtradas[indiceSelecionado])
    } else if (e.key === 'Escape') {
      setAberto(false)
    }
  }

  const handleBlur = () => {
    // Delay para permitir clique na sugestão
    setTimeout(() => {
      if (!listaRef.current?.contains(document.activeElement)) {
        setAberto(false)
      }
    }, 150)
  }

  return (
    <div className="autocomplete">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.length >= 2 && filtradas.length > 0 && setAberto(true)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {aberto && (
        <ul ref={listaRef} className="autocomplete-lista">
          {filtradas.map((sugestao, index) => (
            <li
              key={sugestao}
              className={`autocomplete-item ${index === indiceSelecionado ? 'selecionado' : ''}`}
              onClick={() => handleSelect(sugestao)}
              onMouseEnter={() => setIndiceSelecionado(index)}
            >
              {sugestao}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
