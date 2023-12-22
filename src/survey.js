/* global tinymce */

tinymce.PluginManager.add('survey', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center;">
        <form method="GET" id="querySurvey">
            <input type="text" placeholder="Search survey" name="query" style="border: 1px solid black; padding: 5px">
        </form>
    </section>


    <form method="GET" id="survey-data" style="color: black; margin: 20px 10px;">
        <div id="last-survey-container" style="display: grid; gap: 20px; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); height: 600px; overflow: auto;">
        
        </div>
        
        <button type="submit" style="background-color: #ff0000; padding: 7px 0; margin: 20px auto; color: white; text-align: center; text-transform: uppercase; width: 100%">Insert</button>
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
  </style>
`

  editor.ui.registry.addButton('survey', {
    icon: 'survey',
    tooltip: 'Add survey',
    onAction: function () {
      tinymce.activeEditor.windowManager.open({
        title: 'Survey',
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
      lastSurvey()

      // Search Image
      searchSurvey()

      // Insert into editor
      insetData(editor)
    }
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

async function lastSurvey() {
  const lastSurveys = await getSurveys()
  printSurvey(lastSurveys)
}

async function getSurveys(query = '') {
  try {
    let url = '/api/survey'
    if (query !== '') {
      url = `/api/survey?query=${query}`
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error in Nova API Request');
    }

    const lastSurvey = await response.json();
    return lastSurvey.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: error.message };
  }
}

function printSurvey(surveys) {
  const lastSurveyContainer = document.querySelector('#last-survey-container')

  // Reset container
  lastSurveyContainer.innerHTML = ''

  if(surveys.length > 0) {
  surveys.forEach((survey, index) => {
    lastSurveyContainer.innerHTML += `
    <label for="survey-${survey.id}" style="cursor: pointer">
    <input type="checkbox" id="survey-${survey.id}" name="survey-${survey.id}" value="${survey.id}" style="display: none" class="checkboxes"></input>
        <div style="text-align: center; padding: 10px 20px; border: 3px solid black; display: flex; height: 100%;">
            <div style="margin: auto">
              <span style="font-size: 1.8rem; font-weight: bold">${survey.name}</span>
              <br>
              <span style="font-size: 1.2rem; color: #343434">${survey.question}</span>
            </div>
        </div>
    </label>
  `
  })
  } else {
        lastSurveyContainer.innerHTML = 'No survey found'
  }
}

function searchSurvey(query) {
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

    printSurvey(surveys)
  })

}

function insetData(editor) {
  const formSurvey = document.querySelector('.tox-dialog__content-js form#survey-data')

  formSurvey.addEventListener('submit', function (e) {
    e.preventDefault()

    const formData = new FormData(formSurvey)
    const ids = getSurveyIds(formData)

    const result = `[survey id="${ids}"]`
    editor.insertContent(result)
    tinymce.activeEditor.windowManager.close()
  })
}

// Get the ids of the selected images
function getSurveyIds (formData) {
  let result = ''

  formData.forEach((value, name) => {
    if (name.startsWith('survey-')) {
      result += value + ','
    }
  })

  if (result.endsWith(',')) {
    result = result.slice(0, -1)
  }
  return result
}