import {
  Category,
  ddiJSONStructure,
  ImportGroupClash,
  ImportGroupOption,
  ImportGroupResolution,
  ImportGroupResolutions,
  ImportSummary,
  ImportVariableFormTemplate,
  MatchVariables,
  UncomputedWeightVariable,
  UnmatchedWeightVariable,
  Variable,
  VariableGroup,
} from './xml.interface';
import { toArray } from '../../shared/util/array';

interface VariableForm {
  label: string;
  literalQuestion: string;
  interviewQuestion: string;
  postQuestion: string;
  universe: string;
  notes: string;
  assignedWeight: string;
  isWeight: boolean;
}

interface PartialVariableForm {
  label: string;
  literalQuestion: string;
  interviewQuestion: string;
  postQuestion: string;
  universe: string;
  notes: string;
}

function updateGivenVariable(
  variable: Variable,
  newVariableValue: VariableForm,
): Variable {
  let updatedVariable = structuredClone(variable);
  if (updatedVariable.labl?.['#text']) {
    updatedVariable.labl = {
      '#text': newVariableValue.label,
      '@_level': 'variable',
    };
  } else {
    updatedVariable.labl = {
      ...updatedVariable.labl,
      '#text': newVariableValue.label,
    };
  }
  if (newVariableValue.isWeight && updatedVariable['@_wgt']) {
    updatedVariable['@_wgt'] = newVariableValue.isWeight ? 'wgt' : '';
  } else {
    updatedVariable = {
      ...updatedVariable,
      '@_wgt': newVariableValue.isWeight ? 'wgt' : '',
    };
  }
  if (newVariableValue.isWeight && updatedVariable['@_wgt-var']) {
    updatedVariable['@_wgt-var'] = newVariableValue.isWeight
      ? ''
      : newVariableValue.assignedWeight;
  } else {
    updatedVariable = {
      ...updatedVariable,
      '@_wgt-var': newVariableValue.isWeight
        ? ''
        : newVariableValue.assignedWeight,
    };
  }
  if (Array.isArray(updatedVariable.notes)) {
    updatedVariable.notes[1] = newVariableValue.notes;
  } else {
    updatedVariable = {
      ...updatedVariable,
      notes: [updatedVariable.notes, newVariableValue.notes],
    };
  }
  if (!updatedVariable.qstn) {
    updatedVariable.qstn = {
      qstnLit: newVariableValue.literalQuestion,
      postQTxt: newVariableValue.postQuestion,
      ivuInstr: newVariableValue.interviewQuestion,
    };
  } else {
    updatedVariable.qstn = {
      ...updatedVariable.qstn,
      qstnLit: newVariableValue.literalQuestion,
      postQTxt: newVariableValue.postQuestion,
      ivuInstr: newVariableValue.interviewQuestion,
    };
  }
  updatedVariable = {
    ...updatedVariable,
    universe: newVariableValue.universe.length
      ? newVariableValue.universe
      : updatedVariable.universe,
  };
  return updatedVariable;
}

