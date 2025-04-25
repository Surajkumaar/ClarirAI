"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SeverityGaugeProps {
  value: number
}

export default function SeverityGauge({ value }: SeverityGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    // Animate the gauge value
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  // Calculate the color based on the value
  const getColor = (val: number) => {
    if (val < 20) return "bg-green-500"
    if (val < 40) return "bg-yellow-500"
    if (val < 60) return "bg-orange-500"
    if (val < 80) return "bg-red-500"
    return "bg-red-700"
  }

  // Calculate the label based on the value
  const getLabel = (val: number) => {
    if (val < 20) return "Minimal"
    if (val < 40) return "Mild"
    if (val < 60) return "Moderate"
    if (val < 80) return "Severe"
    return "Critical"
  }

  return (
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", getColor(animatedValue))}
          initial={{ width: "0%" }}
          animate={{ width: `${animatedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{getLabel(animatedValue)}</span>
        <span className="text-sm font-bold"> {animatedValue}/100</span>
      </div>
    </div>
  )
}
