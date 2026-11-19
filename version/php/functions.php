<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function quizReadSlides(): array {
    if (!file_exists(QUIZ_SLIDES_FILE)) {
        return ['slides' => [], 'settings' => []];
    }
    $raw = file_get_contents(QUIZ_SLIDES_FILE);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['slides' => [], 'settings' => []];
    }
    if (!isset($data['slides']) || !is_array($data['slides'])) {
        $data['slides'] = [];
    }
    if (!isset($data['settings']) || !is_array($data['settings'])) {
        $data['settings'] = [];
    }
    return $data;
}

function quizWriteSlides(array $data): bool {
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) {
        return false;
    }
    return file_put_contents(QUIZ_SLIDES_FILE, $json) !== false;
}
