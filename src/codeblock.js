/* global tinymce */

tinymce.PluginManager.add('codeblock', function (editor, url) {
  const escapeCode = function (value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  const normalizeCode = function (value) {
    return value
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .replaceAll('\u00a0', ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim()
  }

  const insertCodeBlock = function (value) {
    const normalizedCode = normalizeCode(value || '')

    if (normalizedCode === '') {
      return
    }

    const codeNode = editor.dom.create('code', {}, escapeCode(normalizedCode).replaceAll('\n', '<br>'))

    editor.selection.setNode(codeNode)
    if (typeof editor.nodeChanged === 'function') {
      editor.nodeChanged()
    }
  }

  const openDialog = function () {
    return editor.windowManager.open({
      title: 'Code Block',
      body: {
        type: 'panel',
        items: [
          {
            type: 'textarea',
            name: 'code',
            label: 'Paste or write your code'
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
          text: 'Insert',
          primary: true
        }
      ],
      onSubmit: function (api) {
        const data = api.getData()
        insertCodeBlock(data.code)
        api.close()
      }
    })
  }

  const handleAction = function () {
    if (!editor.selection.isCollapsed()) {
      insertCodeBlock(editor.selection.getContent({ format: 'text' }))
      return
    }

    openDialog()
  }

  editor.ui.registry.addIcon('codeblock', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M392.8 1.2c10.7 2.9 17 13.9 14.1 24.6l-112 416c-2.9 10.7-13.9 17-24.6 14.1s-17-13.9-14.1-24.6l112-416c2.9-10.7 13.9-17 24.6-14.1zM160 96c11.8 0 22.5 6.5 28 16.9s4.9 23.1-1.6 32.9L118.8 256l67.6 110.3c6.5 9.8 7 22.5 1.6 32.9s-16.2 16.9-28 16.9c-11.1 0-21.4-5.6-27.3-14.8l-80-128c-6.4-10.2-6.4-23.1 0-33.3l80-128C138.6 101.6 148.9 96 160 96zm320 0c11.1 0 21.4 5.6 27.3 14.8l80 128c6.4 10.2 6.4 23.1 0 33.3l-80 128c-5.8 9.2-16.2 14.8-27.3 14.8c-11.8 0-22.5-6.5-28-16.9s-4.9-23.1 1.6-32.9L521.2 256l-67.6-110.3c-6.5-9.8-7-22.5-1.6-32.9S468.2 96 480 96z"/></svg>')

  editor.ui.registry.addButton('codeblock', {
    icon: 'codeblock',
    tooltip: 'Code Block',
    onAction: function () {
      handleAction()
    }
  })

  editor.ui.registry.addMenuItem('codeblock', {
    text: 'Code Block',
    onAction: function () {
      handleAction()
    }
  })

  return {
    getMetadata: function () {
      return {
        name: 'Code Block',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
