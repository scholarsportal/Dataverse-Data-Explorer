import { createAction, props  } from "@ngrx/store";
import { VariableGroups } from "../interface";

export const datasetVariableGroupsLoaded = createAction('[Dataset Variable] Groups Loaded', props<{ variableGroups: VariableGroups }>())
