/* global tinymce */

tinymce.PluginManager.add('linkedin', function (editor, url) {
  const openDialog = function (selectedShortcode) {
    const buttonRegex = /^\[linkedin(?:\s+[^\]]+)?\]$/
    const initialData = {
      url: ''
    }

    if (selectedShortcode && buttonRegex.test(selectedShortcode)) {
      const urlMatch = selectedShortcode.match(/url=["']([^"']*)["']/)
      if (urlMatch) initialData.url = urlMatch[1]
    }

    return editor.windowManager.open({
      title: 'LinkedIn',
      initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'url',
            name: 'url',
            label: 'Add LinkedIn post URL',
            placeholder: 'https://www.linkedin.com/posts/example-post',
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
        editor.insertContent('[linkedin url="' + data.url + '"]')
        editor.execCommand('showPreview')
        api.close()
      }
    })
  }

  editor.addCommand('mceEditShortcode_linkedin', function (args) {
    openDialog(args.selectedShortcode)
  })

  editor.ui.registry.addIcon('linkedin', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M100.3 448H7.4V148.9h92.9V448zM53.8 108.1C24.1 108.1 0 83.5 0 53.6C0 23.9 24.1 0 53.8 0s53.8 23.9 53.8 53.6c0 29.9-24.1 54.5-53.8 54.5zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2c-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.6-48.3 87.6-48.3c93.7 0 111 61.7 111 141.9V448z"/></svg>')

  editor.ui.registry.addButton('linkedin', {
    icon: 'linkedin',
    tooltip: 'Add LinkedIn post',
    onAction: function () {
      openDialog()
    }
  })

  editor.ui.registry.addMenuItem('linkedin', {
    text: 'LinkedIn',
    onAction: function () {
      openDialog()
    }
  })

  return {
    getMetadata: function () {
      return {
        name: 'LinkedIn Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
