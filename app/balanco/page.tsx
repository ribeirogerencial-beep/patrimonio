"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  FileText,
  DollarSign,
  Building2,
  Filter,
  Search,
  Plus,
} from "lucide-react"
import type { Ativo } from "@/types/ativo"

interface ItemBalanco {
  id: string
  codigo: string
  descricao: string
  categoria:
    | "ativo_circulante"
    | "ativo_nao_circulante"
    | "passivo_circulante"
    | "passivo_nao_circulante"
    | "patrimonio_liquido"
  valorAnterior: number
  valorAtual: number
  variacao: number
  variacaoPercentual: number
}

interface ResumoCategoria {
  categoria: string
  nome: string
  valorAnterior: number
  valorAtual: number
  variacao: number
  variacaoPercentual: number
  icon: any
  color: string
}

export default function BalancoPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [dadosBalanco, setDadosBalanco] = useState<ItemBalanco[]>([])
  const [filtros, setFiltros] = useState({
    categoria: "all",
    variacao: "all",
    busca: "",
    dataInicio: "",
    dataFim: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const carregarDados = () => {
      try {
        // Carregar ativos do localStorage
        const ativosData = localStorage.getItem("ativos-imobilizados")
        if (ativosData) {
          const ativosCarregados = JSON.parse(ativosData)
          setAtivos(ativosCarregados)

          // Gerar dados do balanço baseados nos ativos reais
          const dadosGerados = gerarDadosBalancoDeAtivos(ativosCarregados)
          setDadosBalanco(dadosGerados)
        } else {
          setAtivos([])
          setDadosBalanco([])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setAtivos([])
        setDadosBalanco([])
      } finally {
        setIsLoading(false)
      }
    }

    // Simular carregamento
    setTimeout(carregarDados, 500)
  }, [])

  const gerarDadosBalancoDeAtivos = (ativos: Ativo[]): ItemBalanco[] => {
    if (ativos.length === 0) return []

    // Calcular totais dos ativos imobilizados
    const totalAtivosImobilizados = ativos.reduce((total, ativo) => {
      return total + (ativo.valorMercado || ativo.valorTotal)
    }, 0)

    const totalAtivosImobilizadosAnterior = ativos.reduce((total, ativo) => {
      // Usar valor original se não houver reavaliação
      return total + ativo.valorTotal
    }, 0)

    // Gerar dados básicos do balanço baseados nos ativos reais
    const dados: ItemBalanco[] = []

    // Ativo Não Circulante - Imobilizado (baseado nos ativos reais)
    if (totalAtivosImobilizados > 0) {
      dados.push({
        id: "imobilizado",
        codigo: "1.2.01",
        descricao: "Imobilizado",
        categoria: "ativo_nao_circulante",
        valorAnterior: totalAtivosImobilizadosAnterior,
        valorAtual: totalAtivosImobilizados,
        variacao: totalAtivosImobilizados - totalAtivosImobilizadosAnterior,
        variacaoPercentual:
          totalAtivosImobilizadosAnterior > 0
            ? ((totalAtivosImobilizados - totalAtivosImobilizadosAnterior) / totalAtivosImobilizadosAnterior) * 100
            : 0,
      })
    }

    return dados
  }

  const categorias = {
    ativo_circulante: { nome: "Ativo Circulante", icon: DollarSign, color: "text-blue-600" },
    ativo_nao_circulante: { nome: "Ativo Não Circulante", icon: Building2, color: "text-green-600" },
    passivo_circulante: { nome: "Passivo Circulante", icon: FileText, color: "text-orange-600" },
    passivo_nao_circulante: { nome: "Passivo Não Circulante", icon: FileText, color: "text-red-600" },
    patrimonio_liquido: { nome: "Patrimônio Líquido", icon: TrendingUp, color: "text-purple-600" },
  }

  const dadosFiltrados = dadosBalanco.filter((item) => {
    const matchCategoria = filtros.categoria === "all" || item.categoria === filtros.categoria
    const matchVariacao =
      filtros.variacao === "all" ||
      (filtros.variacao === "positiva" && item.variacao > 0) ||
      (filtros.variacao === "negativa" && item.variacao < 0) ||
      (filtros.variacao === "neutra" && item.variacao === 0)
    const matchBusca =
      !filtros.busca ||
      item.codigo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(filtros.busca.toLowerCase())

    return matchCategoria && matchVariacao && matchBusca
  })

  const calcularResumoCategoria = (): ResumoCategoria[] => {
    return Object.entries(categorias).map(([key, config]) => {
      const itensCategoria = dadosBalanco.filter((item) => item.categoria === key)
      const valorAnterior = itensCategoria.reduce((sum, item) => sum + item.valorAnterior, 0)
      const valorAtual = itensCategoria.reduce((sum, item) => sum + item.valorAtual, 0)
      const variacao = valorAtual - valorAnterior
      const variacaoPercentual = valorAnterior !== 0 ? (variacao / valorAnterior) * 100 : 0

      return {
        categoria: key,
        nome: config.nome,
        valorAnterior,
        valorAtual,
        variacao,
        variacaoPercentual,
        icon: config.icon,
        color: config.color,
      }
    })
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor >= 0 ? "+" : ""}${valor.toFixed(2)}%`
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
    return categorias[categoria as keyof typeof categorias]?.color || "text-gray-600"
  }

  const exportarPDF = () => {
    console.log("Exportando para PDF...")
    // Implementar exportação para PDF
  }

  const exportarExcel = () => {
    console.log("Exportando para Excel...")
    // Implementar exportação para Excel
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const resumoCategoria = calcularResumoCategoria()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balanço Patrimonial</h1>
          <p className="text-muted-foreground">Análise comparativa da posição patrimonial baseada nos ativos reais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarPDF} disabled={dadosBalanco.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportarExcel} disabled={dadosBalanco.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {resumoCategoria.map((categoria) => {
          const IconComponent = categoria.icon
          const temDados = categoria.valorAtual > 0

          return (
            <Card key={categoria.categoria} className={!temDados ? "opacity-50" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{categoria.nome}</p>
                    <p className="text-2xl font-bold">{temDados ? formatarMoeda(categoria.valorAtual) : "R$ 0,00"}</p>
                    <div className={`flex items-center gap-1 text-sm ${getVariacaoColor(categoria.variacao)}`}>
                      {temDados ? (
                        <>
                          {getVariacaoIcon(categoria.variacao)}
                          <span>{formatarPercentual(categoria.variacaoPercentual)}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Sem dados</span>
                      )}
                    </div>
                  </div>
                  <IconComponent className={`h-8 w-8 ${categoria.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(categorias).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variacao">Variação</Label>
              <Select value={filtros.variacao} onValueChange={(value) => setFiltros({ ...filtros, variacao: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="positiva">Positiva</SelectItem>
                  <SelectItem value="negativa">Negativa</SelectItem>
                  <SelectItem value="neutra">Neutra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Código ou descrição..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="detalhado" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detalhado">Visão Detalhada</TabsTrigger>
          <TabsTrigger value="resumida">Visão Resumida</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contas do Balanço Patrimonial</CardTitle>
              <CardDescription>
                {dadosBalanco.length > 0
                  ? `Comparativo detalhado das contas (${dadosFiltrados.length} de ${dadosBalanco.length} contas)`
                  : "Baseado nos ativos imobilizados cadastrados no sistema"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ativos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ativo cadastrado no sistema</p>
                  <p className="text-sm">Cadastre ativos primeiro para gerar o balanço patrimonial</p>
                  <Button className="mt-4" onClick={() => (window.location.href = "/")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Ativos
                  </Button>
                </div>
              ) : dadosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conta encontrada com os filtros aplicados</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
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
                      {dadosFiltrados.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono">{item.codigo}</TableCell>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(item.valorAnterior)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatarMoeda(item.valorAtual)}</TableCell>
                          <TableCell className={`text-right ${getVariacaoColor(item.variacao)}`}>
                            <div className="flex items-center justify-end gap-1">
                              {getVariacaoIcon(item.variacao)}
                              {formatarMoeda(Math.abs(item.variacao))}
                            </div>
                          </TableCell>
                          <TableCell className={`text-right ${getVariacaoColor(item.variacao)}`}>
                            {formatarPercentual(item.variacaoPercentual)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCategoriaColor(item.categoria)}>
                              {categorias[item.categoria as keyof typeof categorias]?.nome}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumida" className="space-y-4">
          <div className="grid gap-4">
            {resumoCategoria.map((categoria) => {
              const IconComponent = categoria.icon
              const temDados = categoria.valorAtual > 0
              const itensCategoria = dadosBalanco.filter((item) => item.categoria === categoria.categoria)

              return (
                <Card key={categoria.categoria} className={!temDados ? "opacity-50" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-8 w-8 ${categoria.color}`} />
                        <div>
                          <h3 className="font-semibold text-lg">{categoria.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {temDados ? `${itensCategoria.length} contas` : "Sem dados"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {temDados ? formatarMoeda(categoria.valorAtual) : "R$ 0,00"}
                        </p>
                        <div className={`flex items-center justify-end gap-1 ${getVariacaoColor(categoria.variacao)}`}>
                          {temDados ? (
                            <>
                              {getVariacaoIcon(categoria.variacao)}
                              <span className="text-sm">
                                {formatarMoeda(Math.abs(categoria.variacao))} (
                                {formatarPercentual(categoria.variacaoPercentual)})
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">Cadastre ativos</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
