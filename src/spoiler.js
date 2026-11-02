/* global tinymce */

tinymce.PluginManager.add('spoiler', function (editor, url) {
  const STYLE_ID = 'spoiler-dialog-styles'

  /* Add space between the dialog fields */
  const injectStyles = function () {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = '.tox-dialog .tox-form__group + .tox-form__group { margin-top: 1rem; }'
    document.head.appendChild(style)
  }

  const removeStyles = function () {
    const el = document.getElementById(STYLE_ID)
    if (el) el.remove()
  }

  const openDialog = function (selectedShortcode) {
    const spoilerRegex = /\[spoiler(?:\s+[^\]]+)?\](.*?)\[\/spoiler\]/gs
    const initialData = {
      title: '',
      spoiler: ''
    }

    if (selectedShortcode && spoilerRegex.test(selectedShortcode)) {
      const titleMatch = selectedShortcode.match(/\[spoiler\s[^\]]*?title=(?:"([^"]*)"|'([^']*)')/)
      const spoilerMatch = selectedShortcode.match(/\[spoiler(?:\s+[^\]]+)?\](.*?)\[\/spoiler\]/s)
      if (titleMatch) initialData.title = titleMatch[1] ?? titleMatch[2]
      if (spoilerMatch) initialData.spoiler = spoilerMatch[1]
    }

    injectStyles()

    return editor.windowManager.open({
      title: 'Spoiler',
      initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'text',
            name: 'title',
            label: 'Title (optional)',
            placeholder: 'Show hidden content'
          },
          {
            type: 'textarea',
            name: 'spoiler',
            label: 'Add spoiler content in your post'
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
        /* Strip double quotes and square brackets from the title */
        const title = String(data.title || '').replace(/"/g, '\'').replace(/[[\]]/g, '').trim()
        const titleAttr = title ? ' title="' + title + '"' : ''
        /* Insert content when the window form is submitted */
        editor.insertContent('[spoiler' + titleAttr + ']' + data.spoiler + '[/spoiler]')
        editor.execCommand('showPreview')
        api.close()
      },
      onClose: function () {
        removeStyles()
      }
    })
  }

  /* Add a spoiler icon */
  editor.ui.registry.addIcon('spoiler', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/></svg>')

  editor.addCommand('mceEditShortcode_spoiler', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a button that opens a window */
  editor.ui.registry.addButton('spoiler', {
    icon: 'spoiler',
    tooltip: 'Add Spoiler',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('spoiler', {
    text: 'Spoiler',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Spoiler Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