export function changeWeightForSelectedVariables(
  allVariables: { [variableID: string]: Variable },
  selectedVariables: string[],
  weightID: string,
  variablesWithCrossTabMetadata: { [variableID: string]: string[] },
): Variable[] {
  const frequencyTableForSelectedVariables: {
    [variableID: string]: { [categoryID: string]: number };
  } = {};
  const duplicateVariables = structuredClone(allVariables);

  selectedVariables.forEach((variableID) => {
    const selectedVariableCrossTab = variablesWithCrossTabMetadata[variableID];
    const weightVariableCrossTab = variablesWithCrossTabMetadata[weightID];
    const frequencyTable: { [categoryID: string]: number } = {};
    // Both columns are needed: without the variable's own values there is
    // nothing to weight, and the frequency table stays empty.
    if (
      Array.isArray(weightVariableCrossTab) &&
      Array.isArray(selectedVariableCrossTab)
    ) {
      weightVariableCrossTab.forEach((weightValue, index) => {
        const weight = Number(weightValue);
        if (Number.isNaN(weight)) {
          return; // non-numeric weight cell — skip, never poison the sum
        }
        const categoryKey = selectedVariableCrossTab[index];
        frequencyTable[categoryKey] = (frequencyTable[categoryKey] ?? 0) + weight;
      });
    }
    frequencyTableForSelectedVariables[variableID] = frequencyTable;
  });

  Object.keys(frequencyTableForSelectedVariables).forEach((variableID) => {
    if (duplicateVariables[variableID]) {
      const currentCategories = toArray(duplicateVariables[variableID].catgry);
      if (currentCategories.length > 0) {
        // If none of the variable's category codes appear in the data, the
        // codes and the raw values disagree — writing weighted stats would
        // produce all-zero frequencies. Leave the variable unweighted.
        const frequencyTable = frequencyTableForSelectedVariables[variableID];
        const anyCategoryMatchesData = currentCategories.some(
          (category) => frequencyTable[category.catValu] !== undefined,
        );
        if (weightID !== 'remove' && !anyCategoryMatchesData) {
          return;
        }
        currentCategories.forEach((category) => {
          const baseStat = Array.isArray(category.catStat)
            ? category.catStat[0]
            : category.catStat;
          if (weightID === 'remove') {
            // A category may have no <catStat> at all
            if (!baseStat) {
              return;
            }
            const {
              '@_wgtd': _wgtd,
              '@_wgt-var': _wgtVar,
              ...cleanStat
            } = baseStat;
            category.catStat = cleanStat;
          } else {
            category.catStat = [
              ...toArray(category.catStat).filter((stat) => !stat['@_wgtd']),
              {
                // A category that never occurs in the data has a genuine
                // weighted frequency of zero.
                '#text': frequencyTable[category.catValu] ?? 0,
                '@_type': 'freq',
                '@_wgtd': 'wgtd',
                '@_wgt-var': weightID,
              },
            ];
          }
        });
        duplicateVariables[variableID].catgry = currentCategories;
      }
    }
  });
  return Object.values(duplicateVariables);
}

export function fullyChangeMultipleVariables(
  allVariablesArray: Variable[],
  idsOfvariablesToBeChanged: string[],
  newVariableValue: PartialVariableForm,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(allVariablesArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (idsOfvariablesToBeChanged.includes(variable['@_ID'])) {
      const patchedVariable: VariableForm = {
        ...newVariableValue,
        label: newVariableValue.label.length
          ? newVariableValue.label
          : (variable.labl?.['#text'] ?? ''),
        isWeight: !!variable['@_wgt'],
        assignedWeight: variable['@_wgt-var'],
      };
      tempVar = updateGivenVariable(variable, patchedVariable);
    }
    updatedVariableList.push(tempVar);
  });

  return updatedVariableList;
}

export function changeAssignedWeightForMultipleVariables(
  allVariablesArray: Variable[],
  idsOfvariablesToBeChanged: string[],
  assignedWeight: string,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(allVariablesArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (idsOfvariablesToBeChanged.includes(variable['@_ID'])) {
      const patchedVariable: VariableForm = {
        label: variable.labl?.['#text'] ? variable.labl['#text'] : '',
        literalQuestion: variable.qstn?.qstnLit ? variable.qstn.qstnLit : '',
        interviewQuestion: variable.qstn?.ivuInstr
          ? variable.qstn.ivuInstr
          : '',
        postQuestion: variable.qstn?.postQTxt ? variable.qstn.postQTxt : '',
        universe: variable.universe || '',
        notes: Array.isArray(variable.notes) ? variable.notes[1] : '',
        isWeight: !!variable['@_wgt'],
        assignedWeight:
          assignedWeight === 'remove' || !!variable['@_wgt']
            ? ''
            : assignedWeight,
      };
      tempVar = updateGivenVariable(variable, patchedVariable);
    }
    updatedVariableList.push(tempVar);
  });

  return assignedWeight.length ? updatedVariableList : allVariablesArray;
}

