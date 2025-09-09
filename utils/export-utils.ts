import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import type { Ativo } from "@/types/ativo"
import type { SyntheticAccount } from "@/types/balanco-patrimonial"
import type { CreditoCalculado } from "@/types/credito"

// Função para formatar moeda
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

// Função para formatar data
export function formatarData(dataString: string): string {
  if (!dataString) return ""
  const date = new Date(dataString)
  if (isNaN(date.getTime())) {
    return "Data Inválida"
  }
  return format(date, "dd/MM/yyyy")
}

// Função para formatar data e hora
export function formatarDataHora(dataHoraString: string): string {
  if (!dataHoraString) return ""
  const date = new Date(dataHoraString)
  if (isNaN(date.getTime())) {
    return "Data Inválida"
  }
  const dia = String(date.getDate()).padStart(2, "0")
  const mes = String(date.getMonth() + 1).padStart(2, "0")
  const ano = date.getFullYear()
  const horas = String(date.getHours()).padStart(2, "0")
  const minutos = String(date.getMinutes()).padStart(2, "0")
  const segundos = String(date.getSeconds()).padStart(2, "0")
  return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`
}

// Função genérica para exportar Excel
export const exportarExcel = (dados: any[], nomeArquivo: string, nomeAba = "Dados") => {
  try {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dados)

    const colWidths = Object.keys(dados[0] || {}).map(() => ({ wch: 20 }))
    ws["!cols"] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, nomeAba)

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = nomeArquivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Erro ao exportar Excel:", error)
  }
}

// Função genérica para exportar PDF
export const exportarPDF = (
  titulo: string,
  dados: any[],
  colunas: string[],
  nomeArquivo: string,
  orientacao: "portrait" | "landscape" = "portrait",
) => {
  try {
    const doc = new jsPDF(orientacao)

    doc.setFontSize(16)
    doc.text(titulo, 20, 20)

    doc.setFontSize(10)
    doc.text(`Gerado em: ${formatarDataHora(new Date().toISOString())}`, 20, 30)
    autoTable(doc, {
      head: [colunas],
      body: dados,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(nomeArquivo)
  } catch (error) {
    console.error("Erro ao exportar PDF:", error)
  }
}

// Funções específicas para relatório geral
export const exportarRelatorioGeralPDF = (ativos: any[], filtros: any) => {
  const dados = ativos.map((ativo: Ativo) => [
    ativo.codigo,
    ativo.nome,
    ativo.setorDestino,
    formatarData(ativo.dataAquisicao),
    formatarMoeda(ativo.valorTotal),
    formatarMoeda(ativo.valorICMS + ativo.valorIPI + ativo.valorPIS + ativo.valorCOFINS),
    ativo.status,
  ])

  const colunas = ["Código", "Nome", "Setor", "Data Aquisição", "Valor Total", "Total Créditos", "Status"]

  exportarPDF(
    "Relatório Geral de Ativos",
    dados,
    colunas,
    `relatorio-geral-${new Date().toISOString().split("T")[0]}.pdf`,
  )
}

export const exportarRelatorioGeralExcel = (ativos: any[], filtros: any) => {
  const dados = ativos.map((ativo: Ativo) => ({
    Código: ativo.codigo,
    Nome: ativo.nome,
    "Setor Destino": ativo.setorDestino,
    "Data Aquisição": formatarData(ativo.dataAquisicao),
    "Valor Total": formatarMoeda(ativo.valorTotal),
    "Total Créditos": formatarMoeda(ativo.valorICMS + ativo.valorIPI + ativo.valorPIS + ativo.valorCOFINS),
    Status: ativo.status,
  }))

  exportarExcel(dados, `relatorio-geral-${new Date().toISOString().split("T")[0]}.xlsx`)
}

// Funções específicas para depreciação
export const exportarDepreciacaoPDF = (
  ativo: any,
  dadosDepreciacao: any[],
  params: { categoria: string; metodo: string; taxaAnual: number; valorResidual: number; baseDepreciacao: number },
) => {
  try {
    const doc = new jsPDF("portrait")

    doc.setFontSize(16)
    doc.text(`Relatório de Depreciação - ${ativo.nome}`, 20, 20)

    doc.setFontSize(10)
    doc.text(`Código do Ativo: ${ativo.codigo}`, 20, 30)
    doc.text(`Data de Aquisição: ${formatarData(ativo.dataAquisicao)}`, 20, 35)
    doc.text(`Valor Fiscal Original: ${formatarMoeda(ativo.valorTotal)}`, 20, 40)
    doc.text(`Base de Cálculo Depreciável: ${formatarMoeda(params.baseDepreciacao)}`, 20, 45)
    doc.text(`Categoria: ${params.categoria}`, 20, 50)
    doc.text(`Método de Depreciação: ${params.metodo}`, 20, 55)
    doc.text(`Taxa Anual: ${params.taxaAnual}%`, 20, 60)
    doc.text(`Valor Residual: ${formatarMoeda(params.valorResidual)}`, 20, 65)
    doc.text(`Gerado em: ${formatarDataHora(new Date().toISOString())}`, 20, 70)

    const colunas = ["Ano", "Valor Inicial", "Depreciação Anual", "Percentual", "Valor Residual"]
    const dados = dadosDepreciacao.map((item) => [
      item.ano,
      formatarMoeda(item.valorInicial),
      formatarMoeda(item.depreciacao),
      `${item.percentual.toFixed(2)}%`,
      formatarMoeda(item.valorResidual),
    ])
    autoTable(doc, {
      head: [colunas],
      body: dados,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`depreciacao-${ativo.codigo}-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erro ao exportar PDF de depreciação:", error)
    alert("Erro ao gerar PDF. Verifique se todos os dados estão corretos.")
  }
}

