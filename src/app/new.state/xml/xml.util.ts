import {
  Category,
  ddiJSONStructure,
  ImportVariableFormTemplate,
  MatchVariables,
  SummaryStatistic,
  UnmatchedWeightVariable,
  Variable,
  VariableGroup,
} from './xml.interface';

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
    if (weightVariableCrossTab && Array.isArray(weightVariableCrossTab)) {
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
      const currentCategories = duplicateVariables[variableID].catgry;
      if (currentCategories && Array.isArray(currentCategories)) {
        // If none of the variable's category codes appear in the data, the
        // codes and the raw values disagree — writing weighted stats would
        // produce all-zero frequencies. Leave the variable unweighted.
        const frequencyTable = frequencyTableForSelectedVariables[variableID];
        const anyCategoryMatchesData = currentCategories.some(
          (category) => frequencyTable[category.catValu] !== undefined,
        );
        if (
          weightID !== 'remove' &&
          currentCategories.length > 0 &&
          !anyCategoryMatchesData
        ) {
          return;
        }
        currentCategories.map((category) => {
          const baseStat = Array.isArray(category.catStat)
            ? category.catStat[0]
            : category.catStat;
          if (weightID === 'remove') {
            const {
              '@_wgtd': _wgtd,
              '@_wgt-var': _wgtVar,
              ...cleanStat
            } = baseStat;
            category.catStat = cleanStat;
          } else {
            category.catStat = [
              baseStat,
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
      }
      duplicateVariables[variableID].catgry = currentCategories;
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
          : variable.labl['#text'],
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

export function matchVariableIDs(
  importedVariables: Variable[],
  datasetVariables: Variable[],
): MatchVariables {
  const matchedVariables: MatchVariables = {};
  // First we loop through the imported dataset
  importedVariables.forEach((variableImported) => {
    // For each dataset we go through our current dataset to find the matching name
    for (const variableInCurrentDataset of datasetVariables) {
      if (variableInCurrentDataset['@_name'].trim() === variableImported['@_name'].trim()) {
        matchedVariables[variableInCurrentDataset['@_ID']] = {
          importedVariableID: variableImported['@_ID'],
          importedVariable: variableImported,
        };
      }
    }
  });
  return matchedVariables;
}

export function updateGroups(
  groups: VariableGroup[],
  matchedVariableIDs: MatchVariables,
  existingGroups: VariableGroup[],
): VariableGroup[] {
  const duplicateVariableGroups: VariableGroup[] = [];

  // Build a reverse lookup: importedVariableID → currentDatasetVariableID
  const flipMatched: { [oldVariableID: string]: string } = {};
  Object.keys(matchedVariableIDs).forEach((id) => {
    flipMatched[matchedVariableIDs[id].importedVariableID] = id;
  });

  // Derive a safe starting ID from existing groups so imported IDs never collide
  const existingNumericIDs = existingGroups
    .map((g) => parseInt(g['@_ID']?.replace('VG', '') || '0', 10))
    .filter((n) => !isNaN(n));
  let nextID =
    existingNumericIDs.length ? Math.max(...existingNumericIDs) + 1 : 10000;

  groups.forEach((group) => {
    const groupVariables = group['@_var']?.split(' ').filter(Boolean) || [];
    const newVars: string[] = [];
    groupVariables.forEach((variable) => {
      const mapped = flipMatched[variable];
      if (mapped !== undefined) {
        newVars.push(mapped);
      }
    });
    duplicateVariableGroups.push(
      normalizeGroupVariables({
        ...group,
        // Use only matched (current-dataset) IDs — never fall back to imported
        // IDs that don't exist in the current dataset.
        '@_var': newVars.join(' '),
        '@_ID': `VG${nextID++}`,
      }),
    );
  });
  return duplicateVariableGroups;
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

export function createNewVariables(
  variablesMatched: MatchVariables,
  variables: Variable[],
  variableTemplate: ImportVariableFormTemplate,
): { variables: Variable[]; unmatchedWeights: UnmatchedWeightVariable[] } {
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
  return { variables: newVariables, unmatchedWeights };
}

// fast-xml-parser yields a bare object for single-element lists and nothing
// for empty ones.
function toArray<T>(value: T[] | T | undefined): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

// Exact string match first. Exports from older DE versions carry numerically
// corrupted codes ("1" for "01"), so fall back to numeric equality.
function findMatchingCategory(
  catValu: string,
  candidates: Category[],
): Category | undefined {
  const target = String(catValu).trim();
  const exact = candidates.find(
    (candidate) => String(candidate.catValu).trim() === target,
  );
  if (exact || target === '' || Number.isNaN(Number(target))) {
    return exact;
  }
  return candidates.find((candidate) => {
    const value = String(candidate.catValu).trim();
    return value !== '' && Number(value) === Number(target);
  });
}

/**
 * Replaces the weighted stats of `currentCategories` (mutated in place) with
 * those of the matching imported categories, remapping `@_wgt-var` to
 * current-dataset IDs. Category codes, labels and unweighted stats are never
 * touched; imported categories absent from the current dataset are ignored.
 * Returns the imported weight variable IDs that had no match.
 *
 * Dataverse's own DDI export names the weight only on <var wgt-var>, not on
 * each weighted <catStat>, so the variable-level reference is the fallback.
 */
function mergeImportedWeightedStats(
  currentCategories: Category[],
  importedCategories: Category[],
  importedVariableWgtVar: string | undefined,
  reverseLookup: {
    [importedVariableID: string]: { currentDatasetVariableID: string };
  },
): Set<string> {
  const unmatchedWgtVars = new Set<string>();
  currentCategories.forEach((category) => {
    const stats = toArray(category.catStat);
    const unweightedStats = stats.filter((stat) => !stat['@_wgtd']);
    const importedMatch = findMatchingCategory(
      category.catValu,
      importedCategories,
    );
    const importedWeighted = toArray(importedMatch?.catStat).find(
      (stat) => stat['@_wgtd'],
    );
    const importedWgtVar = importedWeighted
      ? importedWeighted['@_wgt-var'] || importedVariableWgtVar
      : undefined;
    const mappedWgtVar = importedWgtVar
      ? reverseLookup[importedWgtVar]?.currentDatasetVariableID
      : undefined;
    if (importedWgtVar && !mappedWgtVar) {
      unmatchedWgtVars.add(importedWgtVar);
    }

    // No usable imported weighted stat: mirror the import and leave the
    // category unweighted.
    const nextStats: SummaryStatistic[] =
      importedWeighted && mappedWgtVar
        ? [
            ...unweightedStats,
            { ...structuredClone(importedWeighted), '@_wgt-var': mappedWgtVar },
          ]
        : unweightedStats;
    if (stats.length === 0 && nextStats.length === 0) {
      return;
    }
    category.catStat = nextStats.length === 1 ? nextStats[0] : nextStats;
  });
  return unmatchedWgtVars;
}

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
  if (variableTemplate.label) {
    const importedLabel =
      importedVariablesMatched.importedVariable.labl?.['#text'] ?? '';
    if (
      currentVariableCloned.labl &&
      currentVariableCloned.labl['#text'] !== undefined
    ) {
      currentVariableCloned.labl['#text'] = importedLabel;
    } else {
      currentVariableCloned.labl = {
        '#text': importedLabel,
        '@_level': 'variable',
      };
    }
  }
  if (variableTemplate.notes) {
    // Normalise current notes: preserve the Dataverse system note at index 0
    const systemNote = Array.isArray(currentVariableCloned.notes)
      ? currentVariableCloned.notes[0]
      : (currentVariableCloned.notes ?? '');

    // Extract user-authored notes from the imported variable regardless of
    // whether they are stored as a plain string or at index 1 of an array.
    const importedNotes = importedVariablesMatched.importedVariable.notes;
    const importedUserNote = Array.isArray(importedNotes)
      ? importedNotes[1]
      : typeof importedNotes === 'string'
        ? importedNotes
        : '';

    currentVariableCloned.notes = [systemNote, importedUserNote];
  }
  if (variableTemplate.weight) {
    const importedWgtVar =
      importedVariablesMatched.importedVariable['@_wgt-var'];
    currentVariableCloned['@_wgt-var'] = reverseLookup[importedWgtVar]
      ? reverseLookup[importedWgtVar].currentDatasetVariableID
      : '';
    currentVariableCloned['@_wgt'] = importedVariablesMatched.importedVariable[
      '@_wgt'
    ]
      ? importedVariablesMatched.importedVariable['@_wgt']
      : '';

    // Merge weighted stats from the imported variable onto the CURRENT
    // categories. Never replace catgry wholesale: the imported file's codes,
    // labels and unweighted frequencies belong to a different dataset, and
    // Dataverse rejects weighted stats whose catValu isn't in its database.
    const unmatchedWgtVars = mergeImportedWeightedStats(
      toArray(currentVariableCloned.catgry),
      toArray(importedVariablesMatched.importedVariable.catgry),
      importedWgtVar,
      reverseLookup,
    );
    unmatchedWgtVars.forEach((importedWgtVar) => {
      unmatchedWeights.push({
        variableID: currentVariable['@_ID'],
        variableName: currentVariable['@_name'],
        importedWgtVar,
      });
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
        importedVariablesMatched.importedVariable.qstn?.qstnLit ||
        currentVariable.qstn?.qstnLit ||
        '';
    }
    if (variableTemplate.interviewQuestion) {
      existingQstn.ivuInstr =
        importedVariablesMatched.importedVariable.qstn?.ivuInstr ||
        currentVariable.qstn?.ivuInstr ||
        '';
    }
    if (variableTemplate.postQuestion) {
      existingQstn.postQTxt =
        importedVariablesMatched.importedVariable.qstn?.postQTxt ||
        currentVariable.qstn?.postQTxt ||
        '';
    }

    currentVariableCloned.qstn = existingQstn;
  }
  if (variableTemplate.universe) {
    currentVariableCloned.universe =
      importedVariablesMatched.importedVariable.universe;
  }
  return currentVariableCloned;
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
