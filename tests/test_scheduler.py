import math
from app.models import UserInput
from app.scheduler import generate_plan


def test_generate_plan_basic():
    user = UserInput(
        name="Test",
        track="sayisal",
        weeks_left=4,
        hours_per_week=20,
        subject_levels={
            "Türkçe": 3,
            "Sosyal": 3,
            "Matematik": 3,
            "Geometri": 3,
            "Fizik": 2,
            "Kimya": 2,
            "Biyoloji": 2,
            "Yabancı Dil": 3,
        },
        include_ayt=True,
    )

    plan = generate_plan(user)

    assert len(plan.weeks) == 4
    assert plan.user.track == "sayisal"
    # Her hafta subject listesi bos olmamali ve saatler pozitif olmali
    for week in plan.weeks:
        assert len(week.subjects) > 0
        for sp in week.subjects:
            assert sp.weekly_hours >= 0
            assert isinstance(sp.daily_distribution, dict)
            assert sum(sp.daily_distribution.values()) == sp.weekly_hours
            assert isinstance(sp.topics, list)


def test_weighting_levels_affect_distribution():
    low_level_user = UserInput(
        name="Low",
        track="ea",
        weeks_left=2,
        hours_per_week=10,
        subject_levels={"Matematik": 1, "Türkçe": 5},
        include_ayt=True,
    )
    high_level_user = UserInput(
        name="High",
        track="ea",
        weeks_left=2,
        hours_per_week=10,
        subject_levels={"Matematik": 5, "Türkçe": 1},
        include_ayt=True,
    )

    low_plan = generate_plan(low_level_user)
    high_plan = generate_plan(high_level_user)

    def weekly_total(plan, subject):
        return plan.weeks[0].subjects[[s.subject for s in plan.weeks[0].subjects].index(subject)].weekly_hours

    math_low = weekly_total(low_plan, "Matematik")
    math_high = weekly_total(high_plan, "Matematik")

    assert math_low != math_high
