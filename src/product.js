/* global tinymce */

tinymce.PluginManager.add('product', function (editor, url) {
  const openDialog = function () {
    return editor.windowManager.open({
      title: 'Product',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            inputMode: 'numeric',
            name: 'id',
            label: 'Add the product ID',
          },
          {
            type: 'input',
            inputMode: 'text',
            name: 'label',
            label: 'Add the product label',
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
        editor.insertContent(`[product id="${data.id}" label="${data.label}"]`)
        api.close()
      }
    })
  }

  /* Add icon */
  editor.ui.registry.addIcon('product', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M50.7 58.5L0 160H208V32H93.7C75.5 32 58.9 42.3 50.7 58.5zM240 160H448L397.3 58.5C389.1 42.3 372.5 32 354.3 32H240V160zm208 32H0V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192z"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('product', {
    icon: 'product',
    tooltip: 'Add product',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('product', {
    text: 'Product',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Product Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
