-- Script d'initialisation PostgreSQL
-- Projet FitTrack

-- Nettoyage
DROP TABLE IF EXISTS exercice_muscle CASCADE;
DROP TABLE IF EXISTS seance_exercice CASCADE;
DROP TABLE IF EXISTS seance_type CASCADE;
DROP TABLE IF EXISTS user_programme CASCADE;
DROP TABLE IF EXISTS programme CASCADE;
DROP TABLE IF EXISTS suivi CASCADE;
DROP TABLE IF EXISTS exercice CASCADE;
DROP TABLE IF EXISTS muscle CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;

-- Tables

CREATE TABLE utilisateur (
    id               SERIAL PRIMARY KEY,
    nom              VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    date_naissance   DATE,
    poids_kg         FLOAT,
    taille_cm        FLOAT,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suivi (
    id         SERIAL PRIMARY KEY,
    source_id  INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    cible_id   INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE programme (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    nom            VARCHAR(150) NOT NULL,
    description    TEXT,
    actif          BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_programme (
    id             SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    programme_id   INT NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
    date_debut     DATE NOT NULL,
    date_fin       DATE
);

CREATE TABLE seance_type (
    id           SERIAL PRIMARY KEY,
    programme_id INT NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
    nom          VARCHAR(150) NOT NULL,
    ordre        INT DEFAULT 1,
    jour_semaine VARCHAR(20)
);

CREATE TABLE muscle (
    id     SERIAL PRIMARY KEY,
    nom    VARCHAR(100) NOT NULL,
    groupe VARCHAR(100) NOT NULL
);

CREATE TABLE exercice (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(150) NOT NULL,
    type        VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE exercice_muscle (
    exercice_id INT NOT NULL REFERENCES exercice(id) ON DELETE CASCADE,
    muscle_id   INT NOT NULL REFERENCES muscle(id) ON DELETE CASCADE,
    role        VARCHAR(50) DEFAULT 'principal',
    PRIMARY KEY (exercice_id, muscle_id)
);

CREATE TABLE seance_exercice (
    id             SERIAL PRIMARY KEY,
    seance_type_id INT NOT NULL REFERENCES seance_type(id) ON DELETE CASCADE,
    exercice_id    INT NOT NULL REFERENCES exercice(id) ON DELETE CASCADE,
    series_cible   INT DEFAULT 3,
    reps_cible     INT,
    poids_cible_kg FLOAT,
    ordre          INT DEFAULT 1
);

-- Index
CREATE INDEX idx_programme_user ON programme(utilisateur_id);
CREATE INDEX idx_seance_programme ON seance_type(programme_id);

-- Vue 1 : voir les programmes avec leur créateur
CREATE VIEW v_programmes AS
SELECT p.id, p.nom, p.actif, u.nom AS createur, p.created_at
FROM programme p
JOIN utilisateur u ON u.id = p.utilisateur_id;

-- Vue 2 : voir les abonnés d'un utilisateur
CREATE VIEW v_abonnes AS
SELECT s.cible_id, u1.nom AS abonne, u2.nom AS suit
FROM suivi s
JOIN utilisateur u1 ON u1.id = s.source_id
JOIN utilisateur u2 ON u2.id = s.cible_id;

-- Trigger : empêcher de se suivre soi-même
CREATE OR REPLACE FUNCTION check_suivi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.source_id = NEW.cible_id THEN
        RAISE EXCEPTION 'Un utilisateur ne peut pas se suivre lui-même';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_suivi
BEFORE INSERT ON suivi
FOR EACH ROW EXECUTE FUNCTION check_suivi();

-- Trigger : updated_at automatique sur utilisateur
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Procédure : inscrire un utilisateur à un programme
CREATE OR REPLACE FUNCTION inscrire_au_programme(p_user INT, p_prog INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_programme (utilisateur_id, programme_id, date_debut)
    VALUES (p_user, p_prog, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Procédure : désactiver un programme
CREATE OR REPLACE FUNCTION desactiver_programme(p_prog INT)
RETURNS VOID AS $$
BEGIN
    UPDATE programme SET actif = FALSE WHERE id = p_prog;
END;
$$ LANGUAGE plpgsql;

-- Procédure : nombre de programmes d'un utilisateur
CREATE OR REPLACE FUNCTION nb_programmes(p_user INT)
RETURNS INT AS $$
DECLARE
    total INT;
BEGIN
    SELECT COUNT(*) INTO total
    FROM user_programme
    WHERE utilisateur_id = p_user;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Transaction exemple
BEGIN;
    INSERT INTO utilisateur (nom, email, mot_de_passe_hash)
    VALUES ('Test User', 'test@demo.fr', 'hash_exemple');
    INSERT INTO programme (utilisateur_id, nom, description)
    VALUES (currval('utilisateur_id_seq'), 'Programme test', 'Un programme de test');
COMMIT;

-- Données de démo

INSERT INTO utilisateur (nom, email, mot_de_passe_hash, date_naissance, poids_kg, taille_cm) VALUES
('Alice Martin',  'alice@demo.fr', 'hashed_password', '1995-03-14', 62.5, 168.0),
('Bob Dupont',    'bob@demo.fr',   'hashed_password', '1990-07-22', 80.0, 180.5),
('Clara Lefevre', 'clara@demo.fr', 'hashed_password', '1998-11-05', 55.0, 162.0);

INSERT INTO suivi (source_id, cible_id) VALUES (1, 2), (2, 1), (3, 1);

INSERT INTO muscle (nom, groupe) VALUES
('Quadriceps',  'Jambes'),
('Pectoraux',   'Poitrine'),
('Dorsaux',     'Dos'),
('Biceps',      'Bras'),
('Abdominaux',  'Tronc');

INSERT INTO exercice (nom, type, description) VALUES
('Squat barre',      'force',  'Squat classique avec barre'),
('Développé couché', 'force',  'Exercice de poitrine sur banc'),
('Tractions',        'force',  'Tractions à la barre fixe'),
('Course à pied',    'cardio', 'Course en endurance'),
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

-- Requête complexe (pour la soutenance)
-- Programmes avec nombre d'inscrits et d'exercices
SELECT
    p.nom AS programme,
    u.nom AS createur,
    COUNT(DISTINCT up.utilisateur_id) AS nb_inscrits,
    COUNT(DISTINCT se.exercice_id)    AS nb_exercices
FROM programme p
JOIN utilisateur u         ON u.id = p.utilisateur_id
JOIN user_programme up     ON up.programme_id = p.id
JOIN seance_type st        ON st.programme_id = p.id
JOIN seance_exercice se    ON se.seance_type_id = st.id
WHERE p.actif = TRUE
GROUP BY p.id, p.nom, u.nom
HAVING COUNT(DISTINCT up.utilisateur_id) >= 1
ORDER BY nb_inscrits DESC;
