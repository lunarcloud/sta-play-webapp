#!/usr/bin/env node

/**
 * Copy third-party dependencies from node_modules to lib directory
 * This script replaces the previous copy-deps.sh shell script
 */

import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Remove and recreate lib directory
const libDir = join(__dirname, 'lib')
rmSync(libDir, { recursive: true, force: true })
mkdirSync(libDir)

/**
 * Copy a file from node_modules to lib directory
 * @param {string} source - Source path relative to project root
 * @param {string} destination - Destination filename in lib directory
 */
function copyDependency (source, destination) {
  const sourcePath = join(__dirname, source)
  const destPath = join(libDir, destination)
  copyFileSync(sourcePath, destPath)
  console.log(`Copied ${source} -> lib/${destination}`)
}

// custom element polyfill for safari
copyDependency('./node_modules/@ungap/custom-elements/es.js', 'custom-elements.js')

// 3d model viewing
copyDependency('./node_modules/three/build/three.module.min.js', 'three.module.min.js')
copyDependency('./node_modules/@google/model-viewer/dist/model-viewer.min.js', 'model-viewer.min.js')

// file Saving
copyDependency('./node_modules/fflate/esm/browser.js', 'fflate.js')

// database
copyDependency('./node_modules/idb/build/index.js', 'idb.js')

console.log('All dependencies copied successfully!')
