import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MCP_SERVICES, STORAGE_KEYS, DEFAULT_MCP_SERVICE_ID } from '@/constants';

// MCP服务数据结构
export interface MCPService {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoint?: string;
  apiKey?: string;
  parameters?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  isSystem?: boolean; // 是否为系统预设服务
}

// 定义存储状态类型
interface MCPState {
  services: MCPService[];
  selectedServiceId: string;
  isLoading: boolean;
  error: string | null;
  
  // CRUD 操作
  fetchServices: () => Promise<void>;
  addService: (service: Omit<MCPService, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateService: (id: string, updates: Partial<Omit<MCPService, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>>) => void;
  removeService: (id: string) => void;
  
  // 选择服务
  selectService: (id: string) => void;
  
  // 获取方法
  getService: (id: string) => MCPService | undefined;
  getSelectedService: () => MCPService | undefined;
  
  // 状态管理
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// 获取预设的MCP服务
const getDefaultServices = (): MCPService[] => {
  return MCP_SERVICES.map(service => ({
    ...service,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isSystem: true
  }));
};

// 创建MCP服务存储
export const useMCPStore = create<MCPState>()(
  persist(
    immer((set, get) => ({
      services: getDefaultServices(),
      selectedServiceId: DEFAULT_MCP_SERVICE_ID,
      isLoading: false,
      error: null,
      
      // 获取MCP服务列表
      fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/mcp');
          const result = await response.json();
          
          if (result.success) {
            // 合并预设服务和自定义服务
            const systemServices = getDefaultServices();
            const customServices = result.data.filter(
              (s: MCPService) => !systemServices.some(ss => ss.id === s.id)
            );
            
            set(state => {
              state.services = [...systemServices, ...customServices];
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '获取MCP服务列表失败');
          }
        } catch (err) {
          console.error('获取MCP服务失败:', err);
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
        }
      },
      
      // 添加新的MCP服务
      addService: (serviceData) => {
        const id = `mcp-custom-${Date.now()}`;
        const now = Date.now();
        
        const newService: MCPService = {
          ...serviceData,
          id,
          createdAt: now,
          updatedAt: now
        };
        
        set(state => {
          state.services.push(newService);
        });
        
        return id;
      },
      
      // 更新MCP服务
      updateService: (id, updates) => {
        set(state => {
          const service = state.services.find(s => s.id === id);
          if (service && !service.isSystem) {
            Object.assign(service, updates, { updatedAt: Date.now() });
          }
        });
      },
      
      // 删除MCP服务
      removeService: (id) => {
        set(state => {
          const index = state.services.findIndex(s => s.id === id && !s.isSystem);
          if (index !== -1) {
            state.services.splice(index, 1);
            
            // 如果删除的是当前选中的服务，选择第一个可用服务
            if (state.selectedServiceId === id) {
              state.selectedServiceId = state.services.length > 0 
                ? state.services[0].id 
                : DEFAULT_MCP_SERVICE_ID;
            }
          }
        });
      },
      
      // 选择MCP服务
      selectService: (id) => {
        const service = get().getService(id);
        if (service) {
          set({ selectedServiceId: id });
        }
      },
      
      // 获取指定MCP服务
      getService: (id) => {
        return get().services.find(s => s.id === id);
      },
      
      // 获取当前选中的MCP服务
      getSelectedService: () => {
        return get().getService(get().selectedServiceId);
      },
      
      // 设置加载状态
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      // 设置错误信息
      setError: (error) => {
        set({ error });
      }
    })),
    {
      name: STORAGE_KEYS.MCP,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        services: state.services.filter(s => !s.isSystem), // 只持久化用户自定义的服务
        selectedServiceId: state.selectedServiceId,
      }),
    }
  )
); 