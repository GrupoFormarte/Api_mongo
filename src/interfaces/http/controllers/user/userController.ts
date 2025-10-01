import { Request, Response } from 'express';
import { UserService } from '../../../../application/services/UserService';
import { MongoUserStorage } from '../../../../infrastructure/database/MongoUserStorage';
import { MongoSessionStorage } from '../../../../infrastructure/database/MongoSessionStorage';
import { ResponseHandler } from '../../../../shared/utils/responseHandler';
import { getClientIp, getUserAgent, AuthRequest } from '../../../../shared/middleware/authMiddleware';


const userService = new UserService(new MongoUserStorage(), new MongoSessionStorage());

export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'type_id',
      'number_id',
      'name',
      'last_name',
      'email',
      'cellphone',
      'locate_district',
      'type_user',
      'gender',
      'birthday',
      'password'
    ];
    userData['password']=userData['number_id'];

    if(userData['type_user']==undefined||userData['type_user']==null){
      userData['type_user']="Student ";
    }
    for (const field of requiredFields) {
      if (!userData[field]) {
        return ResponseHandler.badRequest(res, `Missing required field: ${field}`);
      }
    }


    
        const user = await userService.registerUser(userData);
    
    ResponseHandler.success(
      res,
      { user: user.getMetadata() },
      'User registered successfully',
      201
    );
  } catch (error: any) {
    if (error.message === 'Invalid user data' ||
        error.message === 'Email already registered' ||
        error.message === 'ID number already registered') {
      return ResponseHandler.badRequest(res, error.message);
    }
    console.error('Error registering user:', error);
    ResponseHandler.error(res, error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler.badRequest(res, 'Email and password are required');
    }

    // Get client context
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const result = await userService.loginUser(email, password, {
      ipAddress,
      userAgent
    });

    ResponseHandler.success(
      res,
      { user: result.user, token: result.token },
      'Login successful',
      200
    );
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return ResponseHandler.badRequest(res, error.message);
    }
    console.error('Error logging in:', error);
    ResponseHandler.error(res, error);
  }
};

export const logoutUser = async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.badRequest(res, 'No token provided');
    }

    const token = authHeader.substring(7);
    const success = await userService.logoutUser(token);

    if (success) {
      ResponseHandler.success(res, null, 'Logout successful', 200);
    } else {
      ResponseHandler.badRequest(res, 'Session not found or already logged out');
    }
  } catch (error: any) {
    console.error('Error logging out:', error);
    ResponseHandler.error(res, error);
  }
};

export const logoutAllSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return ResponseHandler.badRequest(res, 'User not authenticated');
    }

    const count = await userService.logoutAllUserSessions(req.user.userId);

    ResponseHandler.success(
      res,
      { sessionsInvalidated: count },
      `${count} session(s) invalidated successfully`,
      200
    );
  } catch (error: any) {
    console.error('Error logging out all sessions:', error);
    ResponseHandler.error(res, error);
  }
};

export const loginUserWithPodium = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;


    console.log({ userId, token });
    

    if (!userId || !token) {
      return ResponseHandler.badRequest(res, 'userId and podiumToken are required');
    }

    // Get client context
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const result = await userService.loginUserWithPodium(userId, token, {
      ipAddress,
      userAgent
    });

    ResponseHandler.success(
      res,
      { userData: result.userData, token: result.token },
      'Podium login successful',
      200
    );
  } catch (error: any) {
    if (error.message === 'Podium authentication failed' ||
        error.message.includes('Missing userId or token') ||
        error.message.includes('Invalid user credentials')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    console.error('Error with Podium login:', error);
    ResponseHandler.error(res, error);
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHandler.badRequest(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Get client context
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const result = await userService.refreshToken(token, {
      ipAddress,
      userAgent
    });

    ResponseHandler.success(
      res,
      { token: result.token },
      'Token refreshed successfully',
      200
    );
  } catch (error: any) {
    if (error.message === 'Token refresh failed' ||
        error.message.includes('Invalid token') ||
        error.message.includes('does not need refresh')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    console.error('Error refreshing token:', error);
    ResponseHandler.error(res, error);
  }
};