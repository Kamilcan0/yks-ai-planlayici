export function Hero({ onAction }:{ onAction:()=>void }){
  return (
    <div className="rounded-3xl p-8 text-white bg-gradient-to-br from-primary-600 to-primary-500">
      <div className="text-2xl font-bold mb-2">Çalışmak eğlenceli olabilir!</div>
      <div className="opacity-90 mb-4">AI ile kişiselleştirilmiş haftalık planını hemen oluştur.</div>
      <button onClick={onAction} className="px-4 py-2 rounded-full bg-white text-primary-600 font-semibold">Planı Oluştur</button>
    </div>
  )
}