export function changeSingleVariable(
  variableArray: Variable[],
  variableID: string,
  newVariableValue: VariableForm,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(variableArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (variable['@_ID'] === variableID) {
      tempVar = updateGivenVariable(variable, newVariableValue);
    }
    updatedVariableList.push(tempVar);
  });

  return updatedVariableList;
}

export function changeGroupsForSingleVariable(
  variableGroups: VariableGroup[] | VariableGroup,
  variableID: string,
  groups: string[],
) {
  const dereferencedArray: VariableGroup[] = [];
  // First remove all references from other groups
  let clonedVariableGroups = structuredClone(variableGroups);
  if (!Array.isArray(clonedVariableGroups) && !!clonedVariableGroups) {
    clonedVariableGroups = [clonedVariableGroups];
  }
  for (const variableGroup of clonedVariableGroups || []) {
    if (variableGroup['@_var']?.split(' ').includes(variableID)) {
      const index = variableGroup['@_var']?.split(' ').indexOf(variableID);
      const variables = variableGroup['@_var'].split(' ');
      if (index !== -1) {
        variables.splice(index, 1);
        variableGroup['@_var'] = variables.join(' ');
      }
    }
    dereferencedArray.push(variableGroup);
  }

  const updatedGroupArray: VariableGroup[] = [];
  // Then insert variable ID in selected groups
  dereferencedArray.forEach((variableGroup) => {
    if (groups.includes(variableGroup['@_ID'])) {
      if (variableGroup['@_var']?.split(' ').length) {
        variableGroup['@_var'] = variableGroup['@_var'] + ' ' + variableID;
      } else {
        variableGroup['@_var'] = '' + variableID + '';
      }
    }
    updatedGroupArray.push(variableGroup);
  });
  return updatedGroupArray;
}

export function changeGroupsForMultipleVariables(
  variableGroups: VariableGroup[],
  variableIDs: string[],
  newGroups: string[],
): VariableGroup[] {
  const updatedGroupArray: VariableGroup[] = [];
  let clonedVariableGroups = structuredClone(variableGroups);
  if (!Array.isArray(clonedVariableGroups) && !!clonedVariableGroups) {
    clonedVariableGroups = [clonedVariableGroups];
  }
  for (const variableGroup of clonedVariableGroups || []) {
    if (newGroups.includes(variableGroup['@_ID'])) {
      const variablesAsArray = variableGroup['@_var']?.length
        ? variableGroup['@_var']?.split(' ') || []
        : [];
      // Add variables that are not already in the group
      for (const variableID of variableIDs) {
        if (!variablesAsArray.includes(variableID)) {
          variablesAsArray.push(variableID);
        }
      }
      variableGroup['@_var'] = variablesAsArray.join(' ');
    }
    updatedGroupArray.push(variableGroup);
  }
  return updatedGroupArray;
}

export function renameVariableGroup(
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
  groupID: string,
  newLabel: string,
) {
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      currentVariableGroup.labl = newLabel;
      break;
    }
  }
  return duplicateVariableGroups;
}

export function deleteVariableGroup(
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
  groupID: string,
) {
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  let index = -1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    if (Array.isArray(duplicateVariableGroups)) {
      duplicateVariableGroups.splice(index, 1);
    } else {
      return [];
    }
  }
  return duplicateVariableGroups;
}

export function removeVariablesFromGroups(
  groupID: string,
  variableIDs: string[],
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
) {
  // If the variable groups are not an array (when there is only one variable group), we need to make it an array
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      const variableListAsArray: string[] =
        currentVariableGroup['@_var']?.split(' ') || [];
      let i = variableListAsArray.length;
      while (i--) {
        if (variableIDs.includes(variableListAsArray[i])) {
          variableListAsArray.splice(i, 1);
        }
      }
      currentVariableGroup['@_var'] = variableListAsArray.join(' ');
      break;
    }
  }
  return duplicateVariableGroups;
}

// <labl>, <universe> and similar elements parse as plain text when they have
// no attributes and as an object with '#text' when they do.
function elementText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value && typeof value === 'object' && '#text' in value) {
    const text = (value as { '#text': unknown })['#text'];
    return text === undefined || text === null ? '' : String(text).trim();
  }
  return '';
}

