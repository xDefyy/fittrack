
-- Nettoyage
DROP TABLE IF EXISTS exercice_muscle;
DROP TABLE IF EXISTS seance_exercice;
DROP TABLE IF EXISTS seance_type;
DROP TABLE IF EXISTS user_programme;
DROP TABLE IF EXISTS programme;
DROP TABLE IF EXISTS suivi;
DROP TABLE IF EXISTS exercice;
DROP TABLE IF EXISTS muscle;
DROP TABLE IF EXISTS utilisateur;

-- Tables

CREATE TABLE utilisateur (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nom               VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    date_naissance    DATE,
    poids_kg          FLOAT,
    taille_cm         FLOAT,
    created_at        DATETIME DEFAULT NOW()
);

CREATE TABLE suivi (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    source_id  INT NOT NULL,
    cible_id   INT NOT NULL,
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (source_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (cible_id)  REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE programme (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom            VARCHAR(150) NOT NULL,
    description    TEXT,
    actif          BOOLEAN DEFAULT TRUE,
    created_at     DATETIME DEFAULT NOW(),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE user_programme (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    programme_id   INT NOT NULL,
    date_debut     DATE NOT NULL,
    date_fin       DATE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id)   REFERENCES programme(id)   ON DELETE CASCADE
);

CREATE TABLE seance_type (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    programme_id INT NOT NULL,
    nom          VARCHAR(150) NOT NULL,
    ordre        INT DEFAULT 1,
    jour_semaine VARCHAR(20),
    FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE
);

CREATE TABLE muscle (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nom    VARCHAR(100) NOT NULL,
    groupe VARCHAR(100) NOT NULL
);

CREATE TABLE exercice (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(150) NOT NULL,
    type        VARCHAR(50)  NOT NULL,
    description TEXT
);

CREATE TABLE exercice_muscle (
    exercice_id INT NOT NULL,
    muscle_id   INT NOT NULL,
    role        VARCHAR(50) DEFAULT 'principal',
    PRIMARY KEY (exercice_id, muscle_id),
    FOREIGN KEY (exercice_id) REFERENCES exercice(id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_id)   REFERENCES muscle(id)   ON DELETE CASCADE
);

CREATE TABLE seance_exercice (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    seance_type_id INT NOT NULL,
    exercice_id    INT NOT NULL,
    series_cible   INT DEFAULT 3,
    reps_cible     INT,
    poids_cible_kg FLOAT,
    ordre          INT DEFAULT 1,
    FOREIGN KEY (seance_type_id) REFERENCES seance_type(id) ON DELETE CASCADE,
    FOREIGN KEY (exercice_id)    REFERENCES exercice(id)    ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_programme_user    ON programme(utilisateur_id);
CREATE INDEX idx_seance_programme  ON seance_type(programme_id);
CREATE INDEX idx_suivi_source      ON suivi(source_id);
CREATE INDEX idx_suivi_cible       ON suivi(cible_id);

-- Vue 1 : programmes avec leur créateur
CREATE VIEW v_programmes AS
SELECT p.id, p.nom, p.actif, u.nom AS createur, p.created_at
FROM programme p
JOIN utilisateur u ON u.id = p.utilisateur_id;

-- Vue 2 : abonnements entre utilisateurs
CREATE VIEW v_abonnes AS
SELECT u1.nom AS abonne, u2.nom AS suit
FROM suivi s
JOIN utilisateur u1 ON u1.id = s.source_id
JOIN utilisateur u2 ON u2.id = s.cible_id;

-- Trigger 1 : empêcher de se suivre soi-même
DELIMITER $$
CREATE TRIGGER trg_check_suivi
BEFORE INSERT ON suivi
FOR EACH ROW
BEGIN
    IF NEW.source_id = NEW.cible_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un utilisateur ne peut pas se suivre lui-même';
    END IF;
END$$
DELIMITER ;

-- Trigger 2 : updated_at sur utilisateur
DELIMITER $$
CREATE TRIGGER trg_updated_at_utilisateur
BEFORE UPDATE ON utilisateur
FOR EACH ROW
BEGIN
    SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- Procédure 1 : inscrire un utilisateur à un programme
DELIMITER $$
CREATE PROCEDURE inscrire_au_programme(IN p_user INT, IN p_prog INT)
BEGIN
    INSERT INTO user_programme (utilisateur_id, programme_id, date_debut)
    VALUES (p_user, p_prog, CURDATE());
END$$
DELIMITER ;

-- Procédure 2 : désactiver un programme
DELIMITER $$
CREATE PROCEDURE desactiver_programme(IN p_prog INT)
BEGIN
    UPDATE programme SET actif = FALSE WHERE id = p_prog;
END$$
DELIMITER ;

-- Procédure 3 : nombre de programmes d'un utilisateur
DELIMITER $$
CREATE PROCEDURE nb_programmes(IN p_user INT)
BEGIN
    SELECT COUNT(*) AS total
    FROM user_programme
    WHERE utilisateur_id = p_user;
END$$
DELIMITER ;

-- Transaction exemple
START TRANSACTION;
    INSERT INTO utilisateur (nom, email, mot_de_passe_hash)
    VALUES ('Admin', 'admin@fittrack.fr', 'hashed_password');
COMMIT;

-- Données de démo
INSERT INTO utilisateur (nom, email, mot_de_passe_hash, date_naissance, poids_kg, taille_cm) VALUES
('Alice Martin',  'alice@demo.fr', 'hashed_password', '1995-03-14', 62.5, 168.0),
('Bob Dupont',    'bob@demo.fr',   'hashed_password', '1990-07-22', 80.0, 180.5),
('Clara Lefevre', 'clara@demo.fr', 'hashed_password', '1998-11-05', 55.0, 162.0);

INSERT INTO suivi (source_id, cible_id) VALUES (1, 2), (2, 1), (3, 1);

INSERT INTO muscle (nom, groupe) VALUES
('Quadriceps', 'Jambes'),
('Pectoraux',  'Poitrine'),
('Dorsaux',    'Dos'),
('Biceps',     'Bras'),
('Abdominaux', 'Tronc');

INSERT INTO exercice (nom, type, description) VALUES
('Squat barre',      'force',    'Squat classique avec barre'),
('Développé couché', 'force',    'Exercice de poitrine sur banc'),
('Tractions',        'force',    'Tractions à la barre fixe'),
('Course à pied',    'cardio',   'Course en endurance'),
('Gainage',          'mobilite', 'Planche abdominale');

INSERT INTO exercice_muscle (exercice_id, muscle_id, role) VALUES
(1, 1, 'principal'),
(2, 2, 'principal'),
(3, 3, 'principal'),
(3, 4, 'secondaire');

INSERT INTO programme (utilisateur_id, nom, description) VALUES
(2, 'PPL Débutant', 'Push Pull Legs sur 3 jours'),
(1, 'Full Body',    'Séance complète 3 fois par semaine');

INSERT INTO user_programme (utilisateur_id, programme_id, date_debut) VALUES
(1, 1, '2026-01-15'),
(2, 1, '2026-01-15'),
(3, 2, '2026-02-01');

INSERT INTO seance_type (programme_id, nom, ordre, jour_semaine) VALUES
(1, 'Push', 1, 'Lundi'),
(1, 'Pull', 2, 'Mercredi'),
(1, 'Legs', 3, 'Vendredi');

INSERT INTO seance_exercice (seance_type_id, exercice_id, series_cible, reps_cible, poids_cible_kg, ordre) VALUES
(1, 2, 4, 10, 60.0, 1),
(2, 3, 4, 8,  NULL, 1),
(3, 1, 4, 8,  80.0, 1);

-- Requête complexe pour la soutenance
SELECT
    p.nom AS programme,
    u.nom AS createur,
    COUNT(DISTINCT up.utilisateur_id) AS nb_inscrits,
    COUNT(DISTINCT se.exercice_id)    AS nb_exercices
FROM programme p
JOIN utilisateur u      ON u.id = p.utilisateur_id
JOIN user_programme up  ON up.programme_id = p.id
JOIN seance_type st     ON st.programme_id = p.id
JOIN seance_exercice se ON se.seance_type_id = st.id
WHERE p.actif = TRUE
GROUP BY p.id, p.nom, u.nom
HAVING COUNT(DISTINCT up.utilisateur_id) >= 1
ORDER BY nb_inscrits DESC;
