# FormArte API - Rutas Protegidas con Validación de IP

## Resumen de Seguridad

Todas las rutas protegidas requieren:
✅ **Token JWT válido** en header `Authorization: Bearer <token>`
✅ **IP coincidente** con la sesión creada durante el login
✅ **Sesión activa** en MongoDB

---

## 🔓 Rutas Públicas (Sin Autenticación)

### `/api/auth/*` - Autenticación y Gestión de Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Login con email/password (crea sesión con IP) |
| POST | `/api/auth/podium-login` | Login con Podium API (crea sesión con IP) |
| POST | `/api/auth/refresh-token` | Refrescar token JWT |
| POST | `/api/auth/logout` | Cerrar sesión actual |
| POST | `/api/auth/logout-all` | Cerrar todas las sesiones (requiere auth) |

**Nota:** Las rutas de logout requieren token pero no middleware `authenticate` a nivel de ruta porque manejan su propia validación.

---

## 🔐 Rutas Protegidas (Autenticación + Validación de IP)

### `/api/academic/*` - Operaciones Académicas

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/api/academic/areas/:grado` | Obtener áreas por grado | ✅ |
| GET | `/api/academic/subjects/:grado` | Obtener asignaturas por grado | ✅ |
| GET | `/api/academic/simulacros/:grado` | Generar simulacro | ✅ |
| GET | `/api/academic/questions/:id` | Obtener pregunta por ID | ✅ |
| GET | `/api/academic/questions-by-type/:programa/:area` | Preguntas por tipo y área | ✅ |

### `/api/students/*` - Gestión de Estudiantes

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/api/students/:collection` | Obtener todos los estudiantes | ✅ |
| GET | `/api/students/:collection/:id` | Obtener estudiante por ID | ✅ |
| POST | `/api/students/:collection` | Crear estudiante | ✅ |
| PUT | `/api/students/:collection/:id` | Actualizar estudiante | ✅ |
| DELETE | `/api/students/:collection/:id` | Eliminar estudiante | ✅ |
| PUT | `/api/students/:collection/bulk-update` | Actualización masiva | ✅ |
| POST | `/api/students/:collection/bulk-create` | Creación masiva única | ✅ |
| GET | `/api/students/ranking/:grado/:studentId` | Obtener posición del estudiante | ✅ |
| POST | `/api/students/remove-examen` | Eliminar examen asignado | ✅ |

### `/api/system/*` - Utilidades del Sistema

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/api/system/:collection` | CRUD genérico - Listar | ✅ |
| GET | `/api/system/:collection/:id` | CRUD genérico - Obtener | ✅ |
| POST | `/api/system/:collection` | CRUD genérico - Crear | ✅ |
| PUT | `/api/system/:collection/:id` | CRUD genérico - Actualizar | ✅ |
| DELETE | `/api/system/:collection/:id` | CRUD genérico - Eliminar | ✅ |
| POST | `/api/system/:collection/bulk` | Obtener múltiples por IDs | ✅ |
| GET | `/api/system/:collection/search/:field/:value` | Buscar por campo | ✅ |

### `/api/media/*` - Gestión de Medios

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| POST | `/api/media/upload` | Subir imagen única | ✅ |
| POST | `/api/media/upload-multiple` | Subir múltiples imágenes | ✅ |
| GET | `/api/media/files/:filename` | Obtener archivo | ✅ |

### `/api/pdf/*` - Operaciones PDF

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| POST | `/api/pdf/generate` | Generar PDF | ✅ |
| GET | `/api/pdf/:id` | Obtener PDF generado | ✅ |

### `/api/qualifier/*` - Calificaciones

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| POST | `/api/qualifier/upload` | Subir archivo de calificaciones | ✅ |
| GET | `/api/qualifier/:id` | Obtener calificación | ✅ |

### `/api/time/*` - Zona Horaria

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/api/time/current` | Obtener hora actual del servidor | ✅ |

---

## 🔐 Rutas Legacy (Protegidas)

### `/simulacro/*` - Operaciones CRUD Móviles

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/simulacro/:collection` | CRUD móvil - Listar | ✅ |
| GET | `/simulacro/:collection/:id` | CRUD móvil - Obtener | ✅ |
| POST | `/simulacro/:collection` | CRUD móvil - Crear | ✅ |
| PUT | `/simulacro/:collection/:id` | CRUD móvil - Actualizar | ✅ |
| DELETE | `/simulacro/:collection/:id` | CRUD móvil - Eliminar | ✅ |

### `/progress-app/*` - Seguimiento de Progreso

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| GET | `/progress-app/analisis/global/:grado/:institucion` | Análisis global | ✅ |
| GET | `/progress-app/analisis/asignaturas/:estudiante/:grado/:institucion` | Análisis de estudiante | ✅ |

---

## 🛡️ Cómo Funciona la Protección

### 1. Login y Creación de Sesión

```bash
# Usuario hace login desde IP: 192.168.1.50
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass123"}'

# Sistema registra en MongoDB:
{
  "userId": "1234567890",
  "token": "eyJhbGc...",
  "ipAddress": "192.168.1.50",
  "userAgent": "curl/7.64.1",
  "createdAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-01-16T10:00:00Z",
  "isActive": true
}
```

### 2. Uso de Token en Ruta Protegida

```bash
# Request desde MISMA IP (✅ Success)
curl -X GET http://localhost:3000/api/students/estudiantes_sexto \
  -H "Authorization: Bearer eyJhbGc..."

# Request desde DIFERENTE IP (❌ Fail)
curl -X GET http://localhost:3000/api/students/estudiantes_sexto \
  -H "Authorization: Bearer eyJhbGc..."

# Response:
{
  "success": false,
  "message": "Invalid session",
  "error": "Session expired, invalid, or IP mismatch detected"
}
```

### 3. Middleware de Validación

El middleware `authenticate` realiza los siguientes pasos:

1. ✅ Extrae el token del header `Authorization`
2. ✅ Verifica que el JWT sea válido
3. ✅ Extrae la IP del cliente (headers: `x-forwarded-for`, `x-real-ip`)
4. ✅ Busca la sesión en MongoDB por `token` + `ipAddress`
5. ✅ Valida que la sesión esté activa y no haya expirado
6. ❌ Si alguna validación falla → `401 Unauthorized`
7. ✅ Si todo es válido → agrega `req.user` y continúa

---

## 📝 Ejemplo de Uso Completo

### Flujo Exitoso

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@school.com", "password": "secure123"}'

# Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 2. Usar token en ruta protegida
curl -X GET http://localhost:3000/api/students/estudiantes_sexto \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
{
  "success": true,
  "data": [ ... estudiantes ... ]
}

# 3. Logout cuando termines
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 🚨 Errores Comunes

| Código | Error | Causa | Solución |
|--------|-------|-------|----------|
| 401 | No token provided | Falta header Authorization | Agregar `Authorization: Bearer <token>` |
| 401 | Invalid token | Token expirado o malformado | Hacer login nuevamente |
| 401 | IP mismatch detected | Token usado desde otra IP | Hacer login desde la nueva ubicación |
| 401 | Session expired, invalid | Sesión inactiva o expirada | Hacer login nuevamente |
| 403 | Insufficient permissions | Usuario sin permisos | Contactar administrador |

---

## 🔧 Configuración Requerida

### Variables de Entorno

```env
# MongoDB (para sesiones)
MONGO_URI=mongodb://localhost:27017/formarte_db

# JWT
JWT_SECRET=tu-super-secreto-cambiar-en-produccion
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production
```

### Headers CORS Permitidos

```javascript
{
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 📊 Estadísticas de Seguridad

- **Total de rutas**: ~50+
- **Rutas públicas**: 6 (autenticación)
- **Rutas protegidas**: ~44+ (requieren JWT + IP)
- **Colecciones dinámicas**: Ilimitadas (sistema de CRUD genérico)

---

## 🔒 Mejoras de Seguridad Implementadas

✅ Validación de IP por sesión (previene robo de tokens)
✅ Sesiones persistentes en MongoDB
✅ Auto-limpieza de sesiones expiradas (TTL index)
✅ Logout individual y masivo
✅ Refresh token con renovación de sesión
✅ Headers CORS configurados correctamente
✅ Logs de auditoría de autenticación

---

**Última actualización:** 2025-01-15
**Versión API:** 1.0.0