export const exportarDepreciacaoExcel = (
  ativo: any,
  dadosDepreciacao: any[],
  params: { categoria: string; metodo: string; taxaAnual: number; valorResidual: number; baseDepreciacao: number },
) => {
  const dados = dadosDepreciacao.map((item) => ({
    Ano: item.ano,
    "Valor Inicial": formatarMoeda(item.valorInicial),
    "Depreciação Anual": formatarMoeda(item.depreciacao),
    Percentual: `${item.percentual.toFixed(2)}%`,
    "Valor Residual": formatarMoeda(item.valorResidual),
  }))

  exportarExcel(dados, `depreciacao-${ativo.codigo}-${new Date().toISOString().split("T")[0]}.xlsx`)
}

// Funções específicas para créditos
export const exportarCreditosPDF = (ativo: any, dadosCreditos: any) => {
  const dados = [
    ["IPI", formatarMoeda(dadosCreditos.ipi)],
    ["PIS", formatarMoeda(dadosCreditos.pis)],
    ["COFINS", formatarMoeda(dadosCreditos.cofins)],
    ["ICMS", formatarMoeda(dadosCreditos.icms)],
    ["Total", formatarMoeda(dadosCreditos.total)],
  ]

  const colunas = ["Imposto", "Valor do Crédito"]

  exportarPDF(
    `Créditos Fiscais - ${ativo.nome}`,
    dados,
    colunas,
    `creditos-${ativo.codigo}-${new Date().toISOString().split("T")[0]}.pdf`,
  )
}

