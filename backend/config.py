"""
ArogyaSetu - District Healthcare Engine Configuration
SPDX-FileCopyrightText: 2026 Aaryan Patwardhan
"""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Author & System Metadata
PROJECT_NAME = "ArogyaSetu"
PROJECT_VERSION = "1.0.0"
AUTHOR = "Aaryan Patwardhan"
LICENSE = "Apache-2.0"

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# District Configuration - default prototype is Latur
ACTIVE_DISTRICT = os.getenv("ACTIVE_DISTRICT", "latur").strip().lower()

# Supported District Registry
DISTRICT_PROFILES = {
    "latur": {
        "name": "Latur",
        "state": "Maharashtra",
        "center_lat": 18.4088,
        "center_lon": 76.5604,
        "radius_km": 30.0,
        "data_file": "latur_hospitals.json"
    }
}

def get_active_district_config():
    """Retrieve configuration for currently active district."""
    return DISTRICT_PROFILES.get(ACTIVE_DISTRICT, DISTRICT_PROFILES["latur"])
