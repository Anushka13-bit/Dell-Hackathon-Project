# ── Category descriptions (for LLM prompt injection) ─────────────────────────
# Injected into the extraction prompt so Gemini categorises consistently.

#to give gemini context so parsed words can be put into the right categories and mapped as per our requirements 
CATEGORY_DESCRIPTIONS: dict[str, str] = {
    "ML_AI":
        "Machine learning, deep learning, LLMs, NLP, computer vision, "
        "AI frameworks, model training and deployment, embeddings, RAG systems.",
    "Backend":
        "Server-side engineering, APIs, REST, GraphQL, gRPC, authentication, "
        "authorization, JWT, RBAC, distributed systems, microservices, "
        "message queues, workflow orchestration, realtime systems, "
        "event driven architecture, backend infrastructure, system design.",
    "Data_Engineering":
        "ETL pipelines, ELT, analytics, warehousing, Spark, Airflow, "
        "stream processing, batch processing, data lakes, large-scale "
        "data infrastructure, data transformation, data platforms.",
    "Frontend":
        "UI/UX engineering, web frameworks, mobile development, "
        "component libraries, state management, testing, build tooling.",
    "DevOps_Infra":
        "Cloud platforms, containerisation, infrastructure-as-code, "
        "CI/CD pipelines, observability, networking, security hardening.",
    "Blockchain":
        "Smart contracts, Web3, DeFi, Ethereum, Solidity, consensus mechanisms, decentralized applications.",
    "Cybersecurity":
        "Application security, penetration testing, threat detection, cryptography, network security, IAM, vulnerability assessment.",
    "Mobile":
        "Android, iOS, Flutter, React Native, Swift, Kotlin, mobile app development, cross-platform mobile engineering.",
    "Design":
        "UI design, UX design, wireframing, prototyping, Figma, design systems, user experience research, interaction design.",
}

VALID_CATEGORIES = list(CATEGORY_DESCRIPTIONS.keys())

CATEGORY_CAPS = {
    "backend": 12,
    "frontend": 10,
    "ai_ml": 10,
    "design": 8,
    "devops": 10,
    "mobile": 8,
    "data": 10,
    "cybersecurity": 8,
    "blockchain": 8,
}

# ── Retrieval config ──────────────────────────────────────────────────────────

VECTOR_TOP_K            = 20
MIN_ELIGIBLE_POOL_SIZE  = 10
FALLBACK_CONFIDENCE_FLOOR = 0.3


# ── Compatibility score weights ───────────────────────────────────────────────

COMPATIBILITY_WEIGHTS: dict[str, float] = {
    "skill_match":         0.40,
    "embedding_sim":       0.30,
    "category_confidence": 0.30,
}

# ── Assignment thresholds ─────────────────────────────────────────────────────

MIN_ACCEPTABLE_COMPATIBILITY = 0.40
LOAD_VARIANCE_PERCENT        = 0.10
LOAD_PENALTY_LAMBDA          = 50

