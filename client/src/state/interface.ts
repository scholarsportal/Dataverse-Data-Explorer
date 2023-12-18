interface CatStat {
  '#text': number | string;
  '@_type': string;
  '@_wgtd'?: string;
}

interface Catgry {
  catStat: CatStat[];
  catValu: number;
  labl: {
    '#text': string;
    '@_level': string;
  };
}

export interface Citation {
  titlStmt: {
    titl: string;
    IDNo: string;
  };
  rspStmt: {
    AuthEnty: string;
  };
  biblCit: string;
}

export interface Groups {
  [id: string]: {
    '@_ID': string;
    labl: string;
    '@_var': Set<string>;
  };
}

export interface Variables {
  [id: string]: {
    '@_ID': string;
    '@_name': string;
    '@_intrvl': string;
    labl: {
      '#text': string;
      '@_level': string;
    };
    location: {
      '@_fileid': string;
    };
    notes: string;
    qstn: {
      qstnLit: string;
      ivuInstr: string;
      postQTxt: string;
    };
    sumStat: {
      '#text': number | string;
      '@_type': string;
    }[];
    varFormat: {
      '@_type': string;
    };
    universe: string;
    groups: {
      [id: string]: {
        label: string;
      };
    };
    catgry?: Catgry;
    '@_wgt-var'?: string;
    '@_wgt'?: 'wgt';
  };
}

export type VariableGroups = {
  [key: string]: {
    groups: {
      [id: string]: string;
    };
  };
};

export interface GraphObject {
  [id: string]: {
    weighted: { label: string; frequency: number }[];
    unweighted: { label: string; frequency: number }[];
  };
}

export interface State {
  dataset: {
    status: string;
    error: any;
    citation: Citation;
    variables: Variables;
    variableGroups: VariableGroups;
    groups: Groups;
    weightedVariables: any;
  };
  changeGroup: string;
  recentlyChanged: string;
  modal: {
    open: boolean;
    mode: string;
    id: string | string[] | null;
    variable: any | null;
    groups: { [id: string]: string } | null;
    state: 'saved' | 'changes' | '';
  };
  notificationStack: { notificationType: string; message: string } | {};
  upload: {
    status: string;
    error: any;
  };
}

export interface VariableForm {
  id: string;
  name: string;
  label: string;
  literalQuestion: string;
  interviewerQuestion: string;
  postQuestion: string;
  universe: string;
  notes: string;
  isWeight: boolean;
  weightVar: string;
}

export interface SingleVariable {
  labl: {
    '#text': string;
    '@_level'?: string;
  };
  location?: {
    '@_fileid': string;
  };
  notes: string;
  qstn: {
    qstnLit: string;
    ivuInstr: string;
    postQTxt: string;
  };
  sumStat?: {
    '#text': number | string;
    '@_type': string;
  }[];
  varFormat?: {
    '@_type': string;
  };
  universe: string;
  catgry?: Catgry;
  '@_wgt-var'?: string;
  '@_wgt'?: 'wgt' | '';
}
