import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = join(import.meta.dirname, '../dist')
const port = Number(process.env.PORT ?? 4321)
const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.xsl': 'application/xml'
}

function resolveFile(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return undefined
  }
  const path = join(root, normalize(decoded))
  const candidates = [path, `${path}.html`, join(path, 'index.html')]

  return candidates.find(
    (candidate) =>
      candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()
  )
}

createServer((request, response) => {
  const file = resolveFile(new URL(request.url ?? '/', 'http://localhost').pathname)
  const target = file ?? join(root, '404.html')

  response.writeHead(file ? 200 : 404, {
    'Content-Type': types[extname(target)] ?? 'application/octet-stream'
  })
  createReadStream(target).pipe(response)
}).listen(port, '127.0.0.1')
