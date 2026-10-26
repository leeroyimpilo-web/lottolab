/**
 * LottoLab UI-to-data presentation contracts.
 * No network client, calculation, persistence or backend implementation is provided.
 * The types are designed so the approved UI can later consume verified data unchanged.
 */
export type ISODate = string; // YYYY-MM-DD, local South Africa calendar date
export type ISOTime = string; // timezone-aware timestamp when known
export type GameKey = string; // stable key, not a display label
export type RuleKey = string; // stable and versioned per game/rule era
export type NumericPool = "main" | "bonus" | "special";
export type CoverageState = "complete" | "partial" | "empty" | "unverified" | "stale";
export type SourceState = "verified" | "pending" | "unavailable" | "disputed" | "example";
export type Money = {
  currency: "ZAR";
  amountMinor: number | null; // cents; null is not zero
  source: string | null;
  verifiedAt: ISOTime | null;
};
export interface Game {
  id: GameKey;
  displayName: string;
  status: "current" | "retired" | "future";
  operator?: string;
  ruleVersions: RuleKey[];
}
export interface RuleVersion {
  id: RuleKey;
  gameId: GameKey;
  label: string;
  validFrom: ISODate;
  validUntil: ISODate | null; // exclusive boundary if known
  timezone: "Africa/Johannesburg";
  main: { select: number; max: number; min: number; unique: true };
  bonus?: { max: number; min: number; drawnFrom: "main" };
  special?: { select: number; max: number; min: number; poolType: "special" };
  ruleSource: SourceStatus;
}
export interface SourceStatus {
  sourceId: string;
  sourceName: string;
  sourceUrl: string | null;
  status: SourceState;
  retrievedAt: ISOTime | null;
  publishedAt: ISOTime | null;
  licenceStatus: "approved" | "unknown" | "restricted";
  note?: string;
}
export interface Draw {
  id: string;
  gameId: GameKey;
  ruleVersionId: RuleKey;
  drawDateLocal: ISODate;
  drawTimeLocal: ISOTime | null;
  main: number[];
  bonus: number | null;
  special: number | null;
  publishedAt: ISOTime | null;
  sourceStatus: SourceStatus;
  prizeDivisions: PrizeDivision[];
  demo: boolean;
}
export interface PrizeDivision {
  divisionId: string;
  matchDescription: string;
  winners: number | null; // null unknown, 0 means verified zero
  payoutPerWinner: Money | null;
  payoutState: "pending" | "available" | "unavailable";
  poolTypes: NumericPool[];
}
export interface Board {
  id: string;
  name: string;
  gameId: GameKey;
  ruleVersionId: RuleKey;
  main: number[];
  special?: number | null;
  createdAt: ISOTime;
  updatedAt: ISOTime;
  note: string;
  purchaseEvidence: "none" | "user-entered-unverified";
  demo: boolean;
}
export interface ToolQuery {
  toolId: string;
  gameId: GameKey;
  ruleVersionId: RuleKey;
  dateRange: { from: ISODate | null; to: ISODate | null };
  pool: NumericPool;
  input: Record<string, unknown>;
  requestedAt: ISOTime;
}
export interface DataCoverage {
  gameId: GameKey;
  ruleVersionId: RuleKey;
  dateRange: { from: ISODate | null; to: ISODate | null };
  eligibleDraws: number | null;
  availableDraws: number;
  missingDraws: number | null;
  state: CoverageState;
  lastVerifiedAt: ISOTime | null;
  sourceStatus: SourceStatus;
}
export interface ToolResult<T=unknown> {
  query: ToolQuery;
  value: T | null;
  status: "ready" | "invalid-input" | "missing-data" | "unavailable" | "error";
  coverage: DataCoverage;
  demo: boolean;
  explanation: string;
}
/** Separate odds/prize chances for fair draws from past-data observations. */
export type NumericResultLabel =
  | "historical-appearance"
  | "historical-gap"
  | "co-occurrence"
  | "combinatorial-count"
  | "fair-draw-probability";
