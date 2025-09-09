"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calculator, Save, History, ChevronDown, Trash2 } from "lucide-react"
import type { Ativo } from "@/types/ativo"

interface CalculoMensal {
  mes: string
  mesAno: string
  valorInicial: number
  creditoMensal: number
  percentual: number
  valorRestante: number
}

interface CreditoDetalhado {
  tipo: string
  valor: number
  parcelas: number
  periodo: "mensal" | "anual"
  calculosMensais: CalculoMensal[]
}

interface ApuracaoMensalSalva {
  id: string
  ativoId: string
  ativoNome: string
  ativoCodigo: string
  dataSalvamento: string
  periodo: "mensal" | "anual"
  creditos: CreditoDetalhado[]
  totalCreditos: number
}

interface ApuracaoCreditosProps {
  ativos: Ativo[]
}

export function ApuracaoCreditos({ ativos }: ApuracaoCreditosProps) {
  const [ativoSelecionado, setAtivoSelecionado] = useState<string>("")
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal")
  const [aliquotas, setAliquotas] = useState({
    ipi: 0,
    icms: 0,
    pis: 0,
    cofins: 0,
  })
  const [valoresXML, setValoresXML] = useState({
    ipi: 0,
    icms: 0,
    pis: 0,
    cofins: 0,
  })
  const [parcelas, setParcelas] = useState({
    ipi: 12,
    icms: 48,
    pis: 12,
    cofins: 12,
  })
  const [resultado, setResultado] = useState<CreditoDetalhado[]>([])
  const [apuracoesSalvas, setApuracoesSalvas] = useState<ApuracaoMensalSalva[]>([])

  // Carregar apurações salvas do localStorage
  useEffect(() => {
    const apuracoesSalvasData = localStorage.getItem("apuracoes-creditos-detalhadas")
    if (apuracoesSalvasData) {
      setApuracoesSalvas(JSON.parse(apuracoesSalvasData))
    }
  }, [])

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(4)}%`
  }

  const calcularCreditos = () => {
    if (!ativoSelecionado) return

    const ativo = ativos.find((a) => a.id === ativoSelecionado)
    if (!ativo) return

    const creditos: CreditoDetalhado[] = []
    const tiposCredito = [
      { tipo: "IPI", valor: valoresXML.ipi, parcelas: parcelas.ipi },
      { tipo: "ICMS", valor: valoresXML.icms, parcelas: parcelas.icms },
      { tipo: "PIS", valor: valoresXML.pis, parcelas: parcelas.pis },
      { tipo: "COFINS", valor: valoresXML.cofins, parcelas: parcelas.cofins },
    ]

    tiposCredito.forEach(({ tipo, valor, parcelas: numParcelas }) => {
      if (valor > 0) {
        const creditoMensal = valor / numParcelas
        const percentual = (1 / numParcelas) * 100
        const calculosMensais: CalculoMensal[] = []

        // Gerar cálculos mensais
        for (let i = 0; i < numParcelas; i++) {
          const valorInicial = valor - creditoMensal * i
          const valorRestante = valor - creditoMensal * (i + 1)

          // Calcular mês/ano baseado na data de aquisição
          const dataAquisicao = new Date(ativo.dataAquisicao)
          const mesCalculo = new Date(dataAquisicao)
          mesCalculo.setMonth(mesCalculo.getMonth() + i)

          const mesAno =
            periodo === "mensal"
              ? `${String(mesCalculo.getMonth() + 1).padStart(2, "0")}/${mesCalculo.getFullYear()}`
              : ""

          calculosMensais.push({
            mes: `${i + 1}º ${periodo === "mensal" ? "mês" : "período"}`,
            mesAno,
            valorInicial,
            creditoMensal: -creditoMensal, // Negativo para mostrar como crédito apropriado
            percentual,
            valorRestante: Math.max(0, valorRestante),
          })
        }

        creditos.push({
          tipo,
          valor,
          parcelas: numParcelas,
          periodo,
          calculosMensais,
        })
      }
    })

    setResultado(creditos)
  }

  const salvarApuracao = () => {
    if (!ativoSelecionado || resultado.length === 0) return

    const ativo = ativos.find((a) => a.id === ativoSelecionado)
    if (!ativo) return

    const totalCreditos = resultado.reduce((total, credito) => total + credito.valor, 0)

    const novaApuracao: ApuracaoMensalSalva = {
      id: Date.now().toString(),
      ativoId: ativo.id,
      ativoNome: ativo.nome,
      ativoCodigo: ativo.codigo,
      dataSalvamento: new Date().toISOString(),
      periodo,
      creditos: resultado,
      totalCreditos,
    }

    const novasApuracoes = [...apuracoesSalvas, novaApuracao]
    setApuracoesSalvas(novasApuracoes)
    localStorage.setItem("apuracoes-creditos-detalhadas", JSON.stringify(novasApuracoes))
  }

  const excluirApuracao = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta apuração?")) {
      const novasApuracoes = apuracoesSalvas.filter((a) => a.id !== id)
      setApuracoesSalvas(novasApuracoes)
      localStorage.setItem("apuracoes-creditos-detalhadas", JSON.stringify(novasApuracoes))
    }
  }

  const ativoSelecionadoObj = ativos.find((a) => a.id === ativoSelecionado)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Apuração Mensal de Créditos Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ativo">Selecionar Ativo</Label>
              <Select value={ativoSelecionado} onValueChange={setAtivoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um ativo" />
                </SelectTrigger>
                <SelectContent>
                  {ativos
                    .filter((ativo) => ativo.status !== "Baixado")
                    .map((ativo) => (
                      <SelectItem key={ativo.id} value={ativo.id}>
                        {ativo.codigo} - {ativo.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo">Período de Apropriação</Label>
              <Select value={periodo} onValueChange={(value: "mensal" | "anual") => setPeriodo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal (com Mês/Ano)</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {ativoSelecionadoObj && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Ativo Selecionado:</h4>
              <p>
                <strong>Código:</strong> {ativoSelecionadoObj.codigo}
              </p>
              <p>
                <strong>Nome:</strong> {ativoSelecionadoObj.nome}
              </p>
              <p>
                <strong>Data Aquisição:</strong>{" "}
                {new Date(ativoSelecionadoObj.dataAquisicao).toLocaleDateString("pt-BR")}
              </p>
              <p>
                <strong>Valor Total:</strong> {formatarMoeda(ativoSelecionadoObj.valorTotal)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Valores do XML (Nota Fiscal)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="valorIPI">Valor IPI</Label>
                  <Input
                    id="valorIPI"
                    type="number"
                    step="0.01"
                    value={valoresXML.ipi}
                    onChange={(e) => setValoresXML({ ...valoresXML, ipi: Number(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="valorICMS">Valor ICMS</Label>
                  <Input
                    id="valorICMS"
                    type="number"
                    step="0.01"
                    value={valoresXML.icms}
                    onChange={(e) => setValoresXML({ ...valoresXML, icms: Number(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="valorPIS">Valor PIS</Label>
                  <Input
                    id="valorPIS"
                    type="number"
                    step="0.01"
                    value={valoresXML.pis}
                    onChange={(e) => setValoresXML({ ...valoresXML, pis: Number(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="valorCOFINS">Valor COFINS</Label>
                  <Input
                    id="valorCOFINS"
                    type="number"
                    step="0.01"
                    value={valoresXML.cofins}
                    onChange={(e) => setValoresXML({ ...valoresXML, cofins: Number(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parcelas por Imposto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="parcelasIPI">Parcelas IPI</Label>
                  <Input
                    id="parcelasIPI"
                    type="number"
                    min="1"
                    max="120"
                    value={parcelas.ipi}
                    onChange={(e) => setParcelas({ ...parcelas, ipi: Number(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="parcelasICMS">Parcelas ICMS</Label>
                  <Input
                    id="parcelasICMS"
                    type="number"
                    min="1"
                    max="120"
                    value={parcelas.icms}
                    onChange={(e) => setParcelas({ ...parcelas, icms: Number(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="parcelasPIS">Parcelas PIS</Label>
                  <Input
                    id="parcelasPIS"
                    type="number"
                    min="1"
                    max="120"
                    value={parcelas.pis}
                    onChange={(e) => setParcelas({ ...parcelas, pis: Number(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="parcelasCOFINS">Parcelas COFINS</Label>
                  <Input
                    id="parcelasCOFINS"
                    type="number"
                    min="1"
                    max="120"
                    value={parcelas.cofins}
                    onChange={(e) => setParcelas({ ...parcelas, cofins: Number(e.target.value) || 1 })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button onClick={calcularCreditos} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Créditos
            </Button>
            {resultado.length > 0 && (
              <Button onClick={salvarApuracao} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Salvar Apuração
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {resultado.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado dos Cálculos Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={resultado[0]?.tipo.toLowerCase() || "ipi"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {resultado.map((credito) => (
                  <TabsTrigger key={credito.tipo} value={credito.tipo.toLowerCase()}>
                    {credito.tipo}
                  </TabsTrigger>
                ))}
              </TabsList>

              {resultado.map((credito) => (
                <TabsContent key={credito.tipo} value={credito.tipo.toLowerCase()}>
                  <Card
                    className={`border-l-4 ${
                      credito.tipo === "IPI"
                        ? "border-l-green-500"
                        : credito.tipo === "ICMS"
                          ? "border-l-blue-500"
                          : credito.tipo === "PIS"
                            ? "border-l-purple-500"
                            : "border-l-orange-500"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          {credito.tipo} - {formatarMoeda(credito.valor)}
                        </span>
                        <Badge variant="outline">{credito.parcelas} parcelas</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mês</TableHead>
                              {periodo === "mensal" && <TableHead>Mês/Ano</TableHead>}
                              <TableHead className="text-right">Valor Inicial</TableHead>
                              <TableHead className="text-right">Crédito Mensal</TableHead>
                              <TableHead className="text-right">Percentual</TableHead>
                              <TableHead className="text-right">Valor Restante</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {credito.calculosMensais.map((calculo, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge variant="outline">{calculo.mes}</Badge>
                                </TableCell>
                                {periodo === "mensal" && <TableCell className="font-mono">{calculo.mesAno}</TableCell>}
                                <TableCell className="text-right font-mono">
                                  {formatarMoeda(calculo.valorInicial)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-red-600">
                                  {formatarMoeda(calculo.creditoMensal)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatarPercentual(calculo.percentual)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-green-600">
                                  {formatarMoeda(calculo.valorRestante)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Apurações Salvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apuracoesSalvas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma apuração salva ainda</p>
              <p className="text-sm">Realize um cálculo e salve para visualizar aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apuracoesSalvas.map((apuracao) => (
                <Collapsible key={apuracao.id} className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-semibold">
                          {apuracao.ativoCodigo} - {apuracao.ativoNome}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatarMoeda(apuracao.totalCreditos)} • Período: {apuracao.periodo} • Salvo em:{" "}
                          {new Date(apuracao.dataSalvamento).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            excluirApuracao(apuracao.id)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {apuracao.creditos.map((credito) => (
                        <div key={credito.tipo} className="border-l-4 border-l-gray-300 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{credito.tipo}</h4>
                            <Badge variant="secondary">
                              {formatarMoeda(credito.valor)} em {credito.parcelas} parcelas
                            </Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Mês</TableHead>
                                  {apuracao.periodo === "mensal" && <TableHead className="text-xs">Mês/Ano</TableHead>}
                                  <TableHead className="text-xs text-right">Valor Inicial</TableHead>
                                  <TableHead className="text-xs text-right">Crédito</TableHead>
                                  <TableHead className="text-xs text-right">Restante</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {credito.calculosMensais.slice(0, 3).map((calculo, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="text-xs">
                                      <Badge variant="outline" className="text-xs">
                                        {calculo.mes}
                                      </Badge>
                                    </TableCell>
                                    {apuracao.periodo === "mensal" && (
                                      <TableCell className="text-xs font-mono">{calculo.mesAno}</TableCell>
                                    )}
                                    <TableCell className="text-xs text-right font-mono">
                                      {formatarMoeda(calculo.valorInicial)}
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-mono text-red-600">
                                      {formatarMoeda(calculo.creditoMensal)}
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-mono text-green-600">
                                      {formatarMoeda(calculo.valorRestante)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {credito.calculosMensais.length > 3 && (
                                  <TableRow>
                                    <TableCell
                                      colSpan={apuracao.periodo === "mensal" ? 5 : 4}
                                      className="text-center text-xs text-muted-foreground"
                                    >
                                      ... e mais {credito.calculosMensais.length - 3} períodos
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
