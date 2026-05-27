import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from '@/components/providers'
import { DynamicToaster } from '@/components/dynamic-toaster'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AURA Admin',
  description: 'Panel de administración — AURA Agency',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geist.className} bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}
      >
        <Providers>
          {children}
          <DynamicToaster />
        </Providers>
      </body>
    </html>
  )
}
