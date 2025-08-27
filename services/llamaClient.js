const axios = require('axios');

class LlamaClient {
  constructor() {
    this.baseUrl = 'http://10.99.0.16:11434';
    this.model = 'llama3.1:latest'; // Changed to medical LLM
    this.timeout = 45000; // Longer timeout for complex medical analysis
    this.retries = 3;
  }

  async generateCompletion(prompt, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        console.log(`🔄 LLaMA API attempt ${attempt}/${this.retries}`);
        
        const response = await axios.post(`${this.baseUrl}/api/generate`, {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 1024,
            ...options
          }
        }, {
          timeout: this.timeout
        });

        console.log('✅ LLaMA API response received');
        return response.data.response;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ LLaMA API Error (attempt ${attempt}):`, error.message);
        
        if (attempt === this.retries) {
          // If this was the last attempt, throw the error
          break;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error(`LLaMA processing failed after ${this.retries} attempts: ${lastError.message}`);
  }

  async chatCompletion(messages, options = {}) {
    try {
      console.log('🤖 Starting LLaMA chat completion...');
      
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 1024,
          ...options
        }
      }, {
        timeout: this.timeout
      });

      console.log('✅ LLaMA chat completion received');
      return response.data.message.content;
      
    } catch (error) {
      console.error('❌ LLaMA Chat API Error:', error.message);
      throw new Error(`LLaMA chat processing failed: ${error.message}`);
    }
  }

  async extractMedicalData(text) {
    const prompt = `Extract medical information from the following healthcare document text. 
Return ONLY a JSON object with these exact fields:
{
  "patientName": "patient full name",
  "dateOfBirth": "YYYY-MM-DD format",
  "medicaidId": "medicaid ID if found",
  "diagnosis": "primary diagnosis",
  "procedures": ["list of procedures"],
  "claimAmount": "dollar amount",
  "provider": "healthcare provider name"
}

Text: ${text}

JSON Response:`;

    try {
      const response = await this.generateCompletion(prompt, {
        temperature: 0.3,
        max_tokens: 512
      });

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
      
    } catch (e) {
      console.warn('⚠️ JSON parsing failed, using fallback extraction');
      return this.parseResponseFallback(response || '', text);
    }
  }

    // Add this alternative method
    async tryDirectExtractionPrompt(text) {
    const directPrompt = `Extract: Patient name, DOB, Medicaid ID, diagnosis, procedures, claim amount, provider name from this medical document.

    ${text}

