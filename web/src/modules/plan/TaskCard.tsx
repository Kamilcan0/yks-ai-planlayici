import { ReactNode } from 'react'
import { ProgressBadge } from './ProgressBadge'

export function TaskCard({ title, tasks, progress, icon, onOpen }:{ title:string; tasks:number; progress:number; icon:ReactNode; onOpen:()=>void }){
  return (
    <button onClick={onOpen} className="text-left rounded-2xl border p-3 bg-white/70 hover:shadow">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary-50 grid place-items-center">{icon}</div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-slate-500">{tasks} görev</div>
        </div>
        <div className="ml-auto"><ProgressBadge value={progress}/></div>
      </div>
    </button>
  )
}


