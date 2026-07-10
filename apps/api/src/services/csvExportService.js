function flattenValue(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value) {
  const text = flattenValue(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function rowsToCsv(rows = [], preferredColumns = []) {
  const columns = preferredColumns.length
    ? preferredColumns
    : Array.from(rows.reduce((set, row) => {
        Object.keys(row || {}).forEach(key => set.add(key));
        return set;
      }, new Set()));

  const header = columns.map(escapeCsv).join(',');
  const body = rows.map(row => columns.map(column => escapeCsv(row ? row[column] : '')).join(','));
  return [header, ...body].join('\n');
}

function csvResponsePayload(filename, rows, columns = []) {
  return {
    filename,
    contentType: 'text/csv',
    rowCount: rows.length,
    content: rowsToCsv(rows, columns)
  };
}

module.exports = { flattenValue, escapeCsv, rowsToCsv, csvResponsePayload };
