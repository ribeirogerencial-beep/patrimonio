"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AgendaManutencao } from "@/components/agenda-manutencao"
import type { Ativo } from "@/types/ativo"
import { Wrench } from "lucide-react"

export default function ManutencaoPage() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [ativoSelecionado, setAtivoSelecionado] = useState<string>("")

  useEffect(() => {
    const ativosSalvos = localStorage.getItem("ativos-imobilizados")
    if (ativosSalvos) {
      const ativosData = JSON.parse(ativosSalvos)
      setAtivos(ativosData)
      if (ativosData.length > 0) {
        setAtivoSelecionado(ativosData[0].id)
      }
    }
  }, [])

  const ativo = ativos.find((a) => a.id === ativoSelecionado)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Agenda de Manutenção</h1>
          <p className="text-muted-foreground">Gerencie as manutenções dos seus ativos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={ativoSelecionado} onValueChange={setAtivoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ativo para gerenciar manutenções" />
              </SelectTrigger>
              <SelectContent>
                {ativos.map((ativo) => (
                  <SelectItem key={ativo.id} value={ativo.id}>
                    {ativo.codigo} - {ativo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {ativo ? (
        <AgendaManutencao ativo={ativo} />
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {ativos.length === 0
                ? "Nenhum ativo cadastrado. Cadastre um ativo primeiro."
                : "Selecione um ativo para gerenciar as manutenções."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
