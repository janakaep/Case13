const documentProcessor = require('./actions/documentProcessor');

async function testExtractionFlow() {
  console.log('🧪 Testing Document Processing Flow\n');

  const testCases = [
    {
      name: "Simple Patient Data",
      text: "Patient: John Smith, DOB: 1985-03-15, Medicaid ID: MD123456789, Diagnosis: Essential Hypertension, Provider: Maryland General Hospital, Claim: $1,500.00"
    },
    {
      name: "Complex Medical Record", 
      text: `
        PATIENT INFORMATION
        Name: Sarah Johnson
        Date of Birth: March 15, 1985
        Medicaid Member ID: MD987654321
        
        CLINICAL NOTES
        Primary Diagnosis: Essential Hypertension (ICD-10: I10)
        Secondary Diagnosis: Type 2 Diabetes Mellitus
        
        PROCEDURES PERFORMED
        - Office Visit (CPT: 99213)
        - Basic Metabolic Panel (CPT: 80048)
        
        PROVIDER: Baltimore Medical Associates
        TOTAL CLAIM AMOUNT: $2,847.50
      `
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`Input: ${testCase.text.substring(0, 100)}...`);
    
    try {
      const result = await documentProcessor.processDocument({ 
        text: testCase.text 
      }, (progress) => console.log(`  Progress: ${progress.step} - ${progress.progress}%`));
      
      console.log('\n✅ Extraction Results:');
      console.log(`  Patient: ${result.extractedData.patientName}`);
      console.log(`  DOB: ${result.extractedData.dateOfBirth}`);
      console.log(`  Medicaid ID: ${result.extractedData.medicaidId}`);
      console.log(`  Diagnosis: ${result.extractedData.diagnosis}`);
      console.log(`  Procedures: ${JSON.stringify(result.extractedData.procedures)}`);
      console.log(`  Amount: ${result.extractedData.claimAmount}`);
      console.log(`  Provider: ${result.extractedData.provider}`);
      console.log(`  Confidence: ${(result.extractedData.confidence * 100).toFixed(1)}%`);
      console.log(`  Processing: ${result.extractedData.processingSource}`);
      console.log(`  Validation: ${result.validation.status}`);
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  console.log('\n🎯 Testing complete!');
}

testExtractionFlow();
