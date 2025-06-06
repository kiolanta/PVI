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
    
        $stmt = $this->pdo->prepare("INSERT INTO students (`group`, name, gender, birthday, password, status) VALUES (?, ?, ?, ?, ?, 'offline')");
        $stmt->execute([$group, $name, $gender, $birthday, $password]);

    
        return $this->pdo->lastInsertId();
    }
    
    public function exists($name, $birthday)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM students WHERE name = ? AND birthday = ?");
        $stmt->execute([$name, $birthday]);
        return $stmt->rowCount() > 0;
    }

    public function getPaginated($limit, $offset)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM students LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countAll()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM students");
        return $stmt->fetchColumn();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM students WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function deleteSelected($studentIds)
    {
        if (empty($studentIds)) {
            return false;
        }
        
        $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
        $sql = "DELETE FROM students WHERE id IN ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($studentIds);
    }

    public function update($id, $group, $name, $gender, $birthday)
    {
        $stmt = $this->pdo->prepare("UPDATE students SET `group` = ?, name = ?, gender = ?, birthday = ? WHERE id = ?");
        return $stmt->execute([$group, $name, $gender, $birthday, $id]);
    }

    public function nameExists($name, $birthday, $excludeId)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM students WHERE name = ? AND birthday = ? AND id != ?");
        $stmt->execute([$name, $birthday, $excludeId]);
        return $stmt->rowCount() > 0;
    }

}

