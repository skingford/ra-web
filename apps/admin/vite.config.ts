import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config/react'

// https://vite.dev/config/
export default defineConfig(createReactConfig({
  ...presets.admin,
}))