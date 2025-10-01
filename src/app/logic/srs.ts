// Minimal SM-2-ish scheduler: interval (days), ease, due (epoch ms)
export type Grade = "again" | "hard" | "good" | "easy";

export type ReviewState = {
  ivl: number;   // days
  ease: number;  // ease factor
  due: number;   // next review time (ms since epoch)
};

export const DEFAULT_STATE: ReviewState = { ivl: 0, ease: 2.5, due: 0 };

export function nextReview(now: number, s: ReviewState, g: Grade): ReviewState {
  let { ivl, ease } = s;

  if (g === "again") {
    ease = Math.max(1.3, ease - 0.2);
    return { ivl: 0, ease, due: now + 10 * 60 * 1000 }; // 10 minutes
  }

  if (ivl === 0) {
    ivl = g === "easy" ? 2 : 1; // first graduation
  } else {
    if (g === "hard") {
      ivl = Math.max(1, Math.round(ivl * 1.2));
      ease = Math.max(1.3, ease - 0.05);
    } else if (g === "good") {
      ivl = Math.round(ivl * ease);
    } else if (g === "easy") {
      ease = ease + 0.15;
      ivl = Math.round(ivl * (ease + 0.15));
    }
  }

  ease = Math.max(1.3, ease);
  const due = now + ivl * 24 * 60 * 60 * 1000;
  return { ivl, ease, due };
}
