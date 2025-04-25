import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import RetinaBackground from "@/components/ui/retina-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClarirAI - Diabetic Retinopathy Detection",
  description: "AI-powered diabetic retinopathy detection and analysis system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <RetinaBackground overlay opacity="none" className="min-h-screen">
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </RetinaBackground>
        </ThemeProvider>
      </body>
    </html>
  )
}
