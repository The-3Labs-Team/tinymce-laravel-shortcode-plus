/* global tinymce */

tinymce.PluginManager.add('preview', function (editor, url) {
  let isActive = false
  let advUpdateTimer = null

  editor.on('click', function (e) {
    const target = e.target.closest('.shortcode-preview')

    // Controlla se è uno span con data-preview-shortcode
    if (target) {
      e.preventDefault()

      // Trova lo span parent
      const previewSpan = target.closest('[data-preview-shortcode]')
      if (!previewSpan) return

      // Seleziona lo span preview così insertContent nel plugin lo sostituirà
      editor.selection.select(previewSpan)

      // Get shortcode dal data attribute
      const shortcode = decodeHtmlEntities(previewSpan.getAttribute('data-preview-shortcode'))
      const shortcodeName = previewSpan.getAttribute('data-preview-shortcode-name')

      // Passa lo shortcode al comando con una callback per ricevere il risultato
      editor.execCommand(`mceEditShortcode_${shortcodeName}`, {
        selectedShortcode: shortcode,
        previewCallback: function () {
          showPreview(editor)
        }
      })
    }
  })

  editor.on('dragstart', function (e) {
    const isAdvPreview = e.target.closest('.adv-preview')

    if (isActive) {
      if (isAdvPreview) {
        e.preventDefault()
      }
    }
  })

  editor.on('keydown', function (e) {
    if (isActive) {
      // Gestisci la cancellazione degli adv-preview e adv-preview-overlay
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const node = editor.selection.getNode()
        const advPreview = node.closest('.adv-preview') || node.closest('.adv-preview-overlay')

        if (advPreview) {
          e.preventDefault()
          advPreview.remove()
          return
        }

        // Controlla se il cursore è adiacente a un adv-preview
        const adjacentNode = e.key === 'Backspace'
          ? node.previousSibling
          : node.nextSibling

        if (adjacentNode && adjacentNode.classList &&
            (adjacentNode.classList.contains('adv-preview') || adjacentNode.classList.contains('adv-preview-overlay'))) {
          e.preventDefault()
          adjacentNode.remove()
        }
      }
      // ENTER non triggera più showPreview - il contenuto non viene più rimpiazzato
    }
  })

  editor.on('drop', async function (e) {
    if (isActive) {
      setTimeout(() => showPreview(editor, true), 100)
    }
  })

  // MutationObserver per aggiornare le ADV quando cambiano i paragrafi
  editor.on('init', function () {
    const body = editor.getBody()
    body.setAttribute('data-last-paragraph-count', body.querySelectorAll('p').length)

    const observer = new MutationObserver(() => {
      if (!isActive) return

      clearTimeout(advUpdateTimer)
      advUpdateTimer = setTimeout(() => {
        updateAdvOverlaysIfNeeded(editor)
      }, 300)
    })

    observer.observe(body, { childList: true, subtree: true })
  })

  /**
     * GetContent: Trasforma i placeholder in shortcode all'output
     * Questo viene eseguito quando il contenuto viene estratto dall'editor
     */
  editor.on('GetContent', function (e) {
    if (e.content) {
      // Remove any cursor markers that might have been left behind
      e.content = e.content.replace(/<span[^>]*data-mce-cursor-marker="true"[^>]*><\/span>/g, '')
      e.content = parseFromPreviewToShortcodes(e.content)
      e.content = removeAdvPreview(e.content)
    }
  })

  /**
    * PostProcess: Pulizia aggiuntiva per le operazioni di salvataggio
    */
  editor.on('PostProcess', function (e) {
    if (e.get && e.content) {
      // Remove any cursor markers that might have been left behind
      e.content = e.content.replace(/<span[^>]*data-mce-cursor-marker="true"[^>]*><\/span>/g, '')
      e.content = parseFromPreviewToShortcodes(e.content)
      e.content = removeAdvPreview(e.content)
    }
  })

  editor.ui.registry.addIcon('previewplay', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height="1em"><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>')

  editor.ui.registry.addIcon('sourcecode', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1em"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>')

  editor.ui.registry.addToggleButton('preview', {
    text: 'Preview',
    icon: 'previewplay',
    tooltip: 'Attiva/Disattiva Preview',
    onAction: function (buttonApi) {
      isActive = !isActive
      buttonApi.setActive(isActive)

      // Inserisci contenuto quando viene attivato/disattivato
      if (isActive) {
        showPreview(editor)
      } else {
        hidePreview(editor)
      }
    },
    onSetup: function (buttonApi) {
      // Imposta lo stato iniziale
      buttonApi.setActive(isActive)

      return function () {
        // Cleanup se necessario
      }
    }
  })

  editor.addCommand('showPreview', function () {
    if (isActive) {
      showPreview(editor)
    }
  })

  editor.ui.registry.addButton('sourcecode', {
    text: 'Source',
    icon: 'sourcecode',
    tooltip: 'Visualizza codice sorgente',
    onAction: function () {
      const content = editor.getContent()

      editor.windowManager.open({
        title: 'Source Code',
        size: 'large',
        body: {
          type: 'panel',
          items: [{
            type: 'textarea',
            name: 'source',
            maximized: true
          }]
        },
        initialData: { source: content },
        buttons: [
          { type: 'cancel', text: 'Chiudi' },
          { type: 'submit', text: 'Aggiorna', primary: true }
        ],
        onSubmit: function (api) {
          const data = api.getData()
          editor.setContent(data.source)
          api.close()
        }
      })
    }
  })

  return {
    getMetadata: function () {
      return {
        name: 'Preview',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

// ===== UTILITY FUNCTIONS ===== //

function decodeHtmlEntities (str) {
  if (str == null) return ''
  const textarea = document.createElement('textarea')
  textarea.innerHTML = String(str)
  return textarea.value
}

function escapeHtml (str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getShortcodeAttr (shortcode, attrName, defaultValue) {
  if (defaultValue === undefined) defaultValue = null
  const match = shortcode.match(new RegExp(attrName + '=["\']([^"\']*)["\']'))
  return match ? decodeHtmlEntities(match[1]) : defaultValue
}

function getShortcodeAttrs (shortcode, attrDefaults) {
  const result = {}
  const regex = /([\w-]+)=["']([^"']*?)["']/g
  let m
  while ((m = regex.exec(shortcode)) !== null) {
    if (m[1] in attrDefaults) result[m[1]] = decodeHtmlEntities(m[2])
  }
  for (const key in attrDefaults) {
    if (!(key in result)) result[key] = attrDefaults[key]
  }
  return result
}

// ===== CORE PREVIEW FUNCTIONS ===== //

/* Function for showing preview by DOM manipulation (no content replacement) */
async function showPreview (editor, fromDrop) {
  if (fromDrop === undefined) fromDrop = false

  const body = editor.getBody()
  const doc = editor.getDoc()

  // 1. Rimuovi preview esistenti (per refresh)
  removeExistingPreviews(body)

  // 2. Trova e wrappa gli shortcode con preview spans (manipolazione DOM diretta)
  await wrapShortcodesWithPreview(editor, body, doc)

  // 3. Aggiungi overlay ADV in posizione assoluta (senza modificare contenuto)
  await addAdvOverlays(editor, body, doc)
}

/* Aggiorna le ADV solo se il numero di paragrafi e' cambiato */
async function updateAdvOverlaysIfNeeded (editor) {
  const body = editor.getBody()
  const currentCount = body.querySelectorAll('p').length

  // Usa data attribute per tracciare il conteggio precedente
  const lastCount = parseInt(body.getAttribute('data-last-paragraph-count') || '0', 10)

  if (currentCount !== lastCount) {
    body.setAttribute('data-last-paragraph-count', currentCount)

    // Rimuovi overlay ADV esistenti
    body.querySelectorAll('.adv-preview-overlay').forEach(el => el.remove())

    // Ricalcola posizioni ADV
    await addAdvOverlays(editor, body, editor.getDoc())
  }
}

/* Rimuove le preview esistenti per permettere il refresh */
function removeExistingPreviews (body) {
  // Rimuovi preview shortcode spans
  const previewSpans = body.querySelectorAll('[data-preview-shortcode]')
  previewSpans.forEach(span => {
    const shortcode = decodeHtmlEntities(span.getAttribute('data-preview-shortcode'))
    const textNode = document.createTextNode(shortcode)
    span.parentNode.replaceChild(textNode, span)
  })

  // Rimuovi overlay ADV
  const advOverlays = body.querySelectorAll('.adv-preview-overlay')
  advOverlays.forEach(overlay => overlay.remove())
}

/* Trova shortcode nei nodi di testo e li wrappa con preview spans */
async function wrapShortcodesWithPreview (editor, body, doc) {
  // Pattern per tutti gli shortcode supportati
  const shortcodePatterns = [
    // Shortcode con contenuto (opening + content + closing)
    /\[(distico|spoiler|faq)(?:\s+[^\]]+)?\][\s\S]*?\[\/\1\]/g,
    // Shortcode singoli
    /\[(button|widgetbay|photo|index|leggianche|trivia|survey|facebook|instagram|twitter|bluesky|reddit|youtube|tiktok|spotify)(?:\s+[^\]]+)?\]/g
  ]

  // Trova tutti i nodi di testo
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false)
  const textNodes = []
  while (walker.nextNode()) {
    // Skip nodi già dentro preview spans o elementi non editabili
    if (!walker.currentNode.parentElement.closest('[data-preview-shortcode]') &&
        !walker.currentNode.parentElement.closest('[contenteditable="false"]')) {
      textNodes.push(walker.currentNode)
    }
  }

  // Processa ogni nodo di testo
  for (const textNode of textNodes) {
    const text = textNode.textContent
    let hasMatch = false

    // Verifica se ci sono shortcode in questo nodo
    for (const pattern of shortcodePatterns) {
      pattern.lastIndex = 0
      if (pattern.test(text)) {
        hasMatch = true
        break
      }
    }

    if (hasMatch) {
      await replaceShortcodesInTextNode(editor, textNode, doc)
    }
  }
}

/* Sostituisce gli shortcode in un singolo nodo di testo con preview spans */
async function replaceShortcodesInTextNode (editor, textNode, doc) {
  const text = textNode.textContent

  // Pattern combinato per trovare tutti gli shortcode
  const combinedPattern = /(\[(distico|spoiler|faq)(?:\s+[^\]]+)?\][\s\S]*?\[\/\2\]|\[(button|widgetbay|photo|index|leggianche|trivia|survey|facebook|instagram|twitter|bluesky|reddit|youtube|tiktok|spotify)(?:\s+[^\]]+)?\])/g

  const matches = [...text.matchAll(combinedPattern)]
  if (matches.length === 0) return

  // Crea un fragment per contenere i nuovi nodi
  const fragment = doc.createDocumentFragment()
  let lastIndex = 0

  for (const match of matches) {
    const shortcode = match[0]
    const matchIndex = match.index

    // Aggiungi il testo prima dello shortcode
    if (matchIndex > lastIndex) {
      fragment.appendChild(doc.createTextNode(text.substring(lastIndex, matchIndex)))
    }

    // Crea la preview span per questo shortcode
    const previewHtml = await generatePreviewHtml(shortcode)
    const shortcodeName = getShortcodeName(shortcode)

    const span = doc.createElement('span')
    span.setAttribute('contenteditable', 'false')
    span.setAttribute('data-preview-shortcode-name', shortcodeName)
    span.setAttribute('data-preview-shortcode', escapeHtml(shortcode))
    span.innerHTML = previewHtml

    fragment.appendChild(span)
    lastIndex = matchIndex + shortcode.length
  }

  // Aggiungi il testo rimanente dopo l'ultimo shortcode
  if (lastIndex < text.length) {
    fragment.appendChild(doc.createTextNode(text.substring(lastIndex)))
  }

  // Sostituisci il nodo di testo originale con il fragment
  textNode.parentNode.replaceChild(fragment, textNode)
}

/* Estrae il nome dello shortcode dal tag */
function getShortcodeName (shortcode) {
  const match = shortcode.match(/^\[(\w+)/)
  return match ? match[1] : 'unknown'
}

/* Genera l'HTML di preview per uno shortcode */
async function generatePreviewHtml (shortcode) {
  const name = getShortcodeName(shortcode)

  // Mappa dei parser per ogni tipo di shortcode
  const parsers = {
    button: () => parseButtonSingle(shortcode),
    widgetbay: () => parseWidgetbaySingle(shortcode),
    distico: () => parseDisticoSingle(shortcode),
    spoiler: () => parseSpoilerSingle(shortcode),
    faq: () => parseFaqSingle(shortcode),
    photo: () => parsePhotoSingle(shortcode),
    index: () => parsePlaceholderSingle(shortcode, { tag: 'index', color: '#ffa500', icon: '📑', label: 'Index', attrName: null }),
    leggianche: () => parsePlaceholderSingle(shortcode, { tag: 'leggianche', color: '#00a0ff', icon: '📰', label: 'Leggi anche', attrName: 'id' }),
    trivia: () => parsePlaceholderSingle(shortcode, { tag: 'trivia', color: '#c912eb', icon: '🎮', label: 'Trivia ID', attrName: 'id' }),
    survey: () => parsePlaceholderSingle(shortcode, { tag: 'survey', color: '#4bc444', icon: '❓', label: 'Survey ID', attrName: 'id' }),
    facebook: () => parseSocialSingle(shortcode, 'facebook'),
    instagram: () => parseSocialSingle(shortcode, 'instagram'),
    twitter: () => parseSocialSingle(shortcode, 'twitter'),
    bluesky: () => parseSocialSingle(shortcode, 'bluesky'),
    reddit: () => parseSocialSingle(shortcode, 'reddit'),
    youtube: () => parseSocialSingle(shortcode, 'youtube'),
    tiktok: () => parseSocialSingle(shortcode, 'tiktok'),
    spotify: () => parseSocialSingle(shortcode, 'spotify')
  }

  if (parsers[name]) {
    return await parsers[name]()
  }

  // Fallback per shortcode sconosciuti
  return `<small class="shortcode-preview" style="display:inline-block; padding: 5px 10px; background: #eee; border-radius: 4px;">[${name}]</small>`
}

/* Aggiunge overlay ADV in posizione assoluta senza modificare il contenuto */
async function addAdvOverlays (editor, body, doc) {
  const content = editor.getContent()

  try {
    const response = await fetch('/ads-post-parser/get-preview-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_html: content })
    })

    if (!response.ok) return

    let transformedContent = await response.json()

    // Rimuovi wrapper se presente
    transformedContent = transformedContent.replace(/<div id="adv__parsed__content">/g, '')
    transformedContent = transformedContent.replace(/<\/div>$/g, '')

    // Parsa il contenuto trasformato per trovare DOVE sono i marker ADV
    const parser = new DOMParser()
    const transformedDoc = parser.parseFromString('<div>' + transformedContent + '</div>', 'text/html')

    // Trova tutti i marker [ADV PREVIEW] e determina dopo quale paragrafo sono
    const advMarkers = transformedDoc.querySelectorAll('small')
    const paragraphsInTransformed = transformedDoc.querySelectorAll('p')
    const paragraphsInEditor = body.querySelectorAll('p')

    advMarkers.forEach(marker => {
      if (marker.textContent === '[ADV PREVIEW]') {
        // Trova l'indice del paragrafo PRIMA di questo marker
        const prevElement = marker.previousElementSibling
        if (prevElement && prevElement.tagName === 'P') {
          // Trova l'indice di questo paragrafo
          const paragraphIndex = Array.from(paragraphsInTransformed).indexOf(prevElement)

          if (paragraphIndex >= 0 && paragraphIndex < paragraphsInEditor.length) {
            // Crea e inserisci l'overlay dopo il paragrafo corrispondente nell'editor
            const overlay = doc.createElement('div')
            overlay.className = 'adv-preview-overlay'
            overlay.setAttribute('contenteditable', 'false')
            overlay.style.cssText = 'display:block;background:#f0f0f0;font-size:10px;text-align:center;padding:4px 0;margin:8px 0;pointer-events:none;user-select:none;border:1px dashed #ccc;'
            overlay.textContent = 'Pubblicità'

            const targetParagraph = paragraphsInEditor[paragraphIndex]
            targetParagraph.parentNode.insertBefore(overlay, targetParagraph.nextSibling)
          }
        }
      }
    })
  } catch (error) {
    console.warn('addAdvOverlays failed:', error)
  }
}

/* Function for hiding preview and restoring shortcodes */
function hidePreview (editor) {
  let content = editor.getContent()

  content = removeAdvPreview(content)
  content = parseFromPreviewToShortcodes(content)

  editor.setContent(content, { format: 'raw' })
}

// ===== ADV PREVIEW CLEANUP ===== //

function removeAdvPreview (content) {
  // Rimuovi i div .adv-preview (vecchio formato)
  content = content.replace(/<div[^>]*class="adv-preview"[^>]*>.*?<\/div>/g, '')
  // Rimuovi i div .adv-preview-overlay (nuovo formato)
  content = content.replace(/<div[^>]*class="adv-preview-overlay"[^>]*>.*?<\/div>/g, '')
  // Rimuovi anche i paragrafi vuoti che potrebbero rimanere
  content = content.replace(/<p[^>]*>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/g, '')
  return content
}

/* Convert from preview spans to shortcodes */
function parseFromPreviewToShortcodes (content) {
  content = content.replace(/<span[^>]*data-preview-shortcode="([^"]*)"[^>]*>.*?<\/span>/g, function (_match, p1) {
    return decodeHtmlEntities(p1)
  })

  return content
}

