// FSRS (Free Spaced Repetition Scheduler) implementation
// Based on FSRS-4.5 algorithm

export interface ReviewCard {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: Date;
}

export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

// FSRS parameters (default optimal values)
const w = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
  0.34, 1.26, 0.29, 2.61,
];

const DECAY = -0.5;
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;

function initDifficulty(rating: Rating): number {
  return Math.min(Math.max(w[4] - (rating - 3) * w[5], 1), 10);
}

function initStability(rating: Rating): number {
  return Math.max(w[rating - 1], 0.1);
}

function nextInterval(stability: number): number {
  return Math.round(stability * FACTOR / (Math.pow(0.9, 1 / DECAY) - 1));
}

function nextDifficulty(d: number, rating: Rating): number {
  const next = d - w[6] * (rating - 3);
  return Math.min(Math.max(w[4] * (1 - Math.exp(-next / w[4])) + next * Math.exp(-next / w[4]), 1), 10);
}

function nextRecallStability(
  d: number,
  s: number,
  r: number,
  rating: Rating
): number {
  const hardPenalty = rating === Rating.Hard ? w[15] : 1;
  const easyBonus = rating === Rating.Easy ? w[16] : 1;
  return (
    s *
    (1 +
      Math.exp(w[8]) *
        (11 - d) *
        Math.pow(s, -w[9]) *
        (Math.exp((1 - r) * w[10]) - 1) *
        hardPenalty *
        easyBonus)
  );
}

function nextForgetStability(d: number, s: number, r: number): number {
  return (
    w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp((1 - r) * w[14])
  );
}

function retrievability(elapsed_days: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * elapsed_days) / stability, DECAY);
}

export interface SchedulingResult {
  card: ReviewCard;
  interval: number;
}

export function getSchedulingCards(
  card: ReviewCard,
  now: Date = new Date()
): Record<Rating, SchedulingResult> {
  const elapsedDays =
    card.state === State.New
      ? 0
      : Math.max(
          0,
          (now.getTime() - (card.last_review?.getTime() || now.getTime())) /
            (1000 * 60 * 60 * 24)
        );

  const results: Record<number, SchedulingResult> = {};

  for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
    let newCard: ReviewCard;

    if (card.state === State.New) {
      const d = initDifficulty(rating);
      const s = initStability(rating);

      let interval: number;
      let state: State;

      if (rating === Rating.Again) {
        interval = 0;
        state = State.Learning;
      } else if (rating === Rating.Hard) {
        interval = 0;
        state = State.Learning;
      } else if (rating === Rating.Good) {
        interval = nextInterval(s);
        state = State.Review;
      } else {
        interval = Math.max(nextInterval(s), 1);
        state = State.Review;
      }

      const due = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
      if (interval === 0) {
        // For learning cards, set due to minutes from now
        if (rating === Rating.Again) {
          due.setTime(now.getTime() + 1 * 60 * 1000); // 1 minute
        } else {
          due.setTime(now.getTime() + 10 * 60 * 1000); // 10 minutes
        }
      }

      newCard = {
        due,
        stability: s,
        difficulty: d,
        elapsed_days: 0,
        scheduled_days: interval,
        reps: card.reps + 1,
        lapses: rating === Rating.Again ? card.lapses + 1 : card.lapses,
        state,
        last_review: now,
      };

      results[rating] = { card: newCard, interval };
    } else {
      const r = retrievability(elapsedDays, card.stability);
      const d = nextDifficulty(card.difficulty, rating);

      let s: number;
      let interval: number;
      let state: State;
      let lapses = card.lapses;

      if (rating === Rating.Again) {
        s = nextForgetStability(card.difficulty, card.stability, r);
        interval = 0;
        state = State.Relearning;
        lapses += 1;
      } else {
        s = nextRecallStability(card.difficulty, card.stability, r, rating);
        interval = nextInterval(s);
        if (rating === Rating.Hard) {
          interval = Math.min(interval, Math.round(elapsedDays));
        }
        interval = Math.max(interval, 1);
        state = State.Review;
      }

      const due = new Date(now.getTime() + Math.max(interval, 0) * 24 * 60 * 60 * 1000);
      if (interval === 0) {
        due.setTime(now.getTime() + 1 * 60 * 1000);
      }

      newCard = {
        due,
        stability: s,
        difficulty: d,
        elapsed_days: Math.round(elapsedDays),
        scheduled_days: interval,
        reps: card.reps + 1,
        lapses,
        state,
        last_review: now,
      };

      results[rating] = { card: newCard, interval };
    }
  }

  return results as Record<Rating, SchedulingResult>;
}

export function formatInterval(days: number): string {
  if (days === 0) return '1m';
  if (days < 1) return `${Math.round(days * 24 * 60)}m`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function createNewCard(): ReviewCard {
  return {
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
  };
}
