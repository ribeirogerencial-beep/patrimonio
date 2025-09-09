import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/lib/supabase'

type Ativo = Database['public']['Tables']['ativos']['Row']
type AtivoInsert = Database['public']['Tables']['ativos']['Insert']
type AtivoUpdate = Database['public']['Tables']['ativos']['Update']

export class AtivoService {
  // Buscar todos os ativos
  static async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Buscar ativo por ID
  static async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Criar novo ativo
  static async create(ativo: AtivoInsert) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .insert(ativo)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar ativo
  static async update(id: string, ativo: AtivoUpdate) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .update(ativo)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Deletar ativo
  static async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('ativos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Buscar ativos por status
  static async getByStatus(status: 'ativo' | 'baixado' | 'manutencao') {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Buscar ativos por categoria
  static async getByCategoria(categoriaId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .eq('categoria_id', categoriaId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Buscar ativos por localização
  static async getByLocalizacao(localizacaoId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .eq('localizacao_id', localizacaoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Buscar ativos por setor
  static async getBySetor(setorId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)
      .eq('setor_id', setorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Buscar ativos com filtros
  static async search(filters: {
    nome?: string
    categoriaId?: string
    localizacaoId?: string
    setorId?: string
    status?: string
    valorMin?: number
    valorMax?: number
  }) {
    const supabase = createClient()
    let query = supabase
      .from('ativos')
      .select(`
        *,
        categorias(nome),
        localizacoes(nome),
        setores(nome)
      `)

    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`)
    }

    if (filters.categoriaId) {
      query = query.eq('categoria_id', filters.categoriaId)
    }

    if (filters.localizacaoId) {
      query = query.eq('localizacao_id', filters.localizacaoId)
    }

    if (filters.setorId) {
      query = query.eq('setor_id', filters.setorId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.valorMin) {
      query = query.gte('valor_aquisicao', filters.valorMin)
    }

    if (filters.valorMax) {
      query = query.lte('valor_aquisicao', filters.valorMax)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
