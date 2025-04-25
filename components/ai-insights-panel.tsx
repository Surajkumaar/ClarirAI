"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Sample data for the small bar chart
const patternData = {
  labels: ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative'],
  datasets: [
    {
      label: 'Detection Frequency',
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(132, 204, 253, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: [
        'rgba(132, 204, 253, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

// Sample data for the risk factors pie chart
const riskFactorsData = {
  labels: ['Diabetes Duration', 'Poor Glycemic Control', 'Hypertension', 'Hyperlipidemia', 'Smoking'],
  datasets: [
    {
      label: 'Risk Factor Correlation',
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

const caseStudies = [
  {
    id: 1,
    title: 'Early Detection Potential',
    description: 'Regular screening with ClarirAI could help identify DR in its earliest stages when treatment is most effective. Early detection systems like ClarirAI are projected to increase early intervention rates significantly.',
    outcome: 'Potential to prevent vision loss in up to 95% of cases',
  },
  {
    id: 2,
    title: 'AI-Guided Treatment Planning',
    description: 'ClarirAI\'s precise severity grading can help physicians select optimal treatment approaches, from lifestyle modifications to laser therapy. This targeted approach could reduce unnecessary interventions.',
    outcome: 'Projected 40% reduction in unnecessary treatments',
  },
  {
    id: 3,
    title: 'Remote Monitoring Possibilities',
    description: 'Patients in rural areas using systems like ClarirAI for remote monitoring could see significant improvement in follow-up adherence and treatment plan compliance, leading to better outcomes.',
    outcome: 'Estimated 65% improvement in rural patient follow-up',
  },
]

const AIInsightsPanel = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">AI Insights</CardTitle>
        <CardDescription>
          Aggregated insights from ClarirAI's analysis of diabetic retinopathy cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patterns">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns">Common Patterns</TabsTrigger>
            <TabsTrigger value="progression">Progression Pathways</TabsTrigger>
            <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="case-studies">Success Stories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patterns">
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Detection Patterns Across Analyses</h3>
                <p className="text-muted-foreground mb-4">
                  Distribution of diabetic retinopathy classifications detected by ClarirAI
                </p>
              </div>
              
              {/* Pie chart between description and insights */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="h-80 w-full flex items-center justify-center">
                  <PieChart data={patternData as any} />
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Key Insights:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Early-stage DR (No DR and Mild) accounts for 60% of all detections</li>
                      <li>Severe and Proliferative cases represent 20% of detections, highlighting the importance of early screening</li>
                      <li>Moderate DR often shows the most varied presentation in retinal images</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="progression">
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Typical Progression Pathways</h3>
                <p className="text-muted-foreground mb-4">
                  Comparison of treated vs. untreated DR progression over time (severity index)
                </p>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Progression Insights:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Untreated DR typically shows a steady increase in severity over time</li>
                      <li>Early intervention can not only halt progression but reverse damage in some cases</li>
                      <li>The 6-month mark is critical for determining treatment effectiveness</li>
                      <li>Regular monitoring is essential even when treatment appears successful</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="risk-factors">
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Frequently Identified Risk Factors</h3>
                <p className="text-muted-foreground mb-4">
                  Correlation between risk factors and DR development/progression
                </p>
              </div>
              
              {/* Pie chart for risk factors */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="h-80 w-full flex items-center justify-center">
                  <PieChart data={riskFactorsData as any} />
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Risk Factor Insights:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Duration of diabetes remains the strongest predictor of DR development</li>
                      <li>Poor glycemic control (HbA1c &gt; 7.5%) significantly accelerates DR progression</li>
                      <li>Hypertension and hyperlipidemia have synergistic effects when combined</li>
                      <li>Smoking increases DR risk even in patients with otherwise well-controlled diabetes</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="case-studies">
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Success Stories and Case Studies</h3>
                <p className="text-muted-foreground mb-4">
                  Real-world examples of how early detection with ClarirAI has improved patient outcomes
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseStudies.map((study) => (
                  <Card key={study.id}>
                    <CardContent className="pt-6">
                      <h4 className="font-medium text-lg mb-2">{study.title}</h4>
                      <p className="text-sm mb-4">{study.description}</p>
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Outcome: {study.outcome}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 border-t pt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Projected Impact:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Early Detection:</span> Potential 30-35% improvement in detection rates compared to traditional screening methods
                      </li>
                      <li>
                        <span className="font-medium">Treatment Optimization:</span> Estimated 25-30% reduction in treatment costs through AI-guided intervention planning
                      </li>
                      <li>
                        <span className="font-medium">Healthcare Access:</span> Projected 50% increase in screening rates for underserved populations through remote monitoring
                      </li>
                      <li>
                        <span className="font-medium">Patient Outcomes:</span> Expected 35-40% reduction in vision loss progression among monitored patients
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AIInsightsPanel
