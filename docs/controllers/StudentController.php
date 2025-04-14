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

    public function createStudent()
    {
        header('Content-Type: application/json');
        global $pdo;

        $data = json_decode(file_get_contents("php://input"), true);

        $group = trim($data['group'] ?? '');
        $name = trim($data['firstName'] . ' ' . $data['lastName']);
        $gender = trim($data['gender'] ?? '');
        $birthday = trim($data['birthday'] ?? '');

        $errors = [];

        if ($group === '') $errors['group'] = 'Please select group';
        if ($data['firstName'] === '' || !preg_match("/^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/u", $data['firstName'])) $errors['firstName'] = 'Invalid first name';
        if ($data['lastName'] === '' || !preg_match("/^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/u", $data['lastName'])) $errors['lastName'] = 'Invalid last name';
        if ($gender === '') $errors['gender'] = 'Please select gender';

        $year = (int)date('Y', strtotime($birthday));
        if ($year < 2000 || $year > 2007) $errors['birthday'] = 'Year must be between 2000 and 2007';

        $studentModel = new Student($pdo);
        if ($studentModel->exists($name, $birthday)) {
            $errors['duplicate'] = 'Student already exists';
        }

        if (!empty($errors)) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }

        $studentId = $studentModel->add($group, $name, $gender, $birthday);

        echo json_encode([
            'success' => true,
            'student' => [
                'id' => $studentId,
                'group' => $group,
                'name' => $name,
                'gender' => $gender,
                'birthday' => $birthday
            ]
        ]);
    }
}
