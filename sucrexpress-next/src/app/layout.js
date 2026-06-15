import './globals.css'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ToastProvider from '@/components/common/ToastProvider'

export const metadata = {
  title: 'Sucrexpress 2.0',
  description: 'Sistema de Logística y Entrega de Paquetería',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Font Awesome - necesario para íconos fas fa-* en BandejaEntrada, Sincronizaciones, etc. */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Boxicons - para íconos bx bxs-* usados en Login y otros componentes */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="App">
          {children}
        </div>
        <ToastProvider />
      </body>
    </html>
  )
}
