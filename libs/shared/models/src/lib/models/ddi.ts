/**
 * Raw DDI Codebook 2.5 types as produced by fast-xml-parser with:
 *   ignoreAttributes: false,
 *   attributeNamePrefix: '@_',
 *   isArray: (name) => ['var','varGrp','catgry','sumStat','catValu','notes'].includes(name)
 *
 * These types preserve XML fidelity — they are the canonical source of truth
 * for round-tripping DDI XML to/from Dataverse. Normalized DdeVariable[] is
 * derived from these for the read-only view layer.
 *
 * Reference: https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/
 */

// ---------------------------------------------------------------------------
// Top-level structure
// ---------------------------------------------------------------------------

/** Root wrapper — fast-xml-parser returns `{ codeBook: ... }` from DDI XML. */
export interface DDIJsonStructure {
  codeBook: DDICodeBook;
}

/**
 * DDI Codebook root element.
 * Schema: docDscr*, stdyDscr+, fileDscr*, dataDscr*, otherMat*
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_codeBook.html
 */
export interface DDICodeBook {
  '@_xmlns'?: string;
  '@_version'?: string;
  '@_ID'?: string;
  '@_xml-lang'?: string;
  '@_codeBookAgency'?: string;
  docDscr?: DDIDocDscr;
  stdyDscr?: DdiStdyDscr;
  fileDscr?: DDIFileDscr;
  dataDscr?: DDIDataDscr;
  otherMat?: unknown;
}

// ---------------------------------------------------------------------------
// Document description (metadata about the DDI document itself)
// ---------------------------------------------------------------------------

/**
 * Document description — metadata about the DDI file itself (not the study).
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_docDscr.html
 */
export interface DDIDocDscr {
  citation?: DDICitation;
}

/** Bibliographic citation used in both docDscr and stdyDscr. */
export interface DDICitation {
  titlStmt?: DDITitlStmt;
  biblCit?: string;
}

/** Title statement containing the title and optional ID. */
export interface DDITitlStmt {
  titl?: string;
  IDNo?: string | DDIIdNo;
}

/** Identification number with agency attribution. */
export interface DDIIdNo {
  '#text': string;
  '@_agency'?: string;
}

// ---------------------------------------------------------------------------
// Study description
// ---------------------------------------------------------------------------

/**
 * Study description — metadata about the research study.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_stdyDscr.html
 */
export interface DdiStdyDscr {
  citation?: DDICitation;
}

// ---------------------------------------------------------------------------
// File description
// ---------------------------------------------------------------------------

/**
 * File description — metadata about the physical data file.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_fileDscr.html
 */
export interface DDIFileDscr {
  '@_ID'?: string;
  '@_URI'?: string;
  fileTxt?: DDIFileTxt;
  notes?: DDINote[];
}

/** File-level text metadata: name, dimensions, type. */
export interface DDIFileTxt {
  fileName?: string;
  dimensns?: DDIDimensns;
  fileType?: string;
}

/** Dataset dimensions — case count and variable count. */
export interface DDIDimensns {
  caseQnty?: string | number;
  varQnty?: string | number;
}

// ---------------------------------------------------------------------------
// Data description (variables, groups, categories)
// ---------------------------------------------------------------------------

/**
 * Data description section — contains all variables and variable groups.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_dataDscr.html
 */
export interface DDIDataDscr {
  var: DDIVar[];
  varGrp?: DDIVarGrp[];
}

/**
 * A single variable in the DDI codebook.
 *
 * Key attributes:
 * - `@_ID`: Unique identifier (e.g. "v1")
 * - `@_name`: Variable name as it appears in the data file
 * - `@_intrvl`: "contin" | "discrete" (measurement interval)
 * - `@_wgt`: "wgt" if this variable is a weight variable
 * - `@_wgt-var`: IDREF to the weight variable applied to this variable
 * - `@_dcml`: Number of decimal places
 * - `@_nature`: "nominal" | "ordinal" | "interval" | "ratio" | "percent" | "other"
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_var.html
 */
