import json
import boto3
import os
import base64
import uuid
from datetime import datetime

# Initialize clients
bedrock = boto3.client(service_name="bedrock-runtime", region_name="us-east-1")
dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
# MATCH THE NAME EXACTLY FROM YOUR SCREENSHOT
TABLE_NAME = 'resume-coach-ai-default-vulnerability-logs'
table = dynamodb.Table(TABLE_NAME)

def handler(event, context):
    # 1. Handle Health Check
    path = event.get('rawPath') or event.get('path')
    if path == '/health':
        return {"statusCode": 200, "body": json.dumps({"status": "healthy"})}

    try:
        # 2. Extract Data
        body_str = event.get('body', '{}')
        if event.get('isBase64Encoded', False):
            body_str = base64.b64decode(body_str).decode('utf-8')
        
        body = json.loads(body_str)
        resume_text = body.get('resumeText', 'No resume text provided')

        # 3. Call AI (Nova Lite)
        model_id = os.environ.get('BEDROCK_MODEL_ID', 'us.amazon.nova-lite-v1:0')
        prompt = f"Critique this resume professionally:\n\n{resume_text}"
        
        native_request = {
            "messages": [{"role": "user", "content": [{"text": prompt}]}]
        }

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(native_request)
        )

        model_response = json.loads(response["body"].read())
        ai_critique = model_response["output"]["message"]["content"][0]["text"]

        # 4. SAFE SAVE TO DYNAMODB
        # We put this in a nested try/except so if DB fails, AI still shows!
        try:
            table.put_item(
                Item={
                    'session_id': str(uuid.uuid4()), # Must match partition key in Console
                    'timestamp': datetime.now().isoformat(),
                    'critique': ai_critique[:2000], # Truncate if too long
                    'status': 'COMPLETED'
                }
            )
        except Exception as db_err:
            print(f"Database Error: {str(db_err)}")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"analysis": ai_critique})
        }

    except Exception as e:
        print(f"General Error: {str(e)}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}