export function ProgressBadge({ value }: { value: number }){
  const deg = Math.round((value/100)*360)
  return (
    <div className="w-10 h-10 rounded-full grid place-items-center text-xs font-semibold"
         style={{background: `conic-gradient(#8b5cf6 ${deg}deg, #e9d5ff ${deg}deg)`}}>
      <div className="w-7 h-7 rounded-full grid place-items-center bg-white">{value}%</div>
    </div>
  )
}


