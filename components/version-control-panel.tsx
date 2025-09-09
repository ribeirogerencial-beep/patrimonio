"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { versionControl } from "@/utils/version-control"
import { Download, Upload, Trash2, RotateCcw, Save, FileText, Clock, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BackupData {
  id: string
  timestamp: number
  description?: string
  data: any
  version: string
}

interface VersionControlConfig {
  autoBackup: boolean
  backupInterval: number
  maxBackups: number
  compressionEnabled: boolean
}

export function VersionControlPanel() {
  const [backups, setBackups] = useState<BackupData[]>([])
  const [config, setConfig] = useState<VersionControlConfig>({
    autoBackup: true,
    backupInterval: 30,
    maxBackups: 10,
    compressionEnabled: true,
  })
  const [backupDescription, setBackupDescription] = useState("")
  const [importData, setImportData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadBackups()
    loadConfig()
  }, [])

  const loadBackups = () => {
    try {
      const backupList = versionControl.getBackups()
      setBackups(backupList.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar backups",
        variant: "destructive",
      })
    }
  }

  const loadConfig = () => {
    try {
      const currentConfig = versionControl.getConfig()
      setConfig(currentConfig)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      })
    }
  }

  const handleCreateBackup = async () => {
    setIsLoading(true)
    try {
      const backupId = versionControl.createBackup(backupDescription || "Backup manual")
      setBackupDescription("")
      loadBackups()
      toast({
        title: "Sucesso",
        description: "Backup criado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar backup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    setIsLoading(true)
    try {
      const success = versionControl.restoreBackup(backupId)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Backup restaurado com sucesso. Recarregue a página para ver as alterações.",
        })
      } else {
        throw new Error("Falha na restauração")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao restaurar backup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const success = versionControl.deleteBackup(backupId)
      if (success) {
        loadBackups()
        toast({
          title: "Sucesso",
          description: "Backup excluído com sucesso",
        })
      } else {
        throw new Error("Falha na exclusão")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir backup",
        variant: "destructive",
      })
    }
  }

  const handleExportBackup = (backupId: string) => {
    try {
      const exportData = versionControl.exportBackup(backupId)
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${backupId}_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Backup exportado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar backup",
        variant: "destructive",
      })
    }
  }

  const handleImportBackup = async () => {
    if (!importData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados do backup",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const backupId = versionControl.importBackup(importData)
      setImportData("")
      loadBackups()
      toast({
        title: "Sucesso",
        description: "Backup importado com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao importar backup. Verifique o formato dos dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateConfig = (newConfig: Partial<VersionControlConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    versionControl.updateConfig(updatedConfig)
    toast({
      title: "Sucesso",
      description: "Configurações atualizadas com sucesso",
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  const formatFileSize = (data: any) => {
    const size = JSON.stringify(data).length
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Backup
          </CardTitle>
          <CardDescription>Configure como os backups são criados e gerenciados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auto-backup">Backup Automático</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-backup"
                  checked={config.autoBackup}
                  onCheckedChange={(checked) => handleUpdateConfig({ autoBackup: checked })}
                />
                <span className="text-sm text-muted-foreground">{config.autoBackup ? "Ativado" : "Desativado"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-interval">Intervalo (minutos)</Label>
              <Input
                id="backup-interval"
                type="number"
                min="5"
                max="1440"
                value={config.backupInterval}
                onChange={(e) => handleUpdateConfig({ backupInterval: Number.parseInt(e.target.value) || 30 })}
                disabled={!config.autoBackup}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-backups">Máximo de Backups</Label>
              <Input
                id="max-backups"
                type="number"
                min="1"
                max="50"
                value={config.maxBackups}
                onChange={(e) => handleUpdateConfig({ maxBackups: Number.parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compression">Compressão</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="compression"
                  checked={config.compressionEnabled}
                  onCheckedChange={(checked) => handleUpdateConfig({ compressionEnabled: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {config.compressionEnabled ? "Ativada" : "Desativada"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criar Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Criar Backup Manual
          </CardTitle>
          <CardDescription>Crie um backup manual dos dados do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-description">Descrição (opcional)</Label>
            <Input
              id="backup-description"
              placeholder="Ex: Backup antes da atualização..."
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateBackup} disabled={isLoading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Criando..." : "Criar Backup"}
          </Button>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Backup
            </CardTitle>
            <CardDescription>Importe um backup de outro sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">Dados do Backup</Label>
              <Textarea
                id="import-data"
                placeholder="Cole aqui os dados do backup em formato JSON..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleImportBackup} disabled={isLoading || !importData.trim()} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "Importando..." : "Importar Backup"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estatísticas
            </CardTitle>
            <CardDescription>Informações sobre os backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{backups.length}</div>
                <div className="text-sm text-muted-foreground">Total de Backups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {backups.length > 0 ? formatFileSize(backups[0]?.data) : "0 B"}
                </div>
                <div className="text-sm text-muted-foreground">Tamanho Médio</div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Último Backup</div>
              <div className="font-medium">
                {backups.length > 0 ? formatDate(backups[0].timestamp) : "Nenhum backup"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backups Disponíveis
          </CardTitle>
          <CardDescription>Gerencie seus backups existentes</CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum backup encontrado</p>
              <p className="text-sm">Crie seu primeiro backup usando o formulário acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{backup.description || "Backup sem descrição"}</h4>
                        <Badge variant="secondary">v{backup.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Criado em {formatDate(backup.timestamp)}</p>
                      <p className="text-xs text-muted-foreground">
                        Tamanho: {formatFileSize(backup.data)} • ID: {backup.id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportBackup(backup.id)}>
                        <Download className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restaurar Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja restaurar este backup? Esta ação irá substituir todos os dados
                              atuais.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestoreBackup(backup.id)} disabled={isLoading}>
                              {isLoading ? "Restaurando..." : "Restaurar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
