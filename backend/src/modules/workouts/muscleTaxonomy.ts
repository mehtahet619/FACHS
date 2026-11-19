import { normalizeExerciseValue } from "./exerciseCsvRepository";

/**
 * Canonical workout-muscle taxonomy. Workout targets stay broad while common
 * anatomical names from AI, the catalogue, and user edits map to those targets.
 * Groups are explicit to prevent adjacent muscles from being accepted by mistake.
 */
const MUSCLE_GROUPS: Record<string, string[]> = {
  chest: ["chest", "pectorals", "pectoral", "pectoralis", "pectoralis major", "pectoralis minor"],
  back: ["back", "lat", "lats", "latissimus dorsi", "upper back", "mid back", "middle back", "rhomboid", "rhomboids", "rhomboid major", "rhomboid minor", "traps", "trapezius", "lower back", "erector spinae", "spinal erectors"],
  shoulders: ["shoulder", "shoulders", "deltoid", "deltoids", "delts", "anterior deltoid", "front deltoid", "front delts", "lateral deltoid", "medial deltoid", "side deltoid", "side delts", "posterior deltoid", "rear deltoid", "rear delts"],
  biceps: ["biceps", "biceps brachii", "brachialis"],
  triceps: ["triceps", "triceps brachii", "triceps lateral head", "triceps long head", "triceps medial head"],
  quads: ["quad", "quads", "quadriceps", "quadriceps femoris", "rectus femoris", "vastus lateralis", "vastus medialis", "vastus intermedius"],
  hamstrings: ["hamstring", "hamstrings", "biceps femoris", "semitendinosus", "semimembranosus"],
  glutes: ["glute", "glutes", "gluteals", "gluteus maximus", "gluteus medius", "gluteus minimus"],
  calves: ["calf", "calves", "gastrocnemius", "soleus"],
  core: ["core", "abs", "abdominals", "abdominal", "rectus abdominis", "transverse abdominis", "transversus abdominis", "obliques", "external oblique", "internal oblique"],
};

const MUSCLE_ALIASES: Record<string, string> = {
  lat: "lats", "latissimus dorsi": "lats", "middle back": "mid back",
  rhomboid: "rhomboids", "rhomboid major": "rhomboids", "rhomboid minor": "rhomboids",
  trapezius: "traps", "spinal erectors": "erector spinae",
  "biceps brachii": "biceps", brachialis: "biceps",
  "triceps brachii": "triceps",
  pectorals: "chest", pectoral: "chest", pectoralis: "chest",
  "pectoralis major": "chest", "pectoralis minor": "chest",
  deltoid: "shoulders", deltoids: "shoulders", delts: "shoulders",
  "anterior deltoid": "shoulders", "front deltoid": "shoulders", "front delts": "shoulders",
  "lateral deltoid": "shoulders", "medial deltoid": "shoulders", "side deltoid": "shoulders", "side delts": "shoulders",
  "posterior deltoid": "shoulders", "rear deltoid": "shoulders", "rear delts": "shoulders",
  quad: "quads", quadriceps: "quads", "quadriceps femoris": "quads",
  "rectus femoris": "quads", "vastus lateralis": "quads", "vastus medialis": "quads", "vastus intermedius": "quads",
  hamstring: "hamstrings", "biceps femoris": "hamstrings", semitendinosus: "hamstrings", semimembranosus: "hamstrings",
  glute: "glutes", gluteals: "glutes", "gluteus maximus": "glutes", "gluteus medius": "glutes", "gluteus minimus": "glutes",
  calf: "calves", gastrocnemius: "calves", soleus: "calves",
  abs: "core", abdominals: "core", abdominal: "core", "rectus abdominis": "core",
  "transverse abdominis": "core", "transversus abdominis": "core",
  obliques: "core", "external oblique": "core", "internal oblique": "core",
};

const GROUP_ROOTS = new Set(Object.keys(MUSCLE_GROUPS));
const MUSCLE_GROUP_BY_MEMBER = new Map<string, string>();
for (const [group, members] of Object.entries(MUSCLE_GROUPS)) {
  for (const member of members) MUSCLE_GROUP_BY_MEMBER.set(normalizeExerciseValue(member), group);
}

export function canonicalMuscleKey(value: string): string {
  const key = normalizeExerciseValue(value);
  return MUSCLE_ALIASES[key] ?? key;
}

function muscleGroup(value: string): string | undefined {
  const key = normalizeExerciseValue(value);
  return GROUP_ROOTS.has(key) ? key : MUSCLE_GROUP_BY_MEMBER.get(key);
}

/** True when an exercise's primary muscle belongs to the requested workout target. */
export function primaryMuscleMatchesTarget(target: string, primaryMuscle: string | undefined | null): boolean {
  if (!primaryMuscle?.trim()) return false;
  const targetKey = normalizeExerciseValue(target), primaryKey = normalizeExerciseValue(primaryMuscle);
  if (!targetKey || !primaryKey) return false;
  if (targetKey === primaryKey) return true;
  const targetGroup = muscleGroup(target);
  return Boolean(targetGroup && muscleGroup(primaryMuscle) === targetGroup);
}

/** True only when two primary muscles share an explicitly declared workout group. */
export function primaryMusclesShareGroup(left: string | undefined | null, right: string | undefined | null): boolean {
  if (!left?.trim() || !right?.trim()) return false;
  const leftKey = normalizeExerciseValue(left), rightKey = normalizeExerciseValue(right);
  if (leftKey === rightKey) return true;
  const leftGroup = muscleGroup(left);
  return Boolean(leftGroup && muscleGroup(right) === leftGroup);
}

/** Returns whether a catalogue muscle category contributes to a workout target. */
export function muscleCategoryMatchesTarget(target: string, category: string): boolean {
  return primaryMuscleMatchesTarget(target, category);
}
