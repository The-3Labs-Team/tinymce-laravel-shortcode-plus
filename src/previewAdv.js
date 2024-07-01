/* global tinymce */

tinymce.PluginManager.add('previewAdv', (editor, url) => {
  editor.on('init', function () {
    const thresholds = {
      1: 0,
      2: 2,
      3: 8
    }

    let pCount = 0 // Counter for <p> tags
    let advCount = 1 // Counter for adv divs

    // Funzione per inserire le div di pubblicità
    function insertAdv () {
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

    insertAdv()

    editor.on('change', function () {
      pCount = 0
      advCount = 1
      insertAdv()
    })
  })

  return {
    getMetadata: () => ({
      name: 'Preview Adv',
      url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
    })
  }
})
