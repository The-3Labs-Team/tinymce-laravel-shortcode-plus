/* global tinymce */

tinymce.PluginManager.add('aioperatorCta', function (editor, url) {
  // ===== DEFAULTS ===== //
  // I default vengono SEMPRE scritti nello shortcode, cosi' il redattore li
  // vede e puo' modificarli direttamente nel contenuto. Nel titolo, il testo
  // racchiuso in <strong> viene reso in giallo dal template della CTA.
  const DEFAULT_TITLE = 'Dagli <strong>agenti AI personalizzati</strong> alla <strong>formazione</strong>.'
  const DEFAULT_SUBTITLE = 'C\'è molto che possiamo fare insieme.'
  const DEFAULT_LINK = 'mailto:formazione@3labs.it?subject=Richiesta%20informazioni%20-%20Formazione%20AI%20per%20PMI&body=Buongiorno%2C%0A%0Aho%20letto%20un%20articolo%20su%20Tom%27s%20Hardware%20e%20vorrei%20ricevere%20informazioni%20sui%20vostri%20percorsi%20di%20formazione%20e%20consulenza%20in%20intelligenza%20artificiale%20per%20la%20mia%20azienda.%0A%0AAzienda%3A%20%0ARuolo%3A%20%0AInteressato%20a%3A%20%0A%0AGrazie%2C'
  const DEFAULT_LABEL = 'Chiedi informazioni'

  /* Mantiene solo i tag <strong> (b -> strong), rimuovendo ogni altro markup */
  const sanitizeBold = function (root) {
    Array.from(root.childNodes).forEach(function (node) {
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase()
        sanitizeBold(node)
        if (tag === 'strong' || tag === 'b') {
          const strong = document.createElement('strong')
          while (node.firstChild) {
            strong.appendChild(node.firstChild)
          }
          node.parentNode.replaceChild(strong, node)
        } else {
          while (node.firstChild) {
            node.parentNode.insertBefore(node.firstChild, node)
          }
          node.parentNode.removeChild(node)
        }
      } else if (node.nodeType !== 3) {
        node.parentNode.removeChild(node)
      }
    })
  }

  const openDialog = function (selectedShortcode) {
    const ctaRegex = /^\[aioperator_cta(?:\s+[^\]]+)?\]$/
    const initialData = {
      title: DEFAULT_TITLE,
      subtitle: DEFAULT_SUBTITLE,
      link: DEFAULT_LINK,
      label: DEFAULT_LABEL
    }

    if (selectedShortcode && ctaRegex.test(selectedShortcode)) {
      const titleMatch = selectedShortcode.match(/title="([^"]*)"/)
      const subtitleMatch = selectedShortcode.match(/subtitle="([^"]*)"/)
      const linkMatch = selectedShortcode.match(/link="([^"]*)"/)
      const labelMatch = selectedShortcode.match(/label="([^"]*)"/)

      if (titleMatch) initialData.title = titleMatch[1]
      if (subtitleMatch) initialData.subtitle = subtitleMatch[1]
      if (linkMatch) initialData.link = linkMatch[1]
      if (labelMatch) initialData.label = labelMatch[1]
    }

    return editor.windowManager.open({
      title: 'AI Operator CTA',
      body: {
        type: 'panel',
        items: [
          {
            type: 'customeditor',
            name: 'title',
            tag: 'div',
            init: function (domElement) {
              // Box a tutta larghezza, senza il bordo del wrapper .tox-custom-editor,
              // e spaziatura di 20px tra i gruppi di campi della dialog.
              domElement.style.width = '100%'
              const applyDialogStyles = function () {
                const wrap = domElement.closest ? domElement.closest('.tox-custom-editor') : domElement.parentNode
                if (wrap) {
                  wrap.style.border = 'none'
                  wrap.style.padding = '0'
                  wrap.style.width = '100%'
                }
                const dialog = domElement.closest ? domElement.closest('.tox-dialog') : null
                const scope = dialog || document
                Array.prototype.slice.call(scope.querySelectorAll('.tox-form__group')).forEach(function (el) {
                  el.style.marginBottom = '20px'
                })
              }
              applyDialogStyles()
              setTimeout(applyDialogStyles, 0)

              domElement.innerHTML =
                '<label style="display:block;font-size:13px;font-weight:600;color:#37414b;margin-bottom:10px;">Titolo</label>' +
                '<div style="display:flex;align-items:center;gap:10px;padding:6px 8px;background:#f6f7f9;border:1px solid #d4d8dd;border-radius:8px;margin-bottom:10px;">' +
                  '<button type="button" data-aioperator-bold title="Grassetto (diventa giallo nella CTA)" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;font-weight:800;font-family:Georgia,serif;color:#1d3557;background:#fff;border:1px solid #cfd4da;border-radius:6px;cursor:pointer;transition:all .12s ease;">B</button>' +
                  '<span style="font-size:12px;color:#7a828c;">Seleziona il testo e premi <b style="color:#1d3557;">B</b>: nella CTA diventa giallo.</span>' +
                '</div>' +
                '<div data-aioperator-area contenteditable="true" style="min-height:64px;border:1px solid #d4d8dd;border-radius:8px;padding:10px 12px;font-size:14px;line-height:1.5;color:#1f2933;outline:none;background:#fff;transition:border-color .12s ease,box-shadow .12s ease;"></div>'

              const area = domElement.querySelector('[data-aioperator-area]')
              const boldBtn = domElement.querySelector('[data-aioperator-bold]')

              // Anteprima del giallo: i <strong> nell'editor diventano oro.
              const styleStrongs = function () {
                Array.prototype.slice.call(area.querySelectorAll('strong, b')).forEach(function (el) {
                  el.style.color = '#b8860b'
                })
              }

              boldBtn.addEventListener('mouseenter', function () {
                boldBtn.style.background = '#1d3557'
                boldBtn.style.color = '#fff'
                boldBtn.style.borderColor = '#1d3557'
              })
              boldBtn.addEventListener('mouseleave', function () {
                boldBtn.style.background = '#fff'
                boldBtn.style.color = '#1d3557'
                boldBtn.style.borderColor = '#cfd4da'
              })
              area.addEventListener('focus', function () {
                area.style.borderColor = '#1d3557'
                area.style.boxShadow = '0 0 0 3px rgba(29,53,87,.12)'
              })
              area.addEventListener('blur', function () {
                area.style.borderColor = '#d4d8dd'
                area.style.boxShadow = 'none'
              })

              // La selezione puo' trovarsi in uno shadow root (TinyMCE),
              // quindi proviamo prima getSelection() del root dell'elemento.
              const getActiveSelection = function () {
                const root = area.getRootNode()
                if (root && typeof root.getSelection === 'function') {
                  const rootSel = root.getSelection()
                  if (rootSel && rootSel.rangeCount > 0) {
                    return rootSel
                  }
                }
                return window.getSelection()
              }

              const unwrapStrong = function (el) {
                const parent = el.parentNode
                while (el.firstChild) {
                  parent.insertBefore(el.firstChild, el)
                }
                parent.removeChild(el)
              }

              // Toggle del grassetto sulla selezione, senza document.execCommand
              // (inaffidabile dentro le dialog di TinyMCE). Se la selezione tocca
              // gia' un <strong>/<b> lo rimuove, altrimenti lo applica.
              const toggleBold = function () {
                const sel = getActiveSelection()
                if (!sel || sel.rangeCount === 0) {
                  return
                }
                const range = sel.getRangeAt(0)
                if (range.collapsed || !area.contains(range.startContainer) || !area.contains(range.endContainer)) {
                  return
                }

                const strongs = Array.prototype.slice
                  .call(area.querySelectorAll('strong, b'))
                  .filter(function (el) {
                    return range.intersectsNode(el)
                  })

                if (strongs.length > 0) {
                  strongs.forEach(unwrapStrong)
                } else {
                  const strong = document.createElement('strong')
                  try {
                    range.surroundContents(strong)
                  } catch (err) {
                    strong.appendChild(range.extractContents())
                    range.insertNode(strong)
                  }
                }
                area.normalize()
                styleStrongs()
              }

              boldBtn.addEventListener('mousedown', function (e) {
                // Evita che il bottone rubi il focus (e quindi la selezione)
                e.preventDefault()
                toggleBold()
                area.focus()
              })

              area.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              })

              return Promise.resolve({
                getValue: function () {
                  const tmp = document.createElement('div')
                  tmp.innerHTML = area.innerHTML
                  sanitizeBold(tmp)
                  return tmp.innerHTML.replace(/\u00a0/g, ' ').trim()
                },
                setValue: function (value) {
                  area.innerHTML = value || ''
                  styleStrongs()
                },
                destroy: function () {}
              })
            }
          },
          {
            type: 'input',
            name: 'subtitle',
            label: 'Sottotitolo'
          },
          {
            type: 'input',
            name: 'link',
            label: 'URL del pulsante (es. mailto: o https://)'
          },
          {
            type: 'input',
            name: 'label',
            label: 'Testo del pulsante'
          }
        ]
      },
      initialData,
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
        // Codifica come entita' HTML cosi' lo shortcode (compresi gli eventuali
        // <strong> del titolo) viene inserito come testo e non come markup reale.
        const esc = function (value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        }

        let shortcode = '[aioperator_cta'
        shortcode += ' title="' + esc(data.title) + '"'
        shortcode += ' subtitle="' + esc(data.subtitle) + '"'
        shortcode += ' link="' + esc(data.link) + '"'
        shortcode += ' label="' + esc(data.label) + '"'
        shortcode += ']'

        editor.insertContent(shortcode)
        editor.execCommand('showPreview')
        api.close()
      }
    })
  }

  /* Registra un comando per aprire il dialog */
  editor.addCommand('mceEditShortcode_aioperatorCta', function (args) {
    openDialog(args.selectedShortcode)
  })

  /* Add a button icon */
  editor.ui.registry.addIcon('aioperatorCta', '<svg width="24" height="24" viewBox="0 0 86 86" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="83" height="83" rx="12.5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M32.5395 35H25.2952L33.4571 10.2727H42.6333L50.7952 35H43.5509L38.1418 17.0824H37.9486L32.5395 35ZM31.1872 25.2443H44.8066V30.267H31.1872V25.2443ZM59.8898 10.2727V35H53.1768V10.2727H59.8898ZM30.9729 60.5455H24.1633C24.115 59.982 23.9862 59.4709 23.7769 59.0121C23.5757 58.5533 23.2939 58.1589 22.9317 57.8288C22.5776 57.4908 22.1469 57.2332 21.6398 57.0561C21.1327 56.871 20.5572 56.7784 19.9133 56.7784C18.7864 56.7784 17.8325 57.0521 17.0518 57.5994C16.279 58.1468 15.6914 58.9316 15.289 59.9538C14.8946 60.9761 14.6974 62.2036 14.6974 63.6364C14.6974 65.1496 14.8986 66.4174 15.301 67.4396C15.7116 68.4538 16.3032 69.2185 17.0759 69.7337C17.8486 70.2408 18.7783 70.4943 19.865 70.4943C20.4848 70.4943 21.0402 70.4179 21.5312 70.2649C22.0222 70.1039 22.4488 69.8745 22.811 69.5767C23.1732 69.2789 23.467 68.9207 23.6924 68.5021C23.9258 68.0755 24.0828 67.5966 24.1633 67.0653L30.9729 67.1136C30.8924 68.16 30.5986 69.2266 30.0915 70.3132C29.5844 71.3918 28.864 72.3899 27.9303 73.3075C27.0046 74.2171 25.8576 74.9496 24.4893 75.505C23.1209 76.0604 21.5312 76.3381 19.7201 76.3381C17.4502 76.3381 15.4137 75.8511 13.6107 74.8771C11.8157 73.9032 10.395 72.4704 9.34863 70.5788C8.31028 68.6873 7.7911 66.3731 7.7911 63.6364C7.7911 60.8835 8.32235 58.5653 9.38485 56.6818C10.4474 54.7902 11.8801 53.3615 13.6831 52.3956C15.4862 51.4216 17.4985 50.9347 19.7201 50.9347C21.2816 50.9347 22.7184 51.148 24.0305 51.5746C25.3425 52.0012 26.4935 52.625 27.4836 53.446C28.4736 54.259 29.2705 55.2611 29.8742 56.4524C30.4779 57.6437 30.8441 59.008 30.9729 60.5455ZM33.3424 56.6818V51.2727H54.8339V56.6818H47.3964V76H40.7799V56.6818H33.3424ZM60.6626 76H53.4182L61.5802 51.2727H70.7563L78.9182 76H71.6739L66.2648 58.0824H66.0716L60.6626 76ZM59.3103 66.2443H72.9296V71.267H59.3103V66.2443Z" fill="currentColor"/></svg>')

  /* Add a button that opens a window */
  editor.ui.registry.addButton('aioperatorCta', {
    icon: 'aioperatorCta',
    tooltip: 'Add AI Operator CTA',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
  editor.ui.registry.addMenuItem('aioperatorCta', {
    text: 'AI Operator CTA',
    onAction: function () {
      /* Open window */
      openDialog()
    }
  })
  /* Return the metadata for the help plugin */
  return {
    getMetadata: function () {
      return {
        name: 'AI Operator CTA Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
