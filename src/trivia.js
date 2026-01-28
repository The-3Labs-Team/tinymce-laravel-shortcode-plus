/* global tinymce */

tinymce.PluginManager.add('trivia', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center;">
        <form method="GET" id="queryTrivia">
            <input type="text" placeholder="Search trivia" name="query" style="border: 1px solid black; padding: 5px">
        </form>
    </section>


    <form method="GET" id="trivia-data" style="color: black; margin: 20px 10px; max-height: 100vh; overflow: auto">
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead style="border-bottom: 2px solid black;">
              <tr>
                  <th style="padding: 10px;">Topic</th>
              </tr>
          </thead>
          
            <tbody id="last-trivia-container">

            </tbody>

        </table>
    </form>
  `

  const customStyles = `
  <style>
    .tox-dialog {
      max-width: 1350px !important;
    }

    .tox-dialog__body-content {
      min-height: 800px !important;
    }
    
    .checkboxes:checked + div {
        border: 3px solid #ea1e1e !important;
    }
        
    tbody#last-trivia-container tr:hover {
        background-color: #e1e1e1 !important;
    }

  </style>
`

  const openDialog = function (selectedShortcode) {
    const selectedId = selectedShortcode ? selectedShortcode.match(/id=["']([^"']*)["']/)[1] : null

    tinymce.activeEditor.windowManager.open({
      title: 'Trivia',
      selectedId,
      body: {
        type: 'panel',
        items: [
          {
            type: 'htmlpanel',
            html: customStyles + content
          }
        ]
      }
    })
    // Get last trivia
    lastTrivia(selectedId)

    // Search Image
    searchTrivia(selectedId)

    // Insert into editor
    insetDataTrivia(editor)
  }

  editor.ui.registry.addButton('trivia', {
    icon: 'trivia',
    tooltip: 'Add trivia',
    onAction: function () {
      openDialog()
    }
  })

  /* Registra un comando per aprire il dialog */
  editor.addCommand('mceEditShortcode_trivia', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a icon */
  editor.ui.registry.addIcon('trivia', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" height="20" width="20"><path d="M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z"/></svg>')
  return {
    getMetadata: function () {
      return {
        name: 'trivia Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

// === FUNCTIONS === //

async function lastTrivia (selectedId = null) {
  const lastTrivia = await getTrivia()
  printTrivia(lastTrivia, selectedId)
}

async function getTrivia (query = '') {
  try {
    const prefix = '/nova-vendor/the-3labs-team/nova-trivia-package'
    let url = `${prefix}/search`
    if (query !== '') {
      url = `${prefix}/search?query=${query}`
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Error in Nova API Request')
    }

    const lastTrivia = await response.json()
    return lastTrivia.data
  } catch (error) {
    console.error(error)
    return { success: false, data: error.message }
  }
}

function printTrivia (trivias, selectedId = null) {
  const lastTriviaContainer = document.querySelector('#last-trivia-container')

  // Reset container
  lastTriviaContainer.innerHTML = ''

  if (trivias.length > 0) {
    trivias.forEach((trivia, index) => {
      lastTriviaContainer.innerHTML += `
        <tr style="border-bottom: 1px solid #ababab; cursor: pointer; position: relative" >
            <input type="checkbox" name="trivia" id="trivia-${trivia.id}" value="${trivia.id}" class="checkboxes" style="display: none;"
            onclick="document.querySelector('.tox-dialog__content-js form#trivia-data').dispatchEvent(new Event('submit'))">
            <td style="padding: 10px;  ${selectedId == trivia.id ? 'border: 1px solid #0ea5e9; background-color: #d9f1fc;' : ''}">
                <label for="trivia-${trivia.id}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></label>
                ${trivia.topic} ${selectedId}
            </td>
        <tr>
  `
    })
  } else {
    lastTriviaContainer.innerHTML = 'No trivia found'
  }
}

function searchTrivia (selectedId = null) {
  const formQuery = document.querySelector('.tox-dialog__content-js form#queryTrivia')
  const container = document.querySelector('#last-trivia-container')

  formQuery.addEventListener('submit', async function (e) {
    e.preventDefault()
    container.innerHTML = 'Loading trivia...'

    // Get query from Form
    const formData = new FormData(formQuery)
    const query = formData.get('query')

    // Search in Nova
    const trivia = query.length > 0 ? await getTrivia(query) : []

    printTrivia(trivia, selectedId)
  })
}

function insetDataTrivia (editor) {
  const formTrivia = document.querySelector('.tox-dialog__content-js form#trivia-data')

  formTrivia.addEventListener('submit', function (e) {
    e.preventDefault()

    const formData = new FormData(formTrivia)
    const id = formData.get('trivia')

    const result = `[trivia id="${id}"]`
    editor.insertContent(result)
    editor.execCommand('showPreview')
    tinymce.activeEditor.windowManager.close()
  })
}
