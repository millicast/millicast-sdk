export function swapPropertyValues<T1 extends object, T2 extends object, K extends keyof T1 & keyof T2>(
  obj1: T1,
  obj2: T2,
  key: K
): void {
  // Check if both objects have the property
  if (Object.prototype.hasOwnProperty.call(obj1, key) && Object.prototype.hasOwnProperty.call(obj2, key)) {
    const temp = obj1[key];
    obj1[key] = obj2[key] as unknown as T1[K];
    obj2[key] = temp as unknown as T2[K];
  } else {
    console.error(`One or both objects do not have the property "${String(key)}"`);
  }
}

export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
