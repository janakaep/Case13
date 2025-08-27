class SampleDataService {
  static getMedicalDocument() {
    return {
      patientName: "Sarah Johnson",
      dateOfBirth: "1985-03-15",
      medicaidId: "MD987654321",
      diagnosis: {
        primary: "Essential Hypertension (ICD-10: I10)",
        secondary: ["Type 2 Diabetes (ICD-10: E11.9)"]
      },
      procedures: [
        { name: "Office Visit", cpt: "99213", date: "2025-08-15" },
        { name: "Laboratory Work", cpt: "80053", date: "2025-08-15" }
      ],
      claimAmount: "$2,847.50",
      provider: {
        name: "Maryland General Hospital",
        npi: "1234567890"
      }
    };
  }

  static getFraudAlerts() {
    return [
      {
        alertId: 'FA-001',
        priority: 'HIGH',
        type: 'Billing Pattern',
        message: 'Unusual billing frequency detected',
        action: 'Investigation required'
      }
    ];
  }

  static getComplianceFindings() {
    return [
      {
        category: 'Documentation',
        status: 'COMPLIANT',
        score: 0.92,
        details: 'All documentation meets standards'
      }
    ];
  }
}

module.exports = SampleDataService;
