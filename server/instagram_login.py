#!/usr/bin/env python3
import sys
import json
from instagrapi import Client
from instagrapi.exceptions import (
    BadPassword, 
    ReloginAttemptExceeded, 
    ChallengeRequired,
    TwoFactorRequired,
    LoginRequired
)

def login(username, password):
    try:
        cl = Client()
        cl.delay_range = [1, 3]
        
        # Attempt login
        user = cl.login(username, password)
        
        # Get session data
        session_data = cl.get_settings()
        
        result = {
            "success": True,
            "userId": str(user),
            "username": username,
            "sessionData": session_data
        }
        
        print(json.dumps(result))
        return 0
        
    except BadPassword:
        result = {
            "success": False,
            "error": "INVALID_CREDENTIALS",
            "message": "아이디 또는 비밀번호가 올바르지 않습니다."
        }
        print(json.dumps(result))
        return 1
        
    except TwoFactorRequired:
        result = {
            "success": False,
            "error": "TWO_FACTOR_REQUIRED",
            "message": "2단계 인증이 필요합니다. 인증 코드를 입력해주세요."
        }
        print(json.dumps(result))
        return 1
        
    except ChallengeRequired as e:
        result = {
            "success": False,
            "error": "CHALLENGE_REQUIRED",
            "message": "보안 인증이 필요합니다. 인스타그램 앱에서 확인해주세요."
        }
        print(json.dumps(result))
        return 1
        
    except Exception as e:
        result = {
            "success": False,
            "error": "LOGIN_FAILED",
            "message": f"로그인 실패: {str(e)}"
        }
        print(json.dumps(result))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "INVALID_ARGS",
            "message": "Usage: python instagram_login.py <username> <password>"
        }))
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    
    sys.exit(login(username, password))
