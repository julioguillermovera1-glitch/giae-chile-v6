import { state, persist, hasCompanyPermission } from "../../core/store.js";

function esc(value = ""){
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function money(value){
  return Number(value || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

function number(value){
  return Number(value || 0).toLocaleString("es-CL", { maximumFractionDigits: 2 });
}

function today(){
  return new Date().toISOString().slice(0, 10);
}

function createId(prefix){
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function ensureInventory(){
  state.companyInventory = state.companyInventory || {};
  state.companyInventory.items = Array.isArray(state.companyInventory.items) ? state.companyInventory.items : [];
  state.companyInventory.deliveries = Array.isArray(state.companyInventory.deliveries) ? state.companyInventory.deliveries : [];
  return state.companyInventory;
}

function stockStatus(item){
  const stock = Number(item.stock || 0);
  const min = Number(item.minStock || 0);
  if(stock <= 0) return { key: "critical", label: "Sin stock" };
  if(stock <= min) return { key: "low", label: "Rojo" };
  return { key: "ok", label: "OK" };
}

function metrics(inventory){
  const items = inventory.items;
  const totalValue = items.reduce((sum, item) => sum + Number(item.stock || 0) * Number(item.unitCost || 0), 0);
  const replacementCost = items.reduce((sum, item) => {
    const missingToMin = Math.max(Number(item.minStock || 0) - Number(item.stock || 0), 0);
    return sum + missingToMin * Number(item.unitCost || 0);
  }, 0);
  const redItems = items.filter(item => stockStatus(item).key !== "ok");
  const deliveredValue = inventory.deliveries.reduce((sum, delivery) => sum + Number(delivery.quantity || 0) * Number(delivery.unitCost || 0), 0);
  return { totalValue, replacementCost, redItems, deliveredValue };
}

function productOptions(items){
  if(!items.length) return `<option value="">Primero agrega productos</option>`;
  return items.map(item => `<option value="${esc(item.id)}">${esc(item.name)} - stock ${number(item.stock)}</option>`).join("");
}

function alertBox(data){
  if(!data.redItems.length){
    return `<div class="inventory-alert ok"><strong>Inventario sano.</strong><span>No hay productos bajo minimo.</span></div>`;
  }
  return `<div class="inventory-alert danger">
    <strong>Alerta roja de inventario</strong>
    <span>${data.redItems.length} producto(s) estan bajo minimo o sin stock. Reposicion estimada: ${money(data.replacementCost)}.</span>
  </div>`;
}

function itemRows(items){
  if(!items.length){
    return `<tr><td colspan="9" class="empty-cell">No hay productos registrados en el inventario.</td></tr>`;
  }
  return items.map(item => {
    const status = stockStatus(item);
    const needed = Math.max(Number(item.minStock || 0) - Number(item.stock || 0), 0);
    return `<tr class="inventory-row ${status.key}">
      <td><strong>${esc(item.name)}</strong><br><small>${esc(item.sku || "Sin codigo")}</small></td>
      <td>${esc(item.category || "General")}</td>
      <td>${number(item.stock)} ${esc(item.unit || "un")}</td>
      <td>${number(item.minStock)} ${esc(item.unit || "un")}</td>
      <td>${money(item.unitCost)}</td>
      <td>${money(Number(item.stock || 0) * Number(item.unitCost || 0))}</td>
      <td>${needed ? `${number(needed)} ${esc(item.unit || "un")}` : "-"}</td>
      <td><span class="stock-pill ${status.key}">${esc(status.label)}</span></td>
      <td>${hasCompanyPermission("inventory.manage") ? `<button class="ghost danger-text" data-delete-item="${esc(item.id)}">Eliminar</button>` : "-"}</td>
    </tr>`;
  }).join("");
}

function deliveryRows(deliveries){
  if(!deliveries.length){
    return `<tr><td colspan="7" class="empty-cell">Todavia no hay entregas registradas.</td></tr>`;
  }
  return deliveries.slice().reverse().map(item => `<tr>
    <td>${esc(item.date)}</td>
    <td><strong>${esc(item.productName)}</strong><br><small>${esc(item.sku || "Sin codigo")}</small></td>
    <td>${number(item.quantity)} ${esc(item.unit || "un")}</td>
    <td>${esc(item.deliveredTo)}</td>
    <td>${esc(item.project || "Sin proyecto")}</td>
    <td>${money(Number(item.quantity || 0) * Number(item.unitCost || 0))}</td>
    <td>${esc(item.notes || "-")}</td>
  </tr>`).join("");
}

function readNumber(host, selector){
  return Number(host.querySelector(selector).value || 0);
}

export function render(host){
  const inventory = ensureInventory();
  const data = metrics(inventory);
  const canManage = hasCompanyPermission("inventory.manage");
  host.innerHTML = `
    <section class="module-window inventory-module">
      <div class="module-head split-head">
        <div>
          <p class="eyebrow">Modulo 2 - empresa</p>
          <h3>Inventario de empresa</h3>
          <p>Controla materiales, herramientas y productos. Cada entrega descuenta stock automaticamente y deja registro con responsable, fecha y cantidad.</p>
        </div>
        <div class="project-state-card ${data.redItems.length ? "danger-card" : ""}">
          <small>Reposicion necesaria</small>
          <strong>${money(data.replacementCost)}</strong>
          <span>${data.redItems.length ? `${data.redItems.length} producto(s) en rojo` : "Sin alertas"}</span>
        </div>
      </div>

      ${alertBox(data)}

      <section class="dashboard-grid kpi-row inventory-kpis">
        <article><small>Productos</small><strong>${inventory.items.length}</strong></article>
        <article><small>Valor stock actual</small><strong>${money(data.totalValue)}</strong></article>
        <article><small>Valor entregado</small><strong>${money(data.deliveredValue)}</strong></article>
        <article><small>Productos en rojo</small><strong>${data.redItems.length}</strong></article>
      </section>

      ${canManage ? `<div class="dashboard-grid two inventory-workgrid">
        <article class="dashboard-card">
          <h4>Agregar producto</h4>
          <div class="form-grid compact inventory-form">
            <label>Producto <input id="itemName" placeholder="Ej: Conductor THHN 2,5 mm2"></label>
            <label>Codigo / SKU <input id="itemSku" placeholder="Ej: CBL-2.5-ROJO"></label>
            <label>Categoria <input id="itemCategory" placeholder="Cable, proteccion, canalizacion..."></label>
            <label>Unidad <input id="itemUnit" value="un" placeholder="un, m, rollo, caja"></label>
            <label>Stock actual <input id="itemStock" type="number" min="0" step="0.01" value="0"></label>
            <label>Stock minimo rojo <input id="itemMin" type="number" min="0" step="0.01" value="1"></label>
            <label>Valor unitario <input id="itemCost" type="number" min="0" step="1" value="0"></label>
          </div>
          <div class="top-actions"><button id="addInventoryItem" class="primary-action">Agregar al inventario</button></div>
        </article>

        <article class="dashboard-card">
          <h4>Entregar producto</h4>
          <div class="form-grid compact inventory-form">
            <label>Producto
              <select id="deliveryProduct">${productOptions(inventory.items)}</select>
            </label>
            <label>A quien se entrega <input id="deliveryTo" placeholder="Nombre trabajador, instalador o cuadrilla"></label>
            <label>Fecha <input id="deliveryDate" type="date" value="${today()}"></label>
            <label>Cantidad entregada <input id="deliveryQty" type="number" min="0" step="0.01" value="1"></label>
            <label>Proyecto / obra <input id="deliveryProject" placeholder="Proyecto asociado"></label>
            <label>Observacion <input id="deliveryNotes" placeholder="Uso, motivo o comprobante"></label>
          </div>
          <div class="top-actions"><button id="deliverInventoryItem" class="primary-action">Registrar entrega y descontar</button></div>
        </article>
      </div>` : `<div class="inventory-alert info"><strong>Modo consulta.</strong><span>Este usuario puede ver inventario y entregas, pero no modificar stock.</span></div>`}

<article class="dashboard-card">
        <h4>Inventario actual</h4>
        <div class="data-table-wrap wide-table"><table>
          <thead><tr><th>Producto</th><th>Categoria</th><th>Stock</th><th>Minimo</th><th>Valor unitario</th><th>Valor actual</th><th>Falta para minimo</th><th>Estado</th><th></th></tr></thead>
          <tbody>${itemRows(inventory.items)}</tbody>
        </table></div>
      </article>

      <article class="dashboard-card">
        <h4>Registro de entregas</h4>
        <div class="data-table-wrap wide-table"><table>
          <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Entregado a</th><th>Proyecto</th><th>Valor descontado</th><th>Observacion</th></tr></thead>
          <tbody>${deliveryRows(inventory.deliveries)}</tbody>
        </table></div>
      </article>
    </section>`;

  host.querySelector("#addInventoryItem")?.addEventListener("click", () => {
    const name = host.querySelector("#itemName").value.trim();
    if(!name) return alert("Ingresa el nombre del producto.");
    inventory.items.push({
      id: createId("ITEM"),
      name,
      sku: host.querySelector("#itemSku").value.trim(),
      category: host.querySelector("#itemCategory").value.trim() || "General",
      unit: host.querySelector("#itemUnit").value.trim() || "un",
      stock: readNumber(host, "#itemStock"),
      minStock: readNumber(host, "#itemMin"),
      unitCost: readNumber(host, "#itemCost"),
      createdAt: new Date().toISOString()
    });
    persist();
    render(host);
  });

  host.querySelector("#deliverInventoryItem")?.addEventListener("click", () => {
    const id = host.querySelector("#deliveryProduct").value;
    const item = inventory.items.find(product => product.id === id);
    if(!item) return alert("Selecciona un producto del inventario.");
    const quantity = readNumber(host, "#deliveryQty");
    if(quantity <= 0) return alert("Ingresa una cantidad valida.");
    if(quantity > Number(item.stock || 0)) return alert("No hay stock suficiente para esta entrega.");
    const deliveredTo = host.querySelector("#deliveryTo").value.trim();
    if(!deliveredTo) return alert("Indica a quien se le entrega el producto.");

    item.stock = Number((Number(item.stock || 0) - quantity).toFixed(3));
    inventory.deliveries.push({
      id: createId("ENT"),
      itemId: item.id,
      productName: item.name,
      sku: item.sku,
      unit: item.unit,
      quantity,
      unitCost: Number(item.unitCost || 0),
      deliveredTo,
      date: host.querySelector("#deliveryDate").value || today(),
      project: host.querySelector("#deliveryProject").value.trim(),
      notes: host.querySelector("#deliveryNotes").value.trim(),
      createdAt: new Date().toISOString()
    });
    const status = stockStatus(item);
    persist();
    render(host);
    if(status.key !== "ok") alert(`Alerta roja: ${item.name} quedo con stock ${number(item.stock)} ${item.unit || "un"}.`);
  });

  host.querySelectorAll("[data-delete-item]").forEach(button => button.addEventListener("click", () => {
    if(!confirm("Eliminar este producto del inventario?")) return;
    inventory.items = inventory.items.filter(item => item.id !== button.dataset.deleteItem);
    state.companyInventory = inventory;
    persist();
    render(host);
  }));
}