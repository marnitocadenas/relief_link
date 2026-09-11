<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>ReliefLink</title>

        <!-- Favicon & Browser Tab Logo -->
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/relieflink-logo.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/relieflink-logo.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/relieflink-logo.png') }}">
        <link rel="shortcut icon" href="{{ asset('images/relieflink-logo.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="app"></div>
    </body>
</html>
