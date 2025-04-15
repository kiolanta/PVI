<?php
class AuthController
{
    public function login()
    {
        header('Content-Type: application/json');
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        require_once 'db.php'; 

        $input = json_decode(file_get_contents('php://input'), true);
        $login = trim($input['login']);
        $password = trim($input['password']);

        $stmt = $pdo->prepare("SELECT * FROM students WHERE name = ? AND password = ?");
        $stmt->execute([$login, $password]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            $_SESSION['user'] = [
                'id' => $student['id'],
                'name' => $student['name'],
                'group' => $student['group']
            ];
            $updateStatus = $pdo->prepare("UPDATE students SET status = 'online' WHERE id = ?");
            $updateStatus->execute([$student['id']]);
            echo json_encode(['status' => 'success', 'user' => $_SESSION['user']]);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
        }
    }

    public function logout()
    {
        session_start();
        require_once 'db.php';

        if (isset($_SESSION['user']['id'])) {
            $userId = $_SESSION['user']['id'];
            $updateStatus = $pdo->prepare("UPDATE students SET status = 'offline' WHERE id = ?");
            $updateStatus->execute([$userId]);
        }
        session_destroy();
        echo json_encode(['status' => 'success']);
    }
}

