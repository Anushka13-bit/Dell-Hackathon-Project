import os
from collections import Counter

import pdfplumber
from groq import Groq

from app.config.taxonomy import (
    CATEGORY_DESCRIPTIONS,
    VALID_CATEGORIES,
    CATEGORY_CAPS,
)

from app.ingestion.schemas import (
    ReviewerExtraction,
    SkillCategory,
)

from dotenv import load_dotenv

load_dotenv()
from app.db.db import Reviewer
from app.db.reviewer_repository import save_reviewer

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

#vector mapping 
CATEGORY_TO_VECTOR = {
    SkillCategory.Backend: "backend",
    SkillCategory.Frontend: "frontend",
    SkillCategory.ML_AI: "ai_ml",
    SkillCategory.DevOps_Infra: "devops",
    SkillCategory.Data_Engineering: "data",
    SkillCategory.Mobile: "mobile",
    SkillCategory.Design: "design",
    SkillCategory.Cybersecurity: "cybersecurity",
    SkillCategory.Blockchain: "blockchain",
}


# ============================================================================
# PDF PARSING
# ============================================================================

def extract_resume_text(file_path: str) -> str:
    pages = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if text:
                pages.append(text)

    return "\n".join(pages)


# ============================================================================
# PROMPT GENERATION
# ============================================================================

def build_extraction_prompt(resume_text: str) -> str:

    category_context = "\n".join(
        f"- {category}: {description}"
        for category, description in CATEGORY_DESCRIPTIONS.items()
    )

    allowed_categories = ", ".join(VALID_CATEGORIES)

    return f"""
You are an expert technical resume parser.

Your job is to extract reviewer expertise from a resume for an automated reviewer assignment system.

=========================================================================
OBJECTIVE
=========================================================================

Analyze the ENTIRE resume.

Extract ALL technical skills demonstrated anywhere in the document.

Skills may appear in:

- Skills section
- Projects
- Experience
- Internships
- Research work
- Certifications
- Publications
- Achievements
- Hackathons
- Technical leadership activities

Do NOT restrict extraction to the skills section.

=========================================================================
CATEGORY DEFINITIONS
=========================================================================

{category_context}

=========================================================================
CATEGORIZATION RULES
=========================================================================

Every extracted skill MUST belong to EXACTLY ONE category.

Allowed categories:

{allowed_categories}

Do not create new categories.

Do not use category names outside this list.

=========================================================================
NORMALIZATION RULES
=========================================================================

Normalize aliases when possible.

Examples:

Postgres → PostgreSQL
JS → JavaScript
TS → TypeScript
K8s → Kubernetes
Node → Node.js

Remove duplicates.

A skill should appear only once in the final output.

=========================================================================
INFERENCE RULES
=========================================================================

You MAY infer a skill ONLY when there is strong evidence.

Example:

"Built REST APIs using Spring Boot"

Extract:
- Java
- Spring Boot
- REST API

Example:

"Developed Kafka-based event driven architecture"

Extract:
- Kafka
- Event Driven Architecture

Do NOT hallucinate skills.

Do NOT guess technologies not supported by evidence.

=========================================================================
TECHNICAL SIGNAL EXPANSION RULES
=========================================================================

Extract ALL technical concepts that demonstrate reviewer expertise.

This includes:

- Programming languages
- Frameworks
- Libraries
- Databases
- Cloud services
- Infrastructure tools
- Security concepts
- AI frameworks
- Protocols
- Architecture patterns
- Distributed systems concepts
- Workflow orchestration tools
- Engineering methodologies

Examples of valid extracted skills:

Temporal
BullMQ
RBAC
Prompt Injection
Observability
Pub/Sub
Event Driven Architecture
Policy Engine
Consent Manager
Audit Ledger
UPI
Agent Orchestration
Workflow Automation
Realtime Systems
Multi-Tenant Architecture
Distributed Systems

Do NOT omit technical concepts simply because they are not traditional software tools.

If a technical concept demonstrates expertise relevant to reviewer assignment,
it should be extracted.

DATABASE CLASSIFICATION RULES

PostgreSQL
MySQL
MongoDB
Redis
Firebase

should be classified as Backend by default.

Only classify them as Data_Engineering if the surrounding context
explicitly discusses:

- ETL
- Warehousing
- Analytics
- Spark
- Airflow
- Batch pipelines
- Stream processing
- Data platforms

=========================================================================
OUTPUT RULES
=========================================================================

Return ONLY valid JSON.

Do NOT return markdown.

Do NOT return explanations.

Do NOT return reasoning.

Do NOT return code fences.

DO NOT EXTRACT:

- Names
- Emails
- Phone numbers
- LinkedIn URLs
- GitHub URLs
- College names
- Degree names
- CGPA
- Dates
- Company names by themselves

Only extract technical skills, tools, technologies, frameworks, methodologies, platforms, and domains.

Schema:

{{
    "skills": [
        {{
            "name": "Java",
            "category": "Backend"
        }},
        {{
            "name": "Kafka",
            "category": "Data_Engineering"
        }}
    ]
}}

=========================================================================
RESUME
=========================================================================

{resume_text}
"""


