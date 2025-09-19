import json
import streamlit as st
from typing import Dict
import requests
from app.models import UserInput
from app.scheduler import generate_plan, generate_simple_plan, generate_one_week_plan

st.set_page_config(page_title="YKS AI Planlayıcı", page_icon="🧠", layout="wide")

# Modern tema ve CSS (sade versiyon)
st.markdown("""
    <style>
        .main { background: linear-gradient(to right, #f8f9fa, #ffffff); }  # Daha sade gradient
        .stButton>button { background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
        .stExpander { background-color: #f8f9fa; border-radius: 5px; border: 1px solid #dee2e6; }
        h1, h2, h3 { color: #333; font-family: 'Helvetica', sans-serif; font-weight: 300; }
        .card { background: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #e9ecef; margin-bottom: 15px; }  # Hafif border, az padding
    </style>
""", unsafe_allow_html=True)

st.title("🧠 AI Destekli YKS Çalışma Planlayıcı")

with st.sidebar:
    st.header("Bilgilerini Gir")
    name = st.text_input("Adın", value="")
    track = st.selectbox("Alanın", options=["sayisal", "ea", "sozel", "dil"], index=0)
    general_level = st.slider("Genel Seviyen (1=Başlangıç, 5=İleri)", min_value=1, max_value=5, value=3)
    
    # Varsayılanlar
    weeks_left = 12
    hours_per_week = 20
    default_levels: Dict[str, int] = {
        "Türkçe": 3,
        "Sosyal": 3,
        "Matematik": 3,
        "Geometri": 3,
        "Fizik": 2,
        "Kimya": 2,
        "Biyoloji": 2,
        "Yabancı Dil": 3,
    }
    subject_levels = {subj: general_level for subj in default_levels.keys()}
    include_ayt = True

# API_BASE değişkenini ortam değişkeninden al veya varsayılan kullan
import os
API_BASE = os.getenv("API_BASE", "https://your-backend-url.railway.app")

def fetch_simple_plan_via_api(user: UserInput) -> Dict:
    try:
        resp = requests.post(f"{API_BASE}/plan/simple", json=user.model_dump())
        if resp.ok:
            return resp.json()
    except Exception:
        pass
    # API erişilemezse yerelde üret
    return generate_simple_plan(user)

def fetch_one_week_plan_via_api(user: UserInput) -> Dict:
    try:
        resp = requests.post(f"{API_BASE}/plan/one-week", json=user.model_dump())
        if resp.ok:
            return resp.json()
    except Exception:
        pass
    return generate_one_week_plan(user)

if st.button("Plan Oluştur", use_container_width=True):
    user = UserInput(
        name=name,
        track=track,
        weeks_left=int(weeks_left),
        hours_per_week=int(hours_per_week),
        subject_levels=subject_levels,
        include_ayt=include_ayt,
    )
    one_week = fetch_one_week_plan_via_api(user)

    st.success("Plan hazırlandı! Aşağıdan haftalık detayları ve kaynakları görebilirsin.")

    # Özet kaldırıldı

    # 1 haftalık gün-gün blok listesi
    st.subheader("Bu Hafta", divider='grey')
    for day in one_week["week"]["days"]:
        with st.expander(day["day"], expanded=True):
            for idx, subj in enumerate(day["blocks"], start=1):
                st.write(f"{idx}. blok: {subj}")

    st.markdown("---")
    st.subheader("Önerilen Kaynaklar")
    for subject, items in one_week.get("resources", {}).items():
        with st.expander(subject, expanded=False):
            if not items:
                st.warning("Bu konu için öneri bulunamadı.")
            else:
                for r in items:
                    line = f"[{r.get('type','')}] {r.get('title','')} — {r.get('provider','')}"
                    if r.get("url"):
                        st.write(f"- {line}: {r['url']}")
                    else:
                        st.write(f"- {line}")

    st.markdown("---")
    json_plan = json.dumps(one_week, ensure_ascii=False, indent=2)
    st.download_button(
        label="Planı JSON olarak indir",
        file_name="yks_haftalik_plan.json",
        mime="application/json",
        data=json_plan,
        use_container_width=True,
    )
else:
    st.info("Sol menüden bilgilerini gir ve 'Plan Oluştur' butonuna bas.")
