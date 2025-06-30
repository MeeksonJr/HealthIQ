import { supabase } from './supabase';

// AI Service Configuration
const AI_SERVICES = {
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: 'https://api.groq.com/openai/v1',
    models: {
      fast: 'llama3-8b-8192',
      smart: 'llama3-70b-8192'
    }
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro'
  },
  huggingFace: {
    apiKey: process.env.HUGGING_FACE_API_KEY,
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      imageAnalysis: 'microsoft/DialoGPT-medium',
      textGeneration: 'microsoft/DialoGPT-large',
      medicalNER: 'emilyalsentzer/Bio_ClinicalBERT'
    }
  }
};

export interface AnalysisResult {
  confidence: number;
  findings: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

export class AIAnalysisService {
  // Medical Scan Analysis using Groq
  static async analyzeMedicalScan(imageUrl: string, scanType: string): Promise<AnalysisResult> {
    try {
      const prompt = `Analyze this ${scanType} medical scan. Provide:
1. Key findings and observations
2. Potential concerns or abnormalities
3. Recommended follow-up actions
4. Confidence level (0-1)
5. Severity assessment

Be professional and note this is for informational purposes only.`;

      const response = await fetch(`${AI_SERVICES.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AI_SERVICES.groq.models.smart,
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant. Provide analysis for educational purposes only. Always recommend consulting healthcare professionals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      return this.parseAnalysisResponse(analysis, 'medical');
    } catch (error) {
      console.error('Medical scan analysis error:', error);
      throw new Error('Failed to analyze medical scan');
    }
  }

  // Food Analysis using Gemini
  static async analyzeFoodScan(imageUrl: string): Promise<AnalysisResult> {
    try {
      const prompt = `Analyze this food image and provide:
1. Identified food items
2. Estimated nutritional information (calories, macros)
3. Health assessment and recommendations
4. Portion size estimates
5. Dietary considerations`;

      const response = await fetch(`${AI_SERVICES.gemini.baseUrl}/models/${AI_SERVICES.gemini.model}:generateContent?key=${AI_SERVICES.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      const analysis = data.candidates[0].content.parts[0].text;

      return this.parseAnalysisResponse(analysis, 'food');
    } catch (error) {
      console.error('Food analysis error:', error);
      throw new Error('Failed to analyze food image');
    }
  }

  // Medication Analysis using Hugging Face
  static async analyzeMedicationScan(imageUrl: string): Promise<AnalysisResult> {
    try {
      // First, extract text from the medication image using OCR
      const ocrResponse = await fetch(`https://api.ocr.space/parse/imageurl?apikey=${process.env.OCR_SPACE_API_KEY}&url=${imageUrl}`);
      const ocrData = await ocrResponse.json();
      const extractedText = ocrData.ParsedResults?.[0]?.ParsedText || '';

      // Then analyze the extracted text for medication information
      const prompt = `Analyze this medication text: "${extractedText}"
Provide:
1. Medication name and active ingredients
2. Dosage information
3. Common uses and indications
4. Potential side effects
5. Drug interactions to be aware of
6. Storage instructions`;

      const response = await fetch(`${AI_SERVICES.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AI_SERVICES.groq.models.fast,
          messages: [
            {
              role: 'system',
              content: 'You are a pharmaceutical AI assistant. Provide medication information for educational purposes only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 800
        })
      });

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      return this.parseAnalysisResponse(analysis, 'medication');
    } catch (error) {
      console.error('Medication analysis error:', error);
      throw new Error('Failed to analyze medication');
    }
  }

  // Generate Health Insights using AI
  static async generateHealthInsights(userId: string): Promise<any[]> {
    try {
      // Get user's recent health data
      const [healthLogs, scans, medications] = await Promise.all([
        supabase.from('health_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }).limit(30),
        supabase.from('medical_scans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
        supabase.from('medication_scans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
      ]);

      const healthData = {
        logs: healthLogs.data || [],
        scans: scans.data || [],
        medications: medications.data || []
      };

      const prompt = `Based on this health data, generate personalized health insights:
${JSON.stringify(healthData, null, 2)}

Provide 3-5 insights covering:
1. Health trends and patterns
2. Potential areas of concern
3. Lifestyle recommendations
4. Preventive care suggestions
5. Medication adherence observations

Format as JSON array with: title, description, severity, recommendations, confidence_score`;

      const response = await fetch(`${AI_SERVICES.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AI_SERVICES.groq.models.smart,
          messages: [
            {
              role: 'system',
              content: 'You are a health AI assistant. Generate insights based on user data. Always recommend consulting healthcare professionals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      const insights = JSON.parse(data.choices[0].message.content);

      return insights;
    } catch (error) {
      console.error('Health insights generation error:', error);
      return [];
    }
  }

  // Chat Response using Groq
  static async generateChatResponse(message: string, userContext: any): Promise<string> {
    try {
      const prompt = `User message: "${message}"
User context: ${JSON.stringify(userContext)}

Provide a helpful, health-focused response. Be conversational but professional.`;

      const response = await fetch(`${AI_SERVICES.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AI_SERVICES.groq.models.fast,
          messages: [
            {
              role: 'system',
              content: 'You are HealthIQ AI, a helpful health assistant. Provide personalized advice based on user data while always recommending professional medical consultation for serious concerns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Chat response error:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  private static parseAnalysisResponse(analysis: string, type: string): AnalysisResult {
    // Parse AI response and extract structured data
    const lines = analysis.split('\n').filter(line => line.trim());
    
    const findings: string[] = [];
    const recommendations: string[] = [];
    let confidence = 0.8; // Default confidence
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // Extract findings and recommendations from the response
    lines.forEach(line => {
      if (line.toLowerCase().includes('finding') || line.toLowerCase().includes('observation')) {
        findings.push(line.replace(/^\d+\.\s*/, '').trim());
      }
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
        recommendations.push(line.replace(/^\d+\.\s*/, '').trim());
      }
      if (line.toLowerCase().includes('confidence')) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) confidence = parseFloat(match[1]) > 1 ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
      }
      if (line.toLowerCase().includes('critical')) severity = 'critical';
      else if (line.toLowerCase().includes('high')) severity = 'high';
      else if (line.toLowerCase().includes('low')) severity = 'low';
    });

    return {
      confidence,
      findings: findings.length > 0 ? findings : [analysis.substring(0, 200) + '...'],
      recommendations: recommendations.length > 0 ? recommendations : ['Consult with a healthcare professional for detailed analysis'],
      severity,
      metadata: { type, analysisDate: new Date().toISOString() }
    };
  }
}