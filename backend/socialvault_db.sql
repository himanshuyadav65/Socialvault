-- SocialVault XAMPP MySQL Database Schema
-- Database: `instatrack_db`

CREATE DATABASE IF NOT EXISTS `instatrack_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `instatrack_db`;

-- Table 1: Searched & Extracted Instagram Profiles
CREATE TABLE IF NOT EXISTS `searched_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `display_name` VARCHAR(255) DEFAULT NULL,
  `avatar_url` LONGTEXT DEFAULT NULL,
  `user_id` VARCHAR(100) DEFAULT NULL,
  `followers` INT DEFAULT 0,
  `following` INT DEFAULT 0,
  `posts` INT DEFAULT 0,
  `is_private` TINYINT(1) DEFAULT 0,
  `is_verified` TINYINT(1) DEFAULT 0,
  `biography` TEXT DEFAULT NULL,
  `tracking_id` VARCHAR(100) DEFAULT NULL,
  `archive_size` VARCHAR(50) DEFAULT '2.8 GB',
  `active_sessions` INT DEFAULT 5,
  `linked_devices` INT DEFAULT 3,
  `ip_addresses` INT DEFAULT 7,
  `cookies_count` INT DEFAULT 13,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Search Request Logs
CREATE TABLE IF NOT EXISTS `search_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(100) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'verified',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Unlocked / Purchased Reports
CREATE TABLE IF NOT EXISTS `unlocked_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `tracking_id` VARCHAR(100) DEFAULT NULL,
  `price` VARCHAR(20) DEFAULT '₹99',
  `status` VARCHAR(50) DEFAULT 'unlocked',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
