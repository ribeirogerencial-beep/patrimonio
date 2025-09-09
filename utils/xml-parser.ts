import { parseISO } from "date-fns"

export function parseVendaXML(xmlString: string) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, "application/xml")

  const errorNode = xmlDoc.querySelector("parsererror")
  if (errorNode) {
    throw new Error("Erro ao parsear o XML. Verifique a estrutura do arquivo.")
  }

  try {
    const numeroNotaFiscalElement = xmlDoc.querySelector("notaFiscal > numero")
    const valorVendaElement = xmlDoc.querySelector("venda > valor")
    const dataVendaElement = xmlDoc.querySelector("venda > data")

    const numeroNotaFiscal = numeroNotaFiscalElement?.textContent || ""
    const valorVenda = valorVendaElement?.textContent
      ? Number.parseFloat(valorVendaElement.textContent.replace(",", "."))
      : 0
    let dataVenda: Date | undefined = undefined

    if (dataVendaElement?.textContent) {
      try {
        // Assuming date format in XML is YYYY-MM-DD or similar
        dataVenda = parseISO(dataVendaElement.textContent)
      } catch (e) {
        console.error("Erro ao parsear a data do XML:", e)
        // Fallback or handle invalid date format
      }
    }

    return {
      numeroNotaFiscal: numeroNotaFiscal,
      valorVenda: valorVenda,
      dataVenda: dataVenda,
    }
  } catch (error) {
    console.error("Erro ao extrair dados do XML:", error)
    throw new Error(
      "Não foi possível extrair os dados da nota fiscal do XML. Verifique se os campos estão presentes e corretos.",
    )
  }
}