export function matchVariableIDs(
  importedVariables: Variable[],
  datasetVariables: Variable[],
): MatchVariables {
  const matchedVariables: MatchVariables = {};
  // First we loop through the imported dataset
  importedVariables.forEach((variableImported) => {
    const importedName = variableImported['@_name']?.trim();
    if (!importedName) {
      return;
    }
    // For each dataset we go through our current dataset to find the matching name
    for (const variableInCurrentDataset of datasetVariables) {
      if (variableInCurrentDataset['@_name']?.trim() === importedName) {
        matchedVariables[variableInCurrentDataset['@_ID']] = {
          importedVariableID: variableImported['@_ID'],
          importedVariable: variableImported,
        };
      }
    }
  });
  return matchedVariables;
}

/** Prepended to an imported group's label when the user keeps it alongside
 * an existing group of the same name. */
export const IMPORTED_GROUP_LABEL_PREFIX = 'DDE ';

export function groupLabel(group: VariableGroup): string {
  return elementText(group.labl);
}

function groupVariableIDs(group: VariableGroup): string[] {
  return (group['@_var'] ?? '').split(/\s+/).filter(Boolean);
}

// importedVariableID → currentDatasetVariableID
function importedToCurrentIDs(matchedVariableIDs: MatchVariables): {
  [importedVariableID: string]: string;
} {
  const lookup: { [importedVariableID: string]: string } = {};
  Object.keys(matchedVariableIDs).forEach((id) => {
    lookup[matchedVariableIDs[id].importedVariableID] = id;
  });
  return lookup;
}

// An imported group's variables as current-dataset IDs. Variables with no
// match are dropped: imported IDs mean nothing in the current dataset.
function mappedGroupVariableIDs(
  group: VariableGroup,
  importedToCurrent: { [importedVariableID: string]: string },
): string[] {
  return groupVariableIDs(group)
    .map((importedID) => importedToCurrent[importedID])
    .filter((currentID): currentID is string => currentID !== undefined);
}

/**
 * Group names that cannot be paired automatically. A name used by exactly one
 * imported and one existing group is not a clash: the imported group simply
 * replaces the existing one. A name used by several groups on either side is
 * ambiguous, so the user decides what happens to it.
 */
export function findGroupClashes(
  importedGroups: VariableGroup[],
  existingGroups: VariableGroup[],
  matchedVariableIDs: MatchVariables,
  currentVariables: Variable[] = [],
): ImportGroupClash[] {
  const namesByID: { [variableID: string]: string } = {};
  currentVariables.forEach((variable) => {
    namesByID[variable['@_ID']] = variable['@_name'];
  });
  const describe = (id: string, variableIDs: string[]): ImportGroupOption => ({
    id,
    variableCount: variableIDs.length,
    variableNames: variableIDs.map((variableID) => namesByID[variableID] ?? variableID),
  });
  const addTo = (
    byLabel: Map<string, ImportGroupOption[]>,
    label: string,
    option: ImportGroupOption,
  ): void => {
    byLabel.set(label, [...(byLabel.get(label) ?? []), option]);
  };

  const existingByLabel = new Map<string, ImportGroupOption[]>();
  existingGroups.forEach((group) => {
    addTo(
      existingByLabel,
      groupLabel(group),
      describe(group['@_ID'], groupVariableIDs(group)),
    );
  });

  const importedToCurrent = importedToCurrentIDs(matchedVariableIDs);
  const importedByLabel = new Map<string, ImportGroupOption[]>();
  importedGroups.forEach((group, index) => {
    addTo(
      importedByLabel,
      groupLabel(group),
      describe(String(index), mappedGroupVariableIDs(group, importedToCurrent)),
    );
  });

  const clashes: ImportGroupClash[] = [];
  importedByLabel.forEach((imported, label) => {
    const existing = existingByLabel.get(label) ?? [];
    if (existing.length > 0 && (existing.length > 1 || imported.length > 1)) {
      clashes.push({ label, existing, imported });
    }
  });
  return clashes;
}

