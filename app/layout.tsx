import Sidebar from '@/components/Sidebar'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-slate-50 min-h-screen text-slate-800">
        <div className="flex">
          <Sidebar />
          {/* Main Content Area */}
          <main className="flex-1 ml-64 min-h-screen p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}