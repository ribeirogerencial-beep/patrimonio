export interface AnalyticalAccount {
  classificacao: string
  descricao: string
  valor: number
  valorDepreciacaoAcumulada?: number
  valorCreditoFiscalTotal?: number
}

export interface SyntheticAccount {
  classificacao: string
  descricao: string
  valor: number
  valorDepreciacaoAcumulada?: number
  valorCreditoFiscalTotal?: number
  analiticas: AnalyticalAccount[]
}

export interface DepreciationParam {
  ativoId: string
  categoria: string
  metodo: string
  taxaAnual: number
  valorResidual: number
  baseDepreciacao: number
  vidaUtilAnos: number
}

export interface CreditCalculation {
  ativoId: string
  dataCalculo: string
  ipi: number
  pis: number
  cofins: number
  icms: number
  total: number
  contaCreditoFiscalId?: string // Adicionado
}

export interface ContaCreditoFiscal {
  id: string
  codigo: string
  descricao: string
}
