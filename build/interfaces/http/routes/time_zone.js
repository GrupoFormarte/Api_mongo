"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeController_1 = require("../controllers/timeController/timeController");
const timeRoute = express_1.default.Router();
// Rutas
timeRoute.get('/current-time', timeController_1.getCurrentTime);
timeRoute.post('/time-left', timeController_1.getTimeLeft);
exports.default = timeRoute;
