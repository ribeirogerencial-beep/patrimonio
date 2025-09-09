import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Ativo } from "@/types/ativo"

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

const TIPOS_MANUTENCAO = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  preditiva: "Preditiva",
}

const STATUS_MANUTENCAO = {
  agendada: "Agendada",
  "em-andamento": "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

function formatarData(dataString: string): string {
  if (!dataString) return ""
  const date = new Date(dataString)
  if (isNaN(date.getTime())) {
    return "Data Inválida"
  }
  return date.toLocaleDateString("pt-BR")
}

function formatarDataHora(dataHoraString: string): string {
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

export function exportarManutencaoPDF(ativo: Ativo, manutencoes: Manutencao[]) {
  try {
    const doc = new jsPDF("portrait")

    // Cabeçalho
    doc.setFontSize(16)
    doc.text(`Relatório de Manutenção - ${ativo.nome}`, 20, 20)

    doc.setFontSize(10)
    doc.text(`Código do Ativo: ${ativo.codigo}`, 20, 30)
    doc.text(`Setor: ${ativo.setorDestino}`, 20, 35)
    doc.text(`Data de Aquisição: ${formatarData(ativo.dataAquisicao)}`, 20, 40)
    doc.text(`Valor do Ativo: ${formatarMoeda(ativo.valorTotal)}`, 20, 45)
    doc.text(`Gerado em: ${formatarDataHora(new Date().toISOString())}`, 20, 50)

    // Resumo
    const proximasManutencoes = manutencoes.filter(
      (m) => m.status === "agendada" && new Date(m.dataAgendada) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    )
    const custoTotalEstimado = manutencoes.reduce((acc, m) => acc + (m.custo || 0), 0)
    const custoTotalReal = manutencoes
      .filter((m) => m.status === "concluida")
      .reduce((acc, m) => acc + (m.custoReal || m.custo || 0), 0)

    doc.setFontSize(12)
    doc.text("Resumo", 20, 65)
    doc.setFontSize(10)
    doc.text(`Total de Manutenções: ${manutencoes.length}`, 20, 75)
    doc.text(`Próximas Manutenções (7 dias): ${proximasManutencoes.length}`, 20, 80)
    doc.text(`Custo Total Estimado: ${formatarMoeda(custoTotalEstimado)}`, 20, 85)
    doc.text(`Custo Total Real: ${formatarMoeda(custoTotalReal)}`, 20, 90)

    // Tabela de manutenções
    if (manutencoes.length > 0) {
      const colunas = ["Tipo", "Título", "Data Agendada", "Status", "Responsável", "Custo Est.", "Custo Real"]
      const dados = manutencoes.map((manutencao) => [
        TIPOS_MANUTENCAO[manutencao.tipo],
        manutencao.titulo,
        formatarData(manutencao.dataAgendada),
        STATUS_MANUTENCAO[manutencao.status],
        manutencao.responsavel,
        formatarMoeda(manutencao.custo || 0),
        manutencao.status === "concluida" ? formatarMoeda(manutencao.custoReal || manutencao.custo || 0) : "-",
      ])

      autoTable(doc, {
        head: [colunas],
        body: dados,
        startY: 100,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
        },
      })

      // Detalhes das manutenções
      let currentY = (doc as any).lastAutoTable.finalY + 20

      manutencoes.forEach((manutencao, index) => {
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }

        doc.setFontSize(12)
        doc.text(`${index + 1}. ${manutencao.titulo}`, 20, currentY)
        currentY += 10

        doc.setFontSize(9)
        if (manutencao.descricao) {
          doc.text(`Descrição: ${manutencao.descricao}`, 25, currentY)
          currentY += 7
        }
        if (manutencao.observacoes) {
          doc.text(`Observações: ${manutencao.observacoes}`, 25, currentY)
          currentY += 7
        }
        if (manutencao.proximaManutencao) {
          doc.text(`Próxima Manutenção: ${formatarData(manutencao.proximaManutencao)}`, 25, currentY)
          currentY += 7
        }
        if (manutencao.anexo) {
          doc.text("Anexo: Sim", 25, currentY)
          currentY += 7
        }

        currentY += 5
      })
    }

    doc.save(`manutencao-${ativo.codigo}-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Erro ao exportar PDF de manutenção:", error)
    alert("Erro ao gerar PDF. Verifique se todos os dados estão corretos.")
  }
}
