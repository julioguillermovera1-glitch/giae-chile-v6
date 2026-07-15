import { buildReport, reportCategories, reportStyles } from "../../core/reportEngine.js";

function esc(value = ""){
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseStructuredData(text){
  const fields = {};
  const points = [];
  text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).forEach(line => {
    const colon = line.indexOf(":");
    if(colon > 0){
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if(key) fields[key] = value;
      else points.push(line);
    } else {
      points.push(line);
    }
  });
  return { fields, points };
}

function formatCategoryOptions(categories){
  return categories.map(category => `<option value="${esc(category.id)}">${esc(category.label)}</option>`).join("");
}

function formatStyleOptions(styles){
  return styles.map(style => `<option value="${esc(style)}">${esc(style)}</option>`).join("");
}

function escapePdfString(value){
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
}

function chunkArray(array, size){
  const result = [];
  for(let i = 0; i < array.length; i += size){
    result.push(array.slice(i, i + size));
  }
  return result;
}

function buildPdfBlob(report){
  const lines = [];
  lines.push(report.metadata.title);
  if(report.metadata.institution) lines.push(`Institución: ${report.metadata.institution}`);
  lines.push(`Autor: ${report.metadata.author}`);
  lines.push(`Audiencia: ${report.metadata.audience}`);
  lines.push(`Tipo: ${report.metadata.type}`);
  lines.push(`Estilo: ${report.metadata.style}`);
  lines.push(`Generado: ${report.metadata.generatedAt}`);
  lines.push("");
  lines.push("Resumen:");
  lines.push(report.body.intro);
  lines.push("");
  lines.push("Descripción:");
  lines.push(...report.body.details);
  lines.push("");
  lines.push("Conclusión:");
  lines.push(...report.body.closing);

  const pages = chunkArray(lines, 40);
  const objects = [];
  let objectId = 1;
  objects.push(`${objectId} 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj\n`);
  objects.push(`2 0 obj
<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index} 0 R`).join(" ")} ] /Count ${pages.length} >>
endobj\n`);

  const contentObjectIds = [];
  pages.forEach((pageLines, pageIndex) => {
    const stream = [`BT`, `/F1 12 Tf`, `50 760 Td`];
    pageLines.forEach(line => {
      stream.push(`(${escapePdfString(line)}) Tj`);
      stream.push(`T*`);
    });
    stream.push(`ET`);
    const streamText = stream.join(`\n`);
    const contentId = 3 + pageIndex * 2;
    contentObjectIds.push(contentId);
    objects.push(`${contentId} 0 obj
<< /Length ${streamText.length} >>
stream
${streamText}
endstream
endobj\n`);
  });

  pages.forEach((_, pageIndex) => {
    const pageId = 4 + pageIndex * 2;
    const contentId = contentObjectIds[pageIndex];
    objects.push(`${pageId} 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents ${contentId} 0 R >>
endobj\n`);
  });

  objects.push(`5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj\n`);

  const body = objects.join("");
  const xrefStart = body.length;
  const offsets = [];
  let pointer = 0;
  objects.forEach(object => {
    offsets.push(pointer);
    pointer += object.length;
  });

  const xref = [`xref`, `0 ${objects.length + 1}`, `0000000000 65535 f `];
  offsets.forEach(offset => {
    xref.push(offset.toString().padStart(10, "0") + " 00000 n ");
  });
  const trailer = `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;
  const pdf = `%%PDF-1.3\n${body}${xref.join("\n")}\n${trailer}`;
  return new Blob([pdf], { type: "application/pdf" });
}

function buildWordBlob(report){
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(report.metadata.title)}</title></head><body>${report.html}</body></html>`;
  return new Blob([html], { type: "application/msword;charset=utf-8" });
}

function buildPowerPointBlob(report){
  const slides = [];
  slides.push(`<section><h1>${esc(report.metadata.title)}</h1>${report.metadata.institution ? `<p><strong>Institución:</strong> ${esc(report.metadata.institution)}</p>` : ""}<p><strong>Autor:</strong> ${esc(report.metadata.author)}</p><p><strong>Audiencia:</strong> ${esc(report.metadata.audience)}</p></section>`);
  slides.push(`<section><h2>Resumen</h2><p>${esc(report.body.intro)}</p></section>`);
  slides.push(`<section><h2>Descripción</h2>${report.body.details.map(item => `<p>${esc(item)}</p>`).join("")}</section>`);
  slides.push(`<section><h2>Conclusión</h2>${report.body.closing.map(item => `<p>${esc(item)}</p>`).join("")}</section>`);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(report.metadata.title)}</title><style>section{page-break-after:always;border:1px solid #333;padding:24px;margin:20px;} h1,h2{color:#003366;}</style></head><body>${slides.join("")}</body></html>`;
  return new Blob([html], { type: "application/vnd.ms-powerpoint;charset=utf-8" });
}

