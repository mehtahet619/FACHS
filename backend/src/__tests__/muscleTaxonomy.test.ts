import { describe, expect, it } from "vitest";
import {
  canonicalMuscleKey,
  muscleCategoryMatchesTarget,
  primaryMuscleMatchesTarget,
  primaryMusclesShareGroup,
} from "../modules/workouts/muscleTaxonomy";

describe("workout muscle taxonomy", () => {
  it.each([
    ["Chest", "Pectoralis Major", "chest"],
    ["Back", "Latissimus Dorsi", "lats"],
    ["Shoulders", "Lateral Deltoid", "shoulders"],
    ["Biceps", "Biceps Brachii", "biceps"],
    ["Biceps", "Brachialis", "biceps"],
    ["Triceps", "Triceps Brachii", "triceps"],
    ["Quads", "Vastus Lateralis", "quads"],
    ["Hamstrings", "Semitendinosus", "hamstrings"],
    ["Glutes", "Gluteus Maximus", "glutes"],
    ["Calves", "Gastrocnemius", "calves"],
    ["Core", "Rectus Abdominis", "core"],
  ])("maps %s target to anatomical muscle %s", (target, anatomical, canonical) => {
    expect(canonicalMuscleKey(anatomical)).toBe(canonical);
    expect(primaryMuscleMatchesTarget(target, anatomical)).toBe(true);
    expect(muscleCategoryMatchesTarget(target, anatomical)).toBe(true);
    expect(primaryMusclesShareGroup(target, anatomical)).toBe(true);
  });

  it("keeps adjacent muscle groups separate", () => {
    expect(primaryMuscleMatchesTarget("Biceps", "Brachioradialis")).toBe(false);
    expect(primaryMuscleMatchesTarget("Biceps", "Forearms")).toBe(false);
    expect(primaryMuscleMatchesTarget("Chest", "Triceps")).toBe(false);
    expect(primaryMuscleMatchesTarget("Quads", "Hamstrings")).toBe(false);
    expect(primaryMuscleMatchesTarget("Shoulders", "Traps")).toBe(false);
    expect(primaryMuscleMatchesTarget("Calves", "Hamstrings")).toBe(false);
  });

  it("does not match unknown muscles by broad movement category", () => {
    expect(primaryMuscleMatchesTarget("Biceps", "Upper Pull")).toBe(false);
    expect(primaryMuscleMatchesTarget("Back", "Brachialis")).toBe(false);
    expect(primaryMuscleMatchesTarget("Core", "Lower Back")).toBe(false);
  });
});
