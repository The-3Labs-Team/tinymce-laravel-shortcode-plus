/* global tinymce */

tinymce.PluginManager.add('distico', function (editor, url) {
  const openDialog = function (selectedShortcode) {
    const disticoRegex = /\[distico(?:\s+[^\]]+)?\](.*?)\[\/distico\]/gs;
    let initialData = {
      distico: '',
    }

    if (selectedShortcode && disticoRegex.test(selectedShortcode)) {
      const disticoMatch = selectedShortcode.match(/\[distico(?:\s+[^\]]+)?\](.*?)\[\/distico\]/s)
      if (disticoMatch) initialData.distico = disticoMatch[1]
    }

    return editor.windowManager.open({
      title: 'Distico',
      initialData: initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'textarea',
            name: 'distico',
            label: 'Add distico content in your post'
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
        editor.insertContent('[distico]' + data.distico + '[/distico]')
        editor.execCommand('showPreview');
        api.close()
      }
    })
  }


  editor.addCommand('mceEditShortcode_distico', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a distico icon */
  editor.ui.registry.addIcon('distico', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M432 64H208c-8.8 0-16 7.2-16 16V96H128V80c0-44.2 35.8-80 80-80H432c44.2 0 80 35.8 80 80V304c0 44.2-35.8 80-80 80H416V320h16c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16zM0 192c0-35.3 28.7-64 64-64H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V192zm64 32c0 17.7 14.3 32 32 32H288c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32 14.3-32 32z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('distico', {
    icon: 'distico',
    tooltip: 'Add Distico',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('distico', {
    text: 'Distico',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Distico Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
