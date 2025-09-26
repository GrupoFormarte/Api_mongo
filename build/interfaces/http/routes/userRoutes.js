"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/user/userController");
const userRoutes = (0, express_1.Router)();
// POST /api/users/register - Register a new user
userRoutes.post('/register', userController_1.registerUser);
// POST /api/users/login - Login user
userRoutes.post('/login', userController_1.loginUser);
exports.default = userRoutes;
