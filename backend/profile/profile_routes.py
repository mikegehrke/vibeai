"""
Profile Management Routes
Handles user profile CRUD operations
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user
from db import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/profile", tags=["profile"])

# Profile Data Model
class ProfileData(BaseModel):
    firstName: str = ""
    lastName: str = ""
    username: str = ""
    bio: str = ""
    location: str = ""
    xUsername: str = ""
    githubUsername: str = ""
    linkedinUsername: str = ""
    discordUsername: str = ""
    youtubeChannel: str = ""
    website: str = ""

# In-memory storage (replace with database in production)
profiles_db = {}

@router.get("/me")
async def get_profile(user=Depends(get_current_user)):
    """Get current user's profile"""
    user_id = user.get("id") if isinstance(user, dict) else user.id
    
    if user_id not in profiles_db:
        # Return default profile with user data
        user_email = user.get("email") if isinstance(user, dict) else user.email
        user_name = user.get("name", "") if isinstance(user, dict) else getattr(user, "name", "")
        
        # Try to extract first/last name from full name
        name_parts = user_name.split(" ", 1) if user_name else ["", ""]
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Generate username from email
        username = user_email.split("@")[0] if user_email else "user"
        
        return {
            "firstName": first_name,
            "lastName": last_name,
            "username": username,
            "bio": "",
            "location": "",
            "xUsername": "",
            "githubUsername": "",
            "linkedinUsername": "",
            "discordUsername": "",
            "youtubeChannel": "",
            "website": ""
        }
    
    return profiles_db[user_id]

@router.put("/me")
async def update_profile(profile: ProfileData, user=Depends(get_current_user)):
    """Update current user's profile"""
    user_id = user.get("id") if isinstance(user, dict) else user.id
    
    # Save profile
    profiles_db[user_id] = profile.dict()
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": profiles_db[user_id]
    }

@router.post("/create")
async def create_profile(profile: ProfileData, user=Depends(get_current_user)):
    """Create a new profile for user"""
    user_id = user.get("id") if isinstance(user, dict) else user.id
    
    # Check if profile already exists
    if user_id in profiles_db:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    # Create profile
    profiles_db[user_id] = profile.dict()
    
    return {
        "success": True,
        "message": "Profile created successfully",
        "profile": profiles_db[user_id]
    }

@router.get("/{username}")
async def get_profile_by_username(username: str):
    """Get profile by username (public)"""
    # Search for profile with matching username
    for user_id, profile in profiles_db.items():
        if profile.get("username") == username:
            return profile
    
    raise HTTPException(status_code=404, detail="Profile not found")

