/* global tinymce, document, window */

tinymce.PluginManager.add('miniverdict', function (editor, url) {
  const STYLE_ID = 'mv-dialog-styles'

  // I prodotti (ID/nome) vengono ricordati tra le aperture del dialog (anche dopo chiusura/inserimento)
  const STORAGE_KEYS = {
    product1_id: 'miniverdict_id_1',
    product1_label: 'miniverdict_name_1',
    product2_id: 'miniverdict_id_2',
    product2_label: 'miniverdict_name_2'
  }

  // ===== HELPERS =====

  // Rende sicuro un valore dentro un attributo shortcode tra doppi apici:
  // niente apici doppi (chiuderebbero l'attributo) e niente parentesi quadre (chiuderebbero lo shortcode)
  const attrSafe = function (value) {
    return String(value == null ? '' : value)
      .replace(/"/g, '\'')
      .replace(/[[\]]/g, '')
      .trim()
  }

  // Ripristina i prodotti salvati in localStorage dentro l'oggetto dati del form
  const loadStoredProducts = function (data) {
    try {
      Object.keys(STORAGE_KEYS).forEach(function (field) {
        const stored = window.localStorage.getItem(STORAGE_KEYS[field])
        if (stored !== null) data[field] = stored
      })
    } catch (e) {
      // localStorage non disponibile (es. modalità privata): si prosegue senza
    }
  }

  // Salva i prodotti correnti in localStorage
  const saveStoredProducts = function (data) {
    try {
      Object.keys(STORAGE_KEYS).forEach(function (field) {
        window.localStorage.setItem(STORAGE_KEYS[field], data[field] || '')
      })
    } catch (e) {
      // localStorage non disponibile: si prosegue senza
    }
  }

  // Stile delle "card" prodotto iniettato direttamente nel <head> (NON tramite htmlpanel,
  // che in Nova sanitizza HTML/CSS). Targetizza i componenti nativi della grid del dialog.
  // Se i selettori non combaciassero, il dialog resta comunque pienamente funzionante.
  const injectStyles = function () {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      .tox-dialog .tox-form__grid--2col > .tox-form__group {
        background: #f4f4f5;
        border: 1px solid #e4e4e7;
        border-radius: 10px;
        padding: 12px;
      }
      .tox-dialog .tox-form__grid--2col > .tox-form__group > .tox-label:first-child {
        text-align: center;
        font-weight: 700;
        color: #333333;
      }
      .tox-dialog .tox-form__grid--2col + .tox-form__group,
      .tox-dialog .tox-form__group--stretched {
        margin-top: 1rem;
      }
    `
    document.head.appendChild(style)
  }

  const removeStyles = function () {
    const el = document.getElementById(STYLE_ID)
    if (el) el.remove()
  }

  // Costruisce lo shortcode dai dati nativi del form
  const buildShortcode = function (data) {
    const product1 = attrSafe(data.product1_id) || attrSafe(data.product1_label)
    const product2 = attrSafe(data.product2_id) || attrSafe(data.product2_label)

    let winner = '2'
    if (data.winner1 && data.winner2) {
      winner = '1,2'
    } else if (data.winner1) {
      winner = '1'
    }

    return `[miniverdict product1="${product1}" product2="${product2}" winner="${winner}"]${data.content || ''}[/miniverdict]`
  }

  // Estrae i dati iniziali (nuovo => vuoto, modifica => valori dello shortcode esistente)
  const parseInitialData = function (selectedShortcode) {
    const data = {
      product1_id: '',
      product1_label: '',
      winner1: false,
      product2_id: '',
      product2_label: '',
      winner2: false,
      pareggio: false,
      content: ''
    }

    if (!selectedShortcode) return data

    const getAttr = function (name) {
      const m = selectedShortcode.match(new RegExp(name + '=["\']([^"\']*)["\']'))
      return m ? m[1] : ''
    }

    const p1 = getAttr('product1')
    const p2 = getAttr('product2')
    // Valore numerico => ID prodotto, altrimenti nome custom
    if (/^\d+$/.test(p1)) { data.product1_id = p1 } else { data.product1_label = p1 }
    if (/^\d+$/.test(p2)) { data.product2_id = p2 } else { data.product2_label = p2 }

    const winner = getAttr('winner') || '2'
    const parts = winner.split(',').map(function (s) { return s.trim() })
    data.winner1 = parts.indexOf('1') !== -1
    data.winner2 = parts.indexOf('2') !== -1
    if (!data.winner1 && !data.winner2) data.winner2 = true
    data.pareggio = data.winner1 && data.winner2

    const bodyMatch = selectedShortcode.match(/\[miniverdict(?:\s+[^\]]+)?\]([\s\S]*?)\[\/miniverdict\]/)
    if (bodyMatch) data.content = bodyMatch[1]

    return data
  }

  // Gruppo prodotto: componenti NATIVI (renderizzano sempre in Nova)
  const productGroup = function (n) {
    return {
      type: 'label',
      label: 'Prodotto ' + n,
      items: [
        { type: 'input', name: 'product' + n + '_label', inputMode: 'text', label: 'Nome prodotto' },
        { type: 'htmlpanel', html: '<p style="text-align:center;margin:0;color:#999;font-size:11px;">— oppure —</p>' },
        { type: 'input', name: 'product' + n + '_id', inputMode: 'numeric', label: 'ID prodotto' },
        { type: 'checkbox', name: 'winner' + n, label: 'vincitore del verdetto' }
      ]
    }
  }

  // ===== DIALOG =====

  const openDialog = function (selectedShortcode) {
    const isEdit = Boolean(selectedShortcode)
    const initialData = parseInitialData(selectedShortcode)

    // Nuovo inserimento: ripristina i prodotti usati in precedenza (in modifica usa quelli dello shortcode)
    if (!isEdit) {
      loadStoredProducts(initialData)
    }

    injectStyles()

    return editor.windowManager.open({
      title: 'Miniverdict',
      initialData,
      body: {
        type: 'panel',
        items: [
          {
            type: 'grid',
            columns: 2,
            items: [productGroup('1'), productGroup('2')]
          },
          { type: 'checkbox', name: 'pareggio', label: 'Pareggio' },
          { type: 'textarea', name: 'content', label: 'Contenuto' }
        ]
      },
      buttons: [
        { type: 'cancel', text: 'Chiudi' },
        { type: 'custom', name: 'insert', text: isEdit ? 'Aggiorna' : 'Inserisci', primary: true }
      ],
      // Sincronizzazione vincitori <-> pareggio:
      // Pareggio spuntato => entrambi vincitori; entrambi vincitori spuntati => pareggio
      onChange: function (api, details) {
        const data = api.getData()
        if (details.name === 'pareggio') {
          api.setData({ winner1: data.pareggio, winner2: data.pareggio })
        } else if (details.name === 'winner1' || details.name === 'winner2') {
          api.setData({ pareggio: data.winner1 && data.winner2 })
        } else if (STORAGE_KEYS[details.name]) {
          // Un campo prodotto è cambiato: ricordalo subito (così resta anche se chiudo)
          saveStoredProducts(data)
        }
      },
      onAction: function (api, details) {
        if (details.name !== 'insert') return

        const data = api.getData()
        saveStoredProducts(data)
        editor.insertContent(buildShortcode(data))
        editor.execCommand('showPreview')
        api.close()
      },
      onClose: function () {
        removeStyles()
      }
    })
  }

  // ===== REGISTRATION =====

  editor.addCommand('mceEditShortcode_miniverdict', function (args) {
    openDialog(args.selectedShortcode)
  })

  editor.ui.registry.addIcon('miniverdict', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H359.9C339 480 322 463 322 442.1c0-19.6 16-39.1 39.4-45.6c39.8-11 93.8-32.7 138.1-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.5 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63.1-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63.1 142.3z"/></svg>')

  editor.ui.registry.addButton('miniverdict', {
    icon: 'miniverdict',
    tooltip: 'Add Miniverdict',
    onAction: function () {
      openDialog()
    }
  })

  editor.ui.registry.addMenuItem('miniverdict', {
    text: 'Miniverdict',
    onAction: function () {
      openDialog()
    }
  })

  return {
    getMetadata: function () {
      return {
        name: 'Miniverdict Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
