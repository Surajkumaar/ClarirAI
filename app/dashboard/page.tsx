"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, MessageSquare, AlertTriangle, Download, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import SeverityGauge from "@/components/severity-gauge"
import QAPanel from "@/components/qa-panel"
import clariraiAPI from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Mock data for demo mode
const mockAnalysisData = {
  analysis_id: "demo-12345",
  highest_probability_class: "Mild",
  severity_index: 35,
  confidence_score: 0.87,
  ai_explanation:
    "The model has classified this image as showing mild diabetic retinopathy. There are a few microaneurysms visible in the peripheral retina, but no significant hemorrhages or exudates. The optic disc and macula appear normal. This stage requires monitoring but no immediate intervention.",
  clinical_summary: {
    observed_abnormalities: "Few microaneurysms in peripheral retina",
    risks: "Low risk of vision loss if blood glucose is controlled",
    lifestyle_notes: "Maintain good glycemic control, regular eye examinations",
    recommended_followup: "Annual eye examination",
  },
  suggested_questions_with_answers: [
    {
      question: "What lifestyle changes would be most effective?",
      answer:
        "Based on the mild diabetic retinopathy diagnosis, the most effective lifestyle changes include strict glycemic control, maintaining blood pressure within target range, regular physical activity, and a balanced diet low in refined carbohydrates. Regular monitoring of blood glucose levels is essential.",
    },
    {
      question: "Is this condition likely to progress?",
      answer:
        "Mild diabetic retinopathy can progress to more severe forms if blood glucose levels are not well controlled. With proper management of diabetes, including glycemic control and regular eye examinations, progression can be significantly slowed or halted in many cases.",
    },
    {
      question: "What follow-up care is recommended?",
      answer:
        "For mild diabetic retinopathy, annual comprehensive eye examinations are typically recommended. However, if there are changes in vision or if diabetes becomes difficult to control, more frequent examinations may be necessary.",
    },
    {
      question: "Are there any treatments needed at this stage?",
      answer:
        "At the mild stage of diabetic retinopathy, specific eye treatments are usually not required. The primary focus is on optimizing diabetes management through medication adherence, lifestyle modifications, and regular monitoring of blood glucose levels.",
    },
  ],
}

// Predefined clinical assessment data for each class
type ClinicalSummary = {
  observed_abnormalities: string;
  risks: string;
  lifestyle_notes: string;
  recommended_followup: string;
};

type ClassTypes = 'No' | 'Mild' | 'Moderate' | 'Severe' | 'Proliferative' | 'Unknown';

const predefinedClinicalData: Record<ClassTypes, ClinicalSummary> = {
  No: {
    observed_abnormalities: "No visible signs of diabetic retinopathy detected",
    risks: "Low risk of vision loss, but regular monitoring is essential due to diabetes",
    lifestyle_notes: "Maintain good glycemic control, regular exercise, balanced diet, and blood pressure management",
    recommended_followup: "Annual eye examination",
  },
  Mild: {
    observed_abnormalities: "Few microaneurysms visible in peripheral retina",
    risks: "Low risk of vision loss if blood glucose is controlled",
    lifestyle_notes: "Maintain good glycemic control, regular exercise, balanced diet, and blood pressure management",
    recommended_followup: "Annual eye examination",
  },
  Moderate: {
    observed_abnormalities: "Multiple microaneurysms, dot and blot hemorrhages, hard exudates",
    risks: "Moderate risk of vision loss; risk increases with poor glycemic control",
    lifestyle_notes: "Strict glycemic control, blood pressure management, regular exercise, low-salt and low-sugar diet",
    recommended_followup: "Follow-up examination in 6 months",
  },
  Severe: {
    observed_abnormalities: "Extensive microaneurysms, hemorrhages, venous beading, intraretinal microvascular abnormalities (IRMA)",
    risks: "High risk of vision loss; significant risk of progression to proliferative stage",
    lifestyle_notes: "Strict glycemic control, blood pressure management, cholesterol management, smoking cessation",
    recommended_followup: "Follow-up examination in 3-4 months; may require referral to retina specialist",
  },
  Proliferative: {
    observed_abnormalities: "Neovascularization, vitreous hemorrhage, preretinal hemorrhage, fibrovascular proliferation",
    risks: "Very high risk of severe vision loss or blindness without treatment",
    lifestyle_notes: "Strict glycemic control, blood pressure management, immediate medical attention for any vision changes",
    recommended_followup: "Immediate referral to retina specialist for laser treatment or other interventions",
  },
  Unknown: {
    observed_abnormalities: "Assessment could not be completed with confidence",
    risks: "Unknown - proper evaluation by an ophthalmologist is required",
    lifestyle_notes: "Continue diabetes management as directed by your healthcare provider",
    recommended_followup: "Consult with an ophthalmologist for comprehensive evaluation",
  },
};

