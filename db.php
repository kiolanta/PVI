<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "student_app";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("❌ DB error: " . $e->getMessage());
}
