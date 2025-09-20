from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import uvicorn
from datetime import datetime, timedelta
import uuid
import bcrypt
import jwt
import requests
from googletrans import Translator
import asyncio

load_dotenv()

app = FastAPI(title="BengkelBot Pro API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "bengkel_bot")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

security = HTTPBearer()
translator = Translator()

# Pydantic models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    workshop_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    workshop_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    workshop_name: Optional[str] = None
    phone: Optional[str] = None

class Symptom(BaseModel):
    id: str
    name: str
    description: str
    category: str

class DiagnosisRequest(BaseModel):
    symptoms: List[str]
    motorcycle_model: Optional[str] = None
    year: Optional[int] = None
    language: str = "id"

class SparePart(BaseModel):
    name: str
    category: str
    average_price: float
    currency: str = "IDR"
    suppliers: List[Dict[str, Any]] = []

class DiagnosisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symptoms: List[str]
    diagnosis: List[str]
    spare_parts: List[SparePart]
    estimated_cost: float
    confidence_score: float
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced symptoms database with international data
ENHANCED_SYMPTOMS = {
    "weak_acceleration": {
        "id": "weak_acceleration",
        "name": {"id": "Tarikan Lemah", "en": "Weak Acceleration", "es": "Aceleración Débil"},
        "category": "engine",
        "related_parts": ["cvt_roller", "cvt_belt", "clutch_pads", "air_filter"],
        "confidence_factors": ["engine_age", "maintenance_history"]
    },
    "overheating": {
        "id": "overheating", 
        "name": {"id": "Mesin Cepat Panas", "en": "Engine Overheating", "es": "Sobrecalentamiento"},
        "category": "cooling",
        "related_parts": ["radiator", "cooling_fluid", "water_pump", "thermostat"],
        "confidence_factors": ["ambient_temperature", "riding_conditions"]
    },
    "cvt_noise": {
        "id": "cvt_noise",
        "name": {"id": "Suara Berisik dari CVT", "en": "CVT Noise", "es": "Ruido del CVT"},
        "category": "transmission",
        "related_parts": ["cvt_pulley", "cvt_belt", "cvt_housing"],
        "confidence_factors": ["mileage", "maintenance_frequency"]
    },
    "hard_starting": {
        "id": "hard_starting",
        "name": {"id": "Mesin Sulit Hidup", "en": "Hard Starting", "es": "Arranque Difícil"},
        "category": "ignition",
        "related_parts": ["spark_plug", "fuel_injector", "carburetor", "battery"],
        "confidence_factors": ["fuel_quality", "battery_age"]
    },
    "excessive_vibration": {
        "id": "excessive_vibration",
        "name": {"id": "Getaran Berlebih", "en": "Excessive Vibration", "es": "Vibración Excesiva"},
        "category": "suspension",
        "related_parts": ["tire_balance", "suspension", "engine_mount"],
        "confidence_factors": ["tire_condition", "road_conditions"]
    },
    "smoke_emission": {
        "id": "smoke_emission",
        "name": {"id": "Motor Berasap", "en": "Smoke Emission", "es": "Emisión de Humo"},
        "category": "engine",
        "related_parts": ["piston_rings", "cylinder_wall", "valve_seals"],
        "confidence_factors": ["oil_level", "engine_hours"]
    },
    "fuel_consumption": {
        "id": "fuel_consumption",
        "name": {"id": "Konsumsi Bahan Bakar Boros", "en": "High Fuel Consumption", "es": "Alto Consumo de Combustible"},
        "category": "fuel_system",
        "related_parts": ["fuel_injector", "air_filter", "oxygen_sensor"],
        "confidence_factors": ["driving_style", "maintenance_schedule"]
    },
    "electrical_issues": {
        "id": "electrical_issues",
        "name": {"id": "Lampu Mati atau Redup", "en": "Electrical Issues", "es": "Problemas Eléctricos"},
        "category": "electrical",
        "related_parts": ["led_bulb", "wiring", "alternator", "battery"],
        "confidence_factors": ["battery_voltage", "wiring_age"]
    },
    "brake_issues": {
        "id": "brake_issues",
        "name": {"id": "Rem Tidak Pakem", "en": "Brake Issues", "es": "Problemas de Frenos"},
        "category": "braking",
        "related_parts": ["brake_pads", "brake_fluid", "brake_disc"],
        "confidence_factors": ["brake_pad_thickness", "fluid_level"]
    },
    "poor_performance": {
        "id": "poor_performance",
        "name": {"id": "Kinerja Akselerasi Menurun", "en": "Poor Performance", "es": "Rendimiento Deficiente"},
        "category": "engine",
        "related_parts": ["cvt_clutch", "cvt_belt", "exhaust_system"],
        "confidence_factors": ["engine_compression", "exhaust_condition"]
    },
    "strange_noises": {
        "id": "strange_noises",
        "name": {"id": "Bunyi Decit atau Gredek", "en": "Strange Noises", "es": "Ruidos Extraños"},
        "category": "mechanical",
        "related_parts": ["clutch_housing", "cvt_pulley", "bearing"],
        "confidence_factors": ["lubrication_level", "component_wear"]
    }
}

# Global spare parts pricing (mock data - in real implementation would use APIs)
GLOBAL_SPARE_PARTS = {
    "cvt_roller": {
        "name": "CVT Roller",
        "category": "transmission",
        "prices": {
            "IDR": {"min": 450000, "max": 550000, "average": 500000},
            "USD": {"min": 30, "max": 37, "average": 33},
            "EUR": {"min": 28, "max": 34, "average": 31}
        },
        "suppliers": ["Yamaha", "Honda", "Suzuki", "Aftermarket"]
    },
    "cvt_belt": {
        "name": "CVT Belt", 
        "category": "transmission",
        "prices": {
            "IDR": {"min": 550000, "max": 650000, "average": 600000},
            "USD": {"min": 37, "max": 43, "average": 40},
            "EUR": {"min": 34, "max": 40, "average": 37}
        },
        "suppliers": ["Yamaha", "Honda", "Kawasaki", "Gates"]
    },
    "spark_plug": {
        "name": "Spark Plug",
        "category": "ignition", 
        "prices": {
            "IDR": {"min": 120000, "max": 180000, "average": 150000},
            "USD": {"min": 8, "max": 12, "average": 10},
            "EUR": {"min": 7, "max": 11, "average": 9}
        },
        "suppliers": ["NGK", "Denso", "Bosch", "Iridium"]
    },
    "brake_pads": {
        "name": "Brake Pads",
        "category": "braking",
        "prices": {
            "IDR": {"min": 350000, "max": 450000, "average": 400000},
            "USD": {"min": 23, "max": 30, "average": 27},
            "EUR": {"min": 21, "max": 28, "average": 25}
        },
        "suppliers": ["Brembo", "EBC", "Ferodo", "TRW"]
    }
}

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def translate_text(text: str, target_language: str) -> str:
    try:
        if target_language == 'id':
            return text
        translated = translator.translate(text, dest=target_language)
        return translated.text
    except:
        return text

# AI-powered diagnosis engine
def calculate_diagnosis_confidence(symptoms: List[str], part_condition: Dict) -> float:
    base_confidence = len(symptoms) * 0.15
    condition_modifier = part_condition.get('wear_level', 0.5)
    return min(base_confidence + condition_modifier, 1.0)

def get_ai_recommendations(symptoms: List[str], spare_parts: List[str]) -> List[str]:
    recommendations = []
    
    if "cvt_roller" in spare_parts and "cvt_belt" in spare_parts:
        recommendations.append("Replace CVT components as a complete set for optimal performance")
    
    if "overheating" in symptoms:
        recommendations.append("Check cooling system immediately to prevent engine damage")
    
    if len(symptoms) > 3:
        recommendations.append("Comprehensive inspection recommended due to multiple symptoms")
    
    recommendations.append("Schedule regular maintenance to prevent future issues")
    return recommendations

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        name=user.name,
        workshop_name=user.workshop_name,
        phone=user.phone
    )
    
    user_dict = new_user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.id})
    
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_data = User(**user)
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@app.get("/api/symptoms")
async def get_symptoms(language: str = "id"):
    symptoms = []
    for symptom_id, symptom_data in ENHANCED_SYMPTOMS.items():
        translated_name = symptom_data["name"].get(language, symptom_data["name"]["id"])
        symptoms.append({
            "id": symptom_id,
            "name": translated_name,
            "category": symptom_data["category"]
        })
    return symptoms

