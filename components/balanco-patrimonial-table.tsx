"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
import type { SyntheticAccount } from "@/types/balanco-patrimonial"

interface BalancoPatrimonialTableProps {
  data?: SyntheticAccount[]
  onExport?: (format: "pdf" | "excel") => void
}

export function BalancoPatrimonialTable({ data = [], onExport }: BalancoPatrimonialTableProps) {
  const [filtros, setFiltros] = useState({
    busca: "",
    categoria: "all", // Updated default value to "all"
    variacao: "all", // Updated default value to "all"
  })

  const dadosFiltrados = data.filter((item) => {
    const matchBusca =
      !filtros.busca ||
      item.code.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      item.name.toLowerCase().includes(filtros.busca.toLowerCase())

    const matchCategoria = !filtros.categoria || item.category === filtros.categoria

    const variacao = item.currentValue - item.previousValue
    const matchVariacao =
      !filtros.variacao ||
      (filtros.variacao === "positiva" && variacao > 0) ||
      (filtros.variacao === "negativa" && variacao < 0) ||
      (filtros.variacao === "neutra" && variacao === 0)

    return matchBusca && matchCategoria && matchVariacao
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor >= 0 ? "+" : ""}${valor.toFixed(2)}%`
  }

  const calcularVariacao = (atual: number, anterior: number) => {
    return atual - anterior
  }

  const calcularVariacaoPercentual = (atual: number, anterior: number) => {
    if (anterior === 0) return 0
    return ((atual - anterior) / anterior) * 100
  }

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return "text-green-600"
    if (variacao < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getCategoriaColor = (categoria: string) => {
    const cores = {
      ativo_circulante: "bg-blue-100 text-blue-800",
      ativo_nao_circulante: "bg-green-100 text-green-800",
      passivo_circulante: "bg-orange-100 text-orange-800",
      passivo_nao_circulante: "bg-red-100 text-red-800",
      patrimonio_liquido: "bg-purple-100 text-purple-800",
    }
    return cores[categoria as keyof typeof cores] || "bg-gray-100 text-gray-800"
  }

  const getNomeCategoria = (categoria: string) => {
    const nomes = {
      ativo_circulante: "Ativo Circulante",
      ativo_nao_circulante: "Ativo Não Circulante",
      passivo_circulante: "Passivo Circulante",
      passivo_nao_circulante: "Passivo Não Circulante",
      patrimonio_liquido: "Patrimônio Líquido",
    }
    return nomes[categoria as keyof typeof nomes] || categoria
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            className="pl-8"
          />
        </div>

        <Select value={filtros.categoria} onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem> {/* Updated value prop */}
            <SelectItem value="ativo_circulante">Ativo Circulante</SelectItem>
            <SelectItem value="ativo_nao_circulante">Ativo Não Circulante</SelectItem>
            <SelectItem value="passivo_circulante">Passivo Circulante</SelectItem>
            <SelectItem value="passivo_nao_circulante">Passivo Não Circulante</SelectItem>
            <SelectItem value="patrimonio_liquido">Patrimônio Líquido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtros.variacao} onValueChange={(value) => setFiltros({ ...filtros, variacao: value })}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Variação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem> {/* Updated value prop */}
            <SelectItem value="positiva">Positiva</SelectItem>
            <SelectItem value="negativa">Negativa</SelectItem>
            <SelectItem value="neutra">Neutra</SelectItem>
          </SelectContent>
        </Select>

        {onExport && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
              Excel
            </Button>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor Anterior</TableHead>
              <TableHead className="text-right">Valor Atual</TableHead>
              <TableHead className="text-right">Variação</TableHead>
              <TableHead className="text-right">Variação %</TableHead>
              <TableHead>Categoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              dadosFiltrados.map((item) => {
                const variacao = calcularVariacao(item.currentValue, item.previousValue)
                const variacaoPercentual = calcularVariacaoPercentual(item.currentValue, item.previousValue)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(item.previousValue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatarMoeda(item.currentValue)}</TableCell>
                    <TableCell className={`text-right ${getVariacaoColor(variacao)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getVariacaoIcon(variacao)}
                        {formatarMoeda(Math.abs(variacao))}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right ${getVariacaoColor(variacao)}`}>
                      {formatarPercentual(variacaoPercentual)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoriaColor(item.category)}>{getNomeCategoria(item.category)}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumo */}
      {dadosFiltrados.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {dadosFiltrados.length} de {data.length} contas
        </div>
      )}
    </div>
  )
}
