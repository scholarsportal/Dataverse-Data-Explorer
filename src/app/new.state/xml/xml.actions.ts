import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  ApiResponse,
  ddiJSONStructure,
  ImportVariableFormTemplate,
  ParsedCrossTabData,
  Variable,
} from './xml.interface';

export const DataverseFetchActions = createActionGroup({
  source: 'Dataverse API Action',
  events: {
    // signed url
    'Decode URL and fetch': props<{
      url: string;
    }>(),
    'Decode success': props<{ data: ApiResponse }>(),
    'Decode and Fetch DDI Success': props<{
      data: ddiJSONStructure;
      apiResponse: ApiResponse;
      language?: string;
    }>(),
    // on site init if URL params are satisfied, this is called
    'Fetch DDI Start': props<{
      siteURL: string;
      fileID: number;
      apiKey?: string;
      language?: string;
      metadataID?: number;
    }>(),
    // API call failed for a variety of reasons
    'Fetch DDI Error': props<{ error: Error }>(),
    // DDI file found
    'Fetch DDI Success': props<{
      data: ddiJSONStructure;
      siteURL: string;
      fileID: number;
      apiKey?: string;
      metadataID?: number;
      language?: string;
    }>(),
    'Weight Search Start': props<{ variableIDs: string[] }>(),
    'Weights Fetch Success': props<{ data: ParsedCrossTabData }>(),
    'Weights Fetch Error': props<{ error: Error }>(),
    // User starts upload
    'Dataset Upload Start': props<{
      siteURL: string;
      fileID: number;
      apiKey: string;
      ddiData: ddiJSONStructure;
    }>(),
    'Start Secure Dataset Upload': props<{
      secureUploadURL: string;
      ddiData: ddiJSONStructure;
    }>(),
    // Upload failed for some reason
    'Dataset Upload Error': props<{ error: string }>(),
    // Upload complete
    'Dataset Upload Success': props<{ response: string }>(),
  },
});

export const XmlManipulationActions = createActionGroup({
  source: 'XML Action',
  events: {
    // User imports an XML file to merge data
    'Start Import Metadata': props<{
      importedXmlString: string;
      variableTemplate: ImportVariableFormTemplate;
    }>(),
    // XML file not compatible
    'Import Conversion Error': props<{ error: string }>(),
    // Metadata merged successfully
    'Import Conversion Success': props<{
      importDdiData: ddiJSONStructure;
      variableTemplate: ImportVariableFormTemplate;
    }>(),
    'Rename Group': props<{ groupID: string; newLabel: string }>(),
    'Delete Group': props<{ groupID: string }>(),
    'Create Group': props<{ groupID: string; label: string }>(),
    'Remove Variables From Group': props<{
      variableIDs: string[];
      groupID: string;
    }>(),
    'Start Variable Info Save': props<{
      variableID: string | string[];
      newVariableValue: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
        assignedWeight: string;
        isWeight: boolean;
      };
      groups: string[];
    }>(),
    'Save Variable Info': props<{
      variableID: string;
      newVariableValue: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
        assignedWeight: string;
        isWeight: boolean;
      };
      groups: string[];
      allVariables: { [variableID: string]: Variable };
      variablesWithCrossTabMetadata: { [variableID: string]: string[] };
    }>(),
    'Save Variable Info Success': emptyProps,
    'Save Variable Info Fail': props<{
      error: string;
      newVariableValue: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
        assignedWeight: string;
        isWeight: boolean;
      };
    }>(),
    'Bulk Save Variable Info': props<{
      variableIDs: string[];
      groups?: string[];
      assignedWeight?: string;
      newVariableValue?: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
      };
      variablesWithCrossTabMetadata: { [variableID: string]: string[] };
      allVariables: { [variableID: string]: Variable };
    }>(),
    'Weight Process Start': props<{
      allVariables: { [variableID: string]: Variable };
      selectedVariables: string[];
      weightID: string;
      variablesWithCrossTabMetadata: { [variableID: string]: string[] };
    }>(),
    'Weight Process Fetch Missing Values and Start': props<{
      allVariables: { [variableID: string]: Variable };
      selectedVariables: string[];
      weightID: string;
      variablesWithCrossTabMetadata: { [variableID: string]: string[] };
    }>(),
    'Weight Process Success': props<{
      allVariables: { [variableID: string]: Variable };
      selectedVariables: string[];
      variablesWithCrossTabMetadata: { [variableID: string]: string[] };
    }>(),
    'Weight Process Error': props<{ error: Error }>(),
  },
});
