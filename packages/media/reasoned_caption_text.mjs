import { createHash } from 'node:crypto';

const LINE_LIMIT = 62, LINES_PER_PAGE = 2, MAX_PAGES = 32, MAX_TEXT = 4096;
const bytesHash = value => createHash('sha256').update(value).digest('hex');
const hash = value => bytesHash(JSON.stringify(value));
const fail = code => { throw new Error(code); };
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const numeric = /^[+−-]?\d+(?:[.,]\d+)?(?:\/\d+)?$/u;
const unit = /^(?:cm²|cm|m²|m|santimetre|santimetrekare|metre|metrekare|adet)$/u;
const operator = /^[+−\-×÷=]$/u;
const withoutPunctuation = value => value.replace(/[.,;:!?)]+$/u, '');

function textAtoms(text) {
  const tokens = [...text.matchAll(/\S+/gu)].map(match => ({ text: match[0], start: match.index, end: match.index + match[0].length }));
  function operand(index) {
    const token = tokens[index];
    if (!token || !numeric.test(withoutPunctuation(token.text))) return null;
    let endIndex = index, terminated = token.text !== withoutPunctuation(token.text);
    if (!terminated && tokens[index + 1] && unit.test(withoutPunctuation(tokens[index + 1].text))) {
      endIndex++; terminated = tokens[endIndex].text !== withoutPunctuation(tokens[endIndex].text);
    }
    return { endIndex, terminated };
  }
  const atoms = [];
  for (let index = 0; index < tokens.length; index++) {
    const first = index; let read = operand(index);
    if (read) {
      index = read.endIndex;
      while (!read.terminated && tokens[index + 1] && operator.test(tokens[index + 1].text)) {
        const next = operand(index + 2); if (!next) break;
        index = next.endIndex; read = next;
      }
    }
    const atom = { start: tokens[first].start, end: tokens[index].end };
    if (atom.end - atom.start > LINE_LIMIT) fail('reasoned_caption_token_too_long');
    atoms.push(atom);
  }
  return atoms;
}

/** Pure text utility, not source validation, capability or approval. Its literal
 * strings must go to textContent, never innerHTML or an SVG/HTML string sink. */
export function paginateReasonedCaptionText(text) {
  if (arguments.length !== 1 || typeof text !== 'string' || !text || text.length > MAX_TEXT || text.trim() !== text
    || /[\u0000-\u001f\u007f]/u.test(text)
    || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(text)) fail('invalid_reasoned_caption_text');
  const atoms = textAtoms(text), lines = []; let start = atoms[0].start, end = atoms[0].end;
  for (let index = 1; index < atoms.length; index++) {
    const atom = atoms[index];
    if (atom.end - start <= LINE_LIMIT) end = atom.end;
    else { lines.push({ start, end, separatorAfter: text.slice(end, atom.start) }); start = atom.start; end = atom.end; }
  }
  lines.push({ start, end, separatorAfter: '' });
  if (lines.length > LINES_PER_PAGE * MAX_PAGES) fail('reasoned_caption_page_budget_exceeded');
  const pages = [];
  for (let index = 0; index < lines.length; index += LINES_PER_PAGE) {
    const spans = lines.slice(index, index + LINES_PER_PAGE);
    pages.push({ pageIndex: pages.length, lines: spans.map(span => text.slice(span.start, span.end)), lineSpans: spans });
  }
  const paging = { lineLimitCodeUnits: LINE_LIMIT, linesPerPage: LINES_PER_PAGE, maxPages: MAX_PAGES,
    measurement: 'utf16_code_units_not_rendered_glyph_width', whitespacePolicy: 'exact_source_spans_with_separator_after',
    pageCount: pages.length, displayTextSha256: bytesHash(text), atomPolicy: 'whole_words_number_units_and_supported_math_expressions' };
  return freeze({ contentFormat: 'plain_text_textContent_only', sourceAuthority: 'none', paging, pages, pagingSha256: hash({ paging, pages }) });
}
