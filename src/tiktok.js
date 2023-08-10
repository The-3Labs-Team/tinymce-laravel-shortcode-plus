/* global tinymce */

tinymce.PluginManager.add('tiktok', function (editor, url) {
  const openDialog = function () {
    return editor.windowManager.open({
      title: 'tiktok',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'url',
            name: 'url',
            label: 'Add TikTok video URL',
            placeholder: 'https://www.tiktok.com/@tomshardwareita/video/7264641716760628513?lang=it-IT'
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
        editor.insertContent('[tiktok url="' + data.url + '"]')
        api.close()
      }
    })
  }

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('tiktok', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('tiktok', {
    icon: 'tiktok',
    tooltip: 'Add TikTok video',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('tiktok', {
    text: 'TikTok',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'TikTok Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
