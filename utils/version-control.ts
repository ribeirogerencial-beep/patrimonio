interface BackupData {
  id: string
  timestamp: number
  description?: string
  data: any
  version: string
}

interface VersionControlConfig {
  autoBackup: boolean
  backupInterval: number // em minutos
  maxBackups: number
  compressionEnabled: boolean
}

class VersionControlSystem {
  private config: VersionControlConfig = {
    autoBackup: true,
    backupInterval: 30,
    maxBackups: 10,
    compressionEnabled: true,
  }

  private backupTimer: NodeJS.Timeout | null = null
  private readonly STORAGE_KEY = "version_control_backups"
  private readonly CONFIG_KEY = "version_control_config"

  init() {
    this.loadConfig()
    if (this.config.autoBackup) {
      this.startAutoBackup()
    }
  }

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem(this.CONFIG_KEY)
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  getConfig(): VersionControlConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<VersionControlConfig>) {
    this.config = { ...this.config, ...newConfig }
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config))

    // Reiniciar backup automático se necessário
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
      this.backupTimer = null
    }

    if (this.config.autoBackup) {
      this.startAutoBackup()
    }
  }

  private startAutoBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
    }

    this.backupTimer = setInterval(
      () => {
        this.createBackup("Backup automático")
      },
      this.config.backupInterval * 60 * 1000,
    )
  }

  createBackup(description?: string): string {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Coletar dados de todas as páginas
      const allData = this.collectAllData()

      const backup: BackupData = {
        id: backupId,
        timestamp: Date.now(),
        description,
        data: allData,
        version: "1.0.0",
      }

      const backups = this.getBackups()
      backups.push(backup)

      // Manter apenas os backups mais recentes
      if (backups.length > this.config.maxBackups) {
        backups.splice(0, backups.length - this.config.maxBackups)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backups))
      return backupId
    } catch (error) {
      console.error("Erro ao criar backup:", error)
      throw error
    }
  }

  private collectAllData() {
    const data: any = {}

    // Coletar dados de diferentes módulos
    const keys = [
      "ativos",
      "pessoas",
      "categorias",
      "setores",
      "localizacoes",
      "contas_contabeis",
      "contas_depreciacao",
      "contas_credito_fiscal",
      "alugueis",
      "compromissos",
      "manutencoes",
      "reavaliacao",
      "configuracoes_gerais",
      "configuracoes_empresa",
      "configuracoes_interface",
      "configuracoes_notificacoes",
    ]

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = JSON.parse(value)
        }
      } catch (error) {
        console.warn(`Erro ao coletar dados de ${key}:`, error)
      }
    })

    return data
  }

  getBackups(): BackupData[] {
    try {
      const backups = localStorage.getItem(this.STORAGE_KEY)
      return backups ? JSON.parse(backups) : []
    } catch (error) {
      console.error("Erro ao carregar backups:", error)
      return []
    }
  }

  restoreBackup(backupId: string): boolean {
    try {
      const backups = this.getBackups()
      const backup = backups.find((b) => b.id === backupId)

      if (!backup) {
        throw new Error("Backup não encontrado")
      }

      // Restaurar todos os dados
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })

      return true
    } catch (error) {
      console.error("Erro ao restaurar backup:", error)
      return false
    }
  }

  deleteBackup(backupId: string): boolean {
    try {
      const backups = this.getBackups()
      const filteredBackups = backups.filter((b) => b.id !== backupId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBackups))
      return true
    } catch (error) {
      console.error("Erro ao excluir backup:", error)
      return false
    }
  }

  exportBackup(backupId: string): string {
    const backups = this.getBackups()
    const backup = backups.find((b) => b.id === backupId)

    if (!backup) {
      throw new Error("Backup não encontrado")
    }

    return JSON.stringify(backup, null, 2)
  }

  importBackup(backupData: string): string {
    try {
      const backup: BackupData = JSON.parse(backupData)

      // Validar estrutura do backup
      if (!backup.id || !backup.timestamp || !backup.data) {
        throw new Error("Formato de backup inválido")
      }

      // Gerar novo ID para evitar conflitos
      backup.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      backup.timestamp = Date.now()

      const backups = this.getBackups()
      backups.push(backup)

      // Manter apenas os backups mais recentes
      if (backups.length > this.config.maxBackups) {
        backups.splice(0, backups.length - this.config.maxBackups)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backups))
      return backup.id
    } catch (error) {
      console.error("Erro ao importar backup:", error)
      throw error
    }
  }

  cleanup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
      this.backupTimer = null
    }
  }
}

export const versionControl = new VersionControlSystem()
