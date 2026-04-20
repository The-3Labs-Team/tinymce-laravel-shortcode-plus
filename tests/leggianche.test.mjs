import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginPath = path.join(__dirname, '..', 'src', 'leggianche.js')
const pluginSource = fs.readFileSync(pluginPath, 'utf8')

const silentConsole = {
  log () {},
  table () {},
  error () {}
}

const flushPromises = async () => {
  await new Promise(resolve => setImmediate(resolve))
}

function createHarness (fetchImpl) {
  const registeredPlugins = {}
  const context = vm.createContext({
    console: silentConsole,
    fetch: fetchImpl,
    tinymce: {
      PluginManager: {
        add (name, factory) {
          registeredPlugins[name] = factory
        }
      }
    }
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
      }
    },
    insertContentCalls: [],
    execCommandCalls: [],
    insertContent (value) {
      this.insertContentCalls.push(value)
    },
    execCommand (value) {
      this.execCommandCalls.push(value)
    },
    addCommand (name, handler) {
      commands[name] = handler
    },
    ui: {
      registry: {
        addIcon () {},
        addButton (name, config) {
          buttons[name] = config
        },
        addMenuItem () {}
      }
    }
  }

  registeredPlugins.leggianche(editor, '')

  return {
    buttons,
    commands,
    editor,
    openedDialogs
  }
}

async function submitDialog (dialogConfig, data) {
  let redialConfig = null
  const api = {
    close () {},
    getData () {
      return data
    },
    redial (nextConfig) {
      redialConfig = nextConfig
    }
  }

  dialogConfig.onSubmit(api)
  await flushPromises()
  await flushPromises()

  return redialConfig
}

async function testSearchDialogUsesCercaLabel () {
  const harness = createHarness(async () => ({
    ok: true,
    json: async () => []
  }))

  harness.buttons.leggianche.onAction()

  const initialDialog = harness.openedDialogs.at(-1)
  const keywordField = initialDialog.body.items.find(item => item.name === 'keyword')
  const cancelButton = initialDialog.buttons.find(button => button.type === 'cancel')
  const submitButton = initialDialog.buttons.find(button => button.type === 'submit')

  assert.equal(keywordField.placeholder, 'Es. Lenovo ThinkPad X9 14 Aura Edition')
  assert.equal(cancelButton.text, 'Chiudi')
  assert.equal(submitButton.text, 'Cerca')
}

async function testSearchAgainReturnsToInputStep () {
  const harness = createHarness(async () => ({
    ok: true,
    json: async () => [{ resourceName: 'posts', resourceId: 42, title: 'Titolo trovato' }]
  }))

  harness.buttons.leggianche.onAction()

  const initialDialog = harness.openedDialogs.at(-1)
  const resultsDialog = await submitDialog(initialDialog, { keyword: 'Titolo trovato' })
  assert.ok(resultsDialog, 'la ricerca deve aprire la schermata risultati')
  assert.equal(typeof resultsDialog.onAction, 'function')

  let resetDialog = null
  resultsDialog.onAction({
    redial (nextConfig) {
      resetDialog = nextConfig
    }
  }, { name: 'searchAgain' })

  assert.ok(resetDialog, 'Cerca di nuovo deve tornare al form iniziale')
  assert.equal(resetDialog.body.items[0].name, 'keyword')
  assert.equal(resetDialog.initialData.keyword, 'Titolo trovato')
}

async function testSpecialCharactersTriggerEncodedFallbackSearch () {
  const rawKeyword = 'Lenovo ThinkPad X9 14 Aura Edition: la rivoluzione dei ThinkPad | Test & Recensione'
  const encodedUrls = []

  const harness = createHarness(async (url) => {
    encodedUrls.push(url)

    if (url.includes(encodeURIComponent(rawKeyword))) {
      return {
        ok: true,
        json: async () => []
      }
    }

    if (url.includes(encodeURIComponent('Lenovo ThinkPad X9 14 Aura Edition: la rivoluzione dei ThinkPad'))) {
      return {
        ok: true,
        json: async () => [{ resourceName: 'articles', resourceId: 99, title: 'Lenovo ThinkPad X9 14 Aura Edition: la rivoluzione dei ThinkPad' }]
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  harness.buttons.leggianche.onAction()

  const initialDialog = harness.openedDialogs.at(-1)
  const resultsDialog = await submitDialog(initialDialog, { keyword: rawKeyword })

  assert.ok(resultsDialog, 'la ricerca deve produrre una schermata risultati')
  assert.equal(encodedUrls.length, 2)
  assert.ok(encodedUrls[0].includes(encodeURIComponent(rawKeyword)))
  assert.ok(encodedUrls[1].includes(encodeURIComponent('Lenovo ThinkPad X9 14 Aura Edition: la rivoluzione dei ThinkPad')))
  assert.deepEqual(JSON.parse(JSON.stringify(resultsDialog.body.items[0].items)), [
    {
      text: 'Lenovo ThinkPad X9 14 Aura Edition: la rivoluzione dei ThinkPad',
      value: '99'
    }
  ])

  const insertButton = resultsDialog.buttons.find(button => button.type === 'submit')
  assert.equal(insertButton.text, 'Inserisci')
}

async function testNoResultsShowsMessageAndDisablesInsert () {
  const harness = createHarness(async () => ({
    ok: true,
    json: async () => []
  }))

  harness.buttons.leggianche.onAction()

  const initialDialog = harness.openedDialogs.at(-1)
  const resultsDialog = await submitDialog(initialDialog, { keyword: 'nessun match' })

  assert.ok(resultsDialog, 'la ricerca deve comunque mostrare uno stato esplicito')
  assert.equal(resultsDialog.body.items[0].type, 'htmlpanel')
  assert.match(resultsDialog.body.items[0].html, /Nessun articolo trovato/)
  assert.equal(resultsDialog.buttons.some(button => button.type === 'submit'), false)
}

const tests = [
  ['search dialog submit label', testSearchDialogUsesCercaLabel],
  ['search again button', testSearchAgainReturnsToInputStep],
  ['special character fallback search', testSpecialCharactersTriggerEncodedFallbackSearch],
  ['no results empty state', testNoResultsShowsMessageAndDisablesInsert]
]

let failures = 0

for (const [name, testFn] of tests) {
  try {
    await testFn()
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
