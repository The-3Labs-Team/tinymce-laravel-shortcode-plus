import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginPath = path.join(__dirname, '..', 'src', 'codeblock.js')
const pluginExists = fs.existsSync(pluginPath)
const pluginSource = pluginExists ? fs.readFileSync(pluginPath, 'utf8') : ''

const silentConsole = {
  log () {},
  table () {},
  error () {}
}

function serializeNode (node) {
  return {
    tagName: node.tagName,
    attrs: node.attrs,
    innerHTML: node.innerHTML,
    children: node.children.map(serializeNode)
  }
}

function createHarness (selectedContent = '') {
  assert.equal(pluginExists, true, 'the codeblock plugin file should exist')

  const registeredPlugins = {}
  const context = vm.createContext({
    console: silentConsole,
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
  const setNodeCalls = []
  const editor = {
    windowManager: {
      open (config) {
        openedDialogs.push(config)
        return config
      }
    },
    nodeChangedCalls: 0,
    nodeChanged () {
      this.nodeChangedCalls += 1
    },
    selection: {
      getContent () {
        return selectedContent
      },
      isCollapsed () {
        return selectedContent === ''
      },
      setNode (node) {
        setNodeCalls.push(node)
      }
    },
    dom: {
      create (tagName, attrs = {}, html = '') {
        return {
          tagName: tagName.toUpperCase(),
          attrs,
          innerHTML: html,
          children: [],
          appendChild (child) {
            this.children.push(child)
          }
        }
      }
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

  registeredPlugins.codeblock(editor, '')

  return {
    buttons,
    editor,
    openedDialogs,
    setNodeCalls
  }
}

function testButtonOpensTextareaDialogWithoutSelection () {
  const harness = createHarness()

  harness.buttons.codeblock.onAction()

  const dialog = harness.openedDialogs.at(-1)
  assert.equal(dialog.title, 'Code Block')
  assert.equal(dialog.body.type, 'panel')
  assert.deepEqual(JSON.parse(JSON.stringify(dialog.body.items)), [
    {
      type: 'textarea',
      name: 'code',
      label: 'Paste or write your code'
    }
  ])
}

function testSubmitInsertsEscapedCodeMarkupWithBreaks () {
  const harness = createHarness()

  harness.buttons.codeblock.onAction()

  const dialog = harness.openedDialogs.at(-1)
  dialog.onSubmit({
    close () {},
    getData () {
      return {
        code: '<div class="example">& hello ></div>\ncomposer install'
      }
    }
  })

  assert.deepEqual(JSON.parse(JSON.stringify(harness.setNodeCalls.map(serializeNode))), [
    {
      tagName: 'CODE',
      attrs: {},
      innerHTML: '&lt;div class="example"&gt;&amp; hello &gt;&lt;/div&gt;<br>composer install',
      children: []
    }
  ])
}

function testSelectedTextBecomesASingleCodeNodeWithBreaks () {
  const harness = createHarness('php artisan test --compact\n\nphp artisan cache:clear\n\nphp artisan route:list')

  harness.buttons.codeblock.onAction()

  assert.equal(harness.openedDialogs.length, 0)
  assert.deepEqual(JSON.parse(JSON.stringify(harness.setNodeCalls.map(serializeNode))), [
    {
      tagName: 'CODE',
      attrs: {},
      innerHTML: 'php artisan test --compact<br>php artisan cache:clear<br>php artisan route:list',
      children: []
    }
  ])
}

const tests = [
  ['button opens textarea dialog without selection', testButtonOpensTextareaDialogWithoutSelection],
  ['submit inserts escaped code markup with breaks', testSubmitInsertsEscapedCodeMarkupWithBreaks],
  ['selected text becomes a single code node with breaks', testSelectedTextBecomesASingleCodeNodeWithBreaks]
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
