// Este arquivo mantém apenas os tipos do banco de dados
// Para usar o Supabase, importe os clientes de utils/supabase/

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      ativos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          categoria_id: string | null
          localizacao_id: string | null
          setor_id: string | null
          valor_aquisicao: number
          data_aquisicao: string
          vida_util: number | null
          valor_residual: number | null
          status: 'ativo' | 'baixado' | 'manutencao'
          numero_serie: string | null
          numero_patrimonio: string | null
          fornecedor: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          categoria_id?: string | null
          localizacao_id?: string | null
          setor_id?: string | null
          valor_aquisicao: number
          data_aquisicao: string
          vida_util?: number | null
          valor_residual?: number | null
          status?: 'ativo' | 'baixado' | 'manutencao'
          numero_serie?: string | null
          numero_patrimonio?: string | null
          fornecedor?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          categoria_id?: string | null
          localizacao_id?: string | null
          setor_id?: string | null
          valor_aquisicao?: number
          data_aquisicao?: string
          vida_util?: number | null
          valor_residual?: number | null
          status?: 'ativo' | 'baixado' | 'manutencao'
          numero_serie?: string | null
          numero_patrimonio?: string | null
          fornecedor?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          taxa_depreciacao: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          taxa_depreciacao?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          taxa_depreciacao?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      localizacoes: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          endereco: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          endereco?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      setores: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          responsavel: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          responsavel?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          responsavel?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pessoas: {
        Row: {
          id: string
          nome: string
          email: string | null
          telefone: string | null
          cpf: string | null
          tipo: 'funcionario' | 'fornecedor' | 'cliente'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          telefone?: string | null
          cpf?: string | null
          tipo?: 'funcionario' | 'fornecedor' | 'cliente'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          cpf?: string | null
          tipo?: 'funcionario' | 'fornecedor' | 'cliente'
          created_at?: string
          updated_at?: string
        }
      }
      depreciacoes: {
        Row: {
          id: string
          ativo_id: string
          valor_depreciacao: number
          valor_contabil: number
          data_calculo: string
          periodo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ativo_id: string
          valor_depreciacao: number
          valor_contabil: number
          data_calculo: string
          periodo: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ativo_id?: string
          valor_depreciacao?: number
          valor_contabil?: number
          data_calculo?: string
          periodo?: string
          created_at?: string
          updated_at?: string
        }
      }
      manutencoes: {
        Row: {
          id: string
          ativo_id: string
          tipo: 'preventiva' | 'corretiva' | 'preditiva'
          descricao: string
          data_agendada: string | null
          data_realizada: string | null
          custo: number | null
          responsavel: string | null
          status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ativo_id: string
          tipo: 'preventiva' | 'corretiva' | 'preditiva'
          descricao: string
          data_agendada?: string | null
          data_realizada?: string | null
          custo?: number | null
          responsavel?: string | null
          status?: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ativo_id?: string
          tipo?: 'preventiva' | 'corretiva' | 'preditiva'
          descricao?: string
          data_agendada?: string | null
          data_realizada?: string | null
          custo?: number | null
          responsavel?: string | null
          status?: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alugueis: {
        Row: {
          id: string
          ativo_id: string
          locatario_id: string
          data_inicio: string
          data_fim: string | null
          valor_mensal: number
          status: 'ativo' | 'finalizado' | 'cancelado'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ativo_id: string
          locatario_id: string
          data_inicio: string
          data_fim?: string | null
          valor_mensal: number
          status?: 'ativo' | 'finalizado' | 'cancelado'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ativo_id?: string
          locatario_id?: string
          data_inicio?: string
          data_fim?: string | null
          valor_mensal?: number
          status?: 'ativo' | 'finalizado' | 'cancelado'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
