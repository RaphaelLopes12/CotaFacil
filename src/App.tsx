import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from './components/Header'
import { Filtros } from './components/Filtros'
import { ListaCotacoes } from './components/ListaCotacoes'
import { FormCotacao } from './components/FormCotacao'
import { Comparador } from './components/Comparador'
import { Relatorio } from './components/Relatorio'
import { AlertaVencimento } from './components/AlertaVencimento'
import { useCotacoes } from './hooks/useCotacoes'
import { useTema } from './hooks/useTema'
import type { Cotacao, CotacaoInput, Tela } from './types/index'
import './styles/global.css'

function App() {
  const {
    cotacoes,
    todasCotacoes,
    categorias,
    fornecedores,
    produtosUnicos,
    cotacoesPorProduto,
    estatisticas,
    filtros,
    setFiltros,
    adicionarCotacao,
    editarCotacao,
    excluirCotacao,
    duplicarCotacao,
    toggleFavorito
  } = useCotacoes()

  const { temaEscuro, toggleTema } = useTema()

  const [telaAtiva, setTelaAtiva] = useState<Tela>('lista')
  const [modalAberto, setModalAberto] = useState(false)
  const [cotacaoEditando, setCotacaoEditando] = useState<Cotacao | null>(null)
  // Para "Cotar novamente" - preenche o form mas cria nova cotação
  const [cotacaoRepetindo, setCotacaoRepetindo] = useState<Cotacao | null>(null)

  const handleNovaCotacao = () => {
    setCotacaoEditando(null)
    setCotacaoRepetindo(null)
    setModalAberto(true)
  }

  const handleEditar = (cotacao: Cotacao) => {
    setCotacaoEditando(cotacao)
    setCotacaoRepetindo(null)
    setModalAberto(true)
  }

  const handleRepetir = (cotacao: Cotacao) => {
    // Abre o form preenchido mas como nova cotação (sem ID de edição)
    setCotacaoEditando(null)
    setCotacaoRepetindo(cotacao)
    setModalAberto(true)
  }

  const handleSalvar = (input: CotacaoInput) => {
    if (cotacaoEditando) {
      editarCotacao(cotacaoEditando.id, input)
    } else {
      adicionarCotacao(input)
    }
    setModalAberto(false)
    setCotacaoEditando(null)
    setCotacaoRepetindo(null)
  }

  const handleCancelar = () => {
    setModalAberto(false)
    setCotacaoEditando(null)
    setCotacaoRepetindo(null)
  }

  const handleImport = () => {
    window.location.reload()
  }

  // Para o alerta de vencimento - ao clicar vai para a tela de lista e edita
  const handleVerCotacaoVencendo = (cotacao: Cotacao) => {
    setTelaAtiva('lista')
    handleEditar(cotacao)
  }

  return (
    <div className="app">
      <Header
        totalCotacoes={todasCotacoes.length}
        onImport={handleImport}
        telaAtiva={telaAtiva}
        onTrocarTela={setTelaAtiva}
        temaEscuro={temaEscuro}
        onToggleTema={toggleTema}
      />

      <main className="main">
        {telaAtiva === 'lista' && (
          <>
            <AlertaVencimento
              cotacoes={todasCotacoes}
              onVerCotacao={handleVerCotacaoVencendo}
            />
            <Filtros
              filtros={filtros}
              categorias={categorias}
              fornecedores={fornecedores}
              onChange={setFiltros}
            />
            <ListaCotacoes
              cotacoes={cotacoes}
              onEditar={handleEditar}
              onExcluir={excluirCotacao}
              onDuplicar={duplicarCotacao}
              onRepetir={handleRepetir}
              onToggleFavorito={toggleFavorito}
            />
          </>
        )}

        {telaAtiva === 'comparador' && (
          <Comparador cotacoesPorProduto={cotacoesPorProduto} />
        )}

        {telaAtiva === 'relatorio' && (
          <Relatorio estatisticas={estatisticas} />
        )}
      </main>

      {telaAtiva === 'lista' && (
        <button className="fab" onClick={handleNovaCotacao}>
          <Plus size={24} />
        </button>
      )}

      <FormCotacao
        isOpen={modalAberto}
        cotacaoEditando={cotacaoEditando}
        cotacaoRepetindo={cotacaoRepetindo}
        categorias={categorias}
        fornecedores={fornecedores}
        produtosUnicos={produtosUnicos}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
      />
    </div>
  )
}

export default App
