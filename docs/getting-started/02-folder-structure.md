# Folder Structure

The app reads files from the top-level `docs/` folder.

```txt
docs/
  00-home.md
  getting-started/
    01-writing-notes.md
    02-folder-structure.md
  projects/
    react-knowledge-base.md
```

## Naming tips

Prefix files with numbers when you want a stable order:

| Pattern | Use |
| --- | --- |
| `00-home.md` | Landing pages |
| `01-overview.md` | First page in a section |
| `10-reference.md` | Later reference material |

Folders and files are sorted naturally, so `2-note.md` comes before `10-note.md`.
