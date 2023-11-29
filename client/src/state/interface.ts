interface Citation {
  titlStmt: {
    titl: string;
    IDNo: string;
  };
  rspStmt: {
    AuthEnty: string;
  };
  biblCit: string;
}

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
  }
};

export interface VarGroups {
  [id: string]: {
    '@_ID': string;
    'labl': string;
    '@_var': string[];
  }
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
    notes: (string | {
      '#text': string;
      '@_subject': string;
      '@_level': string;
      '@_type': string;
    })[];
    qstn: {
      qstnLit: string;
      ivuInstr: string;
      postQTxt: string;
    },
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
        label: string
      }
    },
    catgry?: Catgry;
    '@_wgt-var'?: string;
    '@_wgt'?: 'wgt';
  };
}


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
    groups: VarGroups;
    varWeights: any;
  };
  changeGroup: string;
  recentlyChanged: string;
  openModal: {
    open: boolean;
    modalMode: string;
    id: string | null;
    variable: any | null;
    graph: any | null;
    state: 'saved' | 'changes' | '';
  };
  notificationStack: { notificationType: string; message: string } | {}
  upload: {
    status: string;
    error: any;
  };
}
