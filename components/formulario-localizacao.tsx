"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Localizacao, Setor } from "@/types/parametros"

interface FormularioLocalizacaoProps {
  localizacao?: Localizacao | null
  setores: Setor[]
  onSalvar: (localizacao: Localizacao) => void
  onCancelar: () => void
}

export function FormularioLocalizacao({ localizacao, setores, onSalvar, onCancelar }: FormularioLocalizacaoProps) {
  const [formData, setFormData] = useState({
    nome: localizacao?.nome || "",
    descricao: localizacao?.descricao || "",
    setor: localizacao?.setor || "",
    andar: localizacao?.andar || "",
    sala: localizacao?.sala || "",
    ativo: localizacao?.ativo ?? true,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novaLocalizacao: Localizacao = {
      id: localizacao?.id || Date.now().toString(),
      ...formData,
      dataInclusao: localizacao?.dataInclusao || new Date().toISOString(),
    }

    onSalvar(novaLocalizacao)
  }

  const setoresAtivos = setores.filter((setor) => setor.ativo)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Localização *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Sala de Servidores, Almoxarifado..."
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição detalhada da localização"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="setor">Setor *</Label>
            <Select value={formData.setor} onValueChange={(value) => handleInputChange("setor", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {setoresAtivos.map((setor) => (
                  <SelectItem key={setor.id} value={setor.nome}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="andar">Andar</Label>
              <Input
                id="andar"
                value={formData.andar}
                onChange={(e) => handleInputChange("andar", e.target.value)}
                placeholder="Ex: 1º, 2º, Térreo..."
              />
            </div>

            <div>
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={formData.sala}
                onChange={(e) => handleInputChange("sala", e.target.value)}
                placeholder="Ex: 101, 205, A1..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange("ativo", checked)}
            />
            <Label htmlFor="ativo">Localização ativa</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{localizacao ? "Atualizar" : "Salvar"} Localização</Button>
      </div>
    </form>
  )
}
