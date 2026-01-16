/* global tinymce */

tinymce.PluginManager.add('preview', function (editor, url) {
    let isActive = false;

    editor.on('click', function (e) {
        const target = e.target;

        console.log('PREVIEW Test 5');

        // Controlla se è uno span con data-preview-shortcode
        if (target.classList.contains('shortcode-preview')) {
            e.preventDefault();

            // Trova lo span parent
            const previewSpan = target.closest('[data-preview-shortcode]');
            if (!previewSpan) return;

            // Get shortcode dal data attribute
            const shortcode = previewSpan.getAttribute('data-preview-shortcode').replace(/&quot;/g, '"');
            const shortcodeName = previewSpan.getAttribute('data-preview-shortcode-name');

            console.log('PREVIEW - Shortcode:', shortcode);

            // Passa lo shortcode al comando con una callback per ricevere il risultato
            editor.execCommand(`mceEditShortcode_${shortcodeName}`, false, {
                shortcode: shortcode,
                onSave: function (newShortcode) {
                    console.log('PREVIEW - Nuovo shortcode ricevuto:', newShortcode);

                    // Aggiorna l'attributo data-preview-shortcode
                    const encodedShortcode = newShortcode.replace(/"/g, '&quot;');
                    previewSpan.setAttribute('data-preview-shortcode', encodedShortcode);

                    // Rigenera solo questo preview element
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = parseFromShortcodesToPreview(newShortcode);
                    const newPreviewSpan = tempDiv.firstChild;

                    previewSpan.parentNode.replaceChild(newPreviewSpan, previewSpan);

                    editor.nodeChanged();
                }
            });
        }
    });

    /**
     * GetContent: Trasforma i placeholder in shortcode all'output
     * Questo viene eseguito quando il contenuto viene estratto dall'editor
     */
    editor.on('GetContent', function (e) {
        if (e.content) {
            e.content = parseFromPreviewToShortcodes(e.content);
        }
    });

    /**
    * PostProcess: Pulizia aggiuntiva per le operazioni di salvataggio
    */
    editor.on('PostProcess', function (e) {
        if (e.get && e.content) {
            e.content = parseFromPreviewToShortcodes(e.content);
        }
    });

    editor.ui.registry.addIcon('previewplay', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>')

    editor.ui.registry.addToggleButton('preview', {
        text: 'Preview',
        icon: 'previewplay',
        tooltip: 'Attiva/Disattiva Preview',
        onAction: function (buttonApi) {
            isActive = !isActive;
            buttonApi.setActive(isActive);

            // Inserisci contenuto quando viene attivato/disattivato
            if (isActive) {
                showPreview(editor);
            } else {
                hidePreview(editor);
            }
        },
        onSetup: function (buttonApi) {
            // Imposta lo stato iniziale
            buttonApi.setActive(isActive);

            return function () {
                // Cleanup se necessario
            };
        },
    });

    editor.addCommand('showPreview', function () {
        showPreview(editor);
    });

    return {
        getMetadata: function () {
            return {
                name: 'Preview',
                url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
            };
        }
    };
});

/* Function for showing preview by replacing shortcodes */
function showPreview(editor) {
    let content = editor.getContent();

    content = parseFromShortcodesToPreview(content);

    editor.setContent(content, { format: 'raw' });
}

/* Function for hiding preview and restoring shortcodes */
function hidePreview(editor) {

    let content = editor.getContent();

    content = parseFromPreviewToShortcodes(content);

    editor.setContent(content, { format: 'raw' });
}

/* Convert from shortcodes to preview spans */
function parseFromShortcodesToPreview(content) {
    content = parseButton(content);

    return content;
}

/* Convert from preview spans to shortcodes */
function parseFromPreviewToShortcodes(content) {
    content = content.replace(/<span[^>]*data-preview-shortcode="([^"]+)"[^>]*>.*?<\/span>/g, function (match, p1) {
        return p1.replace(/&quot;/g, '"');
    });

    return content;
}

/* Function to create preview element container (span with data-preview-shortcode) */
function createPreviewElement(shortcodeName, shortcode, previewHtml) {
    return `<span contenteditable="false" data-preview-shortcode-name="${shortcodeName}" data-preview-shortcode="${shortcode}">
        ${previewHtml}
    </span>`
}

// === ALL SHORTCODE PARSERS BELOW === //

/* Parse [button] shortcode to preview element */
function parseButton(content) {
    //Trova tutti gli shortcode button presente nel contenuto [button --- ANY TEXT ---]
    const buttonRegex = /\[button(?:\s+[^\]]+)?\]/g;

    //Sostituisci ogni shortcode con il contenuto di anteprima
    content = content.replace(buttonRegex, function (match) {
        const buttonShortcode = match;
        const parsedShortcode = buttonShortcode.replace(/"/g, '&quot;');

        $link = buttonShortcode.match(/link=["']([^"']*)["']/);
        $link = $link ? $link[1] : '#';

        $label = buttonShortcode.match(/label=["']([^"']*)["']/);
        $label = $label ? $label[1] : 'Button';

        $level = buttonShortcode.match(/level=["']([^"']*)["']/);
        $level = $level ? $level[1] : 'primary';

        let levelStyle = ''
        if ($level === 'primary') {
            levelStyle = 'background-color: #0ea5e9; color: white;';
        } else {
            levelStyle = 'background-color: #9f9f9f; color: white;';
        }

        const html = `<a href="${$link}" class="shortcode-preview" style="display:inline-block; padding: 10px 20px; border-radius: 10px; text-align: center; text-decoration:none; ${levelStyle}">${$label}</a>`

        return createPreviewElement('button', parsedShortcode, html);
    });

    return content;
}

