CREATE DATABASE delilah_resto;
USE delilah_resto;

SET @@time_zone = '-03:00';

CREATE TABLE users(
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(50) NOT NULL,
	password VARCHAR(255) NOT NULL,
	fullname VARCHAR(100) NOT NULL,
	email VARCHAR(50) NOT NULL,
	mobile VARCHAR(25) NOT NULL,
	address VARCHAR(50) NOT NULL,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	is_admin TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY(id)
) AUTO_INCREMENT = 1000;

CREATE TABLE products(
	id INT NOT NULL AUTO_INCREMENT,
	description VARCHAR(50) NOT NULL,
	picture VARCHAR(255) NOT NULL,
	price DECIMAL(6,2) NOT NULL,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	PRIMARY KEY(id)
) AUTO_INCREMENT = 100;

CREATE TABLE orders(
	id INT NOT NULL AUTO_INCREMENT,
	created_at DATETIME NOT NULL,
	payment VARCHAR(100) NOT NULL,
	status VARCHAR(25) NOT NULL,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	user_id INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(user_id) REFERENCES users(id)
) AUTO_INCREMENT = 10000;

CREATE TABLE orders_detail(
	id INT NOT NULL AUTO_INCREMENT,
	order_id INT NOT NULL,
	product_id INT NOT NULL,
	quantity INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(order_id) REFERENCES orders(id),
	FOREIGN KEY(product_id) REFERENCES products(id)
);