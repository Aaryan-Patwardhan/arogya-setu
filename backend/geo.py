"""
ArogyaSetu - Geo & Haversine Distance Hospital Matcher
SPDX-FileCopyrightText: 2026 Aaryan Patwardhan
"""

import json
import math
from typing import List, Dict, Any, Optional
from config import BASE_DIR, get_active_district_config

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_KM * c

def load_hospitals(district_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load hospitals dataset for the given or active district."""
    dist_config = get_active_district_config()
    filename = dist_config.get("data_file", "latur_hospitals.json")
    file_path = BASE_DIR / filename
    
    if not file_path.exists():
        # Fallback to default latur_hospitals.json if custom district file doesn't exist
        file_path = BASE_DIR / "latur_hospitals.json"
        
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def is_within_district(lat: float, lon: float, center_lat: float, center_lon: float, max_radius_km: float = 60.0) -> bool:
    """Check if given coordinates are within reasonable proximity to the district center."""
    dist = haversine_distance(lat, lon, center_lat, center_lon)
    return dist <= max_radius_km

def find_nearest_hospitals(
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    required_specialty: Optional[str] = None,
    limit: int = 3
) -> Dict[str, Any]:
    """
    Find and rank nearest hospitals based on geolocation and clinical specialty.
    Falls back to District City Center if coordinates are missing or out-of-bounds.
    """
    dist_config = get_active_district_config()
    default_lat = dist_config["center_lat"]
    default_lon = dist_config["center_lon"]
    district_name = dist_config["name"]

    is_fallback = False
    if user_lat is None or user_lon is None:
        effective_lat, effective_lon = default_lat, default_lon
        is_fallback = True
    elif not is_within_district(user_lat, user_lon, default_lat, default_lon, dist_config.get("radius_km", 50.0)):
        # If user coordinates are outside the district, fallback to district center
        effective_lat, effective_lon = default_lat, default_lon
        is_fallback = True
    else:
        effective_lat, effective_lon = float(user_lat), float(user_lon)

    all_hospitals = load_hospitals()
    specialty_normalized = required_specialty.strip().lower() if required_specialty else None

    scored_hospitals = []
    for h in all_hospitals:
        h_lat = float(h["lat"])
        h_lon = float(h["lon"])
        dist = haversine_distance(effective_lat, effective_lon, h_lat, h_lon)

        # Check specialty match
        treatments = [t.lower() for t in h.get("available_treatments", [])]
        has_specialty = False
        if specialty_normalized and specialty_normalized not in ["none", "general", "home_care"]:
            has_specialty = any(
                specialty_normalized in t or t in specialty_normalized 
                for t in treatments
            )

        hospital_copy = dict(h)
        hospital_copy["distance_km"] = round(dist, 1)
        hospital_copy["has_specialty_match"] = has_specialty
        
        # Navigation URL using Google Maps directions API
        hospital_copy["navigation_url"] = f"https://www.google.com/maps/dir/?api=1&destination={h_lat},{h_lon}"
        
        scored_hospitals.append(hospital_copy)

    # If a specific specialty was requested, prioritize facilities with that specialty
    matched_hospitals = [h for h in scored_hospitals if h["has_specialty_match"]]
    
    if matched_hospitals:
        matched_hospitals.sort(key=lambda x: (not x["emergency_24x7"], x["distance_km"]))
        selected = matched_hospitals[:limit]
    else:
        # Otherwise sort by 24x7 availability and distance
        scored_hospitals.sort(key=lambda x: (not x["emergency_24x7"], x["distance_km"]))
        selected = scored_hospitals[:limit]

    return {
        "district": district_name,
        "is_fallback_location": is_fallback,
        "effective_coordinates": {"lat": effective_lat, "lon": effective_lon},
        "hospitals": selected,
        "total_available": len(all_hospitals)
    }
