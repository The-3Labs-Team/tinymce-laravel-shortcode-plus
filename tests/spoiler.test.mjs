import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginPath = path.join(__dirname, '..', 'src', 'spoiler.js')
const previewPath = path.join(__dirname, '..', 'src', 'preview.js')
const pluginSource = fs.readFileSync(pluginPath, 'utf8')
const previewSource = fs.readFileSync(previewPath, 'utf8')

/** Fake document whose textarea decodes the entities used in these tests. */
const fakeDocument = {
  createElement () {
    return {
      innerHTML: '',
      get value () {
        return this.innerHTML
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, '\'')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
      }
    }
  }
}

function createHarness () {
  const registeredPlugins = {}
  const context = vm.createContext({
    document: {
      getElementById () {
        return null
      },
      createElement () {
        return {}
      },
      head: { appendChild () {} }
    },
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
    insertContent (value) {
      this.insertContentCalls.push(value)
    },
    execCommand () {},
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

  registeredPlugins.spoiler(editor, '')

  return { buttons, commands, editor, openedDialogs }
}

function loadPreview () {
  const context = vm.createContext({
    document: fakeDocument,
    tinymce: { PluginManager: { add () {} } }
  })

  vm.runInContext(previewSource, context, { filename: previewPath })

  return context
}

function submitNewSpoiler (data) {
  const harness = createHarness()
  harness.buttons.spoiler.onAction()
  harness.openedDialogs.at(-1).onSubmit({ getData: () => data, close () {} })

  return harness.editor.insertContentCalls.at(-1)
}

function testTitleIsWrittenInTheShortcode () {
  assert.equal(
    submitNewSpoiler({ title: 'Il finale di stagione', spoiler: 'Muoiono tutti' }),
    '[spoiler title="Il finale di stagione"]Muoiono tutti[/spoiler]'
  )
}

function testEmptyTitleLeavesTheShortcodeWithoutAttribute () {
  assert.equal(
    submitNewSpoiler({ title: '   ', spoiler: 'Muoiono tutti' }),
    '[spoiler]Muoiono tutti[/spoiler]'
  )
}

function testTitleCannotBreakTheShortcode () {
  assert.equal(
    submitNewSpoiler({ title: 'Il "vero" finale [spoiler]', spoiler: 'Testo' }),
    '[spoiler title="Il \'vero\' finale spoiler"]Testo[/spoiler]'
  )
}

function testEditingFillsTitleAndContent () {
  const harness = createHarness()
  harness.commands.mceEditShortcode_spoiler({
    selectedShortcode: '[spoiler title="Cos\'è successo"]Il colpo di scena[/spoiler]'
  })

  const initialData = harness.openedDialogs.at(-1).initialData
  assert.equal(initialData.title, 'Cos\'è successo')
  assert.equal(initialData.spoiler, 'Il colpo di scena')
}

function testEditingWithoutTitleLeavesItEmpty () {
  const harness = createHarness()
  harness.commands.mceEditShortcode_spoiler({
    selectedShortcode: '[spoiler]Il colpo di scena[/spoiler]'
  })

  assert.equal(harness.openedDialogs.at(-1).initialData.title, '')
}

function testPreviewShowsTheTitle () {
  const preview = loadPreview()
  const html = preview.parseSpoilerSingle('[spoiler title="Cos\'è successo"]Il colpo di scena[/spoiler]')

  assert.match(html, /<strong>Cos&#039;è successo<\/strong>/)
  assert.match(html, /Il colpo di scena/)
}

function testPreviewWithoutTitleHasNoHeading () {
  const preview = loadPreview()
  const html = preview.parseSpoilerSingle('[spoiler]Il colpo di scena[/spoiler]')

  assert.doesNotMatch(html, /<strong>/)
}

const tests = [
  ['title is written in the shortcode', testTitleIsWrittenInTheShortcode],
  ['empty title leaves no attribute', testEmptyTitleLeavesTheShortcodeWithoutAttribute],
  ['title cannot break the shortcode', testTitleCannotBreakTheShortcode],
  ['editing fills title and content', testEditingFillsTitleAndContent],
  ['editing without title leaves it empty', testEditingWithoutTitleLeavesItEmpty],
  ['preview shows the title', testPreviewShowsTheTitle],
  ['preview without title has no heading', testPreviewWithoutTitleHasNoHeading]
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
