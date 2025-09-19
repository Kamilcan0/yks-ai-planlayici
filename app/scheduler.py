from __future__ import annotations
from typing import Dict, List
import math
import json
import os
from .models import UserInput, WeeklyPlan, SubjectPlan, GeneratedPlan

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

os.makedirs(DATA_DIR, exist_ok=True)

def _load_json(path: str, fallback: dict) -> dict:
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(fallback, f, ensure_ascii=False, indent=2)
        return fallback
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

YKS_TOPICS = _load_json(
    os.path.join(DATA_DIR, "yks_topics.json"),
    {
        "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Dil Bilgisi", "Yazım-Noktalama"],
        "Sosyal": ["Tarih Temel", "Coğrafya Temel", "Felsefe", "Din Kültürü"],
        "Matematik": ["Temel Kavramlar", "Sayılar", "Bölünebilme", "OBEB-OKEK", "Rasyonel Sayılar", "Denklemler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar", "Oran-Orantı", "Problemler"],
        "Geometri": ["Açı-Kenar", "Üçgenler", "Dörtgenler", "Çokgenler", "Çember-Daire", "Katı Cisimler"],
        "Fizik": ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "Enerji", "Elektrik ve Manyetizma"],
        "Kimya": ["Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler", "Kimyasal Hesaplamalar", "Asit-Baz-Tuz", "Karışımlar"],
        "Biyoloji": ["Canlıların Yapısı", "Hücre", "Canlıların Sınıflandırılması", "İnsan Fizyolojisi", "Ekosistem"],
        "Yabancı Dil": ["Vocabulary", "Grammar", "Reading", "Use of English", "Listening"],
    },
)

RESOURCE_DB = _load_json(
    os.path.join(DATA_DIR, "resources.json"),
    {
        "Matematik": [
            {"type": "book", "title": "TYT Matematik Soru Bankası", "provider": "Karekök", "tags": ["sayisal", "ea"]},
            {"type": "video", "title": "Hocalara Geldik - TYT Matematik", "provider": "YouTube", "url": "https://www.youtube.com/@hocalarageldik", "tags": ["sayisal", "ea"]},
            {"type": "web", "title": "Khan Academy Türkçe - Matematik", "provider": "Khan Academy", "url": "https://tr.khanacademy.org", "tags": ["sayisal", "ea"]}
        ],
        "Geometri": [
            {"type": "book", "title": "AYT Geometri Soru Bankası", "provider": "Apotemi", "tags": ["sayisal", "ea"]},
            {"type": "video", "title": "Tonguç Geometri", "provider": "YouTube", "url": "https://www.youtube.com/@tongucakademi", "tags": ["sayisal", "ea"]}
        ],
        "Fizik": [
            {"type": "book", "title": "AYT Fizik Soru Bankası", "provider": "Aydın", "tags": ["sayisal"]},
            {"type": "video", "title": "Parafizik", "provider": "YouTube", "url": "https://www.youtube.com/@parafizik", "tags": ["sayisal"]}
        ],
        "Kimya": [
            {"type": "book", "title": "AYT Kimya Soru Bankası", "provider": "Endemik", "tags": ["sayisal"]},
            {"type": "video", "title": "Kimya Adası", "provider": "YouTube", "url": "https://www.youtube.com/@kimyaadasi", "tags": ["sayisal"]}
        ],
        "Biyoloji": [
            {"type": "book", "title": "AYT Biyoloji Soru Bankası", "provider": "Bilgi Sarmal", "tags": ["sayisal"]},
            {"type": "video", "title": "BiyolojiGUN", "provider": "YouTube", "url": "https://www.youtube.com/@BiyolojiGUN", "tags": ["sayisal"]}
        ],
        "Türkçe": [
            {"type": "book", "title": "TYT Türkçe Paragraf", "provider": "Paraf", "tags": ["sayisal", "ea", "sozel", "dil"]},
            {"type": "video", "title": "Paragrafiks", "provider": "YouTube", "url": "https://www.youtube.com/@paragrafiks", "tags": ["sayisal", "ea", "sozel", "dil"]}
        ],
        "Sosyal": [
            {"type": "book", "title": "TYT Sosyal Bilimler Soru Bankası", "provider": "Bilgi Sarmal", "tags": ["ea", "sozel"]},
            {"type": "video", "title": "Hocalara Geldik - TYT Sosyal", "provider": "YouTube", "url": "https://www.youtube.com/@hocalarageldik", "tags": ["ea", "sozel"]}
        ],
        "Yabancı Dil": [
            {"type": "book", "title": "YDT Vocabulary", "provider": "Modadil", "tags": ["dil"]},
            {"type": "web", "title": "Cambridge English Practice", "provider": "Cambridge", "url": "https://www.cambridgeenglish.org", "tags": ["dil"]}
        ]
    },
)

TRACK_WEIGHTS = {
    "sayisal": {"Matematik": 1.0, "Geometri": 0.8, "Fizik": 1.0, "Kimya": 0.9, "Biyoloji": 0.9, "Türkçe": 0.6, "Sosyal": 0.4, "Yabancı Dil": 0.3},
    "ea": {"Matematik": 1.0, "Geometri": 0.9, "Türkçe": 0.9, "Sosyal": 0.8, "Fizik": 0.4, "Kimya": 0.4, "Biyoloji": 0.4, "Yabancı Dil": 0.3},
    "sozel": {"Türkçe": 1.0, "Sosyal": 1.0, "Matematik": 0.5, "Geometri": 0.5, "Yabancı Dil": 0.4, "Fizik": 0.2, "Kimya": 0.2, "Biyoloji": 0.2},
    "dil": {"Yabancı Dil": 1.0, "Türkçe": 0.7, "Sosyal": 0.5, "Matematik": 0.4, "Geometri": 0.4, "Fizik": 0.2, "Kimya": 0.2, "Biyoloji": 0.2},
}

DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

def _normalize(values: Dict[str, float]) -> Dict[str, float]:
    total = sum(max(v, 0.0) for v in values.values()) or 1.0
    return {k: max(v, 0.0) / total for k, v in values.items()}

# Genel seviyeye göre weights uyarla
def _derive_subject_weights(user: UserInput) -> Dict[str, float]:
    base = TRACK_WEIGHTS[user.track].copy()
    general_level = list(user.subject_levels.values())[0]  # Genel seviye al (tek seviye girdiğimiz için)
    for subject in base:
        gap = 6 - general_level
        base[subject] = base.get(subject, 0.5) * (1.0 + gap * 0.12)
    return _normalize(base)

def _allocate_weekly_hours(user: UserInput) -> Dict[str, float]:
    weights = _derive_subject_weights(user)
    return {s: round(user.hours_per_week * w, 2) for s, w in weights.items()}

def _pick_topics_for_subject(subject: str, weekly_hours: float, weeks_left: int) -> List[str]:
    topics = YKS_TOPICS.get(subject, [])
    topics_per_week = max(1, math.floor(weekly_hours / 2))
    return topics[: min(len(topics), topics_per_week)]

def _distribute_daily(weekly_hours: float) -> Dict[str, float]:
    base = [1, 1, 1, 1, 1, 1.2, 1.2]
    norm = [b / sum(base) for b in base]
    per_day = [round(weekly_hours * w, 2) for w in norm]
    per_day[-1] = weekly_hours - sum(per_day[:-1])
    return {day: per_day[i] for i, day in enumerate(DAYS)}

def _build_week_plan(user: UserInput, week_index: int, weekly_hours_by_subject: Dict[str, float]) -> WeeklyPlan:
    subjects: List[SubjectPlan] = []
    for subject, hours in weekly_hours_by_subject.items():
        if hours < 1e-2:
            continue
        topics = _pick_topics_for_subject(subject, hours, user.weeks_left)
        subjects.append(
            SubjectPlan(
                subject=subject,
                weekly_hours=hours,
                daily_distribution=_distribute_daily(hours),
                topics=topics,
            )
        )
    return WeeklyPlan(week_index=week_index, subjects=subjects)

def _suggest_resources(user: UserInput) -> Dict[str, List[Dict[str, str]]]:
    suggestions: Dict[str, List[Dict[str, str]]] = {}
    for subject in TRACK_WEIGHTS[user.track].keys():
        subject_res = RESOURCE_DB.get(subject, [])
        if not subject_res:  # Boşsa fallback ekle
            subject_res = [{"type": "web", "title": "Genel Kaynak", "provider": "Khan Academy", "url": "https://tr.khanacademy.org"}]
        ranked = sorted(subject_res, key=lambda r: 0 if user.track in r.get("tags", []) else 1)
        suggestions[subject] = ranked[:5]
    return suggestions

def generate_plan(user: UserInput) -> GeneratedPlan:
    weekly_hours_by_subject = _allocate_weekly_hours(user)
    weeks: List[WeeklyPlan] = []
    for w in range(1, user.weeks_left + 1):
        weeks.append(_build_week_plan(user, w, weekly_hours_by_subject))
    return GeneratedPlan(user=user, weeks=weeks, resource_suggestions=_suggest_resources(user))

# Saat içermeyen sade plan (hafta -> ders -> konular)
def generate_simple_plan(user: UserInput) -> Dict[str, List[Dict[str, List[str]]]]:
    weekly_hours_by_subject = _allocate_weekly_hours(user)
    simple_weeks: List[Dict[str, List[Dict[str, List[str]]]]] = []
    for w in range(1, user.weeks_left + 1):
        subjects_block: List[Dict[str, List[str]]] = []
        for subject, hours in weekly_hours_by_subject.items():
            if hours < 1e-2:
                continue
            topics = _pick_topics_for_subject(subject, hours, user.weeks_left)
            subjects_block.append({
                "subject": subject,
                "topics": topics,
            })
        simple_weeks.append({
            "week_index": w,
            "subjects": subjects_block,
        })
    return {
        "weeks": simple_weeks,
        "resources": _suggest_resources(user),
    }

# 1 haftalık, gün-gün, saat içermeyen blok planı
def generate_one_week_plan(user: UserInput, blocks_per_day: int = 6) -> Dict[str, List[Dict[str, List[str]]]]:
    weights = _derive_subject_weights(user)
    subjects_sorted = [name for name, _ in sorted(weights.items(), key=lambda kv: kv[1], reverse=True)]
    # En faydalı 4 dersi öne çıkar; daha azsa mevcut kadar
    focus_subjects = subjects_sorted[: max(1, min(4, len(subjects_sorted)))]

    days_out: List[Dict[str, List[str]]] = []
    for day_index, day in enumerate(DAYS):
        blocks: List[str] = []
        for i in range(blocks_per_day):
            subject = focus_subjects[(i + day_index) % len(focus_subjects)]
            blocks.append(subject)
        days_out.append({"day": day, "blocks": blocks})

    return {
        "week": {"days": days_out},
        "resources": _suggest_resources(user),
    }
