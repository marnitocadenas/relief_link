-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.46 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for relief_link
CREATE DATABASE IF NOT EXISTS `relief_link` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `relief_link`;

-- Dumping structure for table relief_link.activity_logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  KEY `activity_logs_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.activity_logs: ~161 rows (approximately)
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `subject_type`, `subject_id`, `metadata`, `created_at`, `updated_at`) VALUES
	(1, 1, 'deleted user', 'App\\Models\\User', 6, '[]', '2026-08-26 19:18:02', '2026-08-26 19:18:02'),
	(2, 1, 'deleted user', 'App\\Models\\User', 10, '[]', '2026-08-26 19:18:45', '2026-08-26 19:18:45'),
	(3, 1, 'deleted user', 'App\\Models\\User', 4, '[]', '2026-08-26 19:20:07', '2026-08-26 19:20:07'),
	(4, 1, 'deleted user', 'App\\Models\\User', 11, '[]', '2026-08-26 19:20:11', '2026-08-26 19:20:11'),
	(5, 1, 'deleted user', 'App\\Models\\User', 8, '[]', '2026-08-26 19:20:15', '2026-08-26 19:20:15'),
	(6, 1, 'deleted user', 'App\\Models\\User', 7, '[]', '2026-08-26 19:20:19', '2026-08-26 19:20:19'),
	(7, 1, 'deleted user', 'App\\Models\\User', 9, '[]', '2026-08-26 19:20:24', '2026-08-26 19:20:24'),
	(8, 1, 'deleted user', 'App\\Models\\User', 3, '[]', '2026-08-26 19:20:34', '2026-08-26 19:20:34'),
	(9, 1, 'deleted user', 'App\\Models\\User', 5, '[]', '2026-08-26 19:20:38', '2026-08-26 19:20:38'),
	(10, 1, 'deleted user', 'App\\Models\\User', 12, '[]', '2026-08-26 19:20:59', '2026-08-26 19:20:59'),
	(11, 1, 'deleted user', 'App\\Models\\User', 15, '[]', '2026-08-27 01:03:00', '2026-08-27 01:03:00'),
	(12, 1, 'created user', 'App\\Models\\User', 16, '[]', '2026-08-27 01:07:33', '2026-08-27 01:07:33'),
	(13, 16, 'created user', 'App\\Models\\User', 17, '[]', '2026-08-28 05:24:43', '2026-08-28 05:24:43'),
	(14, 16, 'created user', 'App\\Models\\User', 18, '[]', '2026-08-28 06:09:06', '2026-08-28 06:09:06'),
	(15, 16, 'created user', 'App\\Models\\User', 19, '[]', '2026-08-28 06:10:52', '2026-08-28 06:10:52'),
	(16, 19, 'created support request', 'App\\Models\\AidRequest', 12, '[]', '2026-08-30 00:04:09', '2026-08-30 00:04:09'),
	(17, 18, 'created donation', 'App\\Models\\Donation', 12, '[]', '2026-08-30 16:48:52', '2026-08-30 16:48:52'),
	(18, 18, 'created donation', 'App\\Models\\Donation', 13, '[]', '2026-08-30 17:50:52', '2026-08-30 17:50:52'),
	(19, 18, 'created donation', 'App\\Models\\Donation', 14, '[]', '2026-08-30 17:52:42', '2026-08-30 17:52:42'),
	(20, 18, 'created donation', 'App\\Models\\Donation', 15, '[]', '2026-08-30 18:32:58', '2026-08-30 18:32:58'),
	(21, 18, 'created donation', 'App\\Models\\Donation', 16, '[]', '2026-08-30 18:34:18', '2026-08-30 18:34:18'),
	(22, 18, 'created donation', 'App\\Models\\Donation', 17, '[]', '2026-08-30 18:36:33', '2026-08-30 18:36:33'),
	(23, 18, 'created donation', 'App\\Models\\Donation', 18, '[]', '2026-09-14 05:59:30', '2026-09-14 05:59:30'),
	(24, 18, 'created donation', 'App\\Models\\Donation', 19, '[]', '2026-09-15 02:35:07', '2026-09-15 02:35:07'),
	(25, 17, 'under_review support request', 'App\\Models\\AidRequest', 12, '{"checklist": []}', '2026-09-15 02:37:41', '2026-09-15 02:37:41'),
	(26, 18, 'created donation', 'App\\Models\\Donation', 20, '[]', '2026-09-15 02:39:42', '2026-09-15 02:39:42'),
	(27, 16, 'created user', 'App\\Models\\User', 20, '[]', '2026-09-15 03:12:07', '2026-09-15 03:12:07'),
	(28, 18, 'created donation', 'App\\Models\\Donation', 21, '[]', '2026-09-16 01:45:58', '2026-09-16 01:45:58'),
	(29, 17, 'under_review support request', 'App\\Models\\AidRequest', 11, '{"checklist": []}', '2026-09-16 01:48:37', '2026-09-16 01:48:37'),
	(30, 19, 'created support request', 'App\\Models\\AidRequest', 13, '[]', '2026-09-16 01:51:05', '2026-09-16 01:51:05'),
	(31, 19, 'deleted support request', 'App\\Models\\AidRequest', 13, '[]', '2026-09-16 01:53:31', '2026-09-16 01:53:31'),
	(32, 19, 'deleted support request', 'App\\Models\\AidRequest', 12, '[]', '2026-09-16 01:53:36', '2026-09-16 01:53:36'),
	(33, 19, 'created support request', 'App\\Models\\AidRequest', 14, '[]', '2026-09-16 01:54:04', '2026-09-16 01:54:04'),
	(34, 18, 'created donation', 'App\\Models\\Donation', 22, '[]', '2026-09-16 01:55:38', '2026-09-16 01:55:38'),
	(35, 19, 'deleted support request', 'App\\Models\\AidRequest', 14, '[]', '2026-09-16 01:56:50', '2026-09-16 01:56:50'),
	(36, 19, 'created support request', 'App\\Models\\AidRequest', 15, '[]', '2026-09-16 01:57:25', '2026-09-16 01:57:25'),
	(37, 18, 'created donation', 'App\\Models\\Donation', 23, '[]', '2026-09-16 01:58:18', '2026-09-16 01:58:18'),
	(38, 17, 'under_review support request', 'App\\Models\\AidRequest', 15, '{"checklist": []}', '2026-09-16 02:00:18', '2026-09-16 02:00:18'),
	(39, 17, 'approved support request', 'App\\Models\\AidRequest', 15, '{"checklist": {"identity": false, "eligibility": false, "justification": false}}', '2026-09-16 02:01:34', '2026-09-16 02:01:34'),
	(40, 16, 'approved support request', 'App\\Models\\AidRequest', 11, '{"checklist": []}', '2026-09-18 21:40:50', '2026-09-18 21:40:50'),
	(41, 16, 'approved support request', 'App\\Models\\AidRequest', 11, '{"checklist": []}', '2026-09-18 21:40:51', '2026-09-18 21:40:51'),
	(42, 16, 'approved support request', 'App\\Models\\AidRequest', 11, '{"checklist": []}', '2026-09-18 21:40:52', '2026-09-18 21:40:52'),
	(43, 16, 'updated user', 'App\\Models\\User', 16, '[]', '2026-09-19 06:46:23', '2026-09-19 06:46:23'),
	(44, 16, 'deleted user', 'App\\Models\\User', 28, '[]', '2026-09-19 06:46:32', '2026-09-19 06:46:32'),
	(45, 16, 'deleted user', 'App\\Models\\User', 31, '[]', '2026-09-19 06:47:18', '2026-09-19 06:47:18'),
	(46, 16, 'updated user', 'App\\Models\\User', 16, '[]', '2026-09-19 06:49:35', '2026-09-19 06:49:35'),
	(47, 16, 'created user', 'App\\Models\\User', 32, '[]', '2026-09-19 06:50:42', '2026-09-19 06:50:42'),
	(48, 16, 'created user', 'App\\Models\\User', 33, '[]', '2026-09-19 06:54:36', '2026-09-19 06:54:36'),
	(49, 16, 'created user', 'App\\Models\\User', 34, '[]', '2026-09-19 06:55:55', '2026-09-19 06:55:55'),
	(50, 17, 'updated inventory stock item', 'App\\Models\\Donation', 23, '[]', '2026-09-19 06:59:57', '2026-09-19 06:59:57'),
	(51, 1, 'created user', 'App\\Models\\User', 37, '[]', '2026-09-19 07:48:12', '2026-09-19 07:48:12'),
	(52, 1, 'created user', 'App\\Models\\User', 38, '[]', '2026-09-19 07:53:17', '2026-09-19 07:53:17'),
	(53, 1, 'created user', 'App\\Models\\User', 39, '[]', '2026-09-19 08:16:20', '2026-09-19 08:16:20'),
	(54, 1, 'created user', 'App\\Models\\User', 40, '[]', '2026-09-19 08:16:21', '2026-09-19 08:16:21'),
	(55, 16, 'deleted donation', 'App\\Models\\Donation', 23, '[]', '2026-09-19 08:42:15', '2026-09-19 08:42:15'),
	(56, 16, 'deleted support request', 'App\\Models\\AidRequest', 11, '[]', '2026-09-19 08:42:24', '2026-09-19 08:42:24'),
	(57, 16, 'created user', 'App\\Models\\User', 42, '[]', '2026-09-19 16:52:53', '2026-09-19 16:52:53'),
	(58, 19, 'created support request', 'App\\Models\\AidRequest', 16, '[]', '2026-09-19 18:39:58', '2026-09-19 18:39:58'),
	(59, 16, 'approved support request', 'App\\Models\\AidRequest', 16, '{"checklist": []}', '2026-09-19 18:52:04', '2026-09-19 18:52:04'),
	(60, 16, 'deleted donation', 'App\\Models\\Donation', 22, '[]', '2026-09-19 19:50:07', '2026-09-19 19:50:07'),
	(61, 16, 'deleted donation', 'App\\Models\\Donation', 21, '[]', '2026-09-19 19:50:17', '2026-09-19 19:50:17'),
	(62, 16, 'created user', 'App\\Models\\User', 43, '[]', '2026-09-19 19:52:12', '2026-09-19 19:52:12'),
	(63, 16, 'updated user', 'App\\Models\\User', 43, '[]', '2026-09-19 19:54:05', '2026-09-19 19:54:05'),
	(64, 16, 'updated user', 'App\\Models\\User', 43, '[]', '2026-09-19 19:55:05', '2026-09-19 19:55:05'),
	(65, 16, 'created user', 'App\\Models\\User', 44, '[]', '2026-09-19 19:59:45', '2026-09-19 19:59:45'),
	(66, 16, 'created user', 'App\\Models\\User', 45, '[]', '2026-09-19 20:00:50', '2026-09-19 20:00:50'),
	(67, 16, 'deleted user', 'App\\Models\\User', 23, '[]', '2026-09-19 20:13:18', '2026-09-19 20:13:18'),
	(68, 16, 'deleted user', 'App\\Models\\User', 33, '[]', '2026-09-20 19:03:11', '2026-09-20 19:03:11'),
	(69, 16, 'deleted user', 'App\\Models\\User', 34, '[]', '2026-09-20 19:03:27', '2026-09-20 19:03:27'),
	(70, 16, 'deleted user', 'App\\Models\\User', 29, '[]', '2026-09-20 19:07:11', '2026-09-20 19:07:11'),
	(71, 16, 'deleted user', 'App\\Models\\User', 43, '[]', '2026-09-20 19:52:56', '2026-09-20 19:52:56'),
	(72, 19, 'cancelled support request', 'App\\Models\\AidRequest', 16, '{"reason": "i no this"}', '2026-09-20 20:03:53', '2026-09-20 20:03:53'),
	(73, 19, 'cancelled support request', 'App\\Models\\AidRequest', 15, '{"reason": "becauttrdt"}', '2026-09-20 20:04:57', '2026-09-20 20:04:57'),
	(74, 16, 'created user', 'App\\Models\\User', 46, '[]', '2026-09-21 21:37:37', '2026-09-21 21:37:37'),
	(75, 17, 'processed physical item intake', 'App\\Models\\Donation', 24, '[]', '2026-09-21 21:40:19', '2026-09-21 21:40:19'),
	(76, 16, 'created user', 'App\\Models\\User', 47, '[]', '2026-09-22 03:04:35', '2026-09-22 03:04:35'),
	(77, 16, 'created user', 'App\\Models\\User', 48, '[]', '2026-09-22 03:06:13', '2026-09-22 03:06:13'),
	(78, 1, 'deleted user', 'App\\Models\\User', 46, '[]', '2026-09-28 05:42:40', '2026-09-28 05:42:40'),
	(79, 1, 'updated user', 'App\\Models\\User', 18, '[]', '2026-09-29 05:14:37', '2026-09-29 05:14:37'),
	(80, 18, 'created donation', 'App\\Models\\Donation', 25, '[]', '2026-09-29 05:16:01', '2026-09-29 05:16:01'),
	(81, 1, 'deleted support request', 'App\\Models\\AidRequest', 16, '[]', '2026-10-01 07:26:23', '2026-10-01 07:26:23'),
	(82, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-02 01:20:08', '2026-10-02 01:20:08'),
	(83, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-02 01:20:10', '2026-10-02 01:20:10'),
	(84, 1, 'deleted user', 'App\\Models\\User', 32, '[]', '2026-10-02 01:51:10', '2026-10-02 01:51:10'),
	(85, 1, 'deleted support request', 'App\\Models\\AidRequest', 15, '[]', '2026-10-02 04:17:55', '2026-10-02 04:17:55'),
	(86, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:27', '2026-10-02 05:44:27'),
	(87, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:29', '2026-10-02 05:44:29'),
	(88, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:30', '2026-10-02 05:44:30'),
	(89, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:31', '2026-10-02 05:44:31'),
	(90, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:33', '2026-10-02 05:44:33'),
	(91, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:34', '2026-10-02 05:44:34'),
	(92, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:35', '2026-10-02 05:44:35'),
	(93, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-02 05:44:37', '2026-10-02 05:44:37'),
	(94, 1, 'deactivated user', 'App\\Models\\User', 30, '[]', '2026-10-02 05:44:54', '2026-10-02 05:44:54'),
	(95, 1, 'reactivated user', 'App\\Models\\User', 30, '[]', '2026-10-02 05:44:56', '2026-10-02 05:44:56'),
	(96, 1, 'updated user', 'App\\Models\\User', 1, '[]', '2026-10-02 17:59:14', '2026-10-02 17:59:14'),
	(97, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 03:39:52', '2026-10-03 03:39:52'),
	(98, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 03:39:55', '2026-10-03 03:39:55'),
	(99, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:52:56', '2026-10-03 03:52:56'),
	(100, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:52:59', '2026-10-03 03:52:59'),
	(101, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:53:01', '2026-10-03 03:53:01'),
	(102, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:53:03', '2026-10-03 03:53:03'),
	(103, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:53:04', '2026-10-03 03:53:04'),
	(104, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:53:06', '2026-10-03 03:53:06'),
	(105, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:53:07', '2026-10-03 03:53:07'),
	(106, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:54:12', '2026-10-03 03:54:12'),
	(107, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:54:14', '2026-10-03 03:54:14'),
	(108, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:54:15', '2026-10-03 03:54:15'),
	(109, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:54:18', '2026-10-03 03:54:18'),
	(110, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 03:54:19', '2026-10-03 03:54:19'),
	(111, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:25', '2026-10-03 04:04:25'),
	(112, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:27', '2026-10-03 04:04:27'),
	(113, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:30', '2026-10-03 04:04:30'),
	(114, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:35', '2026-10-03 04:04:35'),
	(115, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:37', '2026-10-03 04:04:37'),
	(116, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-03 04:04:38', '2026-10-03 04:04:38'),
	(117, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:10', '2026-10-03 04:05:10'),
	(118, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:13', '2026-10-03 04:05:13'),
	(119, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:15', '2026-10-03 04:05:15'),
	(120, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:17', '2026-10-03 04:05:17'),
	(121, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:18', '2026-10-03 04:05:18'),
	(122, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:05:20', '2026-10-03 04:05:20'),
	(123, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:12:13', '2026-10-03 04:12:13'),
	(124, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:12:16', '2026-10-03 04:12:16'),
	(125, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:14:48', '2026-10-03 04:14:48'),
	(126, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:14:52', '2026-10-03 04:14:52'),
	(127, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:14:54', '2026-10-03 04:14:54'),
	(128, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:16', '2026-10-03 04:15:16'),
	(129, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:17', '2026-10-03 04:15:17'),
	(130, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:18', '2026-10-03 04:15:18'),
	(131, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:20', '2026-10-03 04:15:20'),
	(132, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:21', '2026-10-03 04:15:21'),
	(133, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:15:25', '2026-10-03 04:15:25'),
	(134, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:33', '2026-10-03 04:16:33'),
	(135, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:34', '2026-10-03 04:16:34'),
	(136, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:37', '2026-10-03 04:16:37'),
	(137, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:40', '2026-10-03 04:16:40'),
	(138, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:41', '2026-10-03 04:16:41'),
	(139, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:43', '2026-10-03 04:16:43'),
	(140, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:16:50', '2026-10-03 04:16:50'),
	(141, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:17:11', '2026-10-03 04:17:11'),
	(142, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:20:11', '2026-10-03 04:20:11'),
	(143, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:20:13', '2026-10-03 04:20:13'),
	(144, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:23:15', '2026-10-03 04:23:15'),
	(145, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:23:17', '2026-10-03 04:23:17'),
	(146, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:26:11', '2026-10-03 04:26:11'),
	(147, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:26:13', '2026-10-03 04:26:13'),
	(148, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 04:26:15', '2026-10-03 04:26:15'),
	(149, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:26:18', '2026-10-03 04:26:18'),
	(150, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 04:26:21', '2026-10-03 04:26:21'),
	(151, 2, 'under_review support request', 'App\\Models\\AidRequest', 18, '{"checklist": []}', '2026-10-03 18:59:53', '2026-10-03 18:59:53'),
	(152, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 23:57:59', '2026-10-03 23:57:59'),
	(153, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-03 23:58:03', '2026-10-03 23:58:03'),
	(154, 1, 'deactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 23:58:05', '2026-10-03 23:58:05'),
	(155, 1, 'reactivated user', 'App\\Models\\User', 20, '[]', '2026-10-03 23:58:06', '2026-10-03 23:58:06'),
	(156, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-05 06:37:40', '2026-10-05 06:37:40'),
	(157, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-05 06:37:42', '2026-10-05 06:37:42'),
	(158, 1, 'deactivated user', 'App\\Models\\User', 16, '[]', '2026-10-08 05:53:28', '2026-10-08 05:53:28'),
	(159, 1, 'reactivated user', 'App\\Models\\User', 16, '[]', '2026-10-08 05:53:30', '2026-10-08 05:53:30'),
	(160, 1, 'deactivated user', 'App\\Models\\User', 49, '[]', '2026-10-08 05:53:36', '2026-10-08 05:53:36'),
	(161, 1, 'reactivated user', 'App\\Models\\User', 49, '[]', '2026-10-08 05:53:38', '2026-10-08 05:53:38'),
	(162, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:42', '2026-10-08 05:53:42'),
	(163, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:48', '2026-10-08 05:53:48'),
	(164, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:52', '2026-10-08 05:53:52'),
	(165, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:54', '2026-10-08 05:53:54'),
	(166, 1, 'deactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:56', '2026-10-08 05:53:56'),
	(167, 1, 'reactivated user', 'App\\Models\\User', 48, '[]', '2026-10-08 05:53:58', '2026-10-08 05:53:58'),
	(168, 1, 'approved support request', 'App\\Models\\AidRequest', 18, '{"checklist": []}', '2026-10-08 06:54:54', '2026-10-08 06:54:54'),
	(169, 51, 'created donation', 'App\\Models\\Donation', 27, '[]', '2026-10-08 07:12:44', '2026-10-08 07:12:44');

-- Dumping structure for table relief_link.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.cache: ~2 rows (approximately)
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:12;', 1791471505),
	('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1791471505;', 1791471505);

-- Dumping structure for table relief_link.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.cache_locks: ~0 rows (approximately)

-- Dumping structure for table relief_link.donations
CREATE TABLE IF NOT EXISTS `donations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donor_id` bigint unsigned NOT NULL,
  `donation_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'physical',
  `item_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int unsigned NOT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'PHP',
  `condition_notes` text COLLATE utf8mb4_unicode_ci,
  `availability_window` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_match',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition_grade` enum('new','like_new','good','fair','damaged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `intake_notes` text COLLATE utf8mb4_unicode_ci,
  `expiry_date` date DEFAULT NULL,
  `preferred_handoff_slots` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `donations_donor_id_foreign` (`donor_id`),
  KEY `donations_category_index` (`category`),
  KEY `donations_status_index` (`status`),
  CONSTRAINT `donations_donor_id_foreign` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.donations: ~13 rows (approximately)
INSERT INTO `donations` (`id`, `donor_id`, `donation_type`, `item_name`, `category`, `quantity`, `amount`, `currency`, `condition_notes`, `availability_window`, `status`, `created_at`, `updated_at`, `image_path`, `pickup_location`, `storage_location`, `condition_grade`, `intake_notes`, `expiry_date`, `preferred_handoff_slots`) VALUES
	(11, 2, 'physical', 'Test Medical Kit', 'Medical & Health', 10, NULL, 'PHP', NULL, NULL, 'pending_match', '2026-08-28 05:23:27', '2026-08-28 05:23:27', NULL, NULL, 'Depot A / Shelf 2B', 'new', 'Staff intake test kit', NULL, NULL),
	(12, 18, 'physical', 'marnrjut', 'food', 3, NULL, 'PHP', '[Condition: Gently Used] erewr', 'Available Immediately', 'pending_match', '2026-08-30 16:48:52', '2026-08-30 16:48:52', 'donations/ofCObFB0sVw85vPtkm8ghN9kZ5y6GPTXIiJN0Rru.jpg', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (fsd)'),
	(13, 18, 'physical', 'dfgfd', 'food', 1, NULL, 'PHP', '[Condition: Gently Used]', 'Available Immediately', 'pending_match', '2026-08-30 17:50:52', '2026-08-30 17:50:52', 'donations/9vrNQMHvDyx2H4xZ8aSggrRgGAJ9NiMrV55NKe0E.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (fg)'),
	(14, 18, 'physical', 'vb', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] vbv', 'Available Immediately', 'pending_match', '2026-08-30 17:52:42', '2026-08-30 17:52:42', 'donations/s33hi5S1FHMuxAMfe4zgsdclogGsLn7WTxu0izXN.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (vb)'),
	(15, 18, 'physical', 'fdsf', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] sdfs', 'Available Immediately', 'pending_match', '2026-08-30 18:32:58', '2026-08-30 18:32:58', 'donations/6mSz4baQj5LrZQmTOCOLTCtLJESFPOa5d4xwXBL7.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (fs)'),
	(16, 18, 'physical', 'bb', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] bb', 'Available Immediately', 'pending_match', '2026-08-30 18:34:18', '2026-08-30 18:34:18', 'donations/BTcdf6SAUYggDRthUTxQnSIR00WknUgxgJ12hXjB.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (bb)'),
	(17, 18, 'physical', 'drtgrd', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] ghg', 'Available Immediately', 'pending_match', '2026-08-30 18:36:33', '2026-08-30 18:36:33', 'donations/cUTCrpaP4JueeyRyLz5CeSFRDRW5moY4PJWhWUjc.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (ghg)'),
	(18, 18, 'physical', 'marnrjut', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] fdsdddddddddddddddddddddddddd', 'Custom Schedule', 'pending_match', '2026-09-14 05:59:30', '2026-09-14 05:59:30', 'donations/xxghboFsAlzs1VFzQWwVGYm62YtgwgJatmZtxHn2.jpg', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (fffffffffffffffffff)'),
	(19, 18, 'physical', '123', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] 123', 'Available Immediately', 'pending_match', '2026-09-15 02:35:07', '2026-09-15 02:35:07', NULL, 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM) (123)'),
	(20, 18, 'physical', '123', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] 123', 'Available Immediately', 'pending_match', '2026-09-15 02:39:42', '2026-09-15 02:39:42', 'donations/UypAh9DhWglvt3dzgV2ZNuwdy2TcnbFHW233XnZC.jpg', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM)'),
	(24, 13, 'physical', 'dfdfd', 'Food & Meals', 1, NULL, 'PHP', NULL, 'Immediate Campus Warehouse Stock', 'pending_match', '2026-09-21 21:40:19', '2026-09-21 21:40:19', NULL, 'Main Warehouse Depot A - Shelf 1', 'Main Warehouse Depot A - Shelf 1', 'good', 'efsdfds', NULL, NULL),
	(25, 18, 'physical', 'fgfdg', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] fdg', 'Available Immediately', 'pending_match', '2026-09-29 05:16:01', '2026-09-29 05:16:01', 'donations/wynli8IP2MNx1sQrCNrplWvs2g266lQk8M7jOmuD.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM)'),
	(26, 49, 'physical', 'Scientific calculator and notebook set', 'School Supplies', 5, NULL, 'PHP', 'New calculators with unused ruled notebooks.', 'Weekdays, 9:00 AM–4:00 PM', 'proposed', '2026-10-02 21:02:34', '2026-10-02 21:02:34', NULL, 'Campus Student Center, Room 104', NULL, 'new', NULL, NULL, NULL),
	(27, 51, 'physical', '123', 'food', 1, NULL, 'PHP', '[Condition: Gently Used] bcvb', 'Available Immediately', 'pending_match', '2026-10-08 07:12:44', '2026-10-08 07:12:44', 'donations/ItxRJowogz39uNHsLm0FT4Odg1nBKrgy13jTShG2.png', 'Campus Student Center - Main Entrance', NULL, 'good', NULL, NULL, 'Morning (8:00 AM - 12:00 PM)');

