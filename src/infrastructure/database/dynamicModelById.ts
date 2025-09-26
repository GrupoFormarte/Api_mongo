import { Schema, model, Model, Document, models } from 'mongoose';

const createDynamicModelById = (collectionName: string, schemaDefinition: any): Model<Document> => {
  if (models[collectionName]) {
    return models[collectionName];
  }
  // Añadir configuración para _id como string
  const schema = new Schema({
    ...schemaDefinition,
    _id: { type: String, required: false }
  }, { strict: false });
  return model(collectionName, schema, collectionName);
};

export default createDynamicModelById;