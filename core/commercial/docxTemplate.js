// Relleno de plantillas Word (.docx) subidas por cada empresa/instalador
// con los datos reales del presupuesto. Usa JSZip (vendor/jszip.min.js,
// MIT) para leer/escribir el .docx como zip; el reemplazo de {{variable}}
// se implementa a mano porque Word suele partir el texto de una variable
// en varias etiquetas <w:t> internas (por el autocorrector), asi que un
// simple buscar/reemplazar en el XML crudo casi siempre falla.

let jszipLoadPromise = null;
function loadJSZip(){
  if(window.JSZip) return Promise.resolve(window.JSZip);
  if(jszipLoadPromise) return jszipLoadPromise;
  jszipLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/jszip.min.js";
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => reject(new Error("No se pudo cargar la librería para leer archivos Word (JSZip)."));
    document.head.appendChild(script);
  });
  return jszipLoadPromise;
}

function decodeXmlEntities(str){
  return str
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function escapeXmlText(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Reemplaza {{variable}} dentro del XML de word/document.xml. Junta todo
// el texto visible en una sola cadena (con un mapa de posiciones hacia
// las etiquetas <w:t> originales) para poder encontrar variables que
// Word partio en mas de una etiqueta, y distribuye el resultado sobre
// esas mismas etiquetas sin tocar el resto del documento (estilos,
// imagenes, tablas, etc. quedan intactos).
export function fillDocumentXml(xml, vars){
  const textTagRegex = /<w:t(\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  const segments = [];
  let match;
  while((match = textTagRegex.exec(xml)) !== null){
    segments.push({
      matchStart: match.index,
      matchEnd: match.index + match[0].length,
      openTag: `<w:t${match[1] || ""}>`,
      text: match[2]
    });
  }
  if(!segments.length) return xml;

  const decoded = segments.map(seg => decodeXmlEntities(seg.text));
  const offsets = [];
  let acc = 0;
  decoded.forEach(t => { offsets.push(acc); acc += t.length; });
  const concatenated = decoded.join("");

  const tokenRegex = /\{\{(\w+)\}\}/g;
  const replacements = [];
  let tokenMatch;
  while((tokenMatch = tokenRegex.exec(concatenated)) !== null){
    const key = tokenMatch[1];
    if(!(key in vars)) continue;
    replacements.push({ start: tokenMatch.index, end: tokenMatch.index + tokenMatch[0].length, value: String(vars[key] ?? "") });
  }
  if(!replacements.length) return xml;

  const editsBySegment = segments.map(() => []);
  replacements.forEach(rep => {
    let valueWritten = false;
    for(let i = 0; i < segments.length; i++){
      const segStart = offsets[i];
      const segEnd = segStart + decoded[i].length;
      const overlapStart = Math.max(segStart, rep.start);
      const overlapEnd = Math.min(segEnd, rep.end);
      if(overlapStart >= overlapEnd) continue;
      editsBySegment[i].push({
        localStart: overlapStart - segStart,
        localEnd: overlapEnd - segStart,
        insertText: valueWritten ? "" : rep.value
      });
      valueWritten = true;
    }
  });

  const newTexts = decoded.map((text, i) => {
    const edits = editsBySegment[i].slice().sort((a, b) => b.localStart - a.localStart);
    let working = text;
    edits.forEach(e => { working = working.slice(0, e.localStart) + e.insertText + working.slice(e.localEnd); });
    return working;
  });

  let result = "";
  let cursor = 0;
  segments.forEach((seg, i) => {
    result += xml.slice(cursor, seg.matchStart);
    // Los valores con varias lineas (ej. la lista de materiales) necesitan
    // saltos de linea reales de Word (<w:br/>); un "\n" suelto dentro de
    // <w:t> se ignora al mostrarlo, quedaria todo pegado en una linea.
    const preserveTag = seg.openTag.includes("xml:space") ? seg.openTag : seg.openTag.replace("<w:t", '<w:t xml:space="preserve"');
    const lines = newTexts[i].split("\n");
    result += lines.map((line, idx) => `${preserveTag}${escapeXmlText(line)}</w:t>${idx < lines.length - 1 ? "<w:br/>" : ""}`).join("");
    cursor = seg.matchEnd;
  });
  result += xml.slice(cursor);
  return result;
}

/** Rellena un .docx (ArrayBuffer) con las variables reales y devuelve el Word final como Blob. */
export async function fillDocxTemplate(arrayBuffer, vars){
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docPath = "word/document.xml";
  const docFile = zip.file(docPath);
  if(!docFile){
    throw new Error("El archivo no parece ser un Word (.docx) valido: no se encontró word/document.xml.");
  }
  const docXml = await docFile.async("string");
  zip.file(docPath, fillDocumentXml(docXml, vars));
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

export function arrayBufferToBase64(buffer){
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for(let i = 0; i < bytes.length; i += chunkSize){
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64){
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
