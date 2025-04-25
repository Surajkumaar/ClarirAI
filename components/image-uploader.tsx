"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string, file: File) => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
}

export default function ImageUploader({ onImageUpload, isUploading, setIsUploading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [])

  const handleFiles = useCallback(
    (files: FileList) => {
      const file = files[0]

      if (!file.type.match("image.*")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG).",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string, file)
          setIsUploading(false)
        }
      }
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "There was an error reading the uploaded file.",
          variant: "destructive",
        })
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload, setIsUploading, toast],
  )

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "relative",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/jpeg,image/png"
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 1.05 : 1 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-10 w-10 text-primary" />
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">{isUploading ? "Uploading..." : "Upload Retinal Image"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isUploading ? "Processing your image..." : "Drag and drop your image here, or click to browse"}
              </p>
            </div>

            {!isUploading && (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
                Select File
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Supported file types: JPG, PNG</p>
        <p>Maximum file size: 10MB</p>
        <p>For best results, use high-resolution retinal images</p>
      </div>
    </div>
  )
}