-- Dumping structure for table relief_link.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table relief_link.inventory_movements
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donation_id` bigint unsigned NOT NULL,
  `staff_user_id` bigint unsigned NOT NULL,
  `movement_type` enum('intake','adjustment','allocation','return','write_off') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_delta` int NOT NULL,
  `quantity_after` int unsigned NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_movements_staff_user_id_foreign` (`staff_user_id`),
  KEY `inventory_movements_donation_id_created_at_index` (`donation_id`,`created_at`),
  CONSTRAINT `inventory_movements_donation_id_foreign` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_movements_staff_user_id_foreign` FOREIGN KEY (`staff_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.inventory_movements: ~0 rows (approximately)
INSERT INTO `inventory_movements` (`id`, `donation_id`, `staff_user_id`, `movement_type`, `quantity_delta`, `quantity_after`, `reason`, `created_at`, `updated_at`) VALUES
	(2, 24, 17, 'intake', 1, 1, 'Physical warehouse intake', '2026-09-21 21:40:19', '2026-09-21 21:40:19');

-- Dumping structure for table relief_link.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.job_batches: ~0 rows (approximately)

-- Dumping structure for table relief_link.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.jobs: ~0 rows (approximately)

-- Dumping structure for table relief_link.matches
CREATE TABLE IF NOT EXISTS `matches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `donation_id` bigint unsigned NOT NULL,
  `request_id` bigint unsigned NOT NULL,
  `matched_quantity` int unsigned NOT NULL,
  `matched_amount` decimal(12,2) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'proposed',
  `pickup_hub` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_pin` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_attempt_count` tinyint unsigned NOT NULL DEFAULT '0',
  `pin_locked_at` timestamp NULL DEFAULT NULL,
  `pin_verified_at` timestamp NULL DEFAULT NULL,
  `pin_expires_at` timestamp NULL DEFAULT NULL,
  `handed_off_by_user_id` bigint unsigned DEFAULT NULL,
  `handed_off_at` timestamp NULL DEFAULT NULL,
  `handoff_scheduled_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `donor_completed_at` timestamp NULL DEFAULT NULL,
  `beneficiary_completed_at` timestamp NULL DEFAULT NULL,
  `handoff_notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `matches_donation_id_foreign` (`donation_id`),
  KEY `matches_request_id_foreign` (`request_id`),
  KEY `matches_status_index` (`status`),
  KEY `matches_handed_off_by_user_id_foreign` (`handed_off_by_user_id`),
  CONSTRAINT `matches_donation_id_foreign` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `matches_handed_off_by_user_id_foreign` FOREIGN KEY (`handed_off_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_request_id_foreign` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.matches: ~0 rows (approximately)
INSERT INTO `matches` (`id`, `donation_id`, `request_id`, `matched_quantity`, `matched_amount`, `status`, `pickup_hub`, `verification_pin`, `pin_attempt_count`, `pin_locked_at`, `pin_verified_at`, `pin_expires_at`, `handed_off_by_user_id`, `handed_off_at`, `handoff_scheduled_at`, `created_at`, `updated_at`, `donor_completed_at`, `beneficiary_completed_at`, `handoff_notes`) VALUES
	(2, 26, 17, 3, NULL, 'proposed', 'Campus Student Center', '420936', 0, NULL, NULL, '2026-10-09 21:02:34', NULL, NULL, NULL, '2026-10-02 21:02:34', '2026-10-02 21:02:34', NULL, NULL, 'Three of five requested sets are available for review.');

-- Dumping structure for table relief_link.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.migrations: ~29 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_08_12_000001_create_relief_link_tables', 1),
	(5, '2026_08_12_150145_create_personal_access_tokens_table', 1),
	(6, '2026_08_13_000001_add_profile_and_handoff_fields', 1),
	(7, '2026_08_13_000002_add_collaboration_features', 1),
	(8, '2026_08_22_000001_create_password_otps_table', 1),
	(9, '2026_08_27_000001_add_staff_role_to_users_table', 1),
	(10, '2026_08_28_000001_enhance_staff_panel_fields', 2),
	(11, '2026_08_28_000002_create_inventory_movements_table', 3),
	(12, '2026_08_28_000003_add_request_verification_workflow_fields', 4),
	(13, '2026_08_28_000004_add_walk_in_workflow_fields_to_requests', 5),
	(14, '2026_08_28_000005_add_handoff_pin_security_fields', 6),
	(15, '2026_08_30_000006_add_beneficiary_request_details', 7),
	(16, '2026_08_30_000007_enhance_relief_notifications', 8),
	(17, '2026_08_30_000008_create_system_settings_table', 9),
	(18, '2026_08_31_000009_add_seen_at_to_relief_notifications', 10),
	(19, '2026_08_31_000010_add_event_key_to_relief_notifications', 10),
	(20, '2026_08_31_000011_backfill_notification_event_keys', 11),
	(21, '2026_09_16_000001_add_donor_beneficiary_fields', 12),
	(22, '2026_09_17_000001_add_country_to_users_table', 13),
	(23, '2026_09_17_000002_add_country_code_to_users_table', 14),
	(24, '2026_09_18_000001_add_registration_identity_unique_constraints', 15),
	(25, '2026_09_19_000001_remove_registration_campus_role_fields_from_users_table', 15),
	(26, '2026_09_19_000002_add_role_specific_registration_fields_to_users_table', 15),
	(27, '2026_09_20_000001_add_financial_and_extended_request_fields', 16),
	(28, '2026_09_22_041354_add_valid_id_number_to_users_table', 17),
	(29, '2026_09_27_000001_add_create_account_fields_to_users_table', 18),
	(30, '2026_10_02_000001_add_is_active_to_users_table', 19);

-- Dumping structure for table relief_link.password_otps
CREATE TABLE IF NOT EXISTS `password_otps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `password_otps_email_index` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.password_otps: ~21 rows (approximately)
INSERT INTO `password_otps` (`id`, `email`, `otp`, `expires_at`, `verified_at`, `attempts`, `used`, `created_at`, `updated_at`) VALUES
	(1, 'marnitocadenas453@gmail.com', '$2y$12$bJBwsoQGyuuGll8bT8KrkOx/f/QsdvtlAqKcfrCjUvot4xTtjQhMO', '2026-08-26 19:19:52', '2026-08-26 19:10:29', 1, 0, '2026-08-26 19:09:52', '2026-08-26 19:10:29'),
	(2, 'staff@gmail.com', '$2y$12$vJW.d9iCl5DyuCHPAV9GKOyUDKlTtTkX41uD7Nac1/VPdNujJGLPy', '2026-08-29 23:20:44', NULL, 0, 0, '2026-08-29 23:10:44', '2026-08-29 23:10:44'),
	(3, 'marnitocadenas@gmail.com', '$2y$12$PtLXKd2Ip1PQlsSXtOTqCuRYQvMpgjda252c0gSl9pJnj3SMgtQue', '2026-08-30 17:50:08', NULL, 0, 0, '2026-08-30 17:40:08', '2026-08-30 17:40:08'),
	(4, 'marnitocadenas@gmail.com', '$2y$12$39uatBKXB4zVVmw0x65FXeBaq/eVaIEhCpvY0KOggKIou9UoXPJeG', '2026-08-30 17:51:27', '2026-08-30 17:42:23', 2, 0, '2026-08-30 17:41:27', '2026-08-30 17:42:23'),
	(5, 'marnitocadenas@gmail.com', '$2y$12$7miso5GaoAI9kCx6xlCGceC6o8v7cxlheAjQzIqD1zz3qkO9wVJEO', '2026-09-16 17:55:38', NULL, 0, 0, '2026-09-16 17:45:38', '2026-09-16 17:45:38'),
	(6, 'marnitocadenas@gmail.com', '$2y$12$acaq6BdyVz7jloZmVeUICeIAzcyRSIPLdrqd5VZUxH.xgH3P78q4q', '2026-09-18 05:42:39', '2026-09-18 05:33:18', 1, 0, '2026-09-18 05:32:39', '2026-09-18 05:33:18'),
	(7, 'marnitocadenas@gmail.com', '$2y$12$UXDuEJic4rBOpD4GjRDwCe.QOe6cdnx6wdB68MlclVP3dRfcHABHK', '2026-10-02 00:15:18', '2026-10-02 00:06:32', 1, 0, '2026-10-02 00:05:18', '2026-10-02 00:06:32'),
	(8, 'marnitocadenas@gmail.com', '$2y$12$3W1vb7tkye5ba9pk.z6Q.enVpCpqx9lVrVzhWqfZl9Yf1JG9Ek93e', '2026-10-05 03:41:08', NULL, 0, 0, '2026-10-05 03:31:08', '2026-10-05 03:31:08'),
	(9, 'marnitocadenas@gmail.com', '$2y$12$2PaW1FOfrZrCAxnCElM7F.EaG1e7jACBaT5blvagIosNtYTkwWa0e', '2026-10-05 03:42:16', '2026-10-05 03:33:08', 2, 0, '2026-10-05 03:32:16', '2026-10-05 03:33:08'),
	(10, 'marnitocadenas@gmail.com', '$2y$12$FyKyYz1wWVPyd32Y/ILqDOC8w4uKK4BdYkIryGJUDL6c6pMNt9Nzq', '2026-10-05 03:43:25', NULL, 0, 0, '2026-10-05 03:33:25', '2026-10-05 03:33:25'),
	(11, 'marnitocadenas@gmail.com', '$2y$12$fYMKPr2Mrm2IvxcCMrgGcuTDJ/zJdWoX4s6YPRuU.yNFbQGU4QuZe', '2026-10-05 03:46:22', '2026-10-05 03:36:55', 1, 0, '2026-10-05 03:36:22', '2026-10-05 03:36:55'),
	(12, 'marnitocadenas@gmail.com', '$2y$12$Snm.82k2D/pAez4eclFZCur9o9zY7c1IR4vAvNA/WJazaoDfBzdRa', '2026-10-05 03:47:24', '2026-10-05 03:38:11', 2, 0, '2026-10-05 03:37:24', '2026-10-05 03:38:11'),
	(13, 'marnitocadenas@gmail.com', '$2y$12$AP5pLhd5oEdwKOrXIievv.Dp5UBOUWimSVuuB9VgNwjpAw5I8d6x6', '2026-10-05 03:51:06', '2026-10-05 03:41:43', 1, 0, '2026-10-05 03:41:06', '2026-10-05 03:41:43'),
	(14, 'marnitocadenas@gmail.com', '$2y$12$oh8dv2RBPPPI4Wvi6.vYseRr7Q6c/AnzKqoVOcSrTncjhFLQu1hAe', '2026-10-05 03:52:23', '2026-10-05 03:42:56', 1, 0, '2026-10-05 03:42:23', '2026-10-05 03:42:56'),
	(15, 'marnitocadenas@gmail.com', '$2y$12$v5NX/zdrLbBAEesxHb5wCuNhksSkWAa.wSqbezcFqiBTpP6sfd8x6', '2026-10-05 03:54:19', '2026-10-05 03:44:58', 2, 0, '2026-10-05 03:44:19', '2026-10-05 03:44:58'),
	(16, 'marnitocadenas@gmail.com', '$2y$12$nzzClAU39g/ww0PIb0ZXCeimaX0PuOdt5ebWqYaKHXBcOHKXTKeMK', '2026-10-05 03:59:48', '2026-10-05 03:50:16', 1, 0, '2026-10-05 03:49:48', '2026-10-05 03:50:16'),
	(17, 'marnitocadenas@gmail.com', '$2y$12$k839v/kpi00YS4l9cWrw0.2c39zE/SNqpV12hHRWJBptmZG6wbB7K', '2026-10-05 04:02:39', '2026-10-05 03:53:14', 1, 0, '2026-10-05 03:52:39', '2026-10-05 03:53:14'),
	(18, 'marnitocadenas@gmail.com', '$2y$12$L/wKo.k3r6xseIazPslzYOLRC1Hrzo6yH6Ff.bg9HkHen1KrdNZG2', '2026-10-05 04:20:57', '2026-10-05 04:12:07', 1, 0, '2026-10-05 04:10:57', '2026-10-05 04:12:07'),
	(19, 'marnitocadenas@gmail.com', '$2y$12$eywjodqO5WOVcWn92FPboesA73Z/l/p/re6DSe.3v8DaEHFW9DHhm', '2026-10-05 04:22:52', NULL, 0, 0, '2026-10-05 04:12:52', '2026-10-05 04:12:52'),
	(20, 'marnitocadenas@gmail.com', '$2y$12$bn9CJNTaspyB7uIGVttxQ.Syxm5fe2YrCNcY0Tbf/7UolA41umOlu', '2026-10-05 04:24:13', '2026-10-05 04:15:01', 2, 1, '2026-10-05 04:14:13', '2026-10-05 04:15:34'),
	(21, 'marnitocadenas@gmail.com', '$2y$12$GcZwEg02ugQyqfYIseH1Lu34xz/H24fdoftDTlrl9MBnwBxo4bQ.m', '2026-10-05 04:26:49', NULL, 0, 0, '2026-10-05 04:16:49', '2026-10-05 04:16:49'),
	(22, 'marnitocadenas@gmail.com', '$2y$12$oMgEV5I4a9a9yLVsn6Rkc.kYAx/SGiAkZ5Ch4rzFfzbAc3tnA0Jyq', '2026-10-07 05:49:15', NULL, 0, 0, '2026-10-07 05:39:15', '2026-10-07 05:39:15');

-- Dumping structure for table relief_link.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table relief_link.personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=340 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.personal_access_tokens: ~3 rows (approximately)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(89, 'App\\Models\\User', 18, 'react-spa', 'ef4c1b27b8a30c79a644b339f234d10b9e65ca26c9dcf9bfd689a2b47d0de64e', '["*"]', '2026-09-15 18:50:06', NULL, '2026-09-15 18:47:06', '2026-09-15 18:50:06'),
	(321, 'App\\Models\\User', 1, 'react-spa', '376cc7370cf4887c44f4a2b4db7882fd75171fa39d1b4c6709a22c3cd08faf97', '["*"]', '2026-10-08 03:41:27', NULL, '2026-10-07 06:11:33', '2026-10-08 03:41:27'),
	(339, 'App\\Models\\User', 2, 'react-spa', '23f56206a87f471d2cf0a8309df7653cea862966ce50610a53cce05fa9a2bf21', '["*"]', '2026-10-08 19:28:30', NULL, '2026-10-08 07:25:29', '2026-10-08 19:28:30');

-- Dumping structure for table relief_link.relief_notifications
CREATE TABLE IF NOT EXISTS `relief_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `priority` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `action_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `relief_notifications_user_id_event_key_unique` (`user_id`,`event_key`),
  KEY `relief_notifications_subject_type_subject_id_index` (`subject_type`,`subject_id`),
  KEY `relief_notifications_type_index` (`type`),
  KEY `relief_notifications_priority_index` (`priority`),
  KEY `relief_notifications_seen_at_index` (`seen_at`),
  CONSTRAINT `relief_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.relief_notifications: ~50 rows (approximately)
INSERT INTO `relief_notifications` (`id`, `user_id`, `message`, `type`, `priority`, `subject_type`, `subject_id`, `action_url`, `event_key`, `is_read`, `seen_at`, `created_at`, `updated_at`) VALUES
	(1, 19, 'Your support request was submitted and is awaiting verification.', 'request', 'normal', 'App\\Models\\AidRequest', 12, '/requests', '9f3002e98cbf76c247a46a4adf1a1d326cb30c542f8c6884c5bd6adc4a584c67', 1, '2026-09-07 05:03:40', '2026-08-30 00:04:09', '2026-09-15 02:41:14'),
	(5, 17, 'A new support request requires verification.', 'request', 'normal', 'App\\Models\\AidRequest', 12, '/staff/verifications', '1ea90004817011ba9b142ba1824d4430aee73f8ecbd05d78f83f4978a3506e3b', 1, '2026-08-31 06:35:35', '2026-08-30 00:04:17', '2026-08-31 06:35:35'),
	(10, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 12, '/staff/inventory', 'c127ff75779e607bbf3fe603a3bc15771de7082b7f4fbe9f0db46f72c2729de6', 1, '2026-08-31 06:35:35', '2026-08-30 16:48:58', '2026-08-31 06:35:35'),
	(15, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 13, '/staff/inventory', 'cde2bfd7878e805722628961cd7401923ced3c91accd1722bf38450d7cf52603', 1, '2026-08-31 06:35:35', '2026-08-30 17:50:59', '2026-08-31 06:35:35'),
	(16, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 14, '/donations', '3e36d7c179826d351824c434279ec119a94de810cc4163cbbd1ad804105e3e62', 1, '2026-08-30 18:25:42', '2026-08-30 17:52:42', '2026-08-30 18:25:54'),
	(20, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 14, '/staff/inventory', '26cffded741dce4eea22301c8e91e8c052e8acc297a176a7a1800c68942bec0f', 1, '2026-08-31 06:35:35', '2026-08-30 17:52:49', '2026-08-31 06:35:35'),
	(21, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 15, '/donations', '723219d992b3fc6f3c7518462815c56486bd8e28e4a12464a3fb726f8b07f2ab', 1, '2026-08-30 18:33:09', '2026-08-30 18:32:58', '2026-08-30 18:33:50'),
	(25, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 15, '/staff/inventory', 'cf6622b9d4a9d07ec6675aef98e802d8b9d134202cc71b7b7bf796e3b5e249cc', 1, '2026-08-31 06:35:35', '2026-08-30 18:33:04', '2026-08-31 06:35:35'),
	(26, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 16, '/donations', '8be869dc44f0b8aeb2f08f228fe8e8044c46a750e4d898e4a46209bc5ba9f4c7', 1, '2026-08-30 18:34:39', '2026-08-30 18:34:18', '2026-08-30 18:34:45'),
	(30, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 16, '/staff/inventory', '95c70f4fc24a8d8e7a7f5d7e6647a1441c5c89b65dfb675580d3fbce461ef7f3', 1, '2026-08-31 06:35:35', '2026-08-30 18:34:25', '2026-08-31 06:35:35'),
	(31, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 17, '/donations', '97de2afdbcb7a75337a3632e5eeaf97e00e98d55348a9297709446ae7e9b70a3', 1, '2026-08-30 18:36:53', '2026-08-30 18:36:33', '2026-08-31 05:45:56'),
	(35, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 17, '/staff/inventory', '7a2d87fe698609ca232d20f640cfa7c5fabf46af8af04cb65d29a187676f382c', 1, '2026-08-31 06:35:35', '2026-08-30 18:36:39', '2026-08-31 06:35:35'),
	(36, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 18, '/donations', 'ff246d304fcc0e339ee6479b824f501de64391f6bd3066e773b5c71286dcc2e2', 0, '2026-09-14 05:59:39', '2026-09-14 05:59:30', '2026-09-14 05:59:39'),
	(40, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 18, '/staff/inventory', 'd118ab318ce1e7fedeac2d48063fc462ca155cd1f683b52a998b5e180e76dcea', 0, '2026-09-15 02:36:34', '2026-09-14 05:59:37', '2026-09-15 02:36:34'),
	(41, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 19, '/donations', 'a873fb43beade74f75edad1c236b7a8372f784f9825d8b0eaf761dad51f49a66', 0, '2026-09-15 02:35:08', '2026-09-15 02:35:07', '2026-09-15 02:35:08'),
	(45, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 19, '/staff/inventory', '6b77966c49415faba3c544f9ee212a7da563b7be4fe0165f94487f9b76417929', 0, '2026-09-15 02:36:34', '2026-09-15 02:35:07', '2026-09-15 02:36:34'),
	(46, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 20, '/donations', 'd427d9bb775be58e914d0399fc1f9e713de052d77db14e6b41aae3d3a8a623a5', 0, '2026-09-15 02:39:42', '2026-09-15 02:39:42', '2026-09-15 02:39:42'),
	(50, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 20, '/staff/inventory', 'a99418c3091745b71ffc92201fbccf12bb6e46dcd46bc72f78cd2471bbdfcea6', 0, '2026-09-15 02:45:31', '2026-09-15 02:39:42', '2026-09-15 02:45:31'),
	(51, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 21, '/donations', 'f5a8a388506252d2d2ee1501cf1ab04d5d8e4b6bfab0bd9c53b810002dcde8b7', 0, '2026-09-16 01:46:04', '2026-09-16 01:45:58', '2026-09-16 01:46:04'),
	(55, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 21, '/staff/inventory', '95c40d84100939f3d9be646e72a95d5e9d42d814d4f431702355ce4075eb4e49', 0, '2026-09-16 01:48:20', '2026-09-16 01:46:03', '2026-09-16 01:48:20'),
	(56, 19, 'Your support request was submitted and is awaiting verification.', 'request', 'normal', 'App\\Models\\AidRequest', 13, '/requests', '30a5f64510ac45b2942a9ea0981c0fdc3c18e916cd1b6b2c77338501038a872d', 0, '2026-09-16 01:51:11', '2026-09-16 01:51:05', '2026-09-16 01:51:11'),
	(60, 17, 'A new support request requires verification.', 'request', 'normal', 'App\\Models\\AidRequest', 13, '/staff/verifications', '98c8a2e9e7b941bcc7ba95fe7807ebeb379e3d6e4268bdcb99a5bb14bee43271', 0, '2026-09-16 02:00:10', '2026-09-16 01:51:10', '2026-09-16 02:00:10'),
	(61, 19, 'Your support request was submitted and is awaiting verification.', 'request', 'normal', 'App\\Models\\AidRequest', 14, '/requests', '321d69c3f07217b138bbecb92096a54923bf5f45a5b6ca53a09bfa19c26ace4a', 0, '2026-09-16 01:54:10', '2026-09-16 01:54:04', '2026-09-16 01:54:10'),
	(65, 17, 'A new support request requires verification.', 'request', 'normal', 'App\\Models\\AidRequest', 14, '/staff/verifications', '987b32c6d3b08dd897275d3a547215e39740d3081f4178f63e014c6e2cb7558e', 0, '2026-09-16 02:00:10', '2026-09-16 01:54:09', '2026-09-16 02:00:10'),
	(66, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 22, '/donations', 'd1cec7922604b49c03ed89b3a59b6dbc4bc20b1f6d147f48bccbcbd1f46b1754', 0, '2026-09-16 01:55:44', '2026-09-16 01:55:38', '2026-09-16 01:55:44'),
	(71, 19, 'Your support request was submitted and is awaiting verification.', 'request', 'normal', 'App\\Models\\AidRequest', 15, '/requests', '7c418543fc1d19f8a12e0b6fcda9f0e8fb9adddb11af98e789bbf8611294385e', 0, '2026-09-16 01:57:31', '2026-09-16 01:57:25', '2026-09-16 01:57:31'),
	(75, 17, 'A new support request requires verification.', 'request', 'normal', 'App\\Models\\AidRequest', 15, '/staff/verifications', 'c08b89c739fff7f8e90e00758f8b20221a50ddd850dc136c770f8496a98be53b', 0, '2026-09-16 02:00:10', '2026-09-16 01:57:30', '2026-09-16 02:00:10'),
	(76, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 23, '/donations', '39eea4f6798576f1ca6368a015be8bf5af8b055094e83ecfc2e892c7a95c449b', 0, '2026-09-16 01:58:24', '2026-09-16 01:58:18', '2026-09-16 01:58:24'),
	(81, 19, 'Your help request was approved and is ready for matching.', 'request', 'normal', 'App\\Models\\AidRequest', 15, '/requests', 'd2c860e174b92d5e2d281913dacbb3251219fbfee23a7b8ee0f4ca0aa16a55d6', 0, '2026-09-16 02:02:11', '2026-09-16 02:01:30', '2026-09-16 02:02:11'),
	(82, 14, 'Your help request was approved and is ready for matching.', 'request', 'normal', 'App\\Models\\AidRequest', 11, '/requests', '2d73a23b2e778c50acfbbf8766933d63e0639c1ea0a3ed2df97e7b31e5d4d9d9', 0, '2026-10-05 04:15:58', '2026-09-18 21:40:47', '2026-10-05 04:15:58'),
	(83, 19, 'Your support request was submitted and is awaiting verification.', 'request', 'normal', 'App\\Models\\AidRequest', 16, '/requests', '05a79d4d653d84c844dd0810d82cb9d756637e2ebbae5916730500d3ec5bce69', 0, '2026-09-19 18:40:06', '2026-09-19 18:39:58', '2026-09-19 18:40:06'),
	(87, 17, 'A new support request requires verification.', 'request', 'high', 'App\\Models\\AidRequest', 16, '/staff/verifications', '418f4164f36556c4d375a682e872b4f76ec69e2b5d8480a6512a70f3ecc8b10f', 0, '2026-09-19 18:42:44', '2026-09-19 18:40:03', '2026-09-19 18:42:44'),
	(89, 42, 'A new support request requires verification.', 'request', 'high', 'App\\Models\\AidRequest', 16, '/staff/verifications', '418f4164f36556c4d375a682e872b4f76ec69e2b5d8480a6512a70f3ecc8b10f', 0, NULL, '2026-09-19 18:40:04', '2026-09-19 18:40:04'),
	(90, 19, 'Your help request was approved and is ready for matching.', 'request', 'normal', 'App\\Models\\AidRequest', 16, '/requests', 'c9b2c24585da92786847d53f7a7d7c0314673b2ee2320cf68a3a9187ea58c09b', 0, '2026-09-19 19:44:23', '2026-09-19 18:52:01', '2026-09-19 19:44:23'),
	(91, 19, 'Your support request was cancelled.', 'request', 'normal', 'App\\Models\\AidRequest', 16, '/requests', '4c3bd44fb097e4f39421e7999c2c429c22a47535eacf5571a1d08a4b0d6318b5', 0, '2026-09-20 20:04:16', '2026-09-20 20:03:53', '2026-09-20 20:04:16'),
	(92, 19, 'Your support request was cancelled.', 'request', 'normal', 'App\\Models\\AidRequest', 15, '/requests', '6f8fcf894eb5c03019c2e61cf37f4552caaae943e50311ee9b899a2682d4721b', 0, '2026-09-20 20:05:19', '2026-09-20 20:04:57', '2026-09-20 20:05:19'),
	(93, 18, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 25, '/donations', 'a127fe55e6358d55920cd9e4af8a85b7ea917ae7df4c60bea5383fa53969561d', 0, '2026-09-29 05:16:12', '2026-09-29 05:16:01', '2026-09-29 05:16:12'),
	(96, 16, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 25, '/staff/inventory', '6f50fcd4bb666c7ea47fce2d574a9ee24b509500ebb0f2e2fbad1496d50cee10', 0, NULL, '2026-09-29 05:16:07', '2026-09-29 05:16:07'),
	(97, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 25, '/staff/inventory', '6f50fcd4bb666c7ea47fce2d574a9ee24b509500ebb0f2e2fbad1496d50cee10', 0, NULL, '2026-09-29 05:16:08', '2026-09-29 05:16:08'),
	(99, 42, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 25, '/staff/inventory', '6f50fcd4bb666c7ea47fce2d574a9ee24b509500ebb0f2e2fbad1496d50cee10', 0, NULL, '2026-09-29 05:16:10', '2026-09-29 05:16:10'),
	(100, 47, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 25, '/staff/inventory', '6f50fcd4bb666c7ea47fce2d574a9ee24b509500ebb0f2e2fbad1496d50cee10', 0, NULL, '2026-09-29 05:16:11', '2026-09-29 05:16:11'),
	(101, 50, 'Your help request is currently under review by campus operations.', 'request', 'normal', 'App\\Models\\AidRequest', 18, '/requests', 'b034a84c837d160214eb41e5a0ac10608f8bf88cedaea867c25ccc53e942651e', 0, NULL, '2026-10-03 18:59:50', '2026-10-03 18:59:50'),
	(102, 50, 'Your help request was approved and is ready for matching.', 'request', 'normal', 'App\\Models\\AidRequest', 18, '/requests', '5b9cd1ff4bbc738d8633419f7934258216460fb69531fc8492b16c949b524d99', 0, NULL, '2026-10-08 06:54:51', '2026-10-08 06:54:51'),
	(103, 51, 'Your donation was submitted and is ready for staff intake.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/donations', '05d937efda98511172dabea2e1e1248874b4ab98b496864f7a00fe0bc5c328c5', 0, '2026-10-08 07:12:51', '2026-10-08 07:12:44', '2026-10-08 07:12:51'),
	(104, 1, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 1, '2026-10-08 07:13:06', '2026-10-08 07:12:47', '2026-10-08 07:13:14'),
	(105, 2, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 1, '2026-10-08 07:25:30', '2026-10-08 07:12:47', '2026-10-08 07:26:58'),
	(106, 16, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 0, NULL, '2026-10-08 07:12:48', '2026-10-08 07:12:48'),
	(107, 17, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 0, NULL, '2026-10-08 07:12:49', '2026-10-08 07:12:49'),
	(108, 42, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 0, NULL, '2026-10-08 07:12:49', '2026-10-08 07:12:49'),
	(109, 47, 'A new donation requires warehouse processing.', 'donation', 'normal', 'App\\Models\\Donation', 27, '/staff/inventory', 'bdbb69279bce16cb4da9743bb32f60b1c49392792e02a0676275bb3a55fdc48c', 0, NULL, '2026-10-08 07:12:50', '2026-10-08 07:12:50');

-- Dumping structure for table relief_link.requests
CREATE TABLE IF NOT EXISTS `requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `beneficiary_id` bigint unsigned NOT NULL,
  `request_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'physical',
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_needed` int unsigned NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_requested` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'PHP',
  `purpose_of_funds` text COLLATE utf8mb4_unicode_ci,
  `urgency` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `justification` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `preferred_assistance_date` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `additional_info` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_review',
  `is_walk_in` tinyint(1) NOT NULL DEFAULT '0',
  `walk_in_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_by_user_id` bigint unsigned DEFAULT NULL,
  `created_by_staff_id` bigint unsigned DEFAULT NULL,
  `verification_decided_at` timestamp NULL DEFAULT NULL,
  `verification_tier` enum('unverified','identity_verified','financial_hardship','emergency') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unverified',
  `verification_state` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `verification_checklist` json DEFAULT NULL,
  `verification_notes` text COLLATE utf8mb4_unicode_ci,
  `staff_internal_notes` text COLLATE utf8mb4_unicode_ci,
  `referral_destination` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_decision_reason` text COLLATE utf8mb4_unicode_ci,
  `student_id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `alternative_categories` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability_window` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supporting_document_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `requests_beneficiary_id_foreign` (`beneficiary_id`),
  KEY `requests_category_index` (`category`),
  KEY `requests_status_index` (`status`),
  KEY `requests_verified_by_user_id_foreign` (`verified_by_user_id`),
  KEY `requests_verification_state_index` (`verification_state`),
  KEY `requests_created_by_staff_id_foreign` (`created_by_staff_id`),
  KEY `requests_is_walk_in_index` (`is_walk_in`),
  KEY `requests_walk_in_status_index` (`walk_in_status`),
  CONSTRAINT `requests_beneficiary_id_foreign` FOREIGN KEY (`beneficiary_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `requests_created_by_staff_id_foreign` FOREIGN KEY (`created_by_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `requests_verified_by_user_id_foreign` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.requests: ~2 rows (approximately)
INSERT INTO `requests` (`id`, `beneficiary_id`, `request_type`, `category`, `quantity_needed`, `unit`, `amount_requested`, `currency`, `purpose_of_funds`, `urgency`, `justification`, `preferred_assistance_date`, `item_details`, `additional_info`, `status`, `is_walk_in`, `walk_in_status`, `verified_by_user_id`, `created_by_staff_id`, `verification_decided_at`, `verification_tier`, `verification_state`, `verification_checklist`, `verification_notes`, `staff_internal_notes`, `referral_destination`, `verification_decision_reason`, `student_id_number`, `created_at`, `updated_at`, `alternative_categories`, `pickup_location`, `availability_window`, `supporting_document_path`, `cancellation_reason`, `cancelled_at`) VALUES
	(17, 50, 'physical', 'School Supplies', 5, 'sets', NULL, 'PHP', NULL, 'high', 'Needed for laboratory classes and daily coursework this term.', 'October 15, 2026', 'Scientific calculator and notebook set', NULL, 'partially_fulfilled', 0, NULL, NULL, NULL, NULL, 'identity_verified', 'approved', NULL, NULL, NULL, NULL, NULL, '2026-004218', '2026-10-02 21:02:34', '2026-10-02 21:02:34', NULL, 'Student Affairs Office', 'Weekdays, 9:00 AM–4:00 PM', NULL, NULL, NULL),
	(18, 50, 'physical', 'books', 2, 'books', NULL, 'PHP', NULL, 'medium', 'Required reference text for the second-year programming course.', 'November 3, 2026', 'Introduction to programming textbook', NULL, 'approved', 0, NULL, 1, NULL, '2026-10-08 06:54:51', 'unverified', 'approved', '[]', NULL, NULL, NULL, NULL, '2026-004218', '2026-10-02 21:04:53', '2026-10-08 06:54:51', NULL, NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table relief_link.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.sessions: ~11 rows (approximately)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('cFkjm7hah3qrrqj7MDRpHfvM92CJO06ohcDGglu8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM3BOSWZiT2hjVlZhSFp0aUJlZ2ZnSzkyVTNSRmxWYVpobTgxSjJPUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zdGFmZi9pbnZlbnRvcnkiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791295340),
	('gIPwAJG5XbMFaq4RDLrXG4PtPNIIDGxGZIodkcN6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieUNObzVkaTJ1bWYzRFdvaVR6Z2tPbmFVZWpNd1BydFhzM2pQNUxGViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wcm9maWxlIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791382357),
	('HFA6Zs2SNVjGAlQ6CpgAuxx7dIPfmiS5EsgC43Hq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9549', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZUNhdUlTRDVXMXlxMWowSGFYT2VhRUNwdGk5ZXBCNHNiY3lUR1paViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791101741),
	('hJiGZTctsnVl7Cgusf3blYfcgMXOmnbHi5HHFQp6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9549', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicUVyQ1FJbjJTUndzaVJWcVlJVW1ZbkpCZlVQT0R5Z3hGWDhCZXpBcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9iYW5uZXItcHJldmlldy5odG1sIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791101826),
	('jJH9lPeSK6kqkKZP1H6zELGY9uAHCxAUTR5cgJbO', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOU9yVk0wQjhPOEN0SjI1TkJBOGVsdFFOd1Q2Z0I4OGsxWEpXS25NeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zdGFmZi9pbnZlbnRvcnkiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791327165),
	('Ne64bDgXHVfQD0UhgFGETCc5ra2dARynCe09jAyB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNXFvQ0ZHQ3Zsb1V1Z3pSblBiaXJ3Ykl4bXh4blhuVXAyTndKdTc3dCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9iYW5uZXItcHJldmlldy5jc3MiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791102034),
	('Re2igB3O4BMLNPgZlDjHi45D9a38USPbEskcb1WY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicHpUVHNpdHZkR21NVFNEU0I5dFQ1NmVnOXJlVzF4VnZMalhKQWlvQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kb25vci9kYXNoYm9hcmQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791472342),
	('RqUPpZZa9FO9ovRXdGCXWXiM5gz8ayZtNFrZSNDF', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWVMzMEFHa1Vwek9YZDBJc2g2WkphcGViVmZqSzZvSnE2b2c2VXF5QyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kYXNoYm9hcmQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791107582),
	('Rt9Tr8B9ha9T1h8RmIfehoSpbupeIUwmod3yBRl3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib3ZIaG5LdkpET2FYMTlldnpFYnNEUzlBZzc2YVVNOW1aNlliN3huayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zdGFmZi9pbnZlbnRvcnkiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791214781),
	('uP9ffN1iWxGJNR0aPLSx2weqxffSyH6g1bSLJWut', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9549', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSURQRDY0Z1I2aVNiRWtwcnRmcHl1dUxHYzhNUHFBaVN1amZzMEtieSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791101734),
	('X4GQIbQ3XsI2OEVMmDygSLwinF9AFf8Gs0X08dht', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQzZZYXpoM082Rjl5bnFZMHFQQzRESVNWVm9zUllRR2t5UU5lbzJ5aCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791516367);

-- Dumping structure for table relief_link.system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `updated_by_user_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`),
  KEY `system_settings_updated_by_user_id_foreign` (`updated_by_user_id`),
  CONSTRAINT `system_settings_updated_by_user_id_foreign` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.system_settings: ~0 rows (approximately)

-- Dumping structure for table relief_link.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('donor','beneficiary','admin','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'donor',
  `account_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campus_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line_1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_province_region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city_municipality` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district_local_area` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_zip_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valid_id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valid_id_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_contact_number_unique` (`contact_number`),
  UNIQUE KEY `users_campus_id_unique` (`campus_id`),
  UNIQUE KEY `users_student_id_number_unique` (`student_id_number`),
  UNIQUE KEY `users_valid_id_number_unique` (`valid_id_number`),
  KEY `users_role_index` (`role`),
  KEY `users_is_active_index` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table relief_link.users: ~26 rows (approximately)
INSERT INTO `users` (`id`, `name`, `first_name`, `middle_name`, `last_name`, `email`, `email_verified_at`, `password`, `role`, `account_type`, `contact_number`, `campus_id`, `address`, `address_line_1`, `state_province_region`, `city_municipality`, `district_local_area`, `postal_zip_code`, `valid_id_number`, `valid_id_type`, `student_id_number`, `school_email`, `department`, `course`, `year_level`, `country`, `country_code`, `profile_photo_path`, `remember_token`, `created_at`, `updated_at`, `is_active`) VALUES
	(1, 'ReliefLinkrgtfdgfdgfdg Admin', 'ReliefLinkrgtfdgfdgfdg', NULL, 'Admin', 'admin@relieflink.test', '2026-08-26 18:44:23', '$2y$12$q.SvH6U4FgDuA1fTZPwUnOsYOLLhei77k7giVvt9bNTjMzj.4WtBO', 'admin', 'admin', '+639086820592', '24-463489', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'css', NULL, NULL, NULL, NULL, 'profiles/csMBYCuiVOP10vKkLCje7WkzUX1Yz33EZ24MBnrf.jpg', 'DLZSLzc9RT', '2026-08-26 18:44:23', '2026-10-02 17:59:14', 1),
	(2, 'ReliefLink Campus Staff', NULL, NULL, NULL, 'staff@relieflink.test', '2026-08-26 18:44:23', '$2y$12$lI5ZTaK5/klp4fwbC5AUyOz5Xlg7B7zKV82.13zG9qLUoCPyupEhi', 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'TqQ2nsdKbF', '2026-08-26 18:44:24', '2026-10-01 22:38:57', 1),
	(13, 'Marnito Cadenas', NULL, NULL, NULL, 'marnitocadenas453@gmail.com', '2026-08-26 19:33:18', '$2y$12$Auh8jd4UDHm8/NAvqsfsjeW8IB2BPYZQglR8NvKIrJ3QkC8ve.1Ky', 'donor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'eR7Oi6rIlc', '2026-08-26 19:09:26', '2026-08-26 19:33:18', 1),
	(14, 'Marnito Cadenas', NULL, NULL, NULL, 'marnitocadenas@gmail.com', '2026-08-26 19:33:18', '$2y$12$6hlqbnifRNcr7T.Q0O4HAe7O1asOzKTNAy7Qf9hKHJsAZO5w667Q6', 'beneficiary', 'beneficiary', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'marnitocadenas@gmail.com', NULL, NULL, NULL, NULL, NULL, 'profiles/SilH7acUsnuJl9NXyIpNxrldQqdQ466FnRcKLgem.jpg', 'E2n6de1sBR', '2026-08-26 19:13:55', '2026-10-05 04:15:34', 1),
	(16, 'admin', NULL, NULL, NULL, 'admin@gmail.com', '2026-08-27 01:08:01', '$2y$12$nOYBpRscqemYk6giQSE2O.Iz/ShT/U2GHsrLvof60OVE0ITsXfmfK', 'admin', 'admin', '+639086820597', '', '', NULL, NULL, NULL, NULL, NULL, '', NULL, '', '', '', '', '', 'Philippines', 'PH', 'profiles/yYpoZcO00KlvAH7BUXSExJj38yT14SEvoX7WYNHf.jpg', 'poziaBGAkY', '2026-08-27 01:07:33', '2026-10-08 05:53:30', 1),
	(17, 'staff', NULL, NULL, NULL, 'staff@gmail.com', '2026-08-28 05:25:12', '$2y$12$hM/HzfiJTRPP4sYp.kWB0uXUl9Z/LOBhqibIjtvHYfQilOclNsSaW', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'profiles/pSquJSO8SiuZUGbtXKNKMzHSUHeHQ2r6DnwXDESv.png', 'JALdiFczdA', '2026-08-28 05:24:43', '2026-08-31 06:58:54', 1),
	(18, 'donor aki', 'donor', NULL, 'aki', 'donor@gmail.com', '2026-08-28 06:09:20', '$2y$12$qhQfZ7zj0O8pXj9ymyTtBuGN7X.Lx.4h.ogD/7oKxfr9W1d2gtzRO', 'donor', 'donor', '+636567657676', '3666666666666666664', 'gffffffffffffff, Philippines', 'gffffffffffffff', NULL, NULL, NULL, NULL, '3666666666666666664', 'Driver\'s License', NULL, NULL, NULL, NULL, NULL, 'Philippines', 'PH', NULL, 'f7cp0ZxD5T', '2026-08-28 06:09:06', '2026-09-29 05:14:37', 1),
	(19, 'bene', NULL, NULL, NULL, 'bene@gmail.com', '2026-08-28 06:11:06', '$2y$12$LVn83szqeUcdy5KPtRRy0.ORUcu3wwf5ZxCvacwVUAS.e3S1./ZAq', 'beneficiary', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SPKGnPj7yk', '2026-08-28 06:10:52', '2026-08-28 06:11:06', 1),
	(20, 'marn', NULL, NULL, NULL, 'ron@gmail.com', '2026-09-15 03:12:25', '$2y$12$MVgGkCjTJVpUD/YL1RVofeUxWZWFg1xAliiBBTeO8pX9b69dgLxim', 'beneficiary', 'beneficiary', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ron@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, 'tdstCEfmDU', '2026-09-15 03:12:07', '2026-10-03 23:58:06', 1),
	(21, 'Test Donor', NULL, NULL, NULL, 'testdonor@example.com', NULL, '$2y$12$GtVMxCrHTZsNDp3hF46gO.Jbt/Of/mvD73qnphjIb.d3WXtdhOtzm', 'donor', NULL, '1234567890', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-16 06:01:22', '2026-09-16 06:01:22', 1),
	(22, 'Test Beneficiary', NULL, NULL, NULL, 'testbene@example.com', NULL, '$2y$12$ygyVlDtBc5bRA8Kjf0pawOJZbq5ffRGErlheLmvLaf1GlCJihhomi', 'beneficiary', NULL, '0987654321', 'STU12345', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-16 06:01:22', '2026-09-16 06:01:22', 1),
	(24, 'Other Donor', NULL, NULL, NULL, 'other@example.com', NULL, '$2y$12$hHlykG1X8PYTUV2vPo0oOOrmpRLrKI7MgIAM2AGEC95odGwof9qLm', 'donor', NULL, '1234567890-dup-24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-16 06:01:55', '2026-09-16 06:01:55', 1),
	(25, 'Other Bene', NULL, NULL, NULL, 'otherbene@example.com', NULL, '$2y$12$eqL2ByGFm6d/a0lb/kcnUeSMkdytRF3cJdRcSBQsxcFEn.m0qCXru', 'beneficiary', NULL, '1234567890-dup-25', 'STU999', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-16 06:01:55', '2026-09-16 06:01:55', 1),
	(26, 'Alex Kal', NULL, NULL, NULL, 'cadenasmarnito@gmail.com', '2026-09-16 21:17:58', '$2y$12$1/w/iv9fETx.jNvKZ7T9DeutFTN4EW0xAMzHamaPycy6Tzmf5GBh6', 'beneficiary', NULL, '+639086820599', '2026-019852', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, '31Qsr5OCHr', '2026-09-16 21:17:58', '2026-09-16 21:17:58', 1),
	(27, 'Kila Al', NULL, NULL, NULL, 'alim@gmail.com', '2026-09-16 21:29:35', '$2y$12$h76dd2Jcb5XIzxT4wuFczOw2mesLr0NUL8qQiJf3t7jQ76GX0.ora', 'beneficiary', NULL, '+639123456789', '2026-123456', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 'efCdGIYtd6', '2026-09-16 21:29:35', '2026-09-16 21:29:35', 1),
	(30, 'marnito cadenas', NULL, NULL, NULL, 'arn@gmail.com', '2026-09-17 19:05:53', '$2y$12$/TycOSG496JXf7NcdGAXSuASuXnW3b7Jk9cgoB45T4J6TFBYn77ki', 'donor', 'donor', '+639654635656', '2026-654321-DUP-30', NULL, NULL, NULL, NULL, NULL, NULL, '2026-654321-DUP-30', NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, 'Y4N1hYUdPl', '2026-09-17 19:05:53', '2026-10-02 05:44:56', 1),
	(35, 'Marnito Cadenas,Marnito Cadenas', NULL, NULL, NULL, 'marnitocadenas3@gmail.cpm', '2026-09-19 07:16:08', '$2y$12$9vpTFLj9i9.LDx5cNIi2r.QUBilXbdMf9pjd9AtKcuBLoMO2xzqlK', 'beneficiary', NULL, '+639086820596', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-123456890', 'marnitocadenas@gmail.com', 'rryr', '67', '7', 'Philippines', 'PH', NULL, 'WpXWv7oOc8', '2026-09-19 07:16:08', '2026-09-19 07:16:08', 1),
	(41, 'terv hhf', NULL, NULL, NULL, 'denas3@gmail.cpm', '2026-09-19 08:25:28', '$2y$12$xmbFOsjfWi5.4moS/1jcnuOo0MozqtZbtjUlBq5bBfaS7KG3rygWK', 'beneficiary', NULL, '+639086820595', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-123456823', 'cadenas453@gmail.com', 'it', 'it', '3', 'Philippines', 'PH', NULL, 'LpWT8AzgwN', '2026-09-19 08:25:28', '2026-09-19 08:25:28', 1),
	(42, 'alim', NULL, NULL, NULL, 'denas30@gmail.cpm', '2026-09-19 16:52:53', '$2y$12$aGe9V6w5NpRac4aOUzeAKu85tFYiZ.MEA.JdEmUtXJCpmqN0DXzf2', 'admin', NULL, '0908 682 0597', '2024-453453', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Philippines', NULL, NULL, NULL, '2026-09-19 16:52:53', '2026-09-19 16:52:53', 1),
	(44, 'poul gsgfs', NULL, NULL, NULL, 'py@gmail.cpm', '2026-09-19 19:59:45', '$2y$12$AtB3FE1sNiPskePZ4QxZRuC4Ncfx9NHTXTsFUJqERoYotLMwWt5fy', 'donor', NULL, '0908 682 0594', NULL, '2024-453458', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Philippines', NULL, NULL, 'hGy1eUUTfx', '2026-09-19 19:59:45', '2026-09-19 20:01:56', 1),
	(45, 'ger bg', NULL, NULL, NULL, 'ger@gmail.cpm', '2026-09-19 20:00:50', '$2y$12$16UhBTvY/B6o7LYJblTE5eE3.THbAcVwPQtF.g7.P8nRonnbgsZDK', 'beneficiary', NULL, '0908 682 0591', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '45645456456', 'tmv@gmail.cpm', 'fdfdfd', '987', '8', 'Philippines', NULL, NULL, NULL, '2026-09-19 20:00:50', '2026-09-19 20:00:50', 1),
	(47, 'owen', NULL, NULL, NULL, 'w@gmail.com', '2026-09-22 03:04:35', '$2y$12$KkgQVAeBEQhYaUhRjcMUcu2mv80f9Kn1ZJo3NBgUMz3MZXTLve5iq', 'admin', NULL, '254713247325456', '877666664', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Philippines', NULL, NULL, NULL, '2026-09-22 03:04:35', '2026-09-22 03:04:35', 1),
	(48, 'iuggfjsd', NULL, NULL, NULL, 'gdhvf@gmail.com', '2026-09-22 03:06:13', '$2y$12$.MDanUlXWIV8HUL.EbYpQOfQlo9CVOdcd8Xjr9mgJ6uopsv/Z7l1C', 'donor', 'donor', '8743657346', '67', 'guinobatan', NULL, NULL, NULL, NULL, NULL, '67', NULL, NULL, NULL, NULL, NULL, NULL, 'Philippines', NULL, NULL, NULL, '2026-09-22 03:06:13', '2026-10-08 05:53:58', 1),
	(49, 'Jordan Reyes', NULL, NULL, NULL, 'jordan.reyes.preview@relieflink.test', NULL, '$2y$12$dy/hiE2hdfVTjv98BlgvH.Xe8Fo85GmaD13XM8YhzwgFJsrw5fkIu', 'donor', 'donor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Student Affairs', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-02 21:02:33', '2026-10-08 05:53:38', 1),
	(50, 'Maya Santos', NULL, NULL, NULL, 'maya.santos.preview@relieflink.test', NULL, '$2y$12$JSp7lsZcAiXfUYfKjJjjguu6BMwKIS.b8.52nWLROPYMPyrOWSApm', 'beneficiary', 'beneficiary', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'maya.santos.preview@relieflink.test', 'Engineering', 'BS Information Technology', '2nd Year', NULL, NULL, NULL, NULL, '2026-10-02 21:02:34', '2026-10-02 21:02:34', 1),
	(51, 'cvc cxvcx xcv', 'cvc', 'cxvcx', 'xcv', 'marnit@gmail.com', '2026-10-08 06:57:59', '$2y$12$HSQ.pwGmKJKDRSvjw61ZpOADo5lqDv9AAyysi2utXMxc8jMv0ZfsC', 'donor', 'donor', '+639086825655', '46456666666', NULL, 'gdf,vbdf', 'bohol', 'bohol', 'guinochc', '6324', '46456666666', 'National Identity Card', NULL, NULL, NULL, NULL, NULL, 'Philippines', 'PH', NULL, 'X3J3oGscFi', '2026-10-08 06:57:59', '2026-10-08 06:57:59', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
