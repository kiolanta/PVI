<?php
session_start();

$request = $_GET['route'] ?? '';

switch ($request) {
    case 'students':
        require 'controllers/StudentController.php';
        $controller = new StudentController();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createStudent();
        } else {
            $controller->getStudents();
        }
        break;
    case 'delete_student':
        require 'controllers/StudentController.php';
        $controller = new StudentController();
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteStudent();
        } else {
            http_response_code(405); 
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;
    case 'delete_sel_students':  
        require 'controllers/StudentController.php';
        $controller = new StudentController();
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteSelectedStudents();
        } else {
            http_response_code(405); 
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;
    case 'login':
        require 'controllers/AuthController.php';
        $controller = new AuthController();
        $controller->login();
        break;
    case 'logout':
        require 'controllers/AuthController.php';
        $controller = new AuthController();
        $controller->logout();
        break;
    default:
        echo "404 Not Found";
        break;
}
