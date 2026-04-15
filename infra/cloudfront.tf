resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Origin 1: S3 (Frontend)
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3Origin"
  }

  # Origin 2: API Gateway (Backend)
  origin {
    domain_name = "${aws_apigatewayv2_api.main.id}.execute-api.us-east-1.amazonaws.com"
    origin_id   = "APIGatewayOrigin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default Behavior (Frontend)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  # API Behavior (Backend)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["GET", "POST", "OPTIONS", "HEAD", "PUT", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "APIGatewayOrigin"
    viewer_protocol_policy = "https-only"
    forwarded_values {
      query_string = true
      cookies { forward = "all" }
    }
  }
restrictions {
    geo_restriction {
      restriction_type = "none"
      # You can add locations = [] if you want to be extra formal, 
      # but "none" usually doesn't require it.
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}