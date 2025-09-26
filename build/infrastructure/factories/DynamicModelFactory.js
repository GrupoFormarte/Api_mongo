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
exports.DynamicModelFactory = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dynamicModel_1 = __importDefault(require("../database/dynamicModel"));
const dynamicModelById_1 = __importDefault(require("../database/dynamicModelById"));
class DynamicModelFactory {
    constructor() {
        this.modelCache = new Map();
        this.schemaCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0,
            collections: []
        };
    }
    static getInstance() {
        if (!DynamicModelFactory.instance) {
            DynamicModelFactory.instance = new DynamicModelFactory();
        }
        return DynamicModelFactory.instance;
    }
    getModel(collectionName, schemaDefinition = {}, options = {}) {
        const { useById = false, cache = true, indexes = [], validate = true } = options;
        const cacheKey = this.generateCacheKey(collectionName, schemaDefinition, useById);
        // Try to get from cache first
        if (cache && this.modelCache.has(cacheKey)) {
            this.cacheStats.hits++;
            return this.modelCache.get(cacheKey);
        }
        this.cacheStats.misses++;
        // Validate schema if required
        if (validate && schemaDefinition && Object.keys(schemaDefinition).length > 0) {
            this.validateSchema(schemaDefinition);
        }
        // Create the model
        let model;
        if (useById) {
            model = (0, dynamicModelById_1.default)(collectionName, schemaDefinition);
        }
        else {
            model = (0, dynamicModel_1.default)(collectionName, schemaDefinition);
        }
        // Add indexes if specified
        if (indexes.length > 0) {
            this.addIndexes(model, indexes);
        }
        // Cache the model if caching is enabled
        if (cache) {
            this.modelCache.set(cacheKey, model);
            this.cacheStats.size = this.modelCache.size;
            if (!this.cacheStats.collections.includes(collectionName)) {
                this.cacheStats.collections.push(collectionName);
            }
        }
        return model;
    }
    preloadModels(collections) {
        return __awaiter(this, void 0, void 0, function* () {
            const preloadPromises = collections.map(({ name, schema = {}, options = {} }) => {
                return Promise.resolve(this.getModel(name, schema, options));
            });
            yield Promise.all(preloadPromises);
        });
    }
    invalidateCache(collectionName) {
        if (collectionName) {
            // Remove specific collection from cache
            const keysToDelete = Array.from(this.modelCache.keys())
                .filter(key => key.startsWith(`${collectionName}_`));
            keysToDelete.forEach(key => this.modelCache.delete(key));
            // Update collections list
            this.cacheStats.collections = this.cacheStats.collections
                .filter(col => col !== collectionName);
        }
        else {
            // Clear entire cache
            this.modelCache.clear();
            this.schemaCache.clear();
            this.cacheStats.collections = [];
        }
        this.cacheStats.size = this.modelCache.size;
    }
    getCacheStats() {
        return Object.assign({}, this.cacheStats);
    }
    getModelInfo(collectionName) {
        const variants = Array.from(this.modelCache.keys())
            .filter(key => key.startsWith(`${collectionName}_`))
            .map(key => key.split('_').slice(1).join('_'));
        const cached = variants.length > 0;
        const mainKey = `${collectionName}_default`;
        const schema = this.schemaCache.get(mainKey);
        return {
            cached,
            variants,
            schema
        };
    }
    generateCacheKey(collectionName, schema, useById) {
        const schemaHash = this.hashObject(schema);
        const suffix = useById ? 'byId' : 'default';
        return `${collectionName}_${suffix}_${schemaHash}`;
    }
    hashObject(obj) {
        if (!obj || Object.keys(obj).length === 0) {
            return 'empty';
        }
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    validateSchema(schema) {
        if (typeof schema !== 'object' || schema === null) {
            throw new Error('Schema must be a valid object');
        }
        // Basic validation for common MongoDB field types
        for (const [key, value] of Object.entries(schema)) {
            if (typeof value === 'object' && value !== null) {
                const fieldDef = value;
                if (fieldDef.type) {
                    this.validateFieldType(key, fieldDef.type);
                }
            }
        }
    }
    validateFieldType(fieldName, type) {
        const validTypes = [
            String, Number, Date, Boolean, Array, Object,
            mongoose_1.default.Schema.Types.ObjectId,
            mongoose_1.default.Schema.Types.Mixed,
            mongoose_1.default.Schema.Types.Decimal128
        ];
        if (!validTypes.includes(type) && typeof type !== 'function') {
            console.warn(`Warning: Potentially invalid type for field '${fieldName}': ${type}`);
        }
    }
    addIndexes(model, indexes) {
        indexes.forEach(index => {
            try {
                model.collection.createIndex({ [index]: 1 });
            }
            catch (error) {
                console.warn(`Warning: Could not create index on '${index}':`, error);
            }
        });
    }
    // Utility method to get collection statistics
    getCollectionStats(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const model = this.getModel(collectionName);
                const count = yield model.countDocuments();
                const sampleDoc = yield model.findOne();
                return {
                    collection: collectionName,
                    documents: count,
                    sampleDocument: sampleDoc ? Object.keys(sampleDoc.toObject()).length : 0,
                    modelCached: this.modelCache.has(`${collectionName}_default_empty`)
                };
            }
            catch (error) {
                return {
                    collection: collectionName,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
    }
}
exports.DynamicModelFactory = DynamicModelFactory;
