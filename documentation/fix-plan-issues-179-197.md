# Fix plan — issues #179 (500 on save) and #197 (import metadata)

This document is a self-contained implementation plan. Each fix lists the exact files,
the current code, the required change, edge cases, and acceptance criteria. Execute the
fixes **in order** (Fix 2 and 3 depend on decisions made in Fix 1; Fix 4 depends on Fix 1's
type change). Write the tests in Fix 5 alongside each fix, not at the end.

---

## Background: confirmed root-cause diagnosis

Read this before changing anything — every fix below traces back to it.

1. **`src/app/services/ddi.service.ts:35-39`** configures `fast-xml-parser` (v4.3.3) with
   only `ignoreAttributes: false` and `attributeNamePrefix: '@_'`. The default
   `parseTagValue: true` therefore stays on, and **every XML text node is coerced to a
   number when possible**. `<catValu>01</catValu>` becomes the number `1`, and on upload
   `JSONtoXML` serializes it back as `<catValu>1</catValu>`.

2. Dataverse's `PUT /api/edit/{fileId}` endpoint (`EditDDI.java`) matches each *weighted*
   category (`catStat` with `wgtd="wgtd"`) against the database with **exact string
   equality**: `catValue.equals(vc.getValue())`. `"1"` does not equal `"01"`, the
   `CategoryMetadata` keeps a transient category with no ID, `em.persist()` throws
   `EJBException`, and the endpoint returns **500 "Failed to update draft version"**.
   `CategoryMetadata` objects are only created for weighted `catStat` entries, which is why
   the bug appears once a weight is assigned — and why *any* later metadata edit (question,
   universe, notes) to a variable carrying weighted stats also fails.

3. StatCan PUMFs zero-pad category codes to two digits exactly when a variable's codes
   reach 10 (including the 96–99 missing-value codes). That is why issue #179 observed
   "variables with 10 or more categories, although not every example" — variables whose
   codes are all single-digit (no padding) or all ≥ 10 (no leading zeros) are unaffected.
   Verified empirically: diffing the live Borealis DDI against the DE-roundtripped XMLs
   attached to #197 shows exactly the variables named in #179 (REGION6, TENURE_G, NAICS6,
   WRKTYP, RNBEN) corrupted from `01..06` to `1..6`; and in production EICS 2023 the only
   variables that ever got weighted frequencies saved are the unpadded ones.

4. **Second bug:** in the failing SHS 2021 export, *all 1,677 weighted frequencies are 0*.
   The raw Dataverse tab file stores character values **quoted** (`"01"`, `"13"`) and lines
   may end in `\r`. `splitLines` (`ddi.service.ts:130-159`) strips neither, so the
   frequency-table keys are literally `'"01"'` and never match `catValu`; the `|| 0`
   fallback in `changeWeightForSelectedVariables` (`xml.util.ts:146-149`) then silently
   writes 0 for every category. The same key mismatch silently breaks cross-tab category
   labels for quoted character variables.

5. **Third bug:** the import flow (`editSingleVariable`, `xml.util.ts:576`) replaces the
   current variable's entire `catgry` with the *imported dataset's* categories
   (`currentVariableCloned.catgry = importedCatgry`). Importing year-X metadata into a
   year-Y dataset overwrites year-Y's real category codes and unweighted frequencies, and
   any code that doesn't exist in year-Y's database reproduces the 500 in (2).

Constraint that governs everything: **the DDI XML must round-trip byte-equivalent for all
values Dataverse matches by string** (`catValu` above all). The client must never
"normalize" them.

---

## Fix 1 — stop numeric coercion of XML text nodes

**Goal:** `<catValu>01</catValu>` parses to the string `'01'` and serializes back as
`<catValu>01</catValu>`. Same for decimal codes (`9999.97`, and the dangerous `1.0` case
which numeric coercion would rewrite as `1`).

### 1a. Parser options — `src/app/services/ddi.service.ts:35-39`

Current:

```ts
  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };
```

Replace with:

```ts
  // parseTagValue MUST remain false. Dataverse's /api/edit endpoint matches
  // <catValu> against the database by exact string equality, so zero-padded
  // codes ("01") and decimal codes ("1.0") must round-trip byte-for-byte.
  private parseOptions = {
    ignoreAttributes: false as const,
    attributeNamePrefix: '@_',
    parseTagValue: false,
  };
```

