/* global tinymce */

tinymce.PluginManager.add('shortcodeList', function (editor, url) {
  const content = `
            <div style="width: 1250px;">
                The content of the post. You can use all the features of the editor.
                <ul style="list-style: none; padding: 0; margin: 0">

                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[photo id="1" didascalia="optional" align="left|right" max-width="400"]</strong> - Insert a photo/gallery using new Media Hub
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[image id="1" caption="optional"]</strong> - Insert a photo
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[gallery title="This is a title" images="1,2,3"]</strong> - Insert a gallery
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[product id="1,2,3" amztag="nosp-guide" ebaycampaignid="123456" label="Miglior prodotto"]</strong> - Insert a Merchandise Product
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[spotify uri="track:123"]</strong> - Insert spotify frame
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[faq title="This is a title"]This is a text[/faq]</strong> - Insert a FAQ
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[spoiler]This is an hidden content[/spoiler]</strong> - Insert a spoiler
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[facebook url="YOUR_URL_HERE"]</strong> - Insert a facebook frame
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[twitter url="YOUR_URL_HERE"]</strong> - Insert a twitter frame
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[instagram url="YOUR_URL_HERE"]</strong> - Insert an instagram frame
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[distico]Insert Text here[/distico]</strong> - Insert a "distico" frame
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[leggianche id="1"]</strong> - Insert a related block article
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[tiktok url="YOUR_URL_HERE"]</strong> - Insert an tiktok frame
                    </li>
                </ul>

                <p style="margin-top: 20px; margin-bottom: 10px">Only for CulturaPop*</p>

                <ul style="list-style: none; padding: 0; margin: 0">
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[movie id="1"]</strong> - Insert a movie
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[tv id="1"]</strong> - Insert a TV show
                    </li>
                   <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[video id="1"]</strong> - Insert a video
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[quiz id="1"]</strong> - Insert a quiz
                    </li>
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[challenge id="1"]</strong> - Insert a challenge
                    </li>
                </ul>

                <p style="margin-top: 20px; margin-bottom: 10px">Only for Spaziogames*</p>

                <ul style="list-style: none; padding: 0; margin: 0">
                    <li style="background-color: #e5e5e5; padding: 10px; margin: 10px 0;">
                        <strong>[product id="1,2,3" amztag="nosp-guide" ebaycampaignid="123456"]</strong> - Insert a Merchandise Product
                    </li>
                </ul>


            </div>
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
              html: content
            }
          ]
        },
        width: 1250
      })
      const ul = document.querySelector('.tox-dialog__content-js ul')
      console.log(ul)
      ul.addEventListener('click', function (e) {
        const target = e.target
        editor.insertContent(target.innerHTML)
        tinymce.activeEditor.windowManager.close()
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
