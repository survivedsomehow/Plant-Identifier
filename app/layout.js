import './globals.css'

export const metadata = {
  title: 'Plant Identifier',
  description: 'Identify plants using AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}