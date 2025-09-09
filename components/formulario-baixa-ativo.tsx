"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Upload } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, differenceInMonths } from "date-fns" // Import differenceInMonths
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Ativo } from "@/types/ativo"
import type { AtivoBaixado } from "@/types/ativo-baixado"
import type { DepreciacaoCalculada } from "@/types/depreciacao"
import { parseVendaXML } from "@/utils/xml-parser"

// Add new types for monthly calculations, matching apuracao-creditos.tsx
interface CalculoMensal {
  mes: string
  valor: number
}

interface ApuracaoMensalSalva {
  id: string
  ativoId: string
  tipoImposto: string
  meses: number
  dataSalvamento: string
  calculosMensais: CalculoMensal[]
}

interface FormularioBaixaAtivoProps {
  ativosInativos: Ativo[]
  onBaixar: (baixa: AtivoBaixado) => void
  onCancelar: () => void
  initialData?: AtivoBaixado // Dados iniciais para edição/visualização
  mode?: "create" | "edit" | "view" // Modo do formulário
}

export function FormularioBaixaAtivo({
  ativosInativos,
  onBaixar,
  onCancelar,
  initialData,
  mode = "create",
}: FormularioBaixaAtivoProps) {
  const [ativoSelecionadoId, setAtivoSelecionadoId] = useState(initialData?.ativoId || "")
  const [numeroNotaFiscalVenda, setNumeroNotaFiscalVenda] = useState(initialData?.numeroNotaFiscalVenda || "")
  const [valorVenda, setValorVenda] = useState<number>(initialData?.valorVenda || 0)
  const [dataVenda, setDataVenda] = useState<Date | undefined>(
    initialData?.dataVenda ? new Date(initialData.dataVenda) : undefined,
  )
  const [xmlFile, setXmlFile] = useState<File | null>(null)
  const [ativos, setAtivos] = useState<Ativo[]>([]) // Todos os ativos para buscar dados
  const [apuracoesMensaisSalvas, setApuracoesMensaisSalvas] = useState<ApuracaoMensalSalva[]>([]) // Use the correct type and name
  const [depreciacoesSalvas, setDepreciacoesSalvas] = useState<DepreciacaoCalculada[]>([])

  // Estado para os resultados gerados
  const [valorCompraOriginal, setValorCompraOriginal] = useState(0)
  const [creditoIPI, setCreditoIPI] = useState(0)
  const [creditoICMS, setCreditoICMS] = useState(0)
  const [creditoPIS, setCreditoPIS] = useState(0)
  const [creditoCOFINS, setCreditoCOFINS] = useState(0)
  const [totalCreditos, setTotalCreditos] = useState(0)
  const [totalDepreciacaoAcumulada, setTotalDepreciacaoAcumulada] = useState(0)
  const [resultadoResidualContabil, setResultadoResidualContabil] = useState(0)
  const [ganhoOuPerda, setGanhoOuPerda] = useState(0)
  const [variacaoPercentual, setVariacaoPercentual] = useState(0)

  const isViewMode = mode === "view"
  const isEditMode = mode === "edit"

  useEffect(() => {
    const carregarDados = () => {
      const ativosSalvos = localStorage.getItem("ativos-imobilizados")
      if (ativosSalvos) {
        setAtivos(JSON.parse(ativosSalvos))
      }
      // Load apuracoes mensais salvas from the correct key
      const apuracoesSalvasData = localStorage.getItem("apuracoes-mensais-salvas")
      if (apuracoesSalvasData) {
        setApuracoesMensaisSalvas(JSON.parse(apuracoesSalvasData))
      }
      const depreciacoes = localStorage.getItem("depreciacoes-salvas")
      if (depreciacoes) {
        setDepreciacoesSalvas(JSON.parse(depreciacoes))
      }
    }
    carregarDados()
  }, [])

  useEffect(() => {
    if (initialData) {
      setAtivoSelecionadoId(initialData.ativoId)
      setNumeroNotaFiscalVenda(initialData.numeroNotaFiscalVenda || "")
      setValorVenda(initialData.valorVenda)
      setDataVenda(initialData.dataVenda ? new Date(initialData.dataVenda) : undefined)
    }
  }, [initialData])

  useEffect(() => {
    if (ativoSelecionadoId && dataVenda) {
      const ativo = ativos.find((a) => a.id === ativoSelecionadoId)
      if (!ativo) return

      // 1. Valor de Compra Original
      setValorCompraOriginal(ativo.valorTotal)

      // 2. Créditos (IPI, ICMS, PIS, COFINS)
      let totalIPI = 0
      let totalICMS = 0
      let totalPIS = 0
      let totalCOFINS = 0

      const apuracoesDoAtivo = apuracoesMensaisSalvas.filter(
        (ap) => ap.ativoId === ativo.id && new Date(ap.dataSalvamento) <= dataVenda,
      )

      apuracoesDoAtivo.forEach((ap) => {
        const dataInicioApuracao = new Date(ap.dataSalvamento)
        // Calculate the number of full months between the start of the calculation and the sale date
        const mesesPassados = differenceInMonths(dataVenda, dataInicioApuracao)

        // Sum credits for the months passed, up to the total months in the calculation
        let creditoAcumulado = 0
        for (let i = 0; i < Math.min(mesesPassados + 1, ap.calculosMensais.length); i++) {
          creditoAcumulado += ap.calculosMensais[i].valor
        }

        if (ap.tipoImposto.toLowerCase() === "ipi") totalIPI += creditoAcumulado
        if (ap.tipoImposto.toLowerCase() === "icms") totalICMS += creditoAcumulado
        if (ap.tipoImposto.toLowerCase() === "pis") totalPIS += creditoAcumulado
        if (ap.tipoImposto.toLowerCase() === "cofins") totalCOFINS += creditoAcumulado
      })

      setCreditoIPI(totalIPI)
      setCreditoICMS(totalICMS)
      setCreditoPIS(totalPIS)
      setCreditoCOFINS(totalCOFINS)
      const totalCred = totalIPI + totalICMS + totalPIS + totalCOFINS
      setTotalCreditos(totalCred)

      // 3. Depreciação Acumulada
      let depreciacaoAcumulada = 0
      const depreciacoesDoAtivo = depreciacoesSalvas.filter(
        (dep) => dep.ativoId === ativo.id && new Date(dep.data) <= dataVenda,
      )
      depreciacoesDoAtivo.forEach((dep) => {
        depreciacaoAcumulada += dep.valorDepreciado
      })
      setTotalDepreciacaoAcumulada(depreciacaoAcumulada)

      // 4. Resultado Residual Contábil
      const resultadoResidual = ativo.valorTotal - totalCred - depreciacaoAcumulada
      setResultadoResidualContabil(resultadoResidual)

      // 5. Ganho ou Perda
      const ganhoPerda = valorVenda - resultadoResidual
      setGanhoOuPerda(ganhoPerda)

      // 6. Variação Percentual
      const variacao = resultadoResidual !== 0 ? (ganhoPerda / resultadoResidual) * 100 : 0
      setVariacaoPercentual(variacao)
    } else {
      // Reset results if no asset or date is selected
      setValorCompraOriginal(0)
      setCreditoIPI(0)
      setCreditoICMS(0)
      setCreditoPIS(0)
      setCreditoCOFINS(0)
      setTotalCreditos(0)
      setTotalDepreciacaoAcumulada(0)
      setResultadoResidualContabil(0)
      setGanhoOuPerda(0)
      setVariacaoPercentual(0)
    }
  }, [ativoSelecionadoId, valorVenda, dataVenda, ativos, apuracoesMensaisSalvas, depreciacoesSalvas])

  const handleXmlUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setXmlFile(file)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const xmlString = e.target?.result as string
        try {
          const parsedData = parseVendaXML(xmlString)
          if (parsedData.numeroNotaFiscal) setNumeroNotaFiscalVenda(parsedData.numeroNotaFiscal)
          if (parsedData.valorVenda) setValorVenda(parsedData.valorVenda)
          if (parsedData.dataVenda) setDataVenda(new Date(parsedData.dataVenda))
        } catch (error) {
          console.error("Erro ao parsear XML:", error)
          alert("Erro ao ler o arquivo XML. Verifique o formato.")
        }
      }
      reader.readAsText(file)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ativoSelecionadoId || !dataVenda || valorVenda === undefined) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    const ativoOriginal = ativos.find((a) => a.id === ativoSelecionadoId)
    if (!ativoOriginal) {
      alert("Ativo selecionado não encontrado.")
      return
    }

    const novaBaixa: AtivoBaixado = {
      id: initialData?.id || crypto.randomUUID(), // Reutiliza ID se for edição
      ativoId: ativoSelecionadoId,
      codigoAtivo: ativoOriginal.codigo,
      nomeAtivo: ativoOriginal.nome,
      numeroNotaFiscalVenda: numeroNotaFiscalVenda,
      valorVenda: valorVenda,
      dataVenda: dataVenda.toISOString().split("T")[0], // Formato YYYY-MM-DD
      dataBaixa: initialData?.dataBaixa || new Date().toISOString(), // Mantém data original se for edição
      valorCompraOriginal,
      totalCreditos,
      creditoIPI,
      creditoICMS,
      creditoPIS,
      creditoCOFINS,
      totalDepreciacaoAcumulada,
      resultadoResidualContabil,
      ganhoOuPerda,
      variacaoPercentual,
    }

    onBaixar(novaBaixa)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ativoInativo">Ativo Inativo</Label>
          {isEditMode || isViewMode ? (
            <Input
              id="ativoInativo"
              value={`${ativos.find((a) => a.id === ativoSelecionadoId)?.codigo} - ${ativos.find((a) => a.id === ativoSelecionadoId)?.nome}`}
              readOnly
              disabled
            />
          ) : (
            <Select onValueChange={setAtivoSelecionadoId} value={ativoSelecionadoId} disabled={isViewMode}>
              <SelectTrigger id="ativoInativo">
                <SelectValue placeholder="Selecione um ativo inativo" />
              </SelectTrigger>
              <SelectContent>
                {ativosInativos.map((ativo) => (
                  <SelectItem key={ativo.id} value={ativo.id}>
                    {ativo.codigo} - {ativo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="xmlUpload">Importar XML da Nota Fiscal</Label>
          <div className="flex items-center gap-2">
            <Input
              id="xmlUpload"
              type="file"
              accept=".xml"
              onChange={handleXmlUpload}
              className="flex-1"
              disabled={isViewMode}
            />
            <Button type="button" variant="outline" size="icon" disabled={isViewMode}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroNotaFiscalVenda">Número da Nota Fiscal de Venda</Label>
          <Input
            id="numeroNotaFiscalVenda"
            placeholder="Ex: 123456"
            value={numeroNotaFiscalVenda}
            onChange={(e) => setNumeroNotaFiscalVenda(e.target.value)}
            disabled={isViewMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorVenda">Valor da Venda</Label>
          <Input
            id="valorVenda"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={valorVenda}
            onChange={(e) => setValorVenda(Number.parseFloat(e.target.value))}
            disabled={isViewMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataVenda">Data da Venda</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !dataVenda && "text-muted-foreground")}
                disabled={isViewMode}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataVenda ? format(dataVenda, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dataVenda}
                onSelect={setDataVenda}
                initialFocus
                locale={ptBR}
                disabled={isViewMode}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {ativoSelecionadoId && dataVenda && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Resultado Gerado</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="font-medium">Compra</div>
            <div className="text-right">{formatarMoeda(valorCompraOriginal)}</div>

            <div className="col-span-2 font-medium mt-2">Créditos</div>
            <div className="ml-4">IPI</div>
            <div className="text-right">{formatarMoeda(creditoIPI)}</div>
            <div className="ml-4">ICMS</div>
            <div className="text-right">{formatarMoeda(creditoICMS)}</div>
            <div className="ml-4">PIS</div>
            <div className="text-right">{formatarMoeda(creditoPIS)}</div>
            <div className="ml-4">COFINS</div>
            <div className="text-right">{formatarMoeda(creditoCOFINS)}</div>
            <div className="font-medium">Total Créditos</div>
            <div className="text-right font-medium">{formatarMoeda(totalCreditos)}</div>

            <div className="font-medium mt-2">Depreciação</div>
            <div className="text-right mt-2">{formatarMoeda(totalDepreciacaoAcumulada)}</div>

            <div className="font-bold text-base mt-2">Resultado Residual (Contábil)</div>
            <div className="text-right font-bold text-base mt-2">{formatarMoeda(resultadoResidualContabil)}</div>

            <div className="font-bold text-base mt-2">Venda Realizada</div>
            <div className="text-right font-bold text-base mt-2">{formatarMoeda(valorVenda)}</div>

            <div className="font-bold text-lg mt-2">Ganho ou Perda</div>
            <div
              className={cn("text-right font-bold text-lg mt-2", ganhoOuPerda >= 0 ? "text-green-600" : "text-red-600")}
            >
              {formatarMoeda(ganhoOuPerda)}
            </div>

            <div className="font-medium">Variação %</div>
            <div className={cn("text-right font-medium", variacaoPercentual >= 0 ? "text-green-600" : "text-red-600")}>
              {variacaoPercentual.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {!isViewMode && (
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit">{isEditMode ? "Salvar Alterações" : "Registrar Baixa"}</Button>
        </div>
      )}
    </form>
  )
}
