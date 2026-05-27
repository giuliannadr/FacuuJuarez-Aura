'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'

export function DynamicToaster() {
  const { resolvedTheme } = useTheme()
  return <Toaster theme={resolvedTheme === 'light' ? 'light' : 'dark'} position="bottom-right" />
}
