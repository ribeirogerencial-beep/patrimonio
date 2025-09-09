import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Ativo } from "@/types/ativo"
import type { DepreciacaoCalculada } from "@/types/depreciacao"
import type { CreditoCalculado } from "@/types/credito"
import type { Aluguel } from "@/types/aluguel"
import type { ExportConfig } from "@/components/export-config-dialog" // Importar tipos de configuração de exportação

interface Manutencao {
  id: string
  ativoId: string
  tipo: "preventiva" | "corretiva" | "preditiva"
  titulo: string
  descricao: string
  dataAgendada: string
  dataRealizada?: string
  status: "agendada" | "em-andamento" | "concluida" | "cancelada"
  responsavel: string
  custo?: number
  custoReal?: number
  observacoes?: string
  proximaManutencao?: string
  anexo?: string
}

interface AnexoAtivo {
  id: string
  ativoId: string
  assunto: string
  data: string
  descricao: string
  nomeArquivo: string
  tipoArquivo: string
  tamanhoArquivo: number
  conteudoArquivo: string // Base64
  dataUpload: string
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString("pt-BR")
}

export const exportarDetalhesAtivoPDF = (
  ativo: Ativo & { qrCodeDataUrl?: string },
  anexos: AnexoAtivo[],
  depreciacoesSalvas: DepreciacaoCalculada[],
  creditosSalvos: CreditoCalculado[],
  manutencoes: Manutencao[],
) => {
  const doc = new jsPDF("p", "mm", "a4")
  let yOffset = 10

  const addHeader = () => {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Detalhes do Ativo Imobilizado", 105, yOffset, { align: "center" })
    yOffset += 10
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      yOffset,
      { align: "center" },
    )
    yOffset += 10
    doc.setDrawColor(200, 200, 200)
    doc.line(10, yOffset, 200, yOffset)
    yOffset += 10
  }

  const addSectionTitle = (title: string) => {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(title, 10, yOffset)
    yOffset += 7
    doc.setDrawColor(200, 200, 200)
    doc.line(10, yOffset, 200, yOffset)
    yOffset += 5
  }

  const checkPageBreak = (requiredSpace: number) => {
    if (yOffset + requiredSpace > doc.internal.pageSize.height - 20) {
      doc.addPage()
      yOffset = 10
      addHeader()
    }
  }

  addHeader()

  // --- Informações Básicas ---
  checkPageBreak(50)
  addSectionTitle("Informações Básicas")
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Código: ${ativo.codigo}`, 10, yOffset)
  doc.text(`Nome: ${ativo.nome}`, 10, yOffset + 5)
  doc.text(`Descrição: ${ativo.descricao || "Não informado"}`, 10, yOffset + 10)
  doc.text(`Data de Aquisição: ${new Date(ativo.dataAquisicao).toLocaleDateString("pt-BR")}`, 10, yOffset + 15)
  doc.text(`Nota Fiscal: ${ativo.numeroNotaFiscal || ativo.notaFiscal || "Não informado"}`, 10, yOffset + 20)
  doc.text(`Status: ${ativo.status || "Ativo"}`, 10, yOffset + 25)
  yOffset += 35

  // --- Valores ---
  checkPageBreak(40)
  addSectionTitle("Valores")
  doc.setFontSize(10)
  doc.text(`Valor Total (NF): ${formatarMoeda(ativo.valorTotal)}`, 10, yOffset)
  doc.text(`Valor de Mercado: ${formatarMoeda(ativo.valorMercado || ativo.valorTotal)}`, 10, yOffset + 5)
  if (ativo.valorMercado && ativo.valorMercado !== ativo.valorTotal) {
    const variacaoPercentual = ((ativo.valorMercado - ativo.valorTotal) / ativo.valorTotal) * 100
    doc.text(`Variação: ${variacaoPercentual.toFixed(2)}%`, 10, yOffset + 10)
    doc.text(
      `Última Reavaliação: ${new Date(ativo.dataUltimaReavaliacao!).toLocaleDateString("pt-BR")}`,
      10,
      yOffset + 15,
    )
  }
  doc.text(`IPI: ${formatarMoeda(ativo.valorIPI || 0)}`, 10, yOffset + 20)
  doc.text(`PIS: ${formatarMoeda(ativo.valorPIS || 0)}`, 10, yOffset + 25)
  doc.text(`COFINS: ${formatarMoeda(ativo.valorCOFINS || 0)}`, 10, yOffset + 30)
  doc.text(`ICMS: ${formatarMoeda(ativo.valorICMS || 0)}`, 10, yOffset + 35)
  yOffset += 45

  // --- QR Code e Foto ---
  checkPageBreak(70)
  addSectionTitle("QR Code e Imagens")
  if (ativo.qrCodeDataUrl) {
    doc.addImage(ativo.qrCodeDataUrl, "PNG", 10, yOffset, 40, 40)
    doc.text("QR Code do Ativo", 10, yOffset + 45)
  } else {
    doc.text("QR Code não disponível.", 10, yOffset + 5)
  }

  if (ativo.foto) {
    const img = new Image()
    img.src = ativo.foto
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const imgWidth = 60
      const imgHeight = imgWidth / aspectRatio
      doc.addImage(img, "JPEG", 70, yOffset, imgWidth, imgHeight)
      doc.text("Foto do Produto", 70, yOffset + imgHeight + 5)
    }
    img.onerror = () => {
      doc.text("Erro ao carregar foto do produto.", 70, yOffset + 5)
    }
  } else {
    doc.text("Foto do produto não disponível.", 70, yOffset + 5)
  }
  yOffset += 60

  // --- Anexos ---
  checkPageBreak(anexos.length * 10 + 20)
  addSectionTitle("Anexos")
  if (anexos.length > 0) {
    autoTable(doc, {
      startY: yOffset,
      head: [["Assunto", "Data", "Nome do Arquivo", "Tamanho", "Upload"]],
      body: anexos.map((anexo) => [
        anexo.assunto,
        new Date(anexo.data).toLocaleDateString("pt-BR"),
        anexo.nomeArquivo,
        (anexo.tamanhoArquivo / 1024).toFixed(2) + " KB",
        new Date(anexo.dataUpload).toLocaleDateString("pt-BR"),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      didDrawPage: (data) => {
        yOffset = data.cursor ? data.cursor.y : yOffset // Update yOffset after table
      },
    })
    yOffset = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.text("Nenhum anexo adicionado.", 10, yOffset)
    yOffset += 10
  }

  // --- Depreciações Salvas ---
  checkPageBreak(depreciacoesSalvas.length * 10 + 20)
  addSectionTitle("Cálculos de Depreciação Salvos")
  if (depreciacoesSalvas.length > 0) {
    autoTable(doc, {
      startY: yOffset,
      head: [["Método", "Valor Depreciável", "Vida Útil", "Valor Residual", "Data Cálculo", "Valor Depreciado"]],
      body: depreciacoesSalvas.map((dep) => [
        dep.parametros.metodoDepreciacao,
        formatarMoeda(dep.baseCalculoDepreciavel),
        `${dep.parametros.vidaUtil} meses`, // Corrigido para meses
        formatarMoeda(dep.parametros.valorResidual),
        new Date(dep.dataSalvamento).toLocaleDateString("pt-BR"),
        formatarMoeda(dep.totalDepreciacao),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      didDrawPage: (data) => {
        yOffset = data.cursor ? data.cursor.y : yOffset
      },
    })
    yOffset = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.text("Nenhum cálculo de depreciação salvo.", 10, yOffset)
    yOffset += 10
  }

  // --- Cálculos de Créditos Salvos ---
  checkPageBreak(creditosSalvos.length * 10 + 20)
  addSectionTitle("Cálculos de Créditos Fiscais Salvos")
  if (creditosSalvos.length > 0) {
    autoTable(doc, {
      startY: yOffset,
      head: [["Total Créditos", "Valor Base Depreciação", "IPI", "PIS", "COFINS", "ICMS", "Data Cálculo"]],
      body: creditosSalvos.map((cred) => [
        formatarMoeda(cred.resultado.total),
        formatarMoeda(cred.valorParaDepreciacao),
        formatarMoeda(cred.resultado.ipi),
        formatarMoeda(cred.resultado.pis),
        formatarMoeda(cred.resultado.cofins),
        formatarMoeda(cred.resultado.icms),
        new Date(cred.dataSalvamento).toLocaleDateString("pt-BR"),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      didDrawPage: (data) => {
        yOffset = data.cursor ? data.cursor.y : yOffset
      },
    })
    yOffset = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.text("Nenhum cálculo de crédito fiscal salvo.", 10, yOffset)
    yOffset += 10
  }

  // --- Manutenções ---
  checkPageBreak(manutencoes.length * 10 + 20)
  addSectionTitle("Histórico de Manutenções")
  if (manutencoes.length > 0) {
    autoTable(doc, {
      startY: yOffset,
      head: [["Tipo", "Título", "Data Agendada", "Status", "Responsável", "Custo"]],
      body: manutencoes.map((manut) => [
        manut.tipo,
        manut.titulo,
        new Date(manut.dataAgendada).toLocaleDateString("pt-BR"),
        manut.status,
        manut.responsavel,
        formatarMoeda(manut.custo || 0),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      didDrawPage: (data) => {
        yOffset = data.cursor ? data.cursor.y : yOffset
      },
    })
    yOffset = (doc as any).lastAutoTable.finalY + 10
  } else {
    doc.text("Nenhum registro de manutenção.", 10, yOffset)
    yOffset += 10
  }

  doc.save(`detalhes_ativo_${ativo.codigo}.pdf`)
}

export const exportarDetalhesAluguelPDF = (aluguel: Aluguel) => {
  const doc = new jsPDF("p", "mm", "a4")
  let yOffset = 10

  const addHeader = () => {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Detalhes do Contrato de Aluguel", 105, yOffset, { align: "center" })
    yOffset += 10
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      yOffset,
      { align: "center" },
    )
    yOffset += 10
    doc.setDrawColor(200, 200, 200)
    doc.line(10, yOffset, 200, yOffset)
    yOffset += 10
  }

  const addSectionTitle = (title: string) => {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(title, 10, yOffset)
    yOffset += 7
    doc.setDrawColor(200, 200, 200)
    doc.line(10, yOffset, 200, yOffset)
    yOffset += 5
  }

  const checkPageBreak = (requiredSpace: number) => {
    if (yOffset + requiredSpace > doc.internal.pageSize.height - 20) {
      doc.addPage()
      yOffset = 10
      addHeader()
    }
  }

  addHeader()

  // --- Informações do Produto ---
  checkPageBreak(50)
  addSectionTitle("Informações do Produto")
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Código do Produto: ${aluguel.codigoProduto}`, 10, yOffset)
  doc.text(`Nome do Produto: ${aluguel.nomeProduto}`, 10, yOffset + 5)
  doc.text(`Fornecedor: ${aluguel.nomeFornecedor}`, 10, yOffset + 10)
  doc.text(`Nota Fiscal: ${aluguel.notaFiscal || "Não informado"}`, 10, yOffset + 15)
  yOffset += 25

  // --- Informações Financeiras ---
  checkPageBreak(40)
  addSectionTitle("Informações Financeiras")
  doc.setFontSize(10)
  doc.text(`Valor Mensal: ${formatarMoeda(aluguel.valorAluguel)}`, 10, yOffset)
  doc.text(`Prazo (meses): ${aluguel.prazoMeses}`, 10, yOffset + 5)
  doc.text(`Valor Total do Contrato: ${formatarMoeda(aluguel.valorAluguel * aluguel.prazoMeses)}`, 10, yOffset + 10)
  yOffset += 20

  // --- Período do Contrato ---
  checkPageBreak(30)
  addSectionTitle("Período do Contrato")
  doc.setFontSize(10)
  doc.text(`Data de Início: ${new Date(aluguel.dataInicio).toLocaleDateString("pt-BR")}`, 10, yOffset)
  doc.text(`Data de Fim: ${new Date(aluguel.dataFim).toLocaleDateString("pt-BR")}`, 10, yOffset + 5)
  yOffset += 15

  // --- Observações ---
  checkPageBreak(30)
  addSectionTitle("Observações")
  doc.setFontSize(10)
  doc.text(`Observações: ${aluguel.observacoes || "Nenhuma observação."}`, 10, yOffset)
  yOffset += 15

  // --- Imagem do Produto e Anexo ---
  checkPageBreak(70)
  addSectionTitle("Imagens e Anexos")
  if (aluguel.imagemProdutoUrl) {
    const img = new Image()
    img.src = aluguel.imagemProdutoUrl
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const imgWidth = 60
      const imgHeight = imgWidth / aspectRatio
      doc.addImage(img, "JPEG", 10, yOffset, imgWidth, imgHeight)
      doc.text("Imagem do Produto", 10, yOffset + imgHeight + 5)
    }
    img.onerror = () => {
      doc.text("Erro ao carregar imagem do produto.", 10, yOffset + 5)
    }
  } else {
    doc.text("Nenhuma imagem do produto disponível.", 10, yOffset + 5)
  }
  yOffset += 60

  if (aluguel.contratoAnexoUrl) {
    doc.textWithLink("Baixar Contrato/Anexo", 10, yOffset, { url: aluguel.contratoAnexoUrl })
  } else {
    doc.text("Nenhum anexo de contrato disponível.", 10, yOffset)
  }
  yOffset += 10

  doc.save(`detalhes_aluguel_${aluguel.codigoProduto}.pdf`)
}

