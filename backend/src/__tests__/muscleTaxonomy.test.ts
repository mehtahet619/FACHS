import { describe, expect, it } from "vitest";
import {
  canonicalMuscleKey,
  muscleCategoryMatchesTarget,
  primaryMuscleMatchesTarget,
  primaryMusclesShareGroup,
} from "../modules/workouts/muscleTaxonomy";

describe("workout muscle taxonomy", () => {
  it("recognizes biceps brachii and brachialis as biceps anatomy", () => {
    expect(canonicalMuscleKey("Biceps Brachii")).toBe("biceps");
    expect(canonicalMuscleKey("Brachialis")).toBe("biceps");
    expect(primaryMuscleMatchesTarget("Biceps", "Biceps Brachii")).toBe(true);
    expect(primaryMuscleMatchesTarget("Biceps", "Brachialis")).toBe(true);
    expect(muscleCategoryMatchesTarget("Biceps", "Biceps Brachii")).toBe(true);
    expect(primaryMusclesShareGroup("Biceps", "Brachialis")).toBe(true);
  });

  it("does not incorrectly classify brachioradialis or forearms as biceps", () => {
    expect(primaryMuscleMatchesTarget("Biceps", "Brachioradialis")).toBe(false);
    expect(primaryMuscleMatchesTarget("Biceps", "Forearms")).toBe(false);
  });
});
