import { useState } from 'react'
import { ClipboardList, Download, Upload, GitCompare, BarChart3, Moon, Sun, List, FileSpreadsheet, FileJson } from 'lucide-react'
import { useRef } from 'react'
import { exportarDados, exportarExcel, importarDados } from '../utils/storage'
import type { Cotacao, Tela } from '../types/index'

interface HeaderProps {
  totalCotacoes: number
  onImport: (cotacoes: Cotacao[]) => void
  telaAtiva: Tela
  onTrocarTela: (tela: Tela) => void
  temaEscuro: boolean
  onToggleTema: () => void
}

export function Header({ totalCotacoes, onImport, telaAtiva, onTrocarTela, temaEscuro, onToggleTema }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [menuExportarAberto, setMenuExportarAberto] = useState(false)

  const handleExportarJSON = () => {
    const dados = exportarDados()
    const blob = new Blob([dados], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cotafacil-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenuExportarAberto(false)
  }

  const handleExportarExcel = () => {
    exportarExcel()
    setMenuExportarAberto(false)
  }

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      const cotacoes = importarDados(json)
      if (cotacoes) {
        onImport(cotacoes)
      } else {
        alert('Arquivo inválido')
      }
    }
    reader.readAsText(file)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <ClipboardList size={28} />
          <div>
            <h1>CotaFácil</h1>
            <span className="header-subtitle">
              {totalCotacoes} {totalCotacoes === 1 ? 'cotação' : 'cotações'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={onToggleTema}
            title={temaEscuro ? 'Tema claro' : 'Tema escuro'}
          >
            {temaEscuro ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="dropdown-container">
            <button
              className="btn-icon"
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              title="Exportar dados"
            >
              <Download size={20} />
            </button>

            {menuExportarAberto && (
              <>
                <div className="menu-overlay" onClick={() => setMenuExportarAberto(false)} />
                <div className="menu-dropdown menu-dropdown-header">
                  <button onClick={handleExportarExcel}>
                    <FileSpreadsheet size={16} />
                    Excel (.xlsx)
                  </button>
                  <button onClick={handleExportarJSON}>
                    <FileJson size={16} />
                    Backup (.json)
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            className="btn-icon"
            onClick={() => inputRef.current?.click()}
            title="Importar backup"
          >
            <Upload size={20} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            onChange={handleImportar}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`header-nav-btn ${telaAtiva === 'lista' ? 'ativo' : ''}`}
          onClick={() => onTrocarTela('lista')}
        >
          <List size={18} />
          Lista
        </button>
        <button
          className={`header-nav-btn ${telaAtiva === 'comparador' ? 'ativo' : ''}`}
          onClick={() => onTrocarTela('comparador')}
        >
          <GitCompare size={18} />
          Comparar
        </button>
        <button
          className={`header-nav-btn ${telaAtiva === 'relatorio' ? 'ativo' : ''}`}
          onClick={() => onTrocarTela('relatorio')}
        >
          <BarChart3 size={18} />
          Relatório
        </button>
      </nav>
    </header>
  )
}
