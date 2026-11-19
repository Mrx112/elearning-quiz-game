<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';
$resp = ['ok' => false];

switch ($action) {
    case 'slides':
        $data = quizReadSlides();
        $resp = [
            'ok' => true,
            'slides' => $data['slides'] ?? [],
            'settings' => $data['settings'] ?? [],
        ];
        break;

    case 'login':
        $input = json_decode(file_get_contents('php://input'), true);
        $pin = $input['pin'] ?? '';
        $data = quizReadSlides();
        $correctPin = $data['settings']['pin'] ?? '1234';
        if ((string)$pin === (string)$correctPin) {
            $_SESSION['quiz_admin'] = true;
            $resp = ['ok' => true];
        } else {
            http_response_code(401);
            $resp = ['ok' => false, 'error' => 'PIN salah'];
        }
        break;

    case 'save':
        if (empty($_SESSION['quiz_admin'])) {
            http_response_code(403);
            $resp = ['ok' => false, 'error' => 'Tidak diizinkan'];
            break;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            $resp = ['ok' => false, 'error' => 'Payload tidak valid'];
            break;
        }
        $slides = $input['slides'] ?? [];
        $settings = $input['settings'] ?? [];
        if (!is_array($slides)) {
            http_response_code(400);
            $resp = ['ok' => false, 'error' => 'slides harus berupa array'];
            break;
        }
        $ok = quizWriteSlides(['slides' => $slides, 'settings' => $settings]);
        $resp = ['ok' => $ok];
        if (!$ok) {
            http_response_code(500);
            $resp['error'] = 'Gagal menyimpan ke server';
        }
        break;

    case 'logout':
        $_SESSION = [];
        $resp = ['ok' => true];
        break;

    default:
        http_response_code(404);
        $resp = ['ok' => false, 'error' => 'Endpoint tidak ditemukan'];
        break;
}

echo json_encode($resp, JSON_UNESCAPED_UNICODE);
