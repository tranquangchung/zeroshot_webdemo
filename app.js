// Utility to escape HTML
function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

async function loadTable(listPathDAC, listPathMel, listPathWavLM, tableBodyId) {
  try {
    const resDAC = await fetch(listPathDAC);
    const resMel = await fetch(listPathMel);
    const resWavLM = await fetch(listPathWavLM);

    if (!resDAC.ok || !resMel.ok || !resWavLM.ok) {
      throw new Error('Failed to load one or more files');
    }

    const textDAC = await resDAC.text();
    const textMel = await resMel.text();
    const textWavLM = await resWavLM.text();

    const linesDAC = textDAC.trim().split(/\r?\n/);
    const linesMel = textMel.trim().split(/\r?\n/);
    const linesWavLM = textWavLM.trim().split(/\r?\n/);

    // Create an object to group entries by their audio prompt
    const groupedData = {};

    // Function to group lines by audio prompt
    // Utility to extract filename from a path
    function extractFilename(filePath) {
      return filePath.split('/').pop();
    }

    const groupData = (lines, model) => {
      lines.forEach((line, index) => {
        const [txt, input, synth] = line.split('|');

        // Extract the filenames from the input and synthesis paths
        const inputFilename = extractFilename(input);

        // Group data by the audio prompt (input filename)
        if (!groupedData[inputFilename]) {
          groupedData[inputFilename] = { txt, input: input, synths: { [model]: synth }, index };
        } else {
          groupedData[inputFilename].synths[model] = synth;
        }
      });
    };


    // Group data for each model
    groupData(linesDAC, 'DAC');
    groupData(linesMel, 'MEL');
    groupData(linesWavLM, 'WavLM');

    // Populate table
    const tbody = document.getElementById(tableBodyId);
    tbody.innerHTML = ''; // clear

    Object.values(groupedData).forEach((data, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.index + 1}</td>
        <td>${escapeHTML(data.txt)}</td>
        <td><audio controls src="${data.input}"></audio></td>
        <td><audio controls src="${data.synths['DAC']}"></audio></td>
        <td><audio controls src="${data.synths['MEL']}"></audio></td>
        <td><audio controls src="${data.synths['WavLM']}"></audio></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    document.getElementById(tableBodyId).innerHTML = `
      <tr><td colspan="6" class="has-text-danger">
        Error loading data.
      </td></tr>
    `;
  }
}

// On DOM ready, load all versions and combine data into one table
document.addEventListener('DOMContentLoaded', () => {
  loadTable(
    'output_DAC/synthesis_list.txt',
    'output_Mel_100k/synthesis_list.txt',
    'output_SPK_100k/synthesis_list.txt',
    'table-dac' // You can use the same table for all versions now
  );
});
