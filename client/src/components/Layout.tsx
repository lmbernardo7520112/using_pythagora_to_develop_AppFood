import { ReactNode } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 ml-64">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}