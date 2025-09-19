# Template and Bulk Processing Validation

## Template Structure Analysis

### Generated Template Headers:

**Farmers Sheet:**

- Column A: firstName\*
- Column B: lastName\*
- Column C: phone\*
- Column D: email
- Column E: dateOfBirth\*
- Column F: gender\*
- Column G: community\*
- Column H: address\*
- Column I: districtName\*
- Column J: organizationName\*
- Column K: idType\*
- Column L: idNumber\*
- Column M: householdSize
- Column N: isLeader\*
- Column O: isPhoneSmart\*
- Column P: legacyFarmerId

**Farms Sheet:**

- Column A: farmerRow\*
- Column B: farmName\*
- Column C: acreage
- Column D: cropType
- Column E: soilType
- Column F: locationLat
- Column G: locationLng

### Parsing Logic Validation:

The bulk upload parsing logic correctly:

1. ✅ Parses farmers from row index 1+ (skipping header)
2. ✅ Sets rowNumber as i+1 (Excel row number)
3. ✅ Maps farmer data to correct columns (0-15)
4. ✅ Handles farm linking by Excel row number
5. ✅ Validates numeric data with isNaN checks
6. ✅ Converts boolean fields (Yes/No to true/false)
7. ✅ Handles empty cells correctly

### tRPC Endpoint Compatibility:

The processed data format matches the tRPC schema:

- ✅ firstName, lastName (required strings)
- ✅ gender enum: "male" | "female" | "other"
- ✅ dateOfBirth as string, converted to Date in frontend
- ✅ phone as optional string
- ✅ idType enum matches exactly
- ✅ organizationId mapped from organizationName
- ✅ districtId mapped from districtName
- ✅ Farm data structure matches schema
- ✅ Numeric fields properly handled (acreage, coordinates)

### Key Improvements Made:

1. **Farm Row Mapping**: Updated template to use actual Excel row numbers (2, 3, 4...)
2. **Data Validation**: Added isNaN checks for numeric fields
3. **Boolean Conversion**: Proper Yes/No to boolean conversion
4. **Organization/District Mapping**: Helper functions to map names to IDs
5. **Error Handling**: Better error messages with row numbers
6. **Template Instructions**: Clear documentation on row numbering

## Test Recommendations:

1. Download the generated template
2. Fill with test data
3. Upload and verify parsing
4. Check organization/district mapping
5. Verify farm creation with coordinates
6. Test validation error handling
