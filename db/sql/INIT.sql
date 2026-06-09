SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS exercise_muscle;
DROP TABLE IF EXISTS workout_exercise;
DROP TABLE IF EXISTS workout_type;
DROP TABLE IF EXISTS user_program;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS follow;
DROP TABLE IF EXISTS exercise;
DROP TABLE IF EXISTS muscle;
DROP TABLE IF EXISTS user;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    birthdate     DATE,
    weight_kg     FLOAT,
    height_cm     FLOAT,
    created_at    DATETIME DEFAULT NOW()
);

CREATE TABLE follow (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    source_id   INT NOT NULL,
    target_id   INT NOT NULL,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (source_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE program (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    active      BOOLEAN DEFAULT TRUE,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE user_program (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    program_id  INT NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE,
    FOREIGN KEY (user_id)    REFERENCES user(id)    ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE
);

CREATE TABLE workout_type (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    program_id  INT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    order_index INT DEFAULT 1,
    week_day    VARCHAR(20),
    FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE
);

CREATE TABLE muscle (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    group_name  VARCHAR(100) NOT NULL
);

CREATE TABLE exercise (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    type        VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE exercise_muscle (
    exercise_id INT NOT NULL,
    muscle_id   INT NOT NULL,
    role        VARCHAR(50) DEFAULT 'primary',
    PRIMARY KEY (exercise_id, muscle_id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_id)   REFERENCES muscle(id)   ON DELETE CASCADE
);

CREATE TABLE workout_exercise (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    workout_type_id INT NOT NULL,
    exercise_id     INT NOT NULL,
    target_sets     INT DEFAULT 3,
    target_reps     INT,
    target_weight   FLOAT,
    order_index     INT DEFAULT 1,
    FOREIGN KEY (workout_type_id) REFERENCES workout_type(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id)     REFERENCES exercise(id)     ON DELETE CASCADE
);

CREATE INDEX idx_program_user    ON program(user_id);
CREATE INDEX idx_workout_program ON workout_type(program_id);
CREATE INDEX idx_follow_source   ON follow(source_id);
CREATE INDEX idx_follow_target   ON follow(target_id);

CREATE VIEW v_programs AS
SELECT p.id, p.name, p.active, u.name AS creator, p.created_at
FROM program p
JOIN user u ON u.id = p.user_id;

CREATE VIEW v_followers AS
SELECT u1.name AS follower, u2.name AS following
FROM follow f
JOIN user u1 ON u1.id = f.source_id
JOIN user u2 ON u2.id = f.target_id;

DELIMITER $$
CREATE TRIGGER trg_check_follow
BEFORE INSERT ON follow
FOR EACH ROW
BEGIN
    IF NEW.source_id = NEW.target_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A user cannot follow themselves';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_updated_at_user
BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    SET NEW.created_at = NOW();
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE join_program(IN p_user INT, IN p_program INT)
BEGIN
    INSERT INTO user_program (user_id, program_id, start_date)
    VALUES (p_user, p_program, CURDATE());
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE deactivate_program(IN p_program INT)
BEGIN
    UPDATE program SET active = FALSE WHERE id = p_program;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE count_programs(IN p_user INT)
BEGIN
    SELECT COUNT(*) AS total
    FROM user_program
    WHERE user_id = p_user;
END$$
DELIMITER ;

INSERT INTO user (name, email, password_hash, birthdate, weight_kg, height_cm) VALUES
('Alice Martin',  'alice@demo.com', 'hashed_password', '1995-03-14', 62.5, 168.0),
('Bob Dupont',    'bob@demo.com',   'hashed_password', '1990-07-22', 80.0, 180.5),
('Clara Lefevre', 'clara@demo.com', 'hashed_password', '1998-11-05', 55.0, 162.0);

INSERT INTO follow (source_id, target_id) VALUES (1, 2), (2, 1), (3, 1);

INSERT INTO muscle (name, group_name) VALUES
('Quadriceps', 'Legs'),
('Pectorals',  'Chest'),
('Lats',       'Back'),
('Biceps',     'Arms'),
('Abs',        'Core');

INSERT INTO exercise (name, type, description) VALUES
('Barbell Squat',    'strength', 'Classic squat with barbell'),
('Bench Press',      'strength', 'Chest exercise on flat bench'),
('Pull Ups',         'strength', 'Bodyweight back exercise'),
('Running',          'cardio',   'Endurance running'),
('Plank',            'mobility', 'Core isometric exercise');

INSERT INTO exercise_muscle (exercise_id, muscle_id, role) VALUES
(1, 1, 'primary'),
(2, 2, 'primary'),
(3, 3, 'primary'),
(3, 4, 'secondary');

INSERT INTO program (user_id, name, description) VALUES
(2, 'PPL Beginner', 'Push Pull Legs 3 days a week'),
(1, 'Full Body',    'Full body workout 3 times a week');

INSERT INTO user_program (user_id, program_id, start_date) VALUES
(1, 1, '2026-01-15'),
(2, 1, '2026-01-15'),
(3, 2, '2026-02-01');

INSERT INTO workout_type (program_id, name, order_index, week_day) VALUES
(1, 'Push', 1, 'Monday'),
(1, 'Pull', 2, 'Wednesday'),
(1, 'Legs', 3, 'Friday');

INSERT INTO workout_exercise (workout_type_id, exercise_id, target_sets, target_reps, target_weight, order_index) VALUES
(1, 2, 4, 10, 60.0, 1),
(2, 3, 4, 8,  NULL, 1),
(3, 1, 4, 8,  80.0, 1);

SELECT
    p.name AS program,
    u.name AS creator,
    COUNT(DISTINCT up.user_id)      AS nb_users,
    COUNT(DISTINCT we.exercise_id)  AS nb_exercises
FROM program p
JOIN user u             ON u.id = p.user_id
JOIN user_program up    ON up.program_id = p.id
JOIN workout_type wt    ON wt.program_id = p.id
JOIN workout_exercise we ON we.workout_type_id = wt.id
WHERE p.active = TRUE
GROUP BY p.id, p.name, u.name
HAVING COUNT(DISTINCT up.user_id) >= 1
ORDER BY nb_users DESC;
