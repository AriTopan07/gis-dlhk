<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <!-- SEO Meta Tags -->
        <meta name="description" content="Sistem Informasi Dinas Lingkungan Hidup dan Kebersihan Kabupaten Sidoarjo. Aplikasi pemetaan GIS lokasi kebersihan, petugas, dan pengawas.">
        <meta name="keywords" content="DLHK Sidoarjo, Dinas Lingkungan Hidup, Kebersihan, Sidoarjo, GIS DLHK, Pemetaan Kebersihan, TPS, Pengelola Sampah">
        <meta name="author" content="DLHK Kabupaten Sidoarjo">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="GIS DLHK Sidoarjo">
        <meta property="og:description" content="Sistem Informasi Dinas Lingkungan Hidup dan Kebersihan Kabupaten Sidoarjo. Pantau lokasi dan infrastruktur kebersihan dengan mudah.">
        <meta property="og:image" content="{{ asset('img/logo-sidoarjo.webp') }}">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="GIS DLHK Sidoarjo">
        <meta name="twitter:description" content="Sistem Informasi Dinas Lingkungan Hidup dan Kebersihan Kabupaten Sidoarjo. Pantau lokasi dan infrastruktur kebersihan dengan mudah.">
        <meta name="twitter:image" content="{{ asset('img/logo-sidoarjo.webp') }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        
        <link rel="icon" type="image/webp" href="/img/logo-sidoarjo.webp">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
