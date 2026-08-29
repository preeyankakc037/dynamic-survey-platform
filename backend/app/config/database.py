import os

from dotenv import load_dotenv
from pymongo import AsyncMongoClient


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "dynamic-survey-platform")


client = AsyncMongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

surveys_collection = db["surveys"]
responses_collection = db["responses"]