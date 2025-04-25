"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import ImageUploader from "@/components/image-uploader"
import ApiStatus from "@/components/api-status"
import clariraiAPI from "@/lib/api"

export default function AnalysisPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleImageUpload = (imageDataUrl: string, file: File) => {
    setSelectedImage(imageDataUrl)
    setSelectedFile(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload a retinal image first.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Store the image data URL in localStorage for display on the dashboard
      if (selectedImage) {
        localStorage.setItem('lastAnalysisImage', selectedImage);
      }

      console.log('Sending file for analysis:', selectedFile.name, selectedFile.type, selectedFile.size);
      const result = await clariraiAPI.analyzeImage(selectedFile)
      
      // Store the analysis ID in localStorage for future reference
      if (result && result.analysis_id) {
        localStorage.setItem('lastAnalysisId', result.analysis_id);
      }

      toast({
        title: "Analysis complete",
        description: "Retinal image analyzed successfully.",
      })

      // Navigate to results page with the analysis ID
      if (result && result.analysis_id) {
        router.push(`/dashboard?analysis_id=${result.analysis_id}`)
      } else {
        // Fallback to demo mode if no analysis ID is returned
        router.push("/dashboard?demo=true")
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container max-w-7xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Retinal Image Analysis</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a high-quality retinal image for AI-powered diabetic retinopathy detection and analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <ImageUploader
                onImageUpload={handleImageUpload}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Image Preview</h3>
                <div
                  className={cn(
                    "relative aspect-square rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50",
                    selectedImage ? "border-primary" : "border-muted-foreground/25",
                  )}
                >
                  {selectedImage ? (
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Retinal image preview"
                      fill
                      className="object-contain p-2 rounded-md"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">No image selected</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!selectedImage || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Image
                      <Upload className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    For clinical use only
                  </p>
                  <p className="mt-1">
                    Upload high-quality retinal images for best results. Supported formats: JPG, PNG.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ApiStatus />
      </motion.div>
    </div>
  )
}
