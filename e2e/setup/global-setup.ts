import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function globalSetup() {
  const outputDir = path.resolve('.output/chrome-mv3')
  const manifestPath = path.join(outputDir, 'manifest.json')

  // Always rebuild for E2E tests to ensure production build
  // Dev build references localhost:3000 which won't work in Playwright
  console.log('Building extension for E2E tests...')
  execSync('npm run build', { stdio: 'inherit' })

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Build failed: manifest.json not found')
  }

  console.log('Extension ready at:', outputDir)
}

export default globalSetup
