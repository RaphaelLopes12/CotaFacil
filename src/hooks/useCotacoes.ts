import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import type { Cotacao, CotacaoInput, Filtros } from '../types/index'

const LOCAL_STORAGE_KEY = 'cotafacil_cotacoes'

function fromDB(row: Record<string, unknown>): Cotacao {
  return {
    id: row.id as string,
    produto: row.produto as string,
    marca: (row.marca as string) || '',
    categoria: (row.categoria as string) || '',
    fornecedor: (row.fornecedor as string) || '',
    valor: Number(row.valor),
    observacoes: (row.observacoes as string) || '',
    favorito: row.favorito as boolean,
    validadeAte: row.validade_ate as string | undefined,
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string
  }
}

function toDB(cotacao: Cotacao) {
  return {
    id: cotacao.id,
    produto: cotacao.produto,
    marca: cotacao.marca || null,
    categoria: cotacao.categoria || null,
    fornecedor: cotacao.fornecedor || null,
    valor: cotacao.valor,
    observacoes: cotacao.observacoes || null,
    favorito: cotacao.favorito || false,
    validade_ate: cotacao.validadeAte || null,
    criado_em: cotacao.criadoEm,
    atualizado_em: cotacao.atualizadoEm
  }
}

function saveToLocalStorage(cotacoes: Cotacao[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cotacoes))
}