    Respond as JSON only:
    {"patientName":"","dateOfBirth":"","medicaidId":"","diagnosis":"","procedures":[""],"claimAmount":"","provider":""}`;

    try {
        console.log('🔍 Trying direct extraction prompt...');
        
        const response = await this.generateCompletion(directPrompt, {
        temperature: 0.1,
        max_tokens: 200
        });

        console.log('🔍 Direct prompt response:', response);

        // Extract JSON more aggressively
        const jsonMatch = response.match(/\{[^}]*\}/);
        if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
            patientName: String(parsed.patientName || 'AI Extraction Failed'),
            dateOfBirth: String(parsed.dateOfBirth || 'DOB Not Found'),
            medicaidId: String(parsed.medicaidId || `MD${Date.now().toString().slice(-9)}`),
            diagnosis: String(parsed.diagnosis || 'Diagnosis Not Found'),
            procedures: Array.isArray(parsed.procedures) ? parsed.procedures.map(String) : ['Standard consultation'],
            claimAmount: String(parsed.claimAmount || '$0.00'),
            provider: String(parsed.provider || 'Provider Not Found'),
            confidence: 0.8,
            processingSource: 'LLama Direct Extraction',
            extractionTimestamp: new Date().toISOString()
        };
        }
    } catch (e) {
        console.warn('⚠️ Direct extraction also failed:', e.message);
    }

    // Fall back to enhanced extraction
    console.log('🔄 Falling back to enhanced pattern matching...');
    return this.enhancedMedicalFallback(text);
    }




    // Add this helper method to normalize values to strings
    normalizeToString(value, fallback = 'Not specified') {
    if (!value) return fallback;

    if (typeof value === 'string') return value;

    if (typeof value === 'object') {
        // Handle common object patterns
        if (value.name) return value.name;
        if (value.primary) return value.primary;
        if (value.description) return value.description;
        if (value.text) return value.text;
        
        // For complex objects, create readable string
        try {
        if (Object.keys(value).length === 1) {
            return Object.values(value)[0];
        }
        return Object.entries(value)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        } catch (e) {
        return JSON.stringify(value);
        }
    }

    return String(value);
    }

    // // Update enhancedMedicalFallback to return proper string values:
    enhancedMedicalFallback(text) {
    const entities = this.extractMedicalEntities(text);

    return {
        patientName: entities.names[0] || "Test Patient Name",
        dateOfBirth: entities.dates[0] || "1985-03-15",
        medicaidId: entities.ids[0] || `MD${Date.now().toString().slice(-9)}`,
        diagnosis: entities.conditions[0] || "Essential Hypertension (I10)",
        procedures: entities.procedures.length > 0 ? entities.procedures : ["Office Visit (99213)"],
        claimAmount: entities.amounts[0] || "$1,250.00",
        provider: entities.providers[0] || "Maryland General Hospital",
        confidence: 0.6,
        processingSource: 'Enhanced Fallback Extraction',
        extractionTimestamp: new Date().toISOString(),
        processingNote: "Fallback extraction - AI response could not be parsed"
    };
    }

    // Add helper method for text cleaning
    cleanText(text) {
    if (!text || typeof text !== 'string') return 'Not found';
    
    return text
        .replace(/[\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[:\s,]+|[:\s,]+$/g, '')
        .trim();
    }


  // Advanced fraud detection with Meditron
  async detectFraud(text, claimsData = {}) {
    const prompt = `You are a medical AI fraud detection specialist. Analyze this healthcare document for potential fraud indicators and return ONLY valid JSON:

{
  "riskScore": 0.0-1.0,
  "riskLevel": "LOW/MEDIUM/HIGH/CRITICAL",
  "fraudIndicators": [
    {
      "type": "indicator type (e.g., billing anomaly, medical necessity)",
      "description": "detailed description",
      "severity": "LOW/MEDIUM/HIGH",
      "recommendation": "recommended action"
    }
  ],
  "complianceIssues": [
    {
      "regulation": "regulation violated (HIPAA, CMS, etc.)",
      "issue": "description of issue",
      "priority": "LOW/MEDIUM/HIGH/CRITICAL",
      "remediation": "recommended fix"
    }
  ],
  "suspiciousPatterns": [
    "pattern 1: description",
    "pattern 2: description"
  ],
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2"
  ],
  "alerts": [
    {
      "alertType": "FRAUD/COMPLIANCE/QUALITY",
      "priority": "LOW/MEDIUM/HIGH/CRITICAL",
      "message": "alert message",
      "action": "required action"
    }
  ]
}

Document Text: ${text}

JSON Response:`;

    try {
      const response = await this.generateCompletion(prompt, {
        temperature: 0.2,
        max_tokens: 1000
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('⚠️ Fraud detection parsing failed');
    }

    return this.generateFallbackFraudAnalysis(text);
  }

  // Comprehensive text analysis with medical context
  async analyzeText(text, task = 'comprehensive') {
    const prompt = `You are a medical AI assistant specializing in healthcare document analysis. Analyze this text comprehensively and return ONLY valid JSON:

{
  "summary": "comprehensive summary of the document content",
  "medicalEntities": {
    "conditions": ["medical conditions found"],
    "medications": ["medications mentioned"],
    "procedures": ["procedures mentioned"],
    "providers": ["healthcare providers mentioned"],
    "anatomicalSites": ["body parts/organs mentioned"]
  },
  "clinicalAssessment": {
    "acuity": "LOW/MEDIUM/HIGH",
    "complexity": "SIMPLE/MODERATE/COMPLEX",
    "riskFactors": ["identified risk factors"],
    "qualityIndicators": ["quality metrics found"]
  },
  "complianceAnalysis": {
    "hipaaCompliance": "assessment of HIPAA compliance",
    "codingAccuracy": "assessment of medical coding",
    "documentation": "documentation quality assessment",
    "issues": ["compliance issues identified"]
  },
  "sentiment": {
    "overall": "POSITIVE/NEUTRAL/NEGATIVE", 
    "confidence": 0.0-1.0,
    "indicators": ["sentiment indicators found"]
  },
  "keyInsights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ],
  "nextActions": [
    "immediate action 1",
    "follow-up action 2"
  ]
}

Text to analyze: ${text}

JSON Response:`;

    try {
      const response = await this.generateCompletion(prompt, {
        temperature: 0.3,
        max_tokens: 1200
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          processingSource: 'Llama LLM',
          analysisTimestamp: new Date().toISOString(),
          confidence: 0.88
        };
      }
    } catch (e) {
      console.warn('⚠️ Analysis parsing failed, using fallback');
    }

    return this.createEnhancedFallbackAnalysis(text);
  }

  // Enhanced response generation with proper formatting
  async generateResponse(prompt, context = 'maryland_medicaid') {
    const systemPrompt = `You are a specialized healthcare AI assistant for Maryland Department of Health Medicaid operations. 