Notes:
- The same object is passed to both `XMLParser` and `XMLBuilder` (lines 120 and 125).
  `XMLBuilder` ignores `parseTagValue`; this is harmless. Do not split the options object.
- Do **not** use `numberParseOptions: { leadingZeros: false }` instead — it still coerces
  `"1.0"` to `1`.
- This also covers the import flow: `xml.effects.ts:342` parses imported files through the
  same `ddiService.XMLtoJSON`.
- Attribute values were never coerced (`parseAttributeValue` defaults to `false`), so
  `@_ID`, `@_wgt-var`, etc. are unaffected.

### 1b. Interface updates — `src/app/new.state/xml/xml.interface.ts`

- Line 24: `catValu: number;` → `catValu: string;` (in `Category`).
- Lines 127-128 (`FileDescription.fileTxt.dimensns`): `caseQnty: number; varQnty: number;`
  → both `string`. (They are tag values; nothing in `src/` reads them — verified by grep —
  but the type must match reality.)
- Line 17 (`SummaryStatistic['#text']: string | number`): **keep the union.**
  Parsed values are now always strings, but `changeWeightForSelectedVariables` writes
  computed numbers for weighted frequencies (`xml.util.ts:146`), and `XMLBuilder`
  serializes numbers correctly. Narrowing this would force pointless conversions.

### 1c. Arithmetic consumers — `src/app/new.state/ui/ui.selectors.ts:252-273`

With `#text` now a string, `totalCount += state['#text'] as number` becomes **string
concatenation** ("0" + "150" = "0150"). The `as` casts were always lies; replace them with
real conversions. In `selectOpenVariableChartTable`:

```ts
      if (Array.isArray(value.catStat)) {
        value.catStat.map((state) => {
          if (state['@_wgtd']) {
            weightedCount = String(state['#text']);
            totalWeightCount += Number(state['#text']);
          } else {
            count = String(state['#text']);
            totalCount += Number(state['#text']);
          }
        });
      } else {
        if (value.catStat['@_wgtd']) {
          weightedCount = String(value.catStat['#text']);
          totalWeightCount += Number(value.catStat['#text']);
        } else {
          count = String(value.catStat['#text']);
          totalCount += Number(value.catStat['#text']);
        }
      }
```

Also in the same file, lines 405-431 (`sumStat` mapping): replace each
`value['#text'] as string` with `String(value['#text'])`. These are display-only; the
conversion just makes the cast honest.

### 1d. Things that need **no** change (verify, don't edit)

- `xml.util.ts:146-149` — `frequencyTableForSelectedVariables[variableID][category.catValu]`:
  object lookup works identically with string keys.
- `ui.selectors.ts:274` (`chart[value.catValu]`) and `:280`
  (`missing.includes(value.catValu.toString())`) — `.toString()` on a string is valid.
- `dataset.selectors.ts:119-139` (`selectDatasetAllVariableCategories`) — builds
  `{ [cat.catValu]: label }`; string keys are fine and, combined with Fix 2, finally make
  cross-tab labels match for zero-padded character variables.

### 1e. Acceptance criteria

- `npx tsc --noEmit` passes.
- New round-trip unit test (see Fix 5, test A) passes: parsing then building XML preserves
  `01`, `9999.97`, `1.0`, and `00` catValu values verbatim.
- Manual smoke: load a public dataset DDI (e.g.
  `https://borealisdata.ca/api/access/datafile/894367/metadata/ddi`, EICS 2023), open a
  zero-padded variable (REGION6) — categories must display as `01`…`06`, `96`…`99`.

---

## Fix 2 — sanitize tab-file values in `splitLines`

**Goal:** frequency-table keys derived from the raw tab file must equal the (now string)
`catValu` values: `"01"` (with literal quotes) → `01`; trailing `\r` removed.

### 2a. `src/app/services/ddi.service.ts:130-159`

Current behavior: `input.trim().split('\n')`, then `line.split('\t')`, values pushed raw.

Replace `splitLines` internals (keep the method signature) and add a private helper:

