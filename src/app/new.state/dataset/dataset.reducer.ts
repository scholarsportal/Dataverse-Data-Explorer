import { ddiJSONStructure } from "../../old.state/interface";
import { createReducer, on } from "@ngrx/store";
import { DataverseFetchActions } from "../xml/xml.actions";

export interface DatasetState {
  operationStatus: {
    download: "idle" | "pending" | "error" | "success",
    upload: "idle" | "pending" | "error" | "success" | "disabled",
    import: "idle" | "pending" | "error" | "success"
  },
  variables: {
    importedDataset: ddiJSONStructure | null,
    importedResult: string | null
  },
  crossTabulation: {
    variableMetadata: {
      [variableID: string]: {
        crossTabValues: string[],
        filteredCategories: string[]
      }
    }
  }
}

const initialState: DatasetState = {
  operationStatus: {
    download: "idle",
    upload: "idle",
    import: "idle"
  },
  variables: {
    importedDataset: null,
    importedResult: null
  },
  crossTabulation: {
    variableMetadata: {}
  }
};

export const datasetReducer = createReducer(
  initialState,
  on(DataverseFetchActions.startDDIFetch, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: "pending" as const
      }
    };
  }),
  on(DataverseFetchActions.fetchDDIError, state => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: "error" as const
      }
    };
  }),
  on(DataverseFetchActions.fetchDDISuccess, state => ({
    ...state,
    operationStatus: {
      ...state.operationStatus,
      download: "success" as const
    }
  }))
);
