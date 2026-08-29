import os
import urllib.parse

from dotenv import load_dotenv
from pymongo import AsyncMongoClient
from pymongo.server_api import ServerApi


load_dotenv()

DB_USERNAME = urllib.parse.quote_plus(os.getenv("DB_USERNAME", ""))
DB_PASSWORD = urllib.parse.quote_plus(os.getenv("DB_PASSWORD", ""))
DATABASE_NAME = os.getenv("DATABASE_NAME", "dynamic-survey-platform")

MONGODB_URI = f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@cluster0.ifsjzlu.mongodb.net/?appName=Cluster0"

# Create a new client and connect to the server using the async driver
client = AsyncMongoClient(MONGODB_URI, server_api=ServerApi('1'))

db = client[DATABASE_NAME]

surveys_collection = db["surveys"]
responses_collection = db["responses"]