export const exportarPDFPersonalizado = (
  ativos: Ativo[],
  config: ExportConfig,
  filtros: { ano: string; ativo: string },
  manutencoes: Manutencao[], // Manutenções para incluir no relatório, se necessário
) => {
  const doc = new jsPDF("p", "mm", "a4")
  let yOffset = 10

  const addHeader = () => {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Relatório Personalizado de Ativos", 105, yOffset, { align: "center" })
    yOffset += 10
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      yOffset,
      { align: "center" },
    )
    yOffset += 10
    doc.setDrawColor(200, 200, 200)
    doc.line(10, yOffset, 200, yOffset)
    yOffset += 10
  }

  const checkPageBreak = (requiredSpace: number) => {
    if (yOffset + requiredSpace > doc.internal.pageSize.height - 20) {
      doc.addPage()
      yOffset = 10
      addHeader()
    }
  }

  addHeader()

  // Adicionar filtros aplicados
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Filtros Aplicados:", 10, yOffset)
  doc.setFont("helvetica", "normal")
  doc.text(`Ano: ${filtros.ano === "todos" ? "Todos" : filtros.ano}`, 10, yOffset + 5)
  doc.text(
    `Ativo: ${filtros.ativo === "todos" ? "Todos" : ativos.find((a) => a.id === filtros.ativo)?.nome || "N/A"}`,
    10,
    yOffset + 10,
  )
  yOffset += 20

  checkPageBreak(50)

  // Preparar cabeçalhos e dados da tabela com base na configuração
  const head = [config.fields.filter((f) => f.enabled).map((f) => f.label)]
  const body = ativos.map((ativo) => {
    return config.fields
      .filter((f) => f.enabled)
      .map((field) => {
        switch (field.key) {
          case "dataAquisicao":
            return formatarData(ativo.dataAquisicao)
          case "valorTotal":
          case "valorMercado":
          case "icms":
          case "ipi":
          case "pis":
          case "cofins":
            return formatarMoeda((ativo as any)[field.key] || 0)
          default:
            return (ativo as any)[field.key] || "-"
        }
      })
  })

  doc.setFontSize(10)
  autoTable(doc, {
    startY: yOffset,
    head: head,
    body: body,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
    didDrawPage: (data) => {
      yOffset = data.cursor ? data.cursor.y : yOffset
    },
  })
  yOffset = (doc as any).lastAutoTable.finalY + 10

  doc.save(`relatorio_personalizado_ativos.pdf`)
}
