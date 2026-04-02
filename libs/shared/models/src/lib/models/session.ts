/**
 * Local persistence types for IndexedDB auto-save.
 *
 * The host app persists all unsaved mutations to IndexedDB keyed by `fileId`,
 * so users can recover work after browser reload or crash. These types define
 * the stored session structure and the discriminated union of change types.
 *
 * Packages are unaware of persistence — it is handled entirely at the host
 * app level by `SessionPersistenceService`.
 *
 * @see Section 7 of PROJECT_SPEC.md
 */

import type { CrossTabObservationData } from './cross-tab';
import type { ImportVariableTemplate } from './common';
import type { DDEVariable } from './variable';

/**
 * A persisted editing session stored in IndexedDB.
 *
 * Database: `DDE-sessions`, Object store: `sessions`, Key: `fileId`
 *
 * On app load, the host app checks for a session matching the current `fileId`.
 * If found, the user is prompted to restore or discard their unsaved changes.
 * On successful upload to Dataverse, the session is cleared.
 */
export interface DDESession {
  /** Dataset file ID from Dataverse query params — used as the IndexedDB key. */
  fileId: string;

  /** Dataverse site URL this session belongs to. */
  siteUrl: string;

  /** Timestamp (Date.now()) of the last auto-save. */
  savedAt: number;

  /** Serialized DDI XML string — the canonical copy at the time of first load. */
  rawDdi: string;

  /** Ordered list of mutations applied since the last Dataverse upload. */
  pendingChanges: DDEChange[];

  /**
   * Cached observation data. For very large datasets, this may be omitted
   * to save storage — observation data is re-fetched on restore.
   */
  observationData?: CrossTabObservationData;
}

/**
 * Discriminated union of all mutation types that can be persisted.
 *
 * Each change captures a single user action. The `type` discriminant
 * determines the shape of `payload`. Changes are replayed in order
 * when restoring a session.
 */
export type DDEChange =
  | DDEVariableEditChange
  | DDEBulkEditChange
  | DDEGroupCreateChange
  | DDEGroupRenameChange
  | DDEGroupDeleteChange
  | DDEGroupRemoveVariablesChange
  | DDEWeightAssignChange
  | DDEXmlImportChange;

/** Base fields shared by all change types. */
interface DDEChangeBase {
  /** Unique identifier generated via `crypto.randomUUID()`. */
  id: string;

  /** Timestamp (Date.now()) when this change was created. */
  timestamp: number;
}

/** A single variable was edited in the variable editor. */
export interface DDEVariableEditChange extends DDEChangeBase {
  type: 'variable-edit';
  payload: {
    variableId: string;
    changes: Partial<DDEVariable>;
    groupIds: string[];
  };
}

/** Multiple variables were bulk-edited (e.g. same universe applied to all). */
export interface DDEBulkEditChange extends DDEChangeBase {
  type: 'bulk-edit';
  payload: {
    variableIds: string[];
    changes: Partial<DDEVariable>;
  };
}

/** A new variable group was created. */
export interface DDEGroupCreateChange extends DDEChangeBase {
  type: 'group-create';
  payload: {
    groupId: string;
    label: string;
  };
}

/** An existing variable group was renamed. */
export interface DDEGroupRenameChange extends DDEChangeBase {
  type: 'group-rename';
  payload: {
    groupId: string;
    newLabel: string;
  };
}

/** A variable group was deleted. */
export interface DDEGroupDeleteChange extends DDEChangeBase {
  type: 'group-delete';
  payload: {
    groupId: string;
  };
}

/** Variables were removed from a group (but not deleted). */
export interface DDEGroupRemoveVariablesChange extends DDEChangeBase {
  type: 'group-remove-variables';
  payload: {
    groupId: string;
    variableIds: string[];
  };
}

/** A weight variable was assigned to one or more variables. */
export interface DDEWeightAssignChange extends DDEChangeBase {
  type: 'weight-assign';
  payload: {
    variableIds: string[];
    weightId: string;
  };
}

/** DDI XML was imported from a file upload with a field mapping template. */
export interface DDEXmlImportChange extends DDEChangeBase {
  type: 'xml-import';
  payload: {
    xmlString: string;
    template: ImportVariableTemplate;
  };
}
