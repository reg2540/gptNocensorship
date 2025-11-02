import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface InstagramSession {
  username: string;
  sessionData: any;
  userId: string;
}

// Store active sessions in memory (in production, use Redis or similar)
const activeSessions = new Map<string, InstagramSession>();

export async function loginToInstagram(username: string, password: string) {
  try {
    const scriptPath = path.join(__dirname, 'instagram_login.py');
    
    // Call Python script
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${username}" "${password}"`,
      { timeout: 30000 }
    );
    
    if (stderr && !stdout) {
      console.error('Python script error:', stderr);
      return {
        success: false,
        error: 'SCRIPT_ERROR',
        message: '로그인 처리 중 오류가 발생했습니다.',
      };
    }
    
    const result = JSON.parse(stdout.trim());
    
    if (result.success) {
      // Store session
      const sessionKey = `${username}_${Date.now()}`;
      activeSessions.set(sessionKey, {
        username,
        sessionData: result.sessionData,
        userId: result.userId,
      });
      
      return {
        success: true,
        sessionKey,
        userId: result.userId,
        username: username,
        fullName: username,
        profilePicUrl: '',
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('Instagram login error:', error);
    
    return {
      success: false,
      error: 'LOGIN_FAILED',
      message: '로그인에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

export async function retryLoginAfterChallenge(sessionKey: string, username: string, password: string) {
  // For Python-based login, just retry the login
  return loginToInstagram(username, password);
}

export async function getFollowing(sessionKey: string) {
  const session = activeSessions.get(sessionKey);
  if (!session) {
    throw new Error('Session not found');
  }
  
  try {
    const scriptPath = path.join(__dirname, 'instagram_get_following.py');
    const sessionDataJson = JSON.stringify(session.sessionData);
    
    // Call Python script
    const { stdout } = await execAsync(
      `python3 "${scriptPath}" '${sessionDataJson}'`,
      { timeout: 60000 }
    );
    
    const result = JSON.parse(stdout.trim());
    
    if (result.success) {
      return result.following;
    }
    
    throw new Error(result.message || 'Failed to fetch following');
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
}

export async function getFollowers(sessionKey: string) {
  const session = activeSessions.get(sessionKey);
  if (!session) {
    throw new Error('Session not found');
  }
  
  try {
    const scriptPath = path.join(__dirname, 'instagram_get_followers.py');
    const sessionDataJson = JSON.stringify(session.sessionData);
    
    // Call Python script
    const { stdout } = await execAsync(
      `python3 "${scriptPath}" '${sessionDataJson}'`,
      { timeout: 60000 }
    );
    
    const result = JSON.parse(stdout.trim());
    
    if (result.success) {
      return result.followers;
    }
    
    throw new Error(result.message || 'Failed to fetch followers');
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
}

export function clearSession(sessionKey: string) {
  activeSessions.delete(sessionKey);
}