// Nova função para exportar um cálculo de crédito fiscal salvo para PDF
export const exportarCreditoFiscalSalvoPDF = (credito: CreditoCalculado, ativoNome: string) => {
  try {
    const doc = new jsPDF("portrait")

    doc.setFontSize(16)
    doc.text(`Cálculo de Crédito Fiscal Salvo - ${ativoNome}`, 20, 20)

    doc.setFontSize(10)
    doc.text(`Código do Ativo: ${credito.ativoId}`, 20, 30)
    doc.text(`Data do Cálculo: ${formatarData(credito.dataCalculo)}`, 20, 35)
    doc.text(`Data de Salvamento: ${formatarDataHora(credito.dataSalvamento)}`, 20, 40)
    doc.text(`Valor para Base de Depreciação: ${formatarMoeda(credito.valorParaDepreciacao)}`, 20, 45)

    const dadosImpostos = [
      ["IPI", formatarMoeda(credito.resultado.ipi), `${credito.resultado.parcelasIPI || 1}x`],
      ["PIS", formatarMoeda(credito.resultado.pis), `${credito.resultado.parcelasPIS || 1}x`],
      ["COFINS", formatarMoeda(credito.resultado.cofins), `${credito.resultado.parcelasCOFINS || 1}x`],
      ["ICMS", formatarMoeda(credito.resultado.icms), `${credito.resultado.parcelasICMS || 1}x`],
    ]

    doc.setFontSize(12)
    doc.text("Distribuição de Créditos por Imposto", 20, 60)
    autoTable(doc, {
      head: [["Imposto", "Valor do Crédito", "Parcelas"]],
      body: dadosImpostos,
      startY: 65,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 10, left: 20, right: 20 },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 100
    doc.setFontSize(12)
    doc.text(`Total de Créditos: ${formatarMoeda(credito.resultado.total)}`, 20, finalY + 10)

    doc.save(`credito-salvo-${credito.ativoId}-${new Date(credito.dataSalvamento).toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erro ao exportar PDF de crédito fiscal:", error)
    alert("Erro ao gerar PDF. Verifique se todos os dados estão corretos.")
  }
}

export const exportarCreditosExcel = (ativo: any, dadosCreditos: any) => {
  const dados = [
    { Imposto: "IPI", "Valor do Crédito": formatarMoeda(dadosCreditos.ipi) },
    { Imposto: "PIS", "Valor do Crédito": formatarMoeda(dadosCreditos.pis) },
    { Imposto: "COFINS", "Valor do Crédito": formatarMoeda(dadosCreditos.cofins) },
    { Imposto: "ICMS", "Valor do Crédito": formatarMoeda(dadosCreditos.icms) },
    { Imposto: "Total", "Valor do Crédito": formatarMoeda(dadosCreditos.total) },
  ]

  exportarExcel(dados, `creditos-${ativo.codigo}-${new Date().toISOString().split("T")[0]}.xlsx`)
}

// Funções específicas para Balanço Patrimonial
export const exportarBalancoImobilizadoPDF = (balancoData: SyntheticAccount[]) => {
  try {
    const doc = new jsPDF("portrait", "pt", "a4")
    let finalY = 40

    doc.setFontSize(16)
    doc.text("Balanço Patrimonial Detalhado", 40, finalY)
    finalY += 20

    doc.setFontSize(10)
    doc.text(`Gerado em: ${formatarDataHora(new Date().toISOString())}`, 40, finalY)
    finalY += 20

    balancoData.forEach((syntheticAccount) => {
      autoTable(doc, {
        head: [["Classificação", "Descrição", "Valor R$", "Depreciação Acumulada R$", "Crédito Fiscal R$"]],
        body: [
          [
            syntheticAccount.classificacao,
            syntheticAccount.descricao,
            formatarMoeda(syntheticAccount.valor),
            formatarMoeda(syntheticAccount.valorDepreciacaoAcumulada || 0),
            formatarMoeda(syntheticAccount.valorCreditoFiscalTotal || 0),
          ],
        ],
        startY: finalY,
        styles: { fontSize: 9, fontStyle: "bold", cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        theme: "grid",
        margin: { left: 40, right: 40 },
        didDrawPage: (data: any) => {
          finalY = data.cursor.y + 10
        },
      })

      const analiticasData = syntheticAccount.analiticas.map((analyticalAccount) => [
        analyticalAccount.classificacao,
        analyticalAccount.descricao,
        formatarMoeda(analyticalAccount.valor),
        formatarMoeda(analyticalAccount.valorDepreciacaoAcumulada || 0),
        formatarMoeda(analyticalAccount.valorCreditoFiscalTotal || 0),
      ])

      if (analiticasData.length > 0) {
        autoTable(doc, {
          body: analiticasData,
          startY: finalY,
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 80, cellPadding: { left: 20 } },
            1: { cellWidth: "auto" },
            2: { cellWidth: 60, halign: "right" },
            3: { cellWidth: 60, halign: "right" },
            4: { cellWidth: 60, halign: "right" },
          },
          theme: "plain",
          margin: { left: 40, right: 40 },
          didDrawPage: (data: any) => {
            finalY = data.cursor.y + 15
          },
        })
      } else {
        finalY += 15
      }
    })

    doc.save(`balanco-patrimonial-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erro ao exportar PDF do balanço patrimonial:", error)
    alert("Erro ao gerar PDF. Verifique se todos os dados estão corretos.")
  }
}

export const gerarCreditosPDF = exportarCreditosPDF
export const gerarCreditosExcel = exportarCreditosExcel
