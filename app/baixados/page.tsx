"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Download, Package, Archive, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FormularioBaixaAtivo } from "@/components/formulario-baixa-ativo"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Ativo } from "@/types/ativo"
import type { AtivoBaixado } from "@/types/ativo-baixado"

// Componente do gráfico de pizza (reutilizado do dashboard)
function PieChart({
  data,
  title,
}: {
  data: Array<{ name: string; value: number; color: string; percentage: number }>
  title: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const createPath = (percentage: number, cumulativePercentage: number) => {
    if (percentage === 0) return ""

    const startAngle = (cumulativePercentage * 360) / 100
    const endAngle = ((cumulativePercentage + percentage) * 360) / 100

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const largeArcFlag = percentage > 50 ? 1 : 0

    const x1 = 50 + 40 * Math.cos(startAngleRad)
    const y1 = 50 + 40 * Math.sin(startAngleRad)
    const x2 = 50 + 40 * Math.cos(endAngleRad)
    const y2 = 50 + 40 * Math.sin(endAngleRad)

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const path = createPath(item.percentage, cumulativePercentage)
              cumulativePercentage += item.percentage
              return path ? <path key={index} d={path} fill={item.color} stroke="white" strokeWidth="0.5" /> : null
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-500 ml-auto">
                {item.value} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AtivosBaixadosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [ativosBaixados, setAtivosBaixados] = useState<AtivoBaixado[]>([])
  const [filtro, setFiltro] = useState("")
  const [dialogAberto, setDialogAberto] = useState(false)
  const [modoFormulario, setModoFormulario] = useState<"create" | "edit" | "view">("create")
  const [baixaSelecionada, setBaixaSelecionada] = useState<AtivoBaixado | undefined>(undefined)

  useEffect(() => {
    const carregarDados = () => {
      const ativosSalvos = localStorage.getItem("ativos-imobilizados")
      if (ativosSalvos) {
        setAtivos(JSON.parse(ativosSalvos))
      }
      const baixadosSalvos = localStorage.getItem("ativos-baixados")
      if (baixadosSalvos) {
        setAtivosBaixados(JSON.parse(baixadosSalvos))
      }
    }
    carregarDados()
  }, [])

  const salvarAtivos = (novosAtivos: Ativo[]) => {
    setAtivos(novosAtivos)
    localStorage.setItem("ativos-imobilizados", JSON.stringify(novosAtivos))
  }

  const salvarAtivosBaixados = (novosBaixados: AtivoBaixado[]) => {
    setAtivosBaixados(novosBaixados)
    localStorage.setItem("ativos-baixados", JSON.stringify(novosBaixados))
  }

  const handleSaveBaixa = useCallback(
    (baixa: AtivoBaixado) => {
      let novosBaixados: AtivoBaixado[]
      if (modoFormulario === "edit") {
        novosBaixados = ativosBaixados.map((b) => (b.id === baixa.id ? baixa : b))
      } else {
        // 1. Atualizar o status do ativo original para "Baixado"
        const novosAtivos = ativos.map((a) => (a.id === baixa.ativoId ? { ...a, status: "Baixado" } : a))
        salvarAtivos(novosAtivos)
        // 2. Adicionar o registro de baixa à lista de ativos baixados
        novosBaixados = [...ativosBaixados, baixa]
      }
      salvarAtivosBaixados(novosBaixados)
      setDialogAberto(false)
      setBaixaSelecionada(undefined)
      setModoFormulario("create")
    },
    [ativos, ativosBaixados, modoFormulario],
  )

  const handleEditBaixa = (baixa: AtivoBaixado) => {
    setBaixaSelecionada(baixa)
    setModoFormulario("edit")
    setDialogAberto(true)
  }

  const handleViewBaixa = (baixa: AtivoBaixado) => {
    setBaixaSelecionada(baixa)
    setModoFormulario("view")
    setDialogAberto(true)
  }

  const handleDeleteBaixa = (baixaId: string) => {
    const baixaParaDeletar = ativosBaixados.find((b) => b.id === baixaId)
    if (!baixaParaDeletar) return

    // Reverter o status do ativo original de "Baixado" para "Inativo"
    const novosAtivos = ativos.map((a) => (a.id === baixaParaDeletar.ativoId ? { ...a, status: "Inativo" } : a))
    salvarAtivos(novosAtivos)

    // Remover o registro de baixa
    const novosBaixados = ativosBaixados.filter((b) => b.id !== baixaId)
    salvarAtivosBaixados(novosBaixados)
  }

  const ativosInativosDisponiveis = ativos.filter(
    (ativo) => ativo.status === "Inativo" && !ativosBaixados.some((b) => b.ativoId === ativo.id),
  )

  const ativosBaixadosFiltrados = ativosBaixados.filter(
    (baixa) =>
      baixa.nomeAtivo.toLowerCase().includes(filtro.toLowerCase()) ||
      baixa.codigoAtivo.toLowerCase().includes(filtro.toLowerCase()) ||
      baixa.numeroNotaFiscalVenda?.toLowerCase().includes(filtro.toLowerCase()),
  )

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const exportarDadosBaixados = () => {
    const dados = JSON.stringify(ativosBaixados, null, 2)
    const blob = new Blob([dados], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ativos-baixados.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Dashboard data for disposed assets
  const totalValorVenda = ativosBaixados.reduce((sum, baixa) => sum + baixa.valorVenda, 0)
  const totalAtivosBaixados = ativosBaixados.length

  const vendasPorMes = new Map<string, number>()
  ativosBaixados.forEach((baixa) => {
    if (baixa.dataVenda) {
      try {
        const data = new Date(baixa.dataVenda)
        const mesAno = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`
        const valor = vendasPorMes.get(mesAno) || 0
        vendasPorMes.set(mesAno, valor + baixa.valorVenda)
      } catch (error) {
        console.error("Erro ao processar data de venda:", error)
      }
    }
  })

  const dadosBarrasVendas = Array.from(vendasPorMes.entries())
    .sort(([a], [b]) => {
      const [mesA, anoA] = a.split("/").map(Number)
      const [mesB, anoB] = b.split("/").map(Number)
      return anoA - anoB || mesA - mesB
    })
    .slice(-6) // Últimos 6 meses
    .map(([mesAno, valor]) => ({
      month: mesAno,
      value: valor,
    }))

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ativos Baixados</h1>
          <p className="text-muted-foreground">Gerencie o histórico de ativos vendidos ou descartados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportarDadosBaixados} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog
            open={dialogAberto}
            onOpenChange={(open) => {
              setDialogAberto(open)
              if (!open) {
                setBaixaSelecionada(undefined)
                setModoFormulario("create")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setModoFormulario("create")
                  setBaixaSelecionada(undefined)
                  setDialogAberto(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Baixa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {modoFormulario === "create"
                    ? "Registrar Baixa de Ativo"
                    : modoFormulario === "edit"
                      ? "Editar Baixa de Ativo"
                      : "Visualizar Baixa de Ativo"}
                </DialogTitle>
              </DialogHeader>
              <FormularioBaixaAtivo
                ativosInativos={ativosInativosDisponiveis}
                onBaixar={handleSaveBaixa}
                onCancelar={() => setDialogAberto(false)}
                initialData={baixaSelecionada}
                mode={modoFormulario}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalValorVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Ativos Baixados</p>
                <p className="text-2xl font-bold text-gray-900">{totalAtivosBaixados}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Valor de Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {dadosBarrasVendas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum dado de venda disponível</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {dadosBarrasVendas.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-blue-500 rounded-t-sm min-w-[40px] transition-all duration-300"
                    style={{
                      height: `${Math.max((item.value / Math.max(...dadosBarrasVendas.map((d) => d.value))) * 200, 2)}px`,
                      backgroundColor: "#3b82f6",
                    }}
                  />
                  <span className="text-xs text-gray-500 rotate-45 origin-left">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Histórico de Ativos Baixados</CardTitle>
          <CardDescription>Total de {ativosBaixados.length} ativos baixados</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome ou NF de venda..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {ativosBaixadosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {ativosBaixados.length === 0 ? "Nenhum ativo baixado registrado" : "Nenhum ativo baixado encontrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Ativo</TableHead>
                    <TableHead>Nome Ativo</TableHead>
                    <TableHead>NF Venda</TableHead>
                    <TableHead>Valor Venda</TableHead>
                    <TableHead>Data Venda</TableHead>
                    <TableHead>Data Baixa Registro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ativosBaixadosFiltrados.map((baixa) => (
                    <TableRow key={baixa.id}>
                      <TableCell className="font-mono">{baixa.codigoAtivo}</TableCell>
                      <TableCell className="font-medium">{baixa.nomeAtivo}</TableCell>
                      <TableCell>{baixa.numeroNotaFiscalVenda || "N/A"}</TableCell>
                      <TableCell>{formatarMoeda(baixa.valorVenda)}</TableCell>
                      <TableCell>{new Date(baixa.dataVenda).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(baixa.dataBaixa).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewBaixa(baixa)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditBaixa(baixa)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro de baixa do
                                ativo e reverterá o status do ativo original para "Inativo".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBaixa(baixa.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
