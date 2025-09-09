"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, DollarSign, Scale } from "lucide-react"
import type { DepreciacaoCalculada } from "@/types/depreciacao"

interface DashboardDepreciacaoProps {
  depreciacoesSalvas: DepreciacaoCalculada[]
}

export function DashboardDepreciacao({ depreciacoesSalvas }: DashboardDepreciacaoProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const totalDepreciacaoAcumulada = depreciacoesSalvas.reduce((acc, calc) => acc + calc.totalDepreciacao, 0)
  const totalValorContabilAtual = depreciacoesSalvas.reduce((acc, calc) => acc + calc.valorContabilAtual, 0)
  const totalBaseCalculoDepreciavel = depreciacoesSalvas.reduce((acc, calc) => acc + calc.baseCalculoDepreciavel, 0)

  // Dados para o gráfico de distribuição por método de depreciação
  const depreciacaoPorMetodo = depreciacoesSalvas.reduce(
    (acc, calc) => {
      const metodo = calc.parametros.metodoDepreciacao
      acc[metodo] = (acc[metodo] || 0) + calc.totalDepreciacao
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.keys(depreciacaoPorMetodo).map((metodo) => ({
    metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1), // Capitaliza a primeira letra
    depreciacao: depreciacaoPorMetodo[metodo],
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Geral da Depreciação</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depreciação Acumulada</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalDepreciacaoAcumulada)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as depreciações salvas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Contábil Atual Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalValorContabilAtual)}</div>
            <p className="text-xs text-muted-foreground">Soma dos valores contábeis atuais dos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Cálculo Depreciável Total</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalBaseCalculoDepreciavel)}</div>
            <p className="text-xs text-muted-foreground">Soma das bases depreciáveis dos ativos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
