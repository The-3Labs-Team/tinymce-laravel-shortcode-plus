/* global tinymce */

tinymce.PluginManager.add('index', function (editor, url) {
  const openDialog = function () {
    return editor.windowManager.open({
      title: 'Index',
      body: {
        type: 'panel',
        items: [
          {
            type: 'htmlpanel',
            html: '<p>Aggiungendo un index, tutte le intestazioni (H1, H2, H3… H6) verranno inserite automaticamente all’interno di una lista non ordinata. Assicurati che le intestazioni seguano sempre l’ordine corretto.</p>'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          text: 'Close'
        },
        {
          type: 'submit',
          text: 'Add Index',
          primary: true
        }
      ],
      onSubmit: function (api) {
        editor.insertContent('[index]')
        api.close()
      }
    })
  }

  /* Add a button icon */
  editor.ui.registry.addIcon('index', '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('index', {
    icon: 'index',
    tooltip: 'Add index',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('index', {
    text: 'Index',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Index Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
