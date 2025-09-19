from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

Track = Literal["sayisal", "ea", "sozel", "dil"]

class UserInput(BaseModel):
    name: Optional[str] = Field(default="")
    track: Track
    weeks_left: int = Field(ge=1, le=60)
    hours_per_week: int = Field(ge=1, le=80)
    subject_levels: Dict[str, int] = Field(description="Her ders için 1-5 arası seviye", default_factory=dict)
    include_ayt: bool = True

class SubjectPlan(BaseModel):
    subject: str
    weekly_hours: float
    daily_distribution: Dict[str, float]
    topics: List[str]

class WeeklyPlan(BaseModel):
    week_index: int
    subjects: List[SubjectPlan]

class ResourceItem(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    provider: Optional[str] = None
    url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class GeneratedPlan(BaseModel):
    user: UserInput
    weeks: List[WeeklyPlan]
    resource_suggestions: Dict[str, List[ResourceItem]]
