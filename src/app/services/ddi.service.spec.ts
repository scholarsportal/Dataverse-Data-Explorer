import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // provideHttpClient must come before provideHttpClientTesting so
      // requests hit the test backend instead of the real network.
      providers: [
        provideStore(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('XML round-trip fidelity (issue #179)', () => {
    // Dataverse matches catValu against its database by exact string
    // equality, so zero-padded ("01") and decimal ("1.0") codes must
    // survive parse + serialize unchanged.
    const fixture =
      '<codeBook><dataDscr>' +
      '<var ID="v1" name="REGION6">' +
      '<catgry><catValu>01</catValu><labl level="category">Atlantic</labl>' +
      '<catStat type="freq">150</catStat></catgry>' +
      '<catgry><catValu>96</catValu><labl level="category">Valid skip</labl>' +
      '<catStat type="freq">10</catStat></catgry>' +
      '</var>' +
      '<var ID="v2" name="HRLYEARN">' +
      '<catgry><catValu>9999.97</catValu><labl level="category">DK</labl></catgry>' +
      '<catgry><catValu>1.0</catValu><labl level="category">One</labl></catgry>' +
      '<catgry><catValu>00</catValu><labl level="category">Zero</labl></catgry>' +
      '</var>' +
      '</dataDscr></codeBook>';

    it('parses catValu as a string, preserving leading zeros', () => {
      const parsed = service.XMLtoJSON(fixture);
      const categories = parsed.codeBook.dataDscr.var[0].catgry;
      expect(categories[0].catValu).toBe('01');
      expect(categories[1].catValu).toBe('96');
    });

    it('preserves zero-padded and decimal catValu values through a full round trip', () => {
      const rebuilt = service.JSONtoXML(service.XMLtoJSON(fixture));
      expect(rebuilt).toContain('<catValu>01</catValu>');
      expect(rebuilt).toContain('<catValu>96</catValu>');
      expect(rebuilt).toContain('<catValu>9999.97</catValu>');
      expect(rebuilt).toContain('<catValu>1.0</catValu>');
      expect(rebuilt).toContain('<catValu>00</catValu>');
    });

    it('preserves frequency text values verbatim', () => {
      const rebuilt = service.JSONtoXML(service.XMLtoJSON(fixture));
      expect(rebuilt).toContain('<catStat type="freq">150</catStat>');
      expect(rebuilt).toContain('<catStat type="freq">10</catStat>');
    });
  });

  describe('single-category variables (issue #208)', () => {
    // fast-xml-parser yields a bare object for an element that occurs once;
    // <catgry> must always be an array so selectors can iterate it.
    const fixture =
      '<codeBook><dataDscr>' +
      '<var ID="v1" name="cps25_property_1" intrvl="discrete">' +
      '<labl level="variable">Own a residence</labl>' +
      '<catgry><catValu>1</catValu><labl level="category">1. Own a residence</labl>' +
      '<catStat type="freq">13114</catStat></catgry>' +
      '</var>' +
      '<var ID="v2" name="pes25_data_quality" intrvl="contin">' +
      '<catgry><catValu>1</catValu><labl level="category">1. Clean complete</labl>' +
      '<catStat type="freq">12513</catStat></catgry>' +
      '<catgry><catValu>2</catValu><labl level="category">2. PES speeder</labl>' +
      '<catStat type="freq">139</catStat></catgry>' +
      '</var>' +
      '</dataDscr></codeBook>';

    it('parses a lone <catgry> as a one-element array', () => {
      const parsed = service.XMLtoJSON(fixture);
      const categories = parsed.codeBook.dataDscr.var[0].catgry;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(1);
      expect(categories[0].catValu).toBe('1');
    });

    it('keeps multi-category variables as arrays', () => {
      const parsed = service.XMLtoJSON(fixture);
      expect(parsed.codeBook.dataDscr.var[1].catgry.length).toBe(2);
    });

    it('normalizes a lone <catgry> when the file has a single variable', () => {
      const single =
        '<codeBook><dataDscr><var ID="v1" name="X">' +
        '<catgry><catValu>1</catValu></catgry>' +
        '</var></dataDscr></codeBook>';
      const parsed = service.XMLtoJSON(single);
      expect(Array.isArray(parsed.codeBook.dataDscr.var[0].catgry)).toBe(true);
    });

    it('does not create <catgry> for variables without categories', () => {
      const none =
        '<codeBook><dataDscr><var ID="v1" name="X"></var>' +
        '<var ID="v2" name="Y"></var></dataDscr></codeBook>';
      const parsed = service.XMLtoJSON(none);
      expect(parsed.codeBook.dataDscr.var[0].catgry).toBeUndefined();
    });

    it('writes the XML back unchanged', () => {
      expect(service.JSONtoXML(service.XMLtoJSON(fixture))).toBe(fixture);
    });
  });

  describe('single-variable files and single <sumStat>', () => {
    // Same parser behaviour as the lone <catgry>: a file with one column has
    // one <var>, and a variable may carry one <sumStat>. Both must be arrays
    // or the dataset fails to load / the variable modal fails to render.
    const singleVariable =
      '<codeBook><dataDscr>' +
      '<var ID="v1" name="ONLY" intrvl="discrete">' +
      '<labl level="variable">The only column</labl>' +
      '<sumStat type="vald">20180.0</sumStat>' +
      '</var>' +
      '</dataDscr></codeBook>';

    const twoVariables =
      '<codeBook><dataDscr>' +
      '<var ID="v1" name="A"><sumStat type="vald">5.0</sumStat></var>' +
      '<var ID="v2" name="B">' +
      '<sumStat type="min">1.0</sumStat><sumStat type="max">9.0</sumStat>' +
      '</var>' +
      '</dataDscr></codeBook>';

    it('parses a lone <var> as a one-element array', () => {
      const variables = service.XMLtoJSON(singleVariable).codeBook.dataDscr.var;
      expect(Array.isArray(variables)).toBe(true);
      expect(variables.length).toBe(1);
      expect(variables[0]['@_ID']).toBe('v1');
    });

    it('parses a lone <sumStat> as a one-element array', () => {
      const variables = service.XMLtoJSON(twoVariables).codeBook.dataDscr.var;
      expect(Array.isArray(variables[0].sumStat)).toBe(true);
      expect(variables[0].sumStat.length).toBe(1);
      expect(variables[0].sumStat[0]['@_type']).toBe('vald');
      expect(variables[0].sumStat[0]['#text']).toBe('5.0');
    });

    it('keeps multiple <sumStat> elements as an array', () => {
      const variables = service.XMLtoJSON(twoVariables).codeBook.dataDscr.var;
      expect(variables[1].sumStat.length).toBe(2);
    });

    it('does not create <sumStat> for variables without statistics', () => {
      const none =
        '<codeBook><dataDscr><var ID="v1" name="X"></var></dataDscr></codeBook>';
      const variables = service.XMLtoJSON(none).codeBook.dataDscr.var;
      expect(variables[0].sumStat).toBeUndefined();
    });

    it('writes a single-variable file back unchanged', () => {
      expect(service.JSONtoXML(service.XMLtoJSON(singleVariable))).toBe(
        singleVariable,
      );
    });

    it('writes a lone <sumStat> back unchanged', () => {
      expect(service.JSONtoXML(service.XMLtoJSON(twoVariables))).toBe(
        twoVariables,
      );
    });
  });

  describe('splitLines tab-value sanitization (issue #197)', () => {
    it('strips surrounding quotes from character values', () => {
      const input = 'CASEID\tPROV\n"000010"\t"01"\n"000011"\t"13"\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v0']).toEqual(['000010', '000011']);
      expect(result['v1']).toEqual(['01', '13']);
    });

    it('handles CRLF line endings without leaving \\r on the last column', () => {
      const input = 'CASEID\tPROV\r\n"000010"\t"01"\r\n"000011"\t"13"\r\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v1']).toEqual(['01', '13']);
    });

    it('passes unquoted numeric values through unchanged', () => {
      const input = 'WEIGHTD\tHHTOTINC\n396.9489\t24733\n12.5\t0\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v0']).toEqual(['396.9489', '12.5']);
      expect(result['v1']).toEqual(['24733', '0']);
    });

    it('unescapes embedded quotes inside quoted values', () => {
      const input = 'NAME\n"a\\"b"\n';
      const result = service.splitLines(['v0'], input);
      expect(result['v0']).toEqual(['a"b']);
    });

    it('still throws when the column count does not match', () => {
      const input = 'A\tB\n1\t2\n';
      expect(() => service.splitLines(['v0'], input)).toThrowError(
        'The number of keys does not match the number of columns.',
      );
    });
  });

  describe('variable group serialization (issue #197)', () => {
    // Dataverse calls Long.parseLong on every space-separated token of
    // <varGrp var>, so var="" fails the whole save with a 500.
    const fixture =
      '<codeBook><dataDscr>' +
      '<varGrp ID="VG1"><labl>Empty in source</labl></varGrp>' +
      '<varGrp ID="VG2" var="v1  v2 "><labl>Padded</labl></varGrp>' +
      '<var ID="v1" name="A"></var><var ID="v2" name="B"></var>' +
      '</dataDscr></codeBook>';

    it('never serializes an empty var attribute', () => {
      const json = service.XMLtoJSON(fixture);
      const groups = json.codeBook.dataDscr.varGrp as { '@_var'?: string }[];
      groups[1]['@_var'] = '';
      const xml = service.JSONtoXML(json);
      expect(xml).not.toContain('var=""');
      expect(xml).toContain('<varGrp ID="VG1">');
      expect(xml).toContain('<varGrp ID="VG2">');
    });

    it('collapses padded var lists to single spaces', () => {
      const xml = service.JSONtoXML(service.XMLtoJSON(fixture));
      expect(xml).toContain('<varGrp ID="VG2" var="v1 v2">');
    });

    it('does not mutate the state passed in', () => {
      const json = service.XMLtoJSON(fixture);
      const before = structuredClone(json);
      service.JSONtoXML(json);
      expect(json).toEqual(before);
    });
  });
});
