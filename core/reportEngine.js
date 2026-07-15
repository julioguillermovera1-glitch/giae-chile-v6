const REPORT_CATEGORIES = [
  { id: "tecnico", label: "Técnico", description: "Informes de ingeniería, cálculos y resultados técnicos." },
  { id: "educativo", label: "Educativo", description: "Informes y resúmenes para clases, guías y aprendizaje." },
  { id: "cientifico", label: "Científico", description: "Informes de ciencias, experimentos y análisis de datos." },
  { id: "matematicas", label: "Matemáticas", description: "Informes de problemas, resultados y explicaciones paso a paso." },
  { id: "lenguaje", label: "Lenguaje", description: "Informes de análisis de texto, redacción y lecturas." },
  { id: "redes", label: "Redes", description: "Informes sobre sistemas, arquitecturas y plataformas de comunicación." },
  { id: "comercial", label: "Comercial", description: "Informes de negocios, propuestas y resumen ejecutivo." }
];

const REPORT_STYLES = [
  "Técnico",
  "Formal",
  "Académico",
  "Didáctico",
  "Resumen",
  "Narrativo"
];

function sanitize(value){
  return String(value || "").trim();
}

function createMetadata({ type, title, author, audience, style, language, institution, coverImage }){
  return {
    id: `report-${Date.now()}`,
    type: type || "genérico",
    title: sanitize(title) || "Informe generado",
    author: sanitize(author) || "Generador IA",
    institution: sanitize(institution) || "",
    audience: sanitize(audience) || "Público general",
    style: sanitize(style) || "Técnico",
    language: sanitize(language) || "es-CL",
    coverImage: coverImage || "",
    generatedAt: new Date().toLocaleString("es-CL")
  };
}

function buildSection(title, paragraphs){
  const cleanTitle = sanitize(title);
  return {
    title: cleanTitle,
    paragraphs: paragraphs.filter(Boolean).map(p => sanitize(p))
  };
}

function makeHtmlParagraphs(paragraphs){
  return paragraphs.map(text => `<p>${text}</p>`).join("\n");
}

function makeMarkdownParagraphs(paragraphs){
  return paragraphs.map(text => `${text}\n`).join("\n");
}

function buildList(items){
  return items.filter(Boolean).map(item => `- ${item}`).join("\n");
}

function createNarrative({ type, description, fields, points, style }){
  const title = type ? `Informe ${type}` : "Informe generado";
  const intro = description ? `Este informe presenta ${description.toLowerCase()}.` : `Este documento sintetiza información relevante sobre ${type || "un tema específico"}.`;
  const details = [];

  if(Object.keys(fields).length){
    details.push(`Se incluyen los siguientes datos clave:`);
    for(const [key, value] of Object.entries(fields)){
      details.push(`${key}: ${value}.`);
    }
  }

  if(points.length){
    details.push(`Puntos de análisis:`);
    points.forEach(point => details.push(`• ${point}`));
  }

  const closing = style === "Resumen"
    ? "A continuación se presenta el resumen ejecutivo del tema."
    : "El informe concluye con recomendaciones y observaciones para el lector.";

  return {
    title,
    intro,
    details,
    closing
  };
}

function createConclusion({ fields, points, type }){
  const facts = [];
  if(Object.keys(fields).length){
    facts.push(`Los datos clave proporcionados incluyen ${Object.keys(fields).join(", ")}.`);
  }
  if(points.length){
    facts.push(`También se consideran ${points.length} puntos de análisis relevantes.`);
  }
  if(!facts.length){
    facts.push(`Este informe se generó a partir de información libre sin datos estructurados.`);
  }
  facts.push(`Se recomienda revisar las conclusiones con un experto en ${type || "la materia"} cuando corresponda.`);
  return facts;
}

function buildHtmlReport(metadata, body){
  return `
    <article class="report-output">
      ${metadata.coverImage ? `<figure class="report-cover"><img src="${metadata.coverImage}" alt="Portada de ${metadata.institution || metadata.title}"></figure>` : ""}
      <header>
        <h1>${metadata.title}</h1>
        ${metadata.institution ? `<p><strong>Institución:</strong> ${metadata.institution}</p>` : ""}
        <p><strong>Tipo:</strong> ${metadata.type} · <strong>Estilo:</strong> ${metadata.style}</p>
        <p><strong>Autor:</strong> ${metadata.author} · <strong>Público:</strong> ${metadata.audience}</p>
        <p><strong>Generado:</strong> ${metadata.generatedAt}</p>
      </header>
      <section>
        <h2>Resumen</h2>
        ${makeHtmlParagraphs([body.intro])}
      </section>
      <section>
        <h2>Descripción</h2>
        ${makeHtmlParagraphs(body.details)}
      </section>
      <section>
        <h2>Conclusión</h2>
        ${makeHtmlParagraphs(body.closing)}
      </section>
    </article>
  `;
}

function buildMarkdownReport(metadata, body){
  return `${metadata.coverImage ? `![Portada](${metadata.coverImage})\n\n` : ""}# ${metadata.title}

${metadata.institution ? `**Institución:** ${metadata.institution}\n\n` : ""}**Tipo:** ${metadata.type} · **Estilo:** ${metadata.style}

**Autor:** ${metadata.author} · **Público:** ${metadata.audience}

**Generado:** ${metadata.generatedAt}

## Resumen

${body.intro}

## Descripción

${makeMarkdownParagraphs(body.details)}

## Conclusión

${makeMarkdownParagraphs(body.closing)}
`;
}

export function buildReport(options){
  const metadata = createMetadata(options || {});
  const narrative = createNarrative({
    type: options?.type,
    description: options?.description,
    fields: options?.fields || {},
    points: options?.points || [],
    style: options?.style
  });

  const body = {
    intro: narrative.intro,
    details: narrative.details,
    closing: createConclusion({
      fields: options?.fields || {},
      points: options?.points || [],
      type: options?.type
    })
  };

  return {
    metadata,
    body,
    html: buildHtmlReport(metadata, body),
    markdown: buildMarkdownReport(metadata, body)
  };
}

export function reportCategories(){
  return REPORT_CATEGORIES;
}

export function reportStyles(){
  return REPORT_STYLES;
}
