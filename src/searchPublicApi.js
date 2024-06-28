/* global tinymce */

tinymce.PluginManager.add('searchPublicApi', function (editor, url) {
  const content = `
    <section style="display: flex; align-items: center;">
        <form method="GET" id="query" style="width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column">
        <div style="margin: 10px 0">
          <input type="text" placeholder="Search articles" name="q" style="border: 2px solid #eeeeee; padding: 7px 10px; border-radius: 5px;">
        </div>
                  
          <div id="select-type">
              <input type="radio" id="all" name="type" value="all" checked>
              <button onclick="document.getElementById('all').checked = true;" type="submit">All</button>
          </div>
        </form>
    </section>

    <div style="display: flex; width: 100%; height: 100%; padding: 6px; background-color: #eeeeee; margin: 0 0 10px 0">
        
        <div style="width: 100%; margin: 10px; padding: 10px; background-color: white;">
            <p id="search-status" style="font-size: 1.2rem;">Search query too short</p>
            <div id="articles-container">
            </div>
        </div>

    </div>
  `

  const customStyles = `
  <style>
    .tox-dialog {
      max-width: 1350px !important;
    }

    .tox-dialog__body-content {
      min-height: 800px !important;
    }

    .search-public-api-title{
      font-size: 1.3rem !important;
      font-weight: bold !important;
      margin: 0 0 4px 0 !important;
      color: rgb(14,165,233) !important;
      transition: all 0.3s ease !important;
      line-height: 1.5rem !important;
      cursor: pointer !important;
    }
    
    .search-public-api-title:hover{
        color: rgb(164 223 252) !important;
    }
    
    #select-type{
        display: flex;
        justify-content: center;
        margin: 10px 0 0 0;
    }
    
    #select-type input[type="radio"]{
        display: none;
    }
    
    #select-type button{
        padding: 5px 10px;
        cursor: pointer;
        text-transform: uppercase;
        color: #959595;
    }
    
    #select-type input[type="radio"]:checked + button{
        background-color: #eeeeee;
        color: rgb(14,165,233);
        font-weight: bold;
        border-radius: 10px 10px 0 0;
    }
    
    .article-preview{
        background-color: rgb(14,165,233) !important;
         padding: 10px !important;
         border-radius: 5px !important; 
         cursor: pointer !important; 
         display: flex !important; 
         justify-content: center !important;
         align-items: center !important; 
         margin-left: 10px !important; 
         transition: all 0.3s ease !important;
    }
    
    .article-preview:hover svg{
        transform: scale(1.1) !important;
    }
  </style>
`

  editor.ui.registry.addButton('searchPublicApi', {
    icon: 'searchPublicApi',
    tooltip: 'Add Article from all site',
    onAction: function () {
      tinymce.activeEditor.windowManager.open({
        title: 'Search Public Article (NEW)',
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
      printTypes()
      getArticles()
    }
  })

  /* Add a icon */
  editor.ui.registry.addIcon('searchPublicApi', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M168 80c-13.3 0-24 10.7-24 24V408c0 8.4-1.4 16.5-4.1 24H440c13.3 0 24-10.7 24-24V104c0-13.3-10.7-24-24-24H168zM72 480c-39.8 0-72-32.2-72-72V112C0 98.7 10.7 88 24 88s24 10.7 24 24V408c0 13.3 10.7 24 24 24s24-10.7 24-24V104c0-39.8 32.2-72 72-72H440c39.8 0 72 32.2 72 72V408c0 39.8-32.2 72-72 72H72zM176 136c0-13.3 10.7-24 24-24h96c13.3 0 24 10.7 24 24v80c0 13.3-10.7 24-24 24H200c-13.3 0-24-10.7-24-24V136zm200-24h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H376c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 80h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H376c-13.3 0-24-10.7-24-24s10.7-24 24-24zM200 272H408c13.3 0 24 10.7 24 24s-10.7 24-24 24H200c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 80H408c13.3 0 24 10.7 24 24s-10.7 24-24 24H200c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>')
  return {
    getMetadata: function () {
      return {
        name: 'searchPublicApi',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

// === FUNCTIONS === //

async function printTypes () {
  const typesContainer = document.querySelector('#select-type')

  const types = await getTypes()

  Object.keys(types).forEach(type => {
    typesContainer.innerHTML += `
            <input type="radio" id="${type}" name="type" value="${type}">
            <button onclick="document.getElementById('${type}').checked = true;" type="submit">${type}</button>
        `
  })
}

function getTypes (query, type) {
  const results = fetch('/vendor/the-3labs-team/laravel-search-public-api/get-types', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: 'key'
    }
  }).then(function (response) {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('Errore nella richiesta')
    }
  })

  return results
}

function getArticles () {
  const formQuery = document.querySelector('.tox-dialog__content-js form#query')
  const searchStatus = document.querySelector('.tox-dialog__content-js #search-status')

  formQuery.addEventListener('submit', async (e) => {
    e.preventDefault()
    resetArticles()
    searchStatus.innerHTML = 'Searching...'

    const formData = new FormData(formQuery)
    const query = formData.get('q')
    const type = formData.get('type')
    console.log(type + ' - ' + query)

    if (query.length < 3) {
      searchStatus.innerHTML = 'Search query too short'
      return
    }

    const articles = await searchArticles(query, type)
    printArticles(articles)
  })
}

function searchArticles (query, type) {
  const results = fetch(`/vendor/the-3labs-team/laravel-search-public-api/articles/fetch?q=${query}&type=${type}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: 'key'
    }
  })
    .then(function (response) {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('Errore nella richiesta')
      }
    })

  return results
}

function printArticles (articles) {
  const articleContainer = document.querySelector('#articles-container')
  const searchStatus = document.querySelector('.tox-dialog__content-js #search-status')

  searchStatus.innerHTML = ''

  if (articles.length > 0) {
    articles.forEach(article => {
      articleContainer.innerHTML += generateArticlesCardHtml(article)
    })
  } else {
    articleContainer.innerHTML = '<p>No results</p>'
  }

  addArticleLinkOnEditor()
}

function generateArticlesCardHtml (article) {
  return `
    <form method="GET" class="article-form-submit search-public-api-article-card" style="margin: 10px 0; padding: 5px 15px 15px; text-decoration: none; color: black; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eeeeee; width: 100%;">
        <input type="hidden" name="title" value="${article.title}">
        <input type="hidden" name="url" value="${article.url}">
        
        <div>
          <div>
              <span style="font-size: .8rem; font-weight: normal; color: rgba(54,54,54,0.75); text-transform: uppercase">
                ${article.site} - ${article.type}
              </span>
          </div>
          <button type="submit">
              <h3 class="search-public-api-title">${article.title}</h3>
          </button>
          <p style="font-size: 0.75rem; font-weight: normal; color: rgba(54,54,54,0.75)">
              di ${article.author}
              il
                ${new Date(article.published_at).toLocaleString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
          </p>
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 5px;">
          <a title="preview" href="${article.url}" target="_blank" class="article-preview">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width: 25px; height: 25px; fill: white; transition: all 0.3s ease;">
                <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/>
            </svg>
          </a>
          <button class="article-preview" title="Add to editor" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 25px; height: 25px; fill: white; transition: all 0.3s ease;">
            <path d="M128 64c0-35.3 28.7-64 64-64H352V128c0 17.7 14.3 32 32 32H512V448c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V336H302.1l-39 39c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l39 39H128V64zm0 224v48H24c-13.3 0-24-10.7-24-24s10.7-24 24-24H128zM512 128H384V0L512 128z"/>
          </svg>
          </button>
        </div>

    </form>
    `
}

function addArticleLinkOnEditor () {
  const articleForm = document.querySelectorAll('.article-form-submit')
  articleForm.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const formDataArticle = new FormData(form)

      let title = formDataArticle.get('title')
      const url = formDataArticle.get('url')

      const selectedText = tinymce.activeEditor.selection.getContent()

      if (selectedText.length > 0) {
        title = selectedText
      }

      const content = `<a href="${url}">${title}</a>`

      tinymce.activeEditor.insertContent(content)
      tinymce.activeEditor.windowManager.close()
    })
  })
}

function resetArticles () {
  const articleContainer = document.querySelector('#articles-container')

  articleContainer.innerHTML = ''
}
