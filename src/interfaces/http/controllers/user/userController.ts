import { Request, Response } from 'express';
import { UserService } from '../../../../application/services/UserService';
import { MongoUserStorage } from '../../../../infrastructure/database/MongoUserStorage';
import { ResponseHandler } from '../../../../shared/utils/responseHandler';


const userService = new UserService(new MongoUserStorage());

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

    const result = await userService.loginUser(email, password);
    
    ResponseHandler.success(
      res,
      { user: result.user, token: result.token },
      'Login successful',
      200
    );
    // ResponseHandler.success(
    //   res,
    //   result.user,
    //   'Login successful',
    //   200
    // );
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return ResponseHandler.badRequest(res, error.message);
    }
    console.error('Error logging in:', error);
    ResponseHandler.error(res, error);
  }
};