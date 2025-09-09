"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Package, DollarSign, ScrollText, Calendar, Download, FileDown, ChevronLeft } from "lucide-react"
import type { Aluguel } from "@/types/aluguel"
import { formatarMoeda, formatarData } from "@/utils/export-utils" // Import formatarMoeda and formatarData
import { exportarDetalhesAluguelPDF } from "@/utils/custom-pdf-export" // Import PDF export function

export function DetalhesAluguel() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [aluguel, setAluguel] = useState<Aluguel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setLoading(true)
      try {
        // Changed from "alugueis-salvos" to "alugueis-sistema" based on app/alugueis/page.tsx
        const alugueisSalvos = JSON.parse(localStorage.getItem("alugueis-sistema") || "[]") as Aluguel[]
        const aluguelEncontrado = alugueisSalvos.find((a) => a.id === id)
        if (aluguelEncontrado) {
          setAluguel(aluguelEncontrado)
        } else {
          setError("Aluguel não encontrado.")
        }
      } catch (e) {
        console.error("Erro ao carregar aluguel do localStorage:", e)
        setError("Erro ao carregar detalhes do aluguel.")
      } finally {
        setLoading(false)
      }
    }
  }, [id])

  const handleDownloadPDF = () => {
    if (aluguel) {
      exportarDetalhesAluguelPDF(aluguel)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-600">Carregando detalhes do aluguel...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-red-600">
        <p>{error}</p>
      </div>
    )
  }

  if (!aluguel) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] text-gray-600">
        <p>Aluguel não selecionado.</p>
      </div>
    )
  }

  const dataInicio = aluguel.dataInicio ? new Date(aluguel.dataInicio) : null
  const dataFim = aluguel.dataFim ? new Date(aluguel.dataFim) : null

  // Calculate remaining days if dataFim is in the future
  let diasRestantes = 0
  if (dataFim && dataFim.getTime() > new Date().getTime()) {
    const diffTime = Math.abs(dataFim.getTime() - new Date().getTime())
    diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } else if (dataFim && dataFim.getTime() <= new Date().getTime()) {
    diasRestantes = 0 // Contrato expirado
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/alugueis")} className="text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Voltar para Aluguéis
        </Button>
        <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
          <FileDown className="w-4 h-4 mr-2" />
          Baixar Relatório PDF
        </Button>
      </div>

      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-white mb-1">{aluguel.nomeProduto}</CardTitle>
              <p className="text-blue-100">Código: {aluguel.codigoProduto}</p>
            </div>
            <div className="text-right">
              {diasRestantes > 0 ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-600">
                  Ativo
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Expirado
                </div>
              )}
              {diasRestantes > 0 && <p className="text-blue-100 text-sm mt-1">{diasRestantes} dias restantes</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Produto */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Package className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Código:</TableCell>
                    <TableCell>{aluguel.codigoProduto}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nome:</TableCell>
                    <TableCell>{aluguel.nomeProduto}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fornecedor:</TableCell>
                    <TableCell>{aluguel.nomeFornecedor}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nota Fiscal:</TableCell>
                    <TableCell>{aluguel.notaFiscal}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-md mb-3">
                <p className="text-sm text-green-800">Valor Mensal:</p>
                <p className="text-xl font-bold text-green-900">{formatarMoeda(aluguel.valorAluguel)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-md mb-3">
                <p className="text-sm text-blue-800">Valor Total do Contrato:</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatarMoeda(aluguel.valorAluguel * aluguel.prazoMeses)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-800">Prazo:</p>
                <p className="text-xl font-bold text-gray-900">{aluguel.prazoMeses} meses</p>
              </div>
            </CardContent>
          </Card>

          {/* Período do Contrato */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">Período do Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Data de Início:</TableCell>
                    <TableCell>{dataInicio ? formatarData(dataInicio.toISOString()) : "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data de Fim:</TableCell>
                    <TableCell>{dataFim ? formatarData(dataFim.toISOString()) : "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Duração:</TableCell>
                    <TableCell>{aluguel.prazoMeses} meses</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Arquivos */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <ScrollText className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg font-semibold text-gray-800">Arquivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Imagem do Produto:</p>
                  {aluguel.imagemProdutoUrl ? (
                    <img
                      src={aluguel.imagemProdutoUrl || "/placeholder.svg"}
                      alt="Imagem do Produto"
                      width={200}
                      height={120}
                      className="rounded-md object-cover border"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">
                      Nenhuma imagem
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Contrato/Anexo:</p>
                  {aluguel.contratoAnexoUrl ? (
                    <a href={aluguel.contratoAnexoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="w-4 h-4 mr-2" /> Baixar Anexo
                      </Button>
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum anexo disponível.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
