tinymce.PluginManager.add('tmdb', function(editor, url) {

    // Define a global keyword variable
    var keyword = '';

    var openDialog = function () {
        return editor.windowManager.open(
            inputPage
        );
    };

    const inputPage = {
        title: 'TMDB',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'keyword',
                    label: 'Inserisci la tua chiave di ricerca',
                    placeholder: 'Usa almeno 3 caratteri per la ricerca',
                    tooltip: 'Cerca un film o una serie TV',
                    autofocus: true,
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

            // Search in TMDB
            searchMovieInTmdb(data.keyword).then(function(results) {
                api.redial(resultsPage(results));
            });

        }

    };

    const resultsPage = (results) => {

        return {
            title: 'TMDB',
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'selectbox',
                        name: 'tmdb',
                        label: 'Scegli uno dei film',
                        items: results,
                    }
                ]
            },
            buttons: [
                {
                    type: 'custom',
                    text: 'Cerca di nuovo',
                },
                {
                    type: 'submit',
                    text: 'Insert',
                    primary: true
                }
            ],
            onSubmit: function (api) {
                var data = api.getData();

                // Extract ID and type from option value, separated by a dash
                const id = data.tmdb.split('-')[0];
                const type = data.tmdb.split('-')[1];

                /* Insert content when the window form is submitted */
                editor.insertContent('[tmdb id="'+id+'" type="'+type+'"]');
                api.close();
            }
        }

    }

    /**
     * Define TMDB API options
     * @type {{headers: {Authorization: string, accept: string}, method: string}}
     */
    const TMDB = editor.getParam('tmdb')
    const tmdbOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer '+TMDB.api_key
        }
    };

    /**
     * Search a movie in TMDB
     * @param keyword
     * @returns {Promise<Awaited<any>[]>}
     */
    function searchMovieInTmdb(keyword) {

        const movies = fetch('https://api.themoviedb.org/3/search/movie?query=' + keyword + '&language='+TMDB.language, tmdbOptions)
            .then(response => response.json())
            .then(function(response) {
                console.log(response)
                return response.results.map(function(item) {
                    return {text: item.title + ' (Movie)', value: item.id.toString()+"-movie"};
                });
            })
            .catch(err => console.error(err));

        const tv = fetch('https://api.themoviedb.org/3/search/tv?query=' + keyword + '&language='+TMDB.language, tmdbOptions)
            .then(response => response.json())
            .then(function(response) {
                console.log(response)
                return response.results.map(function(item) {
                    return {text: item.name + ' (TV Series)', value: item.id.toString()+"-tv"};
                });
            }
            )
            .catch(err => console.error(err));

        return Promise.all([movies, tv]).then(function(values) {
            return values[0].concat(values[1]);
        });
    }

    /* Add a tmdb icon */
    editor.ui.registry.addIcon('tmdb', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M448 32H361.9l-1 1-127 127h92.1l1-1L453.8 32.3c-1.9-.2-3.8-.3-5.8-.3zm64 128V96c0-15.1-5.3-29.1-14-40l-104 104H512zM294.1 32H201.9l-1 1L73.9 160h92.1l1-1 127-127zM64 32C28.7 32 0 60.7 0 96v64H6.1l1-1 127-127H64zM512 192H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192z"/></svg>')

    /* Add a button that opens a window */
    editor.ui.registry.addButton('tmdb', {
        icon: 'tmdb',
        tooltip: 'Add TMDB',
        onAction: function () {
            /* Open window */
            openDialog();
        }
    });
    /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
    editor.ui.registry.addMenuItem('tmdb', {
        text: 'TMDB',
        onAction: function() {
            /* Open window */
            openDialog();
        }
    });
    /* Return the metadata for the help plugin */
    return {
        getMetadata: function () {
            return  {
                name: 'TMDB Shortcode',
                url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
            };
        }
    };
});
