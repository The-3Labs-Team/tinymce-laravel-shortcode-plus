tinymce.PluginManager.add('spoiler', function(editor, url) {
  var openDialog = function () {
    return editor.windowManager.open({
      title: 'Spoiler',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'spoiler',
            label: 'Spoiler'
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
        var data = api.getData();
        /* Insert content when the window form is submitted */
        editor.insertContent('[spoiler]' + data.title + '[/spoiler]');
        api.close();
      }
    });
  };
  /* Add a button that opens a window */
  editor.ui.registry.addButton('spoiler', {
    text: 'My button',
    onAction: function () {
      /* Open window */
      openDialog();
    }
  });
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('spoiler', {
    text: 'Example plugin',
    onAction: function() {
      /* Open window */
      openDialog();
    }
  });
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return  {
        name: 'Example plugin',
        url: 'http://exampleplugindocsurl.com'
      };
    }
  };
});
