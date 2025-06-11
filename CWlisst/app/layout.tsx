import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Content Lens Manager',
  description: 'Salesforce Content Lens Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}