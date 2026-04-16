import os
import boto3
import re
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from fastapi.middleware.cors import CORSMiddleware
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://d8bh9r3rlkcvv.cloudfront.net", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Bedrock
bedrock = boto3.client(
    service_name="bedrock-runtime", 
    region_name=os.getenv("BEDROCK_REGION", "us-east-1")
)

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

SYSTEM_PROMPT = "You are a Cybersecurity Analyst. Provide: ## Executive Risk Summary, ## Technical Remediation Plan, and ## Internal Security Advisory. Use the STAR method for remediation steps."

@app.post("/api")
async def process(
    record: InputRecord, 
    creds: HTTPAuthorizationCredentials = Depends(ClerkHTTPBearer(ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))))
):
    model_id = os.getenv("BEDROCK_MODEL_ID", "global.amazon.nova-lite-v1:0") [cite: 6, 9]
    user_prompt = f"Analyze {record.cve_id} (Score: {record.base_score}) on {record.affected_system}. Data: {record.technical_text}"
    
    try:
        response = bedrock.converse(
            modelId=model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=[{"role": "user", "content": [{"text": user_prompt}]}]
        )
        analysis = response["output"]["message"]["content"][0]["text"]
        return JSONResponse({"analysis": analysis})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)