import { AiExerciseCandidateSchema, AiExerciseGenerationSchema } from "../../ai/schemas";
import { requestAiText } from "../../ai/gateway";
function normalizeExerciseValue(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export interface RecommendedExercise {
  sourceIndex: number;
  exercise: string;
  machine: string;
  muscle: string;
  primaryMuscle: string;
  muscleCategories: string[];
  timeTakenOneSet: string;
  targetedMuscle: string;
  targetedMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string;
  sets?: number;
  repRangeLow?: number;
  repRangeHigh?: number;
}

export function exerciseFamilyKey(exerciseName: string): string {
  return normalizeExerciseValue(exerciseName)
    .replace(/\b(?:controlled|slow|explosive|tempo|wide|close|neutral|underhand|overhand|seated|standing|kneeling|lying|prone|supine|barbell|dumbbell|cable|machine)\b/g, " ")
    .replace(/\bpendlay row\b/g, "row")
    .replace(/\s+/g, " ").trim();
}

export interface ExerciseFallbackEquipment {
  name: string;
  aliases: string[];
}

export interface ExerciseFallbackInput {
  targetMuscles: string[];
  sessionDurationMinutes: number;
  count: number;
  equipment: ExerciseFallbackEquipment[];
  excludedExerciseNames?: Iterable<string>;
  excludedFamilyKeys?: Iterable<string>;
  targetedMuscle?: string;
  timeTakenOneSet?: string;
}

interface ProviderConfig {
  name: "OpenRouter" | "Anthropic";
  apiKey: string;
  model: string;
  url: string;
}

export interface AiExerciseValidationInput {
  exerciseName: string;
  muscles: string[];
  equipment: string[];
}

export interface AiExerciseValidation {
  valid: boolean;
  canonicalName?: string;
  primaryMuscle?: string;
  secondaryMuscles: string[];
  equipmentName?: string;
  confidence: number;
  reason?: string;
}

function configuredProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  if (process.env.OPENROUTER_API_KEY) providers.push({
    name: "OpenRouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "openrouter/auto",
    url: "https://openrouter.ai/api/v1/chat/completions",
  });
  if (process.env.ANTHROPIC_API_KEY) providers.push({
    name: "Anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    url: "https://api.anthropic.com/v1/messages",
  });
  return providers;
}

function parseJson(content: string): unknown {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Provider did not return a JSON object.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function validatedExercises(content: string, input: ExerciseFallbackInput): RecommendedExercise[] {
  const parsedPayload = AiExerciseGenerationSchema.safeParse(parseJson(content));
  if (!parsedPayload.success) throw new Error(`Provider response has an invalid exercise list: ${parsedPayload.error.message}`);
  const payload = parsedPayload.data;
  const targetByKey = new Map(input.targetMuscles.map((muscle) => [normalizeExerciseValue(muscle), muscle]));
  const equipmentByAlias = new Map<string, string>();
  for (const option of input.equipment) {
    equipmentByAlias.set(normalizeExerciseValue(option.name), option.name);
    for (const alias of option.aliases) equipmentByAlias.set(normalizeExerciseValue(alias), option.name);
  }
  const excludedNames = new Set([...(input.excludedExerciseNames ?? [])].map(normalizeExerciseValue));
  const excludedFamilies = new Set([...(input.excludedFamilyKeys ?? [])].map(normalizeExerciseValue));
  const names = new Set<string>();
  const families = new Set(excludedFamilies);
  const result: RecommendedExercise[] = [];

  for (const item of payload.exercises) {
    const candidateResult = AiExerciseCandidateSchema.safeParse(item);
    if (!candidateResult.success) continue;
    const candidate = candidateResult.data;
    const exercise = candidate.exercise.trim();
    const nameKey = normalizeExerciseValue(exercise);
    const muscle = targetByKey.get(normalizeExerciseValue(candidate.muscle));
    const machine = equipmentByAlias.get(normalizeExerciseValue(candidate.machine));
    // Every generated exercise must have a primary muscle from the selected
    // workout targets. Secondary muscles are anatomical metadata only and
    // must never become additional exercise targets or workout slots.
    const secondaryMuscles = Array.isArray(candidate.secondaryMuscles)
      ? candidate.secondaryMuscles
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && value.length <= 40)
      : [];
    const inventedQualifier = /\b(constant tension|eccentric emphasis|controlled tempo|slow tempo|explosive tempo|partial reps|partial range|full range|time under tension)\b/i.test(exercise);
    if (!exercise || exercise.length > 100 || inventedQualifier || !muscle || !machine || excludedNames.has(nameKey) || names.has(nameKey)) continue;
    const family = exerciseFamilyKey(exercise);
    if (!family || families.has(normalizeExerciseValue(family))) continue;
    names.add(nameKey);
    families.add(normalizeExerciseValue(family));
    result.push({
      sourceIndex: -result.length - 1,
      exercise,
      machine,
      muscle,
      primaryMuscle: muscle,
      muscleCategories: [muscle],
      timeTakenOneSet: input.timeTakenOneSet || "25-45 sec",
      targetedMuscle: input.targetedMuscle || muscle,
      targetedMuscles: [muscle],
      secondaryMuscles: [...new Set(secondaryMuscles)],
      instructions: typeof candidate.instructions === "string" ? candidate.instructions.slice(0, 1200) : "",
      sets: Number.isInteger(candidate.sets) ? Math.max(2, Math.min(5, Number(candidate.sets))) : 3,
      repRangeLow: Number.isInteger(candidate.repRangeLow) ? Math.max(1, Math.min(30, Number(candidate.repRangeLow))) : 8,
      repRangeHigh: Number.isInteger(candidate.repRangeHigh) ? Math.max(1, Math.min(30, Number(candidate.repRangeHigh))) : 12,
    });
    if (result.length >= input.count) break;
  }

  // Retain individually valid candidates. A single malformed item must not
  // invalidate all the other usable exercises in the same model response.
  return result;
}