@app.post("/api/diagnosis")
async def create_diagnosis(
    request: DiagnosisRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Enhanced diagnosis logic
        diagnosis_results = []
        recommended_parts = []
        total_cost = 0
        
        for symptom_id in request.symptoms:
            if symptom_id in ENHANCED_SYMPTOMS:
                symptom_data = ENHANCED_SYMPTOMS[symptom_id]
                
                # Generate diagnosis based on symptom
                symptom_name = symptom_data["name"].get(request.language, symptom_data["name"]["id"])
                
                if symptom_id == "weak_acceleration":
                    diagnosis_results.append(f"Possible CVT system issues affecting {symptom_name}")
                    recommended_parts.extend(["cvt_roller", "cvt_belt"])
                elif symptom_id == "overheating":
                    diagnosis_results.append(f"Cooling system malfunction causing {symptom_name}")
                    recommended_parts.extend(["radiator", "cooling_fluid"])
                elif symptom_id == "hard_starting":
                    diagnosis_results.append(f"Ignition system problems leading to {symptom_name}")
                    recommended_parts.extend(["spark_plug"])
                elif symptom_id == "brake_issues":
                    diagnosis_results.append(f"Brake system requires attention for {symptom_name}")
                    recommended_parts.extend(["brake_pads"])
        
        # Calculate costs and create spare parts list
        spare_parts = []
        unique_parts = list(set(recommended_parts))
        
        for part_id in unique_parts:
            if part_id in GLOBAL_SPARE_PARTS:
                part_data = GLOBAL_SPARE_PARTS[part_id]
                price_data = part_data["prices"]["IDR"]  # Default to IDR
                
                # Convert supplier strings to dictionaries
                suppliers_dict = [{"name": supplier} for supplier in part_data["suppliers"]]
                
                spare_part = SparePart(
                    name=part_data["name"],
                    category=part_data["category"],
                    average_price=price_data["average"],
                    currency="IDR",
                    suppliers=suppliers_dict
                )
                spare_parts.append(spare_part)
                total_cost += price_data["average"]
        
        # Calculate confidence score
        confidence_score = calculate_diagnosis_confidence(request.symptoms, {"wear_level": 0.7})
        
        # Get AI recommendations
        recommendations = get_ai_recommendations(request.symptoms, unique_parts)
        
        # Translate results if needed
        if request.language != "id":
            diagnosis_results = [translate_text(result, request.language) for result in diagnosis_results]
            recommendations = [translate_text(rec, request.language) for rec in recommendations]
        
        # Save diagnosis to database
        diagnosis = DiagnosisResult(
            user_id=current_user["id"],
            symptoms=request.symptoms,
            diagnosis=diagnosis_results,
            spare_parts=spare_parts,
            estimated_cost=total_cost,
            confidence_score=confidence_score,
            recommendations=recommendations
        )
        
        await db.diagnoses.insert_one(diagnosis.dict())
        
        return diagnosis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")

@app.get("/api/diagnosis/history")
async def get_diagnosis_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    cursor = db.diagnoses.find({"user_id": current_user["id"]}).sort("created_at", -1).skip(skip).limit(limit)
    diagnoses = await cursor.to_list(length=limit)
    return diagnoses

@app.get("/api/spare-parts/search")
async def search_spare_parts(query: str, currency: str = "IDR"):
    results = []
    for part_id, part_data in GLOBAL_SPARE_PARTS.items():
        if query.lower() in part_data["name"].lower():
            price_data = part_data["prices"].get(currency, part_data["prices"]["IDR"])
            results.append({
                "id": part_id,
                "name": part_data["name"],
                "category": part_data["category"],
                "price_range": price_data,
                "suppliers": part_data["suppliers"]
            })
    return results

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

@app.put("/api/user/profile")
async def update_user_profile(
    name: Optional[str] = None,
    workshop_name: Optional[str] = None,
    phone: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if name:
        update_data["name"] = name
    if workshop_name:
        update_data["workshop_name"] = workshop_name
    if phone:
        update_data["phone"] = phone
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
        updated_user = await db.users.find_one({"id": current_user["id"]})
        return User(**updated_user)
    
    return User(**current_user)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)