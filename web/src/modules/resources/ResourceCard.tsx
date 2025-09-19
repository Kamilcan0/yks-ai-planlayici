export function ResourceCard({ subject, title, level, desc }:{ subject:string; title:string; level:string; desc:string }){
  return (
    <div className="rounded-2xl border p-3 bg-white/70">
      <div className="h-24 rounded-xl bg-gradient-to-br from-primary-100 to-white mb-2"/>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-slate-500">{subject}</div>
      <div className="mt-1 text-xs">{desc}</div>
      <div className="mt-2 inline-flex text-xs border rounded-full px-2 py-0.5 bg-white">{level}</div>
    </div>
  )
}


