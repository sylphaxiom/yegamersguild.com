CREATE TABLE `content` (
    `content_key` varchar(100) NOT NULL,
    `value` text,
    `label` varchar(100) NOT NULL,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`content_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `content_images` (
    `id` int NOT NULL AUTO_INCREMENT,
    `content_key` varchar(100) NOT NULL,
    `short_name` varchar(50) NOT NULL,
    `src` varchar(255) NOT NULL,
    `alt` varchar(255) DEFAULT NULL,
    `display_order` int DEFAULT '0',
    `width` int DEFAULT NULL,
    `height` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 22 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `decrypt` (
    `owner` varchar(25) NOT NULL,
    `cipher` varchar(32) NOT NULL,
    `a_iv` blob NOT NULL,
    `r_iv` blob NOT NULL,
    `a_tag` blob NOT NULL,
    `r_tag` blob NOT NULL,
    PRIMARY KEY (`owner`),
    CONSTRAINT `linkage` FOREIGN KEY (`owner`) REFERENCES `token` (`merchantName`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `start_datetime` DATETIME NOT NULL,
    `end_datetime` DATETIME DEFAULT NULL,
    `all_day` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `token` (
    `access` text NOT NULL,
    `refresh` text NOT NULL,
    `expires` varchar(25) NOT NULL,
    `merchantId` text NOT NULL,
    `merchantName` varchar(25) NOT NULL,
    PRIMARY KEY (`merchantName`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci