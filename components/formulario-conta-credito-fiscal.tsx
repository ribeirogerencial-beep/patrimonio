"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import type { ContaCreditoFiscal } from "@/types/parametros"

interface FormularioContaCreditoFiscalProps {
  contaCreditoFiscal?: ContaCreditoFiscal | null
  onSave: (contaCreditoFiscal: ContaCreditoFiscal) => void
  onCancel: () => void
}

export function FormularioContaCreditoFiscal({
  contaCreditoFiscal,
  onSave,
  onCancel,
}: FormularioContaCreditoFiscalProps) {
  const [formData, setFormData] = useState({
    codigo: contaCreditoFiscal?.codigo || "",
    descricao: contaCreditoFiscal?.descricao || "",
    ativo: contaCreditoFiscal?.ativo ?? true,
  })

  useEffect(() => {
    if (contaCreditoFiscal) {
      setFormData({
        codigo: contaCreditoFiscal.codigo,
        descricao: contaCreditoFiscal.descricao,
        ativo: contaCreditoFiscal.ativo,
      })
    }
  }, [contaCreditoFiscal])

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

    const newContaCreditoFiscal: ContaCreditoFiscal = {
      id: contaCreditoFiscal?.id || Date.now().toString(),
      ...formData,
      dataInclusao: contaCreditoFiscal?.dataInclusao || new Date().toISOString(),
    }

    onSave(newContaCreditoFiscal)
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
          placeholder="Descrição da conta de crédito fiscal"
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
        <Button type="submit">{contaCreditoFiscal ? "Atualizar" : "Salvar"}</Button>
      </div>
    </form>
  )
}