/**
 * The dataset's groups after an import. Imported groups replace the existing
 * list. Existing groups survive only under a clashing name (see
 * `findGroupClashes`) for which the user chose to merge or to keep both.
 */
export function updateGroups(
  groups: VariableGroup[],
  matchedVariableIDs: MatchVariables,
  existingGroups: VariableGroup[],
  resolutions: ImportGroupResolutions = {},
): VariableGroup[] {
  const importedToCurrent = importedToCurrentIDs(matchedVariableIDs);

  // A resolution is honoured only for a name that genuinely clashes, so a
  // stale or malformed choice can never keep or merge anything else.
  const clashLabels = new Set(
    findGroupClashes(groups, existingGroups, matchedVariableIDs).map(
      (clash) => clash.label,
    ),
  );
  const resolutionFor = (label: string): ImportGroupResolution =>
    clashLabels.has(label)
      ? (resolutions[label] ?? { action: 'replace' })
      : { action: 'replace' };

  const keptExisting = new Map<string, VariableGroup>();
  existingGroups.forEach((group) => {
    if (resolutionFor(groupLabel(group)).action !== 'replace') {
      keptExisting.set(group['@_ID'], structuredClone(group));
    }
  });

  // Derive a safe starting ID from existing groups so imported IDs never collide
  const existingNumericIDs = existingGroups
    .map((g) => parseInt(g['@_ID']?.replace('VG', '') || '0', 10))
    .filter((n) => !isNaN(n));
  let nextID =
    existingNumericIDs.length ? Math.max(...existingNumericIDs) + 1 : 10000;

  const added: VariableGroup[] = [];
  groups.forEach((group, index) => {
    const label = groupLabel(group);
    const resolution = resolutionFor(label);
    const variableIDs = mappedGroupVariableIDs(group, importedToCurrent);

    if (resolution.action === 'merge') {
      const target = keptExisting.get(resolution.targets?.[String(index)] ?? '');
      if (target && groupLabel(target) === label) {
        target['@_var'] = [...groupVariableIDs(target), ...variableIDs].join(' ');
        return;
      }
      // No valid target was chosen: add the group on its own rather than
      // silently dropping what the user imported.
    }

    const labl =
      resolution.action === 'keepBoth'
        ? withLabelText(group.labl, `${IMPORTED_GROUP_LABEL_PREFIX}${label}`)
        : group.labl;
    added.push({
      ...group,
      labl,
      // Use only matched (current-dataset) IDs — never fall back to imported
      // IDs that don't exist in the current dataset.
      '@_var': variableIDs.join(' '),
      '@_ID': `VG${nextID++}`,
    });
  });

  return [...keptExisting.values(), ...added].map(normalizeGroupVariables);
}

// Replaces the text of a label while keeping any attributes it carries.
function withLabelText(labl: unknown, text: string): string {
  return labl && typeof labl === 'object'
    ? ({ ...labl, '#text': text } as unknown as string)
    : text;
}

// Dataverse's /api/edit parses <varGrp var> with Long.parseLong on every
// space-separated token, so an empty or padded list (var="", "v1  v2") fails
// the whole save with a 500. A group without variables must omit the
// attribute, which is also how Dataverse exports empty groups.
export function normalizeGroupVariables(group: VariableGroup): VariableGroup {
  const { '@_var': variables, ...rest } = group;
  const variableIDs = [
    ...new Set((variables ?? '').split(/\s+/).filter(Boolean)),
  ];
  return variableIDs.length ? { ...rest, '@_var': variableIDs.join(' ') } : rest;
}

export function withNormalizedGroups(json: ddiJSONStructure): ddiJSONStructure {
  const varGrp = json.codeBook?.dataDscr?.varGrp;
  if (!varGrp) {
    return json;
  }
  const groups = Array.isArray(varGrp) ? varGrp : [varGrp];
  return {
    ...json,
    codeBook: {
      ...json.codeBook,
      dataDscr: {
        ...json.codeBook.dataDscr,
        varGrp: groups.map(normalizeGroupVariables),
      },
    },
  };
}

