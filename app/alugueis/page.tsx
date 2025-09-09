"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Eye, Edit, Trash2, Calendar, DollarSign, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FormularioAluguel } from "@/components/formulario-aluguel"
import { DetalhesAluguel } from "@/components/detalhes-aluguel"
import type { Aluguel } from "@/types/aluguel"

export default function AlugueisPage() {
  const [alugueis, setAlugueis] = useState<Aluguel[]>([])
  const [filtro, setFiltro] = useState("")
  const [aluguelSelecionado, setAluguelSelecionado] = useState<Aluguel | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [dialogAberto, setDialogAberto] = useState(false)

  useEffect(() => {
    const alugueisData = localStorage.getItem("alugueis-sistema")
    if (alugueisData) {
      setAlugueis(JSON.parse(alugueisData))
    }
  }, [])

  const salvarAlugueis = (novosAlugueis: Aluguel[]) => {
    setAlugueis(novosAlugueis)
    localStorage.setItem("alugueis-sistema", JSON.stringify(novosAlugueis))
  }

  const adicionarAluguel = (aluguel: Aluguel) => {
    const novosAlugueis = [...alugueis, aluguel]
    salvarAlugueis(novosAlugueis)
    setDialogAberto(false)
  }

  const editarAluguel = (aluguel: Aluguel) => {
    const novosAlugueis = alugueis.map((a) => (a.id === aluguel.id ? aluguel : a))
    salvarAlugueis(novosAlugueis)
    setDialogAberto(false)
    setModoEdicao(false)
    setAluguelSelecionado(null)
  }

  const excluirAluguel = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este aluguel?")) {
      const novosAlugueis = alugueis.filter((a) => a.id !== id)
      salvarAlugueis(novosAlugueis)
    }
  }

  const alugueisFiltratos = alugueis.filter(
    (aluguel) =>
      aluguel.codigoProduto.toLowerCase().includes(filtro.toLowerCase()) ||
      aluguel.nomeProduto.toLowerCase().includes(filtro.toLowerCase()) ||
      aluguel.nomeFornecedor.toLowerCase().includes(filtro.toLowerCase()),
  )

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR")
  }

  const calcularDataFim = (dataInicio: string, prazoMeses: number) => {
    const data = new Date(dataInicio)
    data.setMonth(data.getMonth() + prazoMeses)
    return data.toISOString().split("T")[0]
  }

  const verificarStatus = (dataFim: string) => {
    const hoje = new Date()
    const fim = new Date(dataFim)

    if (fim < hoje) {
      return "vencido"
    }
    return "ativo"
  }

  // Calcular estatísticas
  const alugueisAtivos = alugueis.filter((a) => verificarStatus(a.dataFim) === "ativo").length
  const alugueisVencidos = alugueis.filter((a) => verificarStatus(a.dataFim) === "vencido").length
  const valorTotalMensal = alugueis
    .filter((a) => verificarStatus(a.dataFim) === "ativo")
    .reduce((acc, a) => acc + a.valorAluguel, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold">Controle de Aluguéis</h1>
          <p className="text-muted-foreground">Gerencie os produtos em regime de aluguel</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Aluguéis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alugueis.length}</div>
            <p className="text-xs text-muted-foreground">Contratos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aluguéis Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{alugueisAtivos}</div>
            <p className="text-xs text-muted-foreground">Em vigência</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aluguéis Vencidos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alugueisVencidos}</div>
            <p className="text-xs text-muted-foreground">Necessitam renovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Mensal Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatarMoeda(valorTotalMensal)}</div>
            <p className="text-xs text-muted-foreground">Aluguéis ativos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Aluguéis Cadastrados</CardTitle>
              <CardDescription>Gerencie os contratos de aluguel de produtos</CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Removed Export Button */}
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setAluguelSelecionado(null)
                      setModoEdicao(false)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Aluguel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{modoEdicao ? "Editar Aluguel" : "Novo Aluguel"}</DialogTitle>
                  </DialogHeader>
                  <FormularioAluguel
                    aluguel={aluguelSelecionado}
                    onSalvar={modoEdicao ? editarAluguel : adicionarAluguel}
                    onCancelar={() => {
                      setDialogAberto(false)
                      setModoEdicao(false)
                      setAluguelSelecionado(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, produto ou fornecedor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {alugueisFiltratos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {alugueis.length === 0 ? "Nenhum aluguel cadastrado" : "Nenhum aluguel encontrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Mensal</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alugueisFiltratos.map((aluguel) => {
                    const status = verificarStatus(aluguel.dataFim)
                    return (
                      <TableRow key={aluguel.id}>
                        <TableCell className="font-mono">{aluguel.codigoProduto}</TableCell>
                        <TableCell className="font-medium">{aluguel.nomeProduto}</TableCell>
                        <TableCell>{aluguel.nomeFornecedor}</TableCell>
                        <TableCell className="font-semibold">{formatarMoeda(aluguel.valorAluguel)}</TableCell>
                        <TableCell>{aluguel.prazoMeses} meses</TableCell>
                        <TableCell>{formatarData(aluguel.dataInicio)}</TableCell>
                        <TableCell>{formatarData(aluguel.dataFim)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "ativo" ? "default" : status === "vencido" ? "destructive" : "secondary"
                            }
                          >
                            {status === "ativo" ? "Ativo" : status === "vencido" ? "Vencido" : "Cancelado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Aluguel</DialogTitle>
                                </DialogHeader>
                                <DetalhesAluguel aluguel={aluguel} />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAluguelSelecionado(aluguel)
                                setModoEdicao(true)
                                setDialogAberto(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirAluguel(aluguel.id)}
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
