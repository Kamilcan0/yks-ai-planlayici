const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export function CalendarStrip({ selected, onSelect }: { selected: number; onSelect: (i:number)=>void }){
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 p-2">
        {days.map((d,i)=>{
          const active = i===selected
          return (
            <button key={d} onClick={()=>onSelect(i)} className={`min-w-14 px-3 py-2 rounded-2xl border transition ${active? 'bg-white shadow text-primary-600' : 'bg-white/60 hover:bg-white/80'}`}>
              <div className="text-xs opacity-70">{d}</div>
              <div className="text-sm font-semibold">{i+11}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}


