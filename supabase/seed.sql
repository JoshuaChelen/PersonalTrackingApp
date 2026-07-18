-- Starter catalogue for the gym module. Mirrors src/modules/gym/data/seedData.ts.
-- Idempotent-ish: only inserts groups/muscles/exercises that don't already exist.

-- Muscle groups -----------------------------------------------------------
insert into public.muscle_groups (name)
select v.name from (values
  ('Chest'), ('Back'), ('Shoulders'), ('Triceps'), ('Biceps'),
  ('Forearms'), ('Quads'), ('Hamstrings'), ('Glutes'), ('Calves'), ('Core')
) as v(name)
where not exists (select 1 from public.muscle_groups g where g.name = v.name);

-- Muscles (specific heads / regions) --------------------------------------
insert into public.muscles (muscle_group_id, name)
select mg.id, v.muscle from (values
  ('Chest','Upper (clavicular)'), ('Chest','Middle (sternal)'), ('Chest','Lower (costal)'),
  ('Back','Latissimus dorsi'), ('Back','Upper trapezius'), ('Back','Mid / lower trapezius'),
  ('Back','Rhomboids'), ('Back','Teres major'), ('Back','Erector spinae'),
  ('Shoulders','Anterior deltoid'), ('Shoulders','Lateral deltoid'), ('Shoulders','Posterior deltoid'),
  ('Triceps','Long head'), ('Triceps','Lateral head'), ('Triceps','Medial head'),
  ('Biceps','Long head'), ('Biceps','Short head'), ('Biceps','Brachialis'),
  ('Forearms','Brachioradialis'), ('Forearms','Wrist flexors'), ('Forearms','Wrist extensors'),
  ('Quads','Rectus femoris'), ('Quads','Vastus lateralis'), ('Quads','Vastus medialis'), ('Quads','Vastus intermedius'),
  ('Hamstrings','Biceps femoris'), ('Hamstrings','Semitendinosus'), ('Hamstrings','Semimembranosus'),
  ('Glutes','Gluteus maximus'), ('Glutes','Gluteus medius'),
  ('Calves','Gastrocnemius'), ('Calves','Soleus'),
  ('Core','Rectus abdominis'), ('Core','Obliques'), ('Core','Transverse abdominis')
) as v(group_name, muscle)
join public.muscle_groups mg on mg.name = v.group_name
where not exists (
  select 1 from public.muscles m
  where m.name = v.muscle and m.muscle_group_id = mg.id
);

-- Exercises ---------------------------------------------------------------
insert into public.exercises (name, equipment, is_custom)
select v.name, v.equipment, false from (values
  ('Barbell Bench Press','Barbell'),
  ('Incline Barbell Bench Press','Barbell'),
  ('Dumbbell Bench Press','Dumbbell'),
  ('Cable Fly','Cable'),
  ('Push-Up','Bodyweight'),
  ('Overhead Press','Barbell'),
  ('Dumbbell Lateral Raise','Dumbbell'),
  ('Rear Delt Fly','Dumbbell'),
  ('Triceps Pushdown','Cable'),
  ('Overhead Triceps Extension','Cable'),
  ('Barbell Curl','Barbell'),
  ('Dumbbell Hammer Curl','Dumbbell'),
  ('Preacher Curl','Machine'),
  ('Pull-Up','Bodyweight'),
  ('Lat Pulldown','Cable'),
  ('Barbell Row','Barbell'),
  ('Seated Cable Row','Cable'),
  ('Deadlift','Barbell'),
  ('Barbell Back Squat','Barbell'),
  ('Leg Press','Machine'),
  ('Romanian Deadlift','Barbell'),
  ('Leg Extension','Machine'),
  ('Lying Leg Curl','Machine'),
  ('Hip Thrust','Barbell'),
  ('Standing Calf Raise','Machine'),
  ('Seated Calf Raise','Machine'),
  ('Hanging Leg Raise','Bodyweight'),
  ('Cable Crunch','Cable'),
  ('Plank','Bodyweight')
) as v(name, equipment)
where not exists (select 1 from public.exercises e where e.name = v.name);

