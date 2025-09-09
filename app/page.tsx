"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { FormularioAtivo } from "@/components/formulario-ativo"
import { DetalhesAtivo } from "@/components/detalhes-ativo"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Building2,
  MapPin,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Ativo, AtivoFilter, AtivoStats } from "@/types/ativo"
import type { Categoria, Setor, Localizacao } from "@/types/parametros"
import { useParametros } from "@/hooks/use-parametros"

export default function AtivosPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const { 
    categorias, 
    setores, 
    localizacoes, 
    loading: parametrosLoading, 
    error: parametrosError 
  } = useParametros()
  const [filtros, setFiltros] = useState<AtivoFilter>({
    busca: "",
    categoria: "",
    setor: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  })
  const [stats, setStats] = useState<AtivoStats>({
    total: 0,
    ativos: 0,
    baixados: 0,
    manutencao: 0,
    valorTotal: 0,
  })
  const [ativoSelecionado, setAtivoSelecionado] = useState<Ativo | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [detalhesAberto, setDetalhesAberto] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    calcularEstatisticas()
  }, [ativos])

  const carregarDados = async () => {
    setIsLoading(true)
    try {
      // Carregar ativos
      const ativosSalvos = localStorage.getItem("ativos-imobilizados")
      if (ativosSalvos) {
        setAtivos(JSON.parse(ativosSalvos))
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calcularEstatisticas = () => {
    const total = ativos.length
    const ativos_ativos = ativos.filter((a) => a.status === "ativo" || !a.status).length
    const baixados = ativos.filter((a) => a.status === "baixado").length
    const manutencao = ativos.filter((a) => a.status === "manutencao").length
    const valorTotal = ativos.reduce((sum, ativo) => sum + (ativo.valorTotal || 0), 0)

    setStats({
      total,
      ativos: ativos_ativos,
      baixados,
      manutencao,
      valorTotal,
    })
  }

  const salvarAtivo = (ativo: Ativo) => {
    try {
      let novosAtivos: Ativo[]

      if (modoEdicao && ativoSelecionado) {
        novosAtivos = ativos.map((a) => (a.id === ativo.id ? ativo : a))
        toast({
          title: "Ativo atualizado",
          description: "O ativo foi atualizado com sucesso.",
        })
      } else {
        novosAtivos = [...ativos, ativo]
        toast({
          title: "Ativo criado",
          description: "O ativo foi criado com sucesso.",
        })
      }

      setAtivos(novosAtivos)
      localStorage.setItem("ativos-imobilizados", JSON.stringify(novosAtivos))

      setDialogAberto(false)
      setAtivoSelecionado(null)
      setModoEdicao(false)
    } catch (error) {
      console.error("Erro ao salvar ativo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o ativo.",
        variant: "destructive",
      })
    }
  }

  const excluirAtivo = (id: string) => {
    try {
      const novosAtivos = ativos.filter((a) => a.id !== id)
      setAtivos(novosAtivos)
      localStorage.setItem("ativos-imobilizados", JSON.stringify(novosAtivos))

      toast({
        title: "Ativo excluído",
        description: "O ativo foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir ativo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o ativo.",
        variant: "destructive",
      })
    }
  }

  const abrirEdicao = (ativo: Ativo) => {
    setAtivoSelecionado(ativo)
    setModoEdicao(true)
    setDialogAberto(true)
  }

  const abrirDetalhes = (ativo: Ativo) => {
    setAtivoSelecionado(ativo)
    setDetalhesAberto(true)
  }

  const abrirCriacao = () => {
    setAtivoSelecionado(null)
    setModoEdicao(false)
    setDialogAberto(true)
  }

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      categoria: "",
      setor: "",
      status: "",
      dataInicio: "",
      dataFim: "",
    })
  }

  const ativosFiltrados = ativos.filter((ativo) => {
    const matchBusca =
      !filtros.busca ||
      ativo.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      ativo.codigo.toLowerCase().includes(filtros.busca.toLowerCase())

    const matchCategoria = !filtros.categoria || ativo.categoria === filtros.categoria
    const matchSetor = !filtros.setor || ativo.setorDestino === filtros.setor
    const matchStatus = !filtros.status || (ativo.status || "ativo") === filtros.status

    const matchDataInicio = !filtros.dataInicio || new Date(ativo.dataAquisicao) >= new Date(filtros.dataInicio)

    const matchDataFim = !filtros.dataFim || new Date(ativo.dataAquisicao) <= new Date(filtros.dataFim)

    return matchBusca && matchCategoria && matchSetor && matchStatus && matchDataInicio && matchDataFim
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "baixado":
        return <Badge variant="destructive">Baixado</Badge>
      case "manutencao":
        return <Badge variant="outline">Manutenção</Badge>
      default:
        return <Badge variant="default">Ativo</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando ativos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ativos Imobilizados</h1>
          <p className="text-muted-foreground">Gerencie todos os ativos imobilizados da empresa</p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirCriacao}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modoEdicao ? "Editar Ativo" : "Novo Ativo"}</DialogTitle>
            </DialogHeader>
            <FormularioAtivo
              ativo={ativoSelecionado}
              onSalvar={salvarAtivo}
              onCancelar={() => setDialogAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.baixados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome ou código..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={filtros.categoria}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias
                    .filter((c) => c.ativo)
                    .map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="setor">Setor</Label>
              <Select
                value={filtros.setor}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, setor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {setores
                    .filter((s) => s.ativo)
                    .map((setor) => (
                      <SelectItem key={setor.id} value={setor.nome}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="baixado">Baixado</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={limparFiltros} className="w-full bg-transparent">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Ativos ({ativosFiltrados.length} de {ativos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ativosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ativo encontrado</p>
              <p className="text-sm">
                {ativos.length === 0 ? "Comece criando seu primeiro ativo" : "Tente ajustar os filtros de busca"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ativosFiltrados.map((ativo) => (
                <div key={ativo.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{ativo.nome}</h3>
                        {getStatusBadge(ativo.status)}
                        <Badge variant="outline">{ativo.codigo}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{ativo.categoria}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{ativo.setorDestino}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(ativo.dataAquisicao)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(ativo.valorTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => abrirDetalhes(ativo)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button size="sm" variant="outline" onClick={() => abrirEdicao(ativo)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o ativo "{ativo.nome}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => excluirAtivo(ativo.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detalhesAberto} onOpenChange={setDetalhesAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Ativo</DialogTitle>
          </DialogHeader>
          {ativoSelecionado && <DetalhesAtivo ativo={ativoSelecionado} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
