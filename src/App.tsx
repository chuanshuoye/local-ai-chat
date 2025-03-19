import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import Home from './pages/home'
import ChatPage from './pages/chat'
import ChatSession from './pages/chat/[id]'
import Docs from './pages/docs'
import Workflow from './pages/workflow'
import MCP from './pages/mcp'
import Agents from './pages/agents'
import WorkflowManagePage from './pages/workflow/manage'
import MCPCreate from './pages/mcp/create'
import MCPEdit from './pages/mcp/edit/[id]'

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/chat/:id" element={<ChatSession />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/workflow" element={<Workflow />} />
                    <Route path="/workflow/manage" element={<WorkflowManagePage />} />
                    <Route path="/mcp" element={<MCP />} />
                    <Route path="/mcp/create" element={<MCPCreate />} />
                    <Route path="/mcp/edit/:id" element={<MCPEdit />} />
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    )
}

export default App 