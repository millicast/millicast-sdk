export function parseData(data: Record<string, any>) {
  const optionsDict: Record<string, any> = {};
  //convert strings into boolean if true/false encountered
  //convert string,string into array
  Object.entries(data).forEach(([key, value]) => {
    if (value === "true" || value === "false") {
      const myBool: boolean = value === "true";
      optionsDict[key] = myBool;
    } 
    else if (isNumeric(value)) {
      optionsDict[key] = Number(value);
    }
    else if (value.split(",").length > 1) {
      optionsDict[key] = value.split(",");
    }
    else {
      optionsDict[key] = value;
    }
  });
  return optionsDict;
}

function isNumeric(str: string) {
  const regex = /^\d+$/;
  return regex.test(str);
}