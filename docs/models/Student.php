<?php
require_once __DIR__ . '/../db.php';

class Student
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM students");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM students WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function add($group, $name, $gender, $birthday)
    {
        
        $dateObj = new DateTime($birthday);
        $password = $dateObj->format('dmy'); 
    
        $stmt = $this->pdo->prepare("INSERT INTO students (`group`, name, gender, birthday, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$group, $name, $gender, $birthday, $password]);
    
        return $this->pdo->lastInsertId();
    }
    
    public function exists($name, $birthday)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM students WHERE name = ? AND birthday = ?");
        $stmt->execute([$name, $birthday]);
        return $stmt->rowCount() > 0;
    }
}
