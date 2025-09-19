from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from app.models import UserInput, GeneratedPlan
from app.scheduler import generate_plan, generate_simple_plan, generate_one_week_plan
from datetime import datetime
from typing import Optional, Dict, Any

app = FastAPI(title="YKS Plan API")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8501",  # Streamlit için ekle
    "http://127.0.0.1:8501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/plan", response_model=GeneratedPlan)
async def create_plan(payload: UserInput):
    return generate_plan(payload)

@app.post("/plan/simple")
async def create_simple_plan(payload: UserInput):
    return generate_simple_plan(payload)

@app.post("/plan/one-week")
async def create_one_week_plan(payload: UserInput):
    return generate_one_week_plan(payload)

# === React uyumlu endpoint ===
RESOURCE_BANK = {
    "turkce": {
        "baslangic": ["Bilgi Sarmal", "Endemik"],
        "orta": ["XRAY Türkçe Deneme"],
        "ileri": ["ÜçDörtBeş Türkçe"],
    },
    "matematik": {
        "baslangic": ["Toprak AYT Matematik Deneme (temel)"],
        "orta": ["ÜçDörtBeş TYT Matematik Deneme", "Toprak AYT Matematik"],
        "ileri": ["Apotemi AYT Matematik"],
    },
    "fizik": {
        "baslangic": ["Bilgi Sarmal Fizik", "Esen TYT Fizik"],
        "orta": ["Nihat Bilgin TYT-AYT Soru Bankası"],
        "ileri": ["Ertan Sinan Şahin TYT-AYT Deneme"],
    },
    "kimya": {
        "baslangic": ["Miray Yayınları"],
        "orta": ["Paraf AYT Kimya"],
        "ileri": ["Aydın Yayınları"],
    },
    "biyoloji": {
        "baslangic": ["Palme TYT Biyoloji (kolay)"],
        "orta": ["Palme Biyoloji"],
        "ileri": ["Biyotik Yayınları"],
    },
}

DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

def _get_day_type(index: int) -> str:
    return "TYT" if index % 2 == 0 else "AYT"

def _get_daily_blocks(day_type: str):
    math_label = "TYT Matematik" if day_type == "TYT" else "AYT Matematik"
    phys_label = "TYT Fizik" if day_type == "TYT" else "AYT Fizik"
    bio_label = "TYT Biyoloji" if day_type == "TYT" else "AYT Biyoloji"
    return [
        {"time": "09:00 - 10:30", "subject": math_label, "duration": 1.5},
        {"time": "11:00 - 12:30", "subject": math_label, "duration": 1.5},
        {"time": "14:00 - 15:30", "subject": phys_label, "duration": 1.5},
        {"time": "16:00 - 17:30", "subject": bio_label, "duration": 1.5},
    ]

@app.post("/react/plan")
async def react_plan(body: Optional[Dict[str, Any]] = Body(default=None), level: Optional[str] = Query(default=None)):
    lvl = level or (body or {}).get("level") or "orta"

    days = []
    for i, name in enumerate(DAY_NAMES):
        if name == "Pazar":
            days.append({
                "day": name,
                "type": "Tekrar",
                "blocks": [
                    {"time": "09:00 - 10:30", "subject": "Haftalık tekrar - Matematik", "duration": 1.5},
                    {"time": "11:00 - 12:30", "subject": "Haftalık tekrar - Fizik", "duration": 1.5},
                    {"time": "14:00 - 15:30", "subject": "Haftalık tekrar - Biyoloji", "duration": 1.5},
                    {"time": "16:00 - 17:30", "subject": "Serbest (Kimya/Türkçe)", "duration": 1.5},
                ],
            })
        else:
            day_type = _get_day_type(i)
            days.append({"day": name, "type": day_type, "blocks": _get_daily_blocks(day_type)})

    resources = {
        "turkce": RESOURCE_BANK["turkce"].get(lvl, RESOURCE_BANK["turkce"]["orta"]),
        "matematik": RESOURCE_BANK["matematik"].get(lvl, RESOURCE_BANK["matematik"]["orta"]),
        "fizik": RESOURCE_BANK["fizik"].get(lvl, RESOURCE_BANK["fizik"]["orta"]),
        "kimya": RESOURCE_BANK["kimya"].get(lvl, RESOURCE_BANK["kimya"]["orta"]),
        "biyoloji": RESOURCE_BANK["biyoloji"].get(lvl, RESOURCE_BANK["biyoloji"]["orta"]),
    }

    return {
        "ok": True,
        "plan": {
            "meta": {"generated_at": datetime.utcnow().isoformat() + "Z"},
            "days": days,
            "resources": resources,
        },
    }

# calistirma: uvicorn api.server:app --reload --port 8001  # Çatışma varsa 8001 kullan
