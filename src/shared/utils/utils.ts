import createDynamicModel from "../../infrastructure/database/dynamicModel";

export function removeLastS(word: string): string {
    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
    return word;
  }

  export async function getData(collection: string, id: string) {
    const DynamicModel = createDynamicModel(collection, {});
    try {
      const document = await DynamicModel.findById(id);
      return document;
    } catch (error) {
      return undefined;
    }
  }