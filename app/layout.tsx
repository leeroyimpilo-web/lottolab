import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { AppProviders } from '@/components/app/app-providers'
import { AppShell } from '@/components/app/app-shell'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LottoLab — South African Lottery Research Lab',
  description:
    'Latest South African Lotto, PowerBall and Daily Lotto results, number statistics, a smart number generator and a personal ticket checker.',
  generator: 'v0.app',
  applicationName: 'LottoLab',
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#087f4c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <AppProviders>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" theme="light" richColors />
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
