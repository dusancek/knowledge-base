import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(import.meta.url), '../..')
const docsRoot = join(root, 'docs')
const outPath = join(root, 'public', 'docs-manifest.json')

const titleize = (value) =>
  value
    .replace(/^\d+[-_ ]*/, '')
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

const getDocTitle = (content, fallback) => {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading ? heading[1].trim() : titleize(fallback)
}

async function listMarkdownFiles(directory = docsRoot, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    const path = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath, path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = await readFile(fullPath, 'utf8')
      files.push({ id: path, path, title: getDocTitle(content, entry.name), content })
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
}

const docs = await listMarkdownFiles()
await writeFile(outPath, JSON.stringify({ docs }, null, 2))
console.log(`docs-manifest.json generated (${docs.length} files)`)
