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
exports.UserService = void 0;
const UserEntity_1 = require("../../domain/entities/UserEntity");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    constructor(userStorage) {
        this.userStorage = userStorage;
    }
    registerUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create and validate user entity
            const userEntity = UserEntity_1.UserEntity.create(userData);
            if (!userEntity.validate()) {
                throw new Error('Invalid user data');
            }
            // Check if user already exists
            const existingUserByEmail = yield this.userStorage.findUserByEmail(userData.email);
            if (existingUserByEmail) {
                throw new Error('Email already registered');
            }
            const existingUserByNumberId = yield this.userStorage.findUserByNumberId(userData.number_id);
            if (existingUserByNumberId) {
                throw new Error('ID number already registered');
            }
            // Save user
            const savedMetadata = yield this.userStorage.saveUser(userEntity.getMetadata());
            return new UserEntity_1.UserEntity(savedMetadata);
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userStorage.validateUserCredentials(email, password);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.number_id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            return { user, token };
        });
    }
}
exports.UserService = UserService;
