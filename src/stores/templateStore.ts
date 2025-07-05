import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { PanelLayout, PanelComponent } from '../types/panel';

// Panel template interface
export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  
  // Template data
  panels: PanelLayout[];
  metadata: {
    version: string;
    author?: string;
    createdAt: number;
    updatedAt: number;
    usageCount: number;
    rating?: number;
    thumbnail?: string;
  };
  
  // Template configuration
  settings: {
    autoResize: boolean;
    maintainAspectRatio: boolean;
    allowOverlap: boolean;
    snapToGrid: boolean;
  };
  
  // Validation and compatibility
  validation: {
    minPanels: number;
    maxPanels: number;
    requiredComponents: PanelComponent[];
    compatibleVersions: string[];
  };
}

// Template categories
export enum TemplateCategory {
  Dashboard = 'dashboard',
  ChatFocused = 'chat-focused',
  Productivity = 'productivity',
  Development = 'development',
  Analytics = 'analytics',
  Creative = 'creative',
  Custom = 'custom',
}

// Template store state
interface TemplateState {
  // Templates data
  templates: PanelTemplate[];
  categories: TemplateCategory[];
  
  // Current state
  activeTemplateId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Filter and search
  searchQuery: string;
  selectedCategory: TemplateCategory | null;
  selectedTags: string[];
  
  // CRUD operations
  createTemplate: (name: string, description: string, panels: PanelLayout[], category: TemplateCategory) => string;
  updateTemplate: (id: string, updates: Partial<PanelTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string, newName?: string) => string;
  
  // Template operations
  loadTemplate: (id: string) => PanelTemplate | null;
  applyTemplate: (id: string) => PanelLayout[];
  generateThumbnail: (id: string) => Promise<string>;
  
  // Search and filter
  searchTemplates: (query: string) => void;
  filterByCategory: (category: TemplateCategory | null) => void;
  filterByTags: (tags: string[]) => void;
  getFilteredTemplates: () => PanelTemplate[];
  
  // Import/Export
  exportTemplate: (id: string) => string;
  importTemplate: (templateData: string) => Promise<string>;
  exportAllTemplates: () => string;
  importTemplates: (templatesData: string) => Promise<number>;
  
  // Predefined templates
  createPredefinedTemplates: () => void;
  resetTemplates: () => void;
  
  // Validation
  validateTemplate: (template: Partial<PanelTemplate>) => { isValid: boolean; errors: string[] };
  
  // Statistics
  getTemplateStats: () => {
    totalTemplates: number;
    categoryCounts: Record<TemplateCategory, number>;
    mostUsed: PanelTemplate[];
    recentlyCreated: PanelTemplate[];
  };
  
  // Auto-save and recovery
  enableAutoSave: (enabled: boolean) => void;
  recoverUnsavedChanges: () => PanelTemplate[];
}

// Predefined template configurations
const PREDEFINED_TEMPLATES: Omit<PanelTemplate, 'id' | 'metadata'>[] = [
  {
    name: 'Dashboard Layout',
    description: 'Balanced layout with all panel types for general productivity',
    category: TemplateCategory.Dashboard,
    tags: ['balanced', 'general', 'productivity'],
    panels: [
      {
        id: 'smart-hub-main',
        component: PanelComponent.SmartHub,
        position: { x: 50, y: 50 },
        size: { width: 350, height: 250 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 300, height: 200 } },
        metadata: { title: 'Smart Hub', icon: '🔗', color: '#3B82F6' },
      },
      {
        id: 'ai-chat-main',
        component: PanelComponent.AIChat,
        position: { x: 450, y: 50 },
        size: { width: 400, height: 350 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 350, height: 300 } },
        metadata: { title: 'AI Assistant', icon: '🤖', color: '#10B981' },
      },
      {
        id: 'task-manager-main',
        component: PanelComponent.TaskManager,
        position: { x: 50, y: 350 },
        size: { width: 300, height: 300 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 250, height: 200 } },
        metadata: { title: 'Tasks', icon: '📋', color: '#F59E0B' },
      },
      {
        id: 'productivity-main',
        component: PanelComponent.Productivity,
        position: { x: 900, y: 50 },
        size: { width: 250, height: 400 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 200, height: 300 } },
        metadata: { title: 'Tools', icon: '⚡', color: '#8B5CF6' },
      },
    ],
    settings: {
      autoResize: true,
      maintainAspectRatio: false,
      allowOverlap: false,
      snapToGrid: true,
    },
    validation: {
      minPanels: 3,
      maxPanels: 6,
      requiredComponents: [PanelComponent.SmartHub, PanelComponent.AIChat],
      compatibleVersions: ['2.0.0'],
    },
  },
  {
    name: 'Chat-Focused Layout',
    description: 'Optimized for AI conversation with supporting panels',
    category: TemplateCategory.ChatFocused,
    tags: ['chat', 'ai', 'conversation'],
    panels: [
      {
        id: 'ai-chat-large',
        component: PanelComponent.AIChat,
        position: { x: 200, y: 50 },
        size: { width: 600, height: 500 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 500, height: 400 } },
        metadata: { title: 'AI Chat', icon: '🤖', color: '#10B981' },
      },
      {
        id: 'smart-hub-side',
        component: PanelComponent.SmartHub,
        position: { x: 50, y: 50 },
        size: { width: 120, height: 300 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 100, height: 200 } },
        metadata: { title: 'Quick Links', icon: '🔗', color: '#3B82F6' },
      },
      {
        id: 'productivity-side',
        component: PanelComponent.Productivity,
        position: { x: 850, y: 50 },
        size: { width: 120, height: 300 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 100, height: 200 } },
        metadata: { title: 'Tools', icon: '⚡', color: '#8B5CF6' },
      },
    ],
    settings: {
      autoResize: true,
      maintainAspectRatio: true,
      allowOverlap: false,
      snapToGrid: false,
    },
    validation: {
      minPanels: 2,
      maxPanels: 4,
      requiredComponents: [PanelComponent.AIChat],
      compatibleVersions: ['2.0.0'],
    },
  },
  {
    name: 'Productivity Workspace',
    description: 'Task-focused layout for maximum productivity',
    category: TemplateCategory.Productivity,
    tags: ['tasks', 'productivity', 'workflow'],
    panels: [
      {
        id: 'task-manager-large',
        component: PanelComponent.TaskManager,
        position: { x: 50, y: 50 },
        size: { width: 500, height: 400 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 400, height: 300 } },
        metadata: { title: 'Task Manager', icon: '📋', color: '#F59E0B' },
      },
      {
        id: 'productivity-tools',
        component: PanelComponent.Productivity,
        position: { x: 600, y: 50 },
        size: { width: 350, height: 400 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 300, height: 300 } },
        metadata: { title: 'Productivity Tools', icon: '⚡', color: '#8B5CF6' },
      },
      {
        id: 'smart-hub-bottom',
        component: PanelComponent.SmartHub,
        position: { x: 50, y: 500 },
        size: { width: 900, height: 150 },
        zIndex: 1,
        visible: true,
        constraints: { minSize: { width: 600, height: 100 } },
        metadata: { title: 'Quick Access', icon: '🔗', color: '#3B82F6' },
      },
    ],
    settings: {
      autoResize: false,
      maintainAspectRatio: false,
      allowOverlap: false,
      snapToGrid: true,
    },
    validation: {
      minPanels: 2,
      maxPanels: 5,
      requiredComponents: [PanelComponent.TaskManager, PanelComponent.Productivity],
      compatibleVersions: ['2.0.0'],
    },
  },
];

// Create template store
export const useTemplateStore = create<TemplateState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        templates: [],
        categories: Object.values(TemplateCategory),
        activeTemplateId: null,
        isLoading: false,
        error: null,
        searchQuery: '',
        selectedCategory: null,
        selectedTags: [],

        // CRUD operations
        createTemplate: (name, description, panels, category) => {
          const id = `template-${nanoid()}`;
          const now = Date.now();
          
          const template: PanelTemplate = {
            id,
            name,
            description,
            category,
            tags: [],
            panels: panels.map(panel => ({ ...panel, id: `${panel.id}-${nanoid(6)}` })),
            metadata: {
              version: '2.0.0',
              createdAt: now,
              updatedAt: now,
              usageCount: 0,
              thumbnail: '',
            },
            settings: {
              autoResize: true,
              maintainAspectRatio: false,
              allowOverlap: false,
              snapToGrid: true,
            },
            validation: {
              minPanels: 1,
              maxPanels: 10,
              requiredComponents: [],
              compatibleVersions: ['2.0.0'],
            },
          };

          set(state => ({
            templates: [...state.templates, template],
            activeTemplateId: id,
          }));

          return id;
        },

        updateTemplate: (id, updates) => {
          set(state => ({
            templates: state.templates.map(template =>
              template.id === id
                ? {
                    ...template,
                    ...updates,
                    metadata: {
                      ...template.metadata,
                      ...updates.metadata,
                      updatedAt: Date.now(),
                    },
                  }
                : template
            ),
          }));
        },

        deleteTemplate: (id) => {
          set(state => ({
            templates: state.templates.filter(template => template.id !== id),
            activeTemplateId: state.activeTemplateId === id ? null : state.activeTemplateId,
          }));
        },

        duplicateTemplate: (id, newName) => {
          const template = get().templates.find(t => t.id === id);
          if (!template) return '';

          const newId = `template-${nanoid()}`;
          const now = Date.now();
          
          const duplicatedTemplate: PanelTemplate = {
            ...template,
            id: newId,
            name: newName || `${template.name} (Copy)`,
            panels: template.panels.map(panel => ({
              ...panel,
              id: `${panel.id.split('-')[0]}-${nanoid(6)}`,
            })),
            metadata: {
              ...template.metadata,
              createdAt: now,
              updatedAt: now,
              usageCount: 0,
            },
          };

          set(state => ({
            templates: [...state.templates, duplicatedTemplate],
          }));

          return newId;
        },

        // Template operations
        loadTemplate: (id) => {
          return get().templates.find(template => template.id === id) || null;
        },

        applyTemplate: (id) => {
          const template = get().loadTemplate(id);
          if (!template) return [];

          // Update usage count
          get().updateTemplate(id, {
            metadata: {
              ...template.metadata,
              usageCount: template.metadata.usageCount + 1,
            },
          });

          return template.panels;
        },

        generateThumbnail: async (id) => {
          // Mock thumbnail generation - in real implementation this would capture the layout
          const template = get().loadTemplate(id);
          if (!template) return '';
          
          // Generate a simple thumbnail based on panel layout
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 150;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw background
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, 200, 150);
            
            // Draw simplified panel representations
            template.panels.forEach((panel, index) => {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
              ctx.fillStyle = colors[index % colors.length];
              
              const x = (panel.position.x / 1000) * 180 + 10;
              const y = (panel.position.y / 600) * 130 + 10;
              const w = Math.max(20, (panel.size.width / 1000) * 180);
              const h = Math.max(15, (panel.size.height / 600) * 130);
              
              ctx.fillRect(x, y, w, h);
            });
          }
          
          const thumbnail = canvas.toDataURL();
          
          // Update template with thumbnail
          get().updateTemplate(id, {
            metadata: {
              ...template.metadata,
              thumbnail,
            },
          });
          
          return thumbnail;
        },

        // Search and filter
        searchTemplates: (query) => {
          set({ searchQuery: query });
        },

        filterByCategory: (category) => {
          set({ selectedCategory: category });
        },

        filterByTags: (tags) => {
          set({ selectedTags: tags });
        },

        getFilteredTemplates: () => {
          const { templates, searchQuery, selectedCategory, selectedTags } = get();
          
          return templates.filter(template => {
            // Search query filter
            if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !template.description.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }
            
            // Category filter
            if (selectedCategory && template.category !== selectedCategory) {
              return false;
            }
            
            // Tags filter
            if (selectedTags.length > 0 && !selectedTags.some(tag => template.tags.includes(tag))) {
              return false;
            }
            
            return true;
          });
        },

        // Import/Export
        exportTemplate: (id) => {
          const template = get().loadTemplate(id);
          if (!template) return '';
          
          return JSON.stringify(template, null, 2);
        },

        importTemplate: async (templateData) => {
          try {
            const template = JSON.parse(templateData) as PanelTemplate;
            
            // Validate template
            const validation = get().validateTemplate(template);
            if (!validation.isValid) {
              throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
            }
            
            // Generate new ID and update metadata
            const newId = `template-${nanoid()}`;
            const now = Date.now();
            
            const importedTemplate: PanelTemplate = {
              ...template,
              id: newId,
              metadata: {
                ...template.metadata,
                createdAt: now,
                updatedAt: now,
                usageCount: 0,
              },
            };
            
            set(state => ({
              templates: [...state.templates, importedTemplate],
            }));
            
            return newId;
          } catch (error) {
            set({ error: `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}` });
            throw error;
          }
        },

        exportAllTemplates: () => {
          const { templates } = get();
          return JSON.stringify(templates, null, 2);
        },

        importTemplates: async (templatesData) => {
          try {
            const templates = JSON.parse(templatesData) as PanelTemplate[];
            let importedCount = 0;
            
            for (const template of templates) {
              try {
                await get().importTemplate(JSON.stringify(template));
                importedCount++;
              } catch (error) {
                console.warn(`Failed to import template ${template.name}:`, error);
              }
            }
            
            return importedCount;
          } catch (error) {
            set({ error: `Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}` });
            throw error;
          }
        },

        // Predefined templates
        createPredefinedTemplates: () => {
          const existingTemplates = get().templates;
          const now = Date.now();
          
          const predefinedTemplates: PanelTemplate[] = PREDEFINED_TEMPLATES.map(template => ({
            ...template,
            id: `template-${nanoid()}`,
            metadata: {
              version: '2.0.0',
              author: 'Lucaverse',
              createdAt: now,
              updatedAt: now,
              usageCount: 0,
              thumbnail: '',
            },
          }));
          
          set({
            templates: [...existingTemplates, ...predefinedTemplates],
          });
        },

        resetTemplates: () => {
          set({
            templates: [],
            activeTemplateId: null,
            searchQuery: '',
            selectedCategory: null,
            selectedTags: [],
            error: null,
          });
        },

        // Validation
        validateTemplate: (template) => {
          const errors: string[] = [];
          
          if (!template.name?.trim()) {
            errors.push('Template name is required');
          }
          
          if (!template.description?.trim()) {
            errors.push('Template description is required');
          }
          
          if (!template.panels || template.panels.length === 0) {
            errors.push('Template must contain at least one panel');
          }
          
          if (template.validation?.minPanels && template.panels && template.panels.length < template.validation.minPanels) {
            errors.push(`Template must contain at least ${template.validation.minPanels} panels`);
          }
          
          if (template.validation?.maxPanels && template.panels && template.panels.length > template.validation.maxPanels) {
            errors.push(`Template cannot contain more than ${template.validation.maxPanels} panels`);
          }
          
          return {
            isValid: errors.length === 0,
            errors,
          };
        },

        // Statistics
        getTemplateStats: () => {
          const { templates } = get();
          
          const categoryCounts = Object.values(TemplateCategory).reduce(
            (acc, category) => ({
              ...acc,
              [category]: templates.filter(t => t.category === category).length,
            }),
            {} as Record<TemplateCategory, number>
          );
          
          const mostUsed = templates
            .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
            .slice(0, 5);
          
          const recentlyCreated = templates
            .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt)
            .slice(0, 5);
          
          return {
            totalTemplates: templates.length,
            categoryCounts,
            mostUsed,
            recentlyCreated,
          };
        },

        // Auto-save and recovery
        enableAutoSave: (enabled) => {
          // Implementation would depend on specific requirements
          console.log('Auto-save', enabled ? 'enabled' : 'disabled');
        },

        recoverUnsavedChanges: () => {
          // Mock implementation - would recover from localStorage or IndexedDB
          return [];
        },
      })),
      {
        name: 'template-store',
        version: 1,
      }
    ),
    {
      name: 'template-store',
    }
  )
);