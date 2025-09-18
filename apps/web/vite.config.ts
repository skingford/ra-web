import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@ra-web/vite-config/react'

// https://vite.dev/config/
export default defineConfig(createReactConfig({
  ...presets.web,
}))