function loadFromLocalStorage(): Cotacao[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function useCotacoes() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [online, setOnline] = useState(navigator.onLine)
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    categoria: '',
    fornecedor: '',
    ordenacao: 'recente',
    apenasValidos: false,
    apenasFavoritos: false
  })

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const carregarCotacoes = useCallback(async () => {
    setCarregando(true)
    try {
      const { data, error } = await supabase
        .from('cotacoes')
        .select('*')
        .order('criado_em', { ascending: false })

      if (error) throw error

      const cotacoesCarregadas = data.map(fromDB)
      setCotacoes(cotacoesCarregadas)
      saveToLocalStorage(cotacoesCarregadas)
    } catch (error) {
      console.error('Erro ao carregar do Supabase, usando localStorage:', error)
      setCotacoes(loadFromLocalStorage())
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarCotacoes()
  }, [carregarCotacoes])

  useEffect(() => {
    if (online) {
      carregarCotacoes()
    }
  }, [online, carregarCotacoes])

  const adicionarCotacao = useCallback(async (input: CotacaoInput) => {
    const agora = new Date().toISOString()
    const novaCotacao: Cotacao = {
      ...input,
      id: uuidv4(),
      criadoEm: agora,
      atualizadoEm: agora
    }

    setCotacoes(prev => {
      const novaLista = [novaCotacao, ...prev]
      saveToLocalStorage(novaLista)
      return novaLista
    })

    try {
      const { error } = await supabase
        .from('cotacoes')
        .insert(toDB(novaCotacao))

      if (error) throw error
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error)
    }
  }, [])

  const editarCotacao = useCallback(async (id: string, input: CotacaoInput) => {
    const atualizadoEm = new Date().toISOString()

    setCotacoes(prev => {
      const novaLista = prev.map(c =>
        c.id === id
          ? { ...c, ...input, atualizadoEm }
          : c
      )
      saveToLocalStorage(novaLista)
      return novaLista
    })

    try {
      const { error } = await supabase
        .from('cotacoes')
        .update({
          produto: input.produto,
          marca: input.marca || null,
          categoria: input.categoria || null,
          fornecedor: input.fornecedor || null,
          valor: input.valor,
          observacoes: input.observacoes || null,
          favorito: input.favorito || false,
          validade_ate: input.validadeAte || null,
          atualizado_em: atualizadoEm
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar no Supabase:', error)
    }
  }, [])

  const excluirCotacao = useCallback(async (id: string) => {
    setCotacoes(prev => {
      const novaLista = prev.filter(c => c.id !== id)
      saveToLocalStorage(novaLista)
      return novaLista
    })

    try {
      const { error } = await supabase
        .from('cotacoes')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao excluir do Supabase:', error)
    }
  }, [])

  const duplicarCotacao = useCallback(async (cotacao: Cotacao) => {
    const agora = new Date().toISOString()
    const novaCotacao: Cotacao = {
      ...cotacao,
      id: uuidv4(),
      criadoEm: agora,
      atualizadoEm: agora,
      favorito: false
    }

    setCotacoes(prev => {
      const novaLista = [novaCotacao, ...prev]
      saveToLocalStorage(novaLista)
      return novaLista
    })

    try {
      const { error } = await supabase
        .from('cotacoes')
        .insert(toDB(novaCotacao))

      if (error) throw error
    } catch (error) {
      console.error('Erro ao duplicar no Supabase:', error)
    }
  }, [])

  const toggleFavorito = useCallback(async (id: string) => {
    const atualizadoEm = new Date().toISOString()
    let novoFavorito = false

    setCotacoes(prev => {
      const novaLista = prev.map(c => {
        if (c.id === id) {
          novoFavorito = !c.favorito
          return { ...c, favorito: novoFavorito, atualizadoEm }
        }
        return c
      })
      saveToLocalStorage(novaLista)
      return novaLista
    })

    try {
      const { error } = await supabase
        .from('cotacoes')
        .update({
          favorito: novoFavorito,
          atualizado_em: atualizadoEm
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar favorito no Supabase:', error)
    }
  }, [])

  const cotacoesFiltradas = useMemo(() => {
    const agora = new Date()

    return cotacoes
      .filter(c => {
        const termoBusca = filtros.busca.toLowerCase()
        const matchBusca =
          !termoBusca ||
          c.produto.toLowerCase().includes(termoBusca) ||
          c.marca.toLowerCase().includes(termoBusca) ||
          c.fornecedor.toLowerCase().includes(termoBusca)

        const matchCategoria =
          !filtros.categoria || c.categoria === filtros.categoria

        const matchFornecedor =
          !filtros.fornecedor || c.fornecedor === filtros.fornecedor

        const matchFavoritos =
          !filtros.apenasFavoritos || c.favorito

        const matchValidos =
          !filtros.apenasValidos ||
          !c.validadeAte ||
          new Date(c.validadeAte) >= agora

        return matchBusca && matchCategoria && matchFornecedor && matchFavoritos && matchValidos
      })
      .sort((a, b) => {
        if (a.favorito && !b.favorito) return -1
        if (!a.favorito && b.favorito) return 1

        switch (filtros.ordenacao) {
          case 'recente':
            return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
          case 'antigo':
            return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
          case 'menor-preco':
            return a.valor - b.valor
          case 'maior-preco':
            return b.valor - a.valor
          case 'nome':
            return a.produto.localeCompare(b.produto)
          default:
            return 0
        }
      })
  }, [cotacoes, filtros])

  const categorias = useMemo(() =>
    [...new Set(cotacoes.map(c => c.categoria).filter(Boolean))],
    [cotacoes]
  )

  const fornecedores = useMemo(() =>
    [...new Set(cotacoes.map(c => c.fornecedor).filter(Boolean))],
    [cotacoes]
  )

  const produtosUnicos = useMemo(() =>
    [...new Set(cotacoes.map(c => c.produto.toLowerCase()))],
    [cotacoes]
  )

  const cotacoesPorProduto = useMemo(() => {
    const grupos: Record<string, Cotacao[]> = {}
    cotacoes.forEach(c => {
      const key = c.produto.toLowerCase()
      if (!grupos[key]) grupos[key] = []
      grupos[key].push(c)
    })
    Object.values(grupos).forEach(grupo => {
      grupo.sort((a, b) => a.valor - b.valor)
    })
    return grupos
  }, [cotacoes])

  const estatisticas = useMemo(() => {
    if (cotacoes.length === 0) return null

    const totalGasto = cotacoes.reduce((acc, c) => acc + c.valor, 0)
    const mediaPreco = totalGasto / cotacoes.length

    const porCategoria: Record<string, { total: number; count: number }> = {}
    const porFornecedor: Record<string, { total: number; count: number }> = {}

    cotacoes.forEach(c => {
      if (c.categoria) {
        if (!porCategoria[c.categoria]) porCategoria[c.categoria] = { total: 0, count: 0 }
        porCategoria[c.categoria].total += c.valor
        porCategoria[c.categoria].count++
      }
      if (c.fornecedor) {
        if (!porFornecedor[c.fornecedor]) porFornecedor[c.fornecedor] = { total: 0, count: 0 }
        porFornecedor[c.fornecedor].total += c.valor
        porFornecedor[c.fornecedor].count++
      }
    })

    return {
      totalCotacoes: cotacoes.length,
      totalGasto,
      mediaPreco,
      porCategoria,
      porFornecedor,
      favoritos: cotacoes.filter(c => c.favorito).length
    }
  }, [cotacoes])

  return {
    cotacoes: cotacoesFiltradas,
    todasCotacoes: cotacoes,
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
    toggleFavorito,
    carregando,
    online,
    recarregar: carregarCotacoes
  }
}
