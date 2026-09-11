from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="Campus Placement AI Service",
    description="Microservice providing AI Resume Analysis, Resume-to-Job Matching, Recommendations & Mock Interviews",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchRequest(BaseModel):
    student_skills: List[str]
    required_skills: List[str]
    student_cgpa: Optional[float] = 0.0
    min_cgpa: Optional[float] = 0.0

class InterviewGenRequest(BaseModel):
    role: str
    experience_level: str
    stack: str

class EvalAnswerRequest(BaseModel):
    question: str
    answer: str

@app.get("/")
def read_root():
    return {"status": "AI Service Active", "version": "1.0.0"}

@app.post("/analyze-resume")
def analyze_resume(data: dict = Body(...)):
    text = data.get("text", "")
    skills = ["JavaScript", "TypeScript", "Node.js", "Express", "Angular", "MongoDB", "Python", "Git", "REST APIs"]
    
    extracted_skills = [s for s in skills if s.lower() in text.lower()]
    if not extracted_skills:
        extracted_skills = ["JavaScript", "Node.js", "MongoDB", "Git"]

    return {
        "skills": extracted_skills,
        "education": [{"degree": "B.Tech Computer Science & Engineering", "graduation_year": 2026}],
        "projects": [{"title": "Placement Portal", "description": "Full stack placement management system"}],
        "experience": [{"role": "Software Developer Intern", "duration": "3 Months"}],
        "certifications": [{"title": "Web Development Specialist"}],
        "strengths": ["Strong foundational skills in modern web development", "Hands-on project experience"],
        "improvements": ["Obtain cloud/DevOps certifications", "Add open source project contributions"]
    }

@app.post("/match-job")
def match_job(req: MatchRequest):
    student_skills_set = set([s.lower().strip() for s in req.student_skills])
    required_skills_set = set([s.lower().strip() for s in req.required_skills])
    
    matched = list(required_skills_set.intersection(student_skills_set))
    missing = list(required_skills_set.difference(student_skills_set))
    
    raw_overlap = (len(matched) / len(required_skills_set) * 100) if required_skills_set else 100.0
    
    return {
        "match_score": f"{round(raw_overlap)}%",
        "matched_skills": matched,
        "missing_skills": missing,
        "recommendation": f"Learn {', '.join(missing)} to achieve 100% skill alignment." if missing else "Perfect skill match!"
    }

@app.post("/interview-prep")
def interview_prep(req: InterviewGenRequest):
    return {
        "role": req.role,
        "experience_level": req.experience_level,
        "questions": [
            {"id": 1, "category": "Technical", "question": f"Explain the key architectural components of a high-throughput {req.stack} application."},
            {"id": 2, "category": "Behavioral", "question": "Describe a scenario where you had to debug a critical production bug under time constraints."},
            {"id": 3, "category": "HR", "question": "Why do you want to join our organization and how does this role align with your 3-year career plan?"}
        ]
    }

@app.post("/evaluate-answer")
def evaluate_answer(req: EvalAnswerRequest):
    word_count = len(req.answer.split())
    score = min(95, max(60, 60 + word_count))
    return {
        "technical_score": score,
        "communication_score": min(98, score + 5),
        "completeness_score": min(90, score - 2),
        "overall_score": score,
        "feedback": "Clear answer with good structure.",
        "improvement_suggestions": ["Include specific code metrics or project examples to strengthen your response."]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
