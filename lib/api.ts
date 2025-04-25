import axios from 'axios';
import { getProxiedUrl } from './cors-proxy';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://surajkumaar-clarirai.hf.space';
const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

// The base URL for the Hugging Face Spaces backend
const BACKEND_URL = API_URL;

/**
 * Generate a fallback AI response based on the diagnosis class and question
 */
const getAIFallbackResponse = (diagnosisClass: string, question: string): string => {
  // Common responses that apply to any diagnosis class
  const commonResponses: Record<string, string[]> = {
    "what is diabetic retinopathy": [
      "what is", "explain", "tell me about", "describe", "definition"
    ],
    "how is it treated": [
      "treatment", "how to treat", "therapy", "manage", "medication", "surgery", "laser"
    ],
    "what causes it": [
      "cause", "reason", "why does", "how does it happen", "what leads to"
    ],
    "how can i prevent it": [
      "prevent", "avoid", "stop", "reduce risk", "lower chance"
    ],
    "who are you": [
      "who are you", "what are you", "are you ai", "are you a doctor", "your name", "who is"
    ]
  };

  // Common response answers
  const commonAnswers: Record<string, string> = {
    "what is diabetic retinopathy": "Diabetic retinopathy is an eye condition that can cause vision loss and blindness in people who have diabetes. It affects blood vessels in the retina (the light-sensitive layer at the back of the eye). High blood sugar levels can damage these vessels, causing them to leak fluid or bleed, which distorts vision.",
    "how is it treated": "Treatment depends on the severity. For early stages, controlling blood sugar, blood pressure, and cholesterol is often sufficient. More advanced cases may require laser treatment, anti-VEGF injections, or surgery. Regular eye exams are essential for early detection and treatment.",
    "what causes it": "Diabetic retinopathy is caused by prolonged high blood sugar levels damaging the blood vessels in the retina. Over time, these vessels can weaken, bulge, or leak fluid. In advanced stages, new abnormal blood vessels grow on the retina surface, which can cause serious vision problems.",
    "how can i prevent it": "Prevention focuses on managing diabetes effectively: maintain good blood sugar control, keep blood pressure and cholesterol levels in check, have regular eye exams, exercise regularly, maintain a healthy diet, and avoid smoking and excessive alcohol consumption.",
    "who are you": "I am ClarirAI, an AI assistant designed to provide information about diabetic retinopathy based on retinal image analysis. I can help explain your diagnosis, answer questions about diabetic retinopathy, and provide general guidance. However, I'm not a replacement for professional medical advice from your healthcare provider."
  };

  // Class-specific question patterns
  const classQuestions: Record<string, string[]> = {
    "what should i do": [
      "what should i do", "next steps", "what now", "treatment plan", "recommendations", "advice", "how to manage"
    ],
    "will it get worse": [
      "will it get worse", "prognosis", "progression", "future", "outlook", "what to expect", "how bad"
    ]
  };

  // Class-specific responses
  const classResponses: Record<string, Record<string, string>> = {
    "No": {
      "what should i do": "While no signs of diabetic retinopathy were detected, it's important to continue managing your diabetes well. Maintain good blood sugar control, have regular eye exams (at least annually), and follow a healthy lifestyle with proper diet and exercise.",
      "will it get worse": "Since no diabetic retinopathy was detected, your focus should be on prevention. With good diabetes management, you can significantly reduce the risk of developing retinopathy in the future. Regular monitoring is still important.",
    },
    "Mild": {
      "what should i do": "With mild diabetic retinopathy, focus on optimizing your diabetes management. Maintain strict blood sugar control, keep blood pressure and cholesterol in check, and ensure you have regular eye exams (at least annually). Report any vision changes to your doctor immediately.",
      "will it get worse": "Mild diabetic retinopathy can progress if blood sugar levels remain elevated. However, with proper diabetes management, progression can often be slowed or halted. Regular monitoring is essential to catch any changes early.",
    },
    "Moderate": {
      "what should i do": "For moderate diabetic retinopathy, more frequent monitoring is recommended (typically every 6 months). Strict control of blood sugar, blood pressure, and cholesterol is crucial. Your doctor may discuss treatment options if there are specific areas of concern in your retina.",
      "will it get worse": "Moderate diabetic retinopathy has a higher risk of progression without proper management. Strict diabetes control is essential. Some patients may need treatment such as laser therapy to prevent further damage. Close monitoring by an ophthalmologist is necessary.",
    },
    "Severe": {
      "what should i do": "Severe diabetic retinopathy requires prompt attention from a retina specialist. Treatment options like laser photocoagulation or anti-VEGF injections may be necessary. Very strict diabetes management is crucial, along with frequent eye examinations (every 3-4 months).",
      "will it get worse": "Without treatment, severe diabetic retinopathy has a high risk of progressing to vision loss. However, with appropriate treatment and strict diabetes management, further damage can often be limited. Following your specialist's recommendations is essential.",
    },
    "Proliferative": {
      "what should i do": "Proliferative diabetic retinopathy requires immediate treatment from a retina specialist. Treatments may include laser surgery, anti-VEGF injections, or vitrectomy. Extremely strict diabetes management is crucial, and you'll need frequent monitoring by your specialist.",
      "will it get worse": "Proliferative diabetic retinopathy can lead to severe vision loss or blindness if not treated promptly. With appropriate treatment, the risk of severe vision loss can be reduced by more than 50%. Immediate and ongoing care from a specialist is essential.",
    },
    "Unknown": {
      "what should i do": "Since the diagnosis is uncertain, I recommend consulting with an ophthalmologist for a comprehensive eye examination. Continue to manage your diabetes carefully with good blood sugar control and follow your doctor's recommendations for regular eye screenings.",
      "will it get worse": "Without a clear diagnosis, it's difficult to predict progression. The best approach is to maintain optimal diabetes management and schedule a comprehensive eye examination with an ophthalmologist to get a definitive diagnosis and appropriate follow-up plan.",
    }
  };

  // Normalize the question for matching
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Check for common question patterns first
  for (const [key, patterns] of Object.entries(commonResponses)) {
    for (const pattern of patterns) {
      if (normalizedQuestion.includes(pattern)) {
        return commonAnswers[key];
      }
    }
  }
  
  // Check for class-specific question patterns
  for (const [key, patterns] of Object.entries(classQuestions)) {
    for (const pattern of patterns) {
      if (normalizedQuestion.includes(pattern)) {
        const classSpecificResponses = classResponses[diagnosisClass] || classResponses['Unknown'];
        return classSpecificResponses[key];
      }
    }
  }
  
  // Default fallback response
  return `Based on the ${diagnosisClass.toLowerCase()} diabetic retinopathy diagnosis, I recommend discussing your specific question with your healthcare provider. They can provide personalized advice based on your complete medical history and current condition.`;
};