```ts
  /** Dataverse tab subsets quote character values ("01") and may use CRLF
   *  line endings. Strip both so values match DDI catValu codes exactly. */
  private cleanTabField(raw: string): string {
    let value = raw.trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    return value;
  }
```

In `splitLines`:
- `const lines = input.trim().split(/\r?\n/);`
- `const headers = lines[0].split('\t').map((h) => this.cleanTabField(h));`
- In the data loop: `const values = line.split('\t').map((v) => this.cleanTabField(v));`

Keep the existing header-count guard (`variable.length !== headers.length`) exactly as is.

### 2b. Edge cases

- Numeric columns (`396.9489`, `24733`) are unquoted — `cleanTabField` only trims them.
- Empty fields stay `''`.
- A value that is just `"` (single quote char) — length check `>= 2` prevents mangling.
- Do not try to handle embedded tabs inside quoted fields; Dataverse's tab writer escapes
  field content, and the existing positional split is out of scope here.

### 2c. Acceptance criteria

- Unit tests (Fix 5, test B) pass: quoted values, CRLF input, escaped quotes, header row.
- Behavioral consequence to verify manually: weighted frequencies computed for a quoted
  character variable are non-zero (pre-fix they were all 0), and cross-tabulation shows
  category labels instead of blanks for such variables.

---

## Fix 3 — fail safe instead of fabricating zero weighted frequencies

**Goal:** never upload weighted frequencies that are fabricated zeros. If the data needed
to compute them isn't available, refuse the weight assignment and tell the user — do not
silently write `0`.

### 3a. Guard in the effect — `src/app/new.state/xml/xml.effects.ts:216-264`

`bulkSaveWeightAndGroupChange$` currently calls `changeAssignedWeightForMultipleVariables`
then `changeWeightForSelectedVariables` unconditionally. Add a pre-check at the top of the
`exhaustMap` callback:

```ts
const isApplyingWeight = !!weightToUpdate && weightToUpdate !== 'remove';
const weightData = crossTabMetadata[weightToUpdate];
if (isApplyingWeight && (!Array.isArray(weightData) || weightData.length === 0)) {
  return of(
    XmlManipulationActions.bulkSaveWeightAndGroupChangeError({
      error: 'weight-data-unavailable',
    }),
  );
}
```

- Add the new action `bulkSaveWeightAndGroupChangeError` in
  `src/app/new.state/xml/xml.actions.ts` (payload: `{ error: string }`), mirroring the
  existing success action's naming.
- Handle it in `src/app/new.state/xml/xml.reducer.ts`: do **not** mutate variables; set
  whatever save-status field the success path clears (follow the existing
  `bulkSaveWeightAndGroupChangeSuccess` / `clearVariableSaveStatus` pattern) to an error
  value.
- Surface it in the table menu
  (`src/app/components/body/variables/data/table-menu/table-menu.component.ts/.html`):
  the component already has an `error` flag and toast for "no changes selected"; select the
  new error state from the store and show a message
  ("Weight data could not be loaded; weights were not applied."). Add the i18n key to all
  files under `src/assets/i18n/` following an existing key's pattern.

### 3b. Hardening in `changeWeightForSelectedVariables` — `src/app/new.state/xml/xml.util.ts:97-162`

Three small changes inside the existing function (no signature change needed once 3a
guards the only call site, but keep these for defense in depth):

1. **Accumulation falsy-zero bug**, lines 114-121: replace the truthiness check:

   ```ts
   weightVariableCrossTab.forEach((weightValue, index) => {
     const weight = Number(weightValue);
     if (Number.isNaN(weight)) {
       return; // non-numeric weight cell — skip, never poison the sum with NaN
     }
     const categoryKey = selectedVariableCrossTab[index];
     frequencyTable[categoryKey] = (frequencyTable[categoryKey] ?? 0) + weight;
   });
   ```

