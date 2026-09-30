CREATE DATABASE IF NOT EXISTS product_crud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE product_crud;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(12, 2) UNSIGNED NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (name, price, description) VALUES
  ('Ban phim co', 890000, 'Ban phim co ket noi USB'),
  ('Chuot khong day', 450000, 'Chuot van phong ket noi Bluetooth');
