export const columnLetterToIndex = (column = "") => {
  if (!column) {
    throw new Error("Column letter must be provided");
  }

  const letters = column.toUpperCase().trim();
  let index = 0;

  for (let i = 0; i < letters.length; i += 1) {
    const charCode = letters.charCodeAt(i);
    if (charCode < 65 || charCode > 90) {
      throw new Error(`Invalid column letter: ${column}`);
    }
    index = index * 26 + (charCode - 64);
  }

  return index - 1;
};

export const parseColumnSpecifier = (value) => {
  if (value === undefined || value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const letters = raw.toUpperCase();
  if (/^[A-Z]+$/.test(letters)) {
    return columnLetterToIndex(letters);
  }

  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric < 0) return null;
    return numeric;
  }

  return null;
};
