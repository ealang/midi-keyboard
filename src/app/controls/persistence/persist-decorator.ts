import 'reflect-metadata';

export const metadataKey = Symbol('persisted');

export function persist() {
  return function(target: any, propertyName: string) {
    const list = Reflect.getOwnMetadata(metadataKey, target) || [];
    list.push(propertyName);
    Reflect.defineMetadata(metadataKey, list, target);
  };
}
