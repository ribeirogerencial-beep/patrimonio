"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { VersionControlPanel } from "@/components/version-control-panel"
import { SupabaseTest } from "@/components/supabase-test"
import { RealtimeTest } from "@/components/realtime-test"
import { useToast } from "@/hooks/use-toast"
import { Settings, Building2, Palette, Bell, Database, Save, RotateCcw, Download } from "lucide-react"

interface ConfiguracaoGeral {
  nomeEmpresa: string
  versaoSistema: string
  dataUltimaAtualizacao: string
  backupAutomatico: boolean
  intervalBackup: number
  notificacoes: boolean
  tema: "light" | "dark" | "system"
  idioma: string
}

interface ConfiguracaoEmpresa {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
  website: string
  responsavelTecnico: string
  emailResponsavel: string
}

interface ConfiguracaoInterface {
  corPrimaria: string
  corSecundaria: string
  tamanhoFonte: "pequeno" | "medio" | "grande"
  densidadeInterface: "compacta" | "confortavel" | "espaçosa"
  mostrarTooltips: boolean
  animacoes: boolean
  modoEscuro: boolean
}

interface ConfiguracaoNotificacoes {
  emailNotificacoes: boolean
  notificacoesPush: boolean
  notificacoesVencimento: boolean
  diasAntecedenciaVencimento: number
  notificacoesManutencao: boolean
  notificacoesBackup: boolean
  horarioNotificacoes: string
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("geral")
  const { toast } = useToast()

  // Estados das configurações
  const [configGeral, setConfigGeral] = useState<ConfiguracaoGeral>({
    nomeEmpresa: "Minha Empresa",
    versaoSistema: "1.0.0",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
    backupAutomatico: true,
    intervalBackup: 24,
    notificacoes: true,
    tema: "system",
    idioma: "pt-BR",
  })

  const [configEmpresa, setConfigEmpresa] = useState<ConfiguracaoEmpresa>({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    website: "",
    responsavelTecnico: "",
    emailResponsavel: "",
  })

  const [configInterface, setConfigInterface] = useState<ConfiguracaoInterface>({
    corPrimaria: "#3b82f6",
    corSecundaria: "#64748b",
    tamanhoFonte: "medio",
    densidadeInterface: "confortavel",
    mostrarTooltips: true,
    animacoes: true,
    modoEscuro: false,
  })

  const [configNotificacoes, setConfigNotificacoes] = useState<ConfiguracaoNotificacoes>({
    emailNotificacoes: true,
    notificacoesPush: false,
    notificacoesVencimento: true,
    diasAntecedenciaVencimento: 30,
    notificacoesManutencao: true,
    notificacoesBackup: true,
    horarioNotificacoes: "09:00",
  })

  // Carregar configurações do localStorage
  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = () => {
    try {
      const savedConfigGeral = localStorage.getItem("configuracoes_gerais")
      if (savedConfigGeral) {
        setConfigGeral(JSON.parse(savedConfigGeral))
      }

      const savedConfigEmpresa = localStorage.getItem("configuracoes_empresa")
      if (savedConfigEmpresa) {
        setConfigEmpresa(JSON.parse(savedConfigEmpresa))
      }

      const savedConfigInterface = localStorage.getItem("configuracoes_interface")
      if (savedConfigInterface) {
        setConfigInterface(JSON.parse(savedConfigInterface))
      }

      const savedConfigNotificacoes = localStorage.getItem("configuracoes_notificacoes")
      if (savedConfigNotificacoes) {
        setConfigNotificacoes(JSON.parse(savedConfigNotificacoes))
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  const salvarConfiguracao = (tipo: string, config: any) => {
    try {
      localStorage.setItem(`configuracoes_${tipo}`, JSON.stringify(config))
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      })
    }
  }

  const resetarConfiguracoes = (tipo: string) => {
    try {
      localStorage.removeItem(`configuracoes_${tipo}`)
      carregarConfiguracoes()
      toast({
        title: "Sucesso",
        description: "Configurações resetadas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar configurações",
        variant: "destructive",
      })
    }
  }

  const exportarConfiguracoes = () => {
    try {
      const todasConfiguracoes = {
        geral: configGeral,
        empresa: configEmpresa,
        interface: configInterface,
        notificacoes: configNotificacoes,
        dataExportacao: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(todasConfiguracoes, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `configuracoes_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Configurações exportadas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar configurações",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarConfiguracoes}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configurações básicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-empresa">Nome da Empresa</Label>
                  <Input
                    id="nome-empresa"
                    value={configGeral.nomeEmpresa}
                    onChange={(e) => setConfigGeral((prev) => ({ ...prev, nomeEmpresa: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="versao-sistema">Versão do Sistema</Label>
                  <Input id="versao-sistema" value={configGeral.versaoSistema} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tema">Tema</Label>
                  <Select
                    value={configGeral.tema}
                    onValueChange={(value: "light" | "dark" | "system") =>
                      setConfigGeral((prev) => ({ ...prev, tema: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select
                    value={configGeral.idioma}
                    onValueChange={(value) => setConfigGeral((prev) => ({ ...prev, idioma: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Criar backups automaticamente</p>
                  </div>
                  <Switch
                    checked={configGeral.backupAutomatico}
                    onCheckedChange={(checked) => setConfigGeral((prev) => ({ ...prev, backupAutomatico: checked }))}
                  />
                </div>

                {configGeral.backupAutomatico && (
                  <div className="space-y-2">
                    <Label htmlFor="interval-backup">Intervalo de Backup (horas)</Label>
                    <Input
                      id="interval-backup"
                      type="number"
                      min="1"
                      max="168"
                      value={configGeral.intervalBackup}
                      onChange={(e) =>
                        setConfigGeral((prev) => ({ ...prev, intervalBackup: Number.parseInt(e.target.value) || 24 }))
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações do sistema</p>
                  </div>
                  <Switch
                    checked={configGeral.notificacoes}
                    onCheckedChange={(checked) => setConfigGeral((prev) => ({ ...prev, notificacoes: checked }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => salvarConfiguracao("gerais", configGeral)}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => resetarConfiguracoes("gerais")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações da Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Dados da empresa para relatórios e documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social</Label>
                  <Input
                    id="razao-social"
                    value={configEmpresa.razaoSocial}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, razaoSocial: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome-fantasia"
                    value={configEmpresa.nomeFantasia}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, nomeFantasia: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={configEmpresa.cnpj}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscricao-estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao-estadual"
                    value={configEmpresa.inscricaoEstadual}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, inscricaoEstadual: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscricao-municipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricao-municipal"
                    value={configEmpresa.inscricaoMunicipal}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, inscricaoMunicipal: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={configEmpresa.telefone}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 0000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configEmpresa.email}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={configEmpresa.website}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={configEmpresa.endereco}
                  onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={configEmpresa.cidade}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={configEmpresa.estado}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, estado: e.target.value }))}
                    placeholder="SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={configEmpresa.cep}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel-tecnico">Responsável Técnico</Label>
                  <Input
                    id="responsavel-tecnico"
                    value={configEmpresa.responsavelTecnico}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, responsavelTecnico: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-responsavel">E-mail do Responsável</Label>
                  <Input
                    id="email-responsavel"
                    type="email"
                    value={configEmpresa.emailResponsavel}
                    onChange={(e) => setConfigEmpresa((prev) => ({ ...prev, emailResponsavel: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => salvarConfiguracao("empresa", configEmpresa)}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => resetarConfiguracoes("empresa")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Interface */}
        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Interface</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor-primaria">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor-primaria"
                      type="color"
                      value={configInterface.corPrimaria}
                      onChange={(e) => setConfigInterface((prev) => ({ ...prev, corPrimaria: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={configInterface.corPrimaria}
                      onChange={(e) => setConfigInterface((prev) => ({ ...prev, corPrimaria: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor-secundaria"
                      type="color"
                      value={configInterface.corSecundaria}
                      onChange={(e) => setConfigInterface((prev) => ({ ...prev, corSecundaria: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={configInterface.corSecundaria}
                      onChange={(e) => setConfigInterface((prev) => ({ ...prev, corSecundaria: e.target.value }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanho-fonte">Tamanho da Fonte</Label>
                  <Select
                    value={configInterface.tamanhoFonte}
                    onValueChange={(value: "pequeno" | "medio" | "grande") =>
                      setConfigInterface((prev) => ({ ...prev, tamanhoFonte: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="densidade-interface">Densidade da Interface</Label>
                  <Select
                    value={configInterface.densidadeInterface}
                    onValueChange={(value: "compacta" | "confortavel" | "espaçosa") =>
                      setConfigInterface((prev) => ({ ...prev, densidadeInterface: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compacta">Compacta</SelectItem>
                      <SelectItem value="confortavel">Confortável</SelectItem>
                      <SelectItem value="espaçosa">Espaçosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar Tooltips</Label>
                    <p className="text-sm text-muted-foreground">Exibir dicas de ajuda ao passar o mouse</p>
                  </div>
                  <Switch
                    checked={configInterface.mostrarTooltips}
                    onCheckedChange={(checked) => setConfigInterface((prev) => ({ ...prev, mostrarTooltips: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">Habilitar animações na interface</p>
                  </div>
                  <Switch
                    checked={configInterface.animacoes}
                    onCheckedChange={(checked) => setConfigInterface((prev) => ({ ...prev, animacoes: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Usar tema escuro por padrão</p>
                  </div>
                  <Switch
                    checked={configInterface.modoEscuro}
                    onCheckedChange={(checked) => setConfigInterface((prev) => ({ ...prev, modoEscuro: checked }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => salvarConfiguracao("interface", configInterface)}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => resetarConfiguracoes("interface")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Configure como e quando receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações via e-mail</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.emailNotificacoes}
                    onCheckedChange={(checked) =>
                      setConfigNotificacoes((prev) => ({ ...prev, emailNotificacoes: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações push no navegador</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.notificacoesPush}
                    onCheckedChange={(checked) =>
                      setConfigNotificacoes((prev) => ({ ...prev, notificacoesPush: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Vencimento</Label>
                    <p className="text-sm text-muted-foreground">Alertas sobre vencimentos próximos</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.notificacoesVencimento}
                    onCheckedChange={(checked) =>
                      setConfigNotificacoes((prev) => ({ ...prev, notificacoesVencimento: checked }))
                    }
                  />
                </div>

                {configNotificacoes.notificacoesVencimento && (
                  <div className="space-y-2 ml-4">
                    <Label htmlFor="dias-antecedencia">Dias de Antecedência</Label>
                    <Input
                      id="dias-antecedencia"
                      type="number"
                      min="1"
                      max="365"
                      value={configNotificacoes.diasAntecedenciaVencimento}
                      onChange={(e) =>
                        setConfigNotificacoes((prev) => ({
                          ...prev,
                          diasAntecedenciaVencimento: Number.parseInt(e.target.value) || 30,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Alertas sobre manutenções programadas</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.notificacoesManutencao}
                    onCheckedChange={(checked) =>
                      setConfigNotificacoes((prev) => ({ ...prev, notificacoesManutencao: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Backup</Label>
                    <p className="text-sm text-muted-foreground">Alertas sobre status dos backups</p>
                  </div>
                  <Switch
                    checked={configNotificacoes.notificacoesBackup}
                    onCheckedChange={(checked) =>
                      setConfigNotificacoes((prev) => ({ ...prev, notificacoesBackup: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="horario-notificacoes">Horário das Notificações</Label>
                  <Input
                    id="horario-notificacoes"
                    type="time"
                    value={configNotificacoes.horarioNotificacoes}
                    onChange={(e) =>
                      setConfigNotificacoes((prev) => ({ ...prev, horarioNotificacoes: e.target.value }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">Horário preferido para receber notificações diárias</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => salvarConfiguracao("notificacoes", configNotificacoes)}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => resetarConfiguracoes("notificacoes")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controle de Versão e Backup */}
        <TabsContent value="backup" className="space-y-6">
          <SupabaseTest />
          <RealtimeTest />
          <VersionControlPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
