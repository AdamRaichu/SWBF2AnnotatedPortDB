const fs = require("fs");

console.log("Generating output...");

// Read the raw data file - it's UTF-16LE with BOM
const rawData = fs.readFileSync("raw/object_ports_hashes.txt", "utf16le");
const lines = rawData
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line)
  .map((line) => line.replace(/\r$/, "")); // Remove any trailing \r

const output = {};
let currentType = null;
let currentSection = null;

for (const line of lines) {
  const trimmedLine = line.replace(/^\t+/, "");

  if (!line.startsWith("\t") && !line.match(/^(Inputs|Outputs)\s+\(\d+\):$/) && !line.match(/^0x[0-9a-fA-F]+$/)) {
    // This is a type definition (but not a count line or hash value)
    currentType = line;
    currentSection = null;
    if (!output[currentType]) {
      output[currentType] = {
        i: {}, // Initialize empty input array
        o: {}, // Initialize empty output array
      };
    }
  } else if (trimmedLine.startsWith("Inputs")) {
    currentSection = "i";
  } else if (trimmedLine.startsWith("Outputs")) {
    currentSection = "o";
  } else if (currentSection && trimmedLine.startsWith("0x")) {
    // This is a hash value
    output[currentType][currentSection][trimmedLine] = [0, ""];
  }
}

// Create the output directory if it doesn't exist
if (!fs.existsSync("generated")) {
  fs.mkdirSync("generated");
}

// Write the output
fs.writeFileSync("generated/ports.min.json", JSON.stringify(output), "utf-8");
fs.writeFileSync("generated/ports.json", JSON.stringify(output, null, 2), "utf-8");

console.log("Output generated at generated/ports.json and generated/ports.min.json");