2. **All-zero sanity check**, in the second loop (lines 127-160): before writing weighted
   stats for a variable, check that at least one of its category values appears in the
   frequency table. If the variable has categories and *none* match, skip writing weighted
   stats for that variable (leave `category.catStat` untouched) — a total mismatch means
   the codes and the data disagree, and writing all-zeros is exactly the corruption seen in
   issue #197's SHS file:

   ```ts
   const frequencyTable = frequencyTableForSelectedVariables[variableID];
   const anyMatch = currentCategories.some(
     (category) => frequencyTable[category.catValu] !== undefined,
   );
   if (weightID !== 'remove' && currentCategories.length > 0 && !anyMatch) {
     return; // skip this variable; codes don't match the data at all
   }
   ```

   (Place this after the `Array.isArray(currentCategories)` check. A *single* missing
   category with others matching is a genuine zero-frequency category — `?? 0` for that
   case is correct; keep it, but switch `|| 0` to `?? 0` on line 149.)

3. Keep the `weightID === 'remove'` branch exactly as is (it was fixed in commit ac25c67).

### 3c. Acceptance criteria

- Applying a weight when the weight variable's data is absent from
  `crossTabMetadata` leaves all variables unmodified and shows the error toast.
- Applying a weight with data present writes non-zero weighted frequencies for categories
  that occur in the data and `0` only for categories genuinely absent from the data.
- Unit tests in Fix 5, test C pass.

---

## Fix 4 — import: merge weights into existing categories, never replace `catgry`

**Goal:** importing metadata must never change the current dataset's category codes,
labels, or unweighted frequencies. Only the weight *assignment* (and its weighted stats)
may be transferred, and only onto categories that actually exist in the current dataset.

### 4a. Rewrite the weight branch of `editSingleVariable` — `src/app/new.state/xml/xml.util.ts:532-577`

Keep lines 532-542 (`@_wgt-var` / `@_wgt` remapping via `reverseLookup`) unchanged.
Delete lines 544-576 (the `structuredClone(importedCatgry)` block ending in
`currentVariableCloned.catgry = importedCatgry;`) and replace with merge logic:

```ts
    // Merge weighted stats from the imported variable into the CURRENT
    // categories. Never replace catgry wholesale: the imported file's codes,
    // labels and unweighted frequencies belong to a different dataset, and
    // Dataverse rejects weighted stats whose catValu doesn't exist in its DB.
    const toArray = <T>(value: T[] | T | undefined): T[] =>
      value === undefined ? [] : Array.isArray(value) ? value : [value];

    // Old DE exports carry numerically-corrupted codes ("1" for "01"), so
    // match exact strings first and fall back to numeric equality.
    const sameCatValue = (a: string | number, b: string | number): boolean => {
      const as = String(a).trim();
      const bs = String(b).trim();
      if (as === bs) return true;
      const an = Number(as);
      const bn = Number(bs);
      return as !== '' && bs !== '' && !Number.isNaN(an) && an === bn;
    };

    const importedCategories = toArray(
      importedVariablesMatched.importedVariable.catgry,
    );
    const currentCategories = toArray(currentVariableCloned.catgry);

    currentCategories.forEach((category) => {
      const stats = toArray(category.catStat);
      const baseStat = stats.find((stat) => !stat['@_wgtd']) ?? stats[0];
      const importedMatch = importedCategories.find((imported) =>
        sameCatValue(imported.catValu, category.catValu),
      );
      const importedWgtd = toArray(importedMatch?.catStat).find(
        (stat) => stat['@_wgtd'],
      );
      const mappedWgtVar = importedWgtd?.['@_wgt-var']
        ? reverseLookup[importedWgtd['@_wgt-var']]?.currentDatasetVariableID
        : undefined;

      if (importedWgtd && mappedWgtVar) {
        category.catStat = [
          baseStat,
          {
            ...structuredClone(importedWgtd),
            '@_wgt-var': mappedWgtVar,
          },
        ];
      } else {
        if (importedWgtd && importedWgtd['@_wgt-var']) {
          unmatchedWeights.push({
            variableID: currentVariable['@_ID'],
            variableName: currentVariable['@_name'],
            importedWgtVar: importedWgtd['@_wgt-var'],
          });
        }
        // Mirror the imported state: no (usable) weighted stat → unweighted.
        category.catStat = baseStat;
      }
    });
    if (currentCategories.length > 0) {
      currentVariableCloned.catgry = currentCategories;
    }
```

Notes:
- `currentCategories` elements come from `structuredClone(currentVariable)` (line 499), so
  in-place mutation is safe.
