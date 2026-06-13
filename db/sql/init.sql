SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS exercise_muscle;
DROP TABLE IF EXISTS workout_exercise;
DROP TABLE IF EXISTS workout_type;
DROP TABLE IF EXISTS user_program;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS session_exercise;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS follow;
DROP TABLE IF EXISTS exercise;
DROP TABLE IF EXISTS muscle;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- TABLES
-- --------------------------------------------------------

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    birthdate     DATE,
    weight_kg     FLOAT,
    height_cm     FLOAT,
    is_admin      BOOLEAN DEFAULT FALSE,
    created_at    DATETIME DEFAULT NOW()
);

CREATE TABLE follow (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    source_id   INT NOT NULL,
    target_id   INT NOT NULL,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (source_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE
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

CREATE TABLE program (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    active      BOOLEAN DEFAULT TRUE,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_program (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    program_id  INT NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE,
    FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE CASCADE,
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

CREATE TABLE session (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    title            VARCHAR(150) NOT NULL,
    date             DATE NOT NULL,
    duration_minutes INT,
    notes            TEXT,
    created_at       DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE session_exercise (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    session_id    INT NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    sets          INT NOT NULL,
    reps          INT,
    weight_kg     FLOAT,
    FOREIGN KEY (session_id) REFERENCES session(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- INDEX
-- --------------------------------------------------------

CREATE INDEX idx_program_user    ON program(user_id);
CREATE INDEX idx_workout_program ON workout_type(program_id);
CREATE INDEX idx_follow_source   ON follow(source_id);
CREATE INDEX idx_follow_target   ON follow(target_id);
CREATE INDEX idx_session_user    ON session(user_id);
CREATE INDEX idx_session_date    ON session(date);

-- --------------------------------------------------------
-- VUES
-- --------------------------------------------------------

CREATE VIEW v_programs AS
SELECT p.id, p.name, p.active, u.name AS creator, p.created_at
FROM program p
JOIN users u ON u.id = p.user_id;

CREATE VIEW v_followers AS
SELECT u1.name AS follower, u2.name AS following
FROM follow f
JOIN users u1 ON u1.id = f.source_id
JOIN users u2 ON u2.id = f.target_id;

-- --------------------------------------------------------
-- TRIGGERS
-- --------------------------------------------------------

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
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- --------------------------------------------------------
-- PROCEDURES STOCKEES
-- --------------------------------------------------------

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

-- --------------------------------------------------------
-- DONNEES DE DEMO
-- --------------------------------------------------------

INSERT INTO users (name, email, password_hash, birthdate, weight_kg, height_cm, is_admin) VALUES
('Alice Martin',  'alice@demo.com',  'demo_hash', '1995-03-14', 62.5, 168.0, FALSE),
('Bob Dupont',    'bob@demo.com',    'demo_hash', '1990-07-22', 80.0, 180.5, FALSE),
('Clara Lefevre', 'clara@demo.com',  'demo_hash', '1998-11-05', 55.0, 162.0, FALSE);

INSERT INTO follow (source_id, target_id) VALUES (1, 2), (2, 1), (3, 1);

INSERT INTO muscle (name, group_name) VALUES
('Quadriceps', 'Legs'),
('Pectorals',  'Chest'),
('Lats',       'Back'),
('Biceps',     'Arms'),
('Abs',        'Core'),
('Triceps',    'Arms'),
('Deltoids',   'Shoulders'),
('Hamstrings', 'Legs'),
('Glutes',     'Legs'),
('Calves',     'Legs'),
('Traps',      'Back'),
('Lower Back', 'Back');

INSERT INTO exercise (name, type, description) VALUES
('Barbell Squat',      'strength', 'Classic squat with barbell on upper back. Keep chest up.'),
('Bench Press',        'strength', 'Chest exercise on flat bench. Bar touches mid-chest.'),
('Pull Ups',           'strength', 'Bodyweight back exercise. Full range of motion.'),
('Overhead Press',     'strength', 'Press the barbell from shoulders to overhead. Keep core tight.'),
('Deadlift',           'strength', 'Lift the barbell from the floor to hip height. Keep the bar close.'),
('Romanian Deadlift',  'strength', 'Hinge at the hips, bar slides down legs. Feel the hamstring stretch.'),
('Barbell Row',        'strength', 'Pull the barbell towards your lower chest. Keep your back flat.'),
('Dips',               'strength', 'Lower your body between two parallel bars, elbows close to body.'),
('Bicep Curl',         'strength', 'Curl the bar or dumbbells towards your shoulders. Control the descent.'),
('Tricep Pushdown',    'strength', 'Push the cable bar downward. Keep your elbows fixed at your sides.'),
('Lateral Raise',      'strength', 'Raise dumbbells to shoulder height with slightly bent elbows.'),
('Leg Press',          'strength', 'Push the platform away with your legs. Do not lock knees fully.'),
('Lunges',             'strength', 'Step forward and lower your back knee towards the ground.'),
('Calf Raise',         'strength', 'Rise onto your toes. Hold at the top for one second.'),
('Incline Bench Press','strength', 'Bench press on an inclined bench. Targets the upper chest.'),
('Face Pull',          'strength', 'Pull the rope towards your face. Great for shoulder health.'),
('Leg Curl',           'strength', 'Curl your legs towards your glutes on the machine.'),
('Running',            'cardio',   'Endurance running at steady pace.'),
('Plank',              'mobility', 'Core isometric exercise. Keep body straight.');

INSERT INTO exercise_muscle (exercise_id, muscle_id, role) VALUES
(1, 1, 'primary'),  -- Squat -> Quadriceps
(1, 9, 'secondary'),-- Squat -> Glutes
(2, 2, 'primary'),  -- Bench Press -> Pectorals
(2, 6, 'secondary'),-- Bench Press -> Triceps
(2, 7, 'secondary'),-- Bench Press -> Deltoids
(3, 3, 'primary'),  -- Pull Ups -> Lats
(3, 4, 'secondary'),-- Pull Ups -> Biceps
(4, 7, 'primary'),  -- OHP -> Deltoids
(4, 6, 'secondary'),-- OHP -> Triceps
(5, 12,'primary'),  -- Deadlift -> Lower Back
(5, 8, 'primary'),  -- Deadlift -> Hamstrings
(5, 9, 'secondary'),-- Deadlift -> Glutes
(5, 11,'secondary'),-- Deadlift -> Traps
(6, 8, 'primary'),  -- RDL -> Hamstrings
(6, 9, 'primary'),  -- RDL -> Glutes
(7, 3, 'primary'),  -- Barbell Row -> Lats
(7, 4, 'secondary'),-- Barbell Row -> Biceps
(7, 11,'secondary'),-- Barbell Row -> Traps
(8, 6, 'primary'),  -- Dips -> Triceps
(8, 2, 'secondary'),-- Dips -> Pectorals
(9, 4, 'primary'),  -- Bicep Curl -> Biceps
(10,6, 'primary'),  -- Tricep Pushdown -> Triceps
(11,7, 'primary'),  -- Lateral Raise -> Deltoids
(12,1, 'primary'),  -- Leg Press -> Quadriceps
(12,9, 'secondary'),-- Leg Press -> Glutes
(13,1, 'primary'),  -- Lunges -> Quadriceps
(13,9, 'primary'),  -- Lunges -> Glutes
(13,8, 'secondary'),-- Lunges -> Hamstrings
(14,10,'primary'),  -- Calf Raise -> Calves
(15,2, 'primary'),  -- Incline BP -> Pectorals
(15,7, 'secondary'),-- Incline BP -> Deltoids
(16,7, 'primary'),  -- Face Pull -> Deltoids
(16,11,'secondary'),-- Face Pull -> Traps
(17,8, 'primary');  -- Leg Curl -> Hamstrings

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

-- --------------------------------------------------------
-- REQUETE COMPLEXE (exemple / documentation)
-- Programmes actifs avec nb participants et nb exercices
-- --------------------------------------------------------

SELECT
    p.name                           AS programme,
    u.name                           AS createur,
    COUNT(DISTINCT up.user_id)       AS nb_participants,
    COUNT(DISTINCT we.exercise_id)   AS nb_exercices
FROM program p
JOIN users u              ON u.id = p.user_id
JOIN user_program up      ON up.program_id = p.id
JOIN workout_type wt      ON wt.program_id = p.id
JOIN workout_exercise we  ON we.workout_type_id = wt.id
WHERE p.active = TRUE
GROUP BY p.id, p.name, u.name
HAVING COUNT(DISTINCT up.user_id) >= 1
ORDER BY nb_participants DESC;
