<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::view('/', 'app');

// Profile photos are served through Laravel so deployments do not depend on a
// manually created public/storage symlink.
Route::get('/profile-photos/{filename}', function (string $filename) {
    abort_unless(basename($filename) === $filename, 404);

    $path = 'profiles/' . $filename;
    $disk = Storage::disk('public');
    abort_unless($disk->exists($path), 404);

    return $disk->response($path, null, ['Cache-Control' => 'public, max-age=86400']);
})->where('filename', '[^/]+')->name('profile-photos.show');

// Let the client-side router resolve application URLs such as /profile when
// they are opened directly or refreshed in the browser.
Route::view('/{path}', 'app')->where('path', '.*');
