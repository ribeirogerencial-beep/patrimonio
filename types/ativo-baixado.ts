export interface AtivoBaixado {
  id: string // ID único para o registro de baixa
  ativoId: string // ID do ativo que foi baixado
  codigoAtivo: string // Código do ativo no momento da baixa
  nomeAtivo: string // Nome do ativo no momento da baixa
  numeroNotaFiscalVenda?: string // Número da NF de venda
  valorVenda: number // Valor da venda do ativo
  dataVenda: string // Data da venda (YYYY-MM-DD)
  dataBaixa: string // Data em que o registro de baixa foi criado (YYYY-MM-DDTHH:mm:ss.sssZ)
  // Novos campos para o Resultado Gerado
  valorCompraOriginal: number
  totalCreditos: number
  creditoIPI: number
  creditoICMS: number
  creditoPIS: number
  creditoCOFINS: number
  totalDepreciacaoAcumulada: number
  resultadoResidualContabil: number // Valor Contábil Líquido após créditos e depreciação
  ganhoOuPerda: number
  variacaoPercentual: number
}
