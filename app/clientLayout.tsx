"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { versionControl } from "@/utils/version-control"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Inicializar o sistema de controle de versão
    versionControl.init()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Controle de Ativo Imobilizado" subtitle="Sistema de gestão patrimonial" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}