// ===== PLATFORM DATA ===== //

const SOCIAL_PLATFORMS = {
  facebook: {
    color: '#3b5998',
    svg: '<path d="M240 363.3L240 576L356 576L356 363.3L442.5 363.3L460.5 265.5L356 265.5L356 230.9C356 179.2 376.3 159.4 428.7 159.4C445 159.4 458.1 159.8 465.7 160.6L465.7 71.9C451.4 68 416.4 64 396.2 64C289.3 64 240 114.5 240 223.4L240 265.5L174 265.5L174 363.3L240 363.3z" />'
  },
  instagram: {
    color: '#d62976',
    svg: '<path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/>'
  },
  twitter: {
    color: '#14171A',
    svg: '<path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />'
  },
  bluesky: {
    color: '#0085FF',
    svg: '<path d="M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z" />'
  },
  reddit: {
    color: '#FF4500',
    svg: '<path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576L101.1 576C87.4 576 80.6 559.5 90.2 549.8L139 501C92.7 454.7 64 390.7 64 320zM413.6 217.6C437.2 217.6 456.3 198.5 456.3 174.9C456.3 151.3 437.2 132.2 413.6 132.2C393 132.2 375.8 146.8 371.8 166.2C337.3 169.9 310.4 199.2 310.4 234.6L310.4 234.8C272.9 236.4 238.6 247.1 211.4 263.9C201.3 256.1 188.6 251.4 174.9 251.4C141.9 251.4 115.1 278.2 115.1 311.2C115.1 335.2 129.2 355.8 149.5 365.3C151.5 434.7 227.1 490.5 320.1 490.5C413.1 490.5 488.8 434.6 490.7 365.2C510.9 355.6 524.8 335 524.8 311.2C524.8 278.2 498 251.4 465 251.4C451.3 251.4 438.7 256 428.6 263.8C401.2 246.8 366.5 236.1 328.6 234.7L328.6 234.5C328.6 209.1 347.5 188 372 184.6C376.4 203.4 393.3 217.4 413.5 217.4L413.6 217.6zM241.1 310.9C257.8 310.9 270.6 328.5 269.6 350.2C268.6 371.9 256.1 379.8 239.3 379.8C222.5 379.8 207.9 371 208.9 349.3C209.9 327.6 224.3 311 241 311L241.1 310.9zM431.2 349.2C432.2 370.9 417.5 379.7 400.8 379.7C384.1 379.7 371.5 371.8 370.5 350.1C369.5 328.4 382.3 310.8 399 310.8C415.7 310.8 430.2 327.4 431.1 349.1L431.2 349.2zM383.1 405.9C372.8 430.5 348.5 447.8 320.1 447.8C291.7 447.8 267.4 430.5 257.1 405.9C255.9 403 257.9 399.7 261 399.4C279.4 397.5 299.3 396.5 320.1 396.5C340.9 396.5 360.8 397.5 379.2 399.4C382.3 399.7 384.3 403 383.1 405.9z" />'
  },
  youtube: {
    color: '#cc181e',
    svg: '<path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z" />'
  },
  tiktok: {
    color: '#fe2858',
    svg: '<path d="M544.5 273.9C500.5 274 457.5 260.3 421.7 234.7L421.7 413.4C421.7 446.5 411.6 478.8 392.7 506C373.8 533.2 347.1 554 316.1 565.6C285.1 577.2 251.3 579.1 219.2 570.9C187.1 562.7 158.3 545 136.5 520.1C114.7 495.2 101.2 464.1 97.5 431.2C93.8 398.3 100.4 365.1 116.1 336C131.8 306.9 156.1 283.3 185.7 268.3C215.3 253.3 248.6 247.8 281.4 252.3L281.4 342.2C266.4 337.5 250.3 337.6 235.4 342.6C220.5 347.6 207.5 357.2 198.4 369.9C189.3 382.6 184.4 398 184.5 413.8C184.6 429.6 189.7 444.8 199 457.5C208.3 470.2 221.4 479.6 236.4 484.4C251.4 489.2 267.5 489.2 282.4 484.3C297.3 479.4 310.4 469.9 319.6 457.2C328.8 444.5 333.8 429.1 333.8 413.4L333.8 64L421.8 64C421.7 71.4 422.4 78.9 423.7 86.2C426.8 102.5 433.1 118.1 442.4 131.9C451.7 145.7 463.7 157.5 477.6 166.5C497.5 179.6 520.8 186.6 544.6 186.6L544.6 274z" />'
  },
  spotify: {
    color: '#1db954',
    svg: '<path d="M320 72C183 72 72 183 72 320C72 457 183 568 320 568C457 568 568 457 568 320C568 183 457 72 320 72zM420.7 436.9C416.5 436.9 413.9 435.6 410 433.3C347.6 395.7 275 394.1 203.3 408.8C199.4 409.8 194.3 411.4 191.4 411.4C181.7 411.4 175.6 403.7 175.6 395.6C175.6 385.3 181.7 380.4 189.2 378.8C271.1 360.7 354.8 362.3 426.2 405C432.3 408.9 435.9 412.4 435.9 421.5C435.9 430.6 428.8 436.9 420.7 436.9zM447.6 371.3C442.4 371.3 438.9 369 435.3 367.1C372.8 330.1 279.6 315.2 196.7 337.7C191.9 339 189.3 340.3 184.8 340.3C174.1 340.3 165.4 331.6 165.4 320.9C165.4 310.2 170.6 303.1 180.9 300.2C208.7 292.4 237.1 286.6 278.7 286.6C343.6 286.6 406.3 302.7 455.7 332.1C463.8 336.9 467 343.1 467 351.8C466.9 362.6 458.5 371.3 447.6 371.3zM478.6 295.1C473.4 295.1 470.2 293.8 465.7 291.2C394.5 248.7 267.2 238.5 184.8 261.5C181.2 262.5 176.7 264.1 171.9 264.1C158.7 264.1 148.6 253.8 148.6 240.5C148.6 226.9 157 219.2 166 216.6C201.2 206.3 240.6 201.4 283.5 201.4C356.5 201.4 433 216.6 488.9 249.2C496.7 253.7 501.8 259.9 501.8 271.8C501.8 285.4 490.8 295.1 478.6 295.1z"/>'
  }
}
// ===== API HELPERS ===== //