// The raw data file is fetched by variable ID. A one-column file has a single
// <var>, which must not be assumed to be an array.
export function datasetVariableIDs(json: ddiJSONStructure): string[] {
  return toArray(json.codeBook?.dataDscr?.var).map(
    (variable) => variable['@_ID'],
  );
}

type CrossTabValues = { [variableID: string]: string[] };

export function createNewVariables(
  variablesMatched: MatchVariables,
  variables: Variable[],
  variableTemplate: ImportVariableFormTemplate,
  crossTabValues: CrossTabValues = {},
): {
  variables: Variable[];
  unmatchedWeights: UnmatchedWeightVariable[];
  uncomputedWeights: UncomputedWeightVariable[];
} {
  const newVariables: Variable[] = [];
  const unmatchedWeights: UnmatchedWeightVariable[] = [];
  const reverseLookup: {
    [importedVariableId: string]: {
      currentDatasetVariableID: string;
      importedVariable: Variable;
    };
  } = {};

  Object.keys(variablesMatched).forEach((key) => {
    reverseLookup[variablesMatched[key].importedVariableID] = {
      currentDatasetVariableID: key,
      importedVariable: variablesMatched[key].importedVariable,
    };
  });

  structuredClone(variables).forEach((variable) => {
    if (variablesMatched[variable['@_ID']]) {
      const updatedVariable = editSingleVariable(
        variable,
        variableTemplate,
        variablesMatched[variable['@_ID']],
        reverseLookup,
        unmatchedWeights,
      );
      newVariables.push(updatedVariable);
    } else {
      newVariables.push(variable);
    }
  });

  if (!variableTemplate.weight) {
    return { variables: newVariables, unmatchedWeights, uncomputedWeights: [] };
  }
  const recomputed = recomputeWeightedFrequencies(
    newVariables,
    new Set(Object.keys(variablesMatched)),
    crossTabValues,
  );
  return {
    variables: recomputed.variables,
    unmatchedWeights,
    uncomputedWeights: recomputed.uncomputedWeights,
  };
}

const hasWeightedStat = (category: Category): boolean =>
  toArray(category.catStat).some((stat) => !!stat['@_wgtd']);

/**
 * Computes the weighted frequencies of the imported variables from THIS
 * dataset's data. Numbers in an imported file describe another dataset and
 * are never copied. A variable whose frequencies cannot be computed (weight
 * data missing, or its category codes not found in the data) keeps its weight
 * assignment but stays unweighted, and is reported.
 */
function recomputeWeightedFrequencies(
  variables: Variable[],
  importedVariableIDs: Set<string>,
  crossTabValues: CrossTabValues,
): { variables: Variable[]; uncomputedWeights: UncomputedWeightVariable[] } {
  const variableIDsByWeight = new Map<string, string[]>();
  variables.forEach((variable) => {
    const weightID = variable['@_wgt-var'];
    if (weightID && importedVariableIDs.has(variable['@_ID'])) {
      variableIDsByWeight.set(weightID, [
        ...(variableIDsByWeight.get(weightID) ?? []),
        variable['@_ID'],
      ]);
    }
  });

  let byID: { [variableID: string]: Variable } = Object.fromEntries(
    variables.map((variable) => [variable['@_ID'], variable]),
  );
  variableIDsByWeight.forEach((variableIDs, weightID) => {
    byID = Object.fromEntries(
      changeWeightForSelectedVariables(
        byID,
        variableIDs,
        weightID,
        crossTabValues,
      ).map((variable) => [variable['@_ID'], variable]),
    );
  });

  const uncomputedWeights: UncomputedWeightVariable[] = [];
  variableIDsByWeight.forEach((variableIDs) => {
    variableIDs.forEach((variableID) => {
      const categories = toArray(byID[variableID].catgry);
      if (categories.length > 0 && !categories.some(hasWeightedStat)) {
        uncomputedWeights.push({
          variableID,
          variableName: byID[variableID]['@_name'],
        });
      }
    });
  });

  return {
    variables: variables.map((variable) => byID[variable['@_ID']]),
    uncomputedWeights,
  };
}

