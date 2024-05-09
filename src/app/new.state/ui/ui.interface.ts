export interface UIState {
  bodyToggle: 'cross-tab' | 'variables',
  bodyState: {
    variables: {
      groupSelectedID: string,
      categoriesDeclaredMissing: { [variableID: string]: string[] },
      importComponentState: 'open' | 'close',
      variableSelectionContext: {
        [groupID: string]: string[]
      },
      openVariable: {
        variableID: string,
        mode: 'edit' | 'view'
      }
    },
    crossTab: {
      missingCategories: { [variableID: string]: string[] },
      selection: {
        [index: number]: {
          variableID: string,
          orientation: 'rows' | 'cols' | ''
        }
      }
    }
  }
}

export interface VariableForm {
  groups: { [groupID: string]: string }[],
  isWeight: boolean,
  label?: string,
  literalQuestion?: string,
  interviewQuestion?: string,
  postQuestion?: string,
  universe?: string,
  notes?: string,
  assignedWeight?: string
}

export const variableFormInit: VariableForm = {
  groups: [],
  isWeight: false
};

export interface ChartData {
  [value: string]: {
    category: string,
    count: number,
    countPercent: number,
    weightedCount: number,
    weightedCountPercent: number,
    invalid: boolean
  };
}

export type SummaryStatistics = {
  mode: string,
  mean: string,
  minimum: string,
  maximum: string,
  median: string,
  standardDeviation: string,
  totalValidCount: string,
  totalInvalidCount: string,
}


export interface OpenVariableState {
  formData: VariableForm;
  chartData: ChartData;
  summaryStatistics: SummaryStatistics;
}
