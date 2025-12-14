import { useState } from 'react'
import { Pencil, Trash2, MoreVertical, Tag, Store, Calendar, Copy, Star, AlertTriangle, RefreshCw, Share2 } from 'lucide-react'
import type { Cotacao } from '../types/index'
import { formatarMoeda, formatarDataCurta } from '../utils/formatters'

interface CartaoCotacaoProps {
  cotacao: Cotacao
  onEditar: () => void
  onExcluir: () => void
  onDuplicar: () => void
  onRepetir: () => void
  onToggleFavorito: () => void
}

export function CartaoCotacao({ cotacao, onEditar, onExcluir, onDuplicar, onRepetir, onToggleFavorito }: CartaoCotacaoProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [compartilhado, setCompartilhado] = useState(false)

  const handleExcluir = () => {
    if (confirmandoExclusao) {
      onExcluir()
      setConfirmandoExclusao(false)
      setMenuAberto(false)
    } else {
      setConfirmandoExclusao(true)
    }
  }

  const handleCompartilhar = () => {
    const texto = gerarTextoCompartilhamento(cotacao)

    // Tenta usar Web Share API primeiro (melhor em mobile)
    if (navigator.share) {
      navigator.share({
        title: `Cotação: ${cotacao.produto}`,
        text: texto
      }).catch(() => {
        // Se falhar, abre WhatsApp
        abrirWhatsApp(texto)
      })
    } else {
      abrirWhatsApp(texto)
    }

    setCompartilhado(true)
    setTimeout(() => setCompartilhado(false), 2000)
    setMenuAberto(false)
  }

  const abrirWhatsApp = (texto: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  const gerarTextoCompartilhamento = (c: Cotacao) => {
    let texto = `📦 *${c.produto}*`
    if (c.marca) texto += ` - ${c.marca}`
    texto += `\n💰 *${formatarMoeda(c.valor)}*`
    if (c.fornecedor) texto += `\n🏪 ${c.fornecedor}`
    if (c.categoria) texto += `\n🏷️ ${c.categoria}`
    if (c.validadeAte) {
      const validade = new Date(c.validadeAte)
      const hoje = new Date()
      if (validade >= hoje) {
        texto += `\n📅 Válido até ${formatarDataCurta(c.validadeAte)}`
      }
    }
    if (c.observacoes) texto += `\n📝 ${c.observacoes}`
    texto += `\n\n_Enviado via CotaFácil_`
    return texto
  }

  const isExpirado = cotacao.validadeAte && new Date(cotacao.validadeAte) < new Date()
  const isExpirando = cotacao.validadeAte && !isExpirado &&
    new Date(cotacao.validadeAte) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias

  return (
    <div className={`cartao ${cotacao.favorito ? 'cartao-favorito' : ''} ${isExpirado ? 'cartao-expirado' : ''}`}>
      <button
        className={`btn-favorito ${cotacao.favorito ? 'ativo' : ''}`}
        onClick={onToggleFavorito}
        title={cotacao.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Star size={18} fill={cotacao.favorito ? 'currentColor' : 'none'} />
      </button>

      <div className="cartao-header">
        <div className="cartao-info">
          <h3 className="cartao-produto">{cotacao.produto}</h3>
          {cotacao.marca && (
            <span className="cartao-marca">{cotacao.marca}</span>
          )}
        </div>
        <div className="cartao-valor">
          {formatarMoeda(cotacao.valor)}
        </div>
      </div>

      <div className="cartao-detalhes">
        {cotacao.categoria && (
          <span className="cartao-tag">
            <Tag size={14} />
            {cotacao.categoria}
          </span>
        )}
        {cotacao.fornecedor && (
          <span className="cartao-tag">
            <Store size={14} />
            {cotacao.fornecedor}
          </span>
        )}
        <span className="cartao-tag cartao-data">
          <Calendar size={14} />
          {formatarDataCurta(cotacao.criadoEm)}
        </span>
      </div>

      {cotacao.validadeAte && (
        <div className={`cartao-validade ${isExpirado ? 'expirado' : ''} ${isExpirando ? 'expirando' : ''}`}>
          <AlertTriangle size={14} />
          {isExpirado ? 'Expirado' : `Válido até ${formatarDataCurta(cotacao.validadeAte)}`}
        </div>
      )}

      {cotacao.observacoes && (
        <p className="cartao-observacoes">{cotacao.observacoes}</p>
      )}

      <div className="cartao-acoes">
        <button
          className={`btn-compartilhar ${compartilhado ? 'compartilhado' : ''}`}
          onClick={handleCompartilhar}
          title="Compartilhar"
        >
          <Share2 size={16} />
        </button>
        <button
          className="btn-icon-sm"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <MoreVertical size={18} />
        </button>

        {menuAberto && (
          <>
            <div
              className="menu-overlay"
              onClick={() => {
                setMenuAberto(false)
                setConfirmandoExclusao(false)
              }}
            />
            <div className="menu-dropdown">
              <button onClick={() => { onRepetir(); setMenuAberto(false) }}>
                <RefreshCw size={16} />
                Cotar novamente
              </button>
              <button onClick={() => { onEditar(); setMenuAberto(false) }}>
                <Pencil size={16} />
                Editar
              </button>
              <button onClick={() => { onDuplicar(); setMenuAberto(false) }}>
                <Copy size={16} />
                Duplicar
              </button>
              <button
                className={confirmandoExclusao ? 'confirmar-exclusao' : 'excluir'}
                onClick={handleExcluir}
              >
                <Trash2 size={16} />
                {confirmandoExclusao ? 'Confirmar?' : 'Excluir'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
