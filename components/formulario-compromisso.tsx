"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { CalendarIcon, Save, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Compromisso, SimpleEntity } from "@/types/compromisso"
import { cn } from "@/lib/utils"

interface FormularioCompromissoProps {
  compromisso?: Compromisso | null
  onSave: (compromisso: Compromisso) => void
  onCancel: () => void
}

export function FormularioCompromisso({
  compromisso: initialCompromisso,
  onSave,
  onCancel,
}: FormularioCompromissoProps) {
  const [compromisso, setCompromisso] = useState<Compromisso>(
    initialCompromisso || {
      id: uuidv4(),
      title: "",
      date: new Date().toISOString(),
      relatedTo: "ativo", // Default
    },
  )
  const [dataSelecionada, setDataSelecionada] = useState<Date>(
    initialCompromisso ? new Date(initialCompromisso.date) : new Date(),
  )
  const [entidadesRelacionadas, setEntidadesRelacionadas] = useState<SimpleEntity[]>([])

  useEffect(() => {
    // Load related entities based on 'relatedTo' type
    const loadEntities = () => {
      let data: any[] = []
      try {
        switch (compromisso.relatedTo) {
          case "ativo":
            data = JSON.parse(localStorage.getItem("ativos-imobilizados") || "[]")
            break
          case "credito":
            data = JSON.parse(localStorage.getItem("apuracoes-creditos") || "[]")
            break
          case "depreciacao":
            data = JSON.parse(localStorage.getItem("depreciacoes-salvas") || "[]")
            break
          case "manutencao":
            // Manutencao data is stored per ativo. Need to aggregate.
            const ativos = JSON.parse(localStorage.getItem("ativos-imobilizados") || "[]")
            data = ativos.flatMap((ativo: { id: string }) => {
              const manutencoes = JSON.parse(localStorage.getItem(`manutencoes-${ativo.id}`) || "[]")
              return manutencoes.map((m: any) => ({ ...m, title: `Manutenção ${m.tipo} - ${ativo.nome}` }))
            })
            break
          case "reavaliacao":
            // Assuming reavaliacao also has a list in localStorage
            data = JSON.parse(localStorage.getItem("reavaliacoes-salvas") || "[]")
            break
          case "aluguel":
            data = JSON.parse(localStorage.getItem("alugueis-salvos") || "[]")
            break
          default:
            data = []
        }
      } catch (e) {
        console.error("Failed to parse localStorage data for related entities", e)
        data = []
      }

      setEntidadesRelacionadas(
        data.map((item: any) => ({
          id: item.id,
          nome: item.nome || item.title || item.codigo || item.id, // Fallback to ID
        })),
      )
    }

    loadEntities()
  }, [compromisso.relatedTo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompromisso((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "relatedTo") {
      setCompromisso((prev) => ({ ...prev, [name]: value, relatedEntityId: undefined, relatedEntityName: undefined }))
    } else if (name === "relatedEntityId") {
      const selectedEntity = entidadesRelacionadas.find((e) => e.id === value)
      setCompromisso((prev) => ({ ...prev, [name]: value, relatedEntityName: selectedEntity?.nome || value }))
    } else {
      setCompromisso((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDataSelecionada(date)
      setCompromisso((prev) => ({ ...prev, date: date.toISOString() }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(compromisso)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="title">Título do Compromisso</Label>
        <Input id="title" name="title" value={compromisso.title} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          value={compromisso.description || ""}
          onChange={handleChange}
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="date">Data e Hora</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !dataSelecionada && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataSelecionada ? format(dataSelecionada, "PPP HH:mm", { locale: ptBR }) : <span>Escolha uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dataSelecionada} onSelect={handleDateSelect} initialFocus />
            {/* Simple time input, consider a more robust time picker for production */}
            <div className="p-2 border-t flex items-center gap-2">
              <Label htmlFor="time">Hora:</Label>
              <Input
                id="time"
                type="time"
                value={format(dataSelecionada, "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":").map(Number)
                  const newDate = new Date(dataSelecionada)
                  newDate.setHours(hours, minutes)
                  handleDateSelect(newDate)
                }}
                className="w-24"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="relatedTo">Relacionado a</Label>
        <Select
          name="relatedTo"
          value={compromisso.relatedTo}
          onValueChange={(value) => handleSelectChange("relatedTo", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="credito">Crédito</SelectItem>
            <SelectItem value="depreciacao">Depreciação</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
            <SelectItem value="reavaliacao">Reavaliação</SelectItem>
            <SelectItem value="aluguel">Aluguel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {entidadesRelacionadas.length > 0 && (
        <div>
          <Label htmlFor="relatedEntityId">Item Relacionado (opcional)</Label>
          <Select
            name="relatedEntityId"
            value={compromisso.relatedEntityId || ""}
            onValueChange={(value) => handleSelectChange("relatedEntityId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um item" />
            </SelectTrigger>
            <SelectContent>
              {entidadesRelacionadas.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="color">Cor (opcional)</Label>
        <Select
          name="color"
          value={compromisso.color || ""}
          onValueChange={(value) => handleSelectChange("color", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma cor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bg-blue-500">Azul</SelectItem>
            <SelectItem value="bg-green-500">Verde</SelectItem>
            <SelectItem value="bg-red-500">Vermelho</SelectItem>
            <SelectItem value="bg-purple-500">Roxo</SelectItem>
            <SelectItem value="bg-yellow-500">Amarelo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" /> Salvar Compromisso
        </Button>
      </div>
    </form>
  )
}
