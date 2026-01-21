/* global tinymce */

tinymce.PluginManager.add('leggianche', function (editor, url) {
  const openDialog = function (selectedShortcode) {
    const buttonRegex = /^\[leggianche(?:\s+[^\]]+)?\]$/
    let initialData = {
      id: null,
    }

    if (selectedShortcode && buttonRegex.test(selectedShortcode)) {
      const idMatch = selectedShortcode.match(/id=["']([^"']*)["']/)
      if (idMatch) initialData.id = idMatch[1]
    }

    return editor.windowManager.open(
      {
        title: 'Leggi Anche',
        initialData: initialData,
        body: {
          type: 'panel',
          items: [
            {
              type: 'input',
              name: 'keyword',
              label: 'Inserisci la tua chiave di ricerca',
              placeholder: 'Usa almeno 3 caratteri per la ricerca',
              tooltip: 'Seleziona l\'articolo da leggere',
              autofocus: true
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

        // onSubmit: function (api) {
        //   var data = api.getData();
        //   /* Insert content when the window form is submitted */
        //   // editor.insertContent('[leggianche id="'+data.leggianche + '"]');
        //   api.close();
        // },

        onSubmit: function (api) {
          const data = api.getData()

          searchInNova(data.keyword, ['posts', 'articles']).then(function (results) {
            api.redial(resultsPage(results))
          })
        }

      }
    )
  }


  const resultsPage = (results) => {
    return {
      title: 'Leggi Anche',
      body: {
        type: 'panel',
        items: [
          {
            type: 'selectbox',
            name: 'leggianche',
            label: 'Seleziona l\'articolo da leggere',
            items: results
          }
        ]
      },
      buttons: [
        {
          type: 'custom',
          text: 'Cerca di nuovo'
        },
        {
          type: 'submit',
          text: 'Insert',
          primary: true
        }
      ],
      onSubmit: function (api) {
        const data = api.getData()
        /* Insert content when the window form is submitted */
        editor.insertContent('[leggianche id="' + data.leggianche + '"]')
        editor.execCommand('showPreview')
        api.close()
      }
    }
  }

  function searchInNova(keyword, type) {
    // Fetch results from Nova API Global Search
    const results =

      fetch('/nova-api/search?search=' + keyword, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function (response) {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Error in Nova API Request')
          }
        }
          // Debug response
        ).then(function (data) {
          console.log('Search results ' + data)
          return data
        })

        // Filter results by type
        .then(function (data) {
          console.table(data)
          return data.filter(function (item) {
            return type.includes(item.resourceName)
          })
        })

        // Map results to selectbox items
        .then(function (data) {
          return data.map(function (item) {
            return { text: item.title, value: item.resourceId.toString() }
          })
        })

    return results
  }

  /* Add a leggianche icon */
  editor.ui.registry.addIcon('leggianche', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M352 96c0-53.02-42.98-96-96-96s-96 42.98-96 96 42.98 96 96 96 96-42.98 96-96zM233.59 241.1c-59.33-36.32-155.43-46.3-203.79-49.05C13.55 191.13 0 203.51 0 219.14v222.8c0 14.33 11.59 26.28 26.49 27.05 43.66 2.29 131.99 10.68 193.04 41.43 9.37 4.72 20.48-1.71 20.48-11.87V252.56c-.01-4.67-2.32-8.95-6.42-11.46zm248.61-49.05c-48.35 2.74-144.46 12.73-203.78 49.05-4.1 2.51-6.41 6.96-6.41 11.63v245.79c0 10.19 11.14 16.63 20.54 11.9 61.04-30.72 149.32-39.11 192.97-41.4 14.9-.78 26.49-12.73 26.49-27.06V219.14c-.01-15.63-13.56-28.01-29.81-27.09z"/></svg>')

  editor.addCommand('mceEditShortcode_leggianche', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a button that opens a window */
  editor.ui.registry.addButton('leggianche', {
    icon: 'leggianche',
    tooltip: 'Add Leggi Anche',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('leggianche', {
    text: 'Leggi Anche',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'Leggi Anche Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
