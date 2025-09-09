"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Calendar, DollarSign, FileText, ImageIcon } from "lucide-react"
import type { Aluguel } from "@/types/aluguel"

interface FormularioAluguelProps {
  aluguel?: Aluguel | null
  onSalvar: (aluguel: Aluguel) => void
  onCancelar: () => void
}

export function FormularioAluguel({ aluguel, onSalvar, onCancelar }: FormularioAluguelProps) {
  const [formData, setFormData] = useState({
    codigoProduto: aluguel?.codigoProduto || "",
    nomeProduto: aluguel?.nomeProduto || "",
    nomeFornecedor: aluguel?.nomeFornecedor || "",
    notaFiscal: aluguel?.notaFiscal || "",
    valorAluguel: aluguel?.valorAluguel || 0,
    prazoMeses: aluguel?.prazoMeses || 12,
    dataInicio: aluguel?.dataInicio || new Date().toISOString().split("T")[0],
  })

  const [imagemProduto, setImagemProduto] = useState<File | null>(null)
  const [anexo, setAnexo] = useState<File | null>(null)
  const [imagemPreview, setImagemPreview] = useState(aluguel?.imagemProduto || "")
  const [anexoPreview, setAnexoPreview] = useState(aluguel?.anexo || "")

  const imagemInputRef = useRef<HTMLInputElement>(null)
  const anexoInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (file: File | null, tipo: "imagem" | "anexo") => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (tipo === "imagem") {
        setImagemProduto(file)
        setImagemPreview(result)
      } else {
        setAnexo(file)
        setAnexoPreview(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removerArquivo = (tipo: "imagem" | "anexo") => {
    if (tipo === "imagem") {
      setImagemProduto(null)
      setImagemPreview("")
      if (imagemInputRef.current) imagemInputRef.current.value = ""
    } else {
      setAnexo(null)
      setAnexoPreview("")
      if (anexoInputRef.current) anexoInputRef.current.value = ""
    }
  }

  const calcularDataFim = (dataInicio: string, prazoMeses: number) => {
    const data = new Date(dataInicio)
    data.setMonth(data.getMonth() + prazoMeses)
    return data.toISOString().split("T")[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.codigoProduto || !formData.nomeProduto || !formData.nomeFornecedor) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    const dataFim = calcularDataFim(formData.dataInicio, formData.prazoMeses)

    const novoAluguel: Aluguel = {
      id: aluguel?.id || Date.now().toString(),
      ...formData,
      dataFim,
      imagemProduto: imagemPreview,
      anexo: anexoPreview,
      status: "ativo",
      dataInclusao: aluguel?.dataInclusao || new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    }

    onSalvar(novoAluguel)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="codigoProduto">Código do Produto *</Label>
              <Input
                id="codigoProduto"
                value={formData.codigoProduto}
                onChange={(e) => handleInputChange("codigoProduto", e.target.value)}
                placeholder="Ex: AL001"
                required
              />
            </div>
            <div>
              <Label htmlFor="nomeProduto">Nome do Produto *</Label>
              <Input
                id="nomeProduto"
                value={formData.nomeProduto}
                onChange={(e) => handleInputChange("nomeProduto", e.target.value)}
                placeholder="Ex: Notebook Dell Inspiron"
                required
              />
            </div>
            <div>
              <Label htmlFor="nomeFornecedor">Nome do Fornecedor *</Label>
              <Input
                id="nomeFornecedor"
                value={formData.nomeFornecedor}
                onChange={(e) => handleInputChange("nomeFornecedor", e.target.value)}
                placeholder="Ex: Empresa de Locação LTDA"
                required
              />
            </div>
            <div>
              <Label htmlFor="notaFiscal">Nota Fiscal</Label>
              <Input
                id="notaFiscal"
                value={formData.notaFiscal}
                onChange={(e) => handleInputChange("notaFiscal", e.target.value)}
                placeholder="Ex: 123456"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dados do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valorAluguel">Valor do Aluguel Mensal *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="valorAluguel"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorAluguel}
                  onChange={(e) => handleInputChange("valorAluguel", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="prazoMeses">Prazo em Meses *</Label>
              <Input
                id="prazoMeses"
                type="number"
                min="1"
                max="120"
                value={formData.prazoMeses}
                onChange={(e) => handleInputChange("prazoMeses", Number.parseInt(e.target.value) || 1)}
                placeholder="12"
                required
              />
            </div>
            <div>
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                required
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Data de Fim (Calculada):</Label>
              <p className="text-lg font-semibold">
                {new Date(calcularDataFim(formData.dataInicio, formData.prazoMeses)).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagem do Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imagemInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Button>
                {imagemPreview && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerArquivo("imagem")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={imagemInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, "imagem")}
                className="hidden"
              />
              {imagemPreview && (
                <div className="relative">
                  <img
                    src={imagemPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Anexo do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => anexoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Anexo
                </Button>
                {anexoPreview && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerArquivo("anexo")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={anexoInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, "anexo")}
                className="hidden"
              />
              {anexoPreview && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Arquivo anexado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Valor Mensal:</span>
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(formData.valorAluguel)}
              </p>
            </div>
            <div>
              <span className="font-medium">Valor Total:</span>
              <p className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  formData.valorAluguel * formData.prazoMeses,
                )}
              </p>
            </div>
            <div>
              <span className="font-medium">Duração:</span>
              <p className="text-lg font-bold">{formData.prazoMeses} meses</p>
            </div>
            <div>
              <span className="font-medium">Vencimento:</span>
              <p className="text-lg font-bold text-orange-600">
                {new Date(calcularDataFim(formData.dataInicio, formData.prazoMeses)).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{aluguel ? "Atualizar" : "Salvar"} Aluguel</Button>
      </div>
    </form>
  )
}
