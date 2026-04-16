import os
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from openai import OpenAI
import re

app = FastAPI()
clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)

class InputRecord(BaseModel):
    cve_id: str
    base_score: float = Field(..., ge=0, le=10)
    affected_system: str
    report_date: str
    technical_text: str = Field(..., min_length=50)

    @validator('cve_id')
    def validate_cve(cls, v):
        if not re.match(r"CVE-\d{4}-\d+", v):
            raise ValueError("Invalid CVE format")
        return v

SYSTEM_PROMPT = "You are a Cybersecurity Analyst. Provide: ## Executive Risk Summary, ## Technical Remediation Plan, and ## Internal Security Advisory."

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0"}

@app.post("/api/analyze")
def process(record: InputRecord, creds: HTTPAuthorizationCredentials = Depends(clerk_guard)):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    user_prompt = f"Analyze {record.cve_id} on {record.affected_system}. Data: {record.technical_text}"
    
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        stream=True
    )

    def event_stream():
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {chunk.choices[0].delta.content}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")