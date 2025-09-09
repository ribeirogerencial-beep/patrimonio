"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isBefore, addMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, CalendarCheck, CalendarX, Clock, Edit, Trash, LinkIcon } from 'lucide-react'
import { v4 as uuidv4 } from "uuid"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Compromisso } from "@/types/compromisso"
import { FormularioCompromisso } from "@/components/formulario-compromisso"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CalendarioPage() {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [compromissoParaEditar, setCompromissoParaEditar] = useState<Compromisso | null>(null)
  const [notifiedCompromissos, setNotifiedCompromissos] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  useEffect(() => {
    try {
      const savedCompromissos = localStorage.getItem("compromissos-agendados")
      if (savedCompromissos) {
        setCompromissos(
          JSON.parse(savedCompromissos).map((c: Compromisso) => ({
            ...c,
            date: c.date, // Ensure date is treated as ISO string
          })),
        )
      }
    } catch (error) {
      console.error("Erro ao carregar compromissos do localStorage:", error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("compromissos-agendados", JSON.stringify(compromissos))
  }, [compromissos])

  // Efeito para verificar e disparar notificações
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date()
      compromissos.forEach((compromisso) => {
        const compromissoDate = new Date(compromisso.date)
        // Notifica se o compromisso está entre agora e os próximos 15 minutos
        // e ainda não foi notificado, e a data do compromisso é no futuro
        if (
          isBefore(compromissoDate, addMinutes(now, 15)) &&
          isBefore(now, compromissoDate) &&
          !notifiedCompromissos.has(compromisso.id)
        ) {
          toast({
            title: "Lembrete de Compromisso!",
            description: `${compromisso.title} em ${format(compromissoDate, "HH:mm", { locale: ptBR })}. Relacionado a: ${compromisso.relatedEntityName || compromisso.relatedTo}`,
            duration: 9000, // A notificação ficará visível por 9 segundos
          })
          // Adiciona o ID do compromisso ao conjunto de notificados para evitar repetições
          setNotifiedCompromissos((prev) => new Set(prev).add(compromisso.id))
        }
      })
    }

    // Verifica a cada minuto (60 * 1000 milissegundos)
    const intervalId = setInterval(checkNotifications, 60 * 1000)

    // Limpa o intervalo ao desmontar o componente para evitar vazamentos de memória
    return () => clearInterval(intervalId)
  }, [compromissos, notifiedCompromissos, toast]) // Dependências do useEffect

  const handleSaveCompromisso = (novoCompromisso: Compromisso) => {
    if (compromissoParaEditar) {
      setCompromissos((prev) => prev.map((c) => (c.id === novoCompromisso.id ? novoCompromisso : c)))
      // Remove o compromisso do conjunto de notificados se ele foi editado,
      // para que possa ser notificado novamente se as condições forem atendidas
      setNotifiedCompromissos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(novoCompromisso.id)
        return newSet
      })
    } else {
      setCompromissos((prev) => [...prev, { ...novoCompromisso, id: uuidv4() }])
    }
    setIsFormOpen(false)
    setCompromissoParaEditar(null)
  }

  const handleDeleteCompromisso = (id: string) => {
    setCompromissos((prev) => prev.filter((c) => c.id !== id))
    // Remove o compromisso do conjunto de notificados
    setNotifiedCompromissos((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleEditCompromisso = (compromisso: Compromisso) => {
    setCompromissoParaEditar(compromisso)
    setIsFormOpen(true)
  }

  const upcomingCompromissos = compromissos
    .filter((c) => new Date(c.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5) // Get top 5 upcoming

  const pastCompromissosCount = compromissos.filter((c) => new Date(c.date) < new Date()).length
  const totalCompromissos = compromissos.length

  const compromissosDoDiaSelecionado = compromissos
    .filter((c) => selectedDate && format(new Date(c.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const daysWithCompromissos = compromissos.map((c) => parseISO(c.date))

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário de Compromissos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus agendamentos</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              onClick={() => {
                setCompromissoParaEditar(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Compromisso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{compromissoParaEditar ? "Editar Compromisso" : "Adicionar Novo Compromisso"}</DialogTitle>
            </DialogHeader>
            <FormularioCompromisso
              compromisso={compromissoParaEditar}
              onSave={handleSaveCompromisso}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-l-4 border-blue-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Compromissos</CardTitle>
            <CalendarCheck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompromissos}</div>
            <p className="text-xs text-gray-500">Compromissos registrados</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-green-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Compromissos</CardTitle>
            <Clock className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCompromissos.length}</div>
            <p className="text-xs text-gray-500">Em aberto</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-orange-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compromissos Passados</CardTitle>
            <CalendarX className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastCompromissosCount}</div>
            <p className="text-xs text-gray-500">Já realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Visualização do Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <style jsx global>{`
              .rdp-day_compromissos {
                background-color: hsl(var(--primary)) !important;
                color: hsl(var(--primary-foreground)) !important;
              }
              .rdp-day_compromissos:hover {
                background-color: hsl(var(--primary)) !important;
                opacity: 0.9;
              }
              /* Custom styles for day names in calendar header */
              .rdp-head_cell {
                text-transform: uppercase;
                font-size: 0.75rem; /* text-xs */
                font-weight: 600; /* font-semibold */
                color: hsl(var(--muted-foreground));
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
                text-align: center;
              }
            `}</style>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow"
              locale={ptBR}
              modifiers={{
                compromissos: daysWithCompromissos,
              }}
              modifiersClassNames={{
                compromissos: "rdp-day_compromissos",
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Compromissos em{" "}
              {selectedDate ? format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Nenhuma data selecionada"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {compromissosDoDiaSelecionado.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum compromisso para este dia.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {compromissosDoDiaSelecionado.map((compromisso) => (
                    <Card
                      key={compromisso.id}
                      className={`p-4 rounded-lg shadow-sm border ${compromisso.color ? `${compromisso.color.replace('bg-', 'border-')} ${compromisso.color.replace('500', '100')}` : "bg-gray-50 border-gray-200"}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-800 mb-1 sm:mb-0">{compromisso.title}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="font-medium">{format(new Date(compromisso.date), "HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>
                        {compromisso.description && (
                          <p className="text-sm text-gray-700 mb-3 border-l-2 border-gray-200 pl-2">
                            {compromisso.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <LinkIcon className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">Relacionado a:</span>
                          <Badge variant="secondary" className="capitalize">
                            {compromisso.relatedTo}
                          </Badge>
                          {compromisso.relatedEntityName && (
                            <span className="text-gray-600 font-semibold">
                              - {compromisso.relatedEntityName}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompromisso(compromisso)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4 mr-1" /> Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-800"
                              >
                                <Trash className="w-4 h-4 mr-1" /> Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente este compromisso.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCompromisso(compromisso.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Compromissos Quick View */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Próximos 5 Compromissos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingCompromissos.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Nenhum compromisso futuro agendado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {upcomingCompromissos.map((compromisso) => (
                <div
                  key={compromisso.id}
                  className={`p-3 rounded-lg shadow-sm border ${compromisso.color ? `${compromisso.color.replace('bg-', 'border-')} ${compromisso.color.replace('500', '100')}` : "bg-blue-50 border-blue-100"}`}
                >
                  <h4 className="font-semibold text-base text-gray-800 truncate">{compromisso.title}</h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <CalendarCheck className="w-3 h-3" />{" "}
                    {format(new Date(compromisso.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {compromisso.relatedTo.charAt(0).toUpperCase() + compromisso.relatedTo.slice(1)}
                    {compromisso.relatedEntityName && ` - ${compromisso.relatedEntityName}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