async function getMediaHubImagesbyId (id) {
  try {
    const endpoint = '/nova-vendor/media-hub/media/' + encodeURIComponent(id) + '/data'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    })

    if (!response.ok) {
      console.warn('getMediaHubImagesbyId: server returned', response.status, 'for id', id)
      return ''
    }

    const data = await response.json()
    return data.url || ''
  } catch (error) {
    console.error('Error fetching MediaHub image data:', error)
    return ''
  }
}

// ===== SINGLE-ITEM PARSERS (for DOM-based preview) ===== //

function parseSocialSingle (shortcode, platformName) {
  const platform = SOCIAL_PLATFORMS[platformName]
  const url = getShortcodeAttr(shortcode, 'url', 'N/A')

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 10px; border: 2px dashed ${platform.color}; font-size: 14px; width: 100%; max-width: 600px;">
    <small style="display: block; text-align: center; font-weight: 500; color: #969696; padding: 50px 10px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width: 30px; fill: ${platform.color};">${platform.svg}</svg>
      <br /> ${escapeHtml(url)}</small></small>`
}

function parsePlaceholderSingle (shortcode, config) {
  let displayText = config.label
  if (config.attrName) {
    displayText += ': ' + getShortcodeAttr(shortcode, config.attrName, 'N/A')
  }

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 10px; border: 2px dashed ${config.color}; font-size: 14px; width: 100%; max-width: 600px;">
    <small style="display: block; text-align: center; font-weight: 500; color: #969696; padding: 50px 10px;">
      ${config.icon} <br /> ${escapeHtml(displayText)}</small></small>`
}

