import Link from "next/link"
import { Eye } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            Contact
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-primary">ClarirAI</span>
          </div>
          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} ClarirAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
