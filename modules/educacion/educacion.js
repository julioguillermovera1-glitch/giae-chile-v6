const lessons = [
  {
    id: "empalme",
    title: "Qué es un empalme eléctrico",
    summary: "Explica, con lenguaje simple, el punto donde la red de la distribuidora se conecta con la instalación del usuario.",
    body: [
      "Un empalme es la conexión entre la red eléctrica de la distribuidora y la instalación de una vivienda, local o recinto.",
      "Normalmente considera acometida, equipo de medida, protección de empalme y canalización asociada, según el proyecto y las exigencias aplicables.",
      "No debe ser intervenido por cualquier persona. Para trabajos reales se requiere instalador autorizado y coordinación con la empresa distribuidora cuando corresponda."
    ]
  },
  {
    id: "materiales",
    title: "Materiales que se suelen revisar",
    summary: "Muestra los elementos básicos que una persona debería reconocer antes de aceptar un trabajo o presupuesto.",
    body: [
      "Los materiales deben corresponder al tipo de instalación, corriente de diseño, canalización y condiciones del lugar.",
      "No basta con que un material sea barato o esté disponible. Debe ser técnicamente adecuado y quedar instalado de forma segura.",
      "Cuando un presupuesto no identifica materiales, marcas, medidas o cantidades, conviene pedir aclaración antes de aprobarlo."
    ]
  },
  {
    id: "presupuesto",
    title: "Cómo leer una cotización",
    summary: "Ayuda a distinguir una cotización clara de una incompleta o riesgosa.",
    body: [
      "Una cotización clara debe indicar alcance del trabajo, materiales principales, mano de obra, plazos, condiciones y datos del responsable.",
      "Si una cotización promete una instalación completa sin mencionar tablero, protecciones, puesta a tierra o certificación cuando corresponda, debe revisarse con cuidado.",
      "El precio más bajo no siempre es el más conveniente si omite seguridad, materiales adecuados o documentación técnica."
    ]
  },
  {
    id: "seguridad",
    title: "Seguridad y límites del aprendizaje",
    summary: "Deja claro qué se puede aprender y qué no debe ejecutarse sin profesional competente.",
    body: [
      "Este módulo educa para comprender, preguntar y evaluar mejor. No autoriza a intervenir instalaciones energizadas.",
      "Toda instalación real debe cumplir la normativa aplicable y ser ejecutada o revisada por personal competente.",
      "Ante dudas, fallas, olor a quemado, protecciones que se disparan o cables expuestos, se debe detener el uso y solicitar revisión profesional."
    ]
  }
];

const materials = [
  ["Conductor", "Transporta la energía eléctrica. Debe seleccionarse por sección, aislación, corriente admisible y condiciones de instalación."],
  ["Canalización", "Protege y ordena los conductores. Puede ser ducto, tubería, bandeja u otro sistema autorizado para el uso previsto."],
  ["Tablero", "Agrupa protecciones y permite ordenar circuitos. Debe quedar identificado y accesible para operación segura."],
  ["Interruptor automático", "Protege frente a sobrecargas y cortocircuitos dentro de su rango de operación."],
  ["Interruptor diferencial", "Ayuda a proteger frente a fugas de corriente. No reemplaza la puesta a tierra ni otras protecciones."],
  ["Puesta a tierra", "Sistema que ayuda a conducir corrientes de falla y estabilizar referencias de seguridad. Requiere diseño y medición."],
  ["Medidor", "Registra el consumo eléctrico. Su instalación y condiciones dependen de la distribuidora."],
  ["Caja o gabinete", "Contiene equipos y conexiones. Debe ser adecuado al ambiente y permitir mantención segura."]
];

const questions = [
  "¿La cotización identifica al instalador o empresa responsable?",
  "¿Indica qué trabajos incluye y qué trabajos no incluye?",
  "¿Menciona tablero, protecciones, canalización y puesta a tierra cuando aplican?",
  "¿Señala materiales principales con cantidad o descripción suficiente?",
  "¿Incluye plazo, garantía o condiciones de pago?",
  "¿Aclara si considera trámites, documentación o certificación cuando corresponda?"
];

