import os
import json
import shutil
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
from pathlib import Path

# ==========================================
# 1. LOAD ENVIRONMENT VARIABLES
# ==========================================
# Force Python to look for the .env file in the exact same directory as this script
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# ==========================================
# 2. DATABASE SETUP (MongoDB)
# ==========================================
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")

try:
    mongo_client = MongoClient(MONGO_URI)
    mongo_client.admin.command('ping')
    print("✅ Connected successfully to MongoDB!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

db = mongo_client["studybuddy"]
marks_collection = db["marks"]
documents_collection = db["documents"]
notes_collection = db["notes"]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================================
# 3. FASTAPI & CORS
# ==========================================
app = FastAPI(title="StudyBuddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 4. GEMINI SETUP
# ==========================================
api_key = os.environ.get("GEMINI_API_KEY")
client = None
if not api_key:
    print("⚠️ WARNING: GEMINI_API_KEY environment variable not set in .env!")
else:
    client = genai.Client(api_key=api_key)
    print("✅ Gemini API initialized!")

# ==========================================
# 5. PYDANTIC SCHEMAS (Data Validation)
# ==========================================
class UserRequest(BaseModel):
    weakAreas: List[str]

class MarkCreate(BaseModel):
    student_id: str
    subject: str
    score: float
    total: float

class MarkResponse(MarkCreate):
    id: str
    date_recorded: datetime

class DocumentResponse(BaseModel):
    id: str
    student_id: str
    filename: str
    upload_date: datetime

class ChatRequest(BaseModel):
    prompt: str

class NoteCreate(BaseModel):
    student_id: str
    content: str

# ==========================================
# 6. AI & CHAT ENDPOINTS
# ==========================================
@retry(
    wait=wait_exponential(multiplier=1, min=2, max=20),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(APIError),
    reraise=True 
)
def generate_recommendations_with_backoff(prompt: str):
    if not client:
        raise Exception("Gemini API Client not initialized")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return response.text

@app.post("/api/recommendations")
async def get_recommendations(req: UserRequest):
    if not client:
         raise HTTPException(status_code=500, detail="Server missing Gemini API Key")

    areas = ", ".join(req.weakAreas)
    prompt = f"""
    I am a Class 12 student weak in {areas}. 
    Suggest 3 short resources (Video/Notes) to help me understand this better.
    Return ONLY a JSON array with the exact keys: "title", "type" ("Video" or "Notes"), "source", "desc", "link".
    """
    try:
        raw_json_string = generate_recommendations_with_backoff(prompt)
        return json.loads(raw_json_string)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_ai(req: ChatRequest):
    """Handle chat messages from the frontend and pass them to Gemini"""
    if not client:
         raise HTTPException(status_code=500, detail="Server missing Gemini API Key")
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=req.prompt
        )
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 7. DATABASE ENDPOINTS (Marks, Uploads, Notes)
# ==========================================
@app.post("/api/marks", response_model=MarkResponse)
def add_mark(mark: MarkCreate):
    mark_dict = mark.model_dump()
    mark_dict["date_recorded"] = datetime.utcnow()
    result = marks_collection.insert_one(mark_dict)
    mark_dict["id"] = str(result.inserted_id)
    return mark_dict

@app.get("/api/marks/{student_id}", response_model=List[MarkResponse])
def get_marks(student_id: str):
    marks_cursor = marks_collection.find({"student_id": student_id}).sort("date_recorded", -1)
    return [{"id": str(m.pop("_id")), **m} for m in marks_cursor]

@app.post("/api/upload")
async def upload_document(student_id: str = Form(...), file: UploadFile = File(...)):
    safe_filename = file.filename.replace("/", "_").replace("\\", "_")
    file_location = os.path.join(UPLOAD_DIR, f"{student_id}_{safe_filename}")
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    doc_dict = {
        "student_id": student_id,
        "filename": file.filename,
        "file_path": file_location,
        "upload_date": datetime.utcnow()
    }
    result = documents_collection.insert_one(doc_dict)
    return {"id": str(result.inserted_id), "filename": file.filename, "message": "File uploaded successfully!"}

@app.get("/api/documents/{student_id}", response_model=List[DocumentResponse])
def get_documents(student_id: str):
    docs_cursor = documents_collection.find({"student_id": student_id}).sort("upload_date", -1)
    return [{"id": str(d.pop("_id")), **d} for d in docs_cursor]

@app.post("/api/notes")
def save_notes(note: NoteCreate):
    note_dict = note.model_dump()
    note_dict["last_updated"] = datetime.utcnow()
    # Upsert: Update if exists, otherwise create new
    notes_collection.update_one(
        {"student_id": note.student_id},
        {"$set": note_dict},
        upsert=True
    )
    return {"message": "Notes saved successfully"}

# To run this file, use:
# uvicorn backend:app --reload --port 8000