export interface DDIVar {
  '@_ID': string;
  '@_name': string;
  '@_intrvl'?: string;
  '@_wgt'?: string;
  '@_wgt-var'?: string;
  '@_files'?: string;
  '@_dcml'?: string;
  '@_nature'?: string;
  '@_vendor'?: string;
  '@_catQnty'?: string;
  '@_representationType'?: string;
  labl?: DDILabl | DDILabl[];
  qstn?: DDIQuestion;
  universe?: string;
  notes?: DDINote[];
  txt?: string;
  concept?: string;
  catgry?: DDICategory[];
  sumStat?: DDISumStat[];
  valrng?: DDIValrng;
  invalrng?: DDIValrng;
  varFormat?: DDIVarFormat;
}

/**
 * Label element — used on variables, categories, and groups.
 * The `@_level` attribute distinguishes variable-level vs. category-level labels.
 */
export interface DDILabl {
  '#text': string;
  '@_level'?: string;
}

/**
 * Question text associated with a variable.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_qstn.html
 */
export interface DDIQuestion {
  preQTxt?: string;
  qstnLit?: string;
  postQTxt?: string;
  ivuInstr?: string;
  forward?: string;
  backward?: string;
}

/**
 * Note element — annotations attached to variables, files, or other elements.
 * Mixed content: may contain text and/or child elements.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_notes.html
 */
export interface DDINote {
  '#text'?: string;
  '@_type'?: string;
  '@_subject'?: string;
  '@_level'?: string;
  '@_resp'?: string;
}

/**
 * A single category (code value) within a variable.
 *
 * Schema: catValu?, labl*, txt*, catStat*
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_catgry.html
 */
export interface DDICategory {
  '@_missing'?: string;
  '@_missType'?: string;
  '@_excls'?: string;
  catValu?: string | number | DDICatValu;
  labl?: DDILabl;
  txt?: string;
  catStat?: DDICatStat | DDICatStat[];
}

/**
 * Category value — the actual code value for a category.
 * Usually appears as simple text content.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_catValu.html
 */
export interface DDICatValu {
  '#text'?: string | number;
}

/**
 * Category-level statistic (e.g. frequency count, percentage).
 *
 * `@_type` values: "freq" | "percent" | "crosstab" | "other"
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_catStat.html
 */
export interface DDICatStat {
  '#text': string | number;
  '@_type'?: string;
  '@_wgtd'?: string;
  '@_wgt-var'?: string;
  '@_otherType'?: string;
  '@_weight'?: string;
}

/**
 * Summary statistic for a variable (mean, median, mode, etc.).
 *
 * `@_type` values: "mean" | "medn" | "mode" | "vald" | "invd" | "min" | "max" | "stdev" | "other"
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_sumStat.html
 */
export interface DDISumStat {
  '#text': string | number;
  '@_type': string;
  '@_wgtd'?: string;
  '@_wgt-var'?: string;
  '@_otherType'?: string;
  '@_weight'?: string;
}

/**
 * Variable format description (SAS, SPSS, etc.).
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_varFormat.html
 */
export interface DDIVarFormat {
  '@_type'?: string;
  '@_formatname'?: string;
  '@_schema'?: string;
  '@_category'?: string;
  '@_otherSchema'?: string;
  '@_otherCategory'?: string;
  '@_URI'?: string;
}

/**
 * Valid or invalid range specification for a variable.
 * Used by both `valrng` and `invalrng` elements.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_valrng.html
 */
export interface DDIValrng {
  range?: DDIRange;
  key?: DDILabl;
}

/** Numeric range with min/max bounds. */
export interface DDIRange {
  '@_min'?: string | number;
  '@_max'?: string | number;
  '@_UNITS'?: string;
}

/**
 * Variable group — logical grouping of related variables.
 *
 * The `@_var` attribute is a space-separated list of variable IDs belonging to the group.
 *
 * @see https://docs.ddialliance.org/DDI-Codebook/2.5/xmlschema/codebook_xsd_Element_varGrp.html
 */
export interface DDIVarGrp {
  '@_ID': string;
  '@_var'?: string;
  '@_varGrp'?: string;
  '@_name'?: string;
  '@_type'?: string;
  labl?: string | DDILabl;
  txt?: string;
  concept?: string;
  defntn?: string;
  universe?: string;
  notes?: DDINote[];
}