export function render(host, state) {
  host.innerHTML = `
    <section class="module-window aula-module">
      <div class="module-head">
        <div>
          <p class="eyebrow">Acceso libre</p>
          <h3>Aula Técnica GIAE</h3>
          <p>Educación eléctrica básica para personas, estudiantes y comunidades. Contenido gratuito, sin licencia pagada y sin reemplazar al instalador autorizado.</p>
        </div>
        <div class="aula-stamp">Uso educativo</div>
      </div>

      <div class="policy-box">
        <strong>Alcance del módulo.</strong>
        Este espacio enseña a comprender materiales, empalmes, presupuestos y riesgos. No entrega autorización para ejecutar trabajos eléctricos reales ni reemplaza la revisión profesional.
      </div>

      <div class="aula-layout">
        <aside class="aula-index" id="aulaIndex"></aside>
        <article class="aula-content" id="aulaContent"></article>
      </div>

      <section class="admin-card">
        <h4>Materiales básicos de una instalación</h4>
        <div class="aula-material-grid">
          ${materials.map(([name, desc]) => `<article><strong>${name}</strong><p>${desc}</p></article>`).join("")}
        </div>
      </section>

      <section class="admin-card">
        <h4>Revisión simple de una cotización</h4>
        <p class="small-note">Marca los puntos que aparecen en la cotización recibida. Esta revisión no aprueba ni rechaza el trabajo; solo ayuda a detectar información faltante.</p>
        <div class="quote-checklist">
          ${questions.map((q, i) => `<label><input type="checkbox" data-quote-check="${i}"> ${q}</label>`).join("")}
        </div>
        <button class="secondary" id="quoteReviewBtn">Revisar claridad de cotización</button>
        <div id="quoteReviewResult" class="result-box hidden"></div>
      </section>

      <section class="admin-card">
        <h4>Formación comunitaria</h4>
        <p>Este apartado está pensado para juntas de vecinos, sectores rurales y comunidades mapuche que necesiten orientación básica para entender proyectos eléctricos, empalmes, materiales y presupuestos antes de contratar un trabajo.</p>
        <div class="aula-steps">
          <span>1. Entender la necesidad eléctrica</span>
          <span>2. Solicitar evaluación técnica</span>
          <span>3. Revisar materiales y protecciones</span>
          <span>4. Comparar cotización con alcance real</span>
          <span>5. Exigir ejecución segura y documentación</span>
        </div>
      </section>
    </section>`;

  const index = host.querySelector("#aulaIndex");
  const content = host.querySelector("#aulaContent");
  index.innerHTML = lessons.map((lesson, i) => `<button class="aula-tab ${i === 0 ? "active" : ""}" data-lesson="${lesson.id}">${lesson.title}</button>`).join("");

  function openLesson(id){
    const lesson = lessons.find(item => item.id === id) || lessons[0];
    host.querySelectorAll(".aula-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.lesson === lesson.id));
    content.innerHTML = `
      <p class="eyebrow">Lección</p>
      <h4>${lesson.title}</h4>
      <p class="lead">${lesson.summary}</p>
      ${lesson.body.map(paragraph => `<p>${paragraph}</p>`).join("")}
      <div class="result-box warn"><strong>Regla de seguridad:</strong> aprender sirve para preguntar mejor y evitar abusos, pero una instalación real debe ser revisada y ejecutada por personal competente.</div>`;
  }

  index.onclick = event => {
    const button = event.target.closest("[data-lesson]");
    if(button) openLesson(button.dataset.lesson);
  };
  openLesson("empalme");

  host.querySelector("#quoteReviewBtn").addEventListener("click", () => {
    const checked = [...host.querySelectorAll("[data-quote-check]")].filter(input => input.checked).length;
    const result = host.querySelector("#quoteReviewResult");
    result.classList.remove("hidden", "ok", "warn", "danger");
    let level = "danger";
    let message = "La cotización está incompleta. Conviene pedir más detalle antes de aceptar.";
    if(checked >= 5){ level = "ok"; message = "La cotización contiene varios datos importantes. Aun así, debe ser revisada según el trabajo real."; }
    else if(checked >= 3){ level = "warn"; message = "La cotización tiene información parcial. Se recomienda solicitar aclaraciones por escrito."; }
    result.classList.add(level);
    result.innerHTML = `<strong>Resultado educativo:</strong> ${message}<br><small>${checked} de ${questions.length} puntos marcados.</small>`;
  });
}
