import type { MuscleRole } from '@/modules/gym/types';

/**
 * Canonical starter data for the gym module. This same catalogue is mirrored in
 * `supabase/seed.sql`. It is loaded into local storage on first run ONLY when
 * Supabase is not configured (otherwise the SQL seed is the source of truth).
 */

/** muscleGroup -> its specific muscles (heads / regions). */
export const MUSCLE_GROUPS: Record<string, string[]> = {
  Chest: ['Upper (clavicular)', 'Middle (sternal)', 'Lower (costal)'],
  Back: [
    'Latissimus dorsi',
    'Upper trapezius',
    'Mid / lower trapezius',
    'Rhomboids',
    'Teres major',
    'Erector spinae',
  ],
  Shoulders: ['Anterior deltoid', 'Lateral deltoid', 'Posterior deltoid'],
  Triceps: ['Long head', 'Lateral head', 'Medial head'],
  Biceps: ['Long head', 'Short head', 'Brachialis'],
  Forearms: ['Brachioradialis', 'Wrist flexors', 'Wrist extensors'],
  Quads: [
    'Rectus femoris',
    'Vastus lateralis',
    'Vastus medialis',
    'Vastus intermedius',
  ],
  Hamstrings: ['Biceps femoris', 'Semitendinosus', 'Semimembranosus'],
  Glutes: ['Gluteus maximus', 'Gluteus medius'],
  Calves: ['Gastrocnemius', 'Soleus'],
  Core: ['Rectus abdominis', 'Obliques', 'Transverse abdominis'],
};

export interface SeedMuscleRef {
  /** "Group / Muscle" — resolves to a specific muscle. */
  group: string;
  muscle: string;
  role: MuscleRole;
}

export interface SeedExercise {
  name: string;
  equipment?: string;
  muscles: SeedMuscleRef[];
}

const P: MuscleRole = 'primary';
const S: MuscleRole = 'secondary';

const m = (group: string, muscle: string, role: MuscleRole): SeedMuscleRef => ({
  group,
  muscle,
  role,
});

