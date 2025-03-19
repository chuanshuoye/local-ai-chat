import { http } from 'msw';
import {
  handleOllamaRequest
} from './ai/ollama';
import { 
  handleGetAgents, 
  handleCreateAgent, 
  handleGetAgent, 
  handleUpdateAgent, 
  handleDeleteAgent 
} from './ai/agents';
import {
  handleGetWorkflows,
  handleCreateWorkflow,
  handleGetWorkflow,
  handleUpdateWorkflow,
  handleDeleteWorkflow,
  handleGetWorkflowsByAgent
} from './ai/workflows';
import {
  handleGetMCPServices,
  handleCreateMCPService,
  handleGetMCPService,
  handleUpdateMCPService,
  handleDeleteMCPService
} from './ai/mcp';

export const handlers = [
  // chat ollama API
  http.post('/api/chat', handleOllamaRequest),
  // Agents API
  http.get('/api/agents', handleGetAgents),
  http.post('/api/agents', handleCreateAgent),
  http.get('/api/agents/:id', handleGetAgent),
  http.put('/api/agents/:id', handleUpdateAgent),
  http.delete('/api/agents/:id', handleDeleteAgent),

  // Workflows API
  http.get('/api/workflows', handleGetWorkflows),
  http.post('/api/workflows', handleCreateWorkflow),
  http.get('/api/workflows/:id', handleGetWorkflow),
  http.put('/api/workflows/:id', handleUpdateWorkflow),
  http.delete('/api/workflows/:id', handleDeleteWorkflow),
  http.get('/api/workflows/by-agent', handleGetWorkflowsByAgent),
  
  // MCP API
  http.get('/api/mcp', handleGetMCPServices),
  http.post('/api/mcp', handleCreateMCPService),
  http.get('/api/mcp/:id', handleGetMCPService),
  http.put('/api/mcp/:id', handleUpdateMCPService),
  http.delete('/api/mcp/:id', handleDeleteMCPService),
]; 
