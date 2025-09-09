"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit } from 'lucide-react'

interface Categoria {
  id: string
  nome: string
  descricao: string | null
  taxa_depreciacao: number | null
  created_at: string
  updated_at: string
}

export function RealtimeTest() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)
  const [newCategoria, setNewCategoria] = useState({
    nome: '',
    descricao: '',
    taxa_depreciacao: 10
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    // Carregar categorias iniciais
    loadCategorias()

    // Configurar tempo real
    const channel = supabase
      .channel('categorias-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categorias'
        },
        (payload) => {
          console.log('Mudança detectada:', payload)
          
          if (payload.eventType === 'INSERT') {
            setCategorias(prev => [...prev, payload.new as Categoria])
            toast({
              title: "Nova categoria adicionada",
              description: `Categoria "${payload.new.nome}" foi criada em tempo real!`,
            })
          } else if (payload.eventType === 'UPDATE') {
            setCategorias(prev => 
              prev.map(cat => 
                cat.id === payload.new.id ? payload.new as Categoria : cat
              )
            )
            toast({
              title: "Categoria atualizada",
              description: `Categoria "${payload.new.nome}" foi atualizada em tempo real!`,
            })
          } else if (payload.eventType === 'DELETE') {
            setCategorias(prev => 
              prev.filter(cat => cat.id !== payload.old.id)
            )
            toast({
              title: "Categoria removida",
              description: `Categoria foi removida em tempo real!`,
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Status do canal:', status)
        setIsRealtimeActive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategorias(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategoria.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .insert([{
          nome: newCategoria.nome,
          descricao: newCategoria.descricao || null,
          taxa_depreciacao: newCategoria.taxa_depreciacao
        }])

      if (error) throw error

      setNewCategoria({ nome: '', descricao: '', taxa_depreciacao: 10 })
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Categoria>) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teste de Tempo Real</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status do Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Teste de Tempo Real
            <Badge variant={isRealtimeActive ? "default" : "destructive"}>
              {isRealtimeActive ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Teste de funcionalidades em tempo real do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isRealtimeActive 
              ? "✅ Tempo real ativo! Mudanças serão sincronizadas automaticamente."
              : "❌ Tempo real inativo. Verifique a configuração do Supabase."
            }
          </p>
        </CardContent>
      </Card>

      {/* Formulário para Nova Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Categoria</CardTitle>
          <CardDescription>
            Crie uma nova categoria para testar o tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={newCategoria.nome}
                onChange={(e) => setNewCategoria(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Equipamentos de TI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxa">Taxa de Depreciação (%)</Label>
              <Input
                id="taxa"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={newCategoria.taxa_depreciacao}
                onChange={(e) => setNewCategoria(prev => ({ ...prev, taxa_depreciacao: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={newCategoria.descricao}
              onChange={(e) => setNewCategoria(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da categoria..."
            />
          </div>
          <Button onClick={handleCreate} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Criar Categoria
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias ({categorias.length})</CardTitle>
          <CardDescription>
            Lista de categorias com atualizações em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categorias.length > 0 ? (
            <div className="space-y-3">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{categoria.nome}</h4>
                      {categoria.taxa_depreciacao && (
                        <Badge variant="outline">
                          {categoria.taxa_depreciacao}%
                        </Badge>
                      )}
                    </div>
                    {categoria.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {categoria.descricao}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em: {new Date(categoria.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(editingId === categoria.id ? null : categoria.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(categoria.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma categoria encontrada. Crie uma nova categoria para testar o tempo real.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


