"use client"

import { motion } from "framer-motion"
import AIInsightsPanel from "@/components/ai-insights-panel"

export default function ReportsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-muted-foreground mt-1">Aggregated insights from ClarirAI's analysis of diabetic retinopathy cases</p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel />
      </motion.div>
    </div>
  )
}
