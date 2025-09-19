const XlsxPopulate = require("xlsx-populate");
const path = require("path");
const fs = require("fs");

async function createFarmerTemplate() {
  // Create a new workbook
  const workbook = await XlsxPopulate.fromBlankAsync();

  // Define validation lists
  const validationLists = {
    gender: ["male", "female", "other"],
    idType: ["ghana_card", "voters_id", "passport", "drivers_license"],
    soilType: ["sandy", "clay", "loamy", "silt", "rocky"],
    yesNo: ["Yes", "No"],
  };

  // Sample districts - using more generic names
  const sampleDistricts = [
    "Accra Metropolitan",
    "Kumasi Metropolitan",
    "Tamale Metropolitan",
    "Cape Coast Metropolitan",
    "Takoradi Municipal",
    "Ho Municipal",
    "Bolgatanga Municipal",
    "Wa Municipal",
  ];

  // Sample organizations - using simple names that can be created on-the-fly
  const sampleOrganizations = [
    "Demo Farmers Cooperative",
    "Test Agricultural Society",
    "Sample Farmers Union",
    "Example Agro Cooperative",
    "Trial Farmers Association",
    "Demo Agricultural Group",
  ];

  // Sample farmer data
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
      districtName: "Accra Metropolitan",
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
      districtName: "Kumasi Metropolitan",
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
      districtName: "Tamale Metropolitan",
      idType: "passport",
      idNumber: "P0012345",
      householdSize: 3,
      isLeader: "Yes",
      isPhoneSmart: "Yes",
      legacyFarmerId: "",
    },
  ];

  // Sample farms - updated to match the exact row numbers from the farmers sheet
  const sampleFarms = [
    // Farmer 1 farms (Kwame Asante - row 2 in sheet, but row 1 for farmer reference)
    {
      farmerRow: 2,
      farmName: "Main Cocoa Farm",
      acreage: 5.5,
      cropType: "Cocoa",
      soilType: "loamy",
      locationLat: 6.0769,
      locationLng: -0.8761,
    },
    {
      farmerRow: 2,
      farmName: "Rice Paddies",
      acreage: 2.3,
      cropType: "Rice",
      soilType: "clay",
      locationLat: 6.0785,
      locationLng: -0.8745,
    },
    {
      farmerRow: 2,
      farmName: "Vegetable Garden",
      acreage: 1.2,
      cropType: "Mixed Vegetables",
      soilType: "sandy",
      locationLat: 6.0801,
      locationLng: -0.8729,
    },

    // Farmer 2 farms (Akosua Mensah - row 3 in sheet, but row 2 for farmer reference)
    {
      farmerRow: 3,
      farmName: "Cassava Plantation",
      acreage: 8.7,
      cropType: "Cassava",
      soilType: "loamy",
      locationLat: 6.1234,
      locationLng: -0.789,
    },
    {
      farmerRow: 3,
      farmName: "Maize Field",
      acreage: 4.1,
      cropType: "Maize",
      soilType: "silt",
      locationLat: 6.125,
      locationLng: -0.7874,
    },
    {
      farmerRow: 3,
      farmName: "Plantain Grove",
      acreage: 3.6,
      cropType: "Plantain",
      soilType: "clay",
      locationLat: 6.1266,
      locationLng: -0.7858,
    },

    // Farmer 3 farms (Yaw Osei - row 4 in sheet, but row 3 for farmer reference)
    {
      farmerRow: 4,
      farmName: "Oil Palm Estate",
      acreage: 12.0,
      cropType: "Oil Palm",
      soilType: "loamy",
      locationLat: 6.21,
      locationLng: -0.65,
    },
    {
      farmerRow: 4,
      farmName: "Pepper Farm",
      acreage: 0.8,
      cropType: "Pepper",
      soilType: "sandy",
      locationLat: 6.2116,
      locationLng: -0.6484,
    },
    {
      farmerRow: 4,
      farmName: "Yam Farm",
      acreage: 6.2,
      cropType: "Yam",
      soilType: "rocky",
      locationLat: 6.2132,
      locationLng: -0.6468,
    },
  ];

  // =======================
  // 1. INSTRUCTIONS SHEET
  // =======================
  const instructionsSheet = workbook.activeSheet().name("Instructions");

  const instructionsData = [
    ["FARMER BULK UPLOAD TEMPLATE - INSTRUCTIONS"],
    [""],
    ["🚀 GETTING STARTED:"],
    ['1. Fill farmer details in the "Farmers" tab'],
    ['2. Fill corresponding farm details in the "Farms" tab'],
    ["3. Each farmer can have multiple farms"],
    ["4. Use dropdown menus for validation (where available)"],
    ["5. Required fields are marked with * in column headers"],
    ["6. Download this file, fill it out, then upload it back"],
    [""],
    ["📋 FIELD VALIDATION RULES:"],
    [""],
    ["FARMER FIELDS (Required fields marked with *):"],
    ["• firstName* - Text, minimum 1 character"],
    ["• lastName* - Text, minimum 1 character"],
    ["• phone* - International format (+233XXXXXXXXX)"],
    ["• email - Valid email address (optional)"],
    ["• dateOfBirth* - Date format: YYYY-MM-DD"],
    ["• gender* - Use dropdown: male, female, other"],
    ["• community* - Text, minimum 1 character"],
    ["• address* - Text, minimum 5 characters"],
    ["• districtName* - Full district name"],
    [
      "• idType* - Use dropdown: ghana_card, voters_id, passport, drivers_license",
    ],
    ["• idNumber* - Text, minimum 5 characters"],
    ["• householdSize - Positive whole number (optional)"],
    ["• isLeader - Use dropdown: Yes or No"],
    ["• isPhoneSmart - Use dropdown: Yes or No"],
    ["• legacyFarmerId - Previous system ID (optional)"],
    [""],
    ["FARM FIELDS (Required fields marked with *):"],
    [
      "• farmerRow* - Row number of corresponding farmer (2, 3, 4, etc. - header is row 1)",
    ],
    ["• farmName* - Text, minimum 1 character"],
    ["• acreage - Positive decimal number (optional)"],
    ["• cropType - Text description of crops (optional)"],
    ["• soilType - Use dropdown: sandy, clay, loamy, silt, rocky"],
    ["• locationLat - Latitude coordinate (optional, -90 to 90)"],
    ["• locationLng - Longitude coordinate (optional, -180 to 180)"],
    [""],
    ["🔗 LINKING FARMERS TO FARMS:"],
    ["Each farm must reference its farmer by Excel row number."],
    ["Example: If John Doe is in row 2 of Farmers sheet,"],
    ["his farms should have farmerRow = 2 in Farms sheet."],
    ["Note: Row 1 is the header, so first farmer is row 2."],
    [""],
    ["✅ DATA VALIDATION:"],
    ["Some fields have dropdown validation to prevent errors."],
    ["If you see a dropdown arrow, use it instead of typing."],
    [""],
    ["❓ NEED HELP?"],
    ["Check the sample data provided for reference."],
    ["Contact support if you encounter any issues."],
  ];

  // Populate instructions
  instructionsData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      instructionsSheet.cell(rowIndex + 1, colIndex + 1).value(cell);
    });
  });

  // Style the instructions sheet
  instructionsSheet
    .cell("A1")
    .style("bold", true)
    .style("fontSize", 16)
    .style("fill", "4A90E2");
  instructionsSheet.cell("A3").style("bold", true).style("fill", "E8F5E8");
  instructionsSheet.cell("A11").style("bold", true).style("fill", "E8F5E8");
  instructionsSheet.cell("A13").style("bold", true).style("fill", "FFF3E0");
  instructionsSheet.cell("A30").style("bold", true).style("fill", "FFF3E0");
  instructionsSheet.cell("A39").style("bold", true).style("fill", "E3F2FD");
  instructionsSheet.cell("A45").style("bold", true).style("fill", "F3E5F5");
  instructionsSheet.cell("A49").style("bold", true).style("fill", "FFEBEE");

  // Set column width for instructions
  instructionsSheet.column("A").width(80);

  // =======================
  // 2. FARMERS SHEET
  // =======================
  const farmersSheet = workbook.addSheet("Farmers");

  const farmerHeaders = [
    "firstName*",
    "lastName*",
    "phone*",
    "email",
    "dateOfBirth*",
    "gender*",
    "community*",
    "address*",
    "districtName*",
    "idType*",
    "idNumber*",
    "householdSize",
    "isLeader*",
    "isPhoneSmart*",
    "legacyFarmerId",
  ];

  // Set headers
  farmerHeaders.forEach((header, index) => {
    farmersSheet
      .cell(1, index + 1)
      .value(header)
      .style("bold", true)
      .style("fill", "E3F2FD")
      .style("horizontalAlignment", "center");
  });

  // Add sample data
  sampleFarmers.forEach((farmer, rowIndex) => {
    const dataRow = rowIndex + 2;
    farmersSheet.cell(dataRow, 1).value(farmer.firstName);
    farmersSheet.cell(dataRow, 2).value(farmer.lastName);
    farmersSheet.cell(dataRow, 3).value(farmer.phone);
    farmersSheet.cell(dataRow, 4).value(farmer.email);
    farmersSheet.cell(dataRow, 5).value(farmer.dateOfBirth);
    farmersSheet.cell(dataRow, 6).value(farmer.gender);
    farmersSheet.cell(dataRow, 7).value(farmer.community);
    farmersSheet.cell(dataRow, 8).value(farmer.address);
    farmersSheet.cell(dataRow, 9).value(farmer.districtName);
    farmersSheet.cell(dataRow, 10).value(farmer.idType);
    farmersSheet.cell(dataRow, 11).value(farmer.idNumber);
    farmersSheet.cell(dataRow, 12).value(farmer.householdSize);
    farmersSheet.cell(dataRow, 13).value(farmer.isLeader);
    farmersSheet.cell(dataRow, 14).value(farmer.isPhoneSmart);
    farmersSheet.cell(dataRow, 15).value(farmer.legacyFarmerId);
  });

  // Set column widths for farmers
  const farmerColumnWidths = [
    15, 15, 20, 25, 12, 10, 15, 25, 30, 30, 15, 18, 12, 10, 12, 15,
  ];
  farmerColumnWidths.forEach((width, index) => {
    farmersSheet.column(index + 1).width(width);
  });

  // Add data validation for farmers sheet
  // Gender validation (column F)
  farmersSheet.range("F2:F1000").dataValidation({
    type: "list",
    values: validationLists.gender,
  });

  // ID Type validation (column K)
  farmersSheet.range("K2:K1000").dataValidation({
    type: "list",
    values: validationLists.idType,
  });

  // Is Leader validation (column N)
  farmersSheet.range("N2:N1000").dataValidation({
    type: "list",
    values: validationLists.yesNo,
  });

  // Is Phone Smart validation (column O)
  farmersSheet.range("O2:O1000").dataValidation({
    type: "list",
    values: validationLists.yesNo,
  });

  // =======================
  // 3. FARMS SHEET
  // =======================
  const farmsSheet = workbook.addSheet("Farms");

  const farmHeaders = [
    "farmerRow*",
    "farmName*",
    "acreage",
    "cropType",
    "soilType",
    "locationLat",
    "locationLng",
  ];

  // Set headers
  farmHeaders.forEach((header, index) => {
    farmsSheet
      .cell(1, index + 1)
      .value(header)
      .style("bold", true)
      .style("fill", "E8F5E8")
      .style("horizontalAlignment", "center");
  });

  // Add sample farm data
  sampleFarms.forEach((farm, rowIndex) => {
    const dataRow = rowIndex + 2;
    farmsSheet.cell(dataRow, 1).value(farm.farmerRow);
    farmsSheet.cell(dataRow, 2).value(farm.farmName);
    farmsSheet.cell(dataRow, 3).value(farm.acreage);
    farmsSheet.cell(dataRow, 4).value(farm.cropType);
    farmsSheet.cell(dataRow, 5).value(farm.soilType);
    farmsSheet.cell(dataRow, 6).value(farm.locationLat);
    farmsSheet.cell(dataRow, 7).value(farm.locationLng);
  });

  // Set column widths for farms
  const farmColumnWidths = [12, 25, 12, 25, 12, 12, 12];
  farmColumnWidths.forEach((width, index) => {
    farmsSheet.column(index + 1).width(width);
  });

  // Add data validation for farms sheet
  // Soil Type validation (column E)
  farmsSheet.range("E2:E1000").dataValidation({
    type: "list",
    values: validationLists.soilType,
  });

  // =======================
  // 4. VALIDATION LISTS SHEET
  // =======================
  const validationSheet = workbook.addSheet("Validation Lists");

  // Create headers
  const validationHeaders = [
    "Gender Options",
    "ID Types",
    "Soil Types",
    "Yes/No Options",
    "Sample Districts",
    "Sample Organizations",
  ];
  validationHeaders.forEach((header, index) => {
    validationSheet
      .cell(1, index + 1)
      .value(header)
      .style("bold", true)
      .style("fill", "FFF3E0")
      .style("horizontalAlignment", "center");
  });

  // Populate validation data
  const maxRows = Math.max(
    validationLists.gender.length,
    validationLists.idType.length,
    validationLists.soilType.length,
    validationLists.yesNo.length,
    sampleDistricts.length,
    sampleOrganizations.length
  );

  for (let row = 0; row < maxRows; row++) {
    if (row < validationLists.gender.length) {
      validationSheet.cell(row + 2, 1).value(validationLists.gender[row]);
    }
    if (row < validationLists.idType.length) {
      validationSheet.cell(row + 2, 2).value(validationLists.idType[row]);
    }
    if (row < validationLists.soilType.length) {
      validationSheet.cell(row + 2, 3).value(validationLists.soilType[row]);
    }
    if (row < validationLists.yesNo.length) {
      validationSheet.cell(row + 2, 4).value(validationLists.yesNo[row]);
    }
    if (row < sampleDistricts.length) {
      validationSheet.cell(row + 2, 5).value(sampleDistricts[row]);
    }
    if (row < sampleOrganizations.length) {
      validationSheet.cell(row + 2, 6).value(sampleOrganizations[row]);
    }
  }

  // Set column widths for validation sheet
  validationHeaders.forEach((header, index) => {
    validationSheet.column(index + 1).width(25);
  });

  // Create output directory
  const outputDir = path.join(__dirname, "..", "public", "templates");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save the workbook
  const outputPath = path.join(
    outputDir,
    "farmer-bulk-upload-template-with-validation.xlsx"
  );
  await workbook.toFileAsync(outputPath);

  return outputPath;
}

