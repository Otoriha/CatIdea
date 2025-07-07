'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ToastProvider } from '@/contexts/ToastContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      suppressHydrationWarning
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </NextThemesProvider>
  )
}