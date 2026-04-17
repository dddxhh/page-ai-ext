import { defineConfig } from 'wxt';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  manifest: {
    version: '1.0.0',
    permissions: [
      'storage',
      'activeTab',
      'scripting',
      'tabs',
      'sidePanel'
    ],
    host_permissions: ['*://*/*'],
    side_panel: {
      default_title: 'AI Assistant',
      default_path: 'sidebar.html'
    },
    commands: {
      toggleSidebar: {
        description: '切换侧边栏',
        suggested_key: {
          default: 'Ctrl+Shift+A',
          mac: 'Cmd+Shift+A'
        }
      },
      newConversation: {
        description: '新建对话',
        suggested_key: {
          default: 'Ctrl+Shift+N',
          mac: 'Cmd+Shift+N'
        }
      }
    }
  },
  vite: () => ({
    plugins: [vue()]
  })
});
