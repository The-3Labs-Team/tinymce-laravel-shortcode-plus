/* global tinymce */
tinymce.PluginManager.add('widgetbay', function (editor, url) {
  const content = `
     <section style="display: flex; align-items: center;">
        <form method="GET" id="widgetbay-form" style="width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column">
         
            <label>
                <span class="label-span">Add Widgetbay ID</span>
                <input type="text" name="widget-id" style="border: 2px solid #eeeeee; padding: 7px 10px; border-radius: 5px;">
            </label>
            
            <label>
                <span class="label-span">or add product URL</span>
                <div class="flex">
                  <input type="text" name="widget-url">
                  <div onclick="addNewLink()" class="flex" style="width: 35px; height: 35px; display: flex; background-color: rgb(14,165,233); color: white; margin-left: 4px; border-radius: 100%; cursor: pointer;">
                    <span style="margin: auto">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="1em" style="fill: white"
                        ><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
                    </span>
                  </div>
                </div>
                
                <div id="links-box">
                
                </div>

            </label>
                                    
            <label>
                <span class="label-span">Custom title (optional)</span>
                <input type="text" name="widget-title" style="border: 2px solid #eeeeee; padding: 7px 10px; border-radius: 5px;">
            </label>
            
            <label>
                <span class="label-span">Force Link (optional)</span>
                <input type="text" name="widget-force-link" style="border: 2px solid #eeeeee; padding: 7px 10px; border-radius: 5px;">
                <p style="color: #9f9f9f; font-size: 0.8rem;">It only works on single product</p>
            </label>
            
            <button type="submit" style="padding: 10px; border-radius: .2rem; cursor: pointer; background-color: rgb(14,165,233); color: white;">
              Create
            </button>

        </form>
     </section>
  `

  const customStyles = `
  <style>
      label{
      display: block !important;
      width: 100% !important;
      margin: 10px 0 !important;
    }
    
    label input{
      width: 100% !important;
      border: 2px solid #eeeeee !important; 
      padding: 7px 10px !important;
      border-radius: 5px !important;
    }
    
    .label-span{
      display: block !important;
      color: #9f9f9f !important;
      font-weight: 600 !important;
      font-size: 0.9rem !important;
    }
  </style>
`

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('widgetbay', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5V80C0 53.5 21.5 32 48 32H197.5c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('widgetbay', {
    icon: 'widgetbay',
    tooltip: 'Add Widgetbay iframe',
    onAction: function () {
      tinymce.activeEditor.windowManager.open({
        title: 'Widgetbay',
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
      generateShortcode()
    }
  })

  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Widgetbay Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})

function addNewLink () {
  const linksBox = document.getElementById('links-box')

  const links = linksBox.getElementsByTagName('input')
  const linksCount = links.length

  const newLink = document.createElement('input')
  newLink.type = 'text'
  newLink.name = 'widget-url-' + linksCount
  newLink.style.margin = '5px 0'

  linksBox.appendChild(newLink)
}

function generateShortcode () {
  const formQuery = document.querySelector('#widgetbay-form')

  formQuery.addEventListener('submit', function (e) {
    e.preventDefault()
    const formData = new FormData(formQuery)

    // get all data starting with widget-url
    const links = []
    for (const pair of formData.entries()) {
      if (pair[0].includes('widget-url') && pair[1] !== '') {
        links.push(pair[1])
      }
    }
    const link = links.join(',')

    const parsedTitle = formData.get('widget-title') ? 'title="' + formData.get('widget-title') + '" ' : ''
    const parsedLink = link ? 'link="' + link + '" ' : ' '
    const parsedId = formData.get('widget-id') ? 'id="' + formData.get('widget-id') + '"' : ' '
    const parsedForceLink = formData.get('widget-force-link') ? 'forceLink="' + formData.get('widget-force-link') + '" ' : ' '

    const content = '[widgetbay ' + parsedId + parsedLink + parsedTitle + parsedForceLink + ']'

    tinymce.activeEditor.insertContent(content)
    tinymce.activeEditor.windowManager.close()
  })
}
