variable "aws_region"       { default = "us-east-1" }
variable "project_name"     { default = "cyberguard" }
variable "bedrock_model_id" { default = "global.amazon.nova-lite-v1:0" }
variable "lambda_timeout"   { default = 30 }
variable "clerk_jwks_url"   { }