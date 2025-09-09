import { useState, useEffect } from 'react'
import { CategoriaService } from '@/lib/services/categoria-service'
import { SetorService } from '@/lib/services/setor-service'
import { LocalizacaoService } from '@/lib/services/localizacao-service'
import type { Categoria, Setor, Localizacao, ContaContabil, ContaDepreciacao, ContaCreditoFiscal } from '@/types/parametros'

export function useParametros() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([])
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([])
  const [contasDepreciacao, setContasDepreciacao] = useState<ContaDepreciacao[]>([])
  const [contasCreditoFiscal, setContasCreditoFiscal] = useState<ContaCreditoFiscal[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadParametros = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar dados do Supabase
      const [categoriasData, setoresData, localizacoesData] = await Promise.all([
        CategoriaService.getAll(),
        SetorService.getAll(),
        LocalizacaoService.getAll()
      ])

      // Mapear categorias
      setCategorias(categoriasData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        descricao: cat.descricao || '',
        taxaDepreciacao: cat.taxa_depreciacao || 0,
        vidaUtil: 0, // Campo não existe no Supabase ainda
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: cat.created_at
      })))

      // Mapear setores
      setSetores(setoresData.map(setor => ({
        id: setor.id,
        nome: setor.nome,
        descricao: setor.descricao || '',
        responsavel: setor.responsavel || '',
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: setor.created_at
      })))

      // Mapear localizações
      setLocalizacoes(localizacoesData.map(loc => ({
        id: loc.id,
        nome: loc.nome,
        descricao: loc.descricao || '',
        setor: '', // Campo não existe no Supabase ainda
        andar: '', // Campo não existe no Supabase ainda
        sala: '', // Campo não existe no Supabase ainda
        ativo: true, // Campo não existe no Supabase ainda
        dataInclusao: loc.created_at
      })))

      // Carregar contas contábeis do localStorage (temporariamente)
      const storedContasContabeis = localStorage.getItem("contas-contabeis-sistema")
      if (storedContasContabeis) {
        setContasContabeis(JSON.parse(storedContasContabeis))
      }

      const storedContasDepreciacao = localStorage.getItem("contas-depreciacao-sistema")
      if (storedContasDepreciacao) {
        setContasDepreciacao(JSON.parse(storedContasDepreciacao))
      }

      const storedContasCreditoFiscal = localStorage.getItem("contas-credito-fiscal-sistema")
      if (storedContasCreditoFiscal) {
        setContasCreditoFiscal(JSON.parse(storedContasCreditoFiscal))
      }

    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao carregar parâmetros:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParametros()
  }, [])

  const refreshParametros = () => {
    loadParametros()
  }

  return {
    categorias,
    setores,
    localizacoes,
    contasContabeis,
    contasDepreciacao,
    contasCreditoFiscal,
    loading,
    error,
    refreshParametros
  }
}


