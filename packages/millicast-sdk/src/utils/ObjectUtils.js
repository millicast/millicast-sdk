export function swapPropertyValues(obj1, obj2, key) {
  // Check if both objects have the property
  //
  if (Object.prototype.hasOwnProperty.call(obj1, key) && Object.prototype.hasOwnProperty.call(obj2, key)) {
    const temp = obj1[key]
    obj1[key] = obj2[key]
    obj2[key] = temp
  } else {
    console.error(`One or both objects do not have the property "${key}"`)
  }
}
