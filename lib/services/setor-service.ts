import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/supabase'

type Setor = Database['public']['Tables']['setores']['Row']
type SetorInsert = Database['public']['Tables']['setores']['Insert']
type SetorUpdate = Database['public']['Tables']['setores']['Update']

export class SetorService {
  // Buscar todos os setores
  static async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return data
  }

  // Buscar setor por ID
  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Criar novo setor
  static async create(setor: SetorInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setores')
      .insert(setor)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar setor
  static async update(id: string, setor: SetorUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('setores')
      .update(setor)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Deletar setor
  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
