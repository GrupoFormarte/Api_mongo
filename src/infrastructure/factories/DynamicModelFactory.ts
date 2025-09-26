import mongoose, { Model, Schema, Document } from 'mongoose';
import createDynamicModel from '../database/dynamicModel';
import createDynamicModelById from '../database/dynamicModelById';

export interface ModelOptions {
  useById?: boolean;
  cache?: boolean;
  indexes?: string[];
  validate?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  collections: string[];
}

export class DynamicModelFactory {
  private static instance: DynamicModelFactory;
  private modelCache: Map<string, Model<any>> = new Map();
  private schemaCache: Map<string, Schema> = new Map();
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    collections: []
  };

  private constructor() {}

  public static getInstance(): DynamicModelFactory {
    if (!DynamicModelFactory.instance) {
      DynamicModelFactory.instance = new DynamicModelFactory();
    }
    return DynamicModelFactory.instance;
  }

  public getModel(
    collectionName: string, 
    schemaDefinition: any = {}, 
    options: ModelOptions = {}
  ): Model<any> {
    const { useById = false, cache = true, indexes = [], validate = true } = options;
    const cacheKey = this.generateCacheKey(collectionName, schemaDefinition, useById);

    // Try to get from cache first
    if (cache && this.modelCache.has(cacheKey)) {
      this.cacheStats.hits++;
      return this.modelCache.get(cacheKey)!;
    }

    this.cacheStats.misses++;

    // Validate schema if required
    if (validate && schemaDefinition && Object.keys(schemaDefinition).length > 0) {
      this.validateSchema(schemaDefinition);
    }

    // Create the model
    let model: Model<any>;
    if (useById) {
      model = createDynamicModelById(collectionName, schemaDefinition);
    } else {
      model = createDynamicModel(collectionName, schemaDefinition);
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

  public async preloadModels(collections: { name: string; schema?: any; options?: ModelOptions }[]): Promise<void> {
    const preloadPromises = collections.map(({ name, schema = {}, options = {} }) => {
      return Promise.resolve(this.getModel(name, schema, options));
    });

    await Promise.all(preloadPromises);
  }

  public invalidateCache(collectionName?: string): void {
    if (collectionName) {
      // Remove specific collection from cache
      const keysToDelete = Array.from(this.modelCache.keys())
        .filter(key => key.startsWith(`${collectionName}_`));
      
      keysToDelete.forEach(key => this.modelCache.delete(key));
      
      // Update collections list
      this.cacheStats.collections = this.cacheStats.collections
        .filter(col => col !== collectionName);
    } else {
      // Clear entire cache
      this.modelCache.clear();
      this.schemaCache.clear();
      this.cacheStats.collections = [];
    }

    this.cacheStats.size = this.modelCache.size;
  }

  public getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  public getModelInfo(collectionName: string): {
    cached: boolean;
    variants: string[];
    schema?: any;
  } {
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

  private generateCacheKey(collectionName: string, schema: any, useById: boolean): string {
    const schemaHash = this.hashObject(schema);
    const suffix = useById ? 'byId' : 'default';
    return `${collectionName}_${suffix}_${schemaHash}`;
  }

  private hashObject(obj: any): string {
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

  private validateSchema(schema: any): void {
    if (typeof schema !== 'object' || schema === null) {
      throw new Error('Schema must be a valid object');
    }

    // Basic validation for common MongoDB field types
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'object' && value !== null) {
        const fieldDef = value as any;
        if (fieldDef.type) {
          this.validateFieldType(key, fieldDef.type);
        }
      }
    }
  }

  private validateFieldType(fieldName: string, type: any): void {
    const validTypes = [
      String, Number, Date, Boolean, Array, Object,
      mongoose.Schema.Types.ObjectId, 
      mongoose.Schema.Types.Mixed,
      mongoose.Schema.Types.Decimal128
    ];

    if (!validTypes.includes(type) && typeof type !== 'function') {
      console.warn(`Warning: Potentially invalid type for field '${fieldName}': ${type}`);
    }
  }

  private addIndexes(model: Model<any>, indexes: string[]): void {
    indexes.forEach(index => {
      try {
        model.collection.createIndex({ [index]: 1 });
      } catch (error) {
        console.warn(`Warning: Could not create index on '${index}':`, error);
      }
    });
  }

  // Utility method to get collection statistics
  public async getCollectionStats(collectionName: string): Promise<any> {
    try {
      const model = this.getModel(collectionName);
      const count = await model.countDocuments();
      const sampleDoc = await model.findOne();
      
      return {
        collection: collectionName,
        documents: count,
        sampleDocument: sampleDoc ? Object.keys(sampleDoc.toObject()).length : 0,
        modelCached: this.modelCache.has(`${collectionName}_default_empty`)
      };
    } catch (error) {
      return {
        collection: collectionName,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}