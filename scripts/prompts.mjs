/**
 * Reads the generation prompts out of docs/art-direction.md, which that file
 * declares itself the source of truth for. Nothing here invents prompt text;
 * a prompt that looks wrong is fixed in the document, not in this file.
 *
 * The structure it depends on, stated in the document itself:
 *   - the shared style block is the blockquote under "## Shared style block"
 *   - a scene is `### <n>. \`<file>\` — <title>`, and its prompt is the FIRST
 *     paragraph beneath it; later paragraphs are notes to a human
 *   - the portrait template is the blockquote under "### Portrait prompt template"
 */
import { readFile } from 'node:fs/promises'

const DOC = new URL('../docs/art-direction.md', import.meta.url)

/** A markdown blockquote flattened back into one line of prompt text. */
function quoteAfter(doc, heading) {
  const at = doc.indexOf(heading)
  if (at === -1) throw new Error(`heading not found in art-direction.md: ${heading}`)
  const lines = doc.slice(at + heading.length).split('\n')
  const quote = []
  for (const line of lines) {
    if (line.startsWith('>')) quote.push(line.replace(/^>\s?/, '').trim())
    else if (quote.length) break
  }
  if (!quote.length) throw new Error(`no blockquote under: ${heading}`)
  return quote.join(' ').replace(/\s+/g, ' ').trim()
}

export async function loadPrompts() {
  const doc = await readFile(DOC, 'utf8')

  const style = quoteAfter(doc, '## Shared style block')
  const portraitTemplate = quoteAfter(doc, '### Portrait prompt template')
    // The template is bolded mid-sentence for human emphasis; the model should
    // not see asterisks where it expects prose.
    .replace(/\*\*/g, '')

  const scenes = new Map()
  const heading = /^### [\w.]+\. `([\w-]+)\.jpg` — .*$/gm
  for (const m of doc.matchAll(heading)) {
    // The venue-reveal section lists `<base>-real.jpg` under headings shaped
    // exactly like a scene's. Those are photographs of actual venues that
    // delegates are being shown as real — generating one would be a lie told
    // in the site's own voice. Never prompt from them.
    if (m[1].endsWith('-real')) continue
    const rest = doc.slice(m.index + m[0].length)
    const first = rest.split(/\n\s*\n/).find((p) => p.trim())
    if (!first) throw new Error(`no prompt paragraph under: ${m[0]}`)
    scenes.set(m[1], first.trim().replace(/\s+/g, ' '))
  }

  return { style, portraitTemplate, scenes }
}