function parseButtonSingle (shortcode) {
  const label = getShortcodeAttr(shortcode, 'label', 'Button')
  const level = getShortcodeAttr(shortcode, 'level', 'primary')

  const levelStyle = level === 'primary'
    ? 'background-color: #0ea5e9; color: white;'
    : 'background-color: #9f9f9f; color: white;'

  return `<small class="shortcode-preview" style="display:inline-block; padding: 10px 20px; border-radius: 10px; text-align: center; text-decoration:none; font-size: 14px; ${levelStyle}">${escapeHtml(label)}</small>`
}

function parseWidgetbaySingle (shortcode) {
  const id = getShortcodeAttr(shortcode, 'id')
  const link = getShortcodeAttr(shortcode, 'link')

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 10px; border: 2px dashed #14b8a6; font-size: 14px; width: 100%; max-width: 600px;">
    <small style="display: block; text-align: center; font-weight: 500; color: #969696; padding: 50px 10px;">
      🛒 Widgetbox
      <br /> ${id ? 'ID: ' + escapeHtml(id) : escapeHtml(link || '')}
    </small>
  </small>`
}

function parseDisticoSingle (shortcode) {
  const textMatch = shortcode.match(/\[distico(?:\s+[^\]]+)?\](.*?)\[\/distico\]/s)
  const disticoText = textMatch ? decodeHtmlEntities(textMatch[1].trim()) : ''

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 8px; border: 1px solid #7e7e7e; font-size: 14px; color: #1c1c1c; font-style: italic; padding: 10px; width: calc(100% - 20px); max-width: 600px;">${escapeHtml(disticoText)}</small>`
}

