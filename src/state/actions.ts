import { createAction, props } from '@ngrx/store';

// When the data is fetched from the API, it will create variable groups

/* API CALLS */
// On first page load, the API will be called with a siteURL and fileID
export const fetchDataset = createAction(
  '[Dataset] Fetch',
  props<{ fileID: string; siteURL: string }>()
);
// While loading components will listen for this to display the loading symbol
export const datasetLoadPending = createAction('[Dataset] Load Pending' , props<{ data: any }>());
// If the API call is successful, the header component will change to display the file title and DOI, the table
// component will be loaded with the data from the API
export const datasetLoadSuccess = createAction(
  '[Dataset] Load Success',
  props<{ variables: any, groups: any, citation: any, weightedVariables: any }>()
);
// If the API call errors, the 404 component will be displayed, with the error.message displayed below.
export const datasetLoadError = createAction(
  '[Dataset] Load Error',
  props<{ error: any }>()
);
// When the user is done and uploads their work, the API is called and uploads the current dataset.
export const datasetUploadRequest = createAction('[Dataset] Upload Request', props<{ groups: any, variables: any, fileid: string }>());
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
  props<{ id: string }>()
);

// When the user presses the chart button for a variable
export const variableViewChart = createAction(
  '[Variable] View Chart',
  props<{ id: string; }>()
);

// When the user selects multiple variables, they have an option to make the same changes to multiple variables.
// Users can change lable, question(s), universe, notes, and mark multiple variables as weighted with this
export const startVariableBulkEdit = createAction('[Variable] Start Bulk Edit', props<{ variableIDs: string[] }>())

export const saveVariableBulkEdit = createAction('[Variable] Save Bulk Edit', props<{ variableIDs: string[], template: any }>())

// When the user selects multiple variables, they have an option to make the same changes to multiple variables.
// Users can change lable, question(s), universe, notes, and mark multiple variables as weighted with this
export const variableBulkAssignWeight = createAction('[Variable] Bulk Assign Weight', props<{ variableIDs: string[], weight: any }>())

// Notification successfully added to stack
export const pushNotification = createAction('[Notification] Pushing New Notification', props<{ notificationType: string, message: string }>())

// Remove a notification
export const removeNotification = createAction('[Notification] Removing Notification', props<{ index: number }>())

/* LOCAL CHANGES */
// Create variable groups and list of variables for easy access and change
export const datasetCreateMetadata = createAction(
  '[Create Variables and Init Groups] Init groups and variables',
  props<{ data: any }>()
);

// The notification component will display download when this is dipatched
export const datasetDownload = createAction('[Dataset] Download');
// The header component will display 'Local Copy Saved' when this is dipatched
export const datasetLocalSave = createAction(
  '[Dataset] Local Save',
  props<{ dataset: any }>()
);
