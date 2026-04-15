resource "aws_iam_role" "lambda_exec" {
  name = "${local.name_prefix}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "dynamodb" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "bedrock" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
}
resource "aws_lambda_function" "resume_coach" {
  filename         = "lambda.zip"
  source_code_hash = filebase64sha256("lambda.zip")
  function_name    = "${local.name_prefix}-api"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "lambda_handler.handler"
  runtime          = "python3.12"
  timeout          = var.lambda_timeout

  environment {
    variables = {
      USE_DYNAMODB     = "true"
      DYNAMODB_TABLE   = aws_dynamodb_table.conversations.name
      BEDROCK_REGION   = var.aws_region
      BEDROCK_MODEL_ID = "us.amazon.nova-lite-v1:0"  # <--- Add quotes here!
      CLERK_JWKS_URL   = var.clerk_jwks_url
      SECRET_NAME      = "${var.project_name}/config-${terraform.workspace}"
    }
  }
}
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resume_coach.function_name
  principal     = "apigateway.amazonaws.com"

  # This connects the permission to your specific API Gateway
  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}