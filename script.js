let filesData = [];
let zipBlob = null;

// Parse TXT menjadi list nomor
function parseTxt(content) {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Generate isi VCF
function generateVCF(name, numbers) {
  return numbers.map((num, i) => {
    let contactName = `${name} ${i+1}`;
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${num}\nEND:VCARD`;
  }).join("\n");
}

document.getElementById("processFile").addEventListener("click", () => {
  const input = document.getElementById("txtFile");
  const globalName = document.getElementById("globalName").value.trim();
  filesData = [];
  document.getElementById("filesContainer").innerHTML = "";

  if (!input.files.length) {
    alert("Pilih file TXT terlebih dahulu!");
    return;
  }

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const numbers = parseTxt(e.target.result);
      filesData.push({
        originalName: file.name,
        vcfName: file.name.replace(".txt", ".vcf"),
        numbers,
        globalName
      });
      renderFiles();
    };
    reader.readAsText(file);
  });
});

function renderFiles() {
  const container = document.getElementById("filesContainer");
  container.innerHTML = "";
  filesData.forEach((f, idx) => {
    const div = document.createElement("div");
    div.className = "file-block";
    div.innerHTML = `
      <h3>Nama File Asal: ${f.originalName}</h3>
      <label>Nama File VCF:</label>
      <input type="text" class="vcf-name-input" data-idx="${idx}" value="${f.vcfName}">
      <label>Isi Nomor:</label>
      <textarea data-idx="${idx}">${f.numbers.join("\n")}</textarea>
      <button onclick="downloadSingle(${idx})">Generate VCF</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll(".vcf-name-input").forEach(inp => {
    inp.addEventListener("input", e => {
      filesData[e.target.dataset.idx].vcfName = e.target.value.trim() || "untitled.vcf";
    });
  });

  container.querySelectorAll("textarea").forEach(area => {
    area.addEventListener("input", e => {
      filesData[e.target.dataset.idx].numbers = e.target.value.split(/\r?\n/).filter(x => x.trim().length);
    });
  });
}

function downloadSingle(idx) {
  const f = filesData[idx];
  const vcf = generateVCF(f.globalName || f.vcfName.replace(".vcf",""), f.numbers);
  const blob = new Blob([vcf], { type: "text/vcard" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = f.vcfName;
  a.click();
}

document.getElementById("processZip").addEventListener("click", async () => {
  if (!filesData.length) {
    alert("Proses file dulu sebelum membuat ZIP!");
    return;
  }
  const zip = new JSZip();
  filesData.forEach(f => {
    const vcf = generateVCF(f.globalName || f.vcfName.replace(".vcf",""), f.numbers);
    zip.file(f.vcfName, vcf);
  });
  zipBlob = await zip.generateAsync({ type: "blob" });
  document.getElementById("downloadZip").disabled = false;
  alert("ZIP berhasil diproses, klik Download ZIP!");
});

document.getElementById("downloadZip").addEventListener("click", () => {
  if (!zipBlob) return;

  let zipNameInput = document.getElementById("zipName").value.trim();
  let fileName = "contacts.zip";

  if (zipNameInput) {
    fileName = zipNameInput.endsWith(".zip") ? zipNameInput : zipNameInput + ".zip";
  } else {
    // otomatis: cek nama file
    let baseNames = filesData.map(f => f.vcfName.replace(".vcf", ""));
    let prefix = baseNames[0].replace(/\d+/g, "");
    let nums = baseNames.map(n => parseInt(n.match(/\d+/)?.[0] || "NaN")).filter(n => !isNaN(n));
    if (nums.length === baseNames.length && new Set(baseNames.map(n => n.replace(/\d+/g,""))).size === 1) {
      fileName = `${prefix}${Math.min(...nums)}-${Math.max(...nums)}.zip`;
    }
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(zipBlob);
  a.download = fileName;
  a.click();
});
