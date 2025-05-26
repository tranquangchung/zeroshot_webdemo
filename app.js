// Utility to escape HTML
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

// Utility to extract filename from a path
function extractFilename(filePath) {
  return filePath.split('/').pop();
}

// Main loader function
async function loadTable(models, tableBodyId) {
  const groupedData = {};

  // Fetch and group data per model
  for (const { name, path } of models) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to fetch ${name}`);
      const text = await res.text();
      const lines = text.trim().split(/\r?\n/);

      lines.forEach((line, idx) => {
        const [txt, input, synth] = line.split('|');
        const inputFilename = extractFilename(input);

        if (!groupedData[inputFilename]) {
          groupedData[inputFilename] = { txt, input, synths: {}, index: idx };
        }
        groupedData[inputFilename].synths[name] = synth;
      });
    } catch (err) {
      console.error(`Error processing model ${name}:`, err);
    }
  }

  // Populate the table
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = ''; // Clear existing

  const modelNames = models.map(m => m.name);
  const headerRow = document.querySelector(`#${tableBodyId}`).parentElement.querySelector('thead tr');

  // Dynamically update header
  while (headerRow.children.length > 3) headerRow.removeChild(headerRow.lastChild); // Keep first 3
  modelNames.forEach(name => {
    const th = document.createElement('th');
    th.textContent = `Audio Synthesis (${name})`;
    headerRow.appendChild(th);
  });

  Object.values(groupedData).forEach((data, i) => {
    const tr = document.createElement('tr');
    let rowHTML = `
      <td>${i + 1}</td>
      <td>${escapeHTML(data.txt)}</td>
      <td><audio controls src="${data.input}"></audio></td>
    `;
    modelNames.forEach(name => {
      const synthSrc = data.synths[name] || '';
      rowHTML += `<td>${synthSrc ? `<audio controls src="${synthSrc}"></audio>` : '-'}</td>`;
    });
    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });
}

// On DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const models = [
    { name: 'DAC', path: 'output_DAC_100KV2/synthesis_list.txt' },
    { name: 'MEL', path: 'output_Mel_100kV2/synthesis_list.txt' },
    { name: 'WavLM', path: 'output_SPK_100k_V2/synthesis_list.txt' },
    { name: 'WavLM/WavLM_MatchingSPK', path: 'output_SPK_Matching_80k/synthesis_list.txt' },
    { name: 'WavLM/MEL_MatchingSPK', path: 'output_Mel_Half_Trimp_180kV2/synthesis_list.txt' },
    // Add more here as needed
  ];

  loadTable(models, 'table-dac');
});