# ============================================================================
# GROQ EXTRACTION
# ============================================================================

def extract_skills(resume_text: str) -> ReviewerExtraction:

    prompt = build_extraction_prompt(
        resume_text
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    return ReviewerExtraction.model_validate_json(content)


# ============================================================================
# SKILL VECTOR GENERATION
# ============================================================================

def build_skill_vector(
    extraction: ReviewerExtraction
) -> dict:

    vector = {
        "backend": 0.0,
        "frontend": 0.0,
        "ai_ml": 0.0,
        "design": 0.0,
        "devops": 0.0,
        "mobile": 0.0,
        "data": 0.0,
        "cybersecurity": 0.0,
        "blockchain": 0.0,
    }

    category_counts = Counter()

    for skill in extraction.skills:

        vector_key = CATEGORY_TO_VECTOR.get(
            skill.category
        )

        if vector_key:
            category_counts[vector_key] += 1

    for category, count in category_counts.items():

        cap = CATEGORY_CAPS[category]

        vector[category] = round(
            min(count / cap, 1.0),
            4
        )

    return vector


# ============================================================================
# SPECIALIZATION DETECTION
# ============================================================================

def get_specializations(
    skill_vector: dict
):

    ranked = sorted(

        skill_vector.items(),
        key=lambda x: x[1],
        reverse=True
    )

    primary = ranked[0][0]

    secondary = [
        category
        for category, score in ranked[1:]
        if score >= 0.20
    ]

    return primary, secondary


# ============================================================================
# REVIEWER CREATION
# ============================================================================

def build_reviewer(
    name: str,
    resume_text: str,
    extraction: ReviewerExtraction
) -> Reviewer:

    skill_vector = build_skill_vector(
        extraction
    )

    primary, secondary = get_specializations(
        skill_vector
    )

    return Reviewer(
        name=name,
        resume_text=resume_text,
        skills_json=[
            skill.model_dump()
            for skill in extraction.skills
        ],
        skill_vector=skill_vector,
        primary_specialization=primary,
        secondary_specializations=secondary,
    )


# ============================================================================
# END-TO-END PIPELINE
# ============================================================================

def process_resume(
    name: str,
    pdf_path: str
) -> Reviewer:

    resume_text = extract_resume_text(
        pdf_path
    )

    extraction = extract_skills(
        resume_text
    )

    reviewer = build_reviewer(
        name=name,
        resume_text=resume_text,
        extraction=extraction
    )

    return reviewer

if __name__ == "__main__":

    text = extract_resume_text("sample_resume.pdf")

    print("TEXT EXTRACTED")
    print(text[:1000])

    extraction = extract_skills(text)

    print("\nSKILLS")
    print(extraction.model_dump())

    vector = build_skill_vector(extraction)

    print("\nVECTOR")
    print(vector)

    primary, secondary = get_specializations(vector)

    print("\nPRIMARY")
    print(primary)

    print("\nSECONDARY")
    print(secondary)

    reviewer = process_resume(
    name="Atharva",
    pdf_path="sample_resume.pdf"
    )

    saved = save_reviewer(reviewer)
    print(saved.reviewer_id)