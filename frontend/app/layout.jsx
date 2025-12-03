import './globals.css'

export const metadata = {
  title: 'VibeAI App Builder',
  description: 'AI-powered app development platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
