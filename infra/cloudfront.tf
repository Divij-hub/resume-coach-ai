resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "resume-coach-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Origin 1: S3 (Frontend)
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  # Origin 2: API Gateway (Backend)
  origin {
    domain_name = "${aws_apigatewayv2_api.main.id}.execute-api.us-east-1.amazonaws.com"
    origin_id   = "APIGatewayOrigin"
    origin_path = "/dev" # <--- CRITICAL: This maps /api/* to /dev/api/*

    custom_error_response {
      error_code            = 403
      response_code         = 200
      response_page_path    = "/index.html"
    }

    custom_error_response {
      error_code            = 404
      response_code         = 200
      response_page_path    = "/index.html"
    }
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  # Health Check Behavior (Add this above /api/*)
  ordered_cache_behavior {
    path_pattern     = "/health"
    target_origin_id = "APIGatewayOrigin"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    viewer_protocol_policy = "https-only"

    forwarded_values {
      query_string = false
      headers      = []
      cookies { forward = "none" }
    }
  }

  # API Behavior (MUST COME BEFORE DEFAULT)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "APIGatewayOrigin"
    allowed_methods  = ["GET", "POST", "OPTIONS", "HEAD", "PUT", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    viewer_protocol_policy = "https-only"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"] # <--- REQUIRED for Clerk & JSON
      cookies { forward = "all" }
    }
  }

  # Default Behavior (Frontend)
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}