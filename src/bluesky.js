/* global tinymce */

tinymce.PluginManager.add('bluesky', function (editor, url) {
  const openDialog = function (selectedShortcode) {
    const buttonRegex = /^\[bluesky(?:\s+[^\]]+)?\]$/
    const initialData = {
      url: ''
    }

    if (selectedShortcode && buttonRegex.test(selectedShortcode)) {
      const urlMatch = selectedShortcode.match(/url=["']([^"']*)["']/)
      if (urlMatch) initialData.url = urlMatch[1]
    }

    return editor.windowManager.open({
      title: 'BlueSky',
      initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'url',
            name: 'url',
            label: 'Add BlueSky post URL',
            placeholder: 'https://bsky.app/profile/adamparkhomenko.bsky.social/post/3liz5p73u6k2f'
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
        editor.insertContent('[bluesky url="' + data.url + '"]')
        editor.execCommand('showPreview')
        api.close()
      }
    })
  }

  editor.addCommand('mceEditShortcode_bluesky', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('bluesky', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2c42.1-31.6 110.3-56 110.3 21.8c0 15.5-8.9 130.5-14.1 149.2C478.2 298 412 314.6 353.1 304.5c102.9 17.5 129.1 75.5 72.5 133.5c-107.4 110.2-154.3-27.6-166.3-62.9l0 0c-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8l0 0c-12 35.3-59 173.1-166.3 62.9c-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1C10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('bluesky', {
    icon: 'bluesky',
    tooltip: 'Add BlueSky post',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('bluesky', {
    text: 'BlueSky',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'BlueSky Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
