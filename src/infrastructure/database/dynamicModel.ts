import { Schema, model, Model, Document, models } from 'mongoose';

const createDynamicModel = (collectionName: string, schemaDefinition: any): Model<Document> => {
  if (models[collectionName]) {
    return models[collectionName];
  }
  const schema = new Schema(schemaDefinition, { strict: false });
  return model(collectionName, schema, collectionName);
};

export default createDynamicModel;
