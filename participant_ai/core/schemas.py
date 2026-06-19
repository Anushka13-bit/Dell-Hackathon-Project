"""
Pydantic models for the participant AI pipeline.

Postgres shape (owned by registration team — reference only):

    CREATE TABLE participants (
        id            UUID PRIMARY KEY,
        name          TEXT,
        college_name  TEXT,
        github_url    TEXT,
        declared_skills TEXT[],
        skill_vector  JSONB,   -- 9 fixed keys, trivial at hundreds of rows
        team_id       UUID NULL REFERENCES teams(team_id)
    );

    CREATE INDEX idx_participants_unassigned ON participants (team_id) WHERE team_id IS NULL;
    -- Team formation always starts with: SELECT * FROM participants WHERE team_id IS NULL

    CREATE TABLE problem_statements (
        ps_id            UUID PRIMARY KEY,
        title            TEXT,
        raw_text         TEXT,
        required_vector  JSONB,
        min_size         INT,
        max_size         INT
    );

    CREATE TABLE teams (
        team_id   UUID PRIMARY KEY,
        name      TEXT,
        member_ids UUID[]
    );
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, model_validator

from participant_ai.core.skill_taxonomy import category_names

class SkillVector(BaseModel):
    """Dynamic dict-backed skill profile; values clipped to [0.0, 1.0]."""
    scores: dict[str, float] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_and_clip(self) -> "SkillVector":
        valid = set(category_names())
        cleaned = {}
        for cat in valid:
            cleaned[cat] = max(0.0, min(1.0, float(self.scores.get(cat, 0.0))))
        dropped = set(self.scores.keys()) - valid
        if dropped:
            import logging
            logging.warning(f"Dropped unknown skill categories not in taxonomy: {dropped}")
        object.__setattr__(self, "scores", cleaned)
        return self

    def to_dict(self) -> dict[str, float]:
        return dict(self.scores)

    @classmethod
    def from_dict(cls, data: dict) -> "SkillVector":
        return cls(scores=data)

    def dominant(self, top_n: int = 2) -> list[str]:
        ranked = sorted(self.scores.items(), key=lambda kv: kv[1], reverse=True)
        return [cat for cat, _ in ranked[:top_n]]


class ParsedResume(BaseModel):
    name: Optional[str] = None
    college_name: Optional[str] = None
    github_url: Optional[str] = None
    raw_skills: list[str] = Field(default_factory=list)
    experience_summary: str = ""
    projects: list[str] = Field(default_factory=list)


class Participant(BaseModel):
    id: str
    parsed_resume: ParsedResume
    skill_vector: SkillVector
    team_id: Optional[str] = None


class PSRequirement(BaseModel):
    ps_id: str
    title: str
    raw_text: str
    required_vector: SkillVector
    team_size: int


class Team(BaseModel):
    team_id: str
    name: str
    member_ids: list[str] = Field(default_factory=list)
    slots_remaining: int
