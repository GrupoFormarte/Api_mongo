"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const UserService_1 = require("../../../../application/services/UserService");
const MongoUserStorage_1 = require("../../../../infrastructure/database/MongoUserStorage");
const responseHandler_1 = require("../../../../shared/utils/responseHandler");
const userService = new UserService_1.UserService(new MongoUserStorage_1.MongoUserStorage());
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        userData['password'] = userData['number_id'];
        if (userData['type_user'] == undefined || userData['type_user'] == null) {
            userData['type_user'] = "Student ";
        }
        for (const field of requiredFields) {
            if (!userData[field]) {
                return responseHandler_1.ResponseHandler.badRequest(res, `Missing required field: ${field}`);
            }
        }
        const user = yield userService.registerUser(userData);
        responseHandler_1.ResponseHandler.success(res, { user: user.getMetadata() }, 'User registered successfully', 201);
    }
    catch (error) {
        if (error.message === 'Invalid user data' ||
            error.message === 'Email already registered' ||
            error.message === 'ID number already registered') {
            return responseHandler_1.ResponseHandler.badRequest(res, error.message);
        }
        console.error('Error registering user:', error);
        responseHandler_1.ResponseHandler.error(res, error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return responseHandler_1.ResponseHandler.badRequest(res, 'Email and password are required');
        }
        const result = yield userService.loginUser(email, password);
        responseHandler_1.ResponseHandler.success(res, { user: result.user, token: result.token }, 'Login successful', 200);
        // ResponseHandler.success(
        //   res,
        //   result.user,
        //   'Login successful',
        //   200
        // );
    }
    catch (error) {
        if (error.message === 'Invalid credentials') {
            return responseHandler_1.ResponseHandler.badRequest(res, error.message);
        }
        console.error('Error logging in:', error);
        responseHandler_1.ResponseHandler.error(res, error);
    }
});
exports.loginUser = loginUser;
