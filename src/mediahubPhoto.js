/* global tinymce */

tinymce.PluginManager.add('mediahubPhoto', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center;">
        <form method="GET" id="query">
                <input type="text" placeholder="Search images" name="query" style="border: 1px solid black; padding: 5px">
        </form>

        <!--Slider-->
        <div style="display: flex; margin-left: 30px;">
            <input type="range" name="slider-dimensions" id="slider-dimensions" min="2" max="6" value="3" onchange="sliderDimensions(this.value)">
            <span id="slider-dimensions-value" style="margin-left: 5px;">3</span>
        </div>
    </section>


    <form method="GET" id="data" style="color: black">
        <div style="display: flex;">

            <div style="width: 80%; height: 700px; margin: 10px; background-color: #eeeeee; overflow: auto">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-items: stretch;" id="card-container">
                    <!--Images-->
                    <p style="padding: 10px">Insert a search query</p>
                </div>
            </div>

            <div style="width: 20%; height: 700px; margin: 10px; background-color: #c2c2c2; display: flex; flex-direction: column;">

            <div style="margin: 10px;">
                <label for="caption" style="display: block; margin-bottom: 5px;">Didascalia</label>
                <input type="text" placeholder="Insert caption" name="caption" style="background-color: white; padding: 5px; width: 100%">
            </div>

            <div style="margin: 10px;">
                <label for="link" style="display: block; margin-bottom: 5px;">Link</label>
                <input type="text" placeholder="Insert link" name="link" style="background-color: white; padding: 5px; width: 100%">
            </div>

            <div style="margin: 10px;">
                <label for="align" style="display: block; margin-bottom: 5px;">Allineamento</label>
                <select name="align" style="background-color: white; padding: 5px; width: 100%">
                    <option value="" selected>--Select alignment--</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
            </div>

            <div style="margin: 10px;">
                <label for="effect" style="display: block; margin-bottom: 5px;">Effect</label>
                <select name="effect" style="background-color: white; padding: 5px; width: 100%">
                    <option value="" selected>--Select effect--</option>
                    <option value="">Default</option>
                    <option value="juxtapose">Image Compare</option>
                    <option value="carousel">Carousel</option>
                </select>
            </div>

            <div style="margin: 10px;">
                <label for="shape" style="display: block; margin-bottom: 5px;">Shape</label>
                <select name="shape" style="background-color: white; padding: 5px; width: 100%">
                    <option value="" selected>--Select shape--</option>
                    <option value="">Default</option>
                    <option value="rounded">Rounded</option>
                </select>
            </div>

            <div style="margin: 10px;">
                <label for="max-width" style="display: block; margin-bottom: 5px;">Larghezza</label>
                <input type="number" placeholder="Insert max width" name="max-width" value="max-width" style="padding: 5px; background-color: white; width: 100%">
            </div>
                <button type="submit" style="background-color: #0066ff; padding: 7px 0; margin: 20px auto; color: white; text-align: center; text-transform: uppercase; width: 80%">Insert</button>
            </div>

        </div>

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

    .active {
        background-color: #68a4ff !important;
    }
  </style>
`

  editor.ui.registry.addButton('mediahubPhoto', {
    icon: 'mediahubPhoto',
    tooltip: 'Add Photo from MediaHub',
    onAction: function () {
      tinymce.activeEditor.windowManager.open({
        title: 'MediaHub Photo',
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
      lastImage()
      // Search Image
      searchImages()
      // Insert into editor
      insetDataIntoEditor(editor)
    }
  })

  /* Add a icon */
  editor.ui.registry.addIcon('mediahubPhoto', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M160 80H512c8.8 0 16 7.2 16 16V320c0 8.8-7.2 16-16 16H490.8L388.1 178.9c-4.4-6.8-12-10.9-20.1-10.9s-15.7 4.1-20.1 10.9l-52.2 79.8-12.4-16.9c-4.5-6.2-11.7-9.8-19.4-9.8s-14.8 3.6-19.4 9.8L175.6 336H160c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16zM96 96V320c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120V344c0 75.1 60.9 136 136 136H456c13.3 0 24-10.7 24-24s-10.7-24-24-24H136c-48.6 0-88-39.4-88-88V120zm208 24a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>')
  return {
    getMetadata: function () {
      return {
        name: 'mediahubPhoto Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

// === FUNCTIONS === //
async function lastImage (editor) {

  const container = document.querySelector('#card-container')

  const results = await fetch('/nova-vendor/media-hub/media', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function (response) {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('Error in Nova API Request')
        }
      }
        // Debug response
      ).then(function (data) {
        console.log(data.data)
        return data.data
      })

  sliderDimensions(3)
  printCards(results, container)
}
function searchImages (query) {
  const formQuery = document.querySelector('.tox-dialog__content-js form#query')
  const container = document.querySelector('#card-container')

  formQuery.addEventListener('submit', async function (e) {
    e.preventDefault()
    container.innerHTML = 'Loading images...'

    // Get query from Form
    const formData = new FormData(formQuery)
    const query = formData.get('query')

    // Search in Nova
    const cards = query.length > 0 ? await searchInNova(query) : []

    sliderDimensions(3)
    printCards(cards, container)
  })
}

function printCards (cards, container, range = 3) {
  // Reset container
  container.innerHTML = ''

  console.log(sliderDimensions)

  // Print cards on DOM
  if (cards.length > 0) {
    cards.forEach((card, index) => {
      const cardHtml = `
        <label class="checkboxes" style="margin: 10px; position: relative; display: flex; flex-direction: column; flex-grow: 1; cursor: pointer; background-color: #d1d1d1;">
            <div style="height: 250px; padding: 10px 0">
                <img src="${card.thumbnail_url ?? card.url}" style="width: 100%; height: 100%; object-fit: cover; padding: 25px 25px 5px 25px;">
                <span style="position: absolute; top: 0; right: 0; padding: 3px;" ">#${card.id}</span>
                <input type="checkbox" name="id-${index}" style="position: absolute; top: 0; left: 0; display: none" value="${card.id}">
            </div>
            <p style="text-align: center; padding: 4px; font-size: .8rem; margin-bottom: 5px">${card.file_name}</p>
        </label>
        `
      container.innerHTML += cardHtml
    })
  } else {
    container.innerHTML = '<p style="text-align: center; font-size: 1.2rem; margin-top: 10px">No results</p>'
  }

  // Active selected cards
  activeCards()
}

function insetDataIntoEditor (editor) {
  const form = document.querySelector('.tox-dialog__content-js form#data')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    const formData = new FormData(form)

    const ids = getIds(formData)

    const caption = formData.get('caption') ? `didascalia="${formData.get('caption')}"` : ''
    const link = formData.get('link') ? `link="${formData.get('link')}"` : ''
    const align = formData.get('align') ? `align="${formData.get('align')}"` : ''
    const maxWidth = formData.get('max-width') ? `max-width="${formData.get('max-width')}"` : ''
    const effect = formData.get('effect') ? `effect="${formData.get('effect')}"` : ''
    const shape = formData.get('shape') ? `shape="${formData.get('shape')}"` : ''

    const result = `[photo id="${ids}" ${caption} ${link} ${align} ${maxWidth} ${effect} ${shape}]`
    editor.insertContent(result)
    tinymce.activeEditor.windowManager.close()
  })
}

// Search data in Nova with fetch API
function searchInNova (keyword) {
  // Fetch results from Nova API Global Search
  const results =

        fetch('/nova-vendor/media-hub/media?page=1&search=' + keyword, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(function (response) {
            if (response.ok) {
              return response.json()
            } else {
              throw new Error('Error in Nova API Request')
            }
          }
            // Debug response
          ).then(function (data) {
            console.log(data.data)
            return data.data
          })

  return results
}

// Get the ids of the selected images
function getIds (formData) {
  let result = ''

  formData.forEach((value, name) => {
    if (name.startsWith('id-')) {
      result += value + ','
    }
  })

  if (result.endsWith(',')) {
    result = result.slice(0, -1)
  }

  return result
}

// Active cards on click
function activeCards () {
  const checkboxes = document.querySelectorAll('.checkboxes')
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function (e) {
      const chechbox = this.querySelector('input[type="checkbox"]').checked

      if (chechbox) {
        this.classList.add('active')
      } else {
        this.classList.remove('active')
      }
    })
  })
}

function sliderDimensions (value) {
  // Get Range Value
  const rangeValue = document.querySelector('#slider-dimensions-value')
  rangeValue.innerHTML = value

  // Set Grid Template Columns
  const cardContainer = document.querySelector('#card-container')
  cardContainer.style.gridTemplateColumns = `repeat(${value}, 1fr)`

  // Set Image Height
  const imageContainers = document.querySelectorAll('.checkboxes div')

  imageContainers.forEach(imageContainer => {
    if (value === 2) {
      imageContainer.style.height = '300px'
    }
    if (value === 3) {
      imageContainer.style.height = '250px'
    }
    if (value === 4) {
      imageContainer.style.height = '160px'
    }
    if (value === 5) {
      imageContainer.style.height = '150px'
    }
    if (value === 6) {
      imageContainer.style.height = '100px'
    }
  })
}
