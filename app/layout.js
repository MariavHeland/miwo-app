import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'MIWO — my world my news',
  description: 'Conversational news intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Literata:ital,opsz,wght@0,7..72,300..700;1,7..72,300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <footer className="site-footer">
          <a href="/impressum" className="footer-link">Impressum</a>
          <span className="footer-sep">&middot;</span>
          <span>&copy; {new Date().getFullYear()} Tindra Film GbR</span>
          <span className="footer-sep">&middot;</span>
          <span>MIWO&thinsp;&trade;</span>
        </footer>
      </body>
    </html>
  )
}
