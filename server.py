import os, boto3, json
from fastapi import FastAPI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
# Keep your custom imports
from dynamo_memory import load_conversation, save_conversation
from secrets import get_secret

app = FastAPI()

# --- Configuration ---
USE_DYNAMODB = os.getenv("USE_DYNAMODB", "false").lower() == "true"
SECRET_NAME = os.getenv("SECRET_NAME", "resume-coach/config-dev")

# --- CORS Logic ---
if USE_DYNAMODB:
    try:
        config = get_secret(SECRET_NAME)
        origins = config.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    except Exception:
        origins = ["*"]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Data Models ---
class ResumeInput(BaseModel):
    resume_text: str = Field(..., min_length=100)
    job_description: str = Field(..., min_length=50)

# --- Resume Coach Prompt ---
SYSTEM_PROMPT = """
You are a Professional Resume Coach and Executive Recruiter. 
Analyze the provided resume against the job description and provide:

## Resume Score & Critique
Rate the match out of 10. Identify 3 critical gaps where the resume fails to meet the job requirements.

## STAR-Method Bullet Points
Rewrite 3-5 existing bullet points from the resume to be more impact-oriented using the STAR (Situation, Task, Action, Result) method.

## Tailored Cover Letter
Provide a concise, 3-paragraph cover letter that bridges the candidate's specific experience to the job's needs.
"""

# --- Endpoints ---

@app.get("/health")
def health_check():
    """Required for AWS Lambda Health Check Verification"""
    return {"status": "healthy", "version": "2.0-resume-coach"}

@app.post("/analyze")
async def process_resume(record: ResumeInput):
    # Initialize Bedrock Client
    bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")
    
    user_message = f"""
    RESUME TEXT:
    {record.resume_text}

    JOB DESCRIPTION:
    {record.job_description}
    """
    
    # Bedrock Converse API Call (Using Nova Lite as required)
    response = bedrock.converse(
        modelId="global.amazon.nova-lite-v1:0",
        messages=[{"role": "user", "content": [{"text": user_message}]}],
        system=[{"text": SYSTEM_PROMPT}]
    )
    
    ai_response = response["output"]["message"]["content"][0]["text"]
    
    # Save to DynamoDB if enabled (using job_description hash or similar as key)
    if USE_DYNAMODB:
        save_conversation("resume-analysis", [{"role": "assistant", "content": ai_response}])
        
    return {"analysis": ai_response}