function parseSpoilerSingle (shortcode) {
  const textMatch = shortcode.match(/\[spoiler(?:\s+[^\]]+)?\](.*?)\[\/spoiler\]/s)
  const spoilerText = textMatch ? decodeHtmlEntities(textMatch[1].trim()) : ''

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 8px; border: 1px solid #ffd07a; font-size: 14px; padding: 10px; width: calc(100% - 20px); max-width: 600px;">👁️ <br /> ${escapeHtml(spoilerText)}</small>`
}

function parseFaqSingle (shortcode) {
  const title = getShortcodeAttr(shortcode, 'title', '')
  const textMatch = shortcode.match(/\[faq(?:\s+[^\]]+)?\](.*?)\[\/faq\]/s)
  const text = textMatch ? decodeHtmlEntities(textMatch[1].trim()) : ''

  return `<small class="shortcode-preview" style="display:inline-block; border-radius: 8px; border: 1px solid #ff4e4e; font-size: 14px; color: #1c1c1c; font-style: italic; padding: 10px; position: relative; width: calc(100% - 20px); max-width: 600px;">
    ❓
    <br />
    <strong>${escapeHtml(title)}</strong>
    <br />
    ${escapeHtml(text)}
  </small>`
}

async function parsePhotoSingle (shortcode) {
  const attrs = getShortcodeAttrs(shortcode, {
    id: null,
    didascalia: null,
    link: null,
    align: null,
    effect: null,
    shape: null,
    'max-width': null,
    zoom: null
  })

  const id = attrs.id
  const caption = attrs.didascalia
  const link = attrs.link
  const align = attrs.align
  const effect = attrs.effect
  const shape = attrs.shape
  const maxWidth = attrs['max-width']
  const zoomEnabled = attrs.zoom === null || attrs.zoom !== 'false'

  if (!id) {
    return '<small class="shortcode-preview" style="display:inline-block; border-radius: 10px; border: 2px dashed #979797; font-size: 14px; width: 100%; max-width: 600px;"><small style="display: block; text-align: center; font-weight: 500; color: #969696; padding: 50px 10px;">Photo: Missing ID</small></small>'
  }

  const ids = id.split(',').map(i => i.trim())
  const imageUrls = await Promise.all(ids.map(i => getMediaHubImagesbyId(i)))
  const totalFloatOptions = [align, effect, maxWidth, zoomEnabled].filter(Boolean).length

  return `<small class="shortcode-preview" style="display: flex; flex-direction: column; position: relative; border-radius: ${shape === 'rounded' ? '30px' : '0px'}; border: 1px solid #979797; width: 100%; max-width: 600px; text-align: center; overflow: hidden;">
    <small style="position: absolute; top: 0; right :0; display: grid; text-align: left; padding: 6px 10px; font-size: 0.7rem; background: #eeeeee;
      border-bottom-left-radius: 8px; grid-template-columns: repeat(${totalFloatOptions > 1 ? 2 : 1}, minmax(0, 1fr)); gap: 2px 5px;">
      ${align ? `<small><strong>Alignment:</strong> ${escapeHtml(align)}</small>` : ''}
      ${effect ? `<small><strong>Effect:</strong> ${escapeHtml(effect)}</small>` : ''}
      ${maxWidth ? `<small><strong>Max Width:</strong> ${escapeHtml(maxWidth)}px</small>` : ''}
      <small><strong>Zoom:</strong> ${zoomEnabled ? 'YES' : 'NO'}</small>
    </small>
    <small style="display: grid; grid-template-columns: repeat(${imageUrls.length > 3 ? 4 : imageUrls.length}, minmax(0, 1fr));">
      ${imageUrls.map((url, index) => `<img src="${escapeHtml(url)}" alt="MediaHub Image ${escapeHtml(ids[index])}" style="width: 100%; aspect-ratio: ${imageUrls.length > 1 ? '1 / 1' : 'auto'}; object-fit: cover;" />`).join('')}
    </small>
    <small style="${caption || link ? 'padding: 5px 0; background: #eeeeee;' : ''}">
      ${caption ? escapeHtml(caption) + '<br />' : ''}
      ${link ? escapeHtml(link) : ''}
    </small>
  </small>`
}
