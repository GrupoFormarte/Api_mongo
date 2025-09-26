"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const qualifierController_1 = require("../controllers/qualifier/qualifierController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/upload', upload.single('file'), qualifierController_1.uploadFile);
router.post('/excel', upload.single('file'), qualifierController_1.uploadFileExcel);
exports.default = router;
