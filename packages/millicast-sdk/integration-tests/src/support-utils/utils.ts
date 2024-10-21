export function parseData(data: Record<string, any>) {
  const optionsDict: Record<string, any> = {};
  //convert strings into boolean if true/false encountered
  Object.entries(data).forEach(([key, value]) => {
    if (value === "true" || value === "false") {
      const myBool: boolean = value === "true";
      optionsDict[key] = myBool;
    } else {
      optionsDict[key] = value;
    }
  });

  return optionsDict;
}

