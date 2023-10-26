/* global tinymce */

tinymce.PluginManager.add('shortcodeList', function (editor, url) {
  const shortcodes = [
    {
      title: 'Photo/Gallery (new Media Hub)',
      code: '[photo id="1" didascalia="optional" align="left|right" max-width="400" effect="carousel|juxtapose"]',
      description: 'Insert a photo/gallery using new Media Hub'
    },
    {
      title: 'Photo',
      code: '[image id="1" caption="optional"]',
      description: 'Insert a photo'
    },
    {
      title: 'Gallery',
      code: '[gallery title="This is a title" images="1,2,3"]',
      description: 'Insert a gallery'
    },
    {
      title: 'Button',
      code: '[button link="https://www.your-link.com" label="Add a label" level="primary|secondary"]',
      description: 'Insert a button'
    },
    {
      title: 'Merchandise Product',
      code: '[product id="1,2,3" amztag="nosp-guide" ebaycampaignid="123456" label="Miglior prodotto"]',
      description: 'Insert a Merchandise Product'
    },
    {
      title: 'Spotify',
      code: '[spotify uri="track:123"]',
      description: 'Insert spotify frame'
    },
    {
      title: 'FAQ',
      code: '[faq title="This is a title"]This is a text[/faq]',
      description: 'Insert a FAQ'
    },
    {
      title: 'Spoiler',
      code: '[spoiler]This is an hidden content[/spoiler]',
      description: 'Insert a spoiler'
    },
    {
      title: 'Facebook',
      code: '[facebook url="YOUR_URL_HERE"]',
      description: 'Insert a facebook frame'
    },
    {
      title: 'Twitter',
      code: '[twitter url="YOUR_URL_HERE"]',
      description: 'Insert a twitter frame'
    },
    {
      title: 'Instagram',
      code: '[instagram url="YOUR_URL_HERE"]',
      description: 'Insert an instagram frame'
    },
    {
      title: 'Distico',
      code: '[distico]Insert Text here[/distico]',
      description: 'Insert a "distico" frame'
    },
    {
      title: 'Related Article',
      code: '[leggianche id="1"]',
      description: 'Insert a related block article'
    },
    {
      title: 'TikTok',
      code: '[tiktok url="YOUR_URL_HERE"]',
      description: 'Insert a tiktok frame'
    },
    {
      title: 'Movie - CulturaPop*',
      code: '[movie id="1"]',
      description: 'Insert a movie'
    },
    {
      title: 'TV - CulturaPop*',
      code: '[tv id="1"]',
      description: 'Insert a TV show'
    },
    {
      title: 'Video - CulturaPop*',
      code: '[video id="1"]',
      description: 'Insert a video'
    },
    {
      title: 'Quiz - CulturaPop*',
      code: '[quiz id="1"]',
      description: 'Insert a quiz'
    },
    {
      title: 'Challenge - CulturaPop*',
      code: '[challenge id="1"]',
      description: 'Insert a challenge'
    },
    {
      title: 'Merchandise Product - Spaziogames*',
      code: '[product id="1,2,3" amztag="nosp-guide" ebaycampaignid="123456"]',
      description: 'Insert a Merchandise Product'
    }
  ]

  const content = `
    <div>
    <p style="margin-bottom: 10px;">
      The content of the post. You can use all the features of the editor.
    <p>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th style="border: 1px solid black; padding: 10px; font-weight: bold; text-align: center;">Name</th>
                <th style="border: 1px solid black; padding: 10px; font-weight: bold; text-align: center;">Shortcode</th>
                <th style="border: 1px solid black; padding: 10px; font-weight: bold; text-align: center;">Description</th>
            </tr>
        </thead>
        <tbody>
          ${shortcodes.map(({ title, code, description }) => `
            <tr style="border: 1px solid black;">
              <td style="padding: 10px; border: 1px solid black;">${title}</td>
              <td class="code" style="background-color: #e8e8e8; padding: 10px; border: 1px solid black; cursor: pointer; color: black"><strong class="code">${code}</strong></td>
              <td style="padding: 10px; border: 1px solid black;">${description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `

  const customStyles = `
  <style>
    .tox-dialog {
      max-width: 1350px !important;
    }

    .code:hover {
        background-color: #d5d5d5 !important;
    }

}



  </style>
`

  editor.ui.registry.addButton('shortcodeList', {
    icon: 'shortcodeList',
    tooltip: 'Show Shortcode List',
    onAction: function () {
      tinymce.activeEditor.windowManager.open({
        title: 'Shortcode List',
        body: {
          type: 'panel',
          items: [
            {
              type: 'htmlpanel',
              html: customStyles + content
            }
          ]
        }
      })

      // Insert into editor
      const table = document.querySelector('.tox-dialog__content-js table tbody')
      table.addEventListener('click', function (e) {
        const target = e.target
        console.log(target)
        if (target.classList.contains('code')) {
          editor.insertContent(target.innerText)
          tinymce.activeEditor.windowManager.close()
        }
      })
    }
  })

  /* Add a icon */
  editor.ui.registry.addIcon('shortcodeList', '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 0v64h64V96H64zm384 0H192v64H448V96zM64 224v64h64V224H64zm384 0H192v64H448V224zM64 352v64h64V352H64zm384 0H192v64H448V352z"/></svg>')

  return {
    getMetadata: function () {
      return {
        name: 'shortcodeList Shortcode',
        url: 'https://github.com/The-3Labs-Team/tinymce-laravel-shortcode-plus'
      }
    }
  }
})
