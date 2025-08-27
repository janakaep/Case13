// actions/index.js - Main actions entry point

const documentProcessor = require('./documentProcessor');
const fraudDetection = require('./fraudDetection');
const complianceMonitor = require('./complianceMonitor');
const llmProcessor = require('./llmProcessor');
const reportGenerator = require('./reportGenerator');

module.exports = {
  // Document Processing
  processDocument: documentProcessor.processDocument,
  extractMedicalData: documentProcessor.extractMedicalData,
  validateDocument: documentProcessor.validateDocument,
  
  // Fraud Detection
  detectFraud: fraudDetection.detectFraud,
  analyzePatterns: fraudDetection.analyzePatterns,
  riskAssessment: fraudDetection.riskAssessment,
  
  // Compliance Monitoring
  monitorCompliance: complianceMonitor.monitorCompliance,
  auditProcess: complianceMonitor.auditProcess,
  generateComplianceReport: complianceMonitor.generateComplianceReport,
  
  // LLM Processing
  processWithLLM: llmProcessor.processWithLLM,
  generateResponse: llmProcessor.generateResponse,
  analyzeText: llmProcessor.analyzeText,
  
  // Report Generation
  generateReport: reportGenerator.generateReport,
  createDashboard: reportGenerator.createDashboard,
  exportResults: reportGenerator.exportResults,
  
  // System Status
  getSystemStatus: async () => {
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      activeConnections: 1,
      processedDocuments: Math.floor(Math.random() * 1000),
      systemHealth: 'excellent'
    };
  }
};
