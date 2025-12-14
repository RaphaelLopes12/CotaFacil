import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, ShoppingCart, Star, Tag } from 'lucide-react'
import { formatarMoeda } from '../utils/formatters'

interface Estatisticas {
  totalCotacoes: number
  totalGasto: number
  mediaPreco: number
  porCategoria: Record<string, { total: number; count: number }>
  porFornecedor: Record<string, { total: number; count: number }>
  favoritos: number
}

interface RelatorioProps {
  estatisticas: Estatisticas | null
}

const CORES = ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9']

export function Relatorio({ estatisticas }: RelatorioProps) {
  if (!estatisticas) {
    return (
      <div className="relatorio-vazio">
        <TrendingUp size={48} />
        <h3>Nenhum dado disponível</h3>
        <p>Adicione cotações para ver o relatório</p>
      </div>
    )
  }

  const dadosCategoria = Object.entries(estatisticas.porCategoria)
    .map(([nome, dados]) => ({
      nome,
      total: dados.total,
      count: dados.count,
      media: dados.total / dados.count
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const dadosFornecedor = Object.entries(estatisticas.porFornecedor)
    .map(([nome, dados]) => ({
      nome: nome.length > 12 ? nome.slice(0, 12) + '...' : nome,
      nomeCompleto: nome,
      total: dados.total,
      count: dados.count,
      media: dados.total / dados.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="relatorio">
      <div className="relatorio-header">
        <h2>Relatório</h2>
      </div>

      <div className="relatorio-cards">
        <div className="relatorio-card">
          <ShoppingCart size={24} />
          <div className="relatorio-card-info">
            <span className="relatorio-card-valor">{estatisticas.totalCotacoes}</span>
            <span className="relatorio-card-label">Cotações</span>
          </div>
        </div>

        <div className="relatorio-card">
          <TrendingUp size={24} />
          <div className="relatorio-card-info">
            <span className="relatorio-card-valor">{formatarMoeda(estatisticas.mediaPreco)}</span>
            <span className="relatorio-card-label">Preço médio</span>
          </div>
        </div>

        <div className="relatorio-card">
          <Star size={24} />
          <div className="relatorio-card-info">
            <span className="relatorio-card-valor">{estatisticas.favoritos}</span>
            <span className="relatorio-card-label">Favoritos</span>
          </div>
        </div>

        <div className="relatorio-card">
          <Tag size={24} />
          <div className="relatorio-card-info">
            <span className="relatorio-card-valor">{Object.keys(estatisticas.porCategoria).length}</span>
            <span className="relatorio-card-label">Categorias</span>
          </div>
        </div>
      </div>

      {dadosCategoria.length > 0 && (
        <div className="relatorio-secao">
          <h3>Por Categoria</h3>
          <div className="relatorio-grafico">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosCategoria}
                  dataKey="count"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dadosCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value} cotações - ${formatarMoeda(props?.payload?.total || 0)}`,
                    props?.payload?.nome || ''
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {dadosFornecedor.length > 0 && (
        <div className="relatorio-secao">
          <h3>Por Fornecedor</h3>
          <div className="relatorio-grafico">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosFornecedor} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nome" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, _, props) => [
                    `${value} cotações`,
                    props.payload.nomeCompleto
                  ]}
                />
                <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="relatorio-secao">
        <h3>Resumo por Categoria</h3>
        <div className="relatorio-tabela">
          {dadosCategoria.map(cat => (
            <div key={cat.nome} className="relatorio-tabela-linha">
              <span className="relatorio-tabela-nome">{cat.nome}</span>
              <span className="relatorio-tabela-count">{cat.count} itens</span>
              <span className="relatorio-tabela-valor">{formatarMoeda(cat.media)} média</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
