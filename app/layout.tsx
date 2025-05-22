import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { HistoricoProvider } from "@/hooks/use-historico"

export const metadata: Metadata = {
  title: "Sistema de Comandas",
  description: "Sistema de comandas para restaurantes",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <HistoricoProvider>
            {children}
            <Toaster />
          </HistoricoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