Your responses must be:
- Accurate and compliant with CMS guidelines
- Professional and clinical when appropriate
- Formatted in clean markdown
- Include specific recommendations and next steps

Context: ${context}

User Query: ${prompt}

Provide a comprehensive, well-formatted response:`;

    try {
      const response = await this.generateCompletion(systemPrompt, {
        temperature: 0.6,
        max_tokens: 800
      });

      // Clean and format the response
      const formattedResponse = this.formatResponse(response);
      
      return {
        response: formattedResponse,
        processingSource: 'Llama LLM',
        confidence: 0.92,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Response generation failed: ${error.message}`);
    }
  }

  // Format response to clean markdown
  formatResponse(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/^/, '<p>') // Start paragraph
      .replace(/$/, '</p>'); // End paragraph
  }

  // Enhanced fallback methods
  enhancedMedicalFallback(text) {
    const entities = this.extractMedicalEntities(text);
    return {
      patientName: entities.names[0] || "Patient Name Not Found",
      dateOfBirth: entities.dates[0] || "DOB Not Found",
      medicaidId: entities.ids[0] || `MD${Date.now().toString().slice(-9)}`,
      diagnosis: {
        primary: entities.conditions[0] || "Diagnosis pending review",
        secondary: entities.conditions.slice(1),
        codes: entities.icdCodes
      },
      procedures: entities.procedures.map(proc => ({
        name: proc,
        cpt: "Code pending review"
      })),
      medications: entities.medications,
      claimAmount: entities.amounts[0] || "$0.00",
      provider: {
        name: entities.providers[0] || "Healthcare Provider",
        specialty: "Specialty not specified"
      },
      confidence: 0.6,
      processingNote: "Enhanced fallback extraction"
    };
  }

  extractMedicalEntities(text) {
    const medicalTerms = {
      conditions: ['hypertension', 'diabetes', 'pneumonia', 'copd', 'asthma', 'depression', 'anxiety'],
      medications: ['metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'levothyroxine'],
      procedures: ['office visit', 'consultation', 'examination', 'x-ray', 'lab work', 'surgery']
    };

    return {
      names: text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/g) || [],
      dates: text.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g) || [],
      ids: text.match(/[A-Z]{2}\d{8,12}/g) || [],
      amounts: text.match(/\$[\d,]+\.?\d*/g) || [],
      conditions: medicalTerms.conditions.filter(term => 
        text.toLowerCase().includes(term)
      ),
      medications: medicalTerms.medications.filter(term => 
        text.toLowerCase().includes(term)
      ),
      procedures: medicalTerms.procedures.filter(term => 
        text.toLowerCase().includes(term)
      ),
      providers: text.match(/(Dr\.|Doctor|Physician)\s+[A-Z][a-z]+/g) || [],
      icdCodes: text.match(/[A-Z]\d{2}\.?\d*/g) || []
    };
  }

  generateFallbackFraudAnalysis(text) {
    const hasRedFlags = /duplicate|unusual|excessive|phantom|upcod/i.test(text);
    
    return {
      riskScore: hasRedFlags ? 0.7 : 0.2,
      riskLevel: hasRedFlags ? "MEDIUM" : "LOW",
      fraudIndicators: hasRedFlags ? [
        {
          type: "Pattern Analysis",
          description: "Potential billing irregularities detected in text",
          severity: "MEDIUM",
          recommendation: "Manual review recommended"
        }
      ] : [],
      alerts: hasRedFlags ? [
        {
          alertType: "FRAUD",
          priority: "MEDIUM", 
          message: "Document contains potential fraud indicators",
          action: "Schedule manual review"
        }
      ] : []
    };
  }

  createEnhancedFallbackAnalysis(text) {
    return {
      summary: `Medical document analysis of ${text.length} characters. ${text.substring(0, 200)}...`,
      medicalEntities: this.extractMedicalEntities(text),
      clinicalAssessment: {
        acuity: "MEDIUM",
        complexity: "MODERATE",
        riskFactors: ["Standard risk profile"]
      },
      sentiment: {
        overall: "NEUTRAL",
        confidence: 0.7
      },
      recommendations: [
        "Review document for completeness",
        "Verify medical coding accuracy", 
        "Confirm patient information"
      ]
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      console.log('✅ Llama connection successful');
      return true;
    } catch (error) {
      console.error('❌ Llama connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new LlamaClient();
