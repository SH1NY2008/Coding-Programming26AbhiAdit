import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="py-12 border-t bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">BYTE-SIZED<span className="text-primary">BOOST</span></span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Created for FBLA Coding & Programming Competition
          </p>
          <div className="flex items-center gap-8">
            <Link
              href="/help"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/reports"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Reports
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
