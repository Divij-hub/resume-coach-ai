import os
import json
import boto3
from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials
from botocore.exceptions import ClientError

# Internal module imports
from dynamo_memory import load_conversation, save_conversation
from secrets import get_secret

app = FastAPI()

# --- Configuration & Secrets ---
USE_DYNAMODB = os.getenv("USE_DYNAMODB", "false").lower() == "true"
SECRET_NAME = os.getenv("SECRET_NAME", "resume-coach/config-dev")

# Initialize Bedrock Client [cite: 199]
bedrock = boto3.client(
    service_name="bedrock-runtime", 
    region_name=os.getenv("BEDROCK_REGION", "us-east-1")
)

# --- Updated CORS Configuration ---
# We explicitly allow your CloudFront domain and localhost for development
origins = [
    "http://localhost:3000",
    "https://d8bh9r3rlkcvv.cloudfront.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all (Authorization, Content-Type, etc.)
)

# --- Updated Data Model ---
class ResumeInput(BaseModel):
    # Lowered min_length to 10 for easier testing
    resume_text: str = Field(..., min_length=10) 
    job_description: str = Field(..., min_length=10)
    target_role: str = Field(default="Professional Role")
    years_experience: int = Field(default=0, ge=0)
    session_id: str = Field(default_factory=lambda: "default-session")
# --- System Prompt [cite: 37-53] ---
SYSTEM_PROMPT = """
You are a Professional Resume Coach and Executive Recruiter. [cite: 37]
Provide your analysis using exactly these three headings: [cite: 39]

## Strengths & Alignment Analysis
Map the candidate's experience to the job description requirements. [cite: 41]

## Critical Gap Analysis
Identify 3 missing keywords or skills that might trigger ATS filters. [cite: 45, 46]

## Tailored Cover Letter
Write a 3-paragraph cover letter using achievement-based language. [cite: 48-51]

Constraint: Use the STAR method (Situation, Task, Action, Result) for all suggestions. [cite: 52]
"""

def user_prompt_for(record: ResumeInput) -> str:
    """Formats the user data for the Bedrock Converse API[cite: 118]."""
    return (
        f"TARGET ROLE: {record.target_role}\n"
        f"YEARS OF EXPERIENCE: {record.years_experience}\n\n"
        f"RESUME CONTENT:\n{record.resume_text}\n\n"
        f"JOB DESCRIPTION:\n{record.job_description}"
    )

# --- Endpoints ---

@app.get("/health")
def health_check():
    """Required for AWS Lambda Health Verification [cite: 215]"""
    return {"status": "healthy", "version": "2.0-resume-coach"}

@app.post("/api/analyze")
async def process(
    record: ResumeInput,
    creds: HTTPAuthorizationCredentials = Depends(ClerkHTTPBearer(ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))))
):
    model_id = os.getenv("BEDROCK_MODEL_ID", "us.amazon.nova-lite-v1:0") [cite: 219]
    
    try:
        # 1. Load History [cite: 220]
        conversation = load_conversation(record.session_id) if USE_DYNAMODB else []
        
        # 2. Build Message [cite: 221]
        user_message = {"role": "user", "content": [{"text": user_prompt_for(record)}]}
        
        # 3. Call Bedrock Converse API [cite: 222]
        response = bedrock.converse(
            modelId=model_id,
            system=[{"text": SYSTEM_PROMPT}],
            messages=conversation + [user_message]
        )
        
        analysis = response["output"]["message"]["content"][0]["text"] [cite: 227]
        
        # 4. Save to DynamoDB [cite: 231]
        if USE_DYNAMODB:
            conversation.append(user_message)
            conversation.append({"role": "assistant", "content": [{"text": analysis}]})
            save_conversation(record.session_id, conversation)
            
        return JSONResponse({"analysis": analysis, "session_id": record.session_id})

    except ClientError as e:
        return JSONResponse({"error": str(e)}, status_code=500)