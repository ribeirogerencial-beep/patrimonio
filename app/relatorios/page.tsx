"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BarChart3, TrendingUp, TrendingDown, DollarSign, Wrench, Package } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import { ExportConfigDialog, type ExportConfig } from "@/components/export-config-dialog"
import { exportarPDFPersonalizado } from "@/utils/custom-pdf-export"

// Importar as novas funções de exportação
import { exportarRelatorioGeralPDF, exportarRelatorioGeralExcel } from "@/utils/export-utils"

interface Manutencao {
  id: string
  ativoId: string
  tipo: "preventiva" | "corretiva" | "preditiva"
  titulo: string
  descricao: string
  dataAgendada: string
  dataRealizada?: string
  status: "agendada" | "em-andamento" | "concluida" | "cancelada"
  responsavel: string
  custo?: number
  custoReal?: number
  observacoes?: string
  proximaManutencao?: string
  anexo?: string
}

export default function RelatoriosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [filtroAno, setFiltroAno] = useState<string>(new Date().getFullYear().toString())
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos")

  // Configuração dos campos disponíveis para exportação
  const camposDisponiveis = [
    { key: "codigo", label: "Código", enabled: true, required: true },
    { key: "nome", label: "Nome", enabled: true, required: true },
    { key: "setorDestino", label: "Setor Destino", enabled: true },
    { key: "dataAquisicao", label: "Data Aquisição", enabled: true },
    { key: "valorTotal", label: "Valor Total", enabled: true },
    { key: "icms", label: "ICMS", enabled: false },
    { key: "ipi", label: "IPI", enabled: false },
    { key: "pis", label: "PIS", enabled: false },
    { key: "cofins", label: "COFINS", enabled: false },
    { key: "status", label: "Status", enabled: true },
  ]

  useEffect(() => {
    const ativosSalvos = localStorage.getItem("ativos-imobilizados")
    if (ativosSalvos) {
      setAtivos(JSON.parse(ativosSalvos))
    }

    // Carregar todas as manutenções
    const todasManutencoes: Manutencao[] = []
    const ativosData = ativosSalvos ? JSON.parse(ativosSalvos) : []

    ativosData.forEach((ativo: Ativo) => {
      const manutencoesAtivo = localStorage.getItem(`manutencoes-${ativo.id}`)
      if (manutencoesAtivo) {
        const manutencoesParseadas = JSON.parse(manutencoesAtivo)
        todasManutencoes.push(...manutencoesParseadas)
      }
    })

    setManutencoes(todasManutencoes)
  }, [])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  // Cálculos para relatórios com filtros aplicados
  const ativosPorAno = ativos.reduce(
    (acc, ativo) => {
      const ano = new Date(ativo.dataAquisicao).getFullYear().toString()
      if (!acc[ano]) acc[ano] = []
      acc[ano].push(ativo)
      return acc
    },
    {} as Record<string, Ativo[]>,
  )

  const anos = Object.keys(ativosPorAno).sort().reverse()

  // Aplicar filtros
  let ativosFiltrados = filtroAno === "todos" ? ativos : ativosPorAno[filtroAno] || []
  if (filtroAtivo !== "todos") {
    ativosFiltrados = ativosFiltrados.filter((ativo) => ativo.id === filtroAtivo)
  }

  // Filtrar manutenções baseado no ativo selecionado
  let manutencoesFiltradas = manutencoes
  if (filtroAtivo !== "todos") {
    manutencoesFiltradas = manutencoes.filter((m) => m.ativoId === filtroAtivo)
  }

  const valorTotalAtivos = ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorTotal, 0)
  const valorTotalImpostos = ativosFiltrados.reduce(
    (acc, ativo) => acc + ativo.valorICMS + ativo.valorIPI + ativo.valorPIS + ativo.valorCOFINS,
    0,
  )

  // Cálculos de manutenção com filtros
  const custoTotalEstimado = manutencoesFiltradas.reduce((acc, m) => acc + (m.custo || 0), 0)
  const custoTotalReal = manutencoesFiltradas
    .filter((m) => m.status === "concluida")
    .reduce((acc, m) => acc + (m.custoReal || m.custo || 0), 0)
  const manutencoesAgendadas = manutencoesFiltradas.filter((m) => m.status === "agendada").length
  const manutencoesAndamento = manutencoesFiltradas.filter((m) => m.status === "em-andamento").length
  const manutencoesConcluidas = manutencoesFiltradas.filter((m) => m.status === "concluida").length

  // Substituir a função exportarRelatorio existente por:
  const exportarRelatorioPDF = (tipo: string) => {
    if (tipo === "geral") {
      exportarRelatorioGeralPDF(ativosFiltrados, { ano: filtroAno, ativo: filtroAtivo })
    }
    // Adicionar outros tipos conforme necessário
  }

  // A função exportarRelatorioExcel não será mais usada, mas a manteremos aqui por enquanto
  // caso haja necessidade futura de reintroduzir a funcionalidade.
  const exportarRelatorioExcel = (tipo: string) => {
    if (tipo === "geral") {
      exportarRelatorioGeralExcel(ativosFiltrados, { ano: filtroAno, ativo: filtroAtivo })
    }
    // Adicionar outros tipos conforme necessário
  }

  const handleExportPersonalizado = (config: ExportConfig) => {
    exportarPDFPersonalizado(ativosFiltrados, config, { ano: filtroAno, ativo: filtroAtivo }, manutencoes)
  }

  const ativoSelecionado = ativos.find((a) => a.id === filtroAtivo)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análises e relatórios dos seus ativos imobilizados</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Ano:</label>
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Ativo:</label>
              <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Ativos</SelectItem>
                  {ativos.map((ativo) => (
                    <SelectItem key={ativo.id} value={ativo.id}>
                      {ativo.codigo} - {ativo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filtroAtivo !== "todos" && ativoSelecionado && (
              <div className="flex items-end">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">{ativoSelecionado.codigo}</div>
                      <div className="text-xs text-blue-700">{ativoSelecionado.nome}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ativosFiltrados.length}</div>
            <p className="text-xs text-muted-foreground">
              {filtroAtivo !== "todos"
                ? "Ativo selecionado"
                : filtroAno === "todos"
                  ? "Todos os anos"
                  : `Ano ${filtroAno}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(valorTotalAtivos)}</div>
            <p className="text-xs text-muted-foreground">Valor de aquisição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{manutencoesFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">
              {filtroAtivo !== "todos" ? "Do ativo selecionado" : "Total registradas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Manutenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatarMoeda(custoTotalReal)}</div>
            <p className="text-xs text-muted-foreground">Custo real gasto</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Detalhados */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Relatório Geral</TabsTrigger>
          <TabsTrigger value="depreciacao">Depreciação</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Relatório Geral de Ativos
                  {filtroAtivo !== "todos" && ativoSelecionado && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">- {ativoSelecionado.codigo}</span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => exportarRelatorioPDF("geral")} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Padrão
                  </Button>
                  <ExportConfigDialog
                    onExport={handleExportPersonalizado}
                    defaultFields={camposDisponiveis}
                    title="Configurar Relatório PDF"
                  />
                  {/* Botão Excel removido */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ativosFiltrados.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Setor Destino</TableHead>
                        <TableHead>Data Aquisição</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>ICMS</TableHead>
                        <TableHead>IPI</TableHead>
                        <TableHead>PIS</TableHead>
                        <TableHead>COFINS</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ativosFiltrados.map((ativo) => (
                        <TableRow key={ativo.id}>
                          <TableCell className="font-mono">{ativo.codigo}</TableCell>
                          <TableCell className="font-medium">{ativo.nome}</TableCell>
                          <TableCell>{ativo.setorDestino || "-"}</TableCell>
                          <TableCell>{formatarData(ativo.dataAquisicao)}</TableCell>
                          <TableCell className="font-semibold">{formatarMoeda(ativo.valorTotal)}</TableCell>
                          <TableCell>{formatarMoeda(ativo.valorICMS)}</TableCell>
                          <TableCell>{formatarMoeda(ativo.valorIPI)}</TableCell>
                          <TableCell>{formatarMoeda(ativo.valorPIS)}</TableCell>
                          <TableCell>{formatarMoeda(ativo.valorCOFINS)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ativo.status === "Ativo"
                                  ? "default"
                                  : ativo.status === "Inativo"
                                    ? "secondary"
                                    : "destructive" // Para status "Baixado"
                              }
                            >
                              {ativo.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum ativo encontrado com os filtros selecionados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciacao" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Relatório de Depreciação
                  {filtroAtivo !== "todos" && ativoSelecionado && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">- {ativoSelecionado.codigo}</span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => exportarRelatorioPDF("depreciacao")} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  {/* Botão Excel removido */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatarMoeda(valorTotalAtivos)}</div>
                    <div className="text-sm text-blue-700">Valor Original</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorTotal * 0.1, 0))}
                    </div>
                    <div className="text-sm text-red-700">Depreciação Estimada</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorTotal * 0.9, 0))}
                    </div>
                    <div className="text-sm text-green-700">Valor Atual Estimado</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  * Valores estimados baseados em depreciação linear de 10% ao ano
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impostos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatório de Impostos
                  {filtroAtivo !== "todos" && ativoSelecionado && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">- {ativoSelecionado.codigo}</span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => exportarRelatorioPDF("impostos")} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  {/* Botão Excel removido */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorICMS, 0))}
                  </div>
                  <div className="text-sm text-blue-700">ICMS Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorIPI, 0))}
                  </div>
                  <div className="text-sm text-green-700">IPI Total</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">
                    {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorPIS, 0))}
                  </div>
                  <div className="text-sm text-yellow-700">PIS Total</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {formatarMoeda(ativosFiltrados.reduce((acc, ativo) => acc + ativo.valorCOFINS, 0))}
                  </div>
                  <div className="text-sm text-purple-700">COFINS Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencao" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Relatório de Manutenção
                  {filtroAtivo !== "todos" && ativoSelecionado && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">- {ativoSelecionado.codigo}</span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => exportarRelatorioPDF("manutencao")} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  {/* Botão Excel removido */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo de Manutenções */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{manutencoesAgendadas}</div>
                    <div className="text-sm text-blue-700">Agendadas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{manutencoesAndamento}</div>
                    <div className="text-sm text-yellow-700">Em Andamento</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{manutencoesConcluidas}</div>
                    <div className="text-sm text-green-700">Concluídas</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {manutencoesFiltradas.filter((m) => m.status === "cancelada").length}
                    </div>
                    <div className="text-sm text-red-700">Canceladas</div>
                  </div>
                </div>

                {/* Custos de Manutenção */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{formatarMoeda(custoTotalEstimado)}</div>
                    <div className="text-sm text-blue-700">Custo Total Estimado</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{formatarMoeda(custoTotalReal)}</div>
                    <div className="text-sm text-green-700">Custo Total Real</div>
                  </div>
                </div>

                {/* Tabela de Manutenções */}
                {manutencoesFiltradas.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ativo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Data Agendada</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Custo Estimado</TableHead>
                          <TableHead>Custo Real</TableHead>
                          <TableHead>Responsável</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manutencoesFiltradas.slice(0, 20).map((manutencao) => {
                          const ativo = ativos.find((a) => a.id === manutencao.ativoId)
                          return (
                            <TableRow key={manutencao.id}>
                              <TableCell className="font-medium">{ativo?.codigo || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{manutencao.tipo}</Badge>
                              </TableCell>
                              <TableCell>{manutencao.titulo}</TableCell>
                              <TableCell>{formatarData(manutencao.dataAgendada)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    manutencao.status === "concluida"
                                      ? "default"
                                      : manutencao.status === "em-andamento"
                                        ? "secondary"
                                        : manutencao.status === "agendada"
                                          ? "outline"
                                          : "destructive"
                                  }
                                >
                                  {manutencao.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatarMoeda(manutencao.custo || 0)}</TableCell>
                              <TableCell>
                                {manutencao.status === "concluida"
                                  ? formatarMoeda(manutencao.custoReal || manutencao.custo || 0)
                                  : "-"}
                              </TableCell>
                              <TableCell>{manutencao.responsavel}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {filtroAtivo !== "todos"
                      ? "Nenhuma manutenção encontrada para o ativo selecionado"
                      : "Nenhuma manutenção registrada"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
