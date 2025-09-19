# YKS Haftalık Çalışma Planlayıcı (Streamlit)

Bu uygulama YKS'ye hazırlanan öğrenciler için haftalık çalışma programı ve kaynak önerisi üretir.

## Kurulum

1) Bağımlılıkları yükleyin:
```
pip install -r requirements.txt
```

2) Uygulamayı başlatın (UI tek başına):
```
streamlit run app/ui.py
```

3) API + UI beraber (Windows):
```
powershell -ExecutionPolicy Bypass -File .\scripts\start_all.ps1
```

API: `http://127.0.0.1:8000/docs`  UI: `http://127.0.0.1:8501`

## Testleri Çalıştırma
```
pytest -q
```

## HTTP API
- Plan üretimi (detaylı): `POST /plan` — gövde `app/models.py::UserInput`
- React uyumlu AI planı: `POST /react/plan?level=orta` veya body `{ "level": "orta" }`

### React örneği
```tsx
async function getAiPlan(level: "baslangic" | "orta" | "ileri" = "orta") {
  const r = await fetch(`http://127.0.0.1:8000/react/plan?level=${level}`, { method: "POST" });
  if (!r.ok) throw new Error("AI plan alınamadı");
  const data = await r.json();
  return data.plan; // { meta, days, resources }
}
```

## Özellikler
- Alan (Sayısal/EA/Sözel/Dil) odaklı dağılım
- Haftalık saat ve kalan hafta bilgilere göre konu/hafta planı
- Seviye (1-5) girdisine göre ağırlıklandırma
- Kitap/video/web kaynak önerileri
- JSON dışa aktarma
