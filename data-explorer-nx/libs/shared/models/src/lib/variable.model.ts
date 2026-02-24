export interface DdeVariable {
  id: string;
  name: string;
  label: string;
  interval: string;
  isWeight: boolean;
  assignedWeightId: string;
  question: DdeQuestion;
  universe: string;
  notes: string;
  categories: DdeCategory[];
  summaryStatistics: DdeSummaryStatistics;
  format: string;
}

export interface DdeQuestion {
  literal: string;
  interviewer: string;
  post: string;
}

export interface DdeCategory {
  value: number;
  label: string;
  frequency: number;
  weightedFrequency: number;
}

export interface DdeSummaryStatistics {
  mean?: number;
  mode?: number;
  median?: number;
  standardDeviation?: number;
  minimum?: number;
  maximum?: number;
  validCount?: number;
  invalidCount?: number;
}

export interface DdeVariableGroup {
  id: string;
  label: string;
  variableIds: string[];
}
