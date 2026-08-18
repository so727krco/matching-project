UPDATE manager SET name = CONCAT('매니저', CHAR(64 + id - 61)) WHERE id >= 62;
