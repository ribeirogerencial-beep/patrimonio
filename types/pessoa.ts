export interface Pessoa {
  id: string
  nome: string
  email: string
  telefone: string
  cargo: string
  setor: string
  nivelAcesso: "admin" | "usuario" | "visualizador"
  ativo: boolean
  dataInclusao: string
  dataUltimoAcesso?: string
}
