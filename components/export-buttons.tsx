"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"

interface ExportButtonsProps {
  onExportPDF: () => void
  onExportExcel: () => void
}

export function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={onExportPDF}>
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button variant="outline" onClick={onExportExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
    </div>
  )
}
