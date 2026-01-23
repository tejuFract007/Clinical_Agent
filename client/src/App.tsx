import { useState } from 'react';
import { Sidebar } from './components/SideBar';
import { ConsultantDashboardPage } from './pages/ConsultantDashboard';
import { Drawer } from './components/Drawer/Drawer';
import { AiAgentContent } from './components/AiAgentContent';

function App() {
  const [isAgentOpen, setAgentOpen] = useState(false);

  return (
    <div className="flex flex-row min-h-screen bg-[#F8FAFC]">
      {/* 1. Sidebar */}
      <Sidebar onOpenAgent={() => setAgentOpen(true)} />

      {/* 2. Main Content */}
      <main className="flex-1">
        <ConsultantDashboardPage />
      </main>

      {/* 3. AI Agent Drawer */}
      <Drawer
        open={isAgentOpen}
        onClose={() => setAgentOpen(false)}
        position="right"
        width="w-[500px]" // Wider drawer for chat
      >
        <AiAgentContent />
      </Drawer>
    </div>
  )
}

export default App
