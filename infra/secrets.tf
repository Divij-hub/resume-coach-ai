resource "aws_secretsmanager_secret" "config" {
  name = "resume-coach/config-dev"
}

resource "aws_secretsmanager_secret_version" "config_version" {
  secret_id     = aws_secretsmanager_secret.config.id
  secret_string = jsonencode({
    CLERK_JWKS_URL = "your_clerk_jwks_url_here"
  })
}