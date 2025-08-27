// Main Application JavaScript

class PinnacleAIDemo {
  constructor() {
    this.currentAction = 'processDocument';
    this.socket = null;
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.connectWebSocket();
    this.loadSystemStatus();
    this.startUptimeTimer();
  }

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveAction(item.dataset.action);
      });
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Run action button
    document.getElementById('run-action').addEventListener('click', () => {
      this.executeAction();
    });

    // File upload
    document.getElementById('file-input').addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files[0]);
    });

    // Export results
    document.getElementById('export-results').addEventListener('click', () => {
      this.exportResults();
    });

    // Clear results
    document.getElementById('clear-results').addEventListener('click', () => {
      this.clearResults();
    });

    // File drag and drop
    const uploadArea = document.querySelector('.file-upload-area');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#0070C0';
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#dee2e6';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#dee2e6';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });
  }

  setActiveAction(actionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-action="${actionName}"]`).classList.add('active');

    // Update title
    const title = this.getActionTitle(actionName);
    document.getElementById('current-action-title').textContent = title;

    this.currentAction = actionName;
  }

  getActionTitle(actionName) {
    const titles = {
      processDocument: 'Document Processing',
      extractMedicalData: 'Medical Data Extraction',
      validateDocument: 'Document Validation',
      detectFraud: 'Fraud Detection',
      analyzePatterns: 'Pattern Analysis',
      riskAssessment: 'Risk Assessment',
      monitorCompliance: 'Compliance Monitoring',
      auditProcess: 'Process Audit',
      generateComplianceReport: 'Compliance Report Generation',
      processWithLLM: 'LLM Processing',
      generateResponse: 'Response Generation',
      analyzeText: 'Text Analysis'
    };
    return titles[actionName] || actionName;
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  async executeAction() {
    try {
      const payload = this.getPayload();
      
      if (!payload) {
        this.showError('Please provide valid input');
        return;
      }

      this.setProgress(0, 'Initializing...');
      
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: this.currentAction,
          payload: payload
        })
      });

      const result = await response.json();

      if (result.success) {
        this.displayResults(result.result);
        this.setProgress(100, 'Complete');
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  // getPayload() {
  //   const activeTab = document.querySelector('.tab-content.active').id;
    
  //   switch (activeTab) {
  //     case 'json-tab':
  //       try {
  //         return JSON.parse(document.getElementById('json-input').value);
  //       } catch (e) {
  //         throw new Error('Invalid JSON format');
  //       }
      
  //     case 'file-tab':
  //       const fileInput = document.getElementById('file-input');
  //       if (fileInput.files[0]) {
  //         return { fileName: fileInput.files[0].name };
  //       }
  //       throw new Error('Please select a file');
      
  //     // case 'text-tab':
  //     //   const text = document.getElementById('text-input').value;
  //     //   if (!text.trim()) {
  //     //     throw new Error('Please enter text to process');
  //     //   }
  //     //   return { text: text.trim() };

  //     case 'text-tab':
  //       const text = document.getElementById('text-input').value;
  //       const taskType = document.getElementById('task-type').value;
  //       if (!text.trim()) {
  //         throw new Error('Please enter text to process');
  //       }
        
  //       // For generateResponse action, use 'prompt', for others use 'text'
  //       if (this.currentAction === 'generateResponse') {
  //         return { prompt: text.trim(), task: taskType };
  //       } else {
  //         return { text: text.trim(), task: taskType };
  //       }

        

      
  //     default:
  //       throw new Error('No input provided');
  //   }
  // }

  // Add PDF.js to your index.html first:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
// <script>pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';</script>

  // Replace your existing getPayload method with this corrected version:
  async getPayload() {
    const activeTab = document.querySelector('.tab-content.active');
    
    switch (activeTab.id) {
      case 'json-tab':
        try {
          const jsonValue = document.getElementById('json-input').value;
          return JSON.parse(jsonValue);
        } catch (e) {
          throw new Error('Invalid JSON format');
        }
        
      case 'file-tab':
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        
        if (file) {
          console.log('🔄 Processing uploaded file...', file.name);
          const extractedText = await this.handleFileUpload(file);
          
          if (extractedText && extractedText.trim().length > 0) {
            console.log('✅ File text extracted:', extractedText.length, 'characters');
            return { 
              text: extractedText.trim(),
              fileName: file.name,
              fileType: file.type 
            };
          } else {
            throw new Error('Could not extract text from the uploaded file');
          }
        }
        
        throw new Error('Please select a file to upload');
        
      case 'text-tab':
        const text = document.getElementById('text-input').value;
        const taskType = document.getElementById('task-type').value;
        
        if (!text.trim()) {
          throw new Error('Please enter text to process');
        }
        
        console.log('✅ Text input length:', text.trim().length);
        
        if (this.currentAction === 'generateResponse') {
          return { 
            prompt: text.trim(), 
            task: taskType 
          };
        } else {
          return { 
            text: text.trim(), 
            task: taskType 
          };
        }
        
      default:
        throw new Error('No input method selected');
    }
  }

  // Enhanced file upload handler with proper PDF text extraction:
  async handleFileUpload(file) {
    if (!file) return null;
    
    try {
      console.log('📄 Processing file:', file.name, file.type);
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        let fullText = '';
        
        console.log('📖 PDF has', pdf.numPages, 'pages');
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        const extractedText = fullText.trim();
        console.log('✅ Extracted text length:', extractedText.length);
        
        return extractedText;
      } else if (file.type === 'text/plain') {
        const textContent = await file.text();
        console.log('✅ Text file content length:', textContent.length);
        return textContent;
      } else {
        throw new Error('Unsupported file type: ' + file.type);
      }
    } catch (error) {
      console.error('❌ File extraction error:', error);
      throw new Error('Failed to extract text from file: ' + error.message);
    }
  }

  async executeAction() {
    try {
      console.log('🚀 Starting action:', this.currentAction); // DEBUG
      
      // IMPORTANT: Add await here since getPayload is now async
      const payload = await this.getPayload();
      console.log('📤 Sending payload:', payload); // DEBUG
      
      if (!payload) {
        this.showError('Please provide valid input');
        return;
      }

      this.setProgress(0, 'Initializing...');

      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actionName: this.currentAction, 
          payload: payload 
        })
      });

      const result = await response.json();
      console.log('📥 Received result:', result); // DEBUG

      if (result.success) {
        this.displayResults(result.result);
        this.setProgress(100, 'Complete');
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      console.error('❌ Action execution error:', error);
      this.showError(error.message);
    }
  }


  



  // Enhanced displayResults method in your PinnacleAIDemo class
  displayResults(result) {
    const container = document.getElementById('results-content');
    
    // Check if result has formatted output (for reports)
    if (result.formattedOutput) {
      container.innerHTML = result.formattedOutput;
      return;
    }
    
    // Create formatted display based on data type
    container.innerHTML = this.formatResultAsHTML(result);
  }

  // formatResultAsHTML(data) {
  //   if (!data || typeof data !== 'object') {
  //     return `<div class="result-error">No data to display</div>`;
  //   }

  //   let html = '<div class="result-container">';
    
  //   // Handle different response types
  //   if (data.scanId || data.fraudAlerts) {
  //     html += this.formatFraudDetection(data);
  //   } else if (data.extractedData) {
  //     html += this.formatDocumentProcessing(data);
  //   } else if (data.analysis || data.medicalConcepts) {
  //     html += this.formatTextAnalysis(data);
  //   } else if (data.reportId || data.executiveSummary) {
  //     html += this.formatReport(data);
  //   } else if (data.complianceScore || data.auditId) {
  //     html += this.formatCompliance(data);
  //   } else if (data.response || data.model) {
  //     html += this.formatLLMResponse(data);
  //   } else {
  //     html += this.formatGenericData(data);
  //   }
    
  //   html += '</div>';
  //   return html;
  // }

  // Replace your existing formatResultAsHTML method with this fixed version:
  formatResultAsHTML(data) {
    if (!data || typeof data !== 'object') {
      return `<pre class="json-formatted">${JSON.stringify(data, null, 2)}</pre>`;
    }

    // Helper function to safely display values
    function safeDisplay(value, fallback = 'Not specified') {
      if (value === null || value === undefined) return fallback;
      
      if (typeof value === 'string') return value;
      
      if (typeof value === 'object') {
        // Handle common object patterns
        if (value.name) return value.name;
        if (value.primary) return value.primary;
        if (value.description) return value.description;
        if (Array.isArray(value)) return value.join(', ');
        
        // Format object nicely
        try {
          return Object.entries(value)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        } catch (e) {
          return JSON.stringify(value);
        }
      }
      
      return String(value);
    }

    // Handle document processing results
    if (data.extractedData) {
      return `<div class="result-container">
        <div class="section-header">
          <h3><i class="fas fa-file-medical"></i> Extracted Medical Data</h3>
        </div>
        
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">Patient Name:</span>
            <span class="data-value">${safeDisplay(data.extractedData.patientName, 'Patient Name Not Found')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Date of Birth:</span>
            <span class="data-value">${safeDisplay(data.extractedData.dateOfBirth, 'DOB Not Found')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Medicaid ID:</span>
            <span class="data-value">${safeDisplay(data.extractedData.medicaidId, 'ID Not Found')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Diagnosis:</span>
            <span class="data-value">${safeDisplay(data.extractedData.diagnosis, 'Diagnosis Not Found')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Procedures:</span>
            <span class="data-value">${safeDisplay(data.extractedData.procedures, 'No procedures listed')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Claim Amount:</span>
            <span class="data-value">${safeDisplay(data.extractedData.claimAmount, '$0.00')}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Provider:</span>
            <span class="data-value">${safeDisplay(data.extractedData.provider, 'Provider Not Found')}</span>
          </div>
        </div>

        ${data.validation ? `
        <div class="section-header">
          <h3><i class="fas fa-shield-check"></i> Validation Results</h3>
        </div>
        <div class="validation-status ${data.validation.status === 'VALID' ? 'text-success' : 'text-warning'}">
          <strong>Status:</strong> ${data.validation.status}
        </div>
        ${data.validation.issues && data.validation.issues.length > 0 ? `
          <div class="alert alert-warning">
            <strong>Issues Found:</strong>
            <ul>${data.validation.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${data.validation.recommendations && data.validation.recommendations.length > 0 ? `
          <div class="alert alert-info">
            <strong>Recommendations:</strong>
            <ul>${data.validation.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ` : ''}
      </div>`;
    }

    // Handle other result types (fraud, compliance, etc.)
    return this.formatOtherResults(data, safeDisplay);
  }

  // Add this helper method for other result types
  formatOtherResults(data, safeDisplay) {
    // Handle fraud detection results
    if (data.fraudIndicators || data.riskScore !== undefined) {
      return `<div class="result-container">
        <div class="section-header">
          <h3><i class="fas fa-shield-alert"></i> Fraud Detection Results</h3>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.riskLevel || 'UNKNOWN'}</div>
            <div class="metric-label">Risk Level</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${Math.round((data.riskScore || 0) * 100)}%</div>
            <div class="metric-label">Risk Score</div>
          </div>
        </div>

        ${data.fraudIndicators && data.fraudIndicators.length > 0 ? `
          <div class="alerts-container">
            <h4>Fraud Indicators</h4>
            ${data.fraudIndicators.map(indicator => `
              <div class="alert alert-${indicator.severity === 'HIGH' ? 'danger' : 'warning'}">
                <div class="alert-header">
                  <strong>${indicator.type}</strong>
                  <span class="badge badge-${indicator.severity === 'HIGH' ? 'high' : 'medium'}">${indicator.severity}</span>
                </div>
                <p>${indicator.description}</p>
                <small><strong>Recommendation:</strong> ${indicator.recommendation}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.realTimeAlerts && data.realTimeAlerts.length > 0 ? `
          <div class="alerts-container">
            <h4>Real-time Alerts</h4>
            ${data.realTimeAlerts.map(alert => `
              <div class="alert alert-${alert.priority === 'HIGH' || alert.priority === 'CRITICAL' ? 'danger' : 'warning'}">
                <strong>${alert.type}:</strong> ${alert.message}
                <br><small>Action: ${alert.action}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>`;
    }

    // Default JSON display for unhandled types
    return `<pre class="json-formatted">${JSON.stringify(data, null, 2)}</pre>`;
  }


  formatFraudDetection(data) {
    let html = `
      <div class="section-header">
        <h3><i class="fas fa-shield-alt"></i> Fraud Detection Results</h3>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${data.totalClaimsAnalyzed?.toLocaleString() || 'N/A'}</div>
          <div class="metric-label">Claims Analyzed</div>
        </div>
        <div class="metric-card">
          <div class="metric-value text-warning">${data.suspiciousClaims || 0}</div>
          <div class="metric-label">Suspicious Claims</div>
        </div>
        <div class="metric-card">
          <div class="metric-value text-success">${data.potentialSavings || 'N/A'}</div>
          <div class="metric-label">Potential Savings</div>
        </div>
      </div>
    `;
    
    if (data.fraudAlerts && data.fraudAlerts.length > 0) {
      html += '<h4><i class="fas fa-exclamation-triangle"></i> Fraud Alerts</h4>';
      html += '<div class="alerts-container">';
      data.fraudAlerts.forEach(alert => {
        const priorityClass = alert.priority === 'HIGH' ? 'alert-danger' : 
                            alert.priority === 'MEDIUM' ? 'alert-warning' : 'alert-info';
        html += `
          <div class="alert ${priorityClass}">
            <div class="alert-header">
              <strong>${alert.type}</strong>
              <span class="badge badge-${alert.priority.toLowerCase()}">${alert.priority}</span>
            </div>
            <div class="alert-body">
              <p><strong>Provider:</strong> ${alert.provider}</p>
              <p><strong>Amount:</strong> ${alert.amount}</p>
              <p><strong>Description:</strong> ${alert.description}</p>
              <p><strong>Action:</strong> ${alert.recommendedAction}</p>
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${(alert.confidence * 100)}%"></div>
                <span class="confidence-text">${(alert.confidence * 100).toFixed(1)}% confidence</span>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
    
    return html;
  }

  formatDocumentProcessing(data) {
    let html = `
      <div class="section-header">
        <h3><i class="fas fa-file-medical"></i> Document Processing Results</h3>
      </div>
    `;
    
    if (data.extractedData) {
      html += `
        <div class="data-section">
          <h4>Extracted Medical Data</h4>
          <div class="data-grid">
            <div class="data-item">
              <span class="data-label">Patient Name:</span>
              <span class="data-value">${data.extractedData.patientName}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Date of Birth:</span>
              <span class="data-value">${data.extractedData.dateOfBirth}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Medicaid ID:</span>
              <span class="data-value highlight">${data.extractedData.medicaidId}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Diagnosis:</span>
              <span class="data-value">${data.extractedData.diagnosis}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Claim Amount:</span>
              <span class="data-value text-success">${data.extractedData.claimAmount}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Provider:</span>
              <span class="data-value">${data.extractedData.provider}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    if (data.validation) {
      const statusClass = data.validation.status === 'VALID' ? 'text-success' : 'text-warning';
      html += `
        <div class="data-section">
          <h4>Validation Results</h4>
          <div class="validation-status ${statusClass}">
            <i class="fas ${data.validation.status === 'VALID' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            Status: ${data.validation.status}
          </div>
          ${data.validation.recommendations ? `
            <div class="recommendations">
              <h5>Recommendations:</h5>
              <ul>
                ${data.validation.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    return html;
  }

  formatTextAnalysis(data) {
    let html = `
      <div class="section-header">
        <h3><i class="fas fa-brain"></i> Text Analysis Results</h3>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${data.textLength || data.inputLength || 'N/A'}</div>
          <div class="metric-label">Characters</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.wordCount || 'N/A'}</div>
          <div class="metric-label">Words</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${((data.confidence || 0) * 100).toFixed(1)}%</div>
          <div class="metric-label">Confidence</div>
        </div>
      </div>
    `;
    
    if (data.entities) {
      html += '<div class="entities-section"><h4>Extracted Entities</h4>';
      Object.entries(data.entities).forEach(([type, items]) => {
        if (items && items.length > 0) {
          html += `
            <div class="entity-group">
              <span class="entity-type">${type.toUpperCase()}:</span>
              ${items.map(item => `<span class="entity-tag">${item}</span>`).join('')}
            </div>
          `;
        }
      });
      html += '</div>';
    }
    
    if (data.medicalConcepts && data.medicalConcepts.length > 0) {
      html += '<div class="concepts-section"><h4>Medical Concepts</h4>';
      data.medicalConcepts.forEach(concept => {
        html += `
          <div class="concept-item">
            <span class="concept-term">${concept.term}</span>
            <span class="concept-confidence">${(concept.confidence * 100).toFixed(1)}%</span>
          </div>
        `;
      });
      html += '</div>';
    }
    
    if (data.summary) {
      html += `
        <div class="summary-section">
          <h4>Summary</h4>
          <p class="summary-text">${data.summary}</p>
        </div>
      `;
    }
    
    return html;
  }

  formatCompliance(data) {
    let html = `
      <div class="section-header">
        <h3><i class="fas fa-clipboard-check"></i> Compliance Results</h3>
      </div>
    `;
    
    if (data.overallComplianceScore !== undefined) {
      const score = (data.overallComplianceScore * 100).toFixed(1);
      const scoreClass = score >= 90 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-danger';
      html += `
        <div class="compliance-score ${scoreClass}">
          <div class="score-circle">
            <span class="score-value">${score}%</span>
          </div>
          <p>Overall Compliance Score</p>
        </div>
      `;
    }
    
    if (data.findings) {
      html += '<h4>Audit Findings</h4>';
      data.findings.forEach(finding => {
        const statusClass = finding.status === 'COMPLIANT' ? 'alert-success' : 'alert-warning';
        html += `
          <div class="alert ${statusClass}">
            <h5>${finding.category}</h5>
            <p><strong>Status:</strong> ${finding.status}</p>
            <p>${finding.details}</p>
          </div>
        `;
      });
    }
    
    return html;
  }

  formatLLMResponse(data) {
    return `
      <div class="section-header">
        <h3><i class="fas fa-robot"></i> LLM Response</h3>
      </div>
      <div class="llm-response">
        <div class="response-content">
          ${data.response || 'No response generated'}
        </div>
        <div class="response-meta">
          <span class="badge badge-info">Model: ${data.model || 'Unknown'}</span>
          <span class="badge badge-success">Confidence: ${((data.confidence || 0) * 100).toFixed(1)}%</span>
          ${data.processingTime ? `<span class="badge badge-secondary">${data.processingTime}s</span>` : ''}
        </div>
      </div>
    `;
  }

  formatGenericData(data) {
    return `
      <div class="section-header">
        <h3><i class="fas fa-data"></i> Processing Results</h3>
      </div>
      <div class="json-formatted">
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }

  // formatReport(data) {
  //   let html = `
  //     <div class="section-header">
  //       <h3><i class="fas fa-chart-bar"></i> Comprehensive Report</h3>
  //     </div>
  //   `;
    
  //   // Executive Summary Section
  //   if (data.executiveSummary) {
  //     html += `
  //       <div class="data-section">
  //         <h4><i class="fas fa-clipboard-list"></i> Executive Summary</h4>
  //         <div class="metrics-grid">
  //     `;
      
  //     Object.entries(data.executiveSummary).forEach(([key, value]) => {
  //       const isNumeric = !isNaN(parseFloat(value));
  //       const displayValue = isNumeric ? parseFloat(value).toLocaleString() : value;
  //       const colorClass = key.toLowerCase().includes('efficiency') || key.toLowerCase().includes('prevented') ? 'text-success' : '';
        
  //       html += `
  //         <div class="metric-card">
  //           <div class="metric-value ${colorClass}">${displayValue}</div>
  //           <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
  //         </div>
  //       `;
  //     });
      
  //     html += '</div></div>';
  //   }
    
  //   // Key Metrics Section
  //   if (data.keyMetrics) {
  //     html += '<div class="data-section"><h4><i class="fas fa-tachometer-alt"></i> Key Performance Metrics</h4>';
      
  //     Object.entries(data.keyMetrics).forEach(([category, metrics]) => {
  //       html += `
  //         <div class="metric-category">
  //           <h5>${category.charAt(0).toUpperCase() + category.slice(1)}</h5>
  //           <div class="metric-items">
  //       `;
        
  //       Object.entries(metrics).forEach(([key, value]) => {
  //         const statusClass = key.toLowerCase().includes('success') || key.toLowerCase().includes('accuracy') ? 'text-success' :
  //                           key.toLowerCase().includes('error') ? 'text-danger' : '';
  //         html += `
  //           <div class="metric-item">
  //             <span class="metric-name">${key.replace(/([A-Z])/g, ' $1').trim()}:</span>
  //             <span class="metric-data ${statusClass}">${value}</span>
  //           </div>
  //         `;
  //       });
        
  //       html += '</div></div>';
  //     });
      
  //     html += '</div>';
  //   }
    
  //   // Alerts Section
  //   if (data.alerts && data.alerts.length > 0) {
  //     html += '<div class="data-section"><h4><i class="fas fa-bell"></i> System Alerts</h4>';
  //     data.alerts.forEach(alert => {
  //       const alertClass = alert.type === 'WARNING' ? 'alert-warning' : 
  //                         alert.type === 'ERROR' ? 'alert-danger' : 'alert-info';
  //       html += `
  //         <div class="alert ${alertClass}">
  //           <strong>${alert.type}:</strong> ${alert.message}
  //           <small class="alert-time">${new Date(alert.timestamp).toLocaleString()}</small>
  //         </div>
  //       `;
  //     });
  //     html += '</div>';
  //   }
    
  //   // Recommendations Section
  //   if (data.recommendations && data.recommendations.length > 0) {
  //     html += `
  //       <div class="data-section">
  //         <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
  //         <ul class="recommendations-list">
  //     `;
  //     data.recommendations.forEach(rec => {
  //       html += `<li><i class="fas fa-check-circle text-success"></i> ${rec}</li>`;
  //     });
  //     html += '</ul></div>';
  //   }
    
  //   // Next Actions Section
  //   if (data.nextActions && data.nextActions.length > 0) {
  //     html += `
  //       <div class="data-section">
  //         <h4><i class="fas fa-tasks"></i> Next Actions</h4>
  //         <ul class="actions-list">
  //     `;
  //     data.nextActions.forEach(action => {
  //       html += `<li><i class="fas fa-arrow-right text-primary"></i> ${action}</li>`;
  //     });
  //     html += '</ul></div>';
  //   }
    
  //   return html;
  // }

 
  // displayResults(result) {
  //   const container = document.getElementById('results-content');
  //   container.innerHTML = `
  //     <div class="result-json">${JSON.stringify(result, null, 2)}</div>
  //   `;
  // }
  formatReport(data) {
    let html = `
      <div class="section-header">
        <h3><i class="fas fa-clipboard-check"></i> Compliance Report</h3>
      </div>
    `;
    
    // Handle Compliance Report Structure
    if (data.overallComplianceScore !== undefined) {
      const score = (data.overallComplianceScore * 100).toFixed(1);
      const scoreClass = score >= 90 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-danger';
      
      html += `
        <div class="data-section">
          <h4><i class="fas fa-tachometer-alt"></i> Overall Compliance Score</h4>
          <div class="compliance-overview">
            <div class="score-display ${scoreClass}">
              <span class="score-number">${score}%</span>
              <span class="score-status">${data.status || 'Unknown'}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Show Regulation Details
    if (data.regulationDetails && data.regulationDetails.length > 0) {
      html += `
        <div class="data-section">
          <h4><i class="fas fa-list-check"></i> Regulation Details</h4>
          <div class="regulations-grid">
      `;
      
      data.regulationDetails.forEach(reg => {
        const regScore = (reg.score * 100).toFixed(1);
        const statusClass = reg.status === 'FULLY_COMPLIANT' ? 'alert-success' : 
                          reg.status === 'SUBSTANTIALLY_COMPLIANT' ? 'alert-warning' : 'alert-danger';
        
        html += `
          <div class="regulation-card ${statusClass}">
            <div class="regulation-header">
              <h5>${reg.regulation}</h5>
              <span class="regulation-score">${regScore}%</span>
            </div>
            <div class="regulation-body">
              <p><strong>Status:</strong> ${reg.status}</p>
              <p><strong>Last Audit:</strong> ${reg.lastAudit || 'N/A'}</p>
              <p><strong>Issues:</strong> ${reg.issues || 0}</p>
              <p><strong>Controls:</strong> ${reg.controls || 'N/A'}</p>
            </div>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    // Show Action Items  
    if (data.actionItems && data.actionItems.length > 0) {
      html += `
        <div class="data-section">
          <h4><i class="fas fa-tasks"></i> Action Items</h4>
          <div class="action-items">
      `;
      
      data.actionItems.forEach(item => {
        const priorityClass = item.priority === 'HIGH' ? 'priority-high' : 
                            item.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low';
        
        html += `
          <div class="action-item ${priorityClass}">
            <div class="action-priority">${item.priority}</div>
            <div class="action-content">
              <p><strong>${item.description}</strong></p>
              <p><small>Due: ${item.dueDate || 'No deadline set'} | Owner: ${item.owner || 'Unassigned'}</small></p>
            </div>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    // Show Audit Process Results (if present)
    if (data.findings && data.findings.length > 0) {
      html += `
        <div class="data-section">
          <h4><i class="fas fa-search"></i> Audit Findings</h4>
      `;
      
      data.findings.forEach(finding => {
        const findingClass = finding.status === 'COMPLIANT' ? 'alert-success' : 'alert-warning';
        
        html += `
          <div class="alert ${findingClass}">
            <h5>${finding.category}</h5>
            <p><strong>Status:</strong> ${finding.status}</p>
            <p><strong>Score:</strong> ${(finding.score * 100).toFixed(1)}%</p>
            <p>${finding.details}</p>
            ${finding.recommendations ? `
              <div class="finding-recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  ${finding.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    // Show Next Review Date
    if (data.nextReviewDate || data.nextAuditDue) {
      const nextDate = data.nextReviewDate || data.nextAuditDue;
      html += `
        <div class="data-section">
          <h4><i class="fas fa-calendar"></i> Next Review</h4>
          <p class="next-review-date">${new Date(nextDate).toLocaleDateString()}</p>
        </div>
      `;
    }
    
    // Handle Executive Summary (for general reports)
    if (data.executiveSummary) {
      html += `
        <div class="data-section">
          <h4><i class="fas fa-clipboard-list"></i> Executive Summary</h4>
          <div class="metrics-grid">
      `;
      
      Object.entries(data.executiveSummary).forEach(([key, value]) => {
        html += `
          <div class="metric-card">
            <div class="metric-value">${value}</div>
            <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    return html;
  }




  setProgress(percent, message) {
    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-text').textContent = message;
  }

  showError(message) {
    const container = document.getElementById('results-content');
    container.innerHTML = `
      <div class="error-message" style="color: #dc3545; padding: 1rem; background: #f8d7da; border-radius: 6px;">
        <i class="fas fa-exclamation-triangle"></i> ${message}
      </div>
    `;
    this.setProgress(0, 'Error occurred');
  }

  // handleFileUpload(file) {
  //   if (file) {
  //     document.querySelector('.upload-prompt p').textContent = `Selected: ${file.name}`;
  //   }
  // }
  // Replace your existing handleFileUpload method with this corrected version
  // async handleFileUpload(file) {
  //   if (!file) return null;
    
  //   try {
  //     console.log('📄 Processing file:', file.name, file.type); // DEBUG
      
  //     if (file.type === 'application/pdf') {
  //       // Extract text from PDF using PDF.js
  //       const arrayBuffer = await file.arrayBuffer();
  //       const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
  //       let fullText = '';
        
  //       console.log('📖 PDF has', pdf.numPages, 'pages'); // DEBUG
        
  //       for (let i = 1; i <= pdf.numPages; i++) {
  //         const page = await pdf.getPage(i);
  //         const textContent = await page.getTextContent();
  //         const pageText = textContent.items.map(item => item.str).join(' ');
  //         fullText += pageText + ' ';
  //       }
        
  //       const extractedText = fullText.trim();
  //       console.log('✅ Extracted text length:', extractedText.length); // DEBUG
  //       console.log('📝 First 200 chars:', extractedText.substring(0, 200)); // DEBUG
        
  //       return extractedText;
  //     } else if (file.type === 'text/plain') {
  //       // Handle text files
  //       const textContent = await file.text();
  //       console.log('✅ Text file content length:', textContent.length); // DEBUG
  //       return textContent;
  //     } else {
  //       console.warn('⚠️ Unsupported file type:', file.type);
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('❌ File extraction error:', error);
  //     return null;
  //   }
  // }


  exportResults() {
    const resultsContent = document.getElementById('results-content').textContent;
    if (resultsContent && !resultsContent.includes('Results will appear here')) {
      const blob = new Blob([resultsContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinnacle-results-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  clearResults() {
    const container = document.getElementById('results-content');
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-chart-line"></i>
        <p>Results will appear here after processing</p>
      </div>
    `;
    this.setProgress(0, 'Ready to process');
  }

  connectWebSocket() {
    try {
      this.socket = new WebSocket('ws://localhost:8080');
      
      this.socket.onopen = () => {
        this.addLog('Connected to real-time updates');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.socket.onclose = () => {
        this.addLog('Disconnected from real-time updates');
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket connection failed:', error);
      };
    } catch (error) {
      console.warn('WebSocket not available:', error);
    }
  }

  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'progress':
        if (data.data.progress !== undefined) {
          this.setProgress(data.data.progress, data.data.step || 'Processing...');
        }
        break;
      
      case 'status':
        this.addLog(data.message);
        break;
      
      case 'complete':
        this.addLog(data.message);
        break;
      
      case 'error':
        this.addLog(`Error: ${data.message}`, 'error');
        break;
    }
  }

  addLog(message, type = 'info') {
    const container = document.getElementById('logs-container');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
      <span class="timestamp">${timestamp}</span>
      <span class="message">${message}</span>
    `;
    
    container.appendChild(logEntry);
    container.scrollTop = container.scrollHeight;

    // Keep only last 50 logs
    while (container.children.length > 50) {
      container.removeChild(container.firstChild);
    }
  }

  async loadSystemStatus() {
    try {
      const response = await fetch('/api/status');
      const status = await response.json();
      
      document.getElementById('system-status').textContent = status.status;
      document.getElementById('docs-processed').textContent = status.processedDocuments || 0;
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  }

  // Add this method to your existing PinnacleAIDemo class in static/js/app.js

  // displayResults(result) {
  //   const container = document.getElementById('results-content');
    
  //   // Check if result has formatted output (for reports)
  //   if (result.formattedOutput) {
  //     container.innerHTML = result.formattedOutput;
  //   } else {
  //     // Pretty format JSON for other results
  //     container.innerHTML = `
  //       <div class="result-formatted">
  //         <pre class="json-formatted">${JSON.stringify(result, null, 2)}</pre>
  //       </div>
  //     `;
  //   }
  // }


  startUptimeTimer() {
    const startTime = Date.now();
    
    setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      document.getElementById('system-uptime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new PinnacleAIDemo();
});