-- Exercise -> muscle mappings ---------------------------------------------
insert into public.exercise_muscles (exercise_id, muscle_id, role)
select ex.id, mu.id, v.role from (values
  ('Barbell Bench Press','Chest','Middle (sternal)','primary'),
  ('Barbell Bench Press','Chest','Lower (costal)','primary'),
  ('Barbell Bench Press','Shoulders','Anterior deltoid','secondary'),
  ('Barbell Bench Press','Triceps','Lateral head','secondary'),
  ('Barbell Bench Press','Triceps','Medial head','secondary'),

  ('Incline Barbell Bench Press','Chest','Upper (clavicular)','primary'),
  ('Incline Barbell Bench Press','Shoulders','Anterior deltoid','secondary'),
  ('Incline Barbell Bench Press','Triceps','Lateral head','secondary'),

  ('Dumbbell Bench Press','Chest','Middle (sternal)','primary'),
  ('Dumbbell Bench Press','Shoulders','Anterior deltoid','secondary'),
  ('Dumbbell Bench Press','Triceps','Lateral head','secondary'),

  ('Cable Fly','Chest','Middle (sternal)','primary'),
  ('Cable Fly','Chest','Lower (costal)','primary'),

  ('Push-Up','Chest','Middle (sternal)','primary'),
  ('Push-Up','Triceps','Lateral head','secondary'),
  ('Push-Up','Shoulders','Anterior deltoid','secondary'),

  ('Overhead Press','Shoulders','Anterior deltoid','primary'),
  ('Overhead Press','Shoulders','Lateral deltoid','secondary'),
  ('Overhead Press','Triceps','Lateral head','secondary'),
  ('Overhead Press','Triceps','Medial head','secondary'),

  ('Dumbbell Lateral Raise','Shoulders','Lateral deltoid','primary'),

  ('Rear Delt Fly','Shoulders','Posterior deltoid','primary'),
  ('Rear Delt Fly','Back','Rhomboids','secondary'),

  ('Triceps Pushdown','Triceps','Lateral head','primary'),
  ('Triceps Pushdown','Triceps','Medial head','primary'),
  ('Triceps Pushdown','Triceps','Long head','secondary'),

  ('Overhead Triceps Extension','Triceps','Long head','primary'),
  ('Overhead Triceps Extension','Triceps','Medial head','secondary'),

  ('Barbell Curl','Biceps','Long head','primary'),
  ('Barbell Curl','Biceps','Short head','primary'),
  ('Barbell Curl','Biceps','Brachialis','secondary'),

  ('Dumbbell Hammer Curl','Biceps','Brachialis','primary'),
  ('Dumbbell Hammer Curl','Forearms','Brachioradialis','primary'),
  ('Dumbbell Hammer Curl','Biceps','Long head','secondary'),

  ('Preacher Curl','Biceps','Short head','primary'),
  ('Preacher Curl','Biceps','Brachialis','secondary'),

  ('Pull-Up','Back','Latissimus dorsi','primary'),
  ('Pull-Up','Back','Teres major','secondary'),
  ('Pull-Up','Biceps','Long head','secondary'),

  ('Lat Pulldown','Back','Latissimus dorsi','primary'),
  ('Lat Pulldown','Back','Teres major','secondary'),
  ('Lat Pulldown','Biceps','Short head','secondary'),

  ('Barbell Row','Back','Latissimus dorsi','primary'),
  ('Barbell Row','Back','Rhomboids','primary'),
  ('Barbell Row','Back','Mid / lower trapezius','secondary'),
  ('Barbell Row','Biceps','Long head','secondary'),

  ('Seated Cable Row','Back','Rhomboids','primary'),
  ('Seated Cable Row','Back','Latissimus dorsi','primary'),
  ('Seated Cable Row','Back','Mid / lower trapezius','secondary'),

  ('Deadlift','Back','Erector spinae','primary'),
  ('Deadlift','Glutes','Gluteus maximus','primary'),
  ('Deadlift','Hamstrings','Biceps femoris','primary'),
  ('Deadlift','Back','Latissimus dorsi','secondary'),
  ('Deadlift','Back','Upper trapezius','secondary'),

  ('Barbell Back Squat','Quads','Rectus femoris','primary'),
  ('Barbell Back Squat','Quads','Vastus lateralis','primary'),
  ('Barbell Back Squat','Quads','Vastus medialis','primary'),
  ('Barbell Back Squat','Glutes','Gluteus maximus','primary'),
  ('Barbell Back Squat','Hamstrings','Biceps femoris','secondary'),

  ('Leg Press','Quads','Vastus lateralis','primary'),
  ('Leg Press','Quads','Vastus medialis','primary'),
  ('Leg Press','Quads','Rectus femoris','primary'),
  ('Leg Press','Glutes','Gluteus maximus','secondary'),

  ('Romanian Deadlift','Hamstrings','Biceps femoris','primary'),
  ('Romanian Deadlift','Hamstrings','Semitendinosus','primary'),
  ('Romanian Deadlift','Glutes','Gluteus maximus','primary'),
  ('Romanian Deadlift','Back','Erector spinae','secondary'),

  ('Leg Extension','Quads','Rectus femoris','primary'),
  ('Leg Extension','Quads','Vastus lateralis','primary'),
  ('Leg Extension','Quads','Vastus medialis','primary'),

  ('Lying Leg Curl','Hamstrings','Biceps femoris','primary'),
  ('Lying Leg Curl','Hamstrings','Semitendinosus','primary'),
  ('Lying Leg Curl','Hamstrings','Semimembranosus','primary'),

  ('Hip Thrust','Glutes','Gluteus maximus','primary'),
  ('Hip Thrust','Hamstrings','Biceps femoris','secondary'),

  ('Standing Calf Raise','Calves','Gastrocnemius','primary'),
  ('Standing Calf Raise','Calves','Soleus','secondary'),

  ('Seated Calf Raise','Calves','Soleus','primary'),

  ('Hanging Leg Raise','Core','Rectus abdominis','primary'),
  ('Hanging Leg Raise','Core','Obliques','secondary'),

  ('Cable Crunch','Core','Rectus abdominis','primary'),

  ('Plank','Core','Transverse abdominis','primary'),
  ('Plank','Core','Rectus abdominis','secondary')
) as v(exercise_name, group_name, muscle_name, role)
join public.exercises ex on ex.name = v.exercise_name
join public.muscle_groups mg on mg.name = v.group_name
join public.muscles mu on mu.name = v.muscle_name and mu.muscle_group_id = mg.id
where not exists (
  select 1 from public.exercise_muscles em
  where em.exercise_id = ex.id and em.muscle_id = mu.id
);