// The weight an imported variable refers to. Dataverse's own DDI export names
// it only on <var wgt-var>; older exports may name it only on the weighted
// <catStat> elements.
function importedWeightReference(importedVariable: Variable): string {
  if (importedVariable['@_wgt-var']) {
    return importedVariable['@_wgt-var'];
  }
  for (const category of toArray(importedVariable.catgry)) {
    const weighted = toArray(category.catStat).find((stat) => stat['@_wgtd']);
    if (weighted?.['@_wgt-var']) {
      return weighted['@_wgt-var'];
    }
  }
  return '';
}

// A variable's own note is plain text; Dataverse's system note (the UNF)
// carries attributes and parses as an object.
function userNote(notes: unknown): string {
  const note = toArray(notes).find(
    (entry) => typeof entry === 'string' && entry.trim() !== '',
  );
  return typeof note === 'string' ? note : '';
}

/**
 * Applies the selected parts of an imported variable to the current one.
 * A value is only ever overwritten by a non-blank imported value: a file that
 * says nothing about a label, universe or note must not erase the one the
 * dataset already has.
 */
function editSingleVariable(
  currentVariable: Variable,
  variableTemplate: ImportVariableFormTemplate,
  importedVariablesMatched: {
    importedVariable: Variable;
    importedVariableID: string;
  },
  reverseLookup: {
    [importedVariableID: string]: {
      currentDatasetVariableID: string;
      importedVariable: Variable;
    };
  },
  unmatchedWeights: UnmatchedWeightVariable[],
): Variable {
  const currentVariableCloned = structuredClone(currentVariable);
  const importedVariable = importedVariablesMatched.importedVariable;

  if (variableTemplate.label) {
    const importedLabel = elementText(importedVariable.labl);
    if (importedLabel) {
      const currentLabel = currentVariableCloned.labl;
      currentVariableCloned.labl = {
        ...(currentLabel && typeof currentLabel === 'object'
          ? currentLabel
          : { '@_level': 'variable' }),
        '#text': importedLabel,
      };
    }
  }
  if (variableTemplate.notes) {
    const importedUserNote = userNote(importedVariable.notes);
    if (importedUserNote) {
      // Preserve the Dataverse system note at index 0
      const systemNote = Array.isArray(currentVariableCloned.notes)
        ? currentVariableCloned.notes[0]
        : (currentVariableCloned.notes ?? '');
      currentVariableCloned.notes = [systemNote, importedUserNote] as Variable['notes'];
    }
  }
  if (variableTemplate.weight) {
    const importedWgtVar = importedWeightReference(importedVariable);
    const mappedWgtVar = importedWgtVar
      ? reverseLookup[importedWgtVar]?.currentDatasetVariableID
      : undefined;
    currentVariableCloned['@_wgt-var'] = mappedWgtVar ?? '';
    currentVariableCloned['@_wgt'] = importedVariable['@_wgt']
      ? importedVariable['@_wgt']
      : '';
    if (importedWgtVar && !mappedWgtVar) {
      unmatchedWeights.push({
        variableID: currentVariable['@_ID'],
        variableName: currentVariable['@_name'],
        importedWgtVar,
      });
    }

    // Drop any weighted frequencies. Category codes, labels and unweighted
    // frequencies are never touched; the weighted ones are recomputed from
    // this dataset's data once every variable has its weight assigned.
    toArray(currentVariableCloned.catgry).forEach((category) => {
      const stats = toArray(category.catStat);
      const unweightedStats = stats.filter((stat) => !stat['@_wgtd']);
      if (unweightedStats.length !== stats.length) {
        category.catStat =
          unweightedStats.length === 1 ? unweightedStats[0] : unweightedStats;
      }
    });
  }
  const anyQuestionSelected =
    variableTemplate.literalQuestion ||
    variableTemplate.interviewQuestion ||
    variableTemplate.postQuestion;

  if (anyQuestionSelected) {
    const existingQstn = currentVariableCloned.qstn || {
      qstnLit: '',
      ivuInstr: '',
      postQTxt: '',
    };

    if (variableTemplate.literalQuestion) {
      existingQstn.qstnLit =
        importedVariable.qstn?.qstnLit || currentVariable.qstn?.qstnLit || '';
    }
    if (variableTemplate.interviewQuestion) {
      existingQstn.ivuInstr =
        importedVariable.qstn?.ivuInstr || currentVariable.qstn?.ivuInstr || '';
    }
    if (variableTemplate.postQuestion) {
      existingQstn.postQTxt =
        importedVariable.qstn?.postQTxt || currentVariable.qstn?.postQTxt || '';
    }

    currentVariableCloned.qstn = existingQstn;
  }
  if (variableTemplate.universe && elementText(importedVariable.universe)) {
    currentVariableCloned.universe = importedVariable.universe;
  }
  return currentVariableCloned;
}

