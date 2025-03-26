/* global tinymce */

tinymce.PluginManager.add('mediahubPhoto', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center; padding: 15px; background-color: #fdfeff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 15px;">
        <form method="GET" id="query" style="flex-grow: 1; display: flex;">
                <input type="text" placeholder="Search images" name="query" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; transition: all 0.2s; background-color: #ffffff; color: #1f2937; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                <button type="submit" style="background-color: #4f46e5; color: white; border: none; border-radius: 6px; padding: 10px 20px; margin-left: 10px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18" style="margin-right: 5px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <span>Search</span>
                </button>
        </form>

        <!--Slider-->
        <div style="display: flex; align-items: center; margin-left: 30px; padding-left: 20px; border-left: 1px solid #d1d5db;">
            <label for="slider-dimensions" style="margin-right: 10px; font-size: 14px; color: #4b5563;">Grid size:</label>
            <input type="range" name="slider-dimensions" id="slider-dimensions" min="2" max="6" value="3" onchange="sliderDimensions(this.value)" style="accent-color: #4f46e5; width: 100px;">
            <span id="slider-dimensions-value" style="margin-left: 8px; font-weight: 600; color: #4b5563; min-width: 15px; text-align: center;">3</span>
        </div>
    </section>

    <form method="GET" id="data" style="color: #1f2937;">
        <div style="display: flex; gap: 15px;">

            <div style="width: 75%; height: 700px; background-color: #fdfeff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: auto; padding: 15px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; align-items: stretch;" id="card-container">
                    <!--Images-->
                    <p style="padding: 20px; color: #6b7280; font-size: 15px; grid-column: 1 / -1; text-align: center;">Enter a search query to find images</p>
                </div>
            </div>

            <div style="width: 25%; height: 700px; background-color: #fdfeff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; padding: 15px;">
                <h3 style="margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 16px; text-align: center;">Image Settings</h3>

                <div style="margin-bottom: 15px;">
                    <label for="caption" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Caption</label>
                    <input type="text" placeholder="Insert caption" name="caption" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; transition: border 0.2s; color: #1f2937; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="link" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Link</label>
                    <input type="text" placeholder="Insert link" name="link" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; transition: border 0.2s; color: #1f2937; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="align" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Alignment</label>
                    <select name="align" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; cursor: pointer; color: #1f2937; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%236b7280"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'); background-position: right 10px center; background-repeat: no-repeat; background-size: 20px; text-align: center; text-align-last: center;">
                        <option value="" selected>--Select alignment--</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                    </select>
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="effect" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Effect</label>
                    <select name="effect" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; cursor: pointer; color: #1f2937; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%236b7280"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'); background-position: right 10px center; background-repeat: no-repeat; background-size: 20px; text-align: center; text-align-last: center;">
                        <option value="" selected>--Select effect--</option>
                        <option value="">Default</option>
                        <option value="gallery-flex">Gallery Flex</option>
                        <option value="juxtapose">Image Compare</option>
                        <option value="carousel">Carousel</option>
                    </select>
                </div>

                <div style="margin-bottom: 15px;">
                    <label for="shape" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Shape</label>
                    <select name="shape" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; cursor: pointer; color: #1f2937; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%236b7280"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'); background-position: right 10px center; background-repeat: no-repeat; background-size: 20px; text-align: center; text-align-last: center;">
                        <option value="" selected>--Select shape--</option>
                        <option value="">Default</option>
                        <option value="rounded">Rounded</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label for="max-width" style="display: block; margin-bottom: 5px; font-size: 14px; color: #4b5563; font-weight: 500;">Max width</label>
                    <div style="display:flex; align-items: center; gap: 10px;">                    
                        <input type="number" placeholder="Insert max width" name="max-width" value="" style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 15px; width: 100%; font-size: 14px; outline: none; transition: border 0.2s; color: #1f2937; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                        <span style="font-size: .9rem; color: #8798af;">px</span>
                    </div>
                </div>
                
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <button type="submit" style="background-color: #4f46e5; color: white; border: none; border-radius: 6px; padding: 12px 0; width: 100%; font-weight: 600; letter-spacing: 0.025em; cursor: pointer; transition: all 0.3s; text-align: center; display: flex; align-items: center; justify-content: center;">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18" style="margin-right: 8px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Insert
                    </button>
                </div>
            </div>
        </div>
    </form>
  `

  // language=HTML
  const customStyles = `
    <style>
      .tox-dialog {
        max-width: 1350px !important;
      }
      
      .tox-dialog__content-js{
        overflow: auto !important;
      }

      .tox-dialog__body-content {
        min-height: 825px !important;
        background-color: #f6f6f6 !important;
        color: #1f2937 !important;
      }

      .tox .tox-dialog__body-content svg {
        fill: transparent !important;
      }
      
      .tox .tox-dialog__header{
        background-color: #f6f6f6 !important;
        color: #1f2937 !important;
      }

      .active {
        background-color: #4f46e5 !important;
        box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3) !important;
        border-color: #4338ca !important;
      }
      
      .active span {
        background-color: #4338ca !important;
      }

      #card-container {
        padding: 5px;
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
async function lastImage(editor) {

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
function searchImages(query) {
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

function printCards(cards, container, range = 3) {
  // Reset container
  container.innerHTML = ''

  console.log(sliderDimensions)

  // Print cards on DOM
  if (cards.length > 0) {
    cards.forEach((card, index) => {
      const cardHtml = `
        <label class="checkboxes" style="position: relative; display: flex; flex-direction: column; cursor: pointer; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: all 0.2s ease; height: 100%; border: 2px solid #e5e7eb; transform: translateY(0); margin: 2px;">
            <div style="height: 200px; position: relative; overflow: hidden;">
                <img src="${card.thumbnail_url ?? card.url}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; inset: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);"></div>
                <span style="position: absolute; top: 8px; right: 8px; background-color: #4b5563; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">#${card.id}</span>
                <input type="checkbox" name="id-${index}" style="position: absolute; top: 0; left: 0; display: none" value="${card.id}">
            </div>
            <div style="padding: 10px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="margin: 0; font-size: 13px; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">${card.file_name}</p>
            </div>
        </label>
        `
      container.innerHTML += cardHtml
    })
  } else {
    container.innerHTML = '<p style="padding: 30px; color: #6b7280; font-size: 16px; grid-column: 1 / -1; text-align: center; background-color: #ffffff; border-radius: 8px; border: 2px solid #e5e7eb;">No results found. Try a different search term.</p>'
  }

  // Active selected cards
  activeCards()
}

function insetDataIntoEditor(editor) {
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

    let result = `[photo id="${ids}" ${caption} ${link} ${align} ${maxWidth} ${effect} ${shape}]`
    result = result.replace(/ +]$/, ']')
    editor.insertContent(result)
    tinymce.activeEditor.windowManager.close()
  })
}

// Search data in Nova with fetch API
function searchInNova(keyword) {
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
function getIds(formData) {
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
function activeCards() {
  const checkboxes = document.querySelectorAll('.checkboxes')
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function (e) {
      const chechbox = this.querySelector('input[type="checkbox"]').checked

      if (chechbox) {
        this.classList.add('active')
        this.style.borderColor = '#4338ca';
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 12px rgba(79, 70, 229, 0.2)';
        this.querySelector('.checkboxes div:first-child div:last-child').style.opacity = '1';
      } else {
        this.classList.remove('active')
        this.style.borderColor = '#e5e7eb';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        this.querySelector('.checkboxes div:first-child div:last-child').style.opacity = '0';
      }
    })

    // Add hover effect
    checkbox.addEventListener('mouseenter', function () {
      if (!this.querySelector('input[type="checkbox"]').checked) {
        this.style.borderColor = '#d1d5db';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }
    });

    checkbox.addEventListener('mouseleave', function () {
      if (!this.querySelector('input[type="checkbox"]').checked) {
        this.style.borderColor = '#e5e7eb';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      }
    });
  })
}

function sliderDimensions(value) {
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
