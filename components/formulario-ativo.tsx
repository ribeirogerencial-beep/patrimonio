"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, FileText } from "lucide-react"
import type { Ativo } from "@/types/ativo"
import type { Categoria, Setor, Localizacao, ContaContabil } from "@/types/parametros" // Import ContaContabil
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useParametros } from "@/hooks/use-parametros"

interface FormularioAtivoProps {
  ativo?: Ativo | null
  onSalvar: (ativo: Ativo) => void
  onCancelar: () => void
}

export function FormularioAtivo({ ativo, onSalvar, onCancelar }: FormularioAtivoProps) {
  const { 
    categorias, 
    setores, 
    localizacoes, 
    contasContabeis, 
    loading: parametrosLoading, 
    error: parametrosError 
  } = useParametros()

  const [formData, setFormData] = useState({
    codigo: ativo?.codigo || "",
    nome: ativo?.nome || "",
    descricao: ativo?.descricao || "",
    dataAquisicao: ativo?.dataAquisicao || "",
    notaFiscal: ativo?.notaFiscal || "",
    valorTotal: ativo?.valorTotal || 0,
    valorIPI: ativo?.valorIPI || 0,
    valorPIS: ativo?.valorPIS || 0,
    valorCOFINS: ativo?.valorCOFINS || 0,
    valorICMS: ativo?.valorICMS || 0,
    setorDestino: ativo?.setorDestino || "",
    categoria: ativo?.categoria || "",
    localizacao: ativo?.localizacao || "",
    classificacaoContabil: ativo?.classificacaoContabil || "",
    contaContabilSintetica: ativo?.contaContabilSintetica || "", // New field
  })

  const [anexo, setAnexo] = useState<File | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [anexoPreview, setAnexoPreview] = useState(ativo?.anexo || "")
  const [fotoPreview, setFotoPreview] = useState(ativo?.foto || "")

  const anexoInputRef = useRef<HTMLInputElement>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)
  const xmlInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (file: File | null, tipo: "anexo" | "foto") => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (tipo === "anexo") {
        setAnexo(file)
        setAnexoPreview(result)
      } else {
        setFoto(file)
        setFotoPreview(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removerArquivo = (tipo: "anexo" | "foto") => {
    if (tipo === "anexo") {
      setAnexo(null)
      setAnexoPreview("")
      if (anexoInputRef.current) anexoInputRef.current.value = ""
    } else {
      setFoto(null)
      setFotoPreview("")
      if (fotoInputRef.current) fotoInputRef.current.value = ""
    }
  }

  const handleXmlImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const xmlString = event.target?.result as string
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, "text/xml")

        // Check for parsing errors
        const errorNode = xmlDoc.querySelector("parsererror")
        if (errorNode) {
          toast({
            title: "Erro na importação do XML",
            description: "Não foi possível analisar o arquivo XML. Verifique se o formato está correto.",
            variant: "destructive",
          })
          return
        }

        // Extract data from XML (simulated NF-e structure)
        const prodName = xmlDoc.querySelector("prod > xProd")?.textContent || ""
        const issueDate = xmlDoc.querySelector("ide > dhEmi")?.textContent?.substring(0, 10) || "" // YYYY-MM-DD
        const invoiceNumber = xmlDoc.querySelector("ide > nNF")?.textContent || ""

        const totalValue = Number.parseFloat(xmlDoc.querySelector("ICMSTot > vNF")?.textContent || "0")
        const ipiValue = Number.parseFloat(xmlDoc.querySelector("ICMSTot > vIPI")?.textContent || "0")
        const pisValue = Number.parseFloat(xmlDoc.querySelector("ICMSTot > vPIS")?.textContent || "0")
        const cofinsValue = Number.parseFloat(xmlDoc.querySelector("ICMSTot > vCOFINS")?.textContent || "0")
        const icmsValue = Number.parseFloat(xmlDoc.querySelector("ICMSTot > vICMS")?.textContent || "0")

        setFormData((prev) => ({
          ...prev,
          nome: prodName,
          dataAquisicao: issueDate,
          notaFiscal: invoiceNumber,
          valorTotal: isNaN(totalValue) ? 0 : totalValue,
          valorIPI: isNaN(ipiValue) ? 0 : ipiValue,
          valorPIS: isNaN(pisValue) ? 0 : pisValue,
          valorCOFINS: isNaN(cofinsValue) ? 0 : cofinsValue,
          valorICMS: isNaN(icmsValue) ? 0 : icmsValue,
        }))

        toast({
          title: "Importação XML Concluída",
          description: "Os dados da nota fiscal foram preenchidos com sucesso.",
        })
      } catch (error) {
        console.error("Erro ao importar XML:", error)
        toast({
          title: "Erro na importação do XML",
          description: "Ocorreu um erro ao processar o arquivo XML.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const novoAtivo: Ativo = {
      id: ativo?.id || Date.now().toString(),
      ...formData,
      anexo: anexoPreview,
      foto: fotoPreview,
      dataAtualizacao: new Date().toISOString(),
    }

    onSalvar(novoAtivo)
  }

  if (parametrosLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando parâmetros...</p>
        </div>
      </div>
    )
  }

  if (parametrosError) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Erro ao carregar parâmetros</p>
          <p className="text-sm">{parametrosError}</p>
        </div>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Fechar
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="codigo">Código do Produto *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                placeholder="Ex: AT001"
                required
              />
            </div>
            <div>
              <Label htmlFor="nome">Nome do Produto *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Ex: Computador Desktop"
                required
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descrição detalhada do produto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="classificacaoContabil">Classificação Contábil</Label>
              <Input
                id="classificacaoContabil"
                value={formData.classificacaoContabil}
                onChange={(e) => handleInputChange("classificacaoContabil", e.target.value)}
                placeholder="Ex: 1.1.01.001"
              />
            </div>
            {/* New field for Conta sintética Contábil */}
            <div>
              <Label htmlFor="contaContabilSintetica">Conta Sintética Contábil</Label>
              <Select
                value={formData.contaContabilSintetica}
                onValueChange={(value) => handleInputChange("contaContabilSintetica", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta contábil" />
                </SelectTrigger>
                <SelectContent>
                  {contasContabeis
                    .filter((c) => c.ativo)
                    .map((conta) => (
                      <SelectItem key={conta.id} value={conta.codigo}>
                        {conta.codigo} - {conta.descricao}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados de Aquisição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias
                    .filter((c) => c.ativo)
                    .map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataAquisicao">Data de Aquisição *</Label>
              <Input
                id="dataAquisicao"
                type="date"
                value={formData.dataAquisicao}
                onChange={(e) => handleInputChange("dataAquisicao", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notaFiscal">Número da Nota Fiscal</Label>
              <Input
                id="notaFiscal"
                value={formData.notaFiscal}
                onChange={(e) => handleInputChange("notaFiscal", e.target.value)}
                placeholder="Ex: 123456"
              />
            </div>
            <div>
              <Label htmlFor="setorDestino">Setor Destino *</Label>
              <Select value={formData.setorDestino} onValueChange={(value) => handleInputChange("setorDestino", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores
                    .filter((s) => s.ativo)
                    .map((setor) => (
                      <SelectItem key={setor.id} value={setor.nome}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Select value={formData.localizacao} onValueChange={(value) => handleInputChange("localizacao", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  {localizacoes
                    .filter((l) => l.ativo)
                    .map((localizacao) => (
                      <SelectItem key={localizacao.id} value={localizacao.nome}>
                        {localizacao.nome} - {localizacao.setor}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valores Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="valorTotal">Valor Total *</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorTotal}
                onChange={(e) => handleInputChange("valorTotal", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="valorIPI">Valor IPI</Label>
              <Input
                id="valorIPI"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorIPI}
                onChange={(e) => handleInputChange("valorIPI", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="valorPIS">Valor PIS</Label>
              <Input
                id="valorPIS"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorPIS}
                onChange={(e) => handleInputChange("valorPIS", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="valorCOFINS">Valor COFINS</Label>
              <Input
                id="valorCOFINS"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorCOFINS}
                onChange={(e) => handleInputChange("valorCOFINS", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="valorICMS">Valor ICMS</Label>
              <Input
                id="valorICMS"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorICMS}
                onChange={(e) => handleInputChange("valorICMS", Number.parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar Dados da Nota Fiscal (XML)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => xmlInputRef.current?.click()} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Importar XML da Nota Fiscal
              </Button>
            </div>
            <input ref={xmlInputRef} type="file" accept=".xml" onChange={handleXmlImport} className="hidden" />
            <p className="text-sm text-muted-foreground">
              Importe um arquivo XML da nota fiscal para preencher automaticamente os campos de nome do produto, data de
              aquisição, número da nota fiscal e valores fiscais.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Anexo da Nota Fiscal</CardTitle>
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
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, "anexo")}
                className="hidden"
              />
              {anexoPreview && <div className="text-sm text-muted-foreground">Arquivo selecionado</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fotoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Foto
                </Button>
                {fotoPreview && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerArquivo("foto")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, "foto")}
                className="hidden"
              />
              {fotoPreview && (
                <div className="relative">
                  <img
                    src={fotoPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{ativo ? "Atualizar" : "Salvar"} Ativo</Button>
      </div>
    </form>
  )
}
