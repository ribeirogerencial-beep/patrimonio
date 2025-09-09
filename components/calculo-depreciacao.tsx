"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Ativo } from "@/types/ativo"
import type { DepreciacaoCalculada, ItemTabelaDepreciacao, ParametrosDepreciacao } from "@/types/depreciacao"
import type { ContaDepreciacao, Categoria } from "@/types/parametros"

interface CalculoDepreciacaoProps {
  ativo: Ativo
  totalCreditosFiscais?: number
  onSaveDepreciation: (data: DepreciacaoCalculada) => void
  contasDepreciacao: ContaDepreciacao[]
  categorias: Categoria[]
  initialCategoriaId?: string
  initialMetodoDepreciacao?: "linear" | "acelerada" | "soma_digitos"
  initialValorResidual?: number
  initialTaxaPersonalizada?: number
  initialContaDepreciacaoId?: string
  initialPeriodoCalculo?: "anual" | "mensal"
}

export function CalculoDepreciacao({
  ativo,
  totalCreditosFiscais,
  onSaveDepreciation,
  contasDepreciacao,
  categorias,
  initialCategoriaId,
  initialMetodoDepreciacao = "linear",
  initialValorResidual = 0,
  initialTaxaPersonalizada,
  initialContaDepreciacaoId,
  initialPeriodoCalculo = "anual",
}: CalculoDepreciacaoProps) {
  const [categoriaId, setCategoriaId] = useState(initialCategoriaId || "default")
  const [metodoDepreciacao, setMetodoDepreciacao] = useState<"linear" | "acelerada" | "soma_digitos">(
    initialMetodoDepreciacao,
  )
  const [valorResidual, setValorResidual] = useState(initialValorResidual)
  const [taxaPersonalizada, setTaxaPersonalizada] = useState<number | undefined>(initialTaxaPersonalizada)
  const [contaDepreciacaoId, setContaDepreciacaoId] = useState(initialContaDepreciacaoId || "default")
  const [periodoCalculo, setPeriodoCalculo] = useState<"anual" | "mensal">(initialPeriodoCalculo)
  const [tabelaDepreciacao, setTabelaDepreciacao] = useState<ItemTabelaDepreciacao[]>([])
  const [calculoRealizado, setCalculoRealizado] = useState(false)

  const categoriaSelecionada = categorias?.find((c) => c.id === categoriaId)

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(valor / 100)
  }

  // Função para calcular o mês/ano baseado na data de aquisição
  const calcularMesAno = (mesIndex: number): string => {
    if (!ativo.dataAquisicao) return ""

    const dataAquisicao = new Date(ativo.dataAquisicao)
    const novaData = new Date(dataAquisicao.getFullYear(), dataAquisicao.getMonth() + mesIndex, 1)

    const mes = (novaData.getMonth() + 1).toString().padStart(2, "0")
    const ano = novaData.getFullYear()

    return `${mes}/${ano}`
  }

  const calcularDepreciacao = () => {
    if (!categoriaSelecionada) {
      alert("Selecione uma categoria para continuar")
      return
    }

    const baseCalculo = ativo.valorTotal - (totalCreditosFiscais || 0) - valorResidual
    const taxaAnual = taxaPersonalizada || categoriaSelecionada.taxaDepreciacao
    const vidaUtilMeses = categoriaSelecionada.vidaUtil

    if (baseCalculo <= 0) {
      alert("Base de cálculo deve ser maior que zero")
      return
    }

    const tabela: ItemTabelaDepreciacao[] = []
    let valorAtual = baseCalculo

    if (periodoCalculo === "anual") {
      // Cálculo anual
      const vidaUtilAnos = Math.ceil(vidaUtilMeses / 12)
      const depreciacaoAnual = baseCalculo / vidaUtilAnos

      for (let ano = 1; ano <= vidaUtilAnos; ano++) {
        const depreciacaoAno = Math.min(depreciacaoAnual, valorAtual)
        valorAtual -= depreciacaoAno

        tabela.push({
          periodo: ano,
          valorInicial: valorAtual + depreciacaoAno,
          depreciacao: depreciacaoAno,
          percentual: (depreciacaoAno / baseCalculo) * 100,
          valorFinal: Math.max(valorAtual, 0),
          mesAno: "", // Não usado no cálculo anual
        })

        if (valorAtual <= 0) break
      }
    } else {
      // Cálculo mensal
      const depreciacaoMensal = (baseCalculo * (taxaAnual / 100)) / 12

      for (let mes = 1; mes <= vidaUtilMeses; mes++) {
        const depreciacaoMes = Math.min(depreciacaoMensal, valorAtual)
        valorAtual -= depreciacaoMes

        tabela.push({
          periodo: mes,
          valorInicial: valorAtual + depreciacaoMes,
          depreciacao: depreciacaoMes,
          percentual: (depreciacaoMes / baseCalculo) * 100,
          valorFinal: Math.max(valorAtual, 0),
          mesAno: calcularMesAno(mes - 1),
        })

        if (valorAtual <= 0) break
      }
    }

    setTabelaDepreciacao(tabela)
    setCalculoRealizado(true)
  }

  const salvarDepreciacao = () => {
    if (!calculoRealizado || !categoriaSelecionada) {
      alert("Realize o cálculo antes de salvar")
      return
    }

    const totalDepreciacao = tabelaDepreciacao.reduce((acc, item) => acc + item.depreciacao, 0)
    const baseCalculo = ativo.valorTotal - (totalCreditosFiscais || 0) - valorResidual

    const parametros: ParametrosDepreciacao = {
      categoriaId,
      categoriaNome: categoriaSelecionada.nome,
      metodoDepreciacao,
      taxaAnual: taxaPersonalizada || categoriaSelecionada.taxaDepreciacao,
      valorResidual,
      vidaUtil: categoriaSelecionada.vidaUtil,
      contaDepreciacaoId,
      periodoCalculo,
    }

    const depreciacaoCalculada: DepreciacaoCalculada = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ativo,
      parametros,
      baseCalculoDepreciavel: baseCalculo,
      totalDepreciacao,
      valorContabilAtual: baseCalculo - totalDepreciacao,
      tabelaDepreciacao,
      dataSalvamento: new Date().toISOString(),
    }

    onSaveDepreciation(depreciacaoCalculada)

    // Limpar formulário
    setCategoriaId("")
    setMetodoDepreciacao("linear")
    setValorResidual(0)
    setTaxaPersonalizada(undefined)
    setContaDepreciacaoId("")
    setPeriodoCalculo("anual")
    setTabelaDepreciacao([])
    setCalculoRealizado(false)

    alert("Depreciação salva com sucesso!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo de Depreciação - {ativo.codigo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ativo Selecionado</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{ativo.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Código: {ativo.codigo} | Valor: {formatarMoeda(ativo.valorTotal)}
                </p>
                {ativo.dataAquisicao && (
                  <p className="text-sm text-muted-foreground">
                    Aquisição: {new Date(ativo.dataAquisicao).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Resumo Financeiro</Label>
              <div className="p-3 bg-gray-50 rounded-md space-y-1">
                <p className="text-sm">
                  Valor Total: <span className="font-medium">{formatarMoeda(ativo.valorTotal)}</span>
                </p>
                {totalCreditosFiscais && (
                  <p className="text-sm">
                    Créditos Fiscais:{" "}
                    <span className="font-medium text-green-600">-{formatarMoeda(totalCreditosFiscais)}</span>
                  </p>
                )}
                <p className="text-sm">
                  Valor Residual: <span className="font-medium text-orange-600">-{formatarMoeda(valorResidual)}</span>
                </p>
                <p className="text-sm font-medium border-t pt-1">
                  Base Depreciável: {formatarMoeda(ativo.valorTotal - (totalCreditosFiscais || 0) - valorResidual)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria do Ativo *</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias?.length > 0 ? (
                    categorias
                      .filter((categoria) => categoria.ativo)
                      .map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome} ({categoria.taxaDepreciacao}% - {categoria.vidaUtil} meses)
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      Nenhuma categoria cadastrada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!categorias ||
                (categorias.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cadastre categorias na aba <strong>Parâmetros</strong>
                  </p>
                ))}
            </div>

            <div>
              <Label htmlFor="metodo">Método de Depreciação</Label>
              <Select value={metodoDepreciacao} onValueChange={(value: any) => setMetodoDepreciacao(value)}>
                <SelectTrigger id="metodo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="acelerada">Acelerada</SelectItem>
                  <SelectItem value="soma_digitos">Soma dos Dígitos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo">Período de Cálculo</Label>
              <Select value={periodoCalculo} onValueChange={(value: any) => setPeriodoCalculo(value)}>
                <SelectTrigger id="periodo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor-residual">Valor Residual (R$)</Label>
              <Input
                id="valor-residual"
                type="number"
                min="0"
                step="0.01"
                value={valorResidual}
                onChange={(e) => setValorResidual(Number(e.target.value))}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="taxa-personalizada">Taxa Personalizada (%)</Label>
              <Input
                id="taxa-personalizada"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxaPersonalizada || ""}
                onChange={(e) => setTaxaPersonalizada(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={
                  categoriaSelecionada ? `Padrão: ${categoriaSelecionada.taxaDepreciacao}%` : "Taxa personalizada"
                }
              />
            </div>

            <div>
              <Label htmlFor="conta-depreciacao">Conta de Depreciação</Label>
              <Select value={contaDepreciacaoId} onValueChange={setContaDepreciacaoId}>
                <SelectTrigger id="conta-depreciacao">
                  <SelectValue placeholder="Selecione uma conta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Nenhuma conta selecionada</SelectItem>
                  {contasDepreciacao?.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.codigo} - {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!categorias ||
            (categorias.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma categoria de ativo foi cadastrada. Acesse a aba <strong>Parâmetros</strong> para cadastrar
                  categorias antes de calcular a depreciação.
                </AlertDescription>
              </Alert>
            ))}

          <div className="flex gap-2">
            <Button onClick={calcularDepreciacao} disabled={!categoriaId || !categorias || categorias.length === 0}>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Depreciação
            </Button>

            {calculoRealizado && (
              <Button onClick={salvarDepreciacao} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Salvar Cálculo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {calculoRealizado && tabelaDepreciacao.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabela de Depreciação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Base Depreciável:</span>
                  <div className="text-lg font-bold">
                    {formatarMoeda(ativo.valorTotal - (totalCreditosFiscais || 0) - valorResidual)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {periodoCalculo === "anual" ? "Depreciação Anual:" : "Depreciação Mensal:"}
                  </span>
                  <div className="text-lg font-bold text-red-600">
                    {formatarMoeda(tabelaDepreciacao.reduce((acc, item) => acc + item.depreciacao, 0))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Valor Contábil Final:</span>
                  <div className="text-lg font-bold text-green-600">
                    {formatarMoeda(
                      ativo.valorTotal -
                        (totalCreditosFiscais || 0) -
                        valorResidual -
                        tabelaDepreciacao.reduce((acc, item) => acc + item.depreciacao, 0),
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{periodoCalculo === "anual" ? "Ano" : "Mês"}</TableHead>
                      {periodoCalculo === "mensal" && <TableHead>Mês/Ano</TableHead>}
                      <TableHead>Valor Inicial</TableHead>
                      <TableHead>{periodoCalculo === "anual" ? "Depreciação Anual" : "Depreciação Mensal"}</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Valor Residual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tabelaDepreciacao.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="secondary">
                            {periodoCalculo === "anual" ? `${item.periodo}º ano` : `${item.periodo}º mês`}
                          </Badge>
                        </TableCell>
                        {periodoCalculo === "mensal" && (
                          <TableCell>
                            <Badge variant="outline">{item.mesAno}</Badge>
                          </TableCell>
                        )}
                        <TableCell>{formatarMoeda(item.valorInicial)}</TableCell>
                        <TableCell className="text-red-600 font-medium">-{formatarMoeda(item.depreciacao)}</TableCell>
                        <TableCell>{formatarPercentual(item.percentual)}</TableCell>
                        <TableCell className="text-green-600 font-medium">{formatarMoeda(item.valorFinal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
