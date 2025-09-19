const XLSX = require("xlsx");
const path = require("node:path");

// Constants
const FARMER_1_ROW_ID = 1;
const FARMER_2_ROW_ID = 2;
const FARMER_3_ROW_ID = 3;
const VALIDATION_COLUMNS_COUNT = 4;

// Farmer data structure based on the form fields
const farmerHeaders = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "dateOfBirth",
  "gender",
  "community",
  "address",
  "districtName",
  "idType",
  "idNumber",
  "householdSize",
  "isLeader",
  "isPhoneSmart",
  "legacyFarmerId",
];

// Farm data structure based on the form fields
const farmHeaders = [
  "farmName",
  "acreage",
  "cropType",
  "soilType",
  "locationLat",
  "locationLng",
];

// Create sample data for farmers
const sampleFarmers = [
  {
    firstName: "Kwame",
    lastName: "Asante",
    phone: "+233244123456",
    email: "kwame.asante@example.com",
    dateOfBirth: "1985-03-15",
    gender: "male",
    community: "Akim Oda",
    address: "House 12, Market Street",
    districtName: "Birim Central Municipal",
    idType: "ghana_card",
    idNumber: "GHA-123456789-0",
    householdSize: 5,
    isLeader: "Yes",
    isPhoneSmart: "Yes",
    legacyFarmerId: "LEGACY001",
  },
  {
    firstName: "Akosua",
    lastName: "Mensah",
    phone: "+233245789012",
    email: "akosua.mensah@example.com",
    dateOfBirth: "1978-07-22",
    gender: "female",
    community: "Bunso",
    address: "Plot 45, Chief Palace Road",
    districtName: "West Akim Municipal",
    idType: "voters_id",
    idNumber: "VID-987654321",
    householdSize: 8,
    isLeader: "No",
    isPhoneSmart: "No",
    legacyFarmerId: "LEGACY002",
  },
  {
    firstName: "Yaw",
    lastName: "Osei",
    phone: "+233246345678",
    email: "",
    dateOfBirth: "1990-11-08",
    gender: "male",
    community: "Kyebi",
    address: "Near Methodist Church",
    districtName: "East Akim Municipal",
    idType: "passport",
    idNumber: "P0012345",
    householdSize: 3,
    isLeader: "Yes",
    isPhoneSmart: "Yes",
    legacyFarmerId: "",
  },
];

// Create sample farms for each farmer (3 farms each)
const sampleFarms = [
  // Farmer 1 farms
  {
    farmName: "Main Cocoa Farm",
    acreage: 5.5,
    cropType: "Cocoa",
    soilType: "loamy",
    locationLat: 6.0769,
    locationLng: -0.8761,
  },
  {
    farmName: "Rice Paddies",
    acreage: 2.3,
    cropType: "Rice",
    soilType: "clay",
    locationLat: 6.0785,
    locationLng: -0.8745,
  },
  {
    farmName: "Vegetable Garden",
    acreage: 1.2,
    cropType: "Mixed Vegetables",
    soilType: "sandy",
    locationLat: 6.0801,
    locationLng: -0.8729,
  },

  // Farmer 2 farms
  {
    farmName: "Cassava Plantation",
    acreage: 8.7,
    cropType: "Cassava",
    soilType: "loamy",
    locationLat: 6.1234,
    locationLng: -0.789,
  },
  {
    farmName: "Maize Field",
    acreage: 4.1,
    cropType: "Maize",
    soilType: "silt",
    locationLat: 6.125,
    locationLng: -0.7874,
  },
  {
    farmName: "Plantain Grove",
    acreage: 3.6,
    cropType: "Plantain",
    soilType: "clay",
    locationLat: 6.1266,
    locationLng: -0.7858,
  },

  // Farmer 3 farms
  {
    farmName: "Oil Palm Estate",
    acreage: 12.0,
    cropType: "Oil Palm",
    soilType: "loamy",
    locationLat: 6.21,
    locationLng: -0.65,
  },
  {
    farmName: "Pepper Farm",
    acreage: 0.8,
    cropType: "Pepper",
    soilType: "sandy",
    locationLat: 6.2116,
    locationLng: -0.6484,
  },
  {
    farmName: "Yam Farm",
    acreage: 6.2,
    cropType: "Yam",
    soilType: "rocky",
    locationLat: 6.2132,
    locationLng: -0.6468,
  },
];

// Create workbook and worksheets
const wb = XLSX.utils.book_new();

// Create Instructions worksheet
const instructionsData = [
  ["FARMER BULK UPLOAD TEMPLATE"],
  [""],
  ["Instructions:"],
  ['1. Fill in farmer details in the "Farmers" sheet'],
  ['2. Fill in corresponding farm details in the "Farms" sheet'],
  ["3. Each farmer can have multiple farms"],
  ["4. Use the exact values from the dropdown lists for validation"],
  ["5. Required fields are marked with * in the headers"],
  [""],
  ["Field Validations:"],
  [""],
  ["FARMER FIELDS:"],
  ["• firstName*: Text (required)"],
  ["• lastName*: Text (required)"],
  ["• phone*: Phone number in international format (+233...)"],
  ["• email: Valid email address (optional)"],
  ["• dateOfBirth*: Date in YYYY-MM-DD format"],
  ["• gender*: male, female, or other"],
  ["• community*: Text (required)"],
  ["• address*: Text (required, minimum 5 characters)"],
  ["• districtName*: Full district name"],
  ["• idType*: ghana_card, voters_id, passport, or drivers_license"],
  ["• idNumber*: ID number (minimum 5 characters)"],
  ["• householdSize: Positive number (optional)"],
  ["• isLeader: Yes or No"],
  ["• isPhoneSmart: Yes or No"],
  ["• legacyFarmerId: Previous system ID (optional)"],
  [""],
  ["FARM FIELDS:"],
  ["• farmName*: Text (required)"],
  ["• acreage: Positive number (optional)"],
  ["• cropType: Text (optional)"],
  ["• soilType: sandy, clay, loamy, silt, or rocky"],
  ["• locationLat: Latitude coordinate (optional)"],
  ["• locationLng: Longitude coordinate (optional)"],
  [""],
  [
    "Note: Each row in Farms sheet should correspond to a farmer row in Farmers sheet.",
  ],
  ["If a farmer has multiple farms, repeat the farmer row number."],
];

