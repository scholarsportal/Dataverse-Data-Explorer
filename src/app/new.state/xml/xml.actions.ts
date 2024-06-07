import { createActionGroup, props } from '@ngrx/store';
import { ddiJSONStructure } from './xml.interface';
import { ImportVariableFormData } from '../dataset/dataset.interface';

export const DataverseFetchActions =
  createActionGroup({
    source: 'Dataverse API Action',
    events: {
      // on site init if URL params are satisfied, this is called
      'Start DDI Fetch': props<{
        siteURL: string,
        fileID: number,
        apiKey?: string
      }>(),
      // API call failed for a variety of reasons
      'Fetch DDI Error': props<{ error: Error }>(),
      // DDI file found
      'Fetch DDI Success': props<{
        data: ddiJSONStructure,
        siteURL: string,
        fileID: number,
        apiKey?: string
      }>(),
      // User starts upload
      'Start Dataset Upload': props<{
        siteURL: string,
        fileID: number,
        apiKey: string,
        ddiData: ddiJSONStructure
      }>(),
      // Upload failed for some reason
      'Dataset Upload Error': props<{ error: string }>(),
      // Upload complete
      'Dataset Upload Success': props<{ response: string }>()
    }
  });

export const XmlManipulationActions = createActionGroup({
  source: 'XML Action',
  events: {
    // User imports an XML file to merge data
    'Start Import Metadata': props<{ importedXmlString: string }>(),
    // XML file not compatible
    'Import Conversion Error': props<{ error: string }>(),
    // Metadata merged successfully
    'Import Conversion Success': props<{
      importDdiData: ddiJSONStructure,
      variableTemplate: ImportVariableFormData
    }>(),
    'Rename Group': props<{ groupID: string, newLabel: string }>(),
    'Delete Group': props<{ groupID: string }>(),
    'Create Group': props<{ groupID: string, label: string }>(),
    'Remove Variables From Group': props<{ variableIDs: string[], groupID: string }>(),
    'Save Variable Info': props<{
      variableID: string | string[], newVariableValue: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
        assignedWeight: string;
        isWeight: boolean,
      }, groups: string[]
    }>(),
    'Bulk Save Variable Info': props<{
      variableIDs: string[], groups?: string[], assignedWeight?: string, newVariableValue?: {
        label: string;
        literalQuestion: string;
        interviewQuestion: string;
        postQuestion: string;
        universe: string;
        notes: string;
      }
    }>()
  }
});