/**
 * Shorten a long AI response to make it more concise
 * @param response The full AI response
 * @returns A shortened version of the response
 */
const shortenAIResponse = (response: string): string => {
  // If the response is already short, return it as is
  if (response.length < 200) return response;
  
  // Try to find the first 2-3 sentences
  const sentences = response.split(/(?<=\.|\?|\!)\s+/);
  
  if (sentences.length <= 3) {
    return response;
  }
  
  // Get the first 2-3 sentences
  let shortResponse = sentences.slice(0, 3).join(' ');
  
  // If the short response is too short, include more sentences
  if (shortResponse.length < 100 && sentences.length > 3) {
    shortResponse = sentences.slice(0, 4).join(' ');
  }
  
  // Add an ellipsis to indicate the response was shortened
  return shortResponse + '...';
};

// API service for ClarirAI
export const clariraiAPI = {
  /**
   * Check if the API is healthy
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(getProxiedUrl('/health'), { timeout: 8000 });
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  /**
   * Get model information
   */
  getModelInfo: async () => {
    try {
      const response = await axios.get(getProxiedUrl('/model-info'));
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw error;
    }
  },

  /**
   * Analyze a retinal image
   */
  analyzeImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(getProxiedUrl('/predict'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store the analysis ID for future reference
      if (response.data && response.data.analysis_id) {
        localStorage.setItem('lastAnalysisId', response.data.analysis_id);
      }

      return response.data;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  },

  /**
   * Get a specific analysis by ID
   */
  getAnalysis: async (analysisId: string) => {
    try {
      const response = await axios.get(getProxiedUrl(`/analysis/${analysisId}`));
      return response.data;
    } catch (error) {
      console.error(`Failed to get analysis with ID ${analysisId}:`, error);
      throw error;
    }
  },

  /**
   * Get the most recent analysis
   */
  getRecentAnalysis: async () => {
    try {
      // Try to get the most recent analysis from localStorage first
      const lastAnalysisId = localStorage.getItem('lastAnalysisId');
      if (lastAnalysisId) {
        try {
          const analysisResponse = await axios.get(getProxiedUrl(`/analysis/${lastAnalysisId}`));
          return analysisResponse.data;
        } catch (idError) {
          console.error(`Failed to get analysis with ID ${lastAnalysisId}:`, idError);
          // Continue to fallback if this fails
        }
      }

      // If no lastAnalysisId or the request failed, return mock data
      console.log('No recent analysis found, returning mock data');
      return {
        analysis_id: "recent-12345",
        prediction: {
          class: "Mild",
          severity_index: 35,
          confidence: 0.87
        },
        explanation: "The model has classified this image as showing mild diabetic retinopathy. There are a few microaneurysms visible in the peripheral retina, but no significant hemorrhages or exudates.",
        clinical_findings: "Few microaneurysms in peripheral retina",
        risk_factors: "Low risk of vision loss if blood glucose is controlled",
        recommendations: [
          "Annual eye examination",
          "Maintain good glycemic control",
          "Regular monitoring of blood glucose levels"
        ],
        clinical_summary: {
          observed_abnormalities: "Few microaneurysms in peripheral retina",
          risks: "Low risk of vision loss if blood glucose is controlled",
          lifestyle_notes: "Maintain good glycemic control, regular eye examinations",
          recommended_followup: "Annual eye examination"
        },
        suggested_questions_with_answers: [
          {
            question: "What lifestyle changes would be most effective?",
            answer: "Based on the mild diabetic retinopathy diagnosis, the most effective lifestyle changes include strict glycemic control, maintaining blood pressure within target range, regular physical activity, and a balanced diet low in refined carbohydrates."
          },
          {
            question: "Is this condition likely to progress?",
            answer: "Mild diabetic retinopathy can progress to more severe forms if blood glucose levels are not well controlled. With proper management of diabetes, progression can be significantly slowed or halted in many cases."
          }
        ]
      };
    } catch (error) {
      console.error('Failed to get recent analysis:', error);
      throw error;
    }
  },

  /**
   * Get a consultation for a specific analysis
   */
  getConsultation: async (analysisId: string, question: string) => {
    try {
      console.log(`Sending consultation request for analysis ${analysisId} with question: ${question}`);
      
      const response = await axios.post(getProxiedUrl('/consult'), {
        analysis_id: analysisId,
        question: question,
      });
      
      // Log the raw response for debugging
      console.log('Consultation API response:', JSON.stringify(response.data));
      
      // Check if the response has the expected structure
      if (response.data && typeof response.data === 'object') {
        // Check for the consultation field (from Hugging Face backend)
        if (response.data.consultation) {
          console.log('Using consultation field from response');
          return { answer: shortenAIResponse(response.data.consultation) };
        }
        // Check for the answer field
        else if (response.data.answer) {
          console.log('Using answer field from response');
          return { answer: shortenAIResponse(response.data.answer) };
        } 
        // Check for the response field
        else if (response.data.response) {
          console.log('Using response field from response');
          return { answer: shortenAIResponse(response.data.response) };
        } 
        // Check for consultation_response field
        else if (response.data.consultation_response) {
          console.log('Using consultation_response field from response');
          return { answer: shortenAIResponse(response.data.consultation_response) };
        } 
        // Check for message field
        else if (response.data.message) {
          console.log('Using message field from response');
          return { answer: shortenAIResponse(response.data.message) };
        } 
        // If it's a string response
        else if (typeof response.data === 'string') {
          console.log('Response is a string, using directly');
          return { answer: shortenAIResponse(response.data) };
        } 
        // If none of the above fields are found but we have a valid response object
        else {
          console.warn('Unexpected response structure, checking for any string field');
          
          // Try to find any field that contains a string longer than 50 characters
          for (const key in response.data) {
            if (typeof response.data[key] === 'string' && response.data[key].length > 50) {
              console.log(`Found potential consultation text in field: ${key}`);
              return { answer: shortenAIResponse(response.data[key]) };
            }
          }
          
          // If we still don't have an answer, use the fallback
          console.warn('No suitable field found in response, using fallback');
          const className = localStorage.getItem('lastAnalysisClass') || 'Unknown';
          return {
            answer: shortenAIResponse(getAIFallbackResponse(className, question))
          };
        }
      }
      
      // If we reach here, use the fallback system
      console.warn('Using fallback response system');
      const className = localStorage.getItem('lastAnalysisClass') || 'Unknown';
      return {
        answer: shortenAIResponse(getAIFallbackResponse(className, question))
      };
    } catch (error) {
      console.error('Consultation failed:', error);
      
      // Create a fallback response based on the diagnosis class
      const storedAnalysisId = localStorage.getItem('lastAnalysisId');
      if (storedAnalysisId === analysisId) {
        const className = localStorage.getItem('lastAnalysisClass') || 'Unknown';
        return {
          answer: shortenAIResponse(getAIFallbackResponse(className, question))
        };
      }
      
      throw error;
    }
  },

  /**
   * Generate a report for a specific analysis
   */
  generateReport: async (analysisId: string) => {
    try {
      const response = await axios.get(getProxiedUrl(`/generate-report/${analysisId}`), {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  },
};

export default clariraiAPI;
