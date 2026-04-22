import type { Metadata } from 'next'
import { Space_Grotesk, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: 'Mesh Atelier - Premium AI 3D Generation',
  description: 'Generate clean, polished 3D assets from prompts with a premium multi-page studio experience.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_space.variable} ${_playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(245,158,11,.10),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(37,99,235,.12),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,.09),transparent_35%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(245,158,11,.08),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(37,99,235,.15),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,.12),transparent_35%)]" />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
