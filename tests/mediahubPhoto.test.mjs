import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginPath = path.join(__dirname, '..', 'src', 'mediahubPhoto.js')
const pluginSource = fs.readFileSync(pluginPath, 'utf8')
const testHtmlPath = path.join(__dirname, '..', 'test.html')
const testHtmlSource = fs.readFileSync(testHtmlPath, 'utf8')

const silentConsole = {
  log () {},
  table () {},
  error () {},
  warn () {}
}

function createElementStub (overrides = {}) {
  return {
    style: {},
    innerHTML: '',
    value: '',
    checked: false,
    parentElement: null,
    parentNode: {
      insertBefore () {}
    },
    addEventListener () {},
    querySelector () {
      return null
    },
    querySelectorAll () {
      return []
    },
    ...overrides
  }
}

function createDocumentStub () {
  const formQuery = createElementStub()
  const formData = createElementStub()
  const cardContainer = createElementStub()

  return {
    body: createElementStub(),
    querySelector (selector) {
      if (selector === '.tox-dialog__content-js form#query') return formQuery
      if (selector === '.tox-dialog__content-js form#data') return formData
      if (selector === '#card-container') return cardContainer
      return null
    },
    querySelectorAll () {
      return []
    },
    createElement (tagName) {
      return createElementStub({
        tagName: tagName.toUpperCase(),
        appendChild () {}
      })
    }
  }
}

function createHarness () {
  const registeredPlugins = {}
  const tinymceStub = {
    activeEditor: null,
    PluginManager: {
      add (name, factory) {
        registeredPlugins[name] = factory
      }
    }
  }

  const context = vm.createContext({
    console: silentConsole,
    document: createDocumentStub(),
    fetch () {
      return new Promise(() => {})
    },
    setTimeout () {},
    tinymce: tinymceStub
  })

  vm.runInContext(pluginSource, context, { filename: pluginPath })

  const openedDialogs = []
  const buttons = {}
  const commands = {}
  const editor = {
    windowManager: {
      open (config) {
        openedDialogs.push(config)
        return config
      },
      close () {}
    },
    addCommand (name, handler) {
      commands[name] = handler
    },
    insertContent () {},
    execCommand () {},
    ui: {
      registry: {
        addIcon () {},
        addButton (name, config) {
          buttons[name] = config
        }
      }
    }
  }

  tinymceStub.activeEditor = editor
  registeredPlugins.mediahubPhoto(editor, '')

  return {
    buttons,
    commands,
    openedDialogs
  }
}

function openMediahubPhotoDialog () {
  const harness = createHarness()

  harness.buttons.mediahubPhoto.onAction()

  const dialog = harness.openedDialogs.at(-1)
  assert.equal(dialog.title, 'MediaHub Photo')
  return dialog.body.items[0].html
}

function testDialogHtmlUsesResponsiveLayoutHooks () {
  const html = openMediahubPhotoDialog()

  assert.match(html, /class="mediahub-photo-toolbar"/)
  assert.match(html, /class="mediahub-photo-search-form"/)
  assert.match(html, /class="mediahub-photo-grid-control"/)
  assert.match(html, /class="mediahub-photo-layout"/)
  assert.match(html, /class="mediahub-photo-results"/)
  assert.match(html, /class="mediahub-photo-settings"/)
}

function testDialogCssStacksLayoutOnMobile () {
  const html = openMediahubPhotoDialog()

  assert.match(html, /@media\s*\(max-width:\s*767px\)/)
  assert.match(html, /\.mediahub-photo-layout\s*{[^}]*flex-direction:\s*column\s*!important;/s)
  assert.match(html, /\.mediahub-photo-grid-control\s*{[^}]*display:\s*none\s*!important;/s)
  assert.match(html, /\.mediahub-photo-results,\s*\.mediahub-photo-settings\s*{[^}]*width:\s*100%\s*!important;[^}]*height:\s*auto\s*!important;/s)
  assert.match(html, /#card-container\s*{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(140px,\s*1fr\)\)\s*!important;/s)
}

function testLocalTestPageLoadsMediahubPhotoFromSrc () {
  assert.match(testHtmlSource, /tinymce\.PluginManager\.load\('mediahubPhoto', '\.\/src\/mediahubPhoto\.js'\)/)
  assert.match(testHtmlSource, /plugins:\s*'[^']*\bmediahubPhoto\b[^']*'/)
  assert.match(testHtmlSource, /toolbar:\s*'[^']*\bmediahubPhoto\b[^']*'/)
}

const tests = [
  ['dialog responsive layout hooks', testDialogHtmlUsesResponsiveLayoutHooks],
  ['dialog mobile layout styles', testDialogCssStacksLayoutOnMobile],
  ['local test page loads mediahubPhoto from src', testLocalTestPageLoadsMediahubPhotoFromSrc]
]

let failures = 0

for (const [name, testFn] of tests) {
  try {
    testFn()
    console.log(`PASS ${name}`)
  } catch (error) {
    failures += 1
    console.error(`FAIL ${name}`)
    console.error(error)
  }
}

if (failures > 0) {
  process.exitCode = 1
}
