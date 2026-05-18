// Script d'initialisation MongoDB
// Projet FitTrack

db = db.getSiblingDB('fittrack');

// Création de la collection
db.createCollection("seances_realisees");

// Index simples
db.seances_realisees.createIndex({ utilisateur_id: 1 });
db.seances_realisees.createIndex({ date_realisee: -1 });
db.seances_realisees.createIndex({ note_libre: "text" });

// Données de démo

db.seances_realisees.insertMany([

  // Séance musculation — Alice
  {
    utilisateur_id: 1,
    seance_type_id: 1,
    date_realisee: new Date("2026-05-05T08:30:00Z"),
    duree_minutes: 52,
    ressenti: 4,
    note_libre: "Bonne séance, nouveau PR au développé couché",
    exercices: [
      {
        exercice_id: 2,
        nom: "Développé couché",
        type: "force",
        series: [
          { numero: 1, reps: 10, poids_kg: 55.0, reussie: true },
          { numero: 2, reps: 10, poids_kg: 60.0, reussie: true },
          { numero: 3, reps: 8,  poids_kg: 62.5, reussie: true },
          { numero: 4, reps: 6,  poids_kg: 62.5, reussie: false }
        ]
      }
    ]
  },

  // Séance cardio — Alice (structure différente, justifie MongoDB)
  {
    utilisateur_id: 1,
    seance_type_id: 2,
    date_realisee: new Date("2026-05-07T07:00:00Z"),
    duree_minutes: 35,
    ressenti: 3,
    note_libre: "Course matinale tranquille",
    exercices: [
      {
        exercice_id: 4,
        nom: "Course à pied",
        type: "cardio",
        distance_km: 5.2,
        temps_s: 1620,
        fc_moyenne: 158,
        fc_max: 174,
        splits_km: [312, 308, 315, 301, 299]
      }
    ]
  },

  // Séance musculation — Bob
  {
    utilisateur_id: 2,
    seance_type_id: 3,
    date_realisee: new Date("2026-05-06T18:00:00Z"),
    duree_minutes: 65,
    ressenti: 5,
    note_libre: "Séance très dure, jambes cramées",
    exercices: [
      {
        exercice_id: 1,
        nom: "Squat barre",
        type: "force",
        series: [
          { numero: 1, reps: 8, poids_kg: 80.0, reussie: true },
          { numero: 2, reps: 8, poids_kg: 85.0, reussie: true },
          { numero: 3, reps: 6, poids_kg: 90.0, reussie: true },
          { numero: 4, reps: 4, poids_kg: 95.0, reussie: false }
        ]
      }
    ]
  }

]);

print("FitTrack MongoDB initialisé avec succès");
