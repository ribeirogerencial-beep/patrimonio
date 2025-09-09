"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import { FormularioCategoria } from "@/components/formulario-categoria"
import { FormularioSetor } from "@/components/formulario-setor"
import { FormularioLocalizacao } from "@/components/formulario-localizacao"
import { FormularioContaContabil } from "@/components/formulario-conta-contabil"
import { FormularioContaDepreciacao } from "@/components/formulario-conta-depreciacao"
import { FormularioContaCreditoFiscal } from "@/components/formulario-conta-credito-fiscal"
import { CategoriaService } from "@/lib/services/categoria-service"
import { SetorService } from "@/lib/services/setor-service"
import { LocalizacaoService } from "@/lib/services/localizacao-service"
import { useToast } from "@/hooks/use-toast"
import type {
  Categoria,
  Setor,
  Localizacao,
  ContaContabil,
  ContaDepreciacao,
  ContaCreditoFiscal,
} from "@/types/parametros"

export default function ParametrosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [contasDepreciacao, setContasDepreciacao] = useState<ContaDepreciacao[]>([])
  const [contasCreditoFiscal, setContasCreditoFiscal] = useState<ContaCreditoFiscal[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [searchTermCategoria, setSearchTermCategoria] = useState("")
  const [searchTermSetor, setSearchTermSetor] = useState("")
  const [searchTermLocalizacao, setSearchTermLocalizacao] = useState("")
  const [searchTermContaContabil, setSearchTermContaContabil] = useState("")
  const [searchTermContaDepreciacao, setSearchTermContaDepreciacao] = useState("")
  const [searchTermContaCreditoFiscal, setSearchTermContaCreditoFiscal] = useState("")

  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null)
  const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null)
  const [editingContaContabil, setEditingContaContabil] = useState<ContaContabil | null>(null)
  const [editingContaDepreciacao, setEditingContaDepreciacao] = useState<ContaDepreciacao | null>(null)
  const [editingContaCreditoFiscal, setEditingContaCreditoFiscal] = useState<ContaCreditoFiscal | null>(null)

  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false)
  const [isSetorDialogOpen, setIsSetorDialogOpen] = useState(false)
  const [isLocalizacaoDialogOpen, setIsLocalizacaoDialogOpen] = useState(false)
  const [isContaContabilDialogOpen, setIsContaContabilDialogOpen] = useState(false)
  const [isContaDepreciacaoDialogOpen, setIsContaDepreciacaoDialogOpen] = useState(false)
  const [isContaCreditoFiscalDialogOpen, setIsContaCreditoFiscalDialogOpen] = useState(false)

  const { toast } = useToast()

  // Carregar dados do Supabase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar categorias
      const categoriasData = await CategoriaService.getAll()
      setCategorias(categoriasData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        descricao: cat.descricao || '',
        taxaDepreciacao: cat.taxa_depreciacao || 0,
        vidaUtil: 0, // Campo não existe no Supabase ainda
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: cat.created_at
      })))

      // Carregar setores
      const setoresData = await SetorService.getAll()
      setSetores(setoresData.map(setor => ({
        id: setor.id,
        nome: setor.nome,
        descricao: setor.descricao || '',
        responsavel: setor.responsavel || '',
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: setor.created_at
      })))

      // Carregar localizações
      const localizacoesData = await LocalizacaoService.getAll()
      setLocalizacoes(localizacoesData.map(loc => ({
        id: loc.id,
        nome: loc.nome,
        descricao: loc.descricao || '',
        setor: '', // Campo não existe no Supabase ainda
        andar: '', // Campo não existe no Supabase ainda
        sala: '', // Campo não existe no Supabase ainda
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: loc.created_at
      })))

      // Manter contas contábeis no localStorage por enquanto
      const storedContasContabeis = localStorage.getItem("contas-contabeis-sistema")
      if (storedContasContabeis) setContasContabeis(JSON.parse(storedContasContabeis))
      const storedContasDepreciacao = localStorage.getItem("contas-depreciacao-sistema")
      if (storedContasDepreciacao) setContasDepreciacao(JSON.parse(storedContasDepreciacao))
      const storedContasCreditoFiscal = localStorage.getItem("contas-credito-fiscal-sistema")
      if (storedContasCreditoFiscal) setContasCreditoFiscal(JSON.parse(storedContasCreditoFiscal))

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Manter localStorage apenas para contas contábeis por enquanto
  useEffect(() => {
    localStorage.setItem("contas-contabeis-sistema", JSON.stringify(contasContabeis))
  }, [contasContabeis])

  useEffect(() => {
    localStorage.setItem("contas-depreciacao-sistema", JSON.stringify(contasDepreciacao))
  }, [contasDepreciacao])

  useEffect(() => {
    localStorage.setItem("contas-credito-fiscal-sistema", JSON.stringify(contasCreditoFiscal))
  }, [contasCreditoFiscal])

  const handleSaveCategoria = async (newCategoria: Categoria) => {
    try {
      setSaving(true)
      
      if (editingCategoria) {
        // Atualizar categoria existente
        await CategoriaService.update(editingCategoria.id, {
          nome: newCategoria.nome,
          descricao: newCategoria.descricao,
          taxa_depreciacao: newCategoria.taxaDepreciacao
        })
        
        setCategorias(categorias.map((c) => (c.id === newCategoria.id ? newCategoria : c)))
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!"
        })
      } else {
        // Criar nova categoria
        const createdCategoria = await CategoriaService.create({
          nome: newCategoria.nome,
          descricao: newCategoria.descricao,
          taxa_depreciacao: newCategoria.taxaDepreciacao
        })
        
        const categoriaWithLocalFields = {
          ...newCategoria,
          id: createdCategoria.id,
          dataInclusao: createdCategoria.created_at
        }
        
        setCategorias([...categorias, categoriaWithLocalFields])
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!"
        })
      }
      
      setEditingCategoria(null)
      setIsCategoriaDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategoria = async (id: string) => {
    try {
      setSaving(true)
      await CategoriaService.delete(id)
      setCategorias(categorias.filter((c) => c.id !== id))
      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSetor = async (newSetor: Setor) => {
    try {
      setSaving(true)
      
      if (editingSetor) {
        // Atualizar setor existente
        await SetorService.update(editingSetor.id, {
          nome: newSetor.nome,
          descricao: newSetor.descricao,
          responsavel: newSetor.responsavel
        })
        
        setSetores(setores.map((s) => (s.id === newSetor.id ? newSetor : s)))
        toast({
          title: "Sucesso",
          description: "Setor atualizado com sucesso!"
        })
      } else {
        // Criar novo setor
        const createdSetor = await SetorService.create({
          nome: newSetor.nome,
          descricao: newSetor.descricao,
          responsavel: newSetor.responsavel
        })
        
        const setorWithLocalFields = {
          ...newSetor,
          id: createdSetor.id,
          dataInclusao: createdSetor.created_at
        }
        
        setSetores([...setores, setorWithLocalFields])
        toast({
          title: "Sucesso",
          description: "Setor criado com sucesso!"
        })
      }
      
      setEditingSetor(null)
      setIsSetorDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSetor = async (id: string) => {
    try {
      setSaving(true)
      await SetorService.delete(id)
      setSetores(setores.filter((s) => s.id !== id))
      toast({
        title: "Sucesso",
        description: "Setor removido com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLocalizacao = async (newLocalizacao: Localizacao) => {
    try {
      setSaving(true)
      
      if (editingLocalizacao) {
        // Atualizar localização existente
        await LocalizacaoService.update(editingLocalizacao.id, {
          nome: newLocalizacao.nome,
          descricao: newLocalizacao.descricao,
          endereco: newLocalizacao.setor // Usando setor como endereco por enquanto
        })
        
        setLocalizacoes(localizacoes.map((l) => (l.id === newLocalizacao.id ? newLocalizacao : l)))
        toast({
          title: "Sucesso",
          description: "Localização atualizada com sucesso!"
        })
      } else {
        // Criar nova localização
        const createdLocalizacao = await LocalizacaoService.create({
          nome: newLocalizacao.nome,
          descricao: newLocalizacao.descricao,
          endereco: newLocalizacao.setor // Usando setor como endereco por enquanto
        })
        
        const localizacaoWithLocalFields = {
          ...newLocalizacao,
          id: createdLocalizacao.id,
          dataInclusao: createdLocalizacao.created_at
        }
        
        setLocalizacoes([...localizacoes, localizacaoWithLocalFields])
        toast({
          title: "Sucesso",
          description: "Localização criada com sucesso!"
        })
      }
      
      setEditingLocalizacao(null)
      setIsLocalizacaoDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLocalizacao = async (id: string) => {
    try {
      setSaving(true)
      await LocalizacaoService.delete(id)
      setLocalizacoes(localizacoes.filter((l) => l.id !== id))
      toast({
        title: "Sucesso",
        description: "Localização removida com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContaContabil = (newContaContabil: ContaContabil) => {
    if (editingContaContabil) {
      setContasContabeis(contasContabeis.map((c) => (c.id === newContaContabil.id ? newContaContabil : c)))
    } else {
      setContasContabeis([
        ...contasContabeis,
        { ...newContaContabil, id: Date.now().toString(), dataInclusao: new Date().toISOString() },
      ])
    }
    setEditingContaContabil(null)
    setIsContaContabilDialogOpen(false)
  }

  const handleDeleteContaContabil = (id: string) => {
    setContasContabeis(contasContabeis.filter((c) => c.id !== id))
  }

  const handleSaveContaDepreciacao = (newContaDepreciacao: ContaDepreciacao) => {
    if (editingContaDepreciacao) {
      setContasDepreciacao(contasDepreciacao.map((c) => (c.id === newContaDepreciacao.id ? newContaDepreciacao : c)))
    } else {
      setContasDepreciacao([
        ...contasDepreciacao,
        { ...newContaDepreciacao, id: Date.now().toString(), dataInclusao: new Date().toISOString() },
      ])
    }
    setEditingContaDepreciacao(null)
    setIsContaDepreciacaoDialogOpen(false)
  }

  const handleDeleteContaDepreciacao = (id: string) => {
    setContasDepreciacao(contasDepreciacao.filter((c) => c.id !== id))
  }

  const handleSaveContaCreditoFiscal = (newContaCreditoFiscal: ContaCreditoFiscal) => {
    if (editingContaCreditoFiscal) {
      setContasCreditoFiscal(
        contasCreditoFiscal.map((c) => (c.id === newContaCreditoFiscal.id ? newContaCreditoFiscal : c)),
      )
    } else {
      setContasCreditoFiscal([
        ...contasCreditoFiscal,
        { ...newContaCreditoFiscal, id: Date.now().toString(), dataInclusao: new Date().toISOString() },
      ])
    }
    setEditingContaCreditoFiscal(null)
    setIsContaCreditoFiscalDialogOpen(false)
  }

  const handleDeleteContaCreditoFiscal = (id: string) => {
    setContasCreditoFiscal(contasCreditoFiscal.filter((c) => c.id !== id))
  }

  const filteredCategorias = categorias.filter(
    (categoria) =>
      categoria.nome.toLowerCase().includes(searchTermCategoria.toLowerCase()) ||
      categoria.descricao.toLowerCase().includes(searchTermCategoria.toLowerCase()),
  )

  const filteredSetores = setores.filter(
    (setor) =>
      setor.nome.toLowerCase().includes(searchTermSetor.toLowerCase()) ||
      setor.descricao.toLowerCase().includes(searchTermSetor.toLowerCase()),
  )

  const filteredLocalizacoes = localizacoes.filter(
    (localizacao) =>
      localizacao.nome.toLowerCase().includes(searchTermLocalizacao.toLowerCase()) ||
      localizacao.descricao.toLowerCase().includes(searchTermLocalizacao.toLowerCase()) ||
      localizacao.setor.toLowerCase().includes(searchTermLocalizacao.toLowerCase()),
  )

  const filteredContasContabeis = contasContabeis.filter(
    (conta) =>
      conta.codigo.toLowerCase().includes(searchTermContaContabil.toLowerCase()) ||
      conta.descricao.toLowerCase().includes(searchTermContaContabil.toLowerCase()),
  )

  const filteredContasDepreciacao = contasDepreciacao.filter(
    (conta) =>
      conta.codigo.toLowerCase().includes(searchTermContaDepreciacao.toLowerCase()) ||
      conta.descricao.toLowerCase().includes(searchTermContaDepreciacao.toLowerCase()),
  )

  const filteredContasCreditoFiscal = contasCreditoFiscal.filter(
    (conta) =>
      conta.codigo.toLowerCase().includes(searchTermContaCreditoFiscal.toLowerCase()) ||
      conta.descricao.toLowerCase().includes(searchTermContaCreditoFiscal.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Carregando parâmetros...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          {/* Categorias de Ativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Categorias de Ativos</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar categorias..."
                    value={searchTermCategoria}
                    onChange={(e) => setSearchTermCategoria(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingCategoria(null)} disabled={saving}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingCategoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                      <DialogDescription>
                        {editingCategoria
                          ? "Edite as informações da categoria."
                          : "Preencha os detalhes da nova categoria."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioCategoria
                      categoria={editingCategoria}
                      onSalvar={handleSaveCategoria}
                      onCancelar={() => setIsCategoriaDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Taxa Depreciação</TableHead>
                      <TableHead>Vida Útil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategorias.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.nome}</TableCell>
                        <TableCell>{categoria.descricao}</TableCell>
                        <TableCell>{categoria.taxaDepreciacao}% a.a.</TableCell>
                        <TableCell>{categoria.vidaUtil} meses</TableCell>
                        <TableCell>
                          <Badge variant={categoria.ativo ? "default" : "outline"}>
                            {categoria.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(categoria.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingCategoria?.id === categoria.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingCategoria(null)
                                setIsCategoriaDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCategoria(categoria)
                                    setIsCategoriaDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Categoria</DialogTitle>
                                  <DialogDescription>Edite as informações da categoria.</DialogDescription>
                                </DialogHeader>
                                <FormularioCategoria
                                  categoria={editingCategoria}
                                  onSalvar={handleSaveCategoria}
                                  onCancelar={() => setIsCategoriaDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteCategoria(categoria.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Setores */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Setores</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar setores..."
                    value={searchTermSetor}
                    onChange={(e) => setSearchTermSetor(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isSetorDialogOpen} onOpenChange={setIsSetorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingSetor(null)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Novo Setor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingSetor ? "Editar Setor" : "Novo Setor"}</DialogTitle>
                      <DialogDescription>
                        {editingSetor ? "Edite as informações do setor." : "Preencha os detalhes do novo setor."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioSetor
                      setor={editingSetor}
                      onSalvar={handleSaveSetor}
                      onCancelar={() => setIsSetorDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSetores.map((setor) => (
                      <TableRow key={setor.id}>
                        <TableCell className="font-medium">{setor.nome}</TableCell>
                        <TableCell>{setor.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={setor.ativo ? "default" : "outline"}>
                            {setor.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(setor.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingSetor?.id === setor.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingSetor(null)
                                setIsSetorDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingSetor(setor)
                                    setIsSetorDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Setor</DialogTitle>
                                  <DialogDescription>Edite as informações do setor.</DialogDescription>
                                </DialogHeader>
                                <FormularioSetor
                                  setor={editingSetor}
                                  onSalvar={handleSaveSetor}
                                  onCancelar={() => setIsSetorDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteSetor(setor.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Localizações */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Localizações</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar localizações..."
                    value={searchTermLocalizacao}
                    onChange={(e) => setSearchTermLocalizacao(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isLocalizacaoDialogOpen} onOpenChange={setIsLocalizacaoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingLocalizacao(null)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Localização
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingLocalizacao ? "Editar Localização" : "Nova Localização"}</DialogTitle>
                      <DialogDescription>
                        {editingLocalizacao
                          ? "Edite as informações da localização."
                          : "Preencha os detalhes da nova localização."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioLocalizacao
                      localizacao={editingLocalizacao}
                      setores={setores} // Pass the list of sectors
                      onSalvar={handleSaveLocalizacao}
                      onCancelar={() => setIsLocalizacaoDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Andar</TableHead>
                      <TableHead>Sala</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocalizacoes.map((localizacao) => (
                      <TableRow key={localizacao.id}>
                        <TableCell className="font-medium">{localizacao.nome}</TableCell>
                        <TableCell>{localizacao.descricao}</TableCell>
                        <TableCell>{localizacao.setor}</TableCell>
                        <TableCell>{localizacao.andar}</TableCell>
                        <TableCell>{localizacao.sala}</TableCell>
                        <TableCell>
                          <Badge variant={localizacao.ativo ? "default" : "outline"}>
                            {localizacao.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(localizacao.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingLocalizacao?.id === localizacao.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingLocalizacao(null)
                                setIsLocalizacaoDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingLocalizacao(localizacao)
                                    setIsLocalizacaoDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Localização</DialogTitle>
                                  <DialogDescription>Edite as informações da localização.</DialogDescription>
                                </DialogHeader>
                                <FormularioLocalizacao
                                  localizacao={editingLocalizacao}
                                  setores={setores}
                                  onSalvar={handleSaveLocalizacao}
                                  onCancelar={() => setIsLocalizacaoDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteLocalizacao(localizacao.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Contas Contábeis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Contas Contábeis</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar contas contábeis..."
                    value={searchTermContaContabil}
                    onChange={(e) => setSearchTermContaContabil(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isContaContabilDialogOpen} onOpenChange={setIsContaContabilDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingContaContabil(null)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContaContabil ? "Editar Conta Contábil" : "Nova Conta Contábil"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingContaContabil
                          ? "Edite as informações da conta contábil."
                          : "Preencha os detalhes da nova conta contábil."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioContaContabil
                      contaContabil={editingContaContabil}
                      onSave={handleSaveContaContabil}
                      onCancel={() => setIsContaContabilDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContasContabeis.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.codigo}</TableCell>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={conta.ativo ? "default" : "outline"}>
                            {conta.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(conta.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingContaContabil?.id === conta.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingContaContabil(null)
                                setIsContaContabilDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingContaContabil(conta)
                                    setIsContaContabilDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Conta Contábil</DialogTitle>
                                  <DialogDescription>Edite as informações da conta contábil.</DialogDescription>
                                </DialogHeader>
                                <FormularioContaContabil
                                  contaContabil={editingContaContabil}
                                  onSave={handleSaveContaContabil}
                                  onCancel={() => setIsContaContabilDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteContaContabil(conta.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Contas de Depreciação */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Contas de Depreciação</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar contas de depreciação..."
                    value={searchTermContaDepreciacao}
                    onChange={(e) => setSearchTermContaDepreciacao(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isContaDepreciacaoDialogOpen} onOpenChange={setIsContaDepreciacaoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingContaDepreciacao(null)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContaDepreciacao ? "Editar Conta de Depreciação" : "Nova Conta de Depreciação"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingContaDepreciacao
                          ? "Edite as informações da conta de depreciação."
                          : "Preencha os detalhes da nova conta de depreciação."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioContaDepreciacao
                      contaDepreciacao={editingContaDepreciacao}
                      onSave={handleSaveContaDepreciacao}
                      onCancel={() => setIsContaDepreciacaoDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContasDepreciacao.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.codigo}</TableCell>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={conta.ativo ? "default" : "outline"}>
                            {conta.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(conta.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingContaDepreciacao?.id === conta.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingContaDepreciacao(null)
                                setIsContaDepreciacaoDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingContaDepreciacao(conta)
                                    setIsContaDepreciacaoDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Conta de Depreciação</DialogTitle>
                                  <DialogDescription>Edite as informações da conta de depreciação.</DialogDescription>
                                </DialogHeader>
                                <FormularioContaDepreciacao
                                  contaDepreciacao={editingContaDepreciacao}
                                  onSave={handleSaveContaDepreciacao}
                                  onCancel={() => setIsContaDepreciacaoDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteContaDepreciacao(conta.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Contas de Crédito Fiscal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Contas de Crédito Fiscal</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar contas de crédito fiscal..."
                    value={searchTermContaCreditoFiscal}
                    onChange={(e) => setSearchTermContaCreditoFiscal(e.target.value)}
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  />
                </div>
                <Dialog open={isContaCreditoFiscalDialogOpen} onOpenChange={setIsContaCreditoFiscalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingContaCreditoFiscal(null)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContaCreditoFiscal ? "Editar Conta de Crédito Fiscal" : "Nova Conta de Crédito Fiscal"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingContaCreditoFiscal
                          ? "Edite as informações da conta de crédito fiscal."
                          : "Preencha os detalhes da nova conta de crédito fiscal."}
                      </DialogDescription>
                    </DialogHeader>
                    <FormularioContaCreditoFiscal
                      contaCreditoFiscal={editingContaCreditoFiscal}
                      onSave={handleSaveContaCreditoFiscal}
                      onCancel={() => setIsContaCreditoFiscalDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Inclusão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContasCreditoFiscal.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.codigo}</TableCell>
                        <TableCell>{conta.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={conta.ativo ? "default" : "outline"}>
                            {conta.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(conta.dataInclusao).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingContaCreditoFiscal?.id === conta.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingContaCreditoFiscal(null)
                                setIsContaCreditoFiscalDialogOpen(open)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingContaCreditoFiscal(conta)
                                    setIsContaCreditoFiscalDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Conta de Crédito Fiscal</DialogTitle>
                                  <DialogDescription>
                                    Edite as informações da conta de crédito fiscal.
                                  </DialogDescription>
                                </DialogHeader>
                                <FormularioContaCreditoFiscal
                                  contaCreditoFiscal={editingContaCreditoFiscal}
                                  onSave={handleSaveContaCreditoFiscal}
                                  onCancel={() => setIsContaCreditoFiscalDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteContaCreditoFiscal(conta.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
