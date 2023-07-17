tinymce.PluginManager.add('youtube', function(editor, url) {
    var openDialog = function () {
        return editor.windowManager.open({
            title: 'Youtube',
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'input',
                        inputMode: 'url',
                        name: 'url',
                        label: 'Add Youtube post URL',
                        placeholder: 'https://youtube.com/3labs/status/1234567890'
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
                editor.insertContent('[youtube url="'+data.url+'"]');
                api.close();
            }
        });
    };

    /* Add a spoiler icon */
    editor.ui.registry.addIcon('youtube', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>')

    /* Add a button that opens a window */
    editor.ui.registry.addButton('youtube', {
        icon: 'youtube',
        tooltip: 'Add Youtube video',
        onAction: function () {
            /* Open window */
            openDialog();
        }
    });
    /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
    editor.ui.registry.addMenuItem('youtube', {
        text: 'Youtube',
        onAction: function() {
            /* Open window */
            openDialog();
        }
    });
    /* Return the metadata for the help plugin */
    return {
        getMetadata: function () {
            return  {
                name: 'Youtube Shortcode',
                url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
            };
        }
    };
});
