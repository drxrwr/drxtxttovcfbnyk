let generatedFiles = [];

document.getElementById('processFilesBtn').addEventListener('click', function () {
  const files = document.getElementById('file-input').files;
  const fileAreas = document.getElementById('file-areas');

  generatedFiles = [];
  fileAreas.innerHTML = '';

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const textArea = document.createElement('textarea');
      textArea.classList.add('small-textarea');
      textArea.value = e.target.result;

      const fileNameInput = document.createElement('input');
      fileNameInput.type = 'text';
      fileNameInput.placeholder = 'Masukkan nama file VCF';
      fileNameInput.classList.add('file-name-input');

      const fileNameLabel = document.createElement('label');
      fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
      fileNameLabel.classList.add('file-name-label');

      const generateButton = document.createElement('button');
      generateButton.textContent = 'Generate VCF';
      generateButton.classList.add('generate-vcf-btn');

      generateButton.addEventListener('click', () => {
        const globalContactName = document.getElementById('globalContactNameInput').value.trim();
        const lines = textArea.value.split('\n').map(line => line.trim()).filter(l => l);
        const filename = fileNameInput.value.trim() || file.name.replace(/\.[^/.]+$/, '');
        const contactBase = globalContactName || filename;

        let vcfContent = '';
        lines.forEach((num, idx) => {
          let phone = num.startsWith('+') ? num : `+${num}`;
          vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactBase} ${idx + 1}\nTEL:${phone}\nEND:VCARD\n\n`;
        });

        generatedFiles.push({ name: `${filename}.vcf`, content: vcfContent });

        alert(`File ${filename}.vcf berhasil digenerate!`);
      });

      fileAreas.appendChild(fileNameLabel);
      fileAreas.appendChild(fileNameInput);
      fileAreas.appendChild(textArea);
      fileAreas.appendChild(generateButton);
    };
    reader.readAsText(file);
  });
});

// Proses ZIP (fix data hasil editan terbaru)
document.getElementById('processZipBtn').addEventListener('click', function () {
  const globalContactName = document.getElementById('globalContactNameInput').value.trim();
  generatedFiles = []; // reset ulang supaya pakai data edit terbaru

  const fileAreas = document.getElementById('file-areas');
  const blocks = fileAreas.querySelectorAll('.file-name-label');

  blocks.forEach((label, i) => {
    const fileNameInput = fileAreas.querySelectorAll('.file-name-input')[i];
    const textarea = fileAreas.querySelectorAll('textarea')[i];

    const lines = textarea.value.split('\n').map(line => line.trim()).filter(l => l);
    const filename = fileNameInput.value.trim() || label.textContent.replace('Nama File Asal: ', '').replace(/\.[^/.]+$/, '');
    const contactBase = globalContactName || filename;

    let vcfContent = '';
    lines.forEach((num, idx) => {
      let phone = num.startsWith('+') ? num : `+${num}`;
      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactBase} ${idx + 1}\nTEL:${phone}\nEND:VCARD\n\n`;
    });

    generatedFiles.push({ name: `${filename}.vcf`, content: vcfContent });
  });

  if (generatedFiles.length === 0) {
    alert('Belum ada file yang bisa diproses!');
    return;
  }

  document.getElementById('downloadZipBtn').disabled = false;
  alert('Data sudah difiks! Klik Download ZIP untuk mengunduh.');
});

// Download ZIP
document.getElementById('downloadZipBtn').addEventListener('click', function () {
  if (generatedFiles.length === 0) return;

  const zip = new JSZip();
  generatedFiles.forEach(file => {
    zip.file(file.name, file.content);
  });

  let zipNameInput = document.getElementById('zipFileNameInput').value.trim();
  let zipName = zipNameInput ? zipNameInput + '.zip' : 'contacts.zip';

  zip.generateAsync({ type: 'blob' }).then(function (content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = zipName;
    a.click();
  });
});
