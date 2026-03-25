import fs from 'fs/promises'
import http from 'http'
import path from 'path'

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
}

const resolveRequestPath = (rootDir, requestPath) => {
  const pathname = decodeURIComponent(requestPath.split('?')[0])
  const relativePath = pathname === '/' ? 'PuppeteerJest.html' : pathname.replace(/^\//, '')
  const fullPath = path.resolve(rootDir, relativePath)

  if (!fullPath.startsWith(path.resolve(rootDir) + path.sep) && fullPath !== path.resolve(rootDir)) {
    return null
  }

  return fullPath
}

export const startStaticServer = async (rootDir) => {
  const server = http.createServer(async (req, res) => {
    const requestPath = req.url || '/'
    const filePath = resolveRequestPath(rootDir, requestPath)

    if (!filePath) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    try {
      const fileContent = await fs.readFile(filePath)
      const extension = path.extname(filePath).toLowerCase()
      const contentType = CONTENT_TYPES[extension] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(fileContent)
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        res.writeHead(404)
        res.end('Not Found')
        return
      }

      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine static server address')
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  }
}
