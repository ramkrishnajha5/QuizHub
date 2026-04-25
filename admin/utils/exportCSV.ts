/**
 * CSV Export Utility
 * Exports data arrays to downloadable CSV files
 */

export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(h => {
      let val = row[h];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      // Escape double quotes
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