- The `@_wgt-var` attribute handling at lines 535-537 already covers the case where the
  imported weight variable has no match (sets `''`); the merge above is consistent with it.
- Imported categories that don't exist in the current dataset are ignored by construction.
- Caveat to record in the PR description: the *numbers* copied for weighted frequencies
  were computed against the imported dataset's data, so they are approximations until
  recomputed (see 4c).

### 4b. Update/extend `UnmatchedWeightVariable` reporting

No structural change needed — `unmatchedWeights` is already threaded through
`createNewVariables` (`xml.util.ts:446-482`) into state. Leave the existing TODO about
surfacing it in the UI (`xml.interface.ts:199`) untouched; it is out of scope.

### 4c. (Recommended follow-up — separate commit, optional)

Recompute weighted frequencies locally after import instead of trusting imported numbers:
add an effect listening to `XmlManipulationActions.importConversionSuccess` that, for each
distinct `@_wgt-var` now assigned, calls `changeWeightForSelectedVariables` with the
current `selectDatasetVariableCrossTabValues` data and dispatches the existing
weight-update success action. Reuse the Fix 3a guard (skip + warn if data unavailable).
Only attempt this after Fixes 1-3 are merged and verified; it touches the
xml-state/dataset-state boundary.

### 4d. Acceptance criteria

- Importing the EICS 2023 XML (issue #197 attachment) into a dataset whose codes are
  zero-padded transfers weight assignments onto the padded categories (numeric-equality
  fallback) and does **not** change any `catValu`, `labl`, or unweighted `catStat`.
- Variables whose imported weight reference has no match in the current dataset end up
  unweighted and are recorded in `unmatchedWeights`.
- Unit tests in Fix 5, test D pass.

---

## Fix 5 — regression tests

Test runner is **Karma/Jasmine** (`ng test`), not Vitest — follow the existing spec style
(`src/app/services/ddi.service.spec.ts`). Run headless:
`npm test -- --watch=false --browsers=ChromeHeadless`.

### Test A — XML round-trip fidelity (extend `src/app/services/ddi.service.spec.ts`)

Fixture (inline string):

```xml
<codeBook><dataDscr>
  <var ID="v1" name="REGION6">
    <catgry><catValu>01</catValu><labl level="category">Atlantic</labl>
      <catStat type="freq">150</catStat></catgry>
    <catgry><catValu>96</catValu><labl level="category">Valid skip</labl>
      <catStat type="freq">10</catStat></catgry>
  </var>
  <var ID="v2" name="HRLYEARN">
    <catgry><catValu>9999.97</catValu><labl level="category">DK</labl></catgry>
    <catgry><catValu>1.0</catValu><labl level="category">One</labl></catgry>
    <catgry><catValu>00</catValu><labl level="category">Zero</labl></catgry>
  </var>
</dataDscr></codeBook>
```

Assertions:
- `XMLtoJSON(fixture)` yields `catValu === '01'` (string, not number) for the first
  category.
- `JSONtoXML(XMLtoJSON(fixture))` contains the exact substrings `<catValu>01</catValu>`,
  `<catValu>9999.97</catValu>`, `<catValu>1.0</catValu>`, `<catValu>00</catValu>`.

### Test B — `splitLines` sanitization (same spec file)

- Input with quoted values and CRLF:
  `'CASEID\tPROV\r\n"000010"\t"01"\r\n"000011"\t"13"\r\n'`, variables `['v0', 'v1']` →
  `result['v1']` is `['01', '13']` (no quotes, no `\r`).
- Unquoted numerics pass through: `'396.9489'` stays `'396.9489'`.
- Escaped quote: `'"a\\"b"'` → `'a"b'`.
- Header mismatch still throws (existing behavior).

### Test C — `changeWeightForSelectedVariables` (new file `src/app/new.state/xml/xml.util.spec.ts`)

Build a minimal `allVariables` map with one weight variable `vw` and one categorical
variable `v1` with `catValu` values `'01'`, `'02'`, `'96'`.

- With crossTab data `{ v1: ['01','01','02'], vw: ['2','3','4'] }`: weighted stats are
  `[ {base}, {'#text': 5, ...} ]` for `'01'`, `9` total check for `'02'` → `4`, and `'96'`
  (absent from data) gets `0`.
- With crossTab data where `v1`'s values match **no** category (`['x','y','z']`):
  `catStat` is left untouched (all-zero sanity check).
- `weightID === 'remove'` strips `@_wgtd`/`@_wgt-var` and collapses `catStat` to a single
  object (regression for commit ac25c67).
- Non-numeric weight cells (`['2', 'NA', '3']`) are skipped, not propagated as `NaN`.

### Test D — import merge (same new spec file)

`editSingleVariable` is module-private; test through the exported `createNewVariables`
(`xml.util.ts:446`) with `variableTemplate = { weight: true, ... }`:

- Current variable categories `'01'/'02'` + imported variable (different `@_ID`) with
  corrupted codes `1`/`2` and weighted stats referencing imported weight ID `vOLD`, with
  `matchVariableIDs`-style mapping so `reverseLookup[vOLD]` resolves to current `vNEW`:
  result keeps `catValu '01'/'02'`, keeps current unweighted freqs, attaches imported
  weighted stats with `@_wgt-var === 'vNEW'`.
- Imported weight reference absent from `reverseLookup`: categories end up unweighted,
  `unmatchedWeights` contains one entry with the variable's ID/name.
- Imported variable with **no** `varGrp`/weight info and `template.weight = true`: current
  categories keep codes/labels/freqs, weighted stats (if any pre-existed) are removed.
- Imported categories that don't exist in the current variable are ignored (current
  category list length unchanged).

