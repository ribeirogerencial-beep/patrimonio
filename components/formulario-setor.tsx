"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Setor } from "@/types/parametros"

interface FormularioSetorProps {
  setor?: Setor | null
  onSalvar: (setor: Setor) => void
  onCancelar: () => void
}

export function FormularioSetor({ setor, onSalvar, onCancelar }: FormularioSetorProps) {
  const [formData, setFormData] = useState({
    nome: setor?.nome || "",
    descricao: setor?.descricao || "",
    responsavel: setor?.responsavel || "",
    ativo: setor?.ativo ?? true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novoSetor: Setor = {
      id: setor?.id || Date.now().toString(),
      ...formData,
      dataInclusao: setor?.dataInclusao || new Date().toISOString(),
    }

    onSalvar(novoSetor)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Setor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Setor *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Tecnologia da Informação"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição das atividades do setor"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => handleInputChange("responsavel", e.target.value)}
              placeholder="Nome do responsável pelo setor"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">Setor ativo</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{setor ? "Atualizar" : "Salvar"} Setor</Button>
      </div>
    </form>
  )
}
