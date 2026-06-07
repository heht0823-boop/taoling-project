import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableDevTools = mode === 'development' && env.VITE_ENABLE_DEVTOOLS === 'true'

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: 'src/types/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: 'src/types/components.d.ts',
      }),
      enableDevTools ? vueDevTools() : undefined,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
@use "@/assets/styles/variables.scss" as *;
@use "@/assets/styles/mixins.scss" as *;
`,
        },
      },
    },
    build: {
      cssCodeSplit: true,
      minify: 'oxc',
      sourcemap: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
          manualChunks(id) {
            const normalizedId = id.replaceAll('\\', '/')

            if (normalizedId.includes('node_modules')) {
              if (normalizedId.includes('axios')) {
                return 'request'
              }
            }

            return undefined
          },
        },
      },
    },
  }
})
