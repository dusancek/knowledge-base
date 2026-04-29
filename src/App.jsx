import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { marked } from 'marked'
import TurndownService from 'turndown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import {
  Bold,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code,
  FilePlus2,
  FileText,
  Folder,
  Heading2,
  Italic,
  List,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  Save,
  Search,
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_DOCS_API_URL ?? 'http://127.0.0.1:8787'
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

turndown.addRule('strikethrough', {
  filter: ['s', 'del', 'strike'],
  replacement: (content) => `~~${content}~~`,
})

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

const markdownToHtml = (markdown) =>
  marked.parse(markdown || '', {
    async: false,
    gfm: true,
    breaks: false,
  })

const htmlToMarkdown = (html) => `${turndown.turndown(html).trim()}\n`

const createTree = (items) => {
  const root = []

  items.forEach((doc) => {
    let branch = root
    const parts = doc.path.split('/')

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1

      if (isFile) {
        branch.push({ type: 'file', name: part, doc })
        return
      }

      let folder = branch.find((item) => item.type === 'folder' && item.name === part)

      if (!folder) {
        folder = { type: 'folder', name: part, children: [] }
        branch.push(folder)
      }

      branch = folder.children
    })
  })

  return root
}

const matchesQuery = (item, query) => {
  if (!query) return true

  if (item.type === 'file') {
    const haystack = `${item.doc.title} ${item.doc.path} ${item.doc.content}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  }

  return item.children.some((child) => matchesQuery(child, query))
}

function TreeItem({ item, activeId, onSelect, depth = 0, query }) {
  const [open, setOpen] = useState(true)

  if (item.type === 'folder') {
    const visibleChildren = item.children.filter((child) => matchesQuery(child, query))

    if (visibleChildren.length === 0) return null

    return (
      <li>
        <button
          type="button"
          className="tree-row folder-row"
          style={{ '--depth': depth }}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={16} />
          <span>{titleize(item.name)}</span>
        </button>
        {open ? (
          <ul className="tree-list">
            {visibleChildren.map((child) => (
              <TreeItem
                key={`${item.name}-${child.name}-${child.doc?.id ?? 'folder'}`}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                depth={depth + 1}
                query={query}
              />
            ))}
          </ul>
        ) : null}
      </li>
    )
  }

  const isActive = item.doc.id === activeId

  return (
    <li>
      <button
        type="button"
        className={`tree-row file-row ${isActive ? 'active' : ''}`}
        style={{ '--depth': depth }}
        onClick={() => onSelect(item.doc.id)}
      >
        <FileText size={16} />
        <span>{item.doc.title}</span>
      </button>
    </li>
  )
}

function ToolbarButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      className={`toolbar-button ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  )
}

