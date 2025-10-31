
let parser={}
parser.parseArray=(value, isObject = false) =>{
  try {
    if (!value) return [];
    if (typeof value === "string") {
      // Try to parse JSON first
      if (value.trim().startsWith("[") || value.trim().startsWith("{")) {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      // Comma-separated string
      return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
    // Already an array
    return Array.isArray(value) ? value : [value];
  } catch (err) {
    console.error("Error parsing array:", err);
    return [];
  }
}

parser.parseObject=(value) =>{
  try {
    if (!value) return {};
    if (typeof value === "string") {
      // Try parsing JSON string
      if (value.trim().startsWith("{")) {
        return JSON.parse(value);
      }
      // Handle key=value,key=value pattern if needed
      const obj = {};
      value.split(",").forEach((pair) => {
        const [key, val] = pair.split("=");
        if (key && val) obj[key.trim()] = val.trim();
      });
      return obj;
    }
    return typeof value === "object" ? value : {};
  } catch (err) {
    console.error("Error parsing object:", err);
    return {};
  }
}

module.exports=parser