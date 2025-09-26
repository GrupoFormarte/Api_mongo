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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Database connection
const connection_1 = __importDefault(require("../infrastructure/database/connection"));
// Rutas y controladores
const qualifierRoutes_1 = __importDefault(require("../interfaces/http/routes/qualifierRoutes"));
const crud_app_1 = __importDefault(require("../interfaces/http/routes/crud_app"));
const time_zone_1 = __importDefault(require("../interfaces/http/routes/time_zone"));
const userRoutes_1 = __importDefault(require("../interfaces/http/routes/userRoutes"));
const sse_controller_1 = require("../interfaces/websocket/sse.controller");
const positionTracker_1 = require("../application/services/positionTracker");
const progressRoute_1 = __importDefault(require("../interfaces/http/routes/progess/progressRoute"));
const pdfRoutes_1 = __importDefault(require("../interfaces/http/routes/pdfRoutes"));
// New modular routes
const academicRoutes_1 = __importDefault(require("../interfaces/http/routes/academic/academicRoutes"));
const studentRoutes_1 = __importDefault(require("../interfaces/http/routes/students/studentRoutes"));
const systemRoutes_1 = __importDefault(require("../interfaces/http/routes/system/systemRoutes"));
const mediaRoutes_1 = __importDefault(require("../interfaces/http/routes/media/mediaRoutes"));
// Middleware
const errorHandler_1 = require("../shared/middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// Initialize database connection
const dbConnection = connection_1.default.getInstance();
// ────────────── Middlewares ──────────────
app.use((0, cors_1.default)({
    origin: '*', // ahora sí funciona con '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'storage/uploads'), {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
}));
// ────────────── Rutas HTTP ──────────────
app.get('/', (_req, res) => {
    res.send('Hello, world!');
});
// ═══════════════════════════════════════════════════════════════
// FORMARTE API - UNIFIED STRUCTURE
// ═══════════════════════════════════════════════════════════════
// Core API Routes
app.use('/api/auth', userRoutes_1.default); // Authentication & user management
app.use('/api/academic', academicRoutes_1.default); // Academic operations (areas, subjects, simulacros)
app.use('/api/students', studentRoutes_1.default); // Student management & ranking
app.use('/api/system', systemRoutes_1.default); // System utilities & CRUD operations
app.use('/api/media', mediaRoutes_1.default); // Media management (images, files, PDFs)
// Specific API Routes  
app.use('/api/pdf', pdfRoutes_1.default); // PDF operations (legacy compatibility)
app.use('/api/qualifier', qualifierRoutes_1.default); // Qualifier operations
app.use('/api/time', time_zone_1.default); // Time zone operations
// Legacy routes (maintain compatibility)
app.use('/simulacro', crud_app_1.default); // Mobile CRUD operations
app.use("/progress-app", progressRoute_1.default); // Progress tracking
// Error handling middleware (debe ir después de todas las rutas)
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// ────────────── Servidor HTTP + WebSocket ──────────────
const server = http_1.default.createServer(app);
// WebSocket server con ruta personalizada
const wss = new ws_1.WebSocketServer({ server, path: '/ws/notifications' });
wss.on('connection', (ws) => {
    (0, sse_controller_1.handleWebSocketConnection)(ws); // Función que gestiona cada conexión WebSocket
});
// Iniciar servidor
server.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to database
        yield dbConnection.connect();
        console.log(`🚀 FormarTE API listening at http://localhost:${port}`);
        console.log(`📡 WebSocket endpoint: ws://localhost:${port}/ws/notifications`);
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🌟 FORMARTE API - UNIFIED STRUCTURE');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n📋 Core API Routes:');
        console.log('  🔐 Auth:      /api/auth/*      - Authentication & user management');
        console.log('  🎓 Academic:  /api/academic/*  - Areas, subjects, simulacros');
        console.log('  👥 Students:  /api/students/*  - Student management & ranking');
        console.log('  ⚙️  System:    /api/system/*    - System utilities & CRUD');
        console.log('  📁 Media:     /api/media/*     - Images, files, PDFs');
        console.log('\n📋 Specific API Routes:');
        console.log('  📄 PDF:       /api/pdf/*       - PDF operations');
        console.log('  🏆 Qualifier: /api/qualifier/* - Qualifier operations');
        console.log('  🕐 Time:      /api/time/*      - Time zone operations');
        console.log('\n📋 Legacy Routes (compatibility):');
        console.log('  📱 Simulacro: /simulacro/*     - Mobile CRUD operations');
        console.log('  📊 Progress:  /progress-app/*  - Progress tracking');
        console.log('\n═══════════════════════════════════════════════════════════════');
        (0, positionTracker_1.startTrackingPositions)();
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}));
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Graceful shutdown initiated...');
    try {
        yield dbConnection.disconnect();
        console.log('✅ Database disconnected');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}));
