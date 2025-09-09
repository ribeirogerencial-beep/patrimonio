export type TipoEntidadeRelacionada = "ativo" | "credito" | "depreciacao" | "manutencao" | "reavaliacao" | "aluguel"

export interface Compromisso {
  id: string
  title: string
  description?: string
  date: string // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ) for easy storage/parsing
  relatedTo: TipoEntidadeRelacionada
  relatedEntityId?: string // Optional, can be empty if not linked to a specific entity instance
  relatedEntityName?: string // For display purposes
  color?: string // Tailwind color class, e.g., "bg-blue-500"
}

// Dummy type for other entities for `formulario-compromisso.tsx`
// In a real app, these would be specific interfaces, but for `localStorage` generic is fine.
export interface SimpleEntity {
  id: string
  nome?: string // For Ativo, Aluguel, Pessoa, etc.
  title?: string // For Depreciação, Crédito, Manutenção
  codigo?: string // For Ativo
}
