-- Script safe : ne reinsere pas si deja existant

-- Muscles
INSERT INTO muscle (name, group_name)
SELECT 'Triceps', 'Arms' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Triceps');
INSERT INTO muscle (name, group_name)
SELECT 'Deltoids', 'Shoulders' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Deltoids');
INSERT INTO muscle (name, group_name)
SELECT 'Hamstrings', 'Legs' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Hamstrings');
INSERT INTO muscle (name, group_name)
SELECT 'Glutes', 'Legs' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Glutes');
INSERT INTO muscle (name, group_name)
SELECT 'Calves', 'Legs' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Calves');
INSERT INTO muscle (name, group_name)
SELECT 'Traps', 'Back' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Traps');
INSERT INTO muscle (name, group_name)
SELECT 'Lower Back', 'Back' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM muscle WHERE name = 'Lower Back');

-- Exercises
INSERT INTO exercise (name, type, description)
SELECT 'Overhead Press', 'strength', 'Press the barbell from shoulders to overhead. Keep your core tight.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Overhead Press');
INSERT INTO exercise (name, type, description)
SELECT 'Dips', 'strength', 'Lower your body between two parallel bars, elbows close to body.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Dips');
INSERT INTO exercise (name, type, description)
SELECT 'Barbell Row', 'strength', 'Pull the barbell towards your lower chest. Keep your back flat.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Barbell Row');
INSERT INTO exercise (name, type, description)
SELECT 'Deadlift', 'strength', 'Lift the barbell from the floor to hip height. Keep the bar close.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Deadlift');
INSERT INTO exercise (name, type, description)
SELECT 'Romanian Deadlift', 'strength', 'Hinge at the hips, bar slides down legs. Feel the hamstring stretch.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Romanian Deadlift');
INSERT INTO exercise (name, type, description)
SELECT 'Leg Press', 'strength', 'Push the platform away with your legs. Do not lock knees fully.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Leg Press');
INSERT INTO exercise (name, type, description)
SELECT 'Lunges', 'strength', 'Step forward and lower your back knee towards the ground.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Lunges');
INSERT INTO exercise (name, type, description)
SELECT 'Bicep Curl', 'strength', 'Curl the bar or dumbbells towards your shoulders. Control the descent.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Bicep Curl');
INSERT INTO exercise (name, type, description)
SELECT 'Tricep Pushdown', 'strength', 'Push the cable bar downward. Keep your elbows fixed at your sides.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Tricep Pushdown');
INSERT INTO exercise (name, type, description)
SELECT 'Lateral Raise', 'strength', 'Raise dumbbells to shoulder height with slightly bent elbows.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Lateral Raise');
INSERT INTO exercise (name, type, description)
SELECT 'Calf Raise', 'strength', 'Rise onto your toes. Hold at the top for one second.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Calf Raise');
INSERT INTO exercise (name, type, description)
SELECT 'Incline Bench Press', 'strength', 'Bench press on an inclined bench. Targets the upper chest.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Incline Bench Press');
INSERT INTO exercise (name, type, description)
SELECT 'Face Pull', 'strength', 'Pull the rope towards your face. Great for shoulder health.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Face Pull');
INSERT INTO exercise (name, type, description)
SELECT 'Leg Curl', 'strength', 'Curl your legs towards your glutes on the machine.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM exercise WHERE name = 'Leg Curl');

-- Liaisons exercise_muscle (safe aussi)
INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Overhead Press' AND m.name = 'Deltoids'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Overhead Press' AND m.name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Dips' AND m.name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Dips' AND m.name = 'Pectorals'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Barbell Row' AND m.name = 'Lats'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Barbell Row' AND m.name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Barbell Row' AND m.name = 'Traps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Deadlift' AND m.name = 'Lower Back'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Deadlift' AND m.name = 'Hamstrings'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Deadlift' AND m.name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Deadlift' AND m.name = 'Traps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Romanian Deadlift' AND m.name = 'Hamstrings'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Romanian Deadlift' AND m.name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Leg Press' AND m.name = 'Quadriceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Leg Press' AND m.name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Lunges' AND m.name = 'Quadriceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Lunges' AND m.name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Lunges' AND m.name = 'Hamstrings'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Bicep Curl' AND m.name = 'Biceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Tricep Pushdown' AND m.name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Lateral Raise' AND m.name = 'Deltoids'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Calf Raise' AND m.name = 'Calves'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Incline Bench Press' AND m.name = 'Pectorals'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Incline Bench Press' AND m.name = 'Deltoids'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Face Pull' AND m.name = 'Deltoids'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Face Pull' AND m.name = 'Traps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'primary' FROM exercise e, muscle m
WHERE e.name = 'Leg Curl' AND m.name = 'Hamstrings'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Barbell Squat' AND m.name = 'Glutes'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Bench Press' AND m.name = 'Triceps'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);

INSERT INTO exercise_muscle (exercise_id, muscle_id, role)
SELECT e.id, m.id, 'secondary' FROM exercise e, muscle m
WHERE e.name = 'Bench Press' AND m.name = 'Deltoids'
AND NOT EXISTS (SELECT 1 FROM exercise_muscle WHERE exercise_id = e.id AND muscle_id = m.id);