---

## Order of work, verification, and PR notes

1. Branch off `main`. Baseline first: `npx tsc --noEmit` and
   `npm test -- --watch=false --browsers=ChromeHeadless` must pass before any change.
2. Implement Fix 1 (+ tests A), then Fix 2 (+ tests B), then Fix 3 (+ tests C), then
   Fix 4 (+ tests D). Commit each as a separate conventional commit, e.g.:
   - `fix(xml): preserve XML text values verbatim during parse/serialize round-trip (#179)`
   - `fix(data): strip quotes and CR from tab subset values`
   - `fix(weight): fail safe when weight data is unavailable instead of writing zeros`
   - `fix(import): merge imported weights into existing categories instead of replacing catgry (#197)`
3. After each fix: `npx tsc --noEmit`, lint, full test run.
4. End-to-end round-trip check against real data (no Dataverse write needed) — run with
   `npx tsx` or plain node; it downloads a public DDI, round-trips it through the same
   fast-xml-parser options, and diffs every `<catValu>`:

   ```js
   // scripts/roundtrip-check.mjs (temporary, do not commit)
   import { XMLParser, XMLBuilder } from 'fast-xml-parser';
   const url = 'https://borealisdata.ca/api/access/datafile/894367/metadata/ddi';
   const xml = await (await fetch(url)).text();
   const opts = { ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false };
   const rebuilt = new XMLBuilder(opts).build(new XMLParser(opts).parse(xml));
   const vals = (s) => [...s.matchAll(/<catValu>([^<]*)<\/catValu>/g)].map((m) => m[1]);
   const a = vals(xml), b = vals(rebuilt);
   const diff = a.filter((v, i) => v !== b[i]);
   console.log(diff.length === 0 ? 'OK: all catValu preserved' : diff);
   ```

   Expected output: `OK: all catValu preserved`. Running the same script **without**
   `parseTagValue: false` must show the `01 → 1` corruption (sanity check that the script
   detects the bug).
5. Manual verification on demo (needs a draft dataset + API key): assign a weight to a
   zero-padded variable (e.g. EICS REGION6), save to Dataverse — must return 200; re-fetch
   the DDI and confirm `catValu` padding and non-zero weighted frequencies survived.

## Known issues intentionally out of scope

- Surfacing `unmatchedImportedWeights` in the import-results UI (existing TODO at
  `xml.interface.ts:199`).
- `splitLines` header-count mismatch and data-fetch failures are swallowed by
  `catchError → weightsFetchError` with no user-visible message (`xml.effects.ts:155-188`).
- XML exports downloaded through old DE versions are already corrupted on disk; imports of
  those files are mitigated by Fix 4's numeric-equality fallback, not fully repaired.
- Recomputing weighted frequencies after import (4c) — recommended follow-up.
