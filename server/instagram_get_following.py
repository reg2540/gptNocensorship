#!/usr/bin/env python3
import sys
import json
from instagrapi import Client

def get_following(session_data):
    try:
        cl = Client()
        cl.set_settings(session_data)
        
        # Get user ID from session
        user_id = cl.user_id
        
        # Get following list
        following = cl.user_following(user_id)
        
        # Convert to simple format
        following_list = []
        for user_id, user_info in following.items():
            following_list.append({
                "userId": str(user_id),
                "username": user_info.username,
                "fullName": user_info.full_name,
                "profilePic": user_info.profile_pic_url
            })
        
        result = {
            "success": True,
            "following": following_list
        }
        
        print(json.dumps(result))
        return 0
        
    except Exception as e:
        result = {
            "success": False,
            "message": f"Failed to fetch following: {str(e)}"
        }
        print(json.dumps(result))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "message": "Usage: python instagram_get_following.py <session_data_json>"
        }))
        sys.exit(1)
    
    session_data = json.loads(sys.argv[1])
    sys.exit(get_following(session_data))
