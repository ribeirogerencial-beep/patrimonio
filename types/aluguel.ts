export interface Aluguel {
  id: string
  codigoProduto: string
  nomeProduto: string
  nomeFornecedor: string
  notaFiscal: string
  imagemProduto: string
  valorAluguel: number
  prazoMeses: number
  anexo: string
  dataInicio: string
  dataFim: string
  status: "ativo" | "vencido" | "cancelado"
  dataInclusao: string
  dataAtualizacao: string
}
