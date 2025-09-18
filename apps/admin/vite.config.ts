import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

// https://vite.dev/config/
export default defineConfig(
  createReactConfig({
    ...presets.admin,
  })
)