async function callProvider(provider: ProviderConfig, input: ExerciseFallbackInput): Promise<string> {
  const prompt = [
    "You are selecting real, established resistance-training exercises, not inventing exercise names.",
    "Do not limit choices to any supplied CSV, catalogue, or predefined exercise list. Use your full exercise knowledge to choose any established movement that matches the target muscles and available equipment.",
    `Workout target muscles: ${input.targetMuscles.join(", ")}.`,
    `Session duration: ${input.sessionDurationMinutes} minutes. Return exactly ${input.count} exercises.`,
    `Available equipment (use only these): ${input.equipment.map(({ name }) => name).join(", ")}.`,
    "Every exercise must be a conventional, recognizable strength-training exercise.",
    "Do not use grip, stance, tempo, equipment, or unilateral variations as separate movement patterns.",
    "Select complementary movements that train distinct functions of the requested muscles.",
    "The muscle field must be one of the requested target muscles and represent the actual primary target.",
    "Use only listed equipment or bodyweight. Never invent unavailable equipment.",
    ...(input.targetMuscles.length === 1 && normalizeExerciseValue(input.targetMuscles[0]) === "shoulders" && input.count >= 3 ? [
      "MANDATORY SHOULDER COVERAGE: include one press, one lateral-delt movement, and one rear-delt movement. Multiple press variations cannot satisfy lateral or rear-delt coverage.",
    ] : []),
    ...(input.targetMuscles.length === 1 && normalizeExerciseValue(input.targetMuscles[0]) === "chest" && input.count >= 3 ? [
      "CHEST COVERAGE: combine a press with a fly/adduction pattern and, when possible, an incline or decline angle.",
    ] : []),
    ...(input.targetMuscles.length === 1 && normalizeExerciseValue(input.targetMuscles[0]) === "back" && input.count >= 3 ? [
      "BACK COVERAGE: combine vertical pulling, horizontal rowing, and a distinct posterior-chain or scapular movement when appropriate.",
    ] : []),
    "Return only valid JSON in this shape: { \"exercises\": [{ \"exercise\": string, \"machine\": string, \"muscle\": string, \"secondaryMuscles\": string[], \"instructions\": string, \"sets\": number, \"repRangeLow\": number, \"repRangeHigh\": number }] }.",
    "Use exact muscle and equipment names from the input. No warmup, explanation, markdown, or extra exercises.",
  ].join("\n");
  return requestAiText({
    operation: "workout.generate",
    provider,
    system: "You are a practical strength coach. Generate a balanced workout that covers the requested muscles within the stated time. Return valid JSON only.",
    user: prompt,
    maxTokens: 3000,
    temperature: 0.35,
    json: true,
    timeoutMs: 12_000,
    retries: 1,
  });
}

async function callExerciseValidator(provider: ProviderConfig, input: AiExerciseValidationInput): Promise<string> {
  const prompt = {
    task: "Validate a user-entered strength-training exercise and identify its catalogue mapping.",
    exerciseName: input.exerciseName,
    allowedMuscles: input.muscles,
    allowedEquipment: input.equipment,
    rules: [
      "Decide whether this is a real, recognized strength-training exercise, not an invented phrase.",
      "Use only exact values from allowedMuscles and allowedEquipment. If a value cannot be mapped, return valid=false.",
      "Distinguish primary muscles from secondary muscles.",
      "Return confidence from 0 to 1 and a short reason.",
      "Return only JSON with valid, canonicalName, primaryMuscle, secondaryMuscles, equipmentName, confidence, and reason fields.",
    ],
  };
  return requestAiText({
    operation: "exercise.catalog_validation",
    provider,
    system: "You validate conventional resistance-training movements conservatively. Do not invent exercises, muscles, or equipment. Return valid JSON only.",
    user: JSON.stringify(prompt),
    maxTokens: 500,
    temperature: 0,
    json: true,
    timeoutMs: 7_000,
    retries: 0,
  });
}

