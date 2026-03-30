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
      default_title: 'AI Assistant'
    }
  },
  firefox: {
    profile: 'web-ext-dev'
  },
  vite: () => ({
    plugins: [vue()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    }
  })
});
