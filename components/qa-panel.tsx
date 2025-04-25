"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { clariraiAPI } from "@/lib/api"

interface Question {
  question: string
  answer: string
  isLoading?: boolean
}

interface QAPanelProps {
  questions: Question[]
  analysisId?: string
}

export default function QAPanel({ questions: initialQuestions, analysisId }: QAPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customAnswers, setCustomAnswers] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Add the question to the list immediately with a loading state
      const newQuestion = {
        question: customQuestion,
        answer: "Loading...",
        isLoading: true,
      };

      setCustomAnswers((prev) => [...prev, newQuestion]);
      setCustomQuestion("");

      // Try to get an answer from the API
      try {
        // Use stored analysis ID as fallback if not provided as prop
        const effectiveAnalysisId = analysisId || localStorage.getItem('lastAnalysisId');
        
        if (!effectiveAnalysisId) {
          throw new Error("No analysis ID available");
        }
        
        const response = await clariraiAPI.getConsultation(effectiveAnalysisId, customQuestion);
        
        // Update the answer once received
        setCustomAnswers((prev) =>
          prev.map((q, i) =>
            i === prev.length - 1 ? { ...q, answer: response.answer, isLoading: false } : q
          )
        );
      } catch (apiError: any) {
        console.error("Consultation failed:", apiError);
        
        // If the API fails, try to get a fallback answer using the stored diagnosis class
        const diagnosisClass = localStorage.getItem('lastAnalysisClass') || 'Unknown';
        const effectiveAnalysisId = analysisId || localStorage.getItem('lastAnalysisId');
        
        try {
          // Try to get a fallback response from the enhanced API service
          if (effectiveAnalysisId) {
            const fallbackResponse = await clariraiAPI.getConsultation(effectiveAnalysisId, customQuestion);
            setCustomAnswers((prev) =>
              prev.map((q, i) =>
                i === prev.length - 1 ? { ...q, answer: fallbackResponse.answer, isLoading: false } : q
              )
            );
            return;
          }
        } catch (fallbackError) {
          console.error("Fallback consultation also failed:", fallbackError);
        }
        
        // If all else fails, provide a generic fallback answer
        const fallbackAnswer = "I'm sorry, I couldn't connect to the consultation service. " +
          "Based on the analysis, I recommend discussing your specific questions with your healthcare provider. " +
          "The current diagnosis information should be reviewed with a medical professional who can provide personalized advice.";
        
        setCustomAnswers((prev) =>
          prev.map((q, i) =>
            i === prev.length - 1 ? { ...q, answer: fallbackAnswer, isLoading: false } : q
          )
        );
      }
    } catch (error: any) {
      console.error("Error submitting question:", error);
      setError("Failed to submit your question. Please try again.");
      
      // Remove the loading question if there was an error
      setCustomAnswers((prev) => prev.slice(0, -1));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            AI-Powered Q&A
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {initialQuestions.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    expandedIndex === index && "border-b",
                  )}
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="font-medium">{item.question}</h3>
                  <Button variant="ghost" size="sm" className="ml-2">
                    {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 bg-muted/30">
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {customAnswers.map((item, index) => (
              <div key={`custom-${index}`} className="border rounded-lg overflow-hidden border-primary/20 bg-primary/5">
                <div
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-primary/10 transition-colors",
                    expandedIndex === initialQuestions.length + index && "border-b",
                  )}
                  onClick={() => toggleQuestion(initialQuestions.length + index)}
                >
                  <h3 className="font-medium">{item.question}</h3>
                  <Button variant="ghost" size="sm" className="ml-2">
                    {expandedIndex === initialQuestions.length + index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedIndex === initialQuestions.length + index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 bg-primary/10">
                        <p className="text-muted-foreground">{item.answer}</p>
                        {item.isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Ask a Custom Question</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Type your question about the analysis..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting) {
                    handleSubmitQuestion(e)
                  }
                }}
                disabled={isSubmitting || !analysisId}
              />
              <Button 
                onClick={handleSubmitQuestion} 
                disabled={isSubmitting || !customQuestion.trim() || !analysisId}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              Ask specific questions about the diagnosis, treatment options, or clinical implications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
