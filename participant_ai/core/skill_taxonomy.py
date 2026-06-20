SKILL_TAXONOMY: dict[str, dict] = {
    "backend": {
        "weight": 1.0,
        "keywords": [
            "django", "fastapi", "flask", "node.js", "express", "spring", "spring boot",
            "rest api", "graphql", "microservices", "postgresql", "mongodb",
            "redis", "java", "golang", "ruby on rails", "c#", ".net", "php", "laravel",
            "grpc", "kafka", "rabbitmq"
        ],
    },
    "frontend": {
        "weight": 1.0,
        "keywords": [
            "react", "vue", "angular", "next.js", "html", "css", "tailwind",
            "javascript", "typescript", "redux", "webpack", "svelte", "bootstrap",
            "sass", "less", "material-ui", "mui", "vite", "gatsby", "webassembly"
        ],
    },
    "ai_ml": {
        "weight": 1.0,
        "keywords": [
            "pytorch", "tensorflow", "scikit-learn", "keras", "llm", "nlp",
            "computer vision", "huggingface", "transformer", "neural network",
            "deep learning", "machine learning", "opencv", "nltk", "spacy", "langchain",
            "xgboost", "generative ai", "openai", "stable diffusion"
        ],
    },
    "design": {
        "weight": 1.0,
        "keywords": [
            "figma", "sketch", "adobe xd", "ui/ux", "wireframe", "prototyping",
            "user research", "design system", "illustrator", "photoshop",
            "interaction design", "mockup", "invision", "user journey", "usability testing"
        ],
    },
    "cloud": {
        "weight": 1.0,
        "keywords": [
            "aws", "gcp", "azure", "cloud computing", "serverless", "lambda",
            "ec2", "s3", "google cloud", "firebase", "supabase", "cloudflare"
        ],
    },
    "security": {
        "weight": 1.0,
        "keywords": [
            "penetration testing", "pentesting", "wireshark", "cryptography",
            "network security", "owasp", "metasploit", "nmap", "iam",
            "vulnerability assessment", "firewall", "kali linux", "soc", "siem",
            "malware analysis", "endpoint security", "cybersecurity"
        ]
    },
    "mobile": {
        "weight": 1.0,
        "keywords": [
            "kotlin", "swift", "flutter", "react native", "android studio",
            "xcode", "jetpack compose", "swiftui", "objective-c", "dart",
            "ios", "android", "capacitor", "ionic", "mobile app"
        ],
    },
    "data_engineering": {
        "weight": 1.0,
        "keywords": [
            "pandas", "numpy", "sql", "etl", "spark", "airflow", "data warehouse", 
            "dbt", "snowflake", "bigquery", "redshift", "hadoop", "pyspark", 
            "data engineering", "kafka", "data pipeline"
        ],
    },
    "devops": {
        "weight": 1.0,
        "keywords": [
            "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "terraform", 
            "ansible", "github actions", "linux", "nginx", "prometheus",
            "grafana", "bash", "shell scripting", "gitlab ci", "argocd", "cloudformation"
        ],
    },
    "product": {
        "weight": 1.0,
        "keywords": [
            "product management", "agile", "scrum", "jira", "roadmap", 
            "user stories", "market research", "growth hacking", "kpi", 
            "business strategy", "go-to-market", "analytics"
        ]
    }
}

def category_names() -> list[str]:
    """Single source of truth for valid category keys — used to validate/clip
    everything downstream (resume vectors, PS requirement vectors, idea vectors)."""
    return list(SKILL_TAXONOMY.keys())
