from mangum import Mangum
from server import app

# Mangum translates AWS Lambda events into FastAPI/ASGI requests
handler = Mangum(app)