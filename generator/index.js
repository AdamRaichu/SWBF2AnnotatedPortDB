const fs = require("fs");
const { fnvHash } = require("../generator/utils.js");

console.log("Generating output...");

// Read the CSV file
const rawData = fs.readFileSync("raw/object_ports_hashes.csv", "utf-16le");
const lines = rawData
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line)
  .map((line) => line.replace(/\r$/, "")); // Remove any trailing \r

const output = {};
const header = lines[0].split(","); // Get CSV header
const connectionTypeMap = {
  Property: 1,
  Event: 2,
  Link: 3,
};

// Process each line after the header
for (const line of lines.slice(1)) {
  const values = line.split(",").map((val) => val.trim());
  if (values.length < 5) continue; // Skip invalid lines

  const className = values[0];
  const portType = values[3];
  const portHash = values[4];

  if (!className || !portType || !portHash) continue; // Skip if missing required data

  // Clean up the hash value - ensure 0x prefix and clean up any quotes
  const cleanHash = "0x" + portHash.replace(/^"?0x/, "").replace(/"$/, "");

  // Initialize class entry if it doesn't exist
  if (!output[className]) {
    output[className] = {
      i: {}, // Initialize empty input array
      o: {}, // Initialize empty output array
      c: "", // Initialize empty comment field
    };
  }

  if (portType.includes("Target")) {
    // output[className].i[cleanHash] = [connectionTypeMap[portType.substring(6)], ""];
    output[className].i[cleanHash] = {
      // Connection type
      ct: connectionTypeMap[portType.substring(6)],
      // Data type
      dt: "",
      // Comment
      c: "",
    };
  } else if (portType.includes("Source")) {
    // output[className].o[cleanHash] = [connectionTypeMap[portType.substring(6)], ""];
    output[className].o[cleanHash] = {
      // Connection type
      ct: connectionTypeMap[portType.substring(6)],
      // Data type
      dt: "",
      // Comment
      c: "",
    };
  }
}

// Create the output directory if it doesn't exist
if (!fs.existsSync("generated")) {
  fs.mkdirSync("generated");
}

// Read strings.txt, hash strings, and replace hashes
const stringsData = fs.readFileSync("HashDb/strings.txt", "utf-8");
const stringLines = stringsData
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line)
  .map((line) => line.replace(/\r$/, "")); // Remove any trailing \r

console.log("Processing string hashes...");

for (const strLine of stringLines) {
  const strHash = fnvHash(strLine);
  const hex8 = (strHash >>> 0).toString(16).padStart(8, "0").slice(-8);
  const hexHash = "0x" + hex8;
  // Replace in output
  for (const className in output) {
    const classEntry = output[className];
    if (classEntry.i[hexHash]) {
      classEntry.i[strLine] = classEntry.i[hexHash];
      delete classEntry.i[hexHash];
    }
    if (classEntry.o[hexHash]) {
      classEntry.o[strLine] = classEntry.o[hexHash];
      delete classEntry.o[hexHash];
    }
  }
}

console.log("Writing output files...");

// Write the output
fs.writeFileSync("generated/ports.min.json", JSON.stringify(output), "utf-8");
fs.writeFileSync("generated/ports.json", JSON.stringify(output, null, 2), "utf-8");

console.log("Output generated at generated/ports.json and generated/ports.min.json");
