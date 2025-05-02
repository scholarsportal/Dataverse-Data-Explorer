interface Location {
  '@_fileid': string;
}

interface Label {
  '#text': string;
  '@_level': string;
}

interface Question {
  qstnLit: string;
  ivuInstr?: string;
  postQTxt?: string;
}

interface SummaryStatistic {
  '#text': string | number;
  '@_type': string;
  '@_wgtd'?: string;
  '@_wgt-var'?: string;
}

export interface Category {
  catValu: number;
  labl: Label;
  catStat: SummaryStatistic[] | SummaryStatistic;
}

export interface MatchVariables {
  [datasetID: string]: {
    importedVariableID: string;
    importedVariable: Variable;
  };
}

export interface Variable {
  location: Location;
  labl: Label;
  qstn: Question;
  universe: string;
  sumStat: SummaryStatistic[];
  catgry: Category[];
  varFormat: {
    '@_type': string;
  };
  notes:
    | {
        '#text': string;
        '@_subject': string;
        '@_level': string;
        '@_type': string;
      }
    | [
        {
          '#text': string;
          '@_subject': string;
          '@_level': string;
          '@_type': string;
        },
        string,
      ];
  '@_ID': string;
  '@_name': string;
  '@_intrvl': string;
  '@_wgt-var': string;
  '@_wgt'?: string;
}

export interface VariablesSimplified {
  variableID: string;
  name: string;
  label: string;
  weight: string;
  isWeight: boolean;
  selected: boolean;
}

export interface NesstarVariable {
  location: Location;
  labl: string;
  qstn: Question;
  universe: string;
  sumStat: SummaryStatistic[];
  catgry: Category[];
  varFormat: {
    '@_type': string;
  };
  notes: {
    '#text': string;
    '@_subject': string;
    '@_level': string;
    '@_type': string;
  };
  '@_ID': string;
  '@_name': string;
  '@_intrvl': string;
  '@_wgt-var': string;
  '@_wgt'?: string;
}

export interface VariableGroup {
  labl: string;
  '@_ID': string;
  '@_var'?: string;
}

interface StudyDescription {
  citation: {
    titlStmt: {
      titl: string;
      IDNo: {
        '#text': string;
        '@_agency': string;
      };
    };
    rspStmt: {
      AuthEnty: string;
    };
    biblCit: string;
  };
}

interface FileDescription {
  fileTxt: {
    fileName: string;
    dimensns: {
      caseQnty: number;
      varQnty: number;
    };
    fileType: string;
  };
  notes: {
    '#text': string;
    '@_level': string;
    '@_type': string;
    '@_subject': string;
  };
  '@_ID': string;
}

interface DataDescription {
  varGrp: VariableGroup[] | VariableGroup;
  var: Variable[];
  processedVar?: { [variableID: string]: Variable };
}

interface CodeBook {
  stdyDscr: StudyDescription;
  fileDscr: FileDescription;
  dataDscr: DataDescription;
  '@_xmlns': string;
  '@_version': string;
}

interface XML {
  '?xml': {
    '@_version': string;
    '@_encoding': string;
  };
}

export interface ImportVariableFormTemplate {
  groups: boolean;
  label: boolean;
  literalQuestion: boolean;
  interviewQuestion: boolean;
  postQuestion: boolean;
  universe: boolean;
  notes: boolean;
  weight: boolean;
}

export interface ddiJSONStructure {
  '?xml': XML['?xml'];
  codeBook: CodeBook;
}

export interface XmlState {
  dataset: ddiJSONStructure | null;
  header: {
    citation: string;
    title: string;
  } | null;
  info: {
    siteURL?: string;
    doi?: string;
    fileID?: number;
    language?: string;
    importedSuccess?: boolean;
    secureUploadUrl: string | null;
  } | null;
  error: {
    type: 'fetch' | 'upload' | null;
    message: string | null;
  };
}

export const globalInitialState = {
  ui: {
    bodyToggle: 'variables',
    bodyState: {
      variables: {
        groupSelectedID: 'ALL',
        categoriesDeclaredMissing: {},
        importComponentState: 'close',
        variableSelectionContext: {},
        openVariable: {
          variableID: '',
          mode: 'view',
        },
      },
      crossTab: {
        selection: {},
      },
    },
  },
  xml: {
    dataset: null,
    header: {
      citation: '',
      title: null,
      info: null,
    },
  },
  dataset: {
    operationStatus: {
      download: 'idle',
      upload: 'idle',
      import: 'idle',
    },
    variables: {
      importedDataset: null,
      importedResult: null,
    },
    crossTabulation: {
      variableMetadata: {},
    },
  },
};

export interface QueryParameters {
  fileId: number;
  fileMetadataId: number;
  datasetPid: string;
}

export interface SignedUrl {
  name: string;
  httpMethod: string;
  signedUrl: string;
  timeOut: number;
}

export interface Data {
  queryParameters: QueryParameters;
  signedUrls: SignedUrl[];
}

export interface ApiResponse {
  status: string;
  data: Data;
}

export type ParsedCrossTabData = { [variableName: string]: string[] };
