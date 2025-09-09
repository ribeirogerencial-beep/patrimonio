import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/supabase'

type Categoria = Database['public']['Tables']['categorias']['Row']
type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']

export class CategoriaService {
  // Buscar todas as categorias
  static async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true })

    if (error) throw error
    return data
  }

  // Buscar categoria por ID
  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Criar nova categoria
  static async create(categoria: CategoriaInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categorias')
      .insert(categoria)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar categoria
  static async update(id: string, categoria: CategoriaUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categorias')
      .update(categoria)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Deletar categoria
  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
