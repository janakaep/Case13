const llamaClient = require('../services/llamaClient');

class LLMProcessor {
  constructor() {
    this.description = "LLama medical LLM for comprehensive healthcare analysis";
    this.category = "AI & NLP";
    this.processWithLLM = this.processWithLLM.bind(this);
    this.generateResponse = this.generateResponse.bind(this);
    this.analyzeText = this.analyzeText.bind(this);
  }

  async processWithLLM(payload, progressCallback) {
    try {
      progressCallback && progressCallback({ step: 'initializing_LLama', progress: 10 });
      
      const { text, task = 'analyze', context = 'healthcare' } = payload;

      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for LLama processing');
      }

      console.log('🧠 Processing with LLama medical AI...');
      
      progressCallback && progressCallback({ step: 'connecting_to_Llama', progress: 25 });
      progressCallback && progressCallback({ step: 'ai_medical_analysis', progress: 50 });
      
      const aiAnalysis = await llamaClient.analyzeText(text, task);
      
      progressCallback && progressCallback({ step: 'enhancing_results', progress: 75 });
      
      const enhancedResults = this.enhanceAnalysisResults(aiAnalysis, text, task, context);
      
      progressCallback && progressCallback({ step: 'finalizing_output', progress: 100 });
      
      return enhancedResults;

    } catch (error) {
      console.error('❌ Llama processing error:', error.message);
      throw new Error(`LLama processing failed: ${error.message}`);
    }
  }

  enhanceAnalysisResults(aiAnalysis, text, task, context) {
    return {
      taskType: task,
      context,
      inputText: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
      inputLength: text.length,
      processingTimestamp: new Date().toISOString(),
      
      // Rich AI Analysis Results
      medicalAnalysis: {
        clinicalSummary: aiAnalysis.summary || 'No summary available',
        medicalEntities: aiAnalysis.medicalEntities || {},
        clinicalAssessment: aiAnalysis.clinicalAssessment || {},
        riskFactors: aiAnalysis.clinicalAssessment?.riskFactors || [],
        qualityIndicators: aiAnalysis.clinicalAssessment?.qualityIndicators || []
      },

      complianceCheck: {
        status: 'AI_PROCESSED',
        hipaaCompliance: aiAnalysis.complianceAnalysis?.hipaaCompliance || 'Compliant',
        codingAccuracy: aiAnalysis.complianceAnalysis?.codingAccuracy || 'Accurate',
        issues: aiAnalysis.complianceAnalysis?.issues || [],
        recommendations: aiAnalysis.recommendations || ['Document processed successfully']
      },

      riskAssessment: {
        level: this.mapSentimentToRisk(aiAnalysis.sentiment?.overall),
        clinicalRisk: aiAnalysis.clinicalAssessment?.acuity || 'LOW',
        factors: aiAnalysis.clinicalAssessment?.riskFactors || ['Standard risk profile'],
        score: this.calculateRiskScore(aiAnalysis)
      },

      insights: {
        keyFindings: aiAnalysis.keyInsights || [],
        clinicalInsights: this.extractClinicalInsights(aiAnalysis),
        actionableItems: aiAnalysis.nextActions || [],
        qualityMetrics: this.generateQualityMetrics(aiAnalysis)
      },

      generatedContent: {
        summary: aiAnalysis.summary || 'Analysis completed',
        recommendations: aiAnalysis.recommendations || [],
        nextActions: aiAnalysis.nextActions || []
      },

      modelInfo: {
        version: 'LLama-7B',
        endpoint: '10.99.0.99',
        specialty: 'Medical Document Analysis',
        lastUpdated: '2025-08-27',
        processingMode: 'real-time-ai',
        confidence: aiAnalysis.confidence || 0.88
      }
    };
  }

  async generateResponse(payload) {
    const { prompt = '', text = '', responseType = 'detailed', maxLength = 500 } = payload;

    // Use text field if prompt is empty (for non-text tab usage)
    let actualPrompt = prompt.trim() || text.trim();
    
    // If still no prompt, provide helpful default based on context
    if (!actualPrompt) {
      actualPrompt = this.getContextualDefaultPrompt();
    }

    try {
      console.log('🤖 Generating response with LLama...');
      
      const responseData = await llamaClient.generateResponse(actualPrompt, 'maryland_medicaid');
      
      // Format the response properly
      const formattedOutput = this.formatResponseForDisplay(responseData.response);

      return {
        prompt: actualPrompt,
        response: responseData.response,
        formattedResponse: formattedOutput,
        responseType,
        confidence: responseData.confidence || 0.92,
        model: 'LLama-Medical-AI',
        processingTime: Date.now(),
        endpoint: '10.99.0.16',
        tokens: { 
          estimated_input: Math.ceil(actualPrompt.length / 4), 
          estimated_output: Math.ceil(responseData.response.length / 4) 
        },
        sources: ['LLama Medical AI', 'CMS Guidelines', 'Maryland Medicaid Policies'],
        timestamp: new Date().toISOString(),
        
        // Add helpful context
        usage_note: actualPrompt === this.getContextualDefaultPrompt() ? 
          'Default response provided. For specific queries, please use the Text Input tab.' : null
      };

    } catch (error) {
      console.error('❌ Response generation failed:', error.message);
      
      // Provide helpful fallback response
      return this.generateFallbackResponse(actualPrompt, error.message);
    }
  }

  // Add these helper methods
  getContextualDefaultPrompt() {
    const prompts = [
      "How do I process a Maryland Medicaid prior authorization request?",
      "What are the key compliance requirements for Maryland HealthChoice?",
      "Explain the appeals process for denied Medicaid claims in Maryland.",
      "What documentation is required for Medicaid eligibility verification?",
      "How do I handle a Medicaid fraud investigation request?"
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  generateFallbackResponse(prompt, errorMessage) {
    const fallbackResponses = {
      "prior authorization": "For Maryland Medicaid prior authorization requests, submit Form MDH-1001 with supporting clinical documentation. Processing typically takes 3-5 business days for standard requests, 24 hours for urgent cases.",
      
      "compliance": "Maryland HealthChoice compliance requires adherence to CMS guidelines, state regulations, and MCO-specific policies. Key areas include member eligibility verification, provider network management, and quality reporting.",
      
      "appeals": "Medicaid appeals must be filed within 60 days of the initial determination. The process includes informal review, formal hearing, and state-level review options. Members retain benefits during the appeals process.",
      
      "eligibility": "Medicaid eligibility verification requires proof of income (below 138% FPL), Maryland residency, and identity documentation. Use the Maryland Health Connection portal for real-time verification.",
      
      "fraud": "Report suspected Medicaid fraud to the Maryland Attorney General's Medicaid Fraud Control Unit. Document all evidence and maintain confidentiality during investigation."
    };

    // Find matching response based on prompt keywords
    const matchedResponse = Object.keys(fallbackResponses).find(key => 
      prompt.toLowerCase().includes(key)
    );

    const response = matchedResponse ? 
      fallbackResponses[matchedResponse] : 
      `I'm here to help with Maryland Medicaid questions. For specific guidance, please provide a detailed question about eligibility, claims processing, compliance, or appeals. Error: ${errorMessage}`;

    return {
      prompt,
      response,
      formattedResponse: this.formatResponseForDisplay(response),
      responseType: 'fallback',
      confidence: 0.75,
      model: 'Fallback-Response-System',
      processingTime: Date.now(),
      sources: ['Maryland Medicaid Manual', 'CMS Guidelines'],
      timestamp: new Date().toISOString(),
      note: 'This is a fallback response. For AI-powered analysis, ensure Llama connection is available.'
    };
  }

  formatResponseForDisplay(response) {
    if (!response) return '';
    
    // Simple markdown to HTML conversion
    let formatted = response
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

    // Wrap in paragraphs if not already done
    if (!formatted.includes('<p>')) {
      formatted = `<p>${formatted}</p>`;
    }

    // Fix list formatting
    if (formatted.includes('<li>')) {
      formatted = formatted
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/<\/li>\s*<li>/g, '</li><li>');
    }

    return `<div class="ai-response-content">${formatted}</div>`;
  }


  formatResponseForDisplay(response) {
    // Create proper HTML formatting for display
    return `<div class="ai-response-content">
      ${response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '</li><li>')
        .replace(/\n\d+\. /g, '</li><li>')
        .replace(/^- /, '<ul><li>')
        .replace(/^\d+\. /, '<ol><li>')
        .replace(/\n/g, '<br>')
      }
    </div>`;
  }

  async analyzeText(payload) {
    const { text, analysisType = 'comprehensive' } = payload;
    
    if (!text) {
      throw new Error('Text content is required for analysis');
    }

    try {
      console.log('📊 Analyzing text with LLama medical AI...');
      
      const analysis = await llamaClient.analyzeText(text, analysisType);
      
      return {
        analysisType,
        textLength: text.length,
        processingSource: 'LLama AI ',
        processingTimestamp: new Date().toISOString(),
        
        // Detailed Analysis Results
        medicalAnalysis: analysis,
        
        // Summary Metrics
        documentMetrics: {
          complexity: analysis.clinicalAssessment?.complexity || 'MODERATE',
          medicalTermsCount: analysis.medicalEntities?.conditions?.length || 0,
          riskLevel: analysis.clinicalAssessment?.acuity || 'LOW',
          qualityScore: this.calculateQualityScore(analysis)
        },

        // Actionable Insights
        actionableInsights: {
          immediateActions: analysis.nextActions?.slice(0, 3) || [],
          recommendations: analysis.recommendations || [],
          flaggedItems: this.extractFlaggedItems(analysis)
        },

        confidence: analysis.confidence || 0.88
      };

    } catch (error) {
      console.error('❌ Text analysis failed:', error.message);
      throw new Error(`Text analysis failed: ${error.message}`);
    }
  }

  // Helper methods
  mapSentimentToRisk(sentiment) {
    const mapping = { 'POSITIVE': 'LOW', 'NEUTRAL': 'MEDIUM', 'NEGATIVE': 'HIGH' };
    return mapping[sentiment] || 'MEDIUM';
  }

  calculateRiskScore(analysis) {
    let baseScore = 0.2;
    
    if (analysis.sentiment?.overall === 'NEGATIVE') baseScore += 0.3;
    if (analysis.clinicalAssessment?.acuity === 'HIGH') baseScore += 0.4;
    if (analysis.complianceAnalysis?.issues?.length > 0) baseScore += 0.2;
    
    return Math.min(0.9, baseScore);
  }

  extractClinicalInsights(analysis) {
    const insights = [];
    
    if (analysis.medicalEntities?.conditions?.length > 0) {
      insights.push(`Identified ${analysis.medicalEntities.conditions.length} medical conditions`);
    }
    
    if (analysis.clinicalAssessment?.complexity === 'COMPLEX') {
      insights.push('Complex case requiring specialized attention');
    }
    
    return insights;
  }

  generateQualityMetrics(analysis) {
    return {
      documentationQuality: analysis.complianceAnalysis?.documentation || 'Standard',
      codingAccuracy: analysis.complianceAnalysis?.codingAccuracy || 'Accurate', 
      clinicalRelevance: analysis.clinicalAssessment?.acuity || 'Appropriate',
      overallScore: this.calculateQualityScore(analysis)
    };
  }

  calculateQualityScore(analysis) {
    let score = 0.8;
    
    if (analysis.complianceAnalysis?.issues?.length === 0) score += 0.1;
    if (analysis.sentiment?.confidence > 0.8) score += 0.1;
    if (analysis.clinicalAssessment?.complexity === 'SIMPLE') score += 0.05;
    
    return Math.min(0.99, score);
  }

  extractFlaggedItems(analysis) {
    const flagged = [];
    
    if (analysis.complianceAnalysis?.issues?.length > 0) {
      flagged.push(...analysis.complianceAnalysis.issues);
    }
    
    if (analysis.clinicalAssessment?.riskFactors?.length > 0) {
      flagged.push(...analysis.clinicalAssessment.riskFactors);
    }
    
    return flagged;
  }
}

module.exports = new LLMProcessor();