/** Uses configured LLM providers only to validate and structure a new catalogue entry. */
export async function validateUncataloguedExercise(
  input: AiExerciseValidationInput,
): Promise<AiExerciseValidation | null> {
  const configured = configuredProviders();
  const providers = configured;
  const muscleByKey = new Map(input.muscles.map((muscle) => [normalizeExerciseValue(muscle), muscle]));
  const equipmentByKey = new Map(input.equipment.map((equipment) => [normalizeExerciseValue(equipment), equipment]));
  const configuredThreshold = Number(process.env.EXERCISE_CATALOG_VALIDATION_THRESHOLD);
  const confidenceThreshold = Number.isFinite(configuredThreshold) && configuredThreshold >= 0.5 && configuredThreshold <= 1
    ? configuredThreshold
    : 0.8;
  let rejected: AiExerciseValidation | null = null;
  for (const provider of providers) {
    try {
      const parsed = parseJson(await callExerciseValidator(provider, input)) as Record<string, unknown>;
      const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;
      if (parsed.valid !== true) {
        rejected = {
          valid: false,
          secondaryMuscles: [],
          confidence,
          reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : undefined,
        };
        continue;
      }
      if (confidence < confidenceThreshold || confidence > 1 || typeof parsed.canonicalName !== "string" || !parsed.canonicalName.trim()
        || parsed.canonicalName.trim().length > 100) {
        rejected = { valid: false, secondaryMuscles: [], confidence, reason: "The exercise could not be validated confidently." };
        continue;
      }
      const primaryMuscle = typeof parsed.primaryMuscle === "string"
        ? muscleByKey.get(normalizeExerciseValue(parsed.primaryMuscle))
        : undefined;
      const equipmentName = typeof parsed.equipmentName === "string"
        ? equipmentByKey.get(normalizeExerciseValue(parsed.equipmentName))
        : undefined;
      const secondaryMuscles = Array.isArray(parsed.secondaryMuscles)
        ? parsed.secondaryMuscles.map((muscle) => typeof muscle === "string"
          ? muscleByKey.get(normalizeExerciseValue(muscle))
          : undefined)
        : [];
      if (!primaryMuscle || !equipmentName || !Array.isArray(parsed.secondaryMuscles)
        || secondaryMuscles.some((muscle) => !muscle)) {
        rejected = { valid: false, secondaryMuscles: [], confidence, reason: "The exercise could not be mapped to FACHS muscles and equipment." };
        continue;
      }
      return {
        valid: true,
        canonicalName: parsed.canonicalName.trim(),
        primaryMuscle,
        secondaryMuscles: [...new Set(secondaryMuscles as string[])],
        equipmentName,
        confidence,
        reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : undefined,
      };
    } catch (error) {
      console.warn(`[workouts] ${provider.name} exercise validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return rejected;
}

/**
 * Generate exercise choices from configured language models. Valid candidates
 * are retained independently: one malformed item must not discard the rest.
 * When a provider returns too few usable movements, the next configured
 * provider is asked only for the missing slots.
 */
export async function getAiExerciseFallback(input: ExerciseFallbackInput): Promise<RecommendedExercise[]> {
  if (input.count <= 0 || input.targetMuscles.length === 0 || input.equipment.length === 0) return [];
  const accepted: RecommendedExercise[] = [];
  const acceptedNames = new Set([...(input.excludedExerciseNames ?? [])].map(normalizeExerciseValue));
  const acceptedFamilies = new Set([...(input.excludedFamilyKeys ?? [])].map(normalizeExerciseValue));

  for (const provider of configuredProviders()) {
    // Retry once with the missing-slot count and an updated exclusion list.
    // This asks for genuinely different movements rather than discarding good
    // candidates or repeating the same failed full-list request.
    for (let attempt = 0; attempt < 2 && accepted.length < input.count; attempt += 1) {
      const requestInput: ExerciseFallbackInput = {
        ...input,
        count: input.count - accepted.length,
        excludedExerciseNames: [...acceptedNames],
        excludedFamilyKeys: [...acceptedFamilies],
      };
      try {
        const raw = await callProvider(provider, requestInput);
        const candidates = validatedExercises(raw, requestInput);
        let added = 0;
        for (const candidate of candidates) {
          const nameKey = normalizeExerciseValue(candidate.exercise);
          const familyKey = normalizeExerciseValue(exerciseFamilyKey(candidate.exercise));
          if (!nameKey || !familyKey || acceptedNames.has(nameKey) || acceptedFamilies.has(familyKey)) continue;
          acceptedNames.add(nameKey);
          acceptedFamilies.add(familyKey);
          accepted.push({ ...candidate, sourceIndex: -accepted.length - 1 });
          added += 1;
          if (accepted.length >= input.count) break;
        }
        if (accepted.length < input.count) {
          console.warn(`[workouts] ${provider.name} attempt ${attempt + 1} added ${added} valid candidate(s); ${input.count - accepted.length} slot(s) remain.`);
        }
        if (added === 0) break;
      } catch (error) {
        console.warn(`[workouts] ${provider.name} attempt ${attempt + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return accepted;
}
