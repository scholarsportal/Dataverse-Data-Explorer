export type CrossTabObservationData = { [variableId: string]: string[] };

export interface CrossTabSelection {
  variableId: string;
  axis: 'row' | 'column';
}

export interface CrossTabMissingCategories {
  [variableId: string]: number[];
}