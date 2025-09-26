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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserService_1 = require("../../../../src/application/services/UserService");
const UserEntity_1 = require("../../../../src/domain/entities/UserEntity");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock JWT
jest.mock('jsonwebtoken');
const mockJwt = jsonwebtoken_1.default;
describe('UserService', () => {
    let userService;
    let mockUserStorage;
    beforeEach(() => {
        mockUserStorage = {
            saveUser: jest.fn(),
            findUserByEmail: jest.fn(),
            findUserByNumberId: jest.fn(),
            validateUserCredentials: jest.fn(),
        };
        userService = new UserService_1.UserService(mockUserStorage);
    });
    describe('registerUser', () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            number_id: '123456789',
            name: 'John Doe',
        };
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserStorage.findUserByEmail.mockResolvedValue(null);
            mockUserStorage.findUserByNumberId.mockResolvedValue(null);
            mockUserStorage.saveUser.mockResolvedValue(Object.assign(Object.assign({}, userData), { createdAt: new Date() }));
            const result = yield userService.registerUser(userData);
            expect(mockUserStorage.findUserByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockUserStorage.findUserByNumberId).toHaveBeenCalledWith(userData.number_id);
            expect(mockUserStorage.saveUser).toHaveBeenCalled();
            expect(result).toBeInstanceOf(UserEntity_1.UserEntity);
        }));
        it('should throw error if email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const existingUser = Object.assign(Object.assign({}, userData), { createdAt: new Date() });
            mockUserStorage.findUserByEmail.mockResolvedValue(existingUser);
            yield expect(userService.registerUser(userData)).rejects.toThrow('Email already registered');
        }));
        it('should throw error if number ID already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const existingUser = Object.assign(Object.assign({}, userData), { createdAt: new Date() });
            mockUserStorage.findUserByEmail.mockResolvedValue(null);
            mockUserStorage.findUserByNumberId.mockResolvedValue(existingUser);
            yield expect(userService.registerUser(userData)).rejects.toThrow('ID number already registered');
        }));
        it('should throw error if user data is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidUserData = Object.assign(Object.assign({}, userData), { email: 'invalid-email' });
            // Mock UserEntity.create to return an invalid user
            jest.spyOn(UserEntity_1.UserEntity, 'create').mockReturnValue({
                validate: () => false,
            });
            yield expect(userService.registerUser(invalidUserData)).rejects.toThrow('Invalid user data');
        }));
    });
    describe('loginUser', () => {
        const email = 'test@example.com';
        const password = 'password123';
        const mockUser = {
            email,
            password,
            number_id: '123456789',
            name: 'John Doe',
            createdAt: new Date(),
        };
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserStorage.validateUserCredentials.mockResolvedValue(mockUser);
            mockJwt.sign.mockReturnValue('mock-token');
            const result = yield userService.loginUser(email, password);
            expect(mockUserStorage.validateUserCredentials).toHaveBeenCalledWith(email, password);
            expect(mockJwt.sign).toHaveBeenCalledWith({ userId: mockUser.number_id, email: mockUser.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            expect(result).toEqual({
                user: mockUser,
                token: 'mock-token',
            });
        }));
        it('should throw error for invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserStorage.validateUserCredentials.mockResolvedValue(null);
            yield expect(userService.loginUser(email, password)).rejects.toThrow('Invalid credentials');
        }));
    });
});
