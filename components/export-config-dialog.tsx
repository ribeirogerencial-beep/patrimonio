"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FileText, Settings } from "lucide-react"

interface ExportField {
  key: string
  label: string
  enabled: boolean
  required?: boolean
}

interface ExportConfigDialogProps {
  onExport: (config: ExportConfig) => void
  defaultFields: ExportField[]
  title?: string
}

export interface ExportConfig {
  fields: ExportField[]
  orientation: "portrait" | "landscape"
  groupCredits: boolean
  includeMaintenance: boolean
}

export function ExportConfigDialog({
  onExport,
  defaultFields,
  title = "Configurar Exportação",
}: ExportConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<ExportField[]>(defaultFields)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [groupCredits, setGroupCredits] = useState(true)
  const [includeMaintenance, setIncludeMaintenance] = useState(true)

  const handleFieldToggle = (fieldKey: string, enabled: boolean) => {
    setFields((prev) => prev.map((field) => (field.key === fieldKey ? { ...field, enabled } : field)))
  }

  const handleExport = () => {
    const config: ExportConfig = {
      fields: fields.filter((field) => field.enabled),
      orientation,
      groupCredits,
      includeMaintenance,
    }
    onExport(config)
    setOpen(false)
  }

  const enabledFieldsCount = fields.filter((field) => field.enabled).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          <FileText className="h-4 w-4 mr-2" />
          PDF Personalizado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Campos */}
          <div>
            <Label className="text-sm font-medium">Campos do Relatório</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Selecione os campos que deseja incluir ({enabledFieldsCount} selecionados)
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={field.enabled}
                    disabled={field.required}
                    onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  />
                  <Label htmlFor={field.key} className={`text-sm ${field.required ? "text-muted-foreground" : ""}`}>
                    {field.label}
                    {field.required && <span className="text-xs ml-1">(obrigatório)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Orientação da Página */}
          <div>
            <Label className="text-sm font-medium">Orientação da Página</Label>
            <RadioGroup
              value={orientation}
              onValueChange={(value: "portrait" | "landscape") => setOrientation(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portrait" id="portrait" />
                <Label htmlFor="portrait" className="text-sm">
                  Retrato (Vertical)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landscape" id="landscape" />
                <Label htmlFor="landscape" className="text-sm">
                  Paisagem (Horizontal)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Opções Especiais */}
          <div>
            <Label className="text-sm font-medium">Opções Especiais</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="groupCredits"
                  checked={groupCredits}
                  onCheckedChange={(checked) => setGroupCredits(checked as boolean)}
                />
                <Label htmlFor="groupCredits" className="text-sm">
                  Agrupar ICMS, IPI, PIS e COFINS em "Total Créditos"
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMaintenance"
                  checked={includeMaintenance}
                  onCheckedChange={(checked) => setIncludeMaintenance(checked as boolean)}
                />
                <Label htmlFor="includeMaintenance" className="text-sm">
                  Incluir "Total Custo Manutenção"
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={enabledFieldsCount === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