function App() {
  const [docs, setDocs] = useState([])
  const [activeId, setActiveId] = useState('')
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mode, setMode] = useState('edit')
  const [draftMarkdown, setDraftMarkdown] = useState('')
  const [status, setStatus] = useState('Loading docs')

  const activeDoc = docs.find((doc) => doc.id === activeId) ?? docs[0]
  const tree = useMemo(() => createTree(docs), [docs])
  const visibleCount = docs.filter((doc) =>
    `${doc.title} ${doc.path} ${doc.content}`.toLowerCase().includes(query.toLowerCase()),
  ).length

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing. Your Markdown file is saved locally.',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate({ editor: currentEditor }) {
      setDraftMarkdown(htmlToMarkdown(currentEditor.getHTML()))
      setStatus('Unsaved changes')
    },
  })

  useEffect(() => {
    async function loadDocs() {
      try {
        const response = await fetch(`${API_URL}/api/docs`)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error ?? 'Could not load docs')

        setDocs(data.docs)
        setActiveId((current) => current || data.docs[0]?.id || '')
        setStatus('Docs loaded')
      } catch (error) {
        setStatus(error.message)
      }
    }

    loadDocs()
  }, [])

  useEffect(() => {
    if (!editor || !activeDoc) return

    const content = activeDoc.content
    const html = markdownToHtml(activeDoc.content)
    editor.commands.setContent(html, false)
    queueMicrotask(() => {
      setDraftMarkdown(content)
      setStatus('Saved')
    })
  }, [activeDoc, editor])

  const saveDoc = async () => {
    if (!activeDoc) return

    setStatus('Saving')

    try {
      const response = await fetch(`${API_URL}/api/docs/content`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: activeDoc.path, content: draftMarkdown }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error ?? 'Could not save doc')

      setDocs((current) =>
        current.map((doc) =>
          doc.id === activeDoc.id
            ? {
                ...doc,
                content: draftMarkdown,
                title: getDocTitle(draftMarkdown, doc.path.split('/').at(-1)),
              }
            : doc,
        ),
      )
      setStatus(`Saved ${activeDoc.path}`)
    } catch (error) {
      setStatus(error.message)
    }
  }

  const createDoc = async () => {
    const filename = window.prompt('New Markdown path inside docs/', 'new-note.md')
    if (!filename) return

    const path = filename.endsWith('.md') ? filename : `${filename}.md`
    const content = `# ${titleize(path.split('/').at(-1))}\n\n`

    setStatus('Creating')

    try {
      const response = await fetch(`${API_URL}/api/docs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path, content }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error ?? 'Could not create doc')

      const doc = {
        id: data.doc.path,
        path: data.doc.path,
        title: data.doc.title,
        content: data.doc.content,
      }

      setDocs((current) =>
        [...current.filter((item) => item.id !== doc.id), doc].sort((a, b) =>
          a.path.localeCompare(b.path, undefined, { numeric: true }),
        ),
      )
      setActiveId(doc.id)
      setMode('edit')
      setStatus(`Created ${doc.path}`)
    } catch (error) {
      setStatus(error.message)
    }
  }

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar" aria-label="Knowledge base navigation">
        <div className="sidebar-header">
          <div className="brand-mark">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="eyebrow">Knowledge Base</p>
            <h1>Docs</h1>
          </div>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search docs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="sidebar-actions">
          <button type="button" className="new-doc-button" onClick={createDoc}>
            <FilePlus2 size={16} />
            <span>New note</span>
          </button>
        </div>

        <div className="sidebar-meta">
          <span>{visibleCount} files</span>
          <span>Markdown</span>
        </div>

        <nav className="doc-tree">
          <ul className="tree-list">
            {tree.map((item) => (
              <TreeItem
                key={`${item.name}-${item.doc?.id ?? 'folder'}`}
                item={item}
                activeId={activeDoc?.id}
                onSelect={setActiveId}
                query={query}
              />
            ))}
          </ul>
        </nav>
      </aside>

      <main className="reader editor-reader">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((value) => !value)}
          aria-label={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
          title={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        {activeDoc ? (
          <>
            <div className="reader-topline editor-topline">
              <span>{activeDoc.path}</span>
              <span>{status}</span>
            </div>

            <div className="editor-shell">
              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <ToolbarButton
                    label="Bold"
                    active={editor?.isActive('bold')}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Italic"
                    active={editor?.isActive('italic')}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Heading"
                    active={editor?.isActive('heading', { level: 2 })}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    <Heading2 size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Bullet list"
                    active={editor?.isActive('bulletList')}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  >
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Numbered list"
                    active={editor?.isActive('orderedList')}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Quote"
                    active={editor?.isActive('blockquote')}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  >
                    <Quote size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    label="Code block"
                    active={editor?.isActive('codeBlock')}
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  >
                    <Code size={16} />
                  </ToolbarButton>
                </div>

                <div className="toolbar-group">
                  <div className="mode-switch" aria-label="Editor mode">
                    <button
                      type="button"
                      className={mode === 'edit' ? 'active' : ''}
                      onClick={() => setMode('edit')}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={mode === 'markdown' ? 'active' : ''}
                      onClick={() => setMode('markdown')}
                    >
                      Markdown
                    </button>
                    <button
                      type="button"
                      className={mode === 'preview' ? 'active' : ''}
                      onClick={() => setMode('preview')}
                    >
                      Preview
                    </button>
                  </div>

                  <button type="button" className="save-button" onClick={saveDoc}>
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {mode === 'edit' ? (
                <EditorContent editor={editor} />
              ) : mode === 'markdown' ? (
                <textarea
                  className="markdown-source"
                  value={draftMarkdown}
                  onChange={(event) => {
                    const value = event.target.value
                    setDraftMarkdown(value)
                    editor?.commands.setContent(markdownToHtml(value), false)
                    setStatus('Unsaved changes')
                  }}
                  spellCheck="false"
                />
              ) : (
                <article className="markdown-body preview-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[
                      rehypeSlug,
                      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                    ]}
                  >
                    {draftMarkdown}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>No docs found</h2>
            <p>Add Markdown files to the docs folder to start building your knowledge base.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
