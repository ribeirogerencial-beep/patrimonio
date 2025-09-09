"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Briefcase, Building, Shield, Calendar, Clock } from "lucide-react"
import type { Pessoa } from "@/types/pessoa"

interface DetalhesPessoaProps {
  pessoa: Pessoa
}

export function DetalhesPessoa({ pessoa }: DetalhesPessoaProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getNivelAcessoInfo = (nivel: string) => {
    const info = {
      admin: { nome: "Administrador", cor: "destructive", descricao: "Acesso completo ao sistema" },
      usuario: { nome: "Usuário", cor: "default", descricao: "Visualização e edição de dados" },
      visualizador: { nome: "Visualizador", cor: "secondary", descricao: "Apenas visualização" },
    }
    return info[nivel as keyof typeof info] || info.visualizador
  }

  const nivelInfo = getNivelAcessoInfo(pessoa.nivelAcesso)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Nome:</span>
                <p className="text-sm">{pessoa.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Email:</span>
                <p className="text-sm">{pessoa.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Telefone:</span>
                <p className="text-sm">{pessoa.telefone || "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Cargo:</span>
                <p className="text-sm">{pessoa.cargo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Setor:</span>
                <p className="text-sm">{pessoa.setor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="font-semibold">Nível de Acesso:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={nivelInfo.cor}>{nivelInfo.nome}</Badge>
                  <span className="text-xs text-muted-foreground">{nivelInfo.descricao}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Status:</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={pessoa.ativo ? "default" : "destructive"}>{pessoa.ativo ? "Ativo" : "Inativo"}</Badge>
                <span className="text-xs text-muted-foreground">
                  {pessoa.ativo ? "Acesso liberado" : "Acesso bloqueado"}
                </span>
              </div>
            </div>
            <div>
              <span className="font-semibold">Data de Inclusão:</span>
              <p className="text-sm flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                {formatarData(pessoa.dataInclusao)}
              </p>
            </div>
          </div>
          {pessoa.dataUltimoAcesso && (
            <div>
              <span className="font-semibold">Último Acesso:</span>
              <p className="text-sm flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3" />
                {formatarData(pessoa.dataUltimoAcesso)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissões do Nível de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {pessoa.nivelAcesso === "admin" && (
              <>
                <p className="flex items-center gap-2">✅ Cadastrar, editar e excluir ativos</p>
                <p className="flex items-center gap-2">✅ Gerenciar usuários do sistema</p>
                <p className="flex items-center gap-2">✅ Acessar todos os relatórios</p>
                <p className="flex items-center gap-2">✅ Configurar parâmetros do sistema</p>
              </>
            )}
            {pessoa.nivelAcesso === "usuario" && (
              <>
                <p className="flex items-center gap-2">✅ Cadastrar, editar e excluir ativos</p>
                <p className="flex items-center gap-2">✅ Acessar relatórios básicos</p>
                <p className="flex items-center gap-2">❌ Gerenciar usuários do sistema</p>
                <p className="flex items-center gap-2">❌ Configurar parâmetros do sistema</p>
              </>
            )}
            {pessoa.nivelAcesso === "visualizador" && (
              <>
                <p className="flex items-center gap-2">✅ Visualizar ativos cadastrados</p>
                <p className="flex items-center gap-2">✅ Acessar relatórios básicos</p>
                <p className="flex items-center gap-2">❌ Cadastrar, editar ou excluir ativos</p>
                <p className="flex items-center gap-2">❌ Gerenciar usuários do sistema</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
