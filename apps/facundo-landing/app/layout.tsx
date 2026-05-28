import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import PageLoader from '@/components/PageLoader'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Facuu Juarez — DJ & Productor | Tucumán',
  description:
    'DJ y productor musical con más de 8 años de experiencia en bodas, fiestas y eventos corporativos en el NOA. Reservá una reunión.',
  openGraph: {
    title: 'Facuu Juarez — DJ & Productor',
    description: 'Música para cada momento. Reservá una reunión.',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-zinc-900">
        <PageLoader />
        {children}
      </body>
    </html>
  )
}
