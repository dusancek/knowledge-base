import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'

const docsRoot = join(process.cwd(), 'docs')
const port = Number(process.env.DOCS_API_PORT ?? 8787)

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
      'access-control-allow-headers': 'content-type',
      ...init.headers,
    },
  })

const isSafeDocPath = (path) => {
  if (!path || typeof path !== 'string') return false
  if (!path.endsWith('.md')) return false
  if (path.startsWith('/') || path.includes('\\')) return false
  return !path.split('/').some((part) => part === '..' || part === '')
}

const resolveDocPath = (path) => {
  if (!isSafeDocPath(path)) {
    throw new Error('Invalid Markdown path')
  }

  const fullPath = join(docsRoot, path)
  const relativePath = relative(docsRoot, fullPath)

  if (relativePath.startsWith('..') || relativePath.includes(`..${sep}`)) {
    throw new Error('Path escapes docs folder')
  }

  return fullPath
}

const titleize = (value) =>
  value
    .replace(/^\d+[-_ ]*/, '')
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const getDocTitle = (content, fallback) => {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading ? heading[1].trim() : titleize(fallback)
}

const listMarkdownFiles = async (directory = docsRoot, prefix = '') => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    const path = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath, path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = await readFile(fullPath, 'utf8')
      files.push({
        id: path,
        path,
        title: getDocTitle(content, entry.name),
        content,
        updatedAt: Date.now(),
      })
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return json({})
    }

    try {
      if (url.pathname === '/api/docs' && request.method === 'GET') {
        return json({ docs: await listMarkdownFiles() })
      }

      if (url.pathname === '/api/docs' && request.method === 'POST') {
        const { path, content = `# ${titleize(path ?? 'New Note')}\n` } = await request.json()
        const fullPath = resolveDocPath(path)

        await mkdir(dirname(fullPath), { recursive: true })
        await writeFile(fullPath, content, 'utf8')

        return json({ ok: true, doc: { path, title: getDocTitle(content, path), content } }, { status: 201 })
      }

      if (url.pathname === '/api/docs/content' && request.method === 'PUT') {
        const { path, content } = await request.json()
        const fullPath = resolveDocPath(path)

        await mkdir(dirname(fullPath), { recursive: true })
        await writeFile(fullPath, String(content ?? ''), 'utf8')

        return json({ ok: true, doc: { path, title: getDocTitle(String(content ?? ''), path) } })
      }

      return json({ error: 'Not found' }, { status: 404 })
    } catch (error) {
      return json({ error: error.message }, { status: 400 })
    }
  },
})

console.log(`Docs API running at http://127.0.0.1:${port}`)