/** True when the parsed file has the part of a DDI codebook an import needs. */
export function hasImportableVariables(importDdiData: ddiJSONStructure): boolean {
  return toArray(importDdiData?.codeBook?.dataDscr?.var).length > 0;
}

/** Group name clashes between an imported file and the current dataset. */
export function findImportGroupClashes(
  dataset: ddiJSONStructure | null,
  importDdiData: ddiJSONStructure,
): ImportGroupClash[] {
  const variables = toArray(dataset?.codeBook?.dataDscr?.var);
  const importedVariables = toArray(importDdiData?.codeBook?.dataDscr?.var);
  return findGroupClashes(
    toArray(importDdiData?.codeBook?.dataDscr?.varGrp),
    toArray(dataset?.codeBook?.dataDscr?.varGrp),
    matchVariableIDs(importedVariables, variables),
    variables,
  );
}

/**
 * The dataset after importing the selected parts of `importDdiData`, with a
 * summary of what was applied. Returns null when either side has no
 * variables, in which case there is nothing to import. Inputs are not mutated.
 */
export function applyImportedMetadata(
  dataset: ddiJSONStructure,
  importDdiData: ddiJSONStructure,
  variableTemplate: ImportVariableFormTemplate,
  options: {
    groupResolutions?: ImportGroupResolutions;
    crossTabValues?: CrossTabValues;
  } = {},
): { dataset: ddiJSONStructure; summary: ImportSummary } | null {
  const variables = toArray(dataset.codeBook?.dataDscr?.var);
  const importedVariables = toArray(importDdiData?.codeBook?.dataDscr?.var);
  if (!variables.length || !importedVariables.length) {
    return null;
  }

  const variablesMatched = matchVariableIDs(importedVariables, variables);
  const {
    variables: updatedVariables,
    unmatchedWeights,
    uncomputedWeights,
  } = createNewVariables(
    variablesMatched,
    variables,
    variableTemplate,
    options.crossTabValues,
  );

  // A file with no groups leaves the dataset's groups untouched
  const importedGroups = toArray(importDdiData.codeBook.dataDscr.varGrp);
  const replaceGroups = variableTemplate.groups && importedGroups.length > 0;

  return {
    dataset: {
      ...dataset,
      codeBook: {
        ...dataset.codeBook,
        dataDscr: {
          ...dataset.codeBook.dataDscr,
          var: updatedVariables,
          ...(replaceGroups
            ? {
                varGrp: updateGroups(
                  importedGroups,
                  variablesMatched,
                  toArray(dataset.codeBook.dataDscr.varGrp),
                  options.groupResolutions,
                ),
              }
            : {}),
        },
      },
    },
    summary: {
      variablesInFile: importedVariables.length,
      variablesMatched: Object.keys(variablesMatched).length,
      groupsImported: replaceGroups ? importedGroups.length : null,
      unmatchedWeights,
      uncomputedWeights,
    },
  };
}

export function extractUrlAndToken(url: string) {
  if (!url) {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    const siteURL = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const apiKey = parsedUrl.searchParams.get('token');
    return {
      siteURL: siteURL,
      apiKey: apiKey,
    };
  } catch (e) {
    return null;
  }
}
