"use client"

import { useState, useEffect } from "react"
import { CalculoCreditoFiscal } from "@/components/calculo-credito-fiscal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { History, Trash2, Pencil, Download, Plus } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import type { CreditoCalculado } from "@/types/credito"
import type { ContaCreditoFiscal } from "@/types/parametros"
import { DashboardCreditoFiscal } from "@/components/dashboard-credito-fiscal"
import { exportarCreditoFiscalSalvoPDF } from "@/utils/export-utils"

export default function CreditosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [calculosCreditosSalvos, setCalculosCreditosSalvos] = useState<CreditoCalculado[]>([])
  const [contasCreditoFiscal, setContasCreditoFiscal] = useState<ContaCreditoFiscal[]>([])
  const [selectedAtivo, setSelectedAtivo] = useState<Ativo | null>(null)
  const [editingCredito, setEditingCredito] = useState<CreditoCalculado | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAtivoId, setSelectedAtivoId] = useState<string>("")

  useEffect(() => {
    const ativosData = localStorage.getItem("ativos-imobilizados")
    if (ativosData) {
      setAtivos(JSON.parse(ativosData))
    }

    const calculosCreditosSalvosData = localStorage.getItem("calculos-creditos-salvos")
    if (calculosCreditosSalvosData) {
      setCalculosCreditosSalvos(JSON.parse(calculosCreditosSalvosData))
    }

    const contasCreditoFiscalData = localStorage.getItem("contas-credito-fiscal-sistema")
    if (contasCreditoFiscalData) {
      setContasCreditoFiscal(JSON.parse(contasCreditoFiscalData))
    }
  }, [])

  // Filtrar ativos que não possuem cálculos de crédito fiscal salvos
  const ativosSemCreditoFiscal = ativos.filter(
    (ativo) => !calculosCreditosSalvos.some((calculo) => calculo.ativoId === ativo.id),
  )

  const handleSaveCredito = (data: CreditoCalculado) => {
    setCalculosCreditosSalvos((prev) => {
      let updated: CreditoCalculado[]
      if (editingCredito) {
        updated = prev.map((calc) => (calc.id === data.id ? data : calc))
        alert("Cálculo de crédito atualizado com sucesso!")
      } else {
        updated = [...prev, data]
        alert("Cálculo de crédito salvo com sucesso!")
      }
      localStorage.setItem("calculos-creditos-salvos", JSON.stringify(updated))
      setEditingCredito(null)
      setSelectedAtivo(null)
      return updated
    })
  }

  const handleDeleteCredito = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cálculo de crédito?")) {
      setCalculosCreditosSalvos((prev) => {
        const updated = prev.filter((calc) => calc.id !== id)
        localStorage.setItem("calculos-creditos-salvos", JSON.stringify(updated))
        alert("Cálculo de crédito excluído com sucesso!")
        return updated
      })
    }
  }

  const handleEditCredito = (credito: CreditoCalculado) => {
    const fullAtivo = ativos.find((a) => a.id === credito.ativoId)
    setSelectedAtivo(fullAtivo || null)
    setEditingCredito(credito)
  }

  const handleDownloadPDF = (credito: CreditoCalculado) => {
    const ativoNome = credito.ativo?.nome || "Ativo Removido"
    exportarCreditoFiscalSalvoPDF(credito, ativoNome)
  }

  const handleCancelEdit = () => {
    setEditingCredito(null)
    setSelectedAtivo(null)
  }

  const handleCreateNewCalculation = () => {
    if (ativosSemCreditoFiscal.length === 0) {
      alert("Todos os ativos já possuem cálculos de crédito fiscal salvos.")
      return
    }
    setIsModalOpen(true)
  }

  const handleSelectAtivo = () => {
    if (!selectedAtivoId) return

    const ativo = ativos.find((a) => a.id === selectedAtivoId)
    if (ativo) {
      setSelectedAtivo(ativo)
      setIsModalOpen(false)
      setSelectedAtivoId("")
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Cálculo de Crédito Fiscal</h1>
          <p className="text-muted-foreground">Calcule e gerencie os créditos fiscais de seus ativos.</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNewCalculation} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Cálculo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar Ativo para Cálculo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ativo-select">Ativo</Label>
                <Select value={selectedAtivoId} onValueChange={setSelectedAtivoId}>
                  <SelectTrigger id="ativo-select">
                    <SelectValue placeholder="Selecione um ativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ativosSemCreditoFiscal.length > 0 ? (
                      ativosSemCreditoFiscal.map((ativo) => (
                        <SelectItem key={ativo.id} value={ativo.id}>
                          {ativo.codigo} - {ativo.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-assets" disabled>
                        Todos os ativos já possuem cálculos salvos
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {ativosSemCreditoFiscal.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Todos os ativos cadastrados já possuem cálculos de crédito fiscal salvos.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSelectAtivo} disabled={!selectedAtivoId || selectedAtivoId === "no-assets"}>
                  Selecionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedAtivo && (
        <CalculoCreditoFiscal
          ativo={selectedAtivo}
          onSaveCredito={handleSaveCredito}
          initialCredito={editingCredito}
          onCancelEdit={handleCancelEdit}
          contasCreditoFiscal={contasCreditoFiscal}
        />
      )}

      {calculosCreditosSalvos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Visão Geral dos Créditos Fiscais</h2>
          <DashboardCreditoFiscal calculos={calculosCreditosSalvos} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Cálculos de Crédito Fiscal Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculosCreditosSalvos.length > 0 ? (
            <div className="space-y-4">
              {calculosCreditosSalvos.map((calc) => (
                <Card key={calc.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {calc.ativo?.codigo || "N/A"} - {calc.ativo?.nome || "Ativo Removido"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total de Créditos:{" "}
                        <span className="text-green-600 font-medium">{formatarMoeda(calc.resultado.total)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Valor para Base de Depreciação:{" "}
                        <span className="font-medium">{formatarMoeda(calc.valorParaDepreciacao)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IPI: {formatarMoeda(calc.resultado.ipi)} ({calc.resultado.parcelasIPI || 1}x) | ICMS:{" "}
                        {formatarMoeda(calc.resultado.icms)} ({calc.resultado.parcelasICMS || 1}x) | PIS:{" "}
                        {formatarMoeda(calc.resultado.pis)} ({calc.resultado.parcelasPIS || 1}x) | COFINS:{" "}
                        {formatarMoeda(calc.resultado.cofins)} ({calc.resultado.parcelasCOFINS || 1}x)
                      </p>
                      {calc.parametros?.contaCreditoFiscalId && (
                        <p className="text-xs text-muted-foreground">
                          Conta:{" "}
                          {contasCreditoFiscal.find((c) => c.id === calc.parametros?.contaCreditoFiscalId)?.descricao}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right text-xs text-muted-foreground">
                        Salvo em: {format(new Date(calc.dataSalvamento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(calc)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label={`Baixar PDF do cálculo de crédito para ${calc.ativo?.nome || "Ativo Removido"}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCredito(calc)}
                          className="text-blue-500 hover:text-blue-700"
                          aria-label={`Editar cálculo de crédito para ${calc.ativo?.nome || "Ativo Removido"}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCredito(calc.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remover cálculo de crédito para ${calc.ativo?.nome || "Ativo Removido"}`}
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
              <p className="mb-4">Nenhum cálculo de crédito fiscal salvo ainda.</p>
              <Button onClick={handleCreateNewCalculation} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Cálculo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
