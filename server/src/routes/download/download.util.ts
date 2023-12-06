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

export type Catgry = CatStat[];

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
    '@_wgt-var': string;
    labl: {
      '#text': string;
      '@_level': string;
    };
    location: {
      '@_fileid': string;
    };
    notes: string;
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
  };
}

export function parseJSON(dataset: any) {
  if (!dataset.codebook) {
    // TODO: Create error handler
  }
  const variables: Variables = {}
  const groups: VarGroups = {}
  const citation: Citation = dataset.codeBook.stdyDscr.citation

  const vars = dataset.codeBook.dataDscr.var
  const varGrp = dataset.codeBook.dataDscr.varGrp
  const varWeights: any = {}

  // Create variables
  vars.forEach((item: any) => {
    let notes: string;

    // check if variable has notes (notes are second object in array)
    // if not we create the expected object anyway for consistency
    Array.isArray(item.notes) ? (notes = item.notes.at(-1)) : (notes = '')

    variables[item['@_ID']] = { ...item, notes, groups: {} }

    // if the variable has a weight var, we add that variable to var weights
      // in its correspoding weight
    if(item['@_wgt-var']){
      varWeights[item['@_wgt-var']] = true
    }
  });

  // Create variable groups
  varGrp.forEach((item: any) => {
    groups[item['@_ID']] = { ...item, '@_var': item['@_var'].split(' ') }
  });

  return { variables, groups, citation, varWeights }
}
