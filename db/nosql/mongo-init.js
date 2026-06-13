// MongoDB initialization script — FitTrack
// Collection: workout_logs
// Stores one document per exercise per session (flexible schema justifies NoSQL)

db = db.getSiblingDB('fittrack');

db.createCollection("workout_logs");

// Index TTL : supprime automatiquement les logs après 2 ans (63072000 secondes)
db.workout_logs.createIndex({ date: 1 }, { expireAfterSeconds: 63072000, name: "ttl_workout_logs" });

// Index TEXT : recherche full-text sur le nom de l'exercice
db.workout_logs.createIndex({ exercise_name: "text" }, { name: "text_exercise_name" });

// Index simple : requêtes par utilisateur
db.workout_logs.createIndex({ user_id: 1 }, { name: "idx_user_id" });

// Données de démo
db.workout_logs.insertMany([
  // Antoine — Push Day
  { user_id: 1, session_id: 1, exercise_name: "Bench Press",         date: new Date("2026-05-05"), sets: 4, reps: 10, weight_kg: 60.0 },
  { user_id: 1, session_id: 1, exercise_name: "Overhead Press",      date: new Date("2026-05-05"), sets: 3, reps: 10, weight_kg: 40.0 },
  { user_id: 1, session_id: 1, exercise_name: "Tricep Pushdown",     date: new Date("2026-05-05"), sets: 3, reps: 15, weight_kg: 20.0 },

  // Antoine — Leg Day
  { user_id: 1, session_id: 2, exercise_name: "Barbell Squat",       date: new Date("2026-05-07"), sets: 4, reps: 8,  weight_kg: 80.0 },
  { user_id: 1, session_id: 2, exercise_name: "Romanian Deadlift",   date: new Date("2026-05-07"), sets: 3, reps: 10, weight_kg: 60.0 },
  { user_id: 1, session_id: 2, exercise_name: "Leg Press",           date: new Date("2026-05-07"), sets: 3, reps: 12, weight_kg: 100.0 },

  // Kader — Pull Day
  { user_id: 2, session_id: 3, exercise_name: "Pull Ups",            date: new Date("2026-05-06"), sets: 4, reps: 8,  weight_kg: null },
  { user_id: 2, session_id: 3, exercise_name: "Barbell Row",         date: new Date("2026-05-06"), sets: 4, reps: 10, weight_kg: 50.0 },
  { user_id: 2, session_id: 3, exercise_name: "Bicep Curl",          date: new Date("2026-05-06"), sets: 3, reps: 12, weight_kg: 15.0 },

  // Sofia — Full Body
  { user_id: 3, session_id: 4, exercise_name: "Barbell Squat",       date: new Date("2026-05-08"), sets: 3, reps: 8,  weight_kg: 50.0 },
  { user_id: 3, session_id: 4, exercise_name: "Bench Press",         date: new Date("2026-05-08"), sets: 3, reps: 10, weight_kg: 40.0 },
  { user_id: 3, session_id: 4, exercise_name: "Deadlift",            date: new Date("2026-05-08"), sets: 3, reps: 5,  weight_kg: 70.0 }
]);

print("FitTrack MongoDB initialized successfully — " + db.workout_logs.countDocuments() + " workout logs inserted");
