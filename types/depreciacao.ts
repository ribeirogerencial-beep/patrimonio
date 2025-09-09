export interface ItemTabelaDepreciacao {
  periodo: number
  valorInicial: number
  depreciacao: number
  percentual: number
  valorFinal: number
  mesAno: string // Novo campo para mês/ano
}

export interface ParametrosDepreciacao {
  categoriaId: string
  categoriaNome: string
  metodoDepreciacao: "linear" | "acelerada" | "soma_digitos"
  taxaAnual: number
  valorResidual: number
  vidaUtil: number
  contaDepreciacaoId?: string
  periodoCalculo?: "anual" | "mensal" // Novo campo
}

export interface DepreciacaoCalculada {
  id: string
  ativo: {
    id: string
    codigo: string
    nome: string
    valorTotal: number
    dataAquisicao?: string
  }
  parametros: ParametrosDepreciacao
  baseCalculoDepreciavel: number
  totalDepreciacao: number
  valorContabilAtual: number
  tabelaDepreciacao: ItemTabelaDepreciacao[]
  dataSalvamento: string
}
