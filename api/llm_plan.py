from datetime import datetime
from typing import Optional, List, Dict

from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel, Field

# Basit deterministik planlayici (LLM yoksa kullanilir)
DAY_NAMES = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"]

RESOURCE_BANK = {
    "turkce": {
        "baslangic": ["Bilgi Sarmal", "Endemik"],
        "orta": ["XRAY Türkçe Deneme"],
        "ileri": ["ÜçDörtBeş Türkçe"],
    },
    "matematik": {
        "baslangic": ["Toprak AYT Matematik Deneme (temel)"] ,
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

def get_day_type(index: int) -> str:
    return "TYT" if index % 2 == 0 else "AYT"

def get_daily_blocks(day_type: str):
    math_label = "TYT Matematik" if day_type == "TYT" else "AYT Matematik"
    phys_label = "TYT Fizik" if day_type == "TYT" else "AYT Fizik"
    bio_label = "TYT Biyoloji" if day_type == "TYT" else "AYT Biyoloji"
    return [
        {"time": "09:00 - 10:30", "subject": math_label, "duration": 1.5},
        {"time": "11:00 - 12:30", "subject": math_label, "duration": 1.5},
        {"time": "14:00 - 15:30", "subject": phys_label, "duration": 1.5},
        {"time": "16:00 - 17:30", "subject": bio_label, "duration": 1.5},
    ]

def build_deterministic_plan(level: str = "orta") -> Dict:
    days = []
    for i, day_name in enumerate(DAY_NAMES):
        if day_name == "Pazar":
            days.append({
                "day": day_name,
                "type": "Tekrar",
                "blocks": [
                    {"time": "09:00 - 10:30", "subject": "Haftalık tekrar - Matematik", "duration": 1.5},
                    {"time": "11:00 - 12:30", "subject": "Haftalık tekrar - Fizik", "duration": 1.5},
                    {"time": "14:00 - 15:30", "subject": "Haftalık tekrar - Biyoloji", "duration": 1.5},
                    {"time": "16:00 - 17:30", "subject": "Serbest (Kimya/Türkçe)", "duration": 1.5},
                ],
            })
        else:
            dt = get_day_type(i)
            days.append({"day": day_name, "type": dt, "blocks": get_daily_blocks(dt)})
    resources = {
        "turkce": RESOURCE_BANK["turkce"].get(level, RESOURCE_BANK["turkce"]["orta"]),
        "matematik": RESOURCE_BANK["matematik"].get(level, RESOURCE_BANK["matematik"]["orta"]),
        "fizik": RESOURCE_BANK["fizik"].get(level, RESOURCE_BANK["fizik"]["orta"]),
        "kimya": RESOURCE_BANK["kimya"].get(level, RESOURCE_BANK["kimya"]["orta"]),
        "biyoloji": RESOURCE_BANK["biyoloji"].get(level, RESOURCE_BANK["biyoloji"]["orta"]),
    }
    return {"meta": {"generated_at": datetime.utcnow().isoformat() + "Z"}, "days": days, "resources": resources}

class GeneratePayload(BaseModel):
    name: Optional[str] = ""
    grade: Optional[str] = ""
    type: Optional[str] = ""
    level: Optional[str] = Field(default="orta", pattern="^(baslangic|orta|ileri)$")
    availableDays: Optional[List[str]] = None

app = FastAPI(title="Local Deterministic YKS Plan API")

@app.post("/api/generate-plan")
async def generate_plan(payload: GeneratePayload = Body(...)):
    if payload is None:
        raise HTTPException(status_code=400, detail="Missing payload")
    plan = build_deterministic_plan(level=payload.level or "orta")
    return {"ok": True, "plan": plan}
