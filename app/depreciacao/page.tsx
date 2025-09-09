"use client"

import { useState, useEffect } from "react"
import { CalculoDepreciacao } from "@/components/calculo-depreciacao"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { History, Trash2, Pencil, Download, Plus } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import type { DepreciacaoCalculada } from "@/types/depreciacao"
import type { ContaDepreciacao, Categoria } from "@/types/parametros"
import { DashboardDepreciacao } from "@/components/dashboard-depreciacao"
import { exportarDepreciacaoPDF } from "@/utils/export-utils"

// Interface para o cálculo de crédito salvo (copiada de apuracao-creditos.tsx para consistência)
interface ResultadoCreditos {
  ipi: number
  pis: number
  cofins: number
  icms: number
  total: number
  dataCalculo: string
  categoria: string
}

interface CreditoCalculado {
  id: string
  ativo: Ativo
  resultado: ResultadoCreditos
  dataSalvamento: string
  valorParaDepreciacao: number
}

export default function DepreciacaoPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [calculosCreditosSalvos, setCalculosCreditosSalvos] = useState<CreditoCalculado[]>([])
  const [depreciacoesSalvas, setDepreciacoesSalvas] = useState<DepreciacaoCalculada[]>([])
  const [contasDepreciacao, setContasDepreciacao] = useState<ContaDepreciacao[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [selectedAtivo, setSelectedAtivo] = useState<Ativo | null>(null)
  const [selectedTotalCreditosFiscais, setSelectedTotalCreditosFiscais] = useState<number | undefined>(undefined)
  const [depreciacaoParaEdicao, setDepreciacaoParaEdicao] = useState<DepreciacaoCalculada | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAtivoIdInModal, setSelectedAtivoIdInModal] = useState<string>("")

  useEffect(() => {
    const ativosData = localStorage.getItem("ativos-imobilizados")
    if (ativosData) {
      setAtivos(JSON.parse(ativosData))
    }

    const calculosCreditosSalvosData = localStorage.getItem("calculos-creditos-salvos")
    if (calculosCreditosSalvosData) {
      setCalculosCreditosSalvos(JSON.parse(calculosCreditosSalvosData))
    }

    const depreciacoesSalvasData = localStorage.getItem("depreciacoes-salvas")
    if (depreciacoesSalvasData) {
      setDepreciacoesSalvas(JSON.parse(depreciacoesSalvasData))
    }

    const contasDepreciacaoData = localStorage.getItem("contas-depreciacao-sistema")
    if (contasDepreciacaoData) {
      setContasDepreciacao(JSON.parse(contasDepreciacaoData))
    }

    const categoriasData = localStorage.getItem("categorias-sistema")
    if (categoriasData) {
      setCategorias(JSON.parse(categoriasData))
    }
  }, [])

  // Filtrar ativos que não possuem cálculos de depreciação salvos
  const ativosSemDepreciacao = ativos.filter((ativo) => !depreciacoesSalvas.some((calc) => calc.ativo.id === ativo.id))

  const handleSaveDepreciation = (data: DepreciacaoCalculada) => {
    setDepreciacoesSalvas((prev) => {
      const updated = [...prev, data]
      localStorage.setItem("depreciacoes-salvas", JSON.stringify(updated))
      return updated
    })
    // Limpar seleção após salvar
    setSelectedAtivo(null)
    setSelectedTotalCreditosFiscais(undefined)
    setDepreciacaoParaEdicao(null)
  }

  const handleDeleteDepreciation = (id: string) => {
    setDepreciacoesSalvas((prev) => {
      const updated = prev.filter((calc) => calc.id !== id)
      localStorage.setItem("depreciacoes-salvas", JSON.stringify(updated))
      return updated
    })
  }

  const handleEditDepreciation = (calc: DepreciacaoCalculada) => {
    setSelectedAtivo(calc.ativo)

    const creditoSalvo = calculosCreditosSalvos.find((c) => c.ativo.id === calc.ativo.id)
    setSelectedTotalCreditosFiscais(creditoSalvo?.resultado.total)

    setDepreciacaoParaEdicao(calc)
  }

  const handleCreateNewCalculation = () => {
    if (!selectedAtivoIdInModal) {
      alert("Selecione um ativo para continuar")
      return
    }

    const ativo = ativos.find((a) => a.id === selectedAtivoIdInModal)
    if (!ativo) return

    setSelectedAtivo(ativo)

    const creditoSalvo = calculosCreditosSalvos.find((c) => c.ativo.id === selectedAtivoIdInModal)
    setSelectedTotalCreditosFiscais(creditoSalvo?.resultado.total)

    setDepreciacaoParaEdicao(null)
    setIsModalOpen(false)
    setSelectedAtivoIdInModal("")
  }

  const handleDownloadDepreciationPDF = (calc: DepreciacaoCalculada) => {
    exportarDepreciacaoPDF(calc.ativo, calc.tabelaDepreciacao, {
      categoria: calc.parametros.categoriaNome,
      metodo: calc.parametros.metodoDepreciacao,
      taxaAnual: calc.parametros.taxaAnual,
      valorResidual: calc.parametros.valorResidual,
      baseDepreciacao: calc.baseCalculoDepreciavel,
    })
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cálculo de Depreciação</h1>
          <p className="text-muted-foreground">Calcule a depreciação de seus ativos imobilizados.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Cálculo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Selecionar Ativo para Depreciação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ativo-modal-select">Ativo Disponível</Label>
                <Select value={selectedAtivoIdInModal} onValueChange={setSelectedAtivoIdInModal}>
                  <SelectTrigger id="ativo-modal-select">
                    <SelectValue placeholder="Selecione um ativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ativosSemDepreciacao.length > 0 ? (
                      ativosSemDepreciacao.map((ativo) => (
                        <SelectItem key={ativo.id} value={ativo.id}>
                          {ativo.codigo} - {ativo.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-assets" disabled>
                        Todos os ativos já possuem cálculos de depreciação
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {ativosSemDepreciacao.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Todos os ativos cadastrados já possuem cálculos de depreciação salvos.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateNewCalculation}
                  disabled={!selectedAtivoIdInModal || ativosSemDepreciacao.length === 0}
                >
                  Criar Cálculo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedAtivo && (
        <CalculoDepreciacao
          ativo={selectedAtivo}
          totalCreditosFiscais={selectedTotalCreditosFiscais}
          onSaveDepreciation={handleSaveDepreciation}
          contasDepreciacao={contasDepreciacao}
          categorias={categorias}
          initialCategoriaId={depreciacaoParaEdicao?.parametros.categoriaId}
          initialMetodoDepreciacao={depreciacaoParaEdicao?.parametros.metodoDepreciacao}
          initialValorResidual={depreciacaoParaEdicao?.parametros.valorResidual}
          initialTaxaPersonalizada={depreciacaoParaEdicao?.parametros.taxaAnual}
          initialContaDepreciacaoId={depreciacaoParaEdicao?.parametros.contaDepreciacaoId}
          initialPeriodoCalculo={depreciacaoParaEdicao?.parametros.periodoCalculo}
        />
      )}

      {/* Dashboard de Depreciação */}
      <DashboardDepreciacao depreciacoesSalvas={depreciacoesSalvas} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Cálculos de Depreciação Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {depreciacoesSalvas.length > 0 ? (
            <div className="space-y-4">
              {depreciacoesSalvas.map((calc) => (
                <Card key={calc.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {calc.ativo.codigo} - {calc.ativo.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Base Depreciável: {formatarMoeda(calc.baseCalculoDepreciavel)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Depreciação Total:{" "}
                        <span className="text-red-600 font-medium">{formatarMoeda(calc.totalDepreciacao)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valor Contábil Atual:{" "}
                        <span className="text-green-600 font-medium">{formatarMoeda(calc.valorContabilAtual)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Método: {calc.parametros.metodoDepreciacao} | Taxa: {calc.parametros.taxaAnual}% | Vida Útil:{" "}
                        {calc.parametros.vidaUtil} meses | Período: {calc.parametros.periodoCalculo || "anual"}
                        {calc.parametros.contaDepreciacaoId && (
                          <span> | Conta: {calc.parametros.contaDepreciacaoId}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right text-xs text-muted-foreground">
                        Salvo em: {format(new Date(calc.dataSalvamento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadDepreciationPDF(calc)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label={`Baixar PDF do cálculo de depreciação para ${calc.ativo.nome}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditDepreciation(calc)}
                          className="text-blue-500 hover:text-blue-700"
                          aria-label={`Editar cálculo de depreciação para ${calc.ativo.nome}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDepreciation(calc.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remover cálculo de depreciação para ${calc.ativo.nome}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cálculo de depreciação salvo ainda.
              <br />
              <Button variant="link" onClick={() => setIsModalOpen(true)} className="mt-2">
                Criar seu primeiro cálculo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
