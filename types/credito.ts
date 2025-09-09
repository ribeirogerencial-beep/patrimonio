export interface CreditoCalculado {
  id: string // UUID do cálculo
  ativoId: string // ID do ativo ao qual o crédito pertence
  dataCalculo: string // Data em que o cálculo foi realizado (ISO string)
  ipi: number // Valor do crédito de IPI
  pis: number // Valor do crédito de PIS
  cofins: number // Valor do crédito de COFINS
  icms: number // Valor do crédito de ICMS
  total: number // Valor total do crédito (soma de IPI, PIS, COFINS, ICMS)
  contaCreditoFiscalId?: string // ID da conta de crédito fiscal selecionada
}