// Run the function
createFarmerTemplate()
  .then((outputPath) => {
    console.log(
      "✅ Enhanced farmer bulk upload template created successfully!"
    );
    console.log(`📁 File location: ${outputPath}`);
    console.log("");
    console.log("📊 Template includes:");
    console.log(
      "   • 📖 Instructions sheet with comprehensive field documentation"
    );
    console.log("   • 👥 Farmers sheet with sample data (3 farmers)");
    console.log(
      "   • 🚜 Farms sheet with sample data (9 farms - 3 per farmer)"
    );
    console.log("   • 📋 Validation Lists sheet for reference");
    console.log("");
    console.log("🎯 Enhanced Features:");
    console.log("   • ✨ Excel dropdown validation for enum fields");
    console.log("   • 🎨 Color-coded headers for easy identification");
    console.log("   • 📏 Optimized column widths for readability");
    console.log("   • ⚠️  Required fields clearly marked with *");
    console.log("   • 📝 Comprehensive instructions and examples");
    console.log("   • 🔗 Clear farmer-to-farm relationship mapping");
    console.log("");
    console.log("🔧 Validation Rules Applied:");
    console.log("   • Gender: dropdown with male/female/other");
    console.log(
      "   • ID Type: dropdown with ghana_card/voters_id/passport/drivers_license"
    );
    console.log("   • Soil Type: dropdown with sandy/clay/loamy/silt/rocky");
    console.log("   • Yes/No fields: dropdown with Yes/No options");
    console.log("");
    console.log("🚀 Ready for production use!");
  })
  .catch((error) => {
    console.error("❌ Error creating template:", error);
  });
