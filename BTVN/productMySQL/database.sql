CREATE DATABASE shopdb;
USE shopdb;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  tag VARCHAR(50),
  type VARCHAR(50)
);

INSERT INTO products (name, price, tag, type) VALUES
('Sample Women Top', 45.00, 'new', 'new'),
('Sample Men Shirt', 55.00, NULL, 'new'),
('Sample Jacket', 120.00, 'hot', 'top'),
('Sample Shoes', 80.00, NULL, 'top');
