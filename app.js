// Utility to escape HTML
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

// Fetch & render one table
async function loadTable(listPath, tableBodyId) {
  try {
    const res = await fetch(listPath);
    if (!res.ok) throw new Error(`Failed to load ${listPath}`);
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    const tbody = document.getElementById(tableBodyId);
    tbody.innerHTML = ''; // clear

    lines.forEach(line => {
      const [txt, input, synth] = line.split('|');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHTML(txt)}</td>
        <td><audio controls src="${input}"></audio></td>
        <td><audio controls src="${synth}"></audio></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    document.getElementById(tableBodyId).innerHTML = `
      <tr><td colspan="3" class="has-text-danger">
        Error loading data.
      </td></tr>
    `;
  }
}

// On DOM ready, load both versions
document.addEventListener('DOMContentLoaded', () => {
  loadTable('output_DAC/synthesis_list.txt', 'table-dac');
  loadTable('output_MEL/synthesis_list.txt', 'table-mel');
});
