"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      setError(null)

      const supabase = createClient()

      // Testar conexão básica
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .limit(5)

      if (error) {
        throw error
      }

      setCategorias(data || [])
      setConnectionStatus('connected')
    } catch (err: any) {
      setConnectionStatus('error')
      setError(err.message)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado'
      case 'error':
        return 'Erro'
      default:
        return 'Testando...'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Teste de Conexão Supabase
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Verificando a conexão com o banco de dados Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Erro de Conexão:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Conexão Estabelecida!</h4>
            <p className="text-green-700 text-sm">
              Conectado com sucesso ao Supabase. {categorias.length} categorias encontradas.
            </p>
          </div>
        )}

        {categorias.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Categorias Encontradas:</h4>
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">{categoria.nome}</div>
                  {categoria.descricao && (
                    <div className="text-sm text-muted-foreground">{categoria.descricao}</div>
                  )}
                  {categoria.taxa_depreciacao && (
                    <div className="text-sm text-muted-foreground">
                      Taxa de Depreciação: {categoria.taxa_depreciacao}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
          {connectionStatus === 'testing' ? 'Testando...' : 'Testar Novamente'}
        </Button>
      </CardContent>
    </Card>
  )
}
