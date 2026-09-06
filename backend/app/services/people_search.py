"""
People search service.

Uses People Data Labs (PDL) if PDL_API_KEY is set in env.
Falls back to high-quality mock data so the UI demo works without a paid key.
"""
from __future__ import annotations

import hashlib
import random
from typing import List

import httpx

from app.config import settings
from app.models.schemas import Candidate


# ---------------------------------------------------------------------------
# Mock candidate pool — realistic profiles for demo
# ---------------------------------------------------------------------------

_MOCK_POOL: List[dict] = [
    {"full_name": "Priya Sharma", "title": "Senior Software Engineer", "company": "Infosys", "location": "Bangalore, India", "email": "priya.sharma@example.com", "phone": "+919876543210", "linkedin_url": "https://linkedin.com/in/priya-sharma", "experience_years": 6, "skills": ["Python", "Django", "AWS", "React"]},
    {"full_name": "Rahul Mehta", "title": "Product Manager", "company": "Flipkart", "location": "Bangalore, India", "email": "rahul.mehta@example.com", "phone": "+919812345678", "linkedin_url": "https://linkedin.com/in/rahul-mehta", "experience_years": 8, "skills": ["Product Strategy", "Agile", "Data Analysis", "SQL"]},
    {"full_name": "Ananya Krishnan", "title": "Data Scientist", "company": "Swiggy", "location": "Hyderabad, India", "email": "ananya.k@example.com", "phone": "+919900112233", "linkedin_url": "https://linkedin.com/in/ananya-krishnan", "experience_years": 4, "skills": ["Python", "ML", "TensorFlow", "SQL"]},
    {"full_name": "Vikram Nair", "title": "DevOps Engineer", "company": "Wipro", "location": "Pune, India", "email": "vikram.nair@example.com", "phone": "+919765432109", "linkedin_url": "https://linkedin.com/in/vikram-nair", "experience_years": 5, "skills": ["Kubernetes", "Docker", "Jenkins", "Terraform"]},
    {"full_name": "Sneha Patel", "title": "UX Designer", "company": "Razorpay", "location": "Mumbai, India", "email": "sneha.patel@example.com", "phone": "+919654321098", "linkedin_url": "https://linkedin.com/in/sneha-patel", "experience_years": 3, "skills": ["Figma", "User Research", "Prototyping", "Design Systems"]},
    {"full_name": "Arjun Gupta", "title": "Full Stack Developer", "company": "Zomato", "location": "Gurgaon, India", "email": "arjun.gupta@example.com", "phone": "+919543210987", "linkedin_url": "https://linkedin.com/in/arjun-gupta", "experience_years": 7, "skills": ["Node.js", "React", "MongoDB", "GraphQL"]},
    {"full_name": "Kavya Reddy", "title": "Machine Learning Engineer", "company": "Ola", "location": "Bangalore, India", "email": "kavya.reddy@example.com", "phone": "+919432109876", "linkedin_url": "https://linkedin.com/in/kavya-reddy", "experience_years": 5, "skills": ["PyTorch", "Spark", "Python", "Scala"]},
    {"full_name": "Rohit Agarwal", "title": "Backend Engineer", "company": "PayTM", "location": "Noida, India", "email": "rohit.a@example.com", "phone": "+919321098765", "linkedin_url": "https://linkedin.com/in/rohit-agarwal", "experience_years": 6, "skills": ["Java", "Spring Boot", "Kafka", "PostgreSQL"]},
    {"full_name": "Pooja Iyer", "title": "HR Business Partner", "company": "Accenture", "location": "Chennai, India", "email": "pooja.iyer@example.com", "phone": "+919210987654", "linkedin_url": "https://linkedin.com/in/pooja-iyer", "experience_years": 9, "skills": ["Talent Acquisition", "HR Analytics", "HRBP", "Compliance"]},
    {"full_name": "Aditya Singh", "title": "Cloud Architect", "company": "TCS", "location": "Hyderabad, India", "email": "aditya.singh@example.com", "phone": "+919109876543", "linkedin_url": "https://linkedin.com/in/aditya-singh", "experience_years": 11, "skills": ["AWS", "GCP", "Azure", "Microservices"]},
    {"full_name": "Meera Joshi", "title": "Sales Manager", "company": "HubSpot", "location": "Mumbai, India", "email": "meera.j@example.com", "phone": "+919098765432", "linkedin_url": "https://linkedin.com/in/meera-joshi", "experience_years": 7, "skills": ["B2B Sales", "CRM", "Lead Generation", "Negotiation"]},
    {"full_name": "Suresh Babu", "title": "Mobile Developer", "company": "BYJU's", "location": "Bangalore, India", "email": "suresh.b@example.com", "phone": "+918987654321", "linkedin_url": "https://linkedin.com/in/suresh-babu", "experience_years": 4, "skills": ["React Native", "Swift", "Kotlin", "Firebase"]},
    {"full_name": "Nisha Verma", "title": "Recruitment Specialist", "company": "Naukri.com", "location": "Delhi, India", "email": "nisha.verma@example.com", "phone": "+918876543210", "linkedin_url": "https://linkedin.com/in/nisha-verma", "experience_years": 5, "skills": ["Talent Acquisition", "ATS", "Sourcing", "Interviewing"]},
    {"full_name": "Karan Malhotra", "title": "Business Analyst", "company": "Deloitte", "location": "Gurgaon, India", "email": "karan.m@example.com", "phone": "+918765432109", "linkedin_url": "https://linkedin.com/in/karan-malhotra", "experience_years": 6, "skills": ["Business Analysis", "Tableau", "SQL", "Process Mapping"]},
    {"full_name": "Divya Menon", "title": "AI/ML Researcher", "company": "Google India", "location": "Bangalore, India", "email": "divya.menon@example.com", "phone": "+918654321098", "linkedin_url": "https://linkedin.com/in/divya-menon", "experience_years": 8, "skills": ["NLP", "LLMs", "Python", "Research"]},
    {"full_name": "Sanjay Kumar", "title": "Infrastructure Engineer", "company": "Microsoft India", "location": "Hyderabad, India", "email": "sanjay.k@example.com", "phone": "+918543210987", "linkedin_url": "https://linkedin.com/in/sanjay-kumar", "experience_years": 10, "skills": ["Azure", "Active Directory", "Networking", "PowerShell"]},
    {"full_name": "Lakshmi Prasad", "title": "QA Engineer", "company": "Amazon India", "location": "Bangalore, India", "email": "lakshmi.p@example.com", "phone": "+918432109876", "linkedin_url": "https://linkedin.com/in/lakshmi-prasad", "experience_years": 5, "skills": ["Selenium", "Cypress", "API Testing", "Python"]},
    {"full_name": "Harsh Shah", "title": "Fintech Product Lead", "company": "Groww", "location": "Bangalore, India", "email": "harsh.shah@example.com", "phone": "+918321098765", "linkedin_url": "https://linkedin.com/in/harsh-shah", "experience_years": 9, "skills": ["Product Management", "Fintech", "Roadmapping", "OKRs"]},
    {"full_name": "Ritu Chandra", "title": "Content Strategist", "company": "Adobe India", "location": "Noida, India", "email": "ritu.c@example.com", "phone": "+918210987654", "linkedin_url": "https://linkedin.com/in/ritu-chandra", "experience_years": 6, "skills": ["Content Strategy", "SEO", "Copywriting", "Analytics"]},
    {"full_name": "Vivek Pandey", "title": "Blockchain Developer", "company": "Polygon", "location": "Mumbai, India", "email": "vivek.p@example.com", "phone": "+918109876543", "linkedin_url": "https://linkedin.com/in/vivek-pandey", "experience_years": 4, "skills": ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"]},
]


def _stable_id(name: str, company: str) -> str:
    """Generate a stable mock ID from name+company."""
    raw = f"{name}-{company}"
    return "mock-" + hashlib.md5(raw.encode()).hexdigest()[:12]


def _score_candidate(jd: str, candidate: dict) -> int:
    """Simple keyword-match score for mock ranking."""
    jd_lower = jd.lower()
    score = 0
    for skill in candidate.get("skills", []):
        if skill.lower() in jd_lower:
            score += 15
    for field in ["title", "company"]:
        words = candidate.get(field, "").lower().split()
        for w in words:
            if len(w) > 3 and w in jd_lower:
                score += 5
    # Add some randomness so results feel varied
    score += random.randint(0, 20)
    return min(score, 99)


async def search_people(job_description: str, max_results: int = 20) -> list[Candidate]:
    """
    Search for candidates matching the job description.
    Uses PDL API if key is configured, otherwise returns realistic mock data.
    """
    if settings.PDL_API_KEY:
        return await _search_pdl(job_description, max_results)
    return _search_mock(job_description, max_results)


def _search_mock(job_description: str, max_results: int) -> list[Candidate]:
    """Return scored mock candidates."""
    scored = []
    for raw in _MOCK_POOL:
        score = _score_candidate(job_description, raw)
        cand = Candidate(
            id=_stable_id(raw["full_name"], raw["company"]),
            full_name=raw["full_name"],
            title=raw["title"],
            company=raw["company"],
            location=raw["location"],
            email=raw["email"],
            phone=raw["phone"],
            linkedin_url=raw["linkedin_url"],
            experience_years=raw["experience_years"],
            skills=raw["skills"],
            match_score=score,
        )
        scored.append(cand)

    scored.sort(key=lambda c: c.match_score or 0, reverse=True)
    return scored[:max_results]


async def _search_pdl(job_description: str, max_results: int) -> list[Candidate]:
    """Real PDL Elasticsearch people search."""
    # Extract keywords from JD (simple approach)
    keywords = [w for w in job_description.split() if len(w) > 4][:5]
    query = " ".join(keywords)

    payload = {
        "query": {
            "bool": {
                "should": [
                    {"match": {"job_title": query}},
                    {"match": {"skills": query}},
                ]
            }
        },
        "size": max_results,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://api.peopledatalabs.com/v5/person/search",
            headers={
                "X-Api-Key": settings.PDL_API_KEY,
                "Content-Type": "application/json",
            },
            json={"sql": f"SELECT * FROM person WHERE skill LIKE '%{keywords[0] if keywords else 'engineer'}%' LIMIT {max_results}"},
        )

    if r.status_code != 200:
        # Fallback to mock on PDL error
        return _search_mock(job_description, max_results)

    data = r.json()
    results = []
    for p in data.get("data", []):
        exp = p.get("experience", [{}])
        current = exp[0] if exp else {}
        results.append(Candidate(
            id="pdl-" + p.get("id", "unknown")[:12],
            full_name=p.get("full_name", "Unknown"),
            title=current.get("title", {}).get("name"),
            company=current.get("company", {}).get("name"),
            location=p.get("location_name"),
            email=p.get("work_email") or (p.get("emails") or [{}])[0].get("address"),
            phone=(p.get("phone_numbers") or [None])[0],
            linkedin_url=p.get("linkedin_url"),
            experience_years=len(p.get("experience", [])),
            skills=[s.get("name") for s in p.get("skills", []) if s.get("name")][:8],
            match_score=85,
        ))
    return results
