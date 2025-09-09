"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Download,
  FileText,
  ImageIcon,
  Calendar,
  Calculator,
  CreditCard,
  TrendingUp,
  Paperclip,
  Plus,
  Eye,
  Trash2,
  Upload,
  Save,
  History,
  ChevronDown,
} from "lucide-react"
import type { Ativo } from "@/types/ativo"
import QRCode from "qrcode"
import { CalculoDepreciacao } from "./calculo-depreciacao"
import { AgendaManutencao } from "./agenda-manutencao"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { exportarDetalhesAtivoPDF } from "@/utils/custom-pdf-export"
import type { DepreciacaoCalculada } from "@/types/depreciacao"
import type { CreditoCalculado } from "@/types/credito"
import { formatarMoeda } from "@/utils/export-utils"

import { CalculoCreditoFiscal } from "./calculo-credito-fiscal"

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

interface CalculoMensal {
  mes: string
  valor: number
}

interface ApuracaoMensalSalva {
  id: string
  ativoId: string
  tipoImposto: string
  meses: number
  dataSalvamento: string
  calculosMensais: CalculoMensal[]
}

interface DetalhesAtivoProps {
  ativo: Ativo
}

interface AnexoAtivo {
  id: string
  ativoId: string
  assunto: string
  data: string
  descricao: string
  nomeArquivo: string
  tipoArquivo: string
  tamanhoArquivo: number
  conteudoArquivo: string // Base64
  dataUpload: string
}

