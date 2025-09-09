import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AtivosPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Buscar ativos com suas relações
  const { data: ativos, error } = await supabase
    .from('ativos')
    .select(`
      *,
      categorias(nome),
      localizacoes(nome),
      setores(nome)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar ativos</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ativos</h1>
        <p className="text-muted-foreground">Lista de ativos do sistema</p>
      </div>

      {ativos && ativos.length > 0 ? (
        <div className="grid gap-4">
          {ativos.map((ativo) => (
            <Card key={ativo.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ativo.nome}</CardTitle>
                  <Badge 
                    variant={ativo.status === 'ativo' ? 'default' : 'secondary'}
                  >
                    {ativo.status}
                  </Badge>
                </div>
                <CardDescription>
                  {ativo.descricao || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Valor:</span> R$ {ativo.valor_aquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span> {ativo.categorias?.nome || 'Não definida'}
                  </div>
                  <div>
                    <span className="font-medium">Localização:</span> {ativo.localizacoes?.nome || 'Não definida'}
                  </div>
                  <div>
                    <span className="font-medium">Setor:</span> {ativo.setores?.nome || 'Não definido'}
                  </div>
                  <div>
                    <span className="font-medium">Data de Aquisição:</span> {new Date(ativo.data_aquisicao).toLocaleDateString('pt-BR')}
                  </div>
                  {ativo.numero_patrimonio && (
                    <div>
                      <span className="font-medium">Patrimônio:</span> {ativo.numero_patrimonio}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum ativo encontrado</CardTitle>
            <CardDescription>
              Não há ativos cadastrados no sistema ainda.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

