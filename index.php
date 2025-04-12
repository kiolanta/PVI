<?php
session_start();

$request = $_GET['route'] ?? '';

switch ($request) {
    case 'students':
        require 'controllers/StudentController.php';
        $controller = new StudentController();
        $controller->getStudents();
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
