// MongoDB initialization script
// FitTrack project

db = db.getSiblingDB('fittrack');

// Create collection
db.createCollection("completed_sessions");

// Indexes
db.completed_sessions.createIndex({ user_id: 1 });
db.completed_sessions.createIndex({ session_date: -1 });
db.completed_sessions.createIndex({ free_note: "text" });

// Demo data

db.completed_sessions.insertMany([

  // Strength session — Alice
  {
    user_id: 1,
    session_type_id: 1,
    session_date: new Date("2026-05-05T08:30:00Z"),
    duration_minutes: 52,
    feeling: 4,
    free_note: "Great session, new PR on bench press",
    exercises: [
      {
        exercise_id: 2,
        name: "Bench Press",
        type: "strength",
        sets: [
          { set_number: 1, reps: 10, weight_kg: 55.0, completed: true },
          { set_number: 2, reps: 10, weight_kg: 60.0, completed: true },
          { set_number: 3, reps: 8,  weight_kg: 62.5, completed: true },
          { set_number: 4, reps: 6,  weight_kg: 62.5, completed: false }
        ]
      }
    ]
  },

  // Cardio session — Alice (different structure, justifies MongoDB)
  {
    user_id: 1,
    session_type_id: 2,
    session_date: new Date("2026-05-07T07:00:00Z"),
    duration_minutes: 35,
    feeling: 3,
    free_note: "Easy morning run",
    exercises: [
      {
        exercise_id: 4,
        name: "Running",
        type: "cardio",
        distance_km: 5.2,
        time_s: 1620,
        avg_heart_rate: 158,
        max_heart_rate: 174,
        km_splits: [312, 308, 315, 301, 299]
      }
    ]
  },

  // Strength session — Bob
  {
    user_id: 2,
    session_type_id: 3,
    session_date: new Date("2026-05-06T18:00:00Z"),
    duration_minutes: 65,
    feeling: 5,
    free_note: "Very tough session, legs were destroyed",
    exercises: [
      {
        exercise_id: 1,
        name: "Barbell Squat",
        type: "strength",
        sets: [
          { set_number: 1, reps: 8, weight_kg: 80.0, completed: true },
          { set_number: 2, reps: 8, weight_kg: 85.0, completed: true },
          { set_number: 3, reps: 6, weight_kg: 90.0, completed: true },
          { set_number: 4, reps: 4, weight_kg: 95.0, completed: false }
        ]
      }
    ]
  }

]);

print("FitTrack MongoDB initialized successfully");
