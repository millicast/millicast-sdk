#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const workerFileName = 'TransformWorker.js'

// Path to the file in package B's folder
const sourceFilePath = path.resolve(__dirname, '../dist', workerFileName) // Adjust the path accordingly

rl.question('Set your app\'s public folder path: default is [dist] ', (destinationFolder) => {
  // Copy the file to the destination folder
  const curDir = process.cwd()
  destinationFolder = destinationFolder || 'dist'
  const workersFolder = path.join(curDir, destinationFolder, 'workers')
  fs.mkdir(workersFolder, (err) => {
    if (err) {
      console.error(err)
    } else {
      fs.copyFile(sourceFilePath, path.join(workersFolder, workerFileName), (err) => {
        if (err) {
          console.error('Error copying file:', err)
        } else {
          console.log('File copied successfully!')
        }
        rl.close()
      })
    }
  })
})
