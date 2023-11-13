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
    notes: {
      '#text': string;
      '@_subject': string;
      '@_level': string;
      '@_type': string;
    };
    sumStat: {
      '#text': number | string;
      '@_type': string;
    }[];
    varFormat: {
      '@_type': string;
    };
    universe: string;
    catgry?: Catgry;
  };
}

export function parseJSON(dataset: any) {
    if(!dataset.codebook){
        // TODO: Create error handler
    }
    const variables = {}
    const variableGroups = {}
    const citation = dataset.codebook.stdyDscr.citation
    console.log(citation)
    // console.log(fileDscr)
    // console.log(dataDscr)
    return {variables, variableGroups, citation}
}