const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsData);
XLSX.utils.book_append_sheet(wb, instructionsWS, "Instructions");

// Create Farmers worksheet with headers and sample data
const farmersData = [
  // Headers row
  farmerHeaders.map((header) => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "community",
      "address",
      "districtName",
      "idType",
      "idNumber",
    ];
    return requiredFields.includes(header) ? `${header}*` : header;
  }),
  // Sample data rows
  ...sampleFarmers.map((farmer) =>
    farmerHeaders.map((header) => farmer[header] || "")
  ),
];

const farmersWS = XLSX.utils.aoa_to_sheet(farmersData);

// Style the header row
const farmersRange = XLSX.utils.decode_range(farmersWS["!ref"]);
for (let col = farmersRange.s.c; col <= farmersRange.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  if (!farmersWS[cellAddress]) {
    continue;
  }
  farmersWS[cellAddress].s = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "E3F2FD" } },
    alignment: { horizontal: "center" },
  };
}

// Set column widths for farmers sheet
farmersWS["!cols"] = farmerHeaders.map((header) => {
  switch (header) {
    case "firstName":
    case "lastName":
      return { wch: 15 };
    case "phone":
    case "email":
      return { wch: 20 };
    case "address":
      return { wch: 25 };
    case "districtName":
      return { wch: 30 };
    case "dateOfBirth":
      return { wch: 12 };
    case "idNumber":
      return { wch: 18 };
    default:
      return { wch: 12 };
  }
});

XLSX.utils.book_append_sheet(wb, farmersWS, "Farmers");

// Create Farms worksheet with headers and sample data
const farmsData = [
  // Headers row
  [
    "farmerRow*",
    ...farmHeaders.map((header) =>
      header === "farmName" ? `${header}*` : header
    ),
  ],
  // Sample data rows - each corresponds to a farmer
  [FARMER_1_ROW_ID, ...Object.values(sampleFarms[0])],
  [FARMER_1_ROW_ID, ...Object.values(sampleFarms[1])],
  [FARMER_1_ROW_ID, ...Object.values(sampleFarms[2])],
  [FARMER_2_ROW_ID, ...Object.values(sampleFarms[3])],
  [FARMER_2_ROW_ID, ...Object.values(sampleFarms[4])],
  [FARMER_2_ROW_ID, ...Object.values(sampleFarms[5])],
  [FARMER_3_ROW_ID, ...Object.values(sampleFarms[6])],
  [FARMER_3_ROW_ID, ...Object.values(sampleFarms[7])],
  [FARMER_3_ROW_ID, ...Object.values(sampleFarms[8])],
];

const farmsWS = XLSX.utils.aoa_to_sheet(farmsData);

// Style the header row for farms
const farmsRange = XLSX.utils.decode_range(farmsWS["!ref"]);
for (let col = farmsRange.s.c; col <= farmsRange.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  if (!farmsWS[cellAddress]) {
    continue;
  }
  farmsWS[cellAddress].s = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "E8F5E8" } },
    alignment: { horizontal: "center" },
  };
}

// Set column widths for farms sheet
farmsWS["!cols"] = [
  { wch: 10 }, // farmerRow
  { wch: 20 }, // farmName
  { wch: 10 }, // acreage
  { wch: 20 }, // cropType
  { wch: 12 }, // soilType
  { wch: 12 }, // locationLat
  { wch: 12 }, // locationLng
];

XLSX.utils.book_append_sheet(wb, farmsWS, "Farms");

// Create validation lists worksheet
const validationData = [
  ["Gender Options", "ID Types", "Soil Types", "Yes/No Options"],
  ["male", "ghana_card", "sandy", "Yes"],
  ["female", "voters_id", "clay", "No"],
  ["other", "passport", "loamy", ""],
  ["", "drivers_license", "silt", ""],
  ["", "", "rocky", ""],
];

const validationWS = XLSX.utils.aoa_to_sheet(validationData);

// Style validation headers
for (let col = 0; col < VALIDATION_COLUMNS_COUNT; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  if (!validationWS[cellAddress]) {
    continue;
  }
  validationWS[cellAddress].s = {
    font: { bold: true, sz: 12 },
    fill: { fgColor: { rgb: "FFF3E0" } },
    alignment: { horizontal: "center" },
  };
}

validationWS["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

XLSX.utils.book_append_sheet(wb, validationWS, "Validation Lists");

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, "..", "public", "templates");
const fs = require("node:fs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
const outputPath = path.join(outputDir, "farmer-bulk-upload-template.xlsx");
XLSX.writeFile(wb, outputPath);

console.log("✅ Farmer bulk upload template created successfully!");
console.log(`📁 File location: ${outputPath}`);
console.log("📊 Template includes:");
console.log("   • Instructions sheet with field validations");
console.log("   • Farmers sheet with sample data (3 farmers)");
console.log("   • Farms sheet with sample data (9 farms - 3 per farmer)");
console.log("   • Validation Lists sheet for dropdown values");
console.log("");
console.log("🎯 Features:");
console.log("   • Required fields marked with *");
console.log("   • Sample data for reference");
console.log("   • Field validation rules documented");
console.log("   • Proper formatting and column widths");
console.log("   • Color-coded headers");
