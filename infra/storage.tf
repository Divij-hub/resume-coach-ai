resource "aws_dynamodb_table" "conversations" {
  name         = "${local.name_prefix}-vulnerability-logs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "session_id" # We use CVE_ID as session_id for this domain

  attribute {
    name = "session_id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = { Project = var.project_name }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name_prefix}-frontend-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document { suffix = "index.html" }
}