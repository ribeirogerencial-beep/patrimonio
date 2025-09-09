"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Categoria } from "@/types/parametros"

interface FormularioCategoriaProps {
  categoria?: Categoria | null
  onSalvar: (categoria: Categoria) => void
  onCancelar: () => void
}

export function FormularioCategoria({ categoria, onSalvar, onCancelar }: FormularioCategoriaProps) {
  const [formData, setFormData] = useState({
    nome: categoria?.nome || "",
    descricao: categoria?.descricao || "",
    taxaDepreciacao: categoria?.taxaDepreciacao || 10,
    // Ajusta a vida útil para meses, multiplicando por 12 se o valor original for em anos
    vidaUtil: (categoria?.vidaUtil || 10) * 12, // Assumindo que 10 era em anos, agora 120 meses
    ativo: categoria?.ativo ?? true,
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novaCategoria: Categoria = {
      id: categoria?.id || Date.now().toString(),
      ...formData,
      dataInclusao: categoria?.dataInclusao || new Date().toISOString(),
    }

    onSalvar(novaCategoria)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Equipamentos de Informática"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição detalhada da categoria"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxaDepreciacao">Taxa de Depreciação (% a.a.) *</Label>
              <Input
                id="taxaDepreciacao"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxaDepreciacao}
                onChange={(e) => handleInputChange("taxaDepreciacao", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="vidaUtil">Vida Útil (meses) *</Label>
              <Input
                id="vidaUtil"
                type="number"
                min="1"
                value={formData.vidaUtil}
                onChange={(e) => handleInputChange("vidaUtil", Number.parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">Categoria ativa</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{categoria ? "Atualizar" : "Salvar"} Categoria</Button>
      </div>
    </form>
  )
}
