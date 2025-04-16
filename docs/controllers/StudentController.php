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
            if (isset($_GET['countOnly']) && $_GET['countOnly'] === 'true') {
                $stmt = $pdo->query("SELECT COUNT(*) FROM students");
                $total = $stmt->fetchColumn();
                echo json_encode(['total' => (int)$total]);
                return;
            }

            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = 5;
            $offset = ($page - 1) * $limit;

            $studentModel = new Student($pdo);
            $students = $studentModel->getPaginated($limit, $offset);
            $total = $studentModel->countAll();
            $totalPages = ceil($total / $limit);

            echo json_encode([
                'data' => $students,
                'totalPages' => $totalPages,
                'currentPage' => $page
            ]);
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
                'birthday' => $birthday,
                'status' => 'offline'
            ]
        ]);        
    }

    public function deleteStudent()
    {
        header('Content-Type: application/json');
        global $pdo;
        
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
    
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Missing student ID']);
            return;
        }
    
        $student = new Student($pdo);
        $result = $student->delete($id);
    
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete']);
        }
    }
    
    public function deleteSelectedStudents() 
    {
        header('Content-Type: application/json');
        global $pdo;
    
        $data = json_decode(file_get_contents("php://input"), true); 
        if (isset($data['studentIds']) && is_array($data['studentIds'])) {
            $studentIds = $data['studentIds'];  

            $studentModel = new Student($pdo);
            $result = $studentModel->deleteSelected($studentIds);

            if ($result) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error deleting students']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid data']);
        }
    }
}