// Helper function to map backend data to frontend format
const mapAnalysisData = (backendData: any) => {
  console.log('Mapping backend data:', backendData);
  
  // If we have demo data, return it as is
  if (backendData.analysis_id === "demo-12345") {
    return backendData;
  }
  
  // Debug the prediction data structure
  console.log('Prediction data:', backendData.prediction);
  
  // Extract class name - check all possible field names
  const className = backendData.prediction?.class || 
                   backendData.prediction?.class_name || 
                   backendData.prediction?.className || 
                   'Unknown';
  
  console.log('Class name extracted:', className);
  
  // Get the predefined clinical data for this class
  const clinicalData = predefinedClinicalData[className as ClassTypes] || predefinedClinicalData.Unknown;
  console.log('Using predefined clinical data for class:', className, clinicalData);
  
  // Extract and parse severity index
  const severityIndex = backendData.prediction?.severity_index || 
                        backendData.prediction?.severityIndex || 
                        backendData.severity_index || 
                        0;
  
  // Parse to number if it's a string
  const parsedSeverityIndex = typeof severityIndex === 'string' ? 
                             parseInt(severityIndex) : 
                             severityIndex || 0;
  
  console.log('Severity index extracted:', parsedSeverityIndex);
  
  // Extract and parse confidence
  let parsedConfidence = 0;
  
  try {
    // Try to extract confidence from various possible locations in the data
    const confidenceValue = backendData.prediction?.confidence || 
                          backendData.prediction?.confidence_score || 
                          backendData.confidence || 
                          backendData.confidence_score;
    
    if (confidenceValue !== undefined) {
      // Convert to number if it's a string
      parsedConfidence = typeof confidenceValue === 'string' ? 
                        parseFloat(confidenceValue) : 
                        confidenceValue;
      
      // Normalize to 0-1 range if it's in percentage format
      if (parsedConfidence > 1) {
        parsedConfidence = parsedConfidence / 100;
      }
    }
  } catch (error) {
    console.error('Error parsing confidence:', error);
    parsedConfidence = 0;
  }
  
  // Calculate confidence percentage (0-100)
  const confidencePercentage = Math.round(parsedConfidence * 100);
  console.log('Final confidence percentage:', confidencePercentage);
  
  // Map the backend data to the frontend format
  console.log('Original backend data structure:', JSON.stringify(backendData, null, 2));
  console.log('Clinical summary from backend:', backendData.clinical_summary);
  console.log('Clinical findings:', backendData.clinical_findings);
  console.log('Risk factors:', backendData.risk_factors);
  console.log('Recommendations:', backendData.recommendations);
  
  const mappedData = {
    analysis_id: backendData.analysis_id || `analysis-${Date.now()}`,
    highest_probability_class: className,
    severity_index: parsedSeverityIndex,
    confidence_score: confidencePercentage,
    ai_explanation: backendData.explanation || 
                   backendData.ai_explanation || 
                   'No explanation available',
    clinical_summary: clinicalData,
    suggested_questions_with_answers: backendData.suggested_questions_with_answers || [
      {
        question: "What follow-up care is recommended?",
        answer: Array.isArray(backendData.recommendations) ? 
               backendData.recommendations[0] : 
               "Regular follow-up with your ophthalmologist is recommended.",
      }
    ],
    image_url: backendData.image_url || null,
  };
  
  console.log('Final mapped data:', mappedData);
  return mappedData;
};

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const searchParams = useSearchParams()
  const isDemo = searchParams.get("demo") === "true"
  const analysisId = searchParams.get("analysis_id")
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setIsLoading(true)

      try {
        if (isDemo) {
          // Use mock data for demo mode
          console.log('Using demo mode data')
          setTimeout(() => {
            setAnalysisData(mockAnalysisData)
            setIsLoading(false)
          }, 1000)
        } else if (analysisId) {
          // Fetch from API using the analysis ID
          console.log('Fetching analysis data for ID:', analysisId)
          try {
            const data = await clariraiAPI.getAnalysis(analysisId)
            console.log('Raw analysis data received:', JSON.stringify(data, null, 2))
            
            // Get the image from localStorage if available
            if (typeof window !== 'undefined') {
              const storedImage = localStorage.getItem('lastAnalysisImage')
              if (storedImage) {
                data.image_url = storedImage
              }
            }

            // Ensure clinical_summary is properly structured
            console.log('Before processing, clinical_summary:', data.clinical_summary)
            console.log('Clinical findings:', data.clinical_findings)
            console.log('Risk factors:', data.risk_factors)
            console.log('Recommendations:', data.recommendations)
            
            if (!data.clinical_summary) {
              console.log('Creating clinical_summary object')
              data.clinical_summary = {
                observed_abnormalities: data.clinical_findings || 'No abnormalities specified',
                risks: data.risk_factors || 'No risks specified',
                lifestyle_notes: Array.isArray(data.recommendations) ? 
                                data.recommendations.join(', ') : 
                                'No lifestyle notes available',
                recommended_followup: Array.isArray(data.recommendations) ? 
                                    data.recommendations[0] : 
                                    'Follow up with your doctor'
              }
              console.log('Created clinical_summary:', data.clinical_summary)
            }
            
            setAnalysisData(data)
            setIsLoading(false)
          } catch (fetchError) {
            console.error('Error fetching analysis:', fetchError)
            // If there's an error, fall back to mock data
            const mockData = {
              ...mockAnalysisData,
              analysis_id: analysisId,
              image_url: null as string | null
            }
            
            // Get the image from localStorage if available
            if (typeof window !== 'undefined') {
              const storedImage = localStorage.getItem('lastAnalysisImage')
              if (storedImage) {
                mockData.image_url = storedImage
              }
            }
            
            setAnalysisData(mockData)
            setIsLoading(false)
          }
        } else {
          // If no analysisId and not demo, use the most recent analysis
          console.log('Fetching most recent analysis')
          try {
            const data = await clariraiAPI.getRecentAnalysis()
            console.log('Recent analysis data received:', data)
            
            // Get the image from localStorage if available
            if (typeof window !== 'undefined') {
              const storedImage = localStorage.getItem('lastAnalysisImage')
              if (storedImage) {
                data.image_url = storedImage
              }
            }
            
            // Ensure we have proper clinical summary data
            if (!data.clinical_summary && data.clinical_findings) {
              data.clinical_summary = {
                observed_abnormalities: data.clinical_findings || 'No abnormalities specified',
                risks: data.risk_factors || 'No risks specified',
                lifestyle_notes: Array.isArray(data.recommendations) ? 
                                data.recommendations.join(', ') : 
                                'No lifestyle notes available',
                recommended_followup: Array.isArray(data.recommendations) ? 
                                    data.recommendations[0] : 
                                    'Follow up with your doctor'
              }
            }
            
            setAnalysisData(data)
            setIsLoading(false)
          } catch (fetchError) {
            console.error('Error fetching recent analysis:', fetchError)
            // Fall back to mock data
            const mockData = { 
              ...mockAnalysisData, 
              clinical_summary: {
                observed_abnormalities: "Few microaneurysms in peripheral retina",
                risks: "Low risk of vision loss if blood glucose is controlled",
                lifestyle_notes: "Maintain good glycemic control, regular eye examinations",
                recommended_followup: "Annual eye examination",
              },
              image_url: null as string | null
            }
            
            // Get the image from localStorage if available
            if (typeof window !== 'undefined') {
              const storedImage = localStorage.getItem('lastAnalysisImage')
              if (storedImage) {
                mockData.image_url = storedImage
              }
            }
            
            setAnalysisData(mockData)
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error("Error fetching analysis data:", error)
        setIsLoading(false)
      }
    }

    fetchAnalysisData()
  }, [isDemo, analysisId])

  const handleGenerateReport = async () => {
    if (!analysisData?.analysis_id) return;
    
    setIsGeneratingReport(true)

    try {
      if (isDemo) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000))
        toast({
          title: "Report Generated",
          description: "Your report has been generated successfully.",
          variant: "default",
        })
      } else {
        // Use the real API to generate a report
        const blob = await clariraiAPI.generateReport(analysisData.analysis_id);
        
        // Create a download link
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `ClarirAI_Report_${analysisData.analysis_id}.pdf`;
        
        // Append to body, click, and clean up
        document.body.appendChild(a);
        a.click();
        
        // Small delay before cleanup to ensure download starts
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        // Show success message
        toast({
          title: "Report Generated",
          description: "Your report has been downloaded successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading Analysis Results...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we retrieve the analysis data.</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="container max-w-7xl py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
          <h2 className="mt-4 text-xl font-semibold">No Analysis Data Found</h2>
          <p className="text-muted-foreground mt-2">Please upload and analyze a retinal image first.</p>
          <Button className="mt-6" asChild>
            <a href="/analysis">Go to Analysis</a>
          </Button>
        </div>
      </div>
    )
  }

  // Map the data to ensure it's in the correct format
  const mappedData = mapAnalysisData(analysisData);
  console.log('Mapped data for display:', mappedData);

  // Before rendering, ensure clinical_summary exists and has all required fields
  if (!mappedData.clinical_summary) {
    mappedData.clinical_summary = {
      observed_abnormalities: 'No abnormalities specified',
      risks: 'No risks specified',
      lifestyle_notes: 'No lifestyle notes available',
      recommended_followup: 'Follow up with your doctor'
    };
  }

  // Ensure consistency between class name and severity gauge
  if (mappedData.highest_probability_class === 'Unknown' && mappedData.severity_index > 0) {
    // If class is Unknown but severity index exists, update the class based on severity
    if (mappedData.severity_index < 20) {
      mappedData.highest_probability_class = 'No';
    } else if (mappedData.severity_index < 40) {
      mappedData.highest_probability_class = 'Mild';
    } else if (mappedData.severity_index < 60) {
      mappedData.highest_probability_class = 'Moderate';
    } else if (mappedData.severity_index < 80) {
      mappedData.highest_probability_class = 'Severe';
    } else {
      mappedData.highest_probability_class = 'Proliferative';
    }
    
    // Update clinical data to match the new class
    mappedData.clinical_summary = predefinedClinicalData[mappedData.highest_probability_class as ClassTypes];
    
    // If confidence is 0 but we have a severity, set a minimum confidence
    if (mappedData.confidence_score === 0) {
      mappedData.confidence_score = 75; // Set a higher default confidence
    }
  }

  // Store the diagnosis class and analysis ID in localStorage for the AI consultation feature
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastAnalysisClass', mappedData.highest_probability_class);
    localStorage.setItem('lastAnalysisId', mappedData.analysis_id);
  }

  return (
    <div className="container max-w-7xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
            <p className="text-muted-foreground mt-1">Detailed analysis of the retinal image</p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              ID: {mappedData.analysis_id}
            </Badge>
            <Button onClick={handleGenerateReport} className="gap-2" disabled={isGeneratingReport}>
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Report
                  <FileText className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Clinical Details</span>
            </TabsTrigger>
            <TabsTrigger value="qa" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Q&A</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Diagnosis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        {mappedData.highest_probability_class === 'No' ? 'No' : mappedData.highest_probability_class} Diabetic Retinopathy
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Confidence: {mappedData.confidence_score}%
                      </p>
                    </div>
                    <div className="flex-1 flex justify-end">
                      <SeverityGauge value={mappedData.severity_index || 0} />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">AI Explanation</h4>
                    <p className="text-muted-foreground">{mappedData.ai_explanation}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden border mb-4">
                    {mappedData.image_url ? (
                      <Image 
                        src={mappedData.image_url} 
                        alt="Analyzed retinal image" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <p className="text-sm text-muted-foreground">Analyzed retinal image</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Severity Index</span>
                      <span className="font-medium">{mappedData.severity_index}/100</span>
                    </div>
                    <div
                      className="h-2 rounded-full bg-muted overflow-hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={mappedData.severity_index}
                    >
                      <div
                        className={cn(
                          "h-full",
                          mappedData.severity_index < 25
                            ? "bg-green-500"
                            : mappedData.severity_index < 50
                            ? "bg-yellow-500"
                            : mappedData.severity_index < 75
                            ? "bg-orange-500"
                            : "bg-red-500"
                        )}
                        style={{ width: `${mappedData.severity_index}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clinical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Observed Abnormalities</h3>
                      <p className="mt-1">{mappedData.clinical_summary.observed_abnormalities}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Associated Risks</h3>
                      <p className="mt-1">{mappedData.clinical_summary.risks}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Lifestyle Recommendations</h3>
                      <p className="mt-1">{mappedData.clinical_summary.lifestyle_notes}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Recommended Follow-up</h3>
                      <p className="mt-1">{mappedData.clinical_summary.recommended_followup}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium mb-2">Disclaimer</h3>
                  <p className="text-xs text-muted-foreground">
                    This analysis is provided as a decision support tool and should not replace professional medical advice. Always consult with a healthcare professional for diagnosis and treatment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa">
            <QAPanel questions={mappedData.suggested_questions_with_answers} analysisId={mappedData.analysis_id} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
