import { createAction, props } from '@ngrx/store';
import { Variables } from './reducers';

// When the data is fetched from the API, it will create variable groups

/* API CALLS */
// On first page load, the API will be called with a siteURL and fileID
export const fetchDataset = createAction(
  '[Dataset] Fetch',
  props<{ fileID: string; siteURL: string }>()
);
// While loading components will listen for this to display the loading symbol
export const datasetLoadPending = createAction('[Dataset] Load Pending');
// If the API call is successful, the header component will change to display the file title and DOI, the table
// component will be loaded with the data from the API
export const datasetLoadSuccess = createAction(
  '[Dataset] Load Success',
  props<{ data: any }>()
);
// If the API call errors, the 404 component will be displayed, with the error.message displayed below.
export const datasetLoadError = createAction(
  '[Dataset] Load Error',
  props<{ error: any }>()
);
// When the user is done and uploads their work, the API is called and uploads the current dataset.
export const datasetUploadRequest = createAction('[Dataset] Upload Request');
// While uploading components will listen for this to display the uploading symbol
export const datasetUploadPending = createAction('[Dataset] Upload Pending');
// If the API call is successful, the notification component displays with the success message.
export const datasetUploadSuccess = createAction('[Dataset] Upload Success');
// If the API call errors, the notification component displays with the error message.
export const datasetUploadError = createAction(
  '[Dataset] Upload Error',
  props<{ error: any }>()
);

// USER PRESSES A BUTTON
// When the user presses the edit button for a variable
export const variableViewDetail = createAction(
  '[Variable] View Detail',
  props<{ variable: string }>()
);
// When the user presses the chart button for a variable
export const variableViewChart = createAction(
  '[Variable] View Chart',
  props<{ id: string; variable: string }>()
);
// The table component will dispatch the variable id, to be added to the current list of selected variables
export const variableAddToSelectGroup = createAction(
  '[Variable] Add To Select Group',
  props<{ variableID: string }>()
);
// Remove a specified group from the list of groups
export const groupRemove = createAction(
  '[Group] Remove',
  props<{ groupID: string }>()
);
// Add a new empty variable group to the list of groups
export const groupCreateNew = createAction('[Group] Create New');
// View variables in selected group
export const groupSelected = createAction(
  '[Group] Change Selected',
  props<{ groupID: string }>()
);

/* LOCAL CHANGES */
// Create variable groups and list of variables for easy access and change
export const datasetCreateMetadata = createAction(
  '[Create Variables and Init Groups] Init groups and variables',
  props<{ data: any }>()
);
// Variable group created successfully
export const datasetCreateMetadataSuccess = createAction(
  '[Create Variables and Init Groups] Success',
  props<{ groups: any[]; variables: Variables }>()
);
// Variable group could not created
export const datasetCreateMetadataError = createAction(
  '[Create Variables and Init Groups] Error',
  props<{ error: any }>()
);
// Variable group created successfully for this ID
export const datasetGroupVariablesUpdatedSuccess = createAction(
  '[Create Group Variables] Success',
  props<{ groupID: any; variables: Variables; other: any }>()
);
// Variable group could not created
export const datasetGroupVariablesUpdatedError = createAction(
  '[Create Group Variables] Error',
  props<{ error: any }>()
);
// Variable group could not created
export const datasetGroupVariablesUpdatedWarning = createAction(
  '[Create Group Variables] Warning',
  props<{ message: string }>()
);
// Notify component on graph creation success
export const variableCreateGraphSuccess = createAction(
  '[Variable] Create Graph Success',
  props<{ id: string; weighted: any; unweighted: any }>()
);
// Throw an error if the calculation cannot be completed for some reason
export const variableCreateGraphError = createAction(
  '[Variable] Create Graph Error',
  props<{ error: any }>()
);
// The modal component will listen for this and launch a modal using the variable data
export const variableChangeDetail = createAction(
  '[Variable] Change Detail',
  props<{ variable: any }>()
);

// The notification component will display download when this is dipatched
export const datasetDownload = createAction('[Dataset] Download');
// The header component will display 'Local Copy Saved' when this is dipatched
export const datasetLocalSave = createAction(
  '[Dataset] Local Save',
  props<{ dataset: any }>()
);
// Add the current list of selected variables to the list of variables in specified group.
export const groupAddSelectedGroup = createAction(
  '[Group] Add Selected Group',
  props<{ groupId: string }>()
);
// Change name property of specified group ID, to newName
export const groupChangeName = createAction(
  '[Group] Change Name',
  props<{ groupId: string; newName: string }>()
);
