CREATE TABLE IF NOT EXISTS session (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    title            VARCHAR(150) NOT NULL,
    date             DATE NOT NULL,
    duration_minutes INT,
    notes            TEXT,
    created_at       DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_exercise (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    session_id    INT NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    sets          INT NOT NULL,
    reps          INT,
    weight_kg     FLOAT,
    FOREIGN KEY (session_id) REFERENCES session(id) ON DELETE CASCADE
);
