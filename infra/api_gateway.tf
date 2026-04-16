resource "aws_apigatewayv2_api" "main" {
  name          = "resume-coach-api"
  protocol_type = "HTTP"

  # --- CRITICAL: This allows the browser to pass the security check ---
  cors_configuration {
    allow_origins = ["https://d8bh9r3rlkcvv.cloudfront.net", "http://localhost:3000"]
    allow_methods = ["POST", "GET", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "dev" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "dev"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.resume_coach.invoke_arn
  
  payload_format_version = "2.0" 
}

resource "aws_apigatewayv2_route" "post_analyze" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/analyze"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "get_health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}