function parseUploadedJson(data){
  if(Array.isArray(data)){
    return { fields: {}, points: data.map(item => String(item)) };
  }
  if(data && typeof data === "object"){
    const fields = {};
    const points = [];
    Object.entries(data).forEach(([key, value]) => {
      if(value && typeof value === "object"){
        points.push(`${key}: ${JSON.stringify(value)}`);
      } else {
        fields[key] = String(value);
      }
    });
    return { fields, points };
  }
  return { fields: {}, points: [String(data)] };
}

function parseUploadedCsv(text){
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0]?.split(/,|;/).map(cell => cell.trim());
  if(lines.length === 1 && header.length === 2){
    const values = header;
    return { fields: { [values[0]]: values[1] }, points: [] };
  }
  if(lines.length > 1 && header.length > 1){
    const points = lines.slice(1).map(line => line.trim());
    return { fields: {}, points };
  }
  return parseStructuredData(text);
}

function parseUploadedFile(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result;
      const ext = file.name.split('.').pop().toLowerCase();
      try {
        if(ext === 'json'){
          resolve(parseUploadedJson(JSON.parse(raw)));
          return;
        }
        if(ext === 'csv'){
          resolve(parseUploadedCsv(raw));
          return;
        }
      } catch (error) {
        resolve({ fields: {}, points: [String(raw)] });
        return;
      }
      resolve(parseStructuredData(String(raw)));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function applyUploadedData(host, parsed, filename){
  const dataInput = host.querySelector('#reportData');
  const fieldLines = Object.entries(parsed.fields).map(([key, value]) => `${key}: ${value}`);
  const combined = [...fieldLines, ...parsed.points].join('\n');
  if(combined){
    dataInput.value = combined;
  }
  const summary = host.querySelector('#reportSourceSummary');
  if(summary){
    summary.textContent = filename ? `Archivo cargado: ${filename}` : 'Información cargada desde archivo.';
  }
}

function showResult(host, report){
  const html = host.querySelector("#reportHtmlOutput");
  const markdown = host.querySelector("#reportMarkdownOutput");
  const title = host.querySelector("#reportPreviewTitle");
  title.textContent = report.metadata.title;
  html.innerHTML = report.html;
  markdown.textContent = report.markdown;
}

function downloadFile(filename, content, type){
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function render(host, state){
  const categories = reportCategories();
  const styles = reportStyles();

  host.innerHTML = `
    <section class="module-window report-module">
      <div class="module-head">
        <div>
          <p class="eyebrow">Generador de informes</p>
          <h3>Informe IA universal</h3>
          <p>Crea informes multi‑tema para cualquier área: matemática, lenguaje, cálculos, redes, ciencias y más.</p>
        </div>
      </div>

      <div class="admin-card report-builder">
        <div class="form-grid compact">
          <label>Título del informe<input id="reportTitle" placeholder="Informe de cálculo de cargas"></label>
          <label>Autor<input id="reportAuthor" placeholder="Nombre del autor"></label>
          <label>Audiencia<input id="reportAudience" placeholder="Ej: profesor, cliente, equipo técnico"></label>
          <label>Categoría<select id="reportCategory">${formatCategoryOptions(categories)}</select></label>
          <label>Estilo<select id="reportStyle">${formatStyleOptions(styles)}</select></label>
          <label>Lenguaje<select id="reportLanguage"><option value="es-CL">Español</option><option value="en-US">Inglés</option></select></label>
        </div>

        <label>Descripción breve<textarea id="reportDescription" rows="3" placeholder="Describe el objetivo del informe, el contexto y el público."></textarea></label>
        <label>Institución<input id="reportInstitution" placeholder="Nombre del instituto o universidad"></label>
        <label>Portada de institución<input id="reportCoverFile" type="file" accept="image/*"></label>
        <div class="cover-preview" id="reportCoverPreview" style="display:none;margin:10px 0;">
          <strong>Previsualización de portada</strong>
          <img id="reportCoverImage" style="max-width:100%;border-radius:10px;margin-top:8px;" alt="Portada cargada">
        </div>
        <label>Subir información<input id="reportSourceFile" type="file" accept=".json,.csv,.txt"></label>
        <div class="file-status" id="reportSourceSummary">No se ha subido información.</div>
        <label>Datos o información clave<textarea id="reportData" rows="5" placeholder="Escribe claves y valores o puntos relevantes. Ej:\nTema: Balance de fases\nResultado: 3 circuitos equilibrados\nObservación: Se recomienda usar conductores de 10 mm²"></textarea></label>
        <div class="top-actions wrap-actions">
          <button id="generateReportBtn" class="primary-action">Generar informe</button>
          <button id="downloadMarkdownBtn" class="secondary">Descargar Markdown</button>
          <button id="downloadHtmlBtn" class="secondary">Descargar HTML</button>
          <button id="downloadWordBtn" class="secondary">Descargar Word</button>
          <button id="downloadPdfBtn" class="secondary">Descargar PDF</button>
          <button id="downloadPptBtn" class="secondary">Descargar PowerPoint</button>
          <button id="copyMarkdownBtn" class="ghost">Copiar Markdown</button>
        </div>
      </div>

      <section class="admin-card report-preview">
        <h4>Vista previa</h4>
        <p class="small">El informe se puede editar aquí y después se descarga en el formato que necesites.</p>
        <div class="report-preview-meta"><strong id="reportPreviewTitle">Informe generado</strong></div>
        <div id="reportHtmlOutput" class="report-html-output"></div>
        <h4>Markdown</h4>
        <pre id="reportMarkdownOutput" class="report-markdown-output"></pre>
      </section>
    </section>
  `;

  let coverImageData = "";
  host.uploadedData = { fields: {}, points: [] };

  const updateCoverPreview = (src) => {
    const preview = host.querySelector("#reportCoverPreview");
    const image = host.querySelector("#reportCoverImage");
    if(src){
      image.src = src;
      preview.style.display = "block";
    } else {
      image.src = "";
      preview.style.display = "none";
    }
  };

  host.querySelector("#reportCoverFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => {
        coverImageData = reader.result;
        updateCoverPreview(coverImageData);
      };
      reader.readAsDataURL(file);
    } else {
      coverImageData = "";
      updateCoverPreview("");
    }
  });

  host.querySelector("#reportSourceFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if(file){
      const parsed = await parseUploadedFile(file);
      host.uploadedData = parsed;
      applyUploadedData(host, parsed, file.name);
    } else {
      host.uploadedData = { fields: {}, points: [] };
      applyUploadedData(host, host.uploadedData, "");
    }
  });

  const generate = () => {
    const title = host.querySelector("#reportTitle").value;
    const author = host.querySelector("#reportAuthor").value;
    const institution = host.querySelector("#reportInstitution").value;
    const audience = host.querySelector("#reportAudience").value;
    const type = host.querySelector("#reportCategory").value;
    const style = host.querySelector("#reportStyle").value;
    const language = host.querySelector("#reportLanguage").value;
    const description = host.querySelector("#reportDescription").value;
    const data = host.querySelector("#reportData").value;

    const typed = parseStructuredData(data);
    const combined = {
      fields: { ...host.uploadedData.fields, ...typed.fields },
      points: [ ...host.uploadedData.points, ...typed.points ]
    };

    const report = buildReport({ type, title, author, institution, audience, description, fields: combined.fields, points: combined.points, style, language, coverImage: coverImageData });
    showResult(host, report);
    host.report = report;
  };

  host.querySelector("#generateReportBtn").addEventListener("click", generate);
  const buildCurrentReport = () => {
    const title = host.querySelector("#reportTitle").value;
    const author = host.querySelector("#reportAuthor").value;
    const institution = host.querySelector("#reportInstitution").value;
    const audience = host.querySelector("#reportAudience").value;
    const type = host.querySelector("#reportCategory").value;
    const style = host.querySelector("#reportStyle").value;
    const language = host.querySelector("#reportLanguage").value;
    const description = host.querySelector("#reportDescription").value;
    const data = host.querySelector("#reportData").value;
    const typed = parseStructuredData(data);
    const combined = {
      fields: { ...host.uploadedData.fields, ...typed.fields },
      points: [ ...host.uploadedData.points, ...typed.points ]
    };
    const report = buildReport({ type, title, author, institution, audience, description, fields: combined.fields, points: combined.points, style, language, coverImage: coverImageData });
    return report;
  };

  host.querySelector("#downloadMarkdownBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    downloadFile(`${report.metadata.title.replace(/\s+/g, "-").toLowerCase() || "informe"}.md`, report.markdown, "text/markdown;charset=utf-8");
  });
  host.querySelector("#downloadHtmlBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    downloadFile(`${report.metadata.title.replace(/\s+/g, "-").toLowerCase() || "informe"}.html`, report.html, "text/html;charset=utf-8");
  });
  host.querySelector("#downloadWordBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    const blob = buildWordBlob(report);
    downloadFile(`${report.metadata.title.replace(/\s+/g, "-").toLowerCase() || "informe"}.doc`, blob, blob.type);
  });
  host.querySelector("#downloadPdfBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    const blob = buildPdfBlob(report);
    downloadFile(`${report.metadata.title.replace(/\s+/g, "-").toLowerCase() || "informe"}.pdf`, blob, blob.type);
  });
  host.querySelector("#downloadPptBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    const blob = buildPowerPointBlob(report);
    downloadFile(`${report.metadata.title.replace(/\s+/g, "-").toLowerCase() || "presentacion"}.ppt`, blob, blob.type);
  });
  host.querySelector("#copyMarkdownBtn").addEventListener("click", () => {
    const report = buildCurrentReport();
    navigator.clipboard?.writeText(report.markdown).then(() => alert("Markdown copiado al portapapeles.")).catch(() => alert("No se pudo copiar Markdown automáticamente."));
  });

  generate();
}
