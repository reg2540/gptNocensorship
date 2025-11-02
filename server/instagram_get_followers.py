#!/usr/bin/env python3
import sys
import json
from instagrapi import Client

def get_followers(session_data):
    try:
        cl = Client()
        cl.set_settings(session_data)
        
        # Get user ID from session
        user_id = cl.user_id
        
        # Get followers list
        followers = cl.user_followers(user_id)
        
        # Convert to simple format
        followers_list = []
        for user_id, user_info in followers.items():
            followers_list.append({
                "userId": str(user_id),
                "username": user_info.username,
                "fullName": user_info.full_name,
                "profilePic": user_info.profile_pic_url
            })
        
        result = {
            "success": True,
            "followers": followers_list
        }
        
        print(json.dumps(result))
        return 0
        
    except Exception as e:
        result = {
            "success": False,
            "message": f"Failed to fetch followers: {str(e)}"
        }
        print(json.dumps(result))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "message": "Usage: python instagram_get_followers.py <session_data_json>"
        }))
        sys.exit(1)
    
    session_data = json.loads(sys.argv[1])
    sys.exit(get_followers(session_data))
