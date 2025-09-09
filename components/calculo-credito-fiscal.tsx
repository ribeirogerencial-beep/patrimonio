"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, Download, Save, X } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import type { CreditoCalculado, ResultadoCreditos } from "@/types/credito"
import type { ContaCreditoFiscal } from "@/types/parametros"
import { exportarCreditosPDF, exportarCreditosExcel } from "@/utils/export-utils"

interface CalculoCreditoFiscalProps {
  ativo: Ativo
  onSaveCredito?: (credito: CreditoCalculado) => void
  initialCredito?: CreditoCalculado | null
  onCancelEdit?: () => void
  contasCreditoFiscal?: ContaCreditoFiscal[]
}

export function CalculoCreditoFiscal({
  ativo,
  onSaveCredito,
  initialCredito,
  onCancelEdit,
  contasCreditoFiscal = [],
}: CalculoCreditoFiscalProps) {
  const [percentualIPI, setPercentualIPI] = useState<number>(0)
  const [percentualPIS, setPercentualPIS] = useState<number>(1.65)
  const [percentualCOFINS, setPercentualCOFINS] = useState<number>(7.6)
  const [percentualICMS, setPercentualICMS] = useState<number>(0)

  const [parcelasIPI, setParcelasIPI] = useState<number>(1)
  const [parcelasPIS, setParcelasPIS] = useState<number>(1)
  const [parcelasCOFINS, setParcelasCOFINS] = useState<number>(1)
  const [parcelasICMS, setParcelasICMS] = useState<number>(1)

  const [contaCreditoFiscalId, setContaCreditoFiscalId] = useState<string>("default")
  const [resultado, setResultado] = useState<ResultadoCreditos | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Carregar dados do cálculo inicial se estiver editando
  useEffect(() => {
    if (initialCredito) {
      setPercentualIPI(initialCredito.parametros?.percentualIPI || 0)
      setPercentualPIS(initialCredito.parametros?.percentualPIS || 1.65)
      setPercentualCOFINS(initialCredito.parametros?.percentualCOFINS || 7.6)
      setPercentualICMS(initialCredito.parametros?.percentualICMS || 0)

      setParcelasIPI(initialCredito.resultado?.parcelasIPI || 1)
      setParcelasPIS(initialCredito.resultado?.parcelasPIS || 1)
      setParcelasCOFINS(initialCredito.resultado?.parcelasCOFINS || 1)
      setParcelasICMS(initialCredito.resultado?.parcelasICMS || 1)

      setContaCreditoFiscalId(initialCredito.parametros?.contaCreditoFiscalId || "default")
      setResultado(initialCredito.resultado)
      setIsEditing(true)
    } else {
      // Reset para valores padrão
      setPercentualIPI(0)
      setPercentualPIS(1.65)
      setPercentualCOFINS(7.6)
      setPercentualICMS(0)
      setParcelasIPI(1)
      setParcelasPIS(1)
      setParcelasCOFINS(1)
      setParcelasICMS(1)
      setContaCreditoFiscalId("default")
      setResultado(null)
      setIsEditing(false)
    }
  }, [initialCredito])

  const calcularCreditos = () => {
    const valorBase = ativo.valorTotal

    const creditoIPI = (valorBase * percentualIPI) / 100
    const creditoPIS = (valorBase * percentualPIS) / 100
    const creditoCOFINS = (valorBase * percentualCOFINS) / 100
    const creditoICMS = (valorBase * percentualICMS) / 100

    const total = creditoIPI + creditoPIS + creditoCOFINS + creditoICMS

    const novoResultado: ResultadoCreditos = {
      ipi: creditoIPI,
      pis: creditoPIS,
      cofins: creditoCOFINS,
      icms: creditoICMS,
      total,
      dataCalculo: new Date().toISOString(),
      categoria: "Crédito Fiscal",
      parcelasIPI,
      parcelasPIS,
      parcelasCOFINS,
      parcelasICMS,
    }

    setResultado(novoResultado)
  }

  const salvarCalculo = () => {
    if (!resultado) {
      alert("Realize o cálculo antes de salvar")
      return
    }

    const valorParaDepreciacao = ativo.valorTotal - resultado.total

    const creditoCalculado: CreditoCalculado = {
      id: initialCredito?.id || Date.now().toString(),
      ativoId: ativo.id,
      ativo: ativo,
      resultado: resultado,
      dataSalvamento: new Date().toISOString(),
      dataCalculo: resultado.dataCalculo,
      valorParaDepreciacao: valorParaDepreciacao,
      parametros: {
        percentualIPI,
        percentualPIS,
        percentualCOFINS,
        percentualICMS,
        contaCreditoFiscalId,
      },
    }

    // Salvar no localStorage
    const calculosSalvos = JSON.parse(localStorage.getItem("calculos-creditos-salvos") || "[]")

    if (isEditing && initialCredito) {
      // Atualizar cálculo existente
      const index = calculosSalvos.findIndex((calc: CreditoCalculado) => calc.id === initialCredito.id)
      if (index !== -1) {
        calculosSalvos[index] = creditoCalculado
      }
    } else {
      // Adicionar novo cálculo
      calculosSalvos.push(creditoCalculado)
    }

    localStorage.setItem("calculos-creditos-salvos", JSON.stringify(calculosSalvos))

    if (onSaveCredito) {
      onSaveCredito(creditoCalculado)
    }

    // Reset do formulário
    if (!isEditing) {
      setResultado(null)
    }
  }

  const cancelarEdicao = () => {
    if (onCancelEdit) {
      onCancelEdit()
    }
    setIsEditing(false)
    setResultado(null)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {isEditing ? "Editar Cálculo de Crédito Fiscal" : "Cálculo de Crédito Fiscal"}
          </CardTitle>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Editando</Badge>
              <Button variant="ghost" size="sm" onClick={cancelarEdicao}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Ativo */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Ativo Selecionado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Código:</span> {ativo.codigo}
              </div>
              <div>
                <span className="font-medium">Nome:</span> {ativo.nome}
              </div>
              <div>
                <span className="font-medium">Valor Total:</span> {formatarMoeda(ativo.valorTotal)}
              </div>
              <div>
                <span className="font-medium">Data Aquisição:</span>{" "}
                {new Date(ativo.dataAquisicao).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>

          {/* Configuração de Percentuais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuração de Percentuais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="percentual-ipi">IPI (%)</Label>
                <Input
                  id="percentual-ipi"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualIPI}
                  onChange={(e) => setPercentualIPI(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="percentual-pis">PIS (%)</Label>
                <Input
                  id="percentual-pis"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualPIS}
                  onChange={(e) => setPercentualPIS(Number(e.target.value))}
                  placeholder="1.65"
                />
              </div>

              <div>
                <Label htmlFor="percentual-cofins">COFINS (%)</Label>
                <Input
                  id="percentual-cofins"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualCOFINS}
                  onChange={(e) => setPercentualCOFINS(Number(e.target.value))}
                  placeholder="7.60"
                />
              </div>

              <div>
                <Label htmlFor="percentual-icms">ICMS (%)</Label>
                <Input
                  id="percentual-icms"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualICMS}
                  onChange={(e) => setPercentualICMS(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Configuração de Parcelas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Parcelamento dos Créditos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="parcelas-ipi">Parcelas IPI</Label>
                <Input
                  id="parcelas-ipi"
                  type="number"
                  min="1"
                  max="60"
                  value={parcelasIPI}
                  onChange={(e) => setParcelasIPI(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="parcelas-pis">Parcelas PIS</Label>
                <Input
                  id="parcelas-pis"
                  type="number"
                  min="1"
                  max="60"
                  value={parcelasPIS}
                  onChange={(e) => setParcelasPIS(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="parcelas-cofins">Parcelas COFINS</Label>
                <Input
                  id="parcelas-cofins"
                  type="number"
                  min="1"
                  max="60"
                  value={parcelasCOFINS}
                  onChange={(e) => setParcelasCOFINS(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="parcelas-icms">Parcelas ICMS</Label>
                <Input
                  id="parcelas-icms"
                  type="number"
                  min="1"
                  max="60"
                  value={parcelasICMS}
                  onChange={(e) => setParcelasICMS(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Conta Contábil */}
          {contasCreditoFiscal && contasCreditoFiscal.length > 0 && (
            <div>
              <Label htmlFor="conta-credito-fiscal">Conta de Crédito Fiscal (Opcional)</Label>
              <Select value={contaCreditoFiscalId} onValueChange={setContaCreditoFiscalId}>
                <SelectTrigger id="conta-credito-fiscal">
                  <SelectValue placeholder="Selecione uma conta de crédito fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Nenhuma conta selecionada</SelectItem>
                  {contasCreditoFiscal.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.codigo} - {conta.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={calcularCreditos} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado do Cálculo */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Cálculo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">IPI</div>
                <div className="text-2xl font-bold text-green-900">{formatarMoeda(resultado.ipi)}</div>
                <div className="text-xs text-green-600">
                  {parcelasIPI}x de {formatarMoeda(resultado.ipi / parcelasIPI)}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">PIS</div>
                <div className="text-2xl font-bold text-blue-900">{formatarMoeda(resultado.pis)}</div>
                <div className="text-xs text-blue-600">
                  {parcelasPIS}x de {formatarMoeda(resultado.pis / parcelasPIS)}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">COFINS</div>
                <div className="text-2xl font-bold text-purple-900">{formatarMoeda(resultado.cofins)}</div>
                <div className="text-xs text-purple-600">
                  {parcelasCOFINS}x de {formatarMoeda(resultado.cofins / parcelasCOFINS)}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-800">ICMS</div>
                <div className="text-2xl font-bold text-orange-900">{formatarMoeda(resultado.icms)}</div>
                <div className="text-xs text-orange-600">
                  {parcelasICMS}x de {formatarMoeda(resultado.icms / parcelasICMS)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-lg font-semibold">Total de Créditos Fiscais</div>
                <div className="text-3xl font-bold text-green-600">{formatarMoeda(resultado.total)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Valor para Base de Depreciação</div>
                <div className="text-xl font-semibold">{formatarMoeda(ativo.valorTotal - resultado.total)}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={salvarCalculo} variant="default">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Atualizar Cálculo" : "Salvar Cálculo"}
              </Button>

              <Button onClick={() => exportarCreditosPDF(ativo, resultado)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>

              <Button onClick={() => exportarCreditosExcel(ativo, resultado)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
