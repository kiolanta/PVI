<?php
require_once 'models/Student.php';
require_once 'db.php'; 

class StudentController
{
    public function getStudents()
    {
        header('Content-Type: application/json');
        global $pdo; 

        try {
            $studentModel = new Student($pdo); 
            $students = $studentModel->getAll();
            echo json_encode(['data' => $students]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}

