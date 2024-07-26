/* global tinymce */
tinymce.PluginManager.add('widgetbay', function (editor, url) {
  const openDialog = function () {
    return editor.windowManager.open({
      title: 'Widgetbay',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'number',
            name: 'id',
            label: 'Add Widgetbay ID',
            placeholder: ''
          },
          {
            type: 'input',
            inputMode: 'url',
            name: 'link',
            label: 'or add product URL',
            placeholder: 'https://www.amazon.it/B...'
          },
          {
            type: 'input',
            inputMode: 'text',
            name: 'title',
            label: 'Custom title (optional)',
            placeholder: 'Add custom title to product'
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
          text: 'Save',
          primary: true
        }
      ],
      onSubmit: function (api) {
        const data = api.getData()

        const id = data.id ? 'id="' + data.id + '"' : null
        const link = data.link ? 'link="' + data.link + '"' : null
        const title = data.title ? 'title="' + data.title + '"' : null

        editor.insertContent('[widgetbay ' + (id ?? link) + ' ' + (title ?? '') + ']')
        api.close()
      }
    })
  }

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('widgetbay', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5V80C0 53.5 21.5 32 48 32H197.5c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('widgetbay', {
    icon: 'widgetbay',
    tooltip: 'Add Widgetbay iframe',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('widgetbay', {
    text: 'Widgetbay',
    onAction: function () {
      /* Open window */
      openDialog()
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
