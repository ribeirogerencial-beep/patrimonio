"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, CreditCard, Wrench, Package, Plus } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import type { Parametros } from "@/types/parametros"
import { useParametros } from "@/hooks/use-parametros"

// Componente do gráfico de pizza
function PieChart({
  data,
  title,
}: {
  data: Array<{ name: string; value: number; color: string; percentage: number }>
  title: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const createPath = (percentage: number, cumulativePercentage: number) => {
    if (percentage === 0) return ""

    const startAngle = (cumulativePercentage * 360) / 100
    const endAngle = ((cumulativePercentage + percentage) * 360) / 100

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const largeArcFlag = percentage > 50 ? 1 : 0

    const x1 = 50 + 40 * Math.cos(startAngleRad)
    const y1 = 50 + 40 * Math.sin(startAngleRad)
    const x2 = 50 + 40 * Math.cos(endAngleRad)
    const y2 = 50 + 40 * Math.sin(endAngleRad)

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const path = createPath(item.percentage, cumulativePercentage)
              cumulativePercentage += item.percentage
              return path ? <path key={index} d={path} fill={item.color} stroke="white" strokeWidth="0.5" /> : null
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-500 ml-auto">
                {item.value} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente do gráfico de barras
function BarChart({ data }: { data: Array<{ month: string; value: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  if (maxValue === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum valor registrado</p>
      </div>
    )
  }

  return (
    <div className="h-64 flex items-end justify-between gap-2 px-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-2">
          <div
            className="bg-blue-500 rounded-t-sm min-w-[40px] transition-all duration-300"
            style={{
              height: `${Math.max((item.value / maxValue) * 200, 2)}px`,
              backgroundColor: item.value > 0 ? "#3b82f6" : "#93c5fd",
            }}
          />
          <span className="text-xs text-gray-500 rotate-45 origin-left">{item.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const { 
    categorias, 
    setores, 
    localizacoes, 
    loading: parametrosLoading, 
    error: parametrosError 
  } = useParametros()
  const [manutencoes, setManutencoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = () => {
      try {
        // Carregar ativos
        const ativosData = localStorage.getItem("ativos-imobilizados")
        let ativosArray: Ativo[] = []
        if (ativosData) {
          ativosArray = JSON.parse(ativosData)
          setAtivos(ativosArray)
        }

        // Parâmetros agora são carregados pelo hook useParametros

        // Carregar todas as manutenções de todos os ativos
        const todasManutencoes: any[] = []
        ativosArray.forEach((ativo: Ativo) => {
          const manutencoesAtivo = localStorage.getItem(`manutencoes-${ativo.id}`)
          if (manutencoesAtivo) {
            try {
              const manutencoesParseadas = JSON.parse(manutencoesAtivo)
              if (Array.isArray(manutencoesParseadas)) {
                todasManutencoes.push(...manutencoesParseadas)
              }
            } catch (error) {
              console.error(`Erro ao carregar manutenções do ativo ${ativo.id}:`, error)
            }
          }
        })
        setManutencoes(todasManutencoes)

        setLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Cálculos dos KPIs com base nos dados reais
  const valorTotal = ativos.reduce((sum, ativo) => {
    const valor = Number(ativo.valorTotal) || 0
    return sum + valor
  }, 0)

  const totalCreditos = ativos.reduce((sum, ativo) => {
    const icms = Number(ativo.valorICMS) || 0
    const ipi = Number(ativo.valorIPI) || 0
    const pis = Number(ativo.valorPIS) || 0
    const cofins = Number(ativo.valorCOFINS) || 0
    return sum + icms + ipi + pis + cofins
  }, 0)

  const totalManutencao = manutencoes.reduce((sum, manutencao) => {
    if (manutencao.status === "concluida") {
      const custo = Number(manutencao.custoReal) || Number(manutencao.custo) || 0
      return sum + custo
    }
    return sum
  }, 0)

  const totalAtivos = ativos.length

  // Distribuição por setor destino com dados reais
  const setoresComAtivos = new Map<string, number>()
  ativos.forEach((ativo) => {
    if (ativo.setorDestino) {
      const count = setoresComAtivos.get(ativo.setorDestino) || 0
      setoresComAtivos.set(ativo.setorDestino, count + 1)
    }
  })

  const distribuicaoSetor = Array.from(setoresComAtivos.entries()).map(([setor, quantidade], index) => {
    const cores = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"]
    return {
      name: setor,
      value: quantidade,
      percentage: totalAtivos > 0 ? (quantidade / totalAtivos) * 100 : 0,
      color: cores[index % cores.length],
    }
  })

  // Distribuição por categoria com dados reais
  const categoriasComAtivos = new Map<string, number>()
  ativos.forEach((ativo) => {
    if (ativo.categoria) {
      const count = categoriasComAtivos.get(ativo.categoria) || 0
      categoriasComAtivos.set(ativo.categoria, count + 1)
    }
  })

  const distribuicaoCategoria = Array.from(categoriasComAtivos.entries()).map(([categoria, quantidade], index) => {
    const cores = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"]
    return {
      name: categoria,
      value: quantidade,
      percentage: totalAtivos > 0 ? (quantidade / totalAtivos) * 100 : 0,
      color: cores[index % cores.length],
    }
  })

  // Dados do gráfico de barras baseado em aquisições por mês
  const aquisicoesPorMes = new Map<string, number>()
  ativos.forEach((ativo) => {
    if (ativo.dataAquisicao) {
      try {
        const data = new Date(ativo.dataAquisicao)
        const mesAno = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`
        const valor = aquisicoesPorMes.get(mesAno) || 0
        aquisicoesPorMes.set(mesAno, valor + (Number(ativo.valorTotal) || 0))
      } catch (error) {
        console.error("Erro ao processar data de aquisição:", error)
      }
    }
  })

  const dadosBarras = Array.from(aquisicoesPorMes.entries())
    .sort(([a], [b]) => {
      const [mesA, anoA] = a.split("/").map(Number)
      const [mesB, anoB] = b.split("/").map(Number)
      return anoA - anoB || mesA - mesB
    })
    .slice(-6) // Últimos 6 meses
    .map(([mesAno, valor]) => ({
      month: mesAno,
      value: valor,
    }))

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus ativos imobilizados</p>
        </div>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Ativo
          </Button>
        </Link>
      </div>

      {/* KPI Cards - Reorganizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1º - Valor Total */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2º - Total Créditos */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Créditos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCreditos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3º - Total Manutenção */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Manutenção</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalManutencao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4º - Total Ativos (Quantidade) */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{totalAtivos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid - Gráficos de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Pizza - Setor Destino */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <PieChart data={distribuicaoSetor} title="Setor Destino" />
          </CardContent>
        </Card>

        {/* Gráfico Pizza - Distribuição por Categoria */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <PieChart data={distribuicaoCategoria} title="Distribuição por Categoria" />
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Valor por Mês */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Valor por Mês (Aquisições)</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={dadosBarras} />
        </CardContent>
      </Card>

      {/* Debug Info - Remover em produção */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-700">
            <p>Ativos carregados: {ativos.length}</p>
            <p>Manutenções carregadas: {manutencoes.length}</p>
            <p>Setores únicos: {setoresComAtivos.size}</p>
            <p>Categorias únicas: {categoriasComAtivos.size}</p>
            <p>Valor total calculado: {valorTotal}</p>
            <p>Total créditos calculado: {totalCreditos}</p>
            <p>Total manutenção calculado: {totalManutencao}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
