/* global tinymce */

tinymce.PluginManager.add('previewAdv', (editor, url) => {
  let isEnable = true

  editor.ui.registry.addIcon('adv', '<svg xmlns="http://www.w3.org/2000/svg" height="1.5em" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 407.96"><path fill-rule="nonzero" d="M74.36 0h295.21c40.84 0 74.37 33.52 74.37 74.36v146.3c-9.49-5.1-19.01-10.13-28.35-14.93V74.36c0-25.32-20.69-46.02-46.02-46.02H74.36c-25.34 0-46.02 20.68-46.02 46.02v169.07c0 25.27 20.76 46.01 46.02 46.01h240.72l4.55 28.35H74.36C33.46 317.79 0 284.33 0 243.43V74.36C0 33.51 33.51 0 74.36 0zM460.8 406.23c-5.6 3.19-12.89 1.91-16.8-3.38l-28.14-38.81-19.56 27.06c-1.61 2.22-3.37 4.22-5.2 5.88-11.66 10.7-26.11 7.98-29.12-9.25l-25.01-166.24c-1.59-7.56 6.08-13.54 13.1-10.47 41.84 16.73 107.81 52.79 151 76.3 20.73 11.36 8.43 28.53-7.57 33.59-9.71 3.71-21.78 6.88-31.9 10.07l28.07 39.08c3.84 5.52 2.52 13.21-2.7 17.36-7.55 5.36-18.61 14.72-26.17 18.81zm-6.17-13.11L477 376.97c-7.25-9.92-31.76-39.89-35.15-48.82-1.19-3.75.94-7.79 4.69-8.96 13.6-4.19 27.8-7.94 41.53-11.83 3.16-1.01 5.95-2.36 8.11-4.94-1.09-1.1-1.74-1.62-3.14-2.38l-138.81-70.13 22.94 153.4c.08.44.91 3.8 1.1 4.03 3.36-2 5.02-3.25 7.41-6.55 4.87-7.26 19.14-31.77 24.72-35.97 3.19-2.19 7.6-1.46 9.88 1.68l34.35 46.62zM232.67 215.38V102.41h50.61c20.36 0 34.34 4.34 41.93 13.02 7.59 8.67 11.39 23.17 11.39 43.47 0 20.3-3.8 34.79-11.39 43.46-7.59 8.68-21.57 13.02-41.93 13.02h-50.61zm51.15-84.04h-15v55.12h15c4.94 0 8.53-.58 10.75-1.72 2.23-1.14 3.35-3.77 3.35-7.86v-35.97c0-4.09-1.12-6.71-3.35-7.86-2.22-1.14-5.81-1.71-10.75-1.71zm-138.35 84.04h-38.14l29.28-112.97h55.85l29.28 112.97H183.6l-4.15-17.9h-29.83l-4.15 17.9zm18.07-78.26-7.41 31.63h16.63l-7.23-31.63h-1.99z"/></svg>')

  editor.ui.registry.addToggleButton('previewAdv', {
    icon: 'adv',
    tooltip: 'Enable Preview Adv',
    onAction: async (_) => {
      isEnable = !isEnable
      togglePreviewAdv(isEnable)
    }
  })

  editor.on('init', function () {
    insertAdv()
    togglePreviewAdv(isEnable)

    // === TIMER ===
    let typingTimer
    const typingDebounce = 1000 // 1 second

    // === EDITOR ACTIONS ===
    editor.on('keydown', function () {
      clearTimeout(typingTimer)
    })

    editor.on('keyup', function () {
      clearTimeout(typingTimer)
      typingTimer = setTimeout(insertAdvAndSetCursor, typingDebounce)
    })
  })

  // === FUNCTIONS ===
  /**
   * Toggle the button state and show/hide the advs
   * @param isEnable
   */
  function togglePreviewAdv (isEnable) {
    const advDivs = editor.getBody().querySelectorAll('.mceNonEditable.adv-preview')
    for (let i = 0; i < advDivs.length; i++) {
      advDivs[i].style.display = isEnable ? 'block' : 'none'
    }

    // Update button state
    setTimeout(() => {
      const toolbar = editor.getContainer().querySelector('.tox-toolbar-overlord')
      const btn = toolbar.querySelector('button[aria-label="Enable Preview Adv"]')
      if (isEnable) {
        btn.classList.add('tox-tbtn--enabled')
      } else {
        btn.classList.remove('tox-tbtn--enabled')
      }
    }, 0)
  }

  /**
   * Calculate the position of the adv and insert it
   */
  function insertAdv () {
    const params = editor.getParam('previewAdv') // Get the parameters from config file
    let thresholds = params.thresholds
    thresholds = Object.keys(thresholds).sort((a, b) => a - b).reduce((acc, key, index) => {
      acc[index + 1] = thresholds[key]
      return acc
    }, {})
    thresholds = Array.from(new Set(Object.values(thresholds)))

    const blacklist = params.blacklist

    // REMOVE OLD ADV FOR LOAD NEW
    removeAdvInEditor()
    const body = editor.getBody()
    let paragraphs = body.getElementsByTagName('p')
    paragraphs = Array.from(paragraphs)

    let insertedAdv = 0
    paragraphs.forEach((paragraph, index) => {
      if (thresholds.includes(index)) {
        // === BLACKLIST ===
        const bfBlacklist = blacklist.before.slice(1, -1).split('|')
        const afBlacklist = blacklist.after.slice(1, -1).split('|')

        bfBlacklist.push('<br', '\\[[^\\]]')
        afBlacklist.push('<br', '\\[[^\\]]')

        const beforeElement = paragraph.previousElementSibling
        const afterElement = paragraph.nextElementSibling

        const div = editor.dom.create('div', {
          class: 'mceNonEditable adv-preview',
          contenteditable: 'false',
          'data-mce-bogus': 'all'
        })
        div.style.backgroundColor = '#f3f3f3'
        div.style.color = '#666'
        div.style.padding = '10px'
        div.style.border = '1px solid #ccc'
        div.style.textAlign = 'center'
        div.style.margin = '10px 0'
        div.innerHTML = 'Spazio riservato per la pubblicità'

        // BEFORE BLACKLIST
        if (beforeElement && bfBlacklist.some(item => new RegExp(item).test(beforeElement.innerHTML))) {
          return
        }

        // AFTER BLACKLIST TODO: Far uscire l'adv e non eliminarlo dopo il blacklist
        if (afterElement && afBlacklist.some(item => new RegExp(item).test(afterElement.innerHTML))) {
          const nextElement = afterElement.nextElementSibling
          const nextNextElement = nextElement.nextElementSibling

          if (
            (nextElement && afBlacklist.some(item => new RegExp(item).test(nextElement.innerHTML))) ||
            (nextNextElement && afBlacklist.some(item => new RegExp(item).test(nextNextElement.innerHTML)))
          ) {
            thresholds[insertedAdv] = thresholds[insertedAdv] + 2
            return
          } else {
            editor.dom.insertAfter(div, nextElement)
          }
          return
        }
        // === END BLACKLIST ===

        editor.dom.insertAfter(div, paragraph)
        insertedAdv++
      }
    })
  }

  /**
   * Insert ADV and set cursor after it
   */
  function insertAdvAndSetCursor () {
    insertAdv()

    setTimeout(function () {
      editor.focus()
      const nextNode = editor.selection.getNode().nextSibling

      if (nextNode) {
        editor.selection.setCursorLocation(nextNode, -1)
      }
    }, 0)
  }

  /**
   * Remove all adv-preview elements from the editor
   */
  function removeAdvInEditor () {
    const advDivs = editor.getBody().querySelectorAll('.mceNonEditable.adv-preview')
    for (let i = 0; i < advDivs.length; i++) {
      advDivs[i].remove()
    }
  }

  /**
   * Remove the adv-preview elements from the content before saving it
   */
  editor.on('GetContent', function (e) {
    if (e.source_view || e.format === 'raw') return

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = e.content

    const advPreviews = tempDiv.querySelectorAll('.mceNonEditable.adv-preview')
    advPreviews.forEach(function (el) {
      el.parentNode.removeChild(el)
    })

    e.content = tempDiv.innerHTML
  })

  return {
    getMetadata: () => ({
      name: 'Preview Adv',
      url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
    })
  }
})
