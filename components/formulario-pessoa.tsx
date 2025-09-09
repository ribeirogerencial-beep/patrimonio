"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Pessoa } from "@/types/pessoa"

interface FormularioPessoaProps {
  pessoa?: Pessoa | null
  onSalvar: (pessoa: Pessoa) => void
  onCancelar: () => void
}

export function FormularioPessoa({ pessoa, onSalvar, onCancelar }: FormularioPessoaProps) {
  const [formData, setFormData] = useState({
    nome: pessoa?.nome || "",
    email: pessoa?.email || "",
    telefone: pessoa?.telefone || "",
    cargo: pessoa?.cargo || "",
    setor: pessoa?.setor || "",
    nivelAcesso: pessoa?.nivelAcesso || ("usuario" as const),
    ativo: pessoa?.ativo ?? true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novaPessoa: Pessoa = {
      id: pessoa?.id || Date.now().toString(),
      ...formData,
      dataInclusao: pessoa?.dataInclusao || new Date().toISOString(),
      dataUltimoAcesso: pessoa?.dataUltimoAcesso,
    }

    onSalvar(novaPessoa)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Ex: João Silva Santos"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Ex: joao.silva@empresa.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                placeholder="Ex: Analista de TI"
                required
              />
            </div>
            <div>
              <Label htmlFor="setor">Setor *</Label>
              <Input
                id="setor"
                value={formData.setor}
                onChange={(e) => handleInputChange("setor", e.target.value)}
                placeholder="Ex: Tecnologia da Informação"
                required
              />
            </div>
            <div>
              <Label htmlFor="nivelAcesso">Nível de Acesso</Label>
              <Select
                value={formData.nivelAcesso}
                onValueChange={(value: "admin" | "usuario" | "visualizador") => handleInputChange("nivelAcesso", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                <p>• Visualizador: Apenas visualização</p>
                <p>• Usuário: Visualização e edição</p>
                <p>• Administrador: Acesso completo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">Usuário ativo no sistema</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Usuários inativos não conseguem acessar o sistema</p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{pessoa ? "Atualizar" : "Salvar"} Pessoa</Button>
      </div>
    </form>
  )
}
