/* global tinymce */

tinymce.PluginManager.add('button', function (editor, url) {
  const openDialog = function () {
    return editor.windowManager.open({
      title: 'Button',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'link',
            label: 'Add Link for your button'
          },
          {
            type: 'input',
            name: 'label',
            label: 'Add Label (text) for your button'
          },
          {
            type: 'selectbox',
            name: 'level',
            label: 'Choose the level of your button',
            items: [
              { text: 'Primary', value: 'primary' },
              { text: 'Secondary', value: 'secondary' }
            ]
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
        /* Insert content when the window form is submitted */
        editor.insertContent('[button link="' + data.link + '" label="' + data.label + '"]')
        api.close()
      }
    })
  }

  /* Add a button icon */
  editor.ui.registry.addIcon('button', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM224 400a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('button', {
    icon: 'button',
    tooltip: 'Add Button',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('button', {
    text: 'Button',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Button Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
