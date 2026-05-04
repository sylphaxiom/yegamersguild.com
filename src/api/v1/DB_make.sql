CREATE TABLE `decrypt` (
    `owner` varchar(25) NOT NULL,
    `cipher` binary(1) NOT NULL,
    `iv` binary(1) NOT NULL,
    `tag` binary(1) NOT NULL,
    PRIMARY KEY (`owner`),
    CONSTRAINT `linkage` FOREIGN KEY (`owner`) REFERENCES `token` (`merchantName`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE `token` (
    `access` text NOT NULL,
    `refresh` text NOT NULL,
    `expires` varchar(25) NOT NULL,
    `merchantId` text NOT NULL,
    `merchantName` varchar(25) NOT NULL,
    PRIMARY KEY (`merchantName`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci