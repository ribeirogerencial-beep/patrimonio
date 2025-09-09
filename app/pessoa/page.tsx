"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Eye, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormularioPessoa } from "@/components/formulario-pessoa"
import { DetalhesPessoa } from "@/components/detalhes-pessoa"
import type { Pessoa } from "@/types/pessoa"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PessoaPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null)
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")

  useEffect(() => {
    loadPessoas()
  }, [])

  const loadPessoas = () => {
    const storedPessoas = JSON.parse(localStorage.getItem("pessoas") || "[]") as Pessoa[]
    setPessoas(storedPessoas)
  }

  const handleSavePessoa = (newPessoa: Pessoa) => {
    let updatedPessoas: Pessoa[]
    if (editingPessoa) {
      updatedPessoas = pessoas.map((p) => (p.id === newPessoa.id ? newPessoa : p))
      setAlertMessage("Pessoa atualizada com sucesso!")
    } else {
      updatedPessoas = [
        ...pessoas,
        { ...newPessoa, id: Date.now().toString(), dataInclusao: new Date().toLocaleDateString("pt-BR") },
      ]
      setAlertMessage("Pessoa cadastrada com sucesso!")
    }
    localStorage.setItem("pessoas", JSON.stringify(updatedPessoas))
    setPessoas(updatedPessoas)
    setIsFormOpen(false)
    setEditingPessoa(null)
    setAlertType("success")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleEditPessoa = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa)
    setIsFormOpen(true)
  }

  const handleDeletePessoa = (id: string) => {
    const updatedPessoas = pessoas.filter((p) => p.id !== id)
    localStorage.setItem("pessoas", JSON.stringify(updatedPessoas))
    setPessoas(updatedPessoas)
    setAlertMessage("Pessoa excluída com sucesso!")
    setAlertType("success")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleViewDetails = (pessoa: Pessoa) => {
    setSelectedPessoa(pessoa)
    setIsDetailsOpen(true)
  }

  const filteredPessoas = pessoas.filter(
    (pessoa) =>
      pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.setor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPessoas = pessoas.length
  const usuariosAtivos = pessoas.filter((p) => p.status === "ativo").length
  const usuariosInativos = pessoas.filter((p) => p.status === "inativo").length

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        Cadastro de Pessoas
      </h1>
      <p className="text-muted-foreground mb-6">Gerencie os usuários do sistema</p>

      {showAlert && (
        <Alert variant={alertType === "success" ? "default" : "destructive"} className="mb-4">
          <AlertTitle>{alertType === "success" ? "Sucesso!" : "Erro!"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPessoas}</div>
            <p className="text-xs text-muted-foreground">Cadastradas no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">Com acesso liberado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{usuariosInativos}</div>
            <p className="text-xs text-muted-foreground">Acesso bloqueado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pessoas Cadastradas</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                placeholder="Buscar por nome, email, cargo ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[250px] lg:w-[350px]"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPessoa(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Pessoa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingPessoa ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}</DialogTitle>
                  <DialogDescription>
                    {editingPessoa
                      ? "Edite as informações da pessoa selecionada."
                      : "Preencha os dados para cadastrar uma nova pessoa no sistema."}
                  </DialogDescription>
                </DialogHeader>
                <FormularioPessoa
                  pessoa={editingPessoa}
                  onSalvar={handleSavePessoa}
                  onCancelar={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Inclusão</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPessoas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma pessoa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPessoas.map((pessoa) => (
                  <TableRow key={pessoa.id}>
                    <TableCell className="font-medium">{pessoa.nome}</TableCell>
                    <TableCell>{pessoa.email}</TableCell>
                    <TableCell>{pessoa.cargo}</TableCell>
                    <TableCell>{pessoa.setor}</TableCell>
                    <TableCell>
                      <Badge variant={pessoa.nivelAcesso === "Admin" ? "destructive" : "secondary"}>
                        {pessoa.nivelAcesso}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pessoa.status === "ativo" ? (
                        <UserCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>{pessoa.dataInclusao}</TableCell>
                    <TableCell className="flex items-center justify-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(pessoa)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Detalhes</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditPessoa(pessoa)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePessoa(pessoa.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Pessoa</DialogTitle>
            <DialogDescription>Visualize as informações completas da pessoa selecionada.</DialogDescription>
          </DialogHeader>
          {selectedPessoa && <DetalhesPessoa pessoa={selectedPessoa} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
