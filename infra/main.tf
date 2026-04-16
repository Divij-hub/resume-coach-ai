terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. Define the missing local variables
locals {
  name_prefix = "resume-coach-ai-default"
}

# 2. Declare the data sources to fetch account and region info
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}