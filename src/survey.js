/* global tinymce */

tinymce.PluginManager.add('survey', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center;">
        <form method="GET" id="querySurvey">
            <input type="text" placeholder="Search survey" name="query" style="border: 1px solid black; padding: 5px">
        </form>
    </section>


    <form method="GET" id="survey-data" style="color: black; margin: 20px 10px; max-height: 100vh; overflow: auto">
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead style="border-bottom: 2px solid black;">
              <tr>
                  <th style="padding: 10px;">Name</th>
                  <th style="padding: 10px;">Question</th>
              </tr>
          </thead>
          
            <tbody id="last-survey-container">

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
        
    tbody#last-survey-container tr:hover {
        background-color: #e1e1e1 !important;
    }

  </style>
`

  const openDialog = function (selectedShortcode) {
    const selectedId = selectedShortcode ? selectedShortcode.match(/id=["']([^"']*)["']/)[1] : null

    tinymce.activeEditor.windowManager.open({
      title: 'Survey',
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
    // Get last survey
    lastSurvey(selectedId)

    // Search Image
    searchSurvey(selectedId)

    // Insert into editor
    insetData(editor)
  }

  editor.ui.registry.addButton('survey', {
    icon: 'survey',
    tooltip: 'Add survey',
    onAction: function () {
      openDialog()
    }
  })

  editor.addCommand('mceEditShortcode_survey', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a icon */
  editor.ui.registry.addIcon('survey', '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M448 96c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320zM256 160c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32zm64 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l192 0zM192 352c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32z"/></svg>')
  return {
    getMetadata: function () {
      return {
        name: 'survey Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

// === FUNCTIONS === //

async function lastSurvey (selectedId = null) {
  const lastSurveys = await getSurveys()
  printSurvey(lastSurveys, selectedId)
}

async function getSurveys (query = '') {
  try {
    let url = '/nova-vendor/the-3labs-team/nova-survey-package/search'
    if (query !== '') {
      url = `/nova-vendor/the-3labs-team/nova-survey-package/search?query=${query}`
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

    const lastSurvey = await response.json()
    return lastSurvey.data
  } catch (error) {
    console.error(error)
    return { success: false, data: error.message }
  }
}

function printSurvey (surveys, selectedId = null) {
  const lastSurveyContainer = document.querySelector('#last-survey-container')

  // Reset container
  lastSurveyContainer.innerHTML = ''

  if (surveys.length > 0) {
    surveys.forEach((survey, index) => {
      lastSurveyContainer.innerHTML += `
        <tr style="border-bottom: 1px solid #ababab; cursor: pointer; position: relative; ${selectedId == survey.id ? 'border: 1px solid #0ea5e9; background-color: #d9f1fc;' : ''}">
            <input type="checkbox" name="survey" id="survey-${survey.id}" value="${survey.id}" class="checkboxes" style="display: none;"
            onclick="document.querySelector('.tox-dialog__content-js form#survey-data').dispatchEvent(new Event('submit'))">
            <td style="padding: 10px;">
                <label for="survey-${survey.id}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"></label>
                ${survey.name}
            </td>
            <td style="padding: 10px;">
                ${survey.question}
            </td>
        <tr>
  `
    })
  } else {
    lastSurveyContainer.innerHTML = 'No survey found'
  }
}

function searchSurvey (selectedId = null) {
  const formQuery = document.querySelector('.tox-dialog__content-js form#querySurvey')
  const container = document.querySelector('#last-survey-container')

  formQuery.addEventListener('submit', async function (e) {
    e.preventDefault()
    container.innerHTML = 'Loading survey...'

    // Get query from Form
    const formData = new FormData(formQuery)
    const query = formData.get('query')

    // Search in Nova
    const surveys = query.length > 0 ? await getSurveys(query) : []

    printSurvey(surveys, selectedId)
  })
}

function insetData (editor) {
  const formSurvey = document.querySelector('.tox-dialog__content-js form#survey-data')

  formSurvey.addEventListener('submit', function (e) {
    e.preventDefault()

    const formData = new FormData(formSurvey)
    const id = formData.get('survey')

    const result = `[survey id="${id}"]`
    editor.insertContent(result)
    editor.execCommand('showPreview')
    tinymce.activeEditor.windowManager.close()
  })
}
