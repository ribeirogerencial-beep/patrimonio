export interface Ativo {
  id: string
  codigo: string
  nome: string
  descricao?: string
  categoria: string
  dataAquisicao: string
  valorTotal: number
  valorIPI?: number
  valorPIS?: number
  valorCOFINS?: number
  valorICMS?: number
  notaFiscal?: string
  setorDestino: string
  localizacao?: string
  classificacaoContabil?: string
  contaContabilSintetica?: string
  anexo?: string
  foto?: string
  dataAtualizacao?: string
  status?: "ativo" | "baixado" | "manutencao"
}

export interface AtivoFormData {
  codigo: string
  nome: string
  descricao: string
  categoria: string
  dataAquisicao: string
  valorTotal: number
  valorIPI: number
  valorPIS: number
  valorCOFINS: number
  valorICMS: number
  notaFiscal: string
  setorDestino: string
  localizacao: string
  classificacaoContabil: string
  contaContabilSintetica: string
}

export interface AtivoFilter {
  busca: string
  categoria: string
  setor: string
  status: string
  dataInicio: string
  dataFim: string
}

export interface AtivoStats {
  total: number
  ativos: number
  baixados: number
  manutencao: number
  valorTotal: number
}
