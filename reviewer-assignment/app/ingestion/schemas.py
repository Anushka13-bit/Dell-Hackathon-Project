from pydantic import BaseModel
from enum import Enum
from typing import List, Dict

class SkillCategory(str, Enum):
    ML_AI = "ML_AI"
    Backend = "Backend"
    Data_Engineering = "Data_Engineering"
    Frontend = "Frontend"
    DevOps_Infra = "DevOps_Infra"
    Blockchain = "Blockchain"
    Cybersecurity = "Cybersecurity"
    Mobile = "Mobile"
    Design = "Design"

class ExtractedSkill(BaseModel):
    name: str
    category: SkillCategory

class ReviewerExtraction(BaseModel):
    skills: List[ExtractedSkill]
    
class ReviewerProfile(BaseModel):
    reviewer_id: str

    confidence_scores: Dict[SkillCategory, float]

    primary_specialization: SkillCategory

    secondary_specializations: List[SkillCategory]

class CompatibilityBreakdown(BaseModel):
    skill_match_score: float

    embedding_similarity_score: float

    category_confidence_score: float

    final_score: float

    matched_skills: List[str]

    missing_skills: List[str]

class AssignmentResult(BaseModel):
    submission_id: str

    reviewer_id: str

    compatibility_score: float

    explanation: List[str]

class SkillVector(BaseModel):
    backend: float = 0.0
    frontend: float = 0.0
    ai_ml: float = 0.0
    design: float = 0.0
    devops: float = 0.0
    mobile: float = 0.0
    data: float = 0.0
    cybersecurity: float = 0.0
    blockchain: float = 0.0