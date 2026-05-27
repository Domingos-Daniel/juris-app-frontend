function parseBrackets(text) {
  if (!text) return text
  let out = text
    // Double brackets → single brackets (keep the citation wrapped)
    .replace(/\[\[(.*?)\]\]/g, '[$1]')
    .replace(/\[\[([^\]\n]{3,120}?)\]/g, '[$1]')
    .replace(/\[\[(?=Art)/g, '[')
    // Keep single-bracket citations intact for LegalMarkdown to process
    .replace(/\(\(/g, '(')
    .replace(/\)\)/g, ')')
  return out
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(text) {
  return text.replace(/"/g, '&quot;')
}

function restoreSafeTags(text) {
  return text
    .replace(/&lt;b&gt;/gi, '<b>')
    .replace(/&lt;\/b&gt;/gi, '</b>')
    .replace(/&lt;i&gt;/gi, '<i>')
    .replace(/&lt;\/i&gt;/gi, '</i>')
}

function sanitizeUrl(rawUrl) {
  if (!rawUrl) {
    return ''
  }

  let url = rawUrl.trim()
  url = url
    .replace(/<\/?code>/gi, '')
    .replace(/%3C\/?code%3E/gi, '')
    .replace(/&lt;\/?code&gt;/gi, '')

  return url
}

function replaceMarkdownLinks(text) {
  let output = ''
  let cursor = 0

  while (cursor < text.length) {
    const start = text.indexOf('[', cursor)
    if (start < 0) {
      output += escapeHtml(text.slice(cursor))
      break
    }

    output += escapeHtml(text.slice(cursor, start))
    const closeLabel = text.indexOf(']', start + 1)
    if (closeLabel < 0 || text[closeLabel + 1] !== '(') {
      output += escapeHtml(text[start])
      cursor = start + 1
      continue
    }

    const label = text.slice(start + 1, closeLabel)
    let urlIndex = closeLabel + 2
    let depth = 0
    let closeParen = -1
    while (urlIndex < text.length) {
      const char = text[urlIndex]
      if (char === '(') {
        depth += 1
      } else if (char === ')') {
        if (depth === 0) {
          closeParen = urlIndex
          break
        }
        depth -= 1
      }
      urlIndex += 1
    }

    if (closeParen < 0) {
      output += escapeHtml(text.slice(start, closeLabel + 1))
      cursor = closeLabel + 1
      continue
    }

    const url = sanitizeUrl(text.slice(closeLabel + 2, closeParen))
    if (!/^https?:\/\//i.test(url)) {
      output += escapeHtml(text.slice(start, closeParen + 1))
      cursor = closeParen + 1
      continue
    }

    const cleanLabel = label
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .replace(/\s+\[/g, ' ')
      .trim()

    output += `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(cleanLabel)}</a>`
    cursor = closeParen + 1
  }

  return output
}

function renderInline(text, sourceRefs = []) {
  let output = text
  output = output.replace(/(^|\s)([^[\]\n]+)]\((https?:\/\/[^\s]+)\)/g, '$1[$2]($3)')
  output = replaceMarkdownLinks(output)

  if (sourceRefs && sourceRefs.length > 0) {
    output = output.replace(/(^|[\s(\[*_"'])(Art(?:igo|s|\.)?\.?\s*(?:n\.?º?\s*)?(\d+(?:\.?[º°ª])?(?:[-‑]?[a-zA-Z])?)(?:\s*[,;]\s*(?:n\.?º?\s*)?(\d+(?:\.?[º°ª])?))?)/gi, (match, prefix, _, num, num2) => {
      const cleanNum = num.replace(/[^\d]/g, '')
      const sourceIndex = sourceRefs.findIndex(s => {
        if (!s.article_number) return false
        const parts = String(s.article_number).split(/[^\d]+/).filter(Boolean)
        return parts.includes(cleanNum)
      })

      let html = `${prefix}<span class="text-[color:var(--accent)] font-bold italic">${match.trimStart()}</span>`

      if (sourceIndex >= 0) {
        const refIdx = sourceIndex + 1
        const src = sourceRefs[sourceIndex]
        html += `<button type="button" class="inline-ref align-super ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--accent)] px-1.5 text-[9px] font-bold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[color:var(--accent-hover)] hover:scale-105" data-ref-index="${refIdx}" title="${src.title || ''}${src.page ? ' · pag. '+src.page : ''}">${refIdx}</button>`
      }
      return html
    })
  }

  output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  output = output.replace(/\*(?!\*)(.+?)\*/g, '<em>$1</em>')
  output = output.replace(/_(.+?)_/g, '<em>$1</em>')
  output = output.replace(/\[\^(\d+)\]/g, '<button type="button" class="inline-ref" data-ref-index="$1"><sup>[$1]</sup></button>')
  output = restoreSafeTags(output)
  return output
}

export function toSimpleMarkdownHtml(markdown, sourceRefs = []) {
  if (!markdown) {
    return ''
  }

  const lines = markdown.split(/\r?\n/)
  const html = []
  let inUnorderedList = false
  let inOrderedList = false

  const closeLists = () => {
    if (inUnorderedList) {
      html.push('</ul>')
      inUnorderedList = false
    }
    if (inOrderedList) {
      html.push('</ol>')
      inOrderedList = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      closeLists()
      continue
    }

    // Headers support (#, ##, ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      closeLists()
      const level = headerMatch[1].length
      html.push(`<h${level} class="chat-h${level}">${renderInline(headerMatch[2].trim(), sourceRefs)}</h${level}>`)
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOrderedList) {
        html.push('</ol>')
        inOrderedList = false
      }
      if (!inUnorderedList) {
        html.push('<ul>')
        inUnorderedList = true
      }
      html.push(`<li>${renderInline(line.slice(2).trim(), sourceRefs)}</li>`)
      continue
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (orderedMatch) {
      if (inUnorderedList) {
        html.push('</ul>')
        inUnorderedList = false
      }
      if (!inOrderedList) {
        html.push('<ol>')
        inOrderedList = true
      }
      html.push(`<li>${renderInline(orderedMatch[2].trim(), sourceRefs)}</li>`)
      continue
    }

    closeLists()

    const INLINE_NOTA_RE = /\[nota:\s*(.+?)\]/gi
    if (INLINE_NOTA_RE.test(line)) {
      INLINE_NOTA_RE.lastIndex = 0
      const parts = line.split(INLINE_NOTA_RE)
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          const text = parts[i].trim()
          if (text) html.push(`<p>${renderInline(text, sourceRefs)}</p>`)
        } else {
          html.push(`<aside class="disclaimer-note">[Nota: ${renderInline(parts[i], sourceRefs)}]</aside>`)
        }
      }
      continue
    }

    if (/^base legal(?: de apoio)?\s*:/i.test(line)) {
      html.push(`<p class="key-line">${renderInline(line, sourceRefs)}</p>`)
      continue
    }
    if (/^em termos simples\s*:/i.test(line) || /^passos pr[aá]ticos\s*:/i.test(line)) {
      html.push(`<p class="key-line">${renderInline(line, sourceRefs)}</p>`)
      continue
    }

    html.push(`<p>${renderInline(line, sourceRefs)}</p>`)
  }

  closeLists()
  return html.join('')
}

export function splitAnswerAndSources(answer) {
  if (!answer) {
    return { body: '', sources: [] }
  }

  const marker = /\n\s*Fontes consultadas:\s*/i
  const match = marker.exec(answer)
  if (!match) {
    return { body: answer, sources: [] }
  }

  const body = answer.slice(0, match.index).trim()
  const rawSources = answer.slice(match.index + match[0].length).trim()
  const matches = [...rawSources.matchAll(/-\s+([\s\S]+?)(?=\n-\s+|$)/g)]
  const sources = matches.map((match) => match[1].replace(/\s+/g, ' ').trim())

  return { body, sources }
}

export function splitBodyAndBaseLegal(body) {
  if (!body) {
    return { main: '', baseLegal: '' }
  }

  const normalizedBody = body.replace(/([^\n])\s+(Base legal(?: de apoio)?\s*:)/i, '$1\n\n$2')
  const match = /(^|\n)\s*base legal(?: de apoio)?\s*:\s*/i.exec(normalizedBody)
  if (!match) {
    return { main: normalizedBody.trim(), baseLegal: '' }
  }

  const main = normalizedBody.slice(0, match.index).trim()
  const baseLegal = normalizedBody.slice(match.index).trim()
  return { main, baseLegal }
}

/**
 * Strips noisy/redundant LLM-generated sections from the answer body
 * so the chat bubble only shows the core conversational answer.
 * Structured metadata (sources, confidence) is shown via UI components instead.
 */
export function cleanAnswerBody(raw) {
  if (!raw) return ''

  let text = parseBrackets(raw)

  // Normalize noisy line breaks and punctuation artifacts produced by LLM output.
  text = text
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*[.•·]+\s*$/gm, '')
    .replace(/\n\s*([,.;:])/g, '$1')
    .replace(/([,.;:])\s*\n\s*([\])])/g, '$1 $2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const markers = [
    // Sections that start with newline + keyword (may or may not have colon)
    /\n\s*(?:\*\*)?Base (?:confirmada|parcial|legal)(?: de apoio)?(?:\*\*)?(?:\s*:)?\s*$/im,
    /\n\s*(?:\*\*)?Base (?:Legal|confirmada|parcial)(?: de apoio)?(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Nota prudencial(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Confian[çc]a\s+(?:da resposta|baixa|média|alta|muito alta)(?:\*\*)?(?:\s*[·•]\s*\d+%)?/i,
    /\n\s*(?:\*\*)?Confian[çc]a(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Fontes consultadas(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Distin[çc]ões importantes(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Limites da [Rr]esposta(?:\*\*)?\s*:/i,
    /\n\s*(?:\*\*)?Limita[çc][õo]es(?:\*\*)?\s*:/i,
    // Separator-only markers (confidence / base as standalone lines without colon)
    /\n\s*Base confirmada\s*\n/i,
    /\n\s*Base parcial\s*\n/i,
    /\n\s*Confiança\s+(?:baixa|média|alta|muito alta)\s*[·•]?\s*\d*%?\s*\n*/i,
  ]

  let earliestIndex = text.length

  for (const marker of markers) {
    const match = marker.exec(text)
    if (match && match.index < earliestIndex) {
      earliestIndex = match.index
    }
  }

  if (earliestIndex < text.length && earliestIndex > 10) {
    return text
      .slice(0, earliestIndex)
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  return text.trim()
}
