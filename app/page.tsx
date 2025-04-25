"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Eye, FileText, Upload } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-80px)]">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/retina-background.jpg"
            alt="Retina background"
            fill
            className="object-cover opacity-100"
            priority
            quality={100}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-teal-800/10 to-background/80" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-32 sm:py-48 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-white drop-shadow-md">ClarirAI</h1>
              <p className="mt-6 text-xl leading-8 text-white/90 drop-shadow">
                Advanced AI-powered diabetic retinopathy detection and analysis system designed for medical
                professionals.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
                  <Link href="/analysis">
                    Start Analysis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link href="#features" className="group inline-flex items-center gap-1 text-sm font-medium text-white hover:text-white/80">
                  Learn More <ArrowRight className="h-4 w-4 mt-0.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-teal-800">Advanced Retinal Analysis</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              ClarirAI provides state-of-the-art diabetic retinopathy detection with clinical-grade accuracy and
              detailed explanations.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7">
                  <Upload className="h-6 w-6 flex-none text-teal-600" aria-hidden="true" />
                  Image Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Upload retinal images for instant AI-powered analysis with detailed severity classification.
                  </p>
                </dd>
              </motion.div>

              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7">
                  <Eye className="h-6 w-6 flex-none text-teal-600" aria-hidden="true" />
                  Clinical Dashboard
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    View comprehensive analysis results with severity gauges and clinical explanations.
                  </p>
                </dd>
              </motion.div>

              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7">
                  <FileText className="h-6 w-6 flex-none text-teal-600" aria-hidden="true" />
                  Medical Reports
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Generate professional medical reports with detailed findings and recommendations.
                  </p>
                </dd>
              </motion.div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
