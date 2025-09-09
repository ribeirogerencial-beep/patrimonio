import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/supabase'

type Localizacao = Database['public']['Tables']['localizacoes']['Row']
type LocalizacaoInsert = Database['public']['Tables']['localizacoes']['Insert']
type LocalizacaoUpdate = Database['public']['Tables']['localizacoes']['Update']

export class LocalizacaoService {
  // Buscar todas as localizações
  static async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('localizacoes')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return data
  }

  // Buscar localização por ID
  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('localizacoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Criar nova localização
  static async create(localizacao: LocalizacaoInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('localizacoes')
      .insert(localizacao)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar localização
  static async update(id: string, localizacao: LocalizacaoUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('localizacoes')
      .update(localizacao)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Deletar localização
  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('localizacoes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
