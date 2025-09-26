"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imageController_1 = require("../controllers/image/imageController");
const router = express_1.default.Router();
// Routes for uploading images
router.post('/upload', imageController_1.uploadImage);
router.post('/upload-multiple', imageController_1.uploadMultipleImages);
exports.default = router;
