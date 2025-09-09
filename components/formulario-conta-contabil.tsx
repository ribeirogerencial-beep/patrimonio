"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import type { ContaContabil } from "@/types/parametros"

interface FormularioContaContabilProps {
  contaContabil?: ContaContabil | null
  onSave: (contaContabil: ContaContabil) => void
  onCancel: () => void
}

export function FormularioContaContabil({ contaContabil, onSave, onCancel }: FormularioContaContabilProps) {
  const [formData, setFormData] = useState({
    codigo: contaContabil?.codigo || "",
    descricao: contaContabil?.descricao || "",
    ativo: contaContabil?.ativo ?? true,
  })

  useEffect(() => {
    if (contaContabil) {
      setFormData({
        codigo: contaContabil.codigo,
        descricao: contaContabil.descricao,
        ativo: contaContabil.ativo,
      })
    }
  }, [contaContabil])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.codigo || !formData.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const newContaContabil: ContaContabil = {
      id: contaContabil?.id || Date.now().toString(),
      ...formData,
      dataInclusao: contaContabil?.dataInclusao || new Date().toISOString(),
    }

    onSave(newContaContabil)
    onCancel() // Close dialog after saving
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="codigo">Código da Conta *</Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e) => handleInputChange("codigo", e.target.value)}
          placeholder="Ex: 1.1.01.001"
          required
        />
      </div>
      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange("descricao", e.target.value)}
          placeholder="Descrição da conta contábil"
          rows={3}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => handleInputChange("ativo", checked)}
        />
        <Label htmlFor="ativo">Ativo</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{contaContabil ? "Atualizar" : "Salvar"}</Button>
      </div>
    </form>
  )
}
