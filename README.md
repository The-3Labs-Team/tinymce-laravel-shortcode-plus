# tinymce-laravel-shortcode-plus
Testing a Tinymce plugin using GitHub as host

It will be documented as well in the future. No ETA.

For start server and debug in local:
```npm run start```

## TMDB
For use TMDB you need to define the API key and language as follows:
```js
// tinymce config
// ...
'tmdb' => [
    'api_key' => 'YOUR_API_KEY', // Bearer token
    'language' => 'it', // Language
 ];
// ...
```
## Preview ADV

In your observer, add:

```php
    public function updating(Article $article): void
    {
        $this->removePreviewAdv($article);
    }

    public function creating(Article $article): void
    {
        $this->removePreviewAdv($article);
    }

    protected function removePreviewAdv(Article $article): void
    {
        $article->content = preg_replace('/<div class="adv-preview"[\s\S]*?<\/div>/', '', $article->content);
    }
```

this will remove the preview adv from the content before saving it.
