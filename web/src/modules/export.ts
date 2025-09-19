import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

export async function exportElementToPdf(elementId: string, filename = 'yks_plan.pdf'){
  const el = document.getElementById(elementId)
  if(!el) return
  const canvas = await html2canvas(el, {scale: 2, backgroundColor: '#ffffff'})
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p','mm','a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const w = canvas.width * ratio
  const h = canvas.height * ratio
  const x = (pageWidth - w) / 2
  const y = 10
  pdf.addImage(imgData, 'PNG', x, y, w, h)
  pdf.save(filename)
}

type ExcelDay = { day: string; blocks: { time: string; subject: string }[] }
export function exportWeekToExcel(week: ExcelDay[], filename = 'yks_plan.xlsx'){
  const rows = [] as any[]
  for(const d of week){
    for(const b of d.blocks){
      rows.push({Gün: d.day, Saat: b.time, Ders: b.subject})
    }
  }
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Hafta')
  XLSX.writeFile(wb, filename)
}


