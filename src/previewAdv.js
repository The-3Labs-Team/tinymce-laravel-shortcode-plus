/* global tinymce */

tinymce.PluginManager.add('previewAdv', (editor, url) => {
  let isEnable = false

  editor.ui.registry.addToggleButton('previewAdv', {
    icon: 'preview',
    tooltip: 'Enable Preview Adv',
    onAction: async (_) => {
      isEnable = !isEnable
      togglePreviewAdv(isEnable)
    }
  })

  function togglePreviewAdv (isEnable) {
    const advDivs = editor.getBody().querySelectorAll('.adv-preview')

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

  editor.on('init', function () {
    const params = editor.getParam('previewAdv')
    const thresholds = params.thresholds
    const blacklist = params.blacklist

    let pCount = 0 // Counter for <p> tags
    let advCount = 1 // Counter for adv divs

    insertAdv()
    togglePreviewAdv(isEnable)

    // === TIMER ===
    let typingTimer
    const typingDebounce = 1000 // 1 second

    // === EDITOR ACTIONS ===
    editor.on('SaveContent', function (e) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = e.content

      const advDivs = tempDiv.querySelectorAll('.adv-preview')
      advDivs.forEach(function (div) {
        div.remove()
      })

      e.content = tempDiv.innerHTML
    })

    editor.on('keydown', function () {
      clearTimeout(typingTimer)
    })

    editor.on('keyup', function () {
      clearTimeout(typingTimer)
      typingTimer = setTimeout(addAdvInEditor, typingDebounce)
    })

    // === FUNCTIONS ===
    function insertAdv () {
      // REMOVE OLD ADV FOR LOAD NEW
      const advDivs = editor.getBody().querySelectorAll('.adv-preview')
      for (let i = 0; i < advDivs.length; i++) {
        advDivs[i].remove()
      }

      const body = editor.getBody()
      const paragraphs = body.getElementsByTagName('p')

      for (let i = 0; i < paragraphs.length; i++) {
        if (pCount === thresholds[advCount]) {
          if (paragraphs[i].nextElementSibling && paragraphs[i].nextElementSibling.classList.contains('adv-preview')) {
            continue
          }

          // === BLACKLIST ===
          const bfBlacklist = blacklist.before.slice(1, -1).split('|')
          const afBlacklist = blacklist.after.slice(1, -1).split('|')

          bfBlacklist.push('<br', '\\[[^\\]]')
          afBlacklist.push('<br', '\\[[^\\]]')

          // AFTER BEFORE
          // if (bfBlacklist.some(item => paragraphs[i].innerHTML.includes(item))) {
          //   continue
          // }
          if (bfBlacklist.some(item => new RegExp(item).test(paragraphs[i].innerHTML))) {
            continue
          }

          // AFTER BLACKLIST
          // if (afBlacklist.some(item => paragraphs[i + 1].innerHTML.includes(item))) {
          //   continue
          // }
          if (afBlacklist.some(item => new RegExp(item).test(paragraphs[i + 1].innerHTML))) {
            continue
          }
          // === END BLACKLIST ===

          const div = editor.dom.create('div', { class: 'adv-preview', contenteditable: 'false' })
          div.style.backgroundColor = '#f3f3f3'
          div.style.color = '#666'
          div.style.padding = '10px'
          div.style.border = '1px solid #ccc'
          div.style.textAlign = 'center'
          div.style.margin = '10px 0'
          div.innerHTML = 'Qui ci finiscono le ADV'
          editor.dom.insertAfter(div, paragraphs[i])
          advCount++
        }

        pCount++
      }
    }

    function addAdvInEditor () {
      pCount = 0
      advCount = 1

      // const bookmark = editor.selection.getBookmark(2, true)
      insertAdv()

      setTimeout(function () {
        editor.focus()
        const nextNode = editor.selection.getNode().nextSibling

        if (nextNode) {
          editor.selection.setCursorLocation(nextNode, -1)
        }
      }, 0)
    }
  })

  return {
    getMetadata: () => ({
      name: 'Preview Adv',
      url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
    })
  }
})
