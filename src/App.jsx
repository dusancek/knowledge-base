import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { marked } from 'marked'
import TurndownService from 'turndown'
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
const READ_ONLY = import.meta.env.PROD

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
  marked.parse(markdown || '', { async: false, gfm: true, breaks: false })

const htmlToMarkdown = (html) => `${turndown.turndown(html).trim()}\n`

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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

function EditorToolbar({ editor }) {
  if (!editor) return null

  const btn = (label, isActive, action, icon) => (
    <button
      type="button"
      className={`toolbar-btn ${isActive ? 'active' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); action() }}
      title={label}
    >
      {icon}
    </button>
  )

  return (
    <div className="editor-toolbar">
      {btn('Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold size={15} />)}
      {btn('Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic size={15} />)}
      <span className="toolbar-divider" />
      {btn('Heading', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={15} />)}
      {btn('Bullet list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List size={15} />)}
      {btn('Numbered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={15} />)}
      {btn('Quote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={15} />)}
      {btn('Code block', editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), <Code size={15} />)}
    </div>
  )
}

function App() {
  const [docs, setDocs] = useState([])
  const [activeId, setActiveId] = useState('')
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
        placeholder: 'Start writing…',
      }),
    ],
    content: '',
    editable: !READ_ONLY,
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate({ editor: currentEditor }) {
      setDraftMarkdown(htmlToMarkdown(currentEditor.getHTML()))
      setStatus('Unsaved changes')
    },
  })

  useEffect(() => {
    async function loadDocs() {
      try {
        const url = READ_ONLY
          ? `${import.meta.env.BASE_URL}docs-manifest.json`
          : `${API_URL}/api/docs`
        const response = await fetch(url)
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

    const html = markdownToHtml(activeDoc.content)
    editor.commands.setContent(html, false)
    queueMicrotask(() => {
      setDraftMarkdown(activeDoc.content)
      setStatus('Saved')
    })
  }, [activeDoc, editor])

  const saveDoc = async () => {
    if (!activeDoc) return

    setStatus('Saving…')

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
                updatedAt: Date.now(),
              }
            : doc,
        ),
      )
      setStatus('Saved')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const createDoc = async () => {
    const filename = window.prompt('New Markdown path inside docs/', 'new-note.md')
    if (!filename) return

    const path = filename.endsWith('.md') ? filename : `${filename}.md`
    const content = `# ${titleize(path.split('/').at(-1))}\n\n`

    setStatus('Creating…')

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
        updatedAt: Date.now(),
      }

      setDocs((current) =>
        [...current.filter((item) => item.id !== doc.id), doc].sort((a, b) =>
          a.path.localeCompare(b.path, undefined, { numeric: true }),
        ),
      )
      setActiveId(doc.id)
      setStatus('Saved')
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

        {!READ_ONLY && (
          <div className="sidebar-actions">
            <button type="button" className="new-doc-button" onClick={createDoc}>
              <FilePlus2 size={16} />
              <span>New note</span>
            </button>
          </div>
        )}

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

      <main className="reader">
        <header className="doc-header">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
            title={sidebarOpen ? 'Hide navigation' : 'Show navigation'}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          {activeDoc && (
            <>
              <div className="doc-breadcrumb">
                {activeDoc.path.split('/').map((part, i, arr) => (
                  <span key={i} className="breadcrumb-item">
                    {i < arr.length - 1 ? (
                      <span className="breadcrumb-folder">{titleize(part)}</span>
                    ) : (
                      <span className="breadcrumb-file">{activeDoc.title}</span>
                    )}
                    {i < arr.length - 1 && <ChevronRight size={13} className="breadcrumb-sep" />}
                  </span>
                ))}
                {activeDoc.updatedAt && (
                  <span className="breadcrumb-date">· Last edited {formatDate(activeDoc.updatedAt)}</span>
                )}
              </div>

              <div className="doc-actions">
                {!READ_ONLY && <span className="doc-status">{status}</span>}
                {!READ_ONLY && (
                  <button type="button" className="save-button" onClick={saveDoc}>
                    <Save size={14} />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </>
          )}
        </header>

        {activeDoc ? (
          <>
            <div className="editor-shell">
              {!READ_ONLY && <EditorToolbar editor={editor} />}
              <EditorContent editor={editor} />
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
