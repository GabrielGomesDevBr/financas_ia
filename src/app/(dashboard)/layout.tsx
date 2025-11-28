import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/mobile/BottomNav'
import { ChatFloating } from '@/components/mobile/ChatFloating'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-nav md:pb-6 no-overscroll">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Floating Chat Button - shows on all pages except /chat */}
      <ChatFloating hideOnPaths={['/chat']} />
    </div>
  )
}
