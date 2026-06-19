import argparse
import asyncio
import json
from pathlib import Path

from participant_ai.pipelines.resume_rag.parser import parse_resume_async
from participant_ai.pipelines.resume_rag.skill_scoring import compute_skill_vector

async def analyze_file(file_path: Path):
    if not file_path.exists():
        print(f"Error: File '{file_path}' not found.")
        return

    text = ""
    if file_path.suffix.lower() == ".pdf":
        try:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except ImportError:
            print("Error: PyPDF2 is required to read PDF files. Install it with: pip install PyPDF2")
            return
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return
    else:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading text file: {e}")
            return
    
    if not text.strip():
        print("Error: Extracted text is empty.")
        return
        
    print(f"Analyzing {file_path.name}...\n")
    
    parsed = await parse_resume_async(text)
    print("=== Parsed Resume Data ===")
    print(f"Name:               {parsed.name}")
    print(f"College:            {parsed.college_name}")
    print(f"GitHub:             {parsed.github_url}")
    print(f"Skills Extracted:   {', '.join(parsed.raw_skills)}")
    print(f"Experience Summary: {parsed.experience_summary}\n")
    
    print("=== Skill Dimensions (Vector) ===")
    vector, breakdown = await compute_skill_vector(text, parsed.projects)
    
    print("Dimensions (0.0 to 1.0):")
    for cat, val in vector.to_dict().items():
        # Using simple bar chart formatting
        bar_len = int(val * 20)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        b = breakdown.get(cat, {})
        b_str = f"[kw={b.get('keyword', 0):.2f} prj={b.get('project', 0):.2f} llm={b.get('llm', 0):.2f}]"
        print(f"  {cat.ljust(15)}: {val:.2f}  {b_str.ljust(30)} [{bar}]")
        
    print(f"\nDominant Skills: {', '.join(vector.dominant(top_n=3))}")

def main():
    parser = argparse.ArgumentParser(description="Analyze a resume and generate skill dimensions.")
    parser.add_argument("file", type=str, help="Path to the resume file (.txt or .pdf)")
    args = parser.parse_args()
    
    asyncio.run(analyze_file(Path(args.file)))

if __name__ == "__main__":
    main()