export function DetalhesAtivo({ ativo }: DetalhesAtivoProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [anexos, setAnexos] = useState<AnexoAtivo[]>([])
  const [depreciacoesSalvas, setDepreciacoesSalvas] = useState<DepreciacaoCalculada[]>([])
  const [creditosSalvos, setCreditosSalvos] = useState<CreditoCalculado[]>([])
  const [apuracoesMensaisSalvas, setApuracoesMensaisSalvas] = useState<ApuracaoMensalSalva[]>([])
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [contasDepreciacao, setContasDepreciacao] = useState<any[]>([])
  const [contasCreditoFiscal, setContasCreditoFiscal] = useState<any[]>([])

  const [dialogAnexoAberto, setDialogAnexoAberto] = useState(false)
  const [formAnexo, setFormAnexo] = useState({
    assunto: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    arquivo: null as File | null,
  })

  // Load anexos from localStorage
  useEffect(() => {
    const anexosSalvos = localStorage.getItem("anexos-ativos")
    if (anexosSalvos) {
      const todosAnexos = JSON.parse(anexosSalvos)
      const anexosDoAtivo = todosAnexos.filter((a: AnexoAtivo) => a.ativoId === ativo.id)
      setAnexos(anexosDoAtivo)
    }
  }, [ativo.id])

  // Load saved depreciation calculations from localStorage
  useEffect(() => {
    const depreciacoesSalvasData = localStorage.getItem("depreciacoes-salvas")
    if (depreciacoesSalvasData) {
      const allDepreciacoes = JSON.parse(depreciacoesSalvasData)
      const depreciacoesDoAtivo = allDepreciacoes.filter((d: DepreciacaoCalculada) => d.ativo.id === ativo.id)
      setDepreciacoesSalvas(depreciacoesDoAtivo)
    }
  }, [ativo.id])

  // Load saved credit calculations from localStorage
  useEffect(() => {
    const creditosSalvosData = localStorage.getItem("calculos-creditos-salvos")
    if (creditosSalvosData) {
      const allCreditos = JSON.parse(creditosSalvosData)
      const creditosDoAtivo = allCreditos.filter((c: CreditoCalculado) => c.ativo.id === ativo.id)
      setCreditosSalvos(creditosDoAtivo)
    }
  }, [ativo.id])

  // Load saved monthly credit calculations from localStorage
  useEffect(() => {
    const apuracoesMensaisData = localStorage.getItem("apuracoes-mensais-salvas")
    if (apuracoesMensaisData) {
      const allApuracoes = JSON.parse(apuracoesMensaisData)
      const apuracoesDoAtivo = allApuracoes.filter((a: ApuracaoMensalSalva) => a.ativoId === ativo.id)
      setApuracoesMensaisSalvas(apuracoesDoAtivo)
    }
  }, [ativo.id])

  // Load maintenance records from localStorage
  useEffect(() => {
    const manutencoesArmazenadas = localStorage.getItem(`manutencoes-${ativo.id}`)
    if (manutencoesArmazenadas) {
      setManutencoes(JSON.parse(manutencoesArmazenadas))
    }
  }, [ativo.id])

  // Load contas depreciacao from localStorage
  useEffect(() => {
    const contasDepreciacaoData = localStorage.getItem("contas-depreciacao")
    if (contasDepreciacaoData) {
      const contas = JSON.parse(contasDepreciacaoData)
      setContasDepreciacao(contas.filter((c: any) => c.ativo))
    }
  }, [])

  // Load contas credito fiscal from localStorage
  useEffect(() => {
    const contasCreditoFiscalData = localStorage.getItem("contas-credito-fiscal")
    if (contasCreditoFiscalData) {
      const contas = JSON.parse(contasCreditoFiscalData)
      setContasCreditoFiscal(contas || [])
    }
  }, [])

  // Salvar anexos no localStorage
  const salvarAnexos = (novosAnexos: AnexoAtivo[]) => {
    const anexosSalvos = localStorage.getItem("anexos-ativos")
    let todosAnexos: AnexoAtivo[] = []

    if (anexosSalvos) {
      todosAnexos = JSON.parse(anexosSalvos)
    }

    // Remove anexos antigos do ativo e adiciona os novos
    const anexosOutrosAtivos = todosAnexos.filter((a) => a.ativoId !== ativo.id)
    const anexosAtualizados = [...anexosOutrosAtivos, ...novosAnexos]

    localStorage.setItem("anexos-ativos", JSON.stringify(anexosAtualizados))
    setAnexos(novosAnexos)
  }

  useEffect(() => {
    if (qrCodeRef.current) {
      const dadosQR = JSON.stringify({
        id: ativo.id,
        codigo: ativo.codigo,
        nome: ativo.nome,
        dataAquisicao: ativo.dataAquisicao,
        valorTotal: ativo.valorTotal,
        valorMercado: ativo.valorMercado,
      })

      QRCode.toCanvas(qrCodeRef.current, dadosQR, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [ativo])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatarTamanhoArquivo = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const baixarQRCode = () => {
    if (qrCodeRef.current) {
      const link = document.createElement("a")
      link.download = `qrcode-${ativo.codigo}.png`
      link.href = qrCodeRef.current.toDataURL()
      link.click()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormAnexo({ ...formAnexo, arquivo: file })
    }
  }

  const resetFormularioAnexo = () => {
    setFormAnexo({
      assunto: "",
      data: new Date().toISOString().split("T")[0],
      descricao: "",
      arquivo: null,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const salvarAnexo = async () => {
    if (!formAnexo.assunto || !formAnexo.data || !formAnexo.arquivo) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    try {
      // Converter arquivo para base64
      const reader = new FileReader()
      reader.onload = () => {
        const novoAnexo: AnexoAtivo = {
          id: Date.now().toString(),
          ativoId: ativo.id,
          assunto: formAnexo.assunto,
          data: formAnexo.data,
          descricao: formAnexo.descricao,
          nomeArquivo: formAnexo.arquivo!.name,
          tipoArquivo: formAnexo.arquivo!.type,
          tamanhoArquivo: formAnexo.arquivo!.size,
          conteudoArquivo: reader.result as string,
          dataUpload: new Date().toISOString(),
        }

        const novosAnexos = [...anexos, novoAnexo]
        salvarAnexos(novosAnexos)
        setDialogAnexoAberto(false)
        resetFormularioAnexo()
      }

      reader.readAsDataURL(formAnexo.arquivo)
    } catch (error) {
      console.error("Erro ao salvar anexo:", error)
      alert("Erro ao salvar anexo")
    }
  }

  const baixarAnexo = (anexo: AnexoAtivo) => {
    const link = document.createElement("a")
    link.href = anexo.conteudoArquivo
    link.download = anexo.nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const excluirAnexo = (anexoId: string) => {
    if (confirm("Tem certeza que deseja excluir este anexo?")) {
      const novosAnexos = anexos.filter((a) => a.id !== anexoId)
      salvarAnexos(novosAnexos)
    }
  }

  // Funções de exclusão de cálculos de crédito
  const handleDeleteCalculo = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cálculo salvo?")) {
      const updatedCalculos = creditosSalvos.filter((calc) => calc.id !== id)
      setCreditosSalvos(updatedCalculos)
      // Update localStorage for all saved calculations, not just for this asset
      const allCalculosSalvos = JSON.parse(
        localStorage.getItem("calculos-creditos-salvos") || "[]",
      ) as CreditoCalculado[]
      const filteredAllCalculos = allCalculosSalvos.filter((calc) => calc.id !== id)
      localStorage.setItem("calculos-creditos-salvos", JSON.stringify(filteredAllCalculos))
    }
  }

  const handleDeleteApuracaoMensal = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta apuração mensal salva?")) {
      const updatedApuracoes = apuracoesMensaisSalvas.filter((apuracao) => apuracao.id !== id)
      setApuracoesMensaisSalvas(updatedApuracoes)
      // Update localStorage for all saved monthly calculations
      const allApuracoesMensaisSalvas = JSON.parse(
        localStorage.getItem("apuracoes-mensais-salvas") || "[]",
      ) as ApuracaoMensalSalva[]
      const filteredAllApuracoes = allApuracoesMensaisSalvas.filter((apuracao) => apuracao.id !== id)
      localStorage.setItem("apuracoes-mensais-salvas", JSON.stringify(filteredAllApuracoes))
    }
  }

  const handleSaveCredito = (data: CreditoCalculado) => {
    setCreditosSalvos((prev) => {
      const updated = [...prev, data]
      localStorage.setItem("calculos-creditos-salvos", JSON.stringify(updated))
      return updated
    })
  }

  const temReavaliacao = ativo.valorMercado && ativo.valorMercado !== ativo.valorTotal
  const variacaoPercentual = temReavaliacao ? ((ativo.valorMercado! - ativo.valorTotal) / ativo.valorTotal) * 100 : 0

  const handleExportDetalhesAtivoPDF = async () => {
    if (qrCodeRef.current) {
      const ativoWithQR = { ...ativo, qrCodeDataUrl: qrCodeRef.current.toDataURL() }
      await exportarDetalhesAtivoPDF(ativoWithQR, anexos, depreciacoesSalvas, creditosSalvos, manutencoes)
    } else {
      await exportarDetalhesAtivoPDF(ativo, anexos, depreciacoesSalvas, creditosSalvos, manutencoes)
    }
  }

  return (
    <Tabs defaultValue="detalhes" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
        <TabsTrigger value="anexos" className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Anexos
        </TabsTrigger>
        <TabsTrigger value="depreciacao" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Depreciação
        </TabsTrigger>
        <TabsTrigger value="credito-fiscal" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Crédito Fiscal
        </TabsTrigger>
        <TabsTrigger value="manutencao" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Manutenção
        </TabsTrigger>
      </TabsList>

      <TabsContent value="detalhes" className="space-y-6 mt-6">
        <Card className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold">Relatório Completo do Ativo</h3>
          <Button onClick={handleExportDetalhesAtivoPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF Completo
          </Button>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-semibold">Código:</span>
                <Badge variant="outline" className="ml-2">
                  {ativo.codigo}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">Nome:</span>
                <p className="mt-1">{ativo.nome}</p>
              </div>
              <div>
                <span className="font-semibold">Descrição:</span>
                <p className="mt-1 text-muted-foreground">{ativo.descricao || "Não informado"}</p>
              </div>
              <div>
                <span className="font-semibold">Data de Aquisição:</span>
                <p className="mt-1">{formatarData(ativo.dataAquisicao)}</p>
              </div>
              <div>
                <span className="font-semibold">Nota Fiscal:</span>
                <p className="mt-1">{ativo.notaFiscal || "Não informado"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Valores
                {temReavaliacao && <TrendingUp className="h-4 w-4 text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-blue-800">Valor Fiscal (Nota Fiscal):</span>
                    <p className="text-xl font-bold text-blue-900">{formatarMoeda(ativo.valorTotal)}</p>
                    <p className="text-xs text-blue-600">Base para cálculos fiscais</p>
                  </div>
                </div>
              </div>

              {temReavaliacao ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-green-800">Valor de Mercado Atual:</span>
                      <p className="text-xl font-bold text-green-900">{formatarMoeda(ativo.valorMercado!)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={variacaoPercentual >= 0 ? "default" : "destructive"} className="text-xs">
                          {variacaoPercentual >= 0 ? "+" : ""}
                          {variacaoPercentual.toFixed(2)}%
                        </Badge>
                        <span className="text-xs text-green-600">
                          Reavaliado em {formatarData(ativo.dataUltimaReavaliacao!)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Valor de Mercado:</span>
                  <p className="text-lg font-semibold text-gray-800">{formatarMoeda(ativo.valorTotal)}</p>
                  <p className="text-xs text-gray-500">Igual ao valor fiscal (não reavaliado)</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">IPI:</span>
                  <p>{formatarMoeda(ativo.valorIPI)}</p>
                </div>
                <div>
                  <span className="font-semibold">PIS:</span>
                  <p>{formatarMoeda(ativo.valorPIS)}</p>
                </div>
                <div>
                  <span className="font-semibold">COFINS:</span>
                  <p>{formatarMoeda(ativo.valorCOFINS)}</p>
                </div>
                <div>
                  <span className="font-semibold">ICMS:</span>
                  <p>{formatarMoeda(ativo.valorICMS)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Anexo Original
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ativo.anexo ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Anexo disponível</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Anexo
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum anexo</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Foto do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ativo.foto ? (
                <img
                  src={ativo.foto || "/placeholder.svg"}
                  alt={ativo.nome}
                  className="w-full h-32 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Sem foto</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <canvas ref={qrCodeRef} className="border rounded-md" />
              <Button onClick={baixarQRCode} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {ativo.dataAtualizacao && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Última atualização: {formatarData(ativo.dataAtualizacao)}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="anexos" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Gerenciar Anexos
                </CardTitle>
                <p className="text-sm text-muted-foreground">Adicione documentos e arquivos relacionados ao ativo</p>
              </div>
              <Dialog open={dialogAnexoAberto} onOpenChange={setDialogAnexoAberto}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Anexo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" aria-describedby="dialog-anexo-description">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Anexo</DialogTitle>
                    <DialogDescription id="dialog-anexo-description">
                      Adicione documentos e arquivos relacionados ao ativo selecionado.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="assunto">Assunto *</Label>
                        <Input
                          id="assunto"
                          value={formAnexo.assunto}
                          onChange={(e) => setFormAnexo({ ...formAnexo, assunto: e.target.value })}
                          placeholder="Ex: Nota Fiscal, Manual, Garantia..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="data">Data *</Label>
                        <Input
                          id="data"
                          type="date"
                          value={formAnexo.data}
                          onChange={(e) => setFormAnexo({ ...formAnexo, data: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formAnexo.descricao}
                        onChange={(e) => setFormAnexo({ ...formAnexo, descricao: e.target.value })}
                        placeholder="Descreva o conteúdo do anexo..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="arquivo">Arquivo *</Label>
                      <div className="mt-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="arquivo"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formAnexo.arquivo ? formAnexo.arquivo.name : "Selecionar Arquivo"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLSX, XLS
                        </p>
                      </div>
                    </div>

                    {formAnexo.arquivo && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{formAnexo.arquivo.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatarTamanhoArquivo(formAnexo.arquivo.size)} • {formAnexo.arquivo.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogAnexoAberto(false)
                        resetFormularioAnexo()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={salvarAnexo}>Salvar Anexo</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {anexos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum anexo adicionado ainda</p>
                <p className="text-sm">Clique em "Novo Anexo" para adicionar documentos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Upload</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anexos.map((anexo) => (
                      <TableRow key={anexo.id}>
                        <TableCell className="font-medium">{anexo.assunto}</TableCell>
                        <TableCell>{formatarData(anexo.data)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{anexo.nomeArquivo}</p>
                              {anexo.descricao && <p className="text-xs text-muted-foreground">{anexo.descricao}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatarTamanhoArquivo(anexo.tamanhoArquivo)}</TableCell>
                        <TableCell>{formatarData(anexo.dataUpload)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl" aria-describedby="dialog-detalhes-description">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Anexo</DialogTitle>
                                  <DialogDescription id="dialog-detalhes-description">
                                    Visualize as informações completas do anexo selecionado.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Assunto:</Label>
                                      <p className="font-medium">{anexo.assunto}</p>
                                    </div>
                                    <div>
                                      <Label>Data:</Label>
                                      <p>{formatarData(anexo.data)}</p>
                                    </div>
                                    <div>
                                      <Label>Nome do Arquivo:</Label>
                                      <p>{anexo.nomeArquivo}</p>
                                    </div>
                                    <div>
                                      <Label>Tamanho:</Label>
                                      <p>{formatarTamanhoArquivo(anexo.tamanhoArquivo)}</p>
                                    </div>
                                    <div>
                                      <Label>Tipo:</Label>
                                      <p>{anexo.tipoArquivo}</p>
                                    </div>
                                    <div>
                                      <Label>Data de Upload:</Label>
                                      <p>{formatarData(anexo.dataUpload)}</p>
                                    </div>
                                  </div>
                                  {anexo.descricao && (
                                    <div>
                                      <Label>Descrição:</Label>
                                      <p>{anexo.descricao}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button variant="ghost" size="sm" onClick={() => baixarAnexo(anexo)}>
                              <Download className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirAnexo(anexo.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <TabsContent value="depreciacao" className="mt-6">
        <CalculoDepreciacao ativo={ativo} contasDepreciacao={contasDepreciacao} />
      </TabsContent>

      <TabsContent value="credito-fiscal" className="mt-6 space-y-6">
        <CalculoCreditoFiscal
          ativo={ativo}
          onSaveCredito={handleSaveCredito}
          contasCreditoFiscal={contasCreditoFiscal}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Cálculos de Crédito Fiscal Salvos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os cálculos de créditos fiscais salvos para este ativo.
            </p>
          </CardHeader>
          <CardContent>
            {creditosSalvos.length > 0 ? (
              <div className="space-y-3">
                {creditosSalvos.map((item) => (
                  <div key={item.id} className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">
                        {item.ativo?.codigo} - {item.ativo?.nome || "N/A - Ativo Removido"}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatarData(item.dataSalvamento)}</span>
                    </div>
                    <p className="font-semibold text-gray-900">Total Créditos: {formatarMoeda(item.resultado.total)}</p>
                    <p className="font-semibold text-gray-900">
                      Valor para Base de Depreciação: {formatarMoeda(item.valorParaDepreciacao)}
                    </p>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-600">
                      <span>IPI: {formatarMoeda(item.resultado.ipi)}</span>
                      <span>PIS: {formatarMoeda(item.resultado.pis)}</span>
                      <span>COFINS: {formatarMoeda(item.resultado.cofins)}</span>
                      <span>ICMS: {formatarMoeda(item.resultado.icms)}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCalculo(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Save className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum cálculo de crédito fiscal salvo para este ativo ainda.</p>
                <p className="text-sm">Realize um cálculo na seção acima e salve para visualizar aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Detalhes dos Créditos Fiscais Salvos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize os detalhes de IPI, ICMS, PIS e COFINS para cada cálculo de crédito fiscal salvo.
            </p>
          </CardHeader>
          <CardContent>
            {creditosSalvos.length > 0 ? (
              <div className="space-y-3">
                {creditosSalvos.map((item) => (
                  <Collapsible key={item.id} className="border-b last:border-b-0 py-2">
                    <CollapsibleTrigger asChild>
                      <div className="flex justify-between items-center cursor-pointer">
                        <p className="font-medium">
                          {item.ativo?.codigo} - {item.ativo?.nome || "N/A - Ativo Removido"} (Total:{" "}
                          {formatarMoeda(item.resultado.total)})
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Salvo em: {formatarData(item.dataSalvamento)}</span>
                          <Button variant="ghost" size="sm" className="p-0 h-auto data-[state=open]:rotate-180">
                            <ChevronDown className="h-4 w-4 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCalculo(item.id)
                            }}
                            className="text-destructive hover:text-destructive p-0 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pl-4 pr-2">
                      <h4 className="font-semibold text-sm mb-2">Valores por Imposto:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Imposto</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>IPI</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.resultado.ipi)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>ICMS</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.resultado.icms)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>PIS</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.resultado.pis)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>COFINS</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.resultado.cofins)}</TableCell>
                          </TableRow>
                          <TableRow className="font-bold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">{formatarMoeda(item.resultado.total)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <p className="text-sm text-muted-foreground mt-2">
                        Valor para Base de Depreciação: {formatarMoeda(item.valorParaDepreciacao)}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum cálculo de crédito fiscal salvo para este ativo ainda.</p>
                <p className="text-sm">Os detalhes dos cálculos salvos aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manutencao" className="mt-6">
        <AgendaManutencao ativo={ativo} />
      </TabsContent>
    </Tabs>
  )
}
