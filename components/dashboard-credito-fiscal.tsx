"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreditoCalculado } from "@/types/credito"
import { useMemo } from "react"

interface DashboardCreditoFiscalProps {
  calculos: CreditoCalculado[]
}

export function DashboardCreditoFiscal({ calculos }: DashboardCreditoFiscalProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const { totalIPI, totalICMS, totalPIS, totalCOFINS, totalGeral } = useMemo(() => {
    let totalIPI = 0
    let totalICMS = 0
    let totalPIS = 0
    let totalCOFINS = 0
    let totalGeral = 0

    calculos.forEach((calc) => {
      totalIPI += calc.resultado.ipi
      totalICMS += calc.resultado.icms
      totalPIS += calc.resultado.pis
      totalCOFINS += calc.resultado.cofins
      totalGeral += calc.resultado.total
    })

    return { totalIPI, totalICMS, totalPIS, totalCOFINS, totalGeral }
  }, [calculos])

  const chartData = [
    { name: "IPI", total: totalIPI },
    { name: "ICMS", total: totalICMS },
    { name: "PIS", total: totalPIS },
    { name: "COFINS", total: totalCOFINS },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Créditos IPI</CardTitle>
          <span className="text-muted-foreground">R$</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarMoeda(totalIPI)}</div>
          <p className="text-xs text-muted-foreground">Acumulado de todos os cálculos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Créditos ICMS</CardTitle>
          <span className="text-muted-foreground">R$</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarMoeda(totalICMS)}</div>
          <p className="text-xs text-muted-foreground">Acumulado de todos os cálculos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Créditos PIS</CardTitle>
          <span className="text-muted-foreground">R$</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarMoeda(totalPIS)}</div>
          <p className="text-xs text-muted-foreground">Acumulado de todos os cálculos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Créditos COFINS</CardTitle>
          <span className="text-muted-foreground">R$</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatarMoeda(totalCOFINS)}</div>
          <p className="text-xs text-muted-foreground">Acumulado de todos os cálculos</p>
        </CardContent>
      </Card>
    </div>
  )
}
