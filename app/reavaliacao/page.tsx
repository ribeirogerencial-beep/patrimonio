"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  Upload,
  X,
  Paperclip,
} from "lucide-react"
import type { Ativo } from "@/types/ativo"

interface Reavaliacao {
  id: string
  ativoId: string
  valorFiscalOriginal: number
  valorMercadoAnterior: number
  valorMercadoNovo: number
  dataReavaliacao: string
  motivo: string
  responsavel: string
  observacoes?: string
  metodologia: "mercado" | "custo" | "renda" | "comparativo"
  aprovado: boolean
  dataAprovacao?: string
  aprovadoPor?: string
  documentoAnexo?: string
  nomeDocumento?: string
}

const METODOLOGIAS = {
  mercado: "Valor de Mercado",
  custo: "Custo de Reposição",
  renda: "Fluxo de Renda",
  comparativo: "Método Comparativo",
}

const MOTIVOS_REAVALIACAO = [
  "Reavaliação anual obrigatória",
  "Mudança significativa no mercado",
  "Melhoria/Deterioração do ativo",
  "Auditoria externa",
  "Preparação para venda",
  "Adequação contábil",
  "Outros",
]

export default function ReavaliacaoPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [reavaliacoes, setReavaliacoes] = useState<Reavaliacao[]>([])
  const [ativoSelecionado, setAtivoSelecionado] = useState<string>("")
  const [filtro, setFiltro] = useState("")
  const [dialogAberto, setDialogAberto] = useState(false)
  const [reavaliacao, setReavaliacao] = useState<Reavaliacao | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [documentoAnexo, setDocumentoAnexo] = useState<File | null>(null)
  const [documentoPreview, setDocumentoPreview] = useState("")
  const [nomeDocumento, setNomeDocumento] = useState("")
  const [carregando, setCarregando] = useState(true)

  const documentoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    valorMercadoNovo: 0,
    motivo: "",
    responsavel: "",
    observacoes: "",
    metodologia: "mercado" as const,
  })

  useEffect(() => {
    const carregarDados = () => {
      try {
        // Carregar ativos do localStorage
        const ativosData = localStorage.getItem("ativos-imobilizados")
        if (ativosData) {
          const ativosCarregados = JSON.parse(ativosData)
          setAtivos(Array.isArray(ativosCarregados) ? ativosCarregados : [])
        } else {
          setAtivos([])
        }

        // Carregar reavaliações do localStorage
        const reavaliacoesData = localStorage.getItem("reavaliacoes-ativos")
        if (reavaliacoesData) {
          const reavaliacoesCarregadas = JSON.parse(reavaliacoesData)
          setReavaliacoes(Array.isArray(reavaliacoesCarregadas) ? reavaliacoesCarregadas : [])
        } else {
          setReavaliacoes([])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setAtivos([])
        setReavaliacoes([])
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  const salvarReavaliacoes = (novasReavaliacoes: Reavaliacao[]) => {
    setReavaliacoes(novasReavaliacoes)
    localStorage.setItem("reavaliacoes-ativos", JSON.stringify(novasReavaliacoes))
  }

  const handleDocumentoChange = (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setDocumentoAnexo(file)
      setDocumentoPreview(result)
      setNomeDocumento(file.name)
    }
    reader.readAsDataURL(file)
  }

  const removerDocumento = () => {
    setDocumentoAnexo(null)
    setDocumentoPreview("")
    setNomeDocumento("")
    if (documentoInputRef.current) documentoInputRef.current.value = ""
  }

  const resetarFormulario = () => {
    setFormData({
      valorMercadoNovo: 0,
      motivo: "",
      responsavel: "",
      observacoes: "",
      metodologia: "mercado",
    })
    setReavaliacao(null)
    setModoEdicao(false)
    setDocumentoAnexo(null)
    setDocumentoPreview("")
    setNomeDocumento("")
    if (documentoInputRef.current) documentoInputRef.current.value = ""
  }

  const abrirDialogNova = () => {
    resetarFormulario()
    setAtivoSelecionado("")
    setDialogAberto(true)
  }

  const abrirDialogEdicao = (reavaliacao: Reavaliacao) => {
    setFormData({
      valorMercadoNovo: reavaliacao.valorMercadoNovo,
      motivo: reavaliacao.motivo,
      responsavel: reavaliacao.responsavel,
      observacoes: reavaliacao.observacoes || "",
      metodologia: reavaliacao.metodologia,
    })
    setAtivoSelecionado(reavaliacao.ativoId)
    setReavaliacao(reavaliacao)
    setModoEdicao(true)
    setDocumentoPreview(reavaliacao.documentoAnexo || "")
    setNomeDocumento(reavaliacao.nomeDocumento || "")
    setDialogAberto(true)
  }

  const salvarReavaliacao = () => {
    if (!ativoSelecionado || !formData.valorMercadoNovo || !formData.motivo || !formData.responsavel) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    const ativo = ativos.find((a) => a.id === ativoSelecionado)
    if (!ativo) return

    const valorMercadoAtual = ativo.valorMercado || ativo.valorTotal

    const novaReavaliacao: Reavaliacao = {
      id: reavaliacao?.id || Date.now().toString(),
      ativoId: ativoSelecionado,
      valorFiscalOriginal: ativo.valorTotal,
      valorMercadoAnterior: reavaliacao?.valorMercadoAnterior || valorMercadoAtual,
      valorMercadoNovo: formData.valorMercadoNovo,
      dataReavaliacao: new Date().toISOString(),
      motivo: formData.motivo,
      responsavel: formData.responsavel,
      observacoes: formData.observacoes,
      metodologia: formData.metodologia,
      aprovado: false,
      documentoAnexo: documentoPreview,
      nomeDocumento: nomeDocumento,
    }

    let novasReavaliacoes: Reavaliacao[]
    if (modoEdicao && reavaliacao) {
      novasReavaliacoes = reavaliacoes.map((r) => (r.id === reavaliacao.id ? novaReavaliacao : r))
    } else {
      novasReavaliacoes = [...reavaliacoes, novaReavaliacao]
    }

    salvarReavaliacoes(novasReavaliacoes)
    setDialogAberto(false)
    resetarFormulario()
  }

  const aprovarReavaliacao = (id: string) => {
    const novasReavaliacoes = reavaliacoes.map((r) =>
      r.id === id
        ? {
            ...r,
            aprovado: true,
            dataAprovacao: new Date().toISOString(),
            aprovadoPor: "Sistema",
          }
        : r,
    )
    salvarReavaliacoes(novasReavaliacoes)

    const reavaliacao = reavaliacoes.find((r) => r.id === id)
    if (reavaliacao) {
      const novosAtivos = ativos.map((ativo) =>
        ativo.id === reavaliacao.ativoId
          ? {
              ...ativo,
              valorMercado: reavaliacao.valorMercadoNovo,
              dataUltimaReavaliacao: new Date().toISOString(),
              dataAtualizacao: new Date().toISOString(),
            }
          : ativo,
      )
      setAtivos(novosAtivos)
      localStorage.setItem("ativos-imobilizados", JSON.stringify(novosAtivos))
    }
  }

  const excluirReavaliacao = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reavaliação?")) return

    const novasReavaliacoes = reavaliacoes.filter((r) => r.id !== id)
    salvarReavaliacoes(novasReavaliacoes)
  }

  const reavaliacoesFiltradas = reavaliacoes.filter((reavaliacao) => {
    const ativo = ativos.find((a) => a.id === reavaliacao.ativoId)
    if (!ativo) return false

    return (
      ativo.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      ativo.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      reavaliacao.responsavel.toLowerCase().includes(filtro.toLowerCase())
    )
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const calcularVariacao = (valorAnterior: number, valorNovo: number) => {
    if (valorAnterior === 0) return 0
    const variacao = ((valorNovo - valorAnterior) / valorAnterior) * 100
    return variacao
  }

  const ativo = ativos.find((a) => a.id === ativoSelecionado)

  // Calcular métricas APENAS baseadas nos dados reais do localStorage
  const totalReavaliacoes = reavaliacoes.length
  const reavaliacoesPendentes = reavaliacoes.filter((r) => !r.aprovado).length
  const reavaliacoesAprovadas = reavaliacoes.filter((r) => r.aprovado).length
  const impactoTotal = reavaliacoes
    .filter((r) => r.aprovado)
    .reduce((acc, r) => acc + (r.valorMercadoNovo - r.valorMercadoAnterior), 0)

  if (carregando) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Reavaliação de Ativos</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Reavaliação de Ativos</h1>
          <p className="text-muted-foreground">Gerencie o valor de mercado sem alterar valores fiscais originais</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> As reavaliações atualizam apenas o <strong>valor de mercado</strong> dos ativos.
          Os <strong>valores fiscais originais</strong> da nota fiscal são preservados para cálculos de depreciação e
          créditos fiscais.
        </AlertDescription>
      </Alert>

      {/* Cards de Resumo - APENAS dados reais do localStorage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reavaliações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReavaliacoes}</div>
            <p className="text-xs text-muted-foreground">
              {totalReavaliacoes === 0
                ? "Nenhuma registrada"
                : `Registrada${totalReavaliacoes > 1 ? "s" : ""} no sistema`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reavaliacoesPendentes > 0 ? "text-orange-600" : "text-gray-500"}`}>
              {reavaliacoesPendentes}
            </div>
            <p className="text-xs text-muted-foreground">
              {reavaliacoesPendentes === 0 ? "Nenhuma pendente" : `Aguardando aprovação`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reavaliacoesAprovadas > 0 ? "text-green-600" : "text-gray-500"}`}>
              {reavaliacoesAprovadas}
            </div>
            <p className="text-xs text-muted-foreground">
              {reavaliacoesAprovadas === 0 ? "Nenhuma aprovada" : `Já aplicada${reavaliacoesAprovadas > 1 ? "s" : ""}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto no Valor de Mercado</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                impactoTotal > 0 ? "text-green-600" : impactoTotal < 0 ? "text-red-600" : "text-gray-500"
              }`}
            >
              {formatarMoeda(impactoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {impactoTotal === 0 ? "Sem variação" : `Variação ${impactoTotal > 0 ? "positiva" : "negativa"}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Reavaliações de Ativos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Atualize o valor de mercado mantendo os valores fiscais originais
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button onClick={abrirDialogNova} disabled={ativos.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reavaliação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{modoEdicao ? "Editar Reavaliação" : "Nova Reavaliação"}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ativo">Ativo *</Label>
                      <Select value={ativoSelecionado} onValueChange={setAtivoSelecionado} disabled={modoEdicao}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ativo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ativos.map((ativo) => (
                            <SelectItem key={ativo.id} value={ativo.id}>
                              {ativo.codigo} - {ativo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {ativo && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-800">Valor Fiscal Original:</span>
                              <p className="text-lg font-bold text-blue-900">{formatarMoeda(ativo.valorTotal)}</p>
                              <p className="text-xs text-blue-600">Nota Fiscal (não alterado)</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-800">Valor de Mercado Atual:</span>
                              <p className="text-lg font-bold text-green-900">
                                {formatarMoeda(ativo.valorMercado || ativo.valorTotal)}
                              </p>
                              <p className="text-xs text-green-600">
                                {ativo.valorMercado ? "Reavaliado" : "Igual ao fiscal"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Data Aquisição:</span>
                              <p>{formatarData(ativo.dataAquisicao)}</p>
                              {ativo.dataUltimaReavaliacao && (
                                <p className="text-xs text-muted-foreground">
                                  Última reavaliação: {formatarData(ativo.dataUltimaReavaliacao)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valorMercadoNovo">Novo Valor de Mercado *</Label>
                        <Input
                          id="valorMercadoNovo"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.valorMercadoNovo}
                          onChange={(e) =>
                            setFormData({ ...formData, valorMercadoNovo: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0,00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="metodologia">Metodologia *</Label>
                        <Select
                          value={formData.metodologia}
                          onValueChange={(value: "mercado" | "custo" | "renda" | "comparativo") =>
                            setFormData({ ...formData, metodologia: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(METODOLOGIAS).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="motivo">Motivo da Reavaliação *</Label>
                      <Select
                        value={formData.motivo}
                        onValueChange={(value) => setFormData({ ...formData, motivo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOTIVOS_REAVALIACAO.map((motivo) => (
                            <SelectItem key={motivo} value={motivo}>
                              {motivo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="responsavel">Responsável *</Label>
                      <Input
                        id="responsavel"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        placeholder="Nome do responsável pela reavaliação"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Observações adicionais sobre a reavaliação..."
                        rows={3}
                      />
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Documento Comprobatório</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Anexe documentos que comprovem a reavaliação (laudos, avaliações, etc.)
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => documentoInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar Documento
                            </Button>
                            {documentoPreview && (
                              <Button type="button" variant="ghost" size="sm" onClick={removerDocumento}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <input
                            ref={documentoInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => handleDocumentoChange(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          {nomeDocumento && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                              <Paperclip className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{nomeDocumento}</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Formatos aceitos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (máx. 10MB)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {ativo && formData.valorMercadoNovo > 0 && (
                      <Card className="bg-gray-50">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Valor Mercado Anterior:</span>
                              <p>{formatarMoeda(ativo.valorMercado || ativo.valorTotal)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Novo Valor Mercado:</span>
                              <p>{formatarMoeda(formData.valorMercadoNovo)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Variação:</span>
                              <p
                                className={
                                  calcularVariacao(ativo.valorMercado || ativo.valorTotal, formData.valorMercadoNovo) >=
                                  0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {calcularVariacao(
                                  ativo.valorMercado || ativo.valorTotal,
                                  formData.valorMercadoNovo,
                                ).toFixed(2)}
                                %
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Importante:</strong> O valor fiscal original ({formatarMoeda(ativo.valorTotal)})
                              será mantido para cálculos de depreciação e créditos fiscais.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={() => setDialogAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={salvarReavaliacao}>{modoEdicao ? "Atualizar" : "Salvar"} Reavaliação</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ativo, código ou responsável..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {ativos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Nenhum ativo cadastrado no sistema</h3>
              <p className="text-sm mb-4">Cadastre ativos primeiro para poder criar reavaliações</p>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                Ir para Dashboard
              </Button>
            </div>
          ) : reavaliacoesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">
                {reavaliacoes.length === 0 ? "Nenhuma reavaliação cadastrada" : "Nenhuma reavaliação encontrada"}
              </h3>
              <p className="text-sm mb-4">
                {reavaliacoes.length === 0
                  ? "Clique em 'Nova Reavaliação' para começar"
                  : "Tente ajustar os filtros de busca"}
              </p>
              {reavaliacoes.length === 0 && (
                <Button onClick={abrirDialogNova}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reavaliação
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Valor Fiscal</TableHead>
                    <TableHead>Novo Valor Mercado</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reavaliacoesFiltradas.map((reavaliacao) => {
                    const ativo = ativos.find((a) => a.id === reavaliacao.ativoId)
                    const variacao = calcularVariacao(reavaliacao.valorMercadoAnterior, reavaliacao.valorMercadoNovo)

                    return (
                      <TableRow key={reavaliacao.id}>
                        <TableCell className="font-medium">
                          {ativo ? `${ativo.codigo} - ${ativo.nome}` : "Ativo não encontrado"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{formatarMoeda(reavaliacao.valorFiscalOriginal)}</div>
                            <div className="text-xs text-muted-foreground">Nota Fiscal</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatarMoeda(reavaliacao.valorMercadoNovo)}</TableCell>
                        <TableCell>
                          <Badge variant={variacao >= 0 ? "default" : "destructive"}>
                            {variacao >= 0 ? "+" : ""}
                            {variacao.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{formatarData(reavaliacao.dataReavaliacao)}</TableCell>
                        <TableCell>
                          {reavaliacao.aprovado ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Reavaliação</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Ativo:</Label>
                                      <p className="font-medium">
                                        {ativo ? `${ativo.codigo} - ${ativo.nome}` : "Ativo não encontrado"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Data:</Label>
                                      <p>{formatarData(reavaliacao.dataReavaliacao)}</p>
                                    </div>
                                    <div>
                                      <Label>Valor Fiscal Original:</Label>
                                      <p className="font-medium text-blue-600">
                                        {formatarMoeda(reavaliacao.valorFiscalOriginal)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Valor Mercado Anterior:</Label>
                                      <p className="font-medium">{formatarMoeda(reavaliacao.valorMercadoAnterior)}</p>
                                    </div>
                                    <div>
                                      <Label>Novo Valor Mercado:</Label>
                                      <p className="font-medium text-green-600">
                                        {formatarMoeda(reavaliacao.valorMercadoNovo)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Metodologia:</Label>
                                      <p>{METODOLOGIAS[reavaliacao.metodologia]}</p>
                                    </div>
                                    <div>
                                      <Label>Responsável:</Label>
                                      <p>{reavaliacao.responsavel}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Motivo:</Label>
                                    <p>{reavaliacao.motivo}</p>
                                  </div>
                                  {reavaliacao.observacoes && (
                                    <div>
                                      <Label>Observações:</Label>
                                      <p>{reavaliacao.observacoes}</p>
                                    </div>
                                  )}
                                  {reavaliacao.documentoAnexo && (
                                    <div>
                                      <Label>Documento Anexado:</Label>
                                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                                        <Paperclip className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                          {reavaliacao.nomeDocumento || "Documento anexado"}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            if (reavaliacao.documentoAnexo) {
                                              const link = document.createElement("a")
                                              link.href = reavaliacao.documentoAnexo
                                              link.download = reavaliacao.nomeDocumento || "documento"
                                              link.click()
                                            }
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                      <strong>Importante:</strong> Esta reavaliação afeta apenas o valor de mercado. O
                                      valor fiscal original de {formatarMoeda(reavaliacao.valorFiscalOriginal)} é
                                      mantido para cálculos de depreciação e créditos fiscais.
                                    </AlertDescription>
                                  </Alert>
                                  {reavaliacao.aprovado && (
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-green-800">
                                        <CheckCircle className="h-4 w-4 inline mr-2" />
                                        Aprovado em {formatarData(reavaliacao.dataAprovacao!)} por{" "}
                                        {reavaliacao.aprovadoPor}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {!reavaliacao.aprovado && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => abrirDialogEdicao(reavaliacao)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => aprovarReavaliacao(reavaliacao.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirReavaliacao(reavaliacao.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
