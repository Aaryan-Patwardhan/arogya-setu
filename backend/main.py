"""
ArogyaSetu - Core FastAPI Backend Server
SPDX-FileCopyrightText: 2026 Aaryan Patwardhan
"""

from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from config import (
    PROJECT_NAME,
    PROJECT_VERSION,
    AUTHOR,
    LICENSE,
    ACTIVE_DISTRICT,
    get_active_district_config
)
from triage import process_medical_query
from geo import find_nearest_hospitals, load_hospitals

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="Multilingual Voice-First Health & Hospital Locator for District Healthcare"
)

# Configure CORS for local development and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Patient's health query or symptoms")
    language: str = Field(default="en", description="Target language ('en', 'hi', or 'mr')")
    lat: Optional[float] = Field(default=None, description="User latitude (optional)")
    lon: Optional[float] = Field(default=None, description="User longitude (optional)")

@app.on_event("startup")
async def startup_event():
    dist = get_active_district_config()
    print("=" * 60)
    print(f"🚀 {PROJECT_NAME} v{PROJECT_VERSION} Initialized")
    print(f"📍 Active District: {dist['name']}, {dist['state']}")
    print(f"👨‍💻 Maintained by: {AUTHOR}")
    print("=" * 60)

@app.get("/api/health")
async def health_check():
    """Healthcheck and system metadata endpoint."""
    dist = get_active_district_config()
    return {
        "status": "healthy",
        "service": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "district": dist["name"],
        "state": dist["state"],
        "author": AUTHOR,
        "license": LICENSE
    }

@app.get("/api/hospitals")
async def get_hospitals(
    specialty: Optional[str] = Query(default=None, description="Filter by clinical specialty"),
    district: Optional[str] = Query(default=None, description="District identifier")
):
    """Retrieve all available hospitals with optional specialty filtering."""
    hospitals = load_hospitals(district_key=district)
    if specialty:
        req = specialty.strip().lower()
        hospitals = [
            h for h in hospitals 
            if any(req in t.lower() or t.lower() in req for t in h.get("available_treatments", []))
        ]
    return {
        "district": get_active_district_config()["name"],
        "total": len(hospitals),
        "hospitals": hospitals
    }

@app.post("/api/chat")
async def chat_triage(req: ChatRequest):
    """
    Main triage endpoint:
    - Runs safety regex and Gemini Flash triage
    - Finds and ranks nearest specialized hospitals using Haversine calculation
    - Returns structured advice, localized text, and geo-matched facilities
    """
    try:
        # Step 1: Medical Triage Analysis
        triage_result = await process_medical_query(
            user_query=req.message,
            language=req.language
        )

        # Step 2: Geo-location and Hospital Matching
        specialty = triage_result.get("specialty_needed")
        hospital_match = find_nearest_hospitals(
            user_lat=req.lat,
            user_lon=req.lon,
            required_specialty=specialty,
            limit=3
        )

        return {
            "success": True,
            "triage": triage_result,
            "geo": {
                "district": hospital_match["district"],
                "is_fallback_location": hospital_match["is_fallback_location"],
                "effective_coordinates": hospital_match["effective_coordinates"],
                "hospitals": hospital_match["hospitals"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Triage Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
