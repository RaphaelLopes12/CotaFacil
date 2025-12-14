import { useState, useEffect } from 'react'
import { X, Save, Plus, CalendarClock } from 'lucide-react'
import { Autocomplete } from './Autocomplete'
import type { Cotacao, CotacaoInput } from '../types/index'

interface FormCotacaoProps {
  cotacaoEditando?: Cotacao | null
  cotacaoRepetindo?: Cotacao | null
  categorias: string[]
  fornecedores: string[]
  produtosUnicos: string[]
  onSalvar: (cotacao: CotacaoInput) => void
  onCancelar: () => void
  isOpen: boolean
}

const CATEGORIAS_PADRAO = [
  'Bebidas',
  'Carnes',
  'Frios',
  'Higiene',
  'Hortifruti',
  'Laticínios',
  'Limpeza',
  'Mercearia',
  'Padaria',
  'Outros'
]

export function FormCotacao({
  cotacaoEditando,
  cotacaoRepetindo,
  categorias,
  fornecedores,
  produtosUnicos,
  onSalvar,
  onCancelar,
  isOpen
}: FormCotacaoProps) {
  const [produto, setProduto] = useState('')
  const [marca, setMarca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [valor, setValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [validadeAte, setValidadeAte] = useState('')

  const todasCategorias = [...new Set([...CATEGORIAS_PADRAO, ...categorias])].sort()

  // Lista de produtos únicos formatados (capitaliza primeira letra)
  const produtosFormatados = [...new Set(produtosUnicos.map(p =>
    p.charAt(0).toUpperCase() + p.slice(1)
  ))]

  useEffect(() => {
    // Cotação para preencher o form (editando ou repetindo)
    const cotacao = cotacaoEditando || cotacaoRepetindo

    if (cotacao) {
      setProduto(cotacao.produto)
      setMarca(cotacao.marca)
      setCategoria(cotacao.categoria)
      setFornecedor(cotacao.fornecedor)
      // Se estiver repetindo, limpa o valor para digitar novo preço
      setValor(cotacaoRepetindo ? '' : cotacao.valor.toString().replace('.', ','))
      setObservacoes(cotacao.observacoes)
      // Se estiver repetindo, limpa a validade para definir nova
      setValidadeAte(cotacaoRepetindo ? '' : (cotacao.validadeAte ? cotacao.validadeAte.split('T')[0] : ''))
    } else {
      limparFormulario()
    }
  }, [cotacaoEditando, cotacaoRepetindo, isOpen])

  const limparFormulario = () => {
    setProduto('')
    setMarca('')
    setCategoria('')
    setFornecedor('')
    setValor('')
    setObservacoes('')
    setValidadeAte('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!produto.trim() || !valor.trim()) {
      return
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNumerico)) {
      return
    }

    onSalvar({
      produto: produto.trim(),
      marca: marca.trim(),
      categoria: categoria.trim(),
      fornecedor: fornecedor.trim(),
      valor: valorNumerico,
      observacoes: observacoes.trim(),
      validadeAte: validadeAte ? new Date(validadeAte + 'T23:59:59').toISOString() : undefined,
      favorito: cotacaoEditando?.favorito
    })

    limparFormulario()
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    v = v.replace(/[^\d,]/g, '')
    const partes = v.split(',')
    if (partes.length > 2) {
      v = partes[0] + ',' + partes.slice(1).join('')
    }
    if (partes[1]?.length > 2) {
      v = partes[0] + ',' + partes[1].slice(0, 2)
    }
    setValor(v)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{cotacaoEditando ? 'Editar Cotação' : cotacaoRepetindo ? 'Cotar Novamente' : 'Nova Cotação'}</h2>
          <button className="btn-icon" onClick={onCancelar}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="produto">Produto *</label>
            <Autocomplete
              id="produto"
              value={produto}
              onChange={setProduto}
              sugestoes={produtosFormatados}
              placeholder="Ex: Arroz 5kg"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marca">Marca</label>
              <input
                id="marca"
                type="text"
                value={marca}
                onChange={e => setMarca(e.target.value)}
                placeholder="Ex: Tio João"
              />
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor *</label>
              <div className="input-prefix">
                <span>R$</span>
                <input
                  id="valor"
                  type="text"
                  inputMode="decimal"
                  value={valor}
                  onChange={handleValorChange}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                <option value="">Selecione...</option>
                {todasCategorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fornecedor">Fornecedor</label>
              <Autocomplete
                id="fornecedor"
                value={fornecedor}
                onChange={setFornecedor}
                sugestoes={fornecedores}
                placeholder="Ex: Atacadão"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="validadeAte">
              <CalendarClock size={14} style={{ display: 'inline', marginRight: 4 }} />
              Válido até
            </label>
            <input
              id="validadeAte"
              type="date"
              value={validadeAte}
              onChange={e => setValidadeAte(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Anotações adicionais..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {cotacaoEditando ? (
                <>
                  <Save size={18} />
                  Salvar
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Adicionar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
