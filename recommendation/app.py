from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn

app = FastAPI()

# ----------- 📘 SCHEMAS -----------

class Job(BaseModel):
    title: str
    description: str
    skills: str

class Freelance(BaseModel):
    id: int
    title: str
    skills: str
    bio: str

class RecoRequest(BaseModel):
    job: Job
    freelances: List[Freelance]

# ----------- 🧠 NLP CORE -----------

def compute_similarity(job: Job, freelances: List[Freelance]):
    corpus = []

    # 1. Texte combiné du job
    job_text = f"{job.title} {job.description} {job.skills}"
    corpus.append(job_text)

    # 2. Texte combiné pour chaque freelance
    freelance_texts = []
    for f in freelances:
        text = f"{f.title} {f.skills} {f.bio}"
        corpus.append(text)
        freelance_texts.append((f.id, text))

    # 3. TF-IDF + Cosine
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(corpus)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # 4. Résultats triés
    results = [
        {"freelance_id": fid, "score": round(score, 4)}
        for (fid, _), score in zip(freelance_texts, similarities)
    ]
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

# ----------- 🚀 ROUTE -----------

@app.post("/recommend")
def recommend(data: RecoRequest):
    result = compute_similarity(data.job, data.freelances)
    return {"recommended_freelancers": result}

# ----------- 🖥️ LANCEMENT LOCAL -----------

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