export const EXERCISES: SeedExercise[] = [
  {
    name: 'Barbell Bench Press',
    equipment: 'Barbell',
    muscles: [
      m('Chest', 'Middle (sternal)', P),
      m('Chest', 'Lower (costal)', P),
      m('Shoulders', 'Anterior deltoid', S),
      m('Triceps', 'Lateral head', S),
      m('Triceps', 'Medial head', S),
    ],
  },
  {
    name: 'Incline Barbell Bench Press',
    equipment: 'Barbell',
    muscles: [
      m('Chest', 'Upper (clavicular)', P),
      m('Shoulders', 'Anterior deltoid', S),
      m('Triceps', 'Lateral head', S),
    ],
  },
  {
    name: 'Dumbbell Bench Press',
    equipment: 'Dumbbell',
    muscles: [
      m('Chest', 'Middle (sternal)', P),
      m('Shoulders', 'Anterior deltoid', S),
      m('Triceps', 'Lateral head', S),
    ],
  },
  {
    name: 'Cable Fly',
    equipment: 'Cable',
    muscles: [m('Chest', 'Middle (sternal)', P), m('Chest', 'Lower (costal)', P)],
  },
  {
    name: 'Push-Up',
    equipment: 'Bodyweight',
    muscles: [
      m('Chest', 'Middle (sternal)', P),
      m('Triceps', 'Lateral head', S),
      m('Shoulders', 'Anterior deltoid', S),
    ],
  },
  {
    name: 'Overhead Press',
    equipment: 'Barbell',
    muscles: [
      m('Shoulders', 'Anterior deltoid', P),
      m('Shoulders', 'Lateral deltoid', S),
      m('Triceps', 'Lateral head', S),
      m('Triceps', 'Medial head', S),
    ],
  },
  {
    name: 'Dumbbell Lateral Raise',
    equipment: 'Dumbbell',
    muscles: [m('Shoulders', 'Lateral deltoid', P)],
  },
  {
    name: 'Rear Delt Fly',
    equipment: 'Dumbbell',
    muscles: [
      m('Shoulders', 'Posterior deltoid', P),
      m('Back', 'Rhomboids', S),
    ],
  },
  {
    name: 'Triceps Pushdown',
    equipment: 'Cable',
    muscles: [
      m('Triceps', 'Lateral head', P),
      m('Triceps', 'Medial head', P),
      m('Triceps', 'Long head', S),
    ],
  },
  {
    name: 'Overhead Triceps Extension',
    equipment: 'Cable',
    muscles: [
      m('Triceps', 'Long head', P),
      m('Triceps', 'Medial head', S),
    ],
  },
  {
    name: 'Barbell Curl',
    equipment: 'Barbell',
    muscles: [
      m('Biceps', 'Long head', P),
      m('Biceps', 'Short head', P),
      m('Biceps', 'Brachialis', S),
    ],
  },
  {
    name: 'Dumbbell Hammer Curl',
    equipment: 'Dumbbell',
    muscles: [
      m('Biceps', 'Brachialis', P),
      m('Forearms', 'Brachioradialis', P),
      m('Biceps', 'Long head', S),
    ],
  },
  {
    name: 'Preacher Curl',
    equipment: 'Machine',
    muscles: [m('Biceps', 'Short head', P), m('Biceps', 'Brachialis', S)],
  },
  {
    name: 'Pull-Up',
    equipment: 'Bodyweight',
    muscles: [
      m('Back', 'Latissimus dorsi', P),
      m('Back', 'Teres major', S),
      m('Biceps', 'Long head', S),
    ],
  },
  {
    name: 'Lat Pulldown',
    equipment: 'Cable',
    muscles: [
      m('Back', 'Latissimus dorsi', P),
      m('Back', 'Teres major', S),
      m('Biceps', 'Short head', S),
    ],
  },
  {
    name: 'Barbell Row',
    equipment: 'Barbell',
    muscles: [
      m('Back', 'Latissimus dorsi', P),
      m('Back', 'Rhomboids', P),
      m('Back', 'Mid / lower trapezius', S),
      m('Biceps', 'Long head', S),
    ],
  },
  {
    name: 'Seated Cable Row',
    equipment: 'Cable',
    muscles: [
      m('Back', 'Rhomboids', P),
      m('Back', 'Latissimus dorsi', P),
      m('Back', 'Mid / lower trapezius', S),
    ],
  },
  {
    name: 'Deadlift',
    equipment: 'Barbell',
    muscles: [
      m('Back', 'Erector spinae', P),
      m('Glutes', 'Gluteus maximus', P),
      m('Hamstrings', 'Biceps femoris', P),
      m('Back', 'Latissimus dorsi', S),
      m('Back', 'Upper trapezius', S),
    ],
  },
  {
    name: 'Barbell Back Squat',
    equipment: 'Barbell',
    muscles: [
      m('Quads', 'Rectus femoris', P),
      m('Quads', 'Vastus lateralis', P),
      m('Quads', 'Vastus medialis', P),
      m('Glutes', 'Gluteus maximus', P),
      m('Hamstrings', 'Biceps femoris', S),
    ],
  },
  {
    name: 'Leg Press',
    equipment: 'Machine',
    muscles: [
      m('Quads', 'Vastus lateralis', P),
      m('Quads', 'Vastus medialis', P),
      m('Quads', 'Rectus femoris', P),
      m('Glutes', 'Gluteus maximus', S),
    ],
  },
  {
    name: 'Romanian Deadlift',
    equipment: 'Barbell',
    muscles: [
      m('Hamstrings', 'Biceps femoris', P),
      m('Hamstrings', 'Semitendinosus', P),
      m('Glutes', 'Gluteus maximus', P),
      m('Back', 'Erector spinae', S),
    ],
  },
  {
    name: 'Leg Extension',
    equipment: 'Machine',
    muscles: [
      m('Quads', 'Rectus femoris', P),
      m('Quads', 'Vastus lateralis', P),
      m('Quads', 'Vastus medialis', P),
    ],
  },
  {
    name: 'Lying Leg Curl',
    equipment: 'Machine',
    muscles: [
      m('Hamstrings', 'Biceps femoris', P),
      m('Hamstrings', 'Semitendinosus', P),
      m('Hamstrings', 'Semimembranosus', P),
    ],
  },
  {
    name: 'Hip Thrust',
    equipment: 'Barbell',
    muscles: [
      m('Glutes', 'Gluteus maximus', P),
      m('Hamstrings', 'Biceps femoris', S),
    ],
  },
  {
    name: 'Standing Calf Raise',
    equipment: 'Machine',
    muscles: [m('Calves', 'Gastrocnemius', P), m('Calves', 'Soleus', S)],
  },
  {
    name: 'Seated Calf Raise',
    equipment: 'Machine',
    muscles: [m('Calves', 'Soleus', P)],
  },
  {
    name: 'Hanging Leg Raise',
    equipment: 'Bodyweight',
    muscles: [
      m('Core', 'Rectus abdominis', P),
      m('Core', 'Obliques', S),
    ],
  },
  {
    name: 'Cable Crunch',
    equipment: 'Cable',
    muscles: [m('Core', 'Rectus abdominis', P)],
  },
  {
    name: 'Plank',
    equipment: 'Bodyweight',
    muscles: [
      m('Core', 'Transverse abdominis', P),
      m('Core', 'Rectus abdominis', S),
    ],
  },
];
