"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Upload,
  X,
  FileText,
} from "lucide-react"
import type { Ativo } from "@/types/ativo"

// Importar as novas funções
import { exportarManutencaoPDF } from "@/utils/manutencao-export"
// import { ExportButtons } from "./export-buttons" // Removido pois será substituído por um botão direto

interface AgendaManutencaoProps {
  ativo: Ativo
}

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

const TIPOS_MANUTENCAO = {
  preventiva: { nome: "Preventiva", cor: "bg-blue-500", icon: Calendar },
  corretiva: { nome: "Corretiva", cor: "bg-red-500", icon: AlertTriangle },
  preditiva: { nome: "Preditiva", cor: "bg-green-500", icon: CheckCircle },
}

const STATUS_MANUTENCAO = {
  agendada: { nome: "Agendada", cor: "secondary", icon: Clock },
  "em-andamento": { nome: "Em Andamento", cor: "default", icon: Wrench },
  concluida: { nome: "Concluída", cor: "secondary", icon: CheckCircle },
  cancelada: { nome: "Cancelada", cor: "destructive", icon: Trash2 },
}

export function AgendaManutencao({ ativo }: AgendaManutencaoProps) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [dialogAberto, setDialogAberto] = useState(false)
  const [manutencaoEditando, setManutencaoEditando] = useState<Manutencao | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>("todas")

  const [formData, setFormData] = useState({
    tipo: "preventiva" as const,
    titulo: "",
    descricao: "",
    dataAgendada: "",
    responsavel: "",
    custo: 0,
    custoReal: 0,
    observacoes: "",
    proximaManutencao: "",
    status: "agendada" as const,
  })

  const [anexo, setAnexo] = useState<File | null>(null)
  const [anexoPreview, setAnexoPreview] = useState("")
  const anexoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const manutencoesArmazenadas = localStorage.getItem(`manutencoes-${ativo.id}`)
    if (manutencoesArmazenadas) {
      setManutencoes(JSON.parse(manutencoesArmazenadas))
    }
  }, [ativo.id])

  const salvarManutencoes = (novasManutencoes: Manutencao[]) => {
    setManutencoes(novasManutencoes)
    localStorage.setItem(`manutencoes-${ativo.id}`, JSON.stringify(novasManutencoes))
  }

  const resetarFormulario = () => {
    setFormData({
      tipo: "preventiva",
      titulo: "",
      descricao: "",
      dataAgendada: "",
      responsavel: "",
      custo: 0,
      custoReal: 0,
      observacoes: "",
      proximaManutencao: "",
      status: "agendada",
    })
    setAnexo(null)
    setAnexoPreview("")
    setManutencaoEditando(null)
    if (anexoInputRef.current) anexoInputRef.current.value = ""
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setAnexo(file)
      setAnexoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const removerAnexo = () => {
    setAnexo(null)
    setAnexoPreview("")
    if (anexoInputRef.current) anexoInputRef.current.value = ""
  }

  const abrirDialogEdicao = (manutencao: Manutencao) => {
    setFormData({
      tipo: manutencao.tipo,
      titulo: manutencao.titulo,
      descricao: manutencao.descricao,
      dataAgendada: manutencao.dataAgendada,
      responsavel: manutencao.responsavel,
      custo: manutencao.custo || 0,
      custoReal: manutencao.custoReal || 0,
      observacoes: manutencao.observacoes || "",
      proximaManutencao: manutencao.proximaManutencao || "",
      status: manutencao.status,
    })
    setAnexoPreview(manutencao.anexo || "")
    setManutencaoEditando(manutencao)
    setDialogAberto(true)
  }

  const salvarManutencao = () => {
    const novaManutencao: Manutencao = {
      id: manutencaoEditando?.id || Date.now().toString(),
      ativoId: ativo.id,
      ...formData,
      anexo: anexoPreview,
      dataRealizada:
        formData.status === "concluida" ? new Date().toISOString().split("T")[0] : manutencaoEditando?.dataRealizada,
    }

    let novasManutencoes: Manutencao[]
    if (manutencaoEditando) {
      novasManutencoes = manutencoes.map((m) => (m.id === manutencaoEditando.id ? novaManutencao : m))
    } else {
      novasManutencoes = [...manutencoes, novaManutencao]
    }

    salvarManutencoes(novasManutencoes)
    setDialogAberto(false)
    resetarFormulario()
  }

  const excluirManutencao = (id: string) => {
    const novasManutencoes = manutencoes.filter((m) => m.id !== id)
    salvarManutencoes(novasManutencoes)
  }

  const manutencoesFiltradas = manutencoes.filter((m) => {
    if (filtroStatus === "todas") return true
    return m.status === filtroStatus
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

  const proximasManutencoes = manutencoes.filter(
    (m) => m.status === "agendada" && new Date(m.dataAgendada) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  )

  const custoTotalEstimado = manutencoes.reduce((acc, m) => acc + (m.custo || 0), 0)
  const custoTotalReal = manutencoes
    .filter((m) => m.status === "concluida")
    .reduce((acc, m) => acc + (m.custoReal || m.custo || 0), 0)

  // Adicionar as funções de exportação:
  const exportarDadosManutencaoPDF = () => {
    exportarManutencaoPDF(ativo, manutencoesFiltradas)
  }

  // const exportarDadosManutencaoExcel = () => { // Removido
  //   exportarManutencaoExcel(ativo, manutencoesFiltradas)
  // }

  const exportarDadosManutencao = () => {
    const dados = {
      ativo: {
        codigo: ativo.codigo,
        nome: ativo.nome,
      },
      resumo: {
        totalManutencoes: manutencoes.length,
        custoTotalEstimado,
        custoTotalReal,
        proximasManutencoes: proximasManutencoes.length,
      },
      manutencoes: manutencoes,
    }

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `manutencoes-${ativo.codigo}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Manutenções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{proximasManutencoes.length}</div>
            <p className="text-sm text-muted-foreground">Nos próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manutencoes.length}</div>
            <p className="text-sm text-muted-foreground">Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custo Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(custoTotalEstimado)}</div>
            <p className="text-sm text-muted-foreground">Total planejado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(custoTotalReal)}</div>
            <p className="text-sm text-muted-foreground">Manutenções concluídas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Manutenção</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="filtroStatus">Filtrar por status:</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {Object.entries(STATUS_MANUTENCAO).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Substituir o botão de exportação existente por: */}
            <div className="flex gap-2">
              {/* <ExportButtons // Removido
                onExportPDF={exportarDadosManutencaoPDF}
                onExportExcel={exportarDadosManutencaoExcel}
                size="sm"
              /> */}
              <Button onClick={exportarDadosManutencaoPDF} size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button onClick={resetarFormulario}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Manutenção
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{manutencaoEditando ? "Editar Manutenção" : "Nova Manutenção"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo de Manutenção</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: "preventiva" | "corretiva" | "preditiva") =>
                          setFormData({ ...formData, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIPOS_MANUTENCAO).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "agendada" | "em-andamento" | "concluida" | "cancelada") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_MANUTENCAO).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dataAgendada">Data Agendada</Label>
                      <Input
                        id="dataAgendada"
                        type="date"
                        value={formData.dataAgendada}
                        onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="proximaManutencao">Próxima Manutenção</Label>
                      <Input
                        id="proximaManutencao"
                        type="date"
                        value={formData.proximaManutencao}
                        onChange={(e) => setFormData({ ...formData, proximaManutencao: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: Troca de óleo, Limpeza geral..."
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Descreva os procedimentos da manutenção..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="responsavel">Responsável</Label>
                      <Input
                        id="responsavel"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        placeholder="Nome do responsável"
                      />
                    </div>

                    <div>
                      <Label htmlFor="custo">Custo Estimado</Label>
                      <Input
                        id="custo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.custo}
                        onChange={(e) => setFormData({ ...formData, custo: Number.parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                      />
                    </div>

                    {formData.status === "concluida" && (
                      <div>
                        <Label htmlFor="custoReal">Custo Real</Label>
                        <Input
                          id="custoReal"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.custoReal}
                          onChange={(e) =>
                            setFormData({ ...formData, custoReal: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0,00"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <Label htmlFor="anexo">Anexo</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => anexoInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Anexo
                          </Button>
                          {anexoPreview && (
                            <Button type="button" variant="ghost" size="sm" onClick={removerAnexo}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <input
                          ref={anexoInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {anexoPreview && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Arquivo anexado
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Observações adicionais..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={() => setDialogAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={salvarManutencao}>{manutencaoEditando ? "Atualizar" : "Salvar"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {manutencoesFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Custo Est.</TableHead>
                    <TableHead>Custo Real</TableHead>
                    <TableHead>Anexo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manutencoesFiltradas.map((manutencao) => {
                    const tipoInfo = TIPOS_MANUTENCAO[manutencao.tipo]
                    const statusInfo = STATUS_MANUTENCAO[manutencao.status]
                    return (
                      <TableRow key={manutencao.id}>
                        <TableCell>
                          <Badge variant="outline" className={`${tipoInfo.cor} text-white`}>
                            {tipoInfo.nome}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{manutencao.titulo}</TableCell>
                        <TableCell>{formatarData(manutencao.dataAgendada)}</TableCell>
                        <TableCell>{manutencao.responsavel}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.cor}>{statusInfo.nome}</Badge>
                        </TableCell>
                        <TableCell>{formatarMoeda(manutencao.custo || 0)}</TableCell>
                        <TableCell>
                          {manutencao.status === "concluida"
                            ? formatarMoeda(manutencao.custoReal || manutencao.custo || 0)
                            : "-"}
                        </TableCell>
                        <TableCell>{manutencao.anexo ? <FileText className="h-4 w-4 text-blue-600" /> : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => abrirDialogEdicao(manutencao)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirManutencao(manutencao.id)}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {filtroStatus === "todas"
                ? "Nenhuma manutenção cadastrada"
                : `Nenhuma manutenção ${STATUS_MANUTENCAO[filtroStatus as keyof typeof STATUS_MANUTENCAO]?.nome.toLowerCase()}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
