/* global tinymce */

tinymce.PluginManager.add('facebook', function (editor, url) {
  const openDialog = function (selectedShortcode) {
    const buttonRegex = /^\[facebook(?:\s+[^\]]+)?\]$/
    const initialData = {
      url: ''
    }

    if (selectedShortcode && buttonRegex.test(selectedShortcode)) {
      const urlMatch = selectedShortcode.match(/url=["']([^"']*)["']/)
      if (urlMatch) initialData.url = urlMatch[1]
    }

    return editor.windowManager.open({
      title: 'Facebook',
      initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'url',
            name: 'url',
            label: 'Add Facebook post URL',
            placeholder: 'https://www.facebook.com/3labs/posts/1234567890'
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
        editor.insertContent('[facebook url="' + data.url + '"]')
        editor.execCommand('showPreview')
        api.close()
      }
    })
  }

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('facebook', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>')

  editor.addCommand('mceEditShortcode_facebook', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a button that opens a window */
  editor.ui.registry.addButton('facebook', {
    icon: 'facebook',
    tooltip: 'Add Facebook post',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('facebook', {
    text: 'Facebook',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Facebook Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
