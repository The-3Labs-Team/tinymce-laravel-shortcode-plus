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
        text-align: center !important;
        text-transform: uppercase !important;;
        font-weight: bold !important;
    }
    .search-public-api-article-card:hover{
        background-color: #c7c7c7 !important;
        transition: all 0.3s ease-in-out !important;
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
    <form method="GET" class="article-form-submit search-public-api-article-card" style="margin: 10px 0; border: 1px solid black; padding: 5px; text-decoration: none; color: black">
        <input type="hidden" name="title" value="${article.title}">
        <input type="hidden" name="url" value="${article.url}">
        <button type="submit">
            <span style="font-size: 1.2rem; font-weight: bold">${article.title}</span>
            <span style="font-size: 1rem; font-weight: normal; color: rgba(54,54,54,0.75)">(${article.site})</span>
            <p>
                ${article.author}
                <br>
                ${new Date(article.published_at).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })}
            </p>
        </button>
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
