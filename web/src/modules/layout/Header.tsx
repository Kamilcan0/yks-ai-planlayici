import { CalendarDays } from 'lucide-react'

export function Header({ name }: { name: string }){
  return (
    <header className="rounded-b-3xl bg-gradient-to-r from-primary-600 to-primary-500 text-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center">
            <CalendarDays className="w-5 h-5"/>
          </div>
          <div>
            <div className="text-xs/5 opacity-80">Merhaba,</div>
            <div className="text-lg font-semibold">{name || 'Öğrenci'}</div>
          </div>
          <div className="ml-auto w-9 h-9 rounded-full bg-white/30"/>
        </div>
      </div>
    </header>
  )
}


