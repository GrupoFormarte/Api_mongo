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
exports.MongoUserStorage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    type_id: { type: Number, required: true },
    number_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    second_name: { type: String },
    last_name: { type: String, required: true },
    second_last: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cellphone: { type: String, required: true },
    type_user: { type: String, required: false },
    locate_district: { type: String, required: true },
    gender: { type: String, required: true },
    birthday: { type: String, required: true },
    programa: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});
const UserModel = mongoose_1.default.model('User', userSchema);
class MongoUserStorage {
    saveUser(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(metadata.password, 10);
            const user = new UserModel(Object.assign(Object.assign({}, metadata), { password: hashedPassword }));
            const savedUser = yield user.save();
            const userObject = savedUser.toObject();
            if ('password' in userObject) {
                delete userObject.password;
            }
            return userObject;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ email });
            if (!user)
                return null;
            const userObject = user.toObject();
            if ('password' in userObject) {
                delete userObject.password;
            }
            return userObject;
        });
    }
    validateUserCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ email });
            if (!user)
                return null;
            const isValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isValid)
                return null;
            const userObject = user.toObject();
            if ('password' in userObject) {
                delete userObject.password;
            }
            return userObject;
        });
    }
    findUserByNumberId(numberId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ number_id: numberId });
            return user ? user.toObject() : null;
        });
    }
}
exports.MongoUserStorage = MongoUserStorage;
