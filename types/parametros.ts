export interface Categoria {
  id: string
  nome: string
  descricao: string
  taxaDepreciacao: number
  // Vida útil em meses
  vidaUtil: number
  ativo: boolean
  dataInclusao: string
}

export interface Setor {
  id: string
  nome: string
  descricao: string
  responsavel: string
  ativo: boolean
  dataInclusao: string
}

export interface Localizacao {
  id: string
  nome: string
  descricao: string
  setor: string
  andar?: string
  sala?: string
  ativo: boolean
  dataInclusao: string
}

export interface ContaContabil {
  id: string
  codigo: string
  descricao: string
  ativo: boolean
  dataInclusao: string
}

export interface ContaDepreciacao {
  id: string
  codigo: string
  descricao: string
  ativo: boolean
  dataInclusao: string
}

// Nova interface para Contas de Crédito Fiscal
export interface ContaCreditoFiscal {
  id: string
  codigo: string
  descricao: string
  ativo: boolean
  dataInclusao: string
}
