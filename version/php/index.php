<?php
declare(strict_types=1);
session_start();
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0c4a6e" />
  <meta name="description" content="Game e-learning interaktif kuis bahasa Inggris (versi PHP native + data server)." />
  <title>Quiz Game \u2014 Versi PHP</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="assets/style.css" />
  <script>window.QUIZ_CONFIG = { apiBase: 'api.php' };</script>
</head>
<body>
  <div id="app"></div>
  <script src="assets/app.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => { window.appQuiz.init(); });
  </script>
</body>
</html>
