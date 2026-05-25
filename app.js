import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClnb_ATPTTWglNPDB7ifHgO8wgGEnPMp0",
  authDomain: "xybertechx-system.firebaseapp.com",
  projectId: "xybertechx-system",
  storageBucket: "xybertechx-system.firebasestorage.app",
  messagingSenderId: "208205329621",
  appId: "1:208205329621:web:ecd69b2cfb62e123c6de5c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  ventas: "ventas",
  movimientos: "ahorros_movimientos"
};
const META_KEY = "xybertechx_ahorros_meta_v2";
const START_KEY = "2026-05-24";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  periodo: "today",
  ventas: [],
  movimientos: [],
  deferredPrompt: null
};

const refs = {
  conexionEstado: $("#conexionEstado"),
  metaInput: $("#metaInput"),
  guardarMeta: $("#guardarMeta"),
  totalDisponible: $("#totalDisponible"),
  balanceDetalle: $("#balanceDetalle"),
  barraMeta: $("#barraMeta"),
  avanceMeta: $("#avanceMeta"),
  ingresosTotal: $("#ingresosTotal"),
  gastosTotal: $("#gastosTotal"),
  ventasTotal: $("#ventasTotal"),
  ventasDetalle: $("#ventasDetalle"),
  productoGanancia: $("#productoGanancia"),
  productoVendido: $("#productoVendido"),
  productoInversion: $("#productoInversion"),
  servicioIngresos: $("#servicioIngresos"),
  servicioReinversion: $("#servicioReinversion"),
  servicioMateriales: $("#servicioMateriales"),
  servicioLiquido: $("#servicioLiquido"),
  extraIngresos: $("#extraIngresos"),
  extraCantidad: $("#extraCantidad"),
  efectivoTotal: $("#efectivoTotal"),
  digitalTotal: $("#digitalTotal"),
  bancoTotal: $("#bancoTotal"),
  ahorroTotal: $("#ahorroTotal"),
  emergenciaTotal: $("#emergenciaTotal"),
  tallerTotal: $("#tallerTotal"),
  movimientoForm: $("#movimientoForm"),
  movimientoId: $("#movimientoId"),
  conceptoInput: $("#conceptoInput"),
  montoInput: $("#montoInput"),
  tipoInput: $("#tipoInput"),
  metodoInput: $("#metodoInput"),
  bolsilloInput: $("#bolsilloInput"),
  categoriaInput: $("#categoriaInput"),
  fechaInput: $("#fechaInput"),
  guardarMovimiento: $("#guardarMovimiento"),
  cancelarEdicion: $("#cancelarEdicion"),
  instalarApp: $("#instalarApp"),
  listaMovimientos: $("#listaMovimientos"),
  listaVentas: $("#listaVentas")
};

function dinero(valor) {
  return Number(valor || 0).toFixed(2);
}

function fechaLocalClave(fecha = new Date()) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fechaISO(fecha = new Date()) {
  return fechaLocalClave(fecha);
}

function fechaComoDate(fecha) {
  if (!fecha) return null;
  if (fecha.toDate) return fecha.toDate();
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function fechaClave(fecha) {
  if (!fecha) return "";
  if (fecha.toDate) return fechaLocalClave(fecha.toDate());
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime()) ? "" : fechaLocalClave(parsed);
}

function fechaCorta(fecha) {
  return fecha ? fecha.toLocaleDateString("es-PE") : "Sin fecha";
}

function enPeriodo(item) {
  const key = item.fechaClave || "";
  const today = fechaISO();
  const month = today.slice(0, 7);

  if (key < START_KEY) return false;
  if (state.periodo === "today") return key === today;
  if (state.periodo === "month") return key.startsWith(month);
  return true;
}

async function cargarColeccion(nombre) {
  const snap = await getDocs(collection(db, nombre));
  return snap.docs.map((item) => {
    const data = item.data();
    const fecha = data.fecha || data.creadoEn || data.actualizadoEn;
    return {
      id: item.id,
      ...data,
      fechaDate: fechaComoDate(fecha) || new Date(0),
      fechaClave: fechaClave(fecha)
    };
  });
}

function ventaValida(venta) {
  return venta.estado !== "devuelta";
}

function esServicioTecnico(venta) {
  const productos = venta.productos || [];
  const texto = [
    venta.cliente,
    venta.nota,
    venta.observacion,
    venta.comentario,
    ...productos.flatMap((producto) => [producto.nombre, producto.categoria])
  ].join(" ").toLowerCase();

  return texto.includes("servicio")
    || texto.includes("tecnico")
    || texto.includes("técnico")
    || texto.includes("program")
    || texto.includes("office")
    || texto.includes("antivirus")
    || texto.includes("mantenimiento")
    || texto.includes("pasta")
    || texto.includes("repar")
    || texto.includes("formate")
    || texto.includes("instal")
    || texto.includes("logo")
    || texto.includes("banner")
    || productos.every((producto) => Number(producto.costo || 0) === 0);
}

function categoriaNormalizada(categoria = "") {
  return categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function costoVenta(venta) {
  return (venta.productos || []).reduce((sum, producto) => {
    const cantidad = Number(producto.cantidad || 0);
    const costo = Number(producto.costo || 0);
    return sum + (cantidad * costo);
  }, 0);
}

function utilidadVenta(venta) {
  const guardada = Number(venta.utilidad ?? venta.ganancia ?? NaN);
  if (!Number.isNaN(guardada)) return guardada;
  return Number(venta.total || 0) - costoVenta(venta);
}

function nombreVenta(venta) {
  const productos = venta.productos || [];
  return productos.map((p) => `${p.nombre || "Producto"} x${p.cantidad || 1}`).join(", ")
    || venta.cliente
    || "Venta del sistema";
}

function metodoNormalizado(metodo = "") {
  const value = metodo.toLowerCase();
  if (value.includes("yape") || value.includes("plin")) return "digital";
  if (value.includes("bbva") || value.includes("transfer")) return "banco";
  return "efectivo";
}

function sumar(obj, key, monto) {
  obj[key] = (obj[key] || 0) + monto;
}

function resumen() {
  const ventas = state.ventas.filter(ventaValida).filter(enPeriodo);
  const movimientos = state.movimientos.filter(enPeriodo);
  const totals = {
    ingresosManual: 0,
    ingresosExtra: 0,
    ingresosServicioManual: 0,
    ingresosProductoManual: 0,
    utilidadVentas: 0,
    totalVentas: 0,
    productoVendido: 0,
    productoInversion: 0,
    productoGanancia: 0,
    servicioIngresos: 0,
    servicioReinversion: 0,
    servicioMateriales: 0,
    servicioLiquido: 0,
    extraCantidad: 0,
    gastos: 0,
    disponible: 0,
    efectivo: 0,
    digital: 0,
    banco: 0,
    ahorro: 0,
    emergencia: 0,
    taller: 0,
    ventasCount: ventas.length,
    movimientosCount: movimientos.length
  };

  ventas.forEach((venta) => {
    const utilidad = utilidadVenta(venta);
    totals.totalVentas += Number(venta.total || 0);

    if (esServicioTecnico(venta)) {
      const total = Number(venta.total || 0);
      totals.servicioIngresos += total;
      sumar(totals, metodoNormalizado(venta.metodoPago), total);
    } else {
      const total = Number(venta.total || 0);
      const costo = costoVenta(venta);
      totals.productoVendido += total;
      totals.productoInversion += costo;
      totals.productoGanancia += utilidad;
      sumar(totals, metodoNormalizado(venta.metodoPago), utilidad);
    }
  });

  movimientos.forEach((movimiento) => {
    const monto = Number(movimiento.monto || 0);
    const signo = movimiento.tipo === "gasto" ? -1 : 1;
    const firmado = monto * signo;
    const categoria = categoriaNormalizada(movimiento.categoria);

    if (movimiento.tipo === "gasto") totals.gastos += monto;
    else {
      totals.ingresosManual += monto;
      if (categoria.includes("servicio tecnico")) {
        totals.ingresosServicioManual += monto;
        totals.servicioIngresos += monto;
      } else if (categoria.includes("producto inventario")) {
        totals.ingresosProductoManual += monto;
        totals.productoVendido += monto;
        totals.productoGanancia += monto;
      } else {
        totals.ingresosExtra += monto;
        totals.extraCantidad += 1;
      }
    }

    sumar(totals, metodoNormalizado(movimiento.metodo), firmado);
    if (movimiento.bolsillo && movimiento.bolsillo !== "libre") {
      sumar(totals, movimiento.bolsillo, firmado);
    }
  });

  totals.servicioReinversion = totals.servicioIngresos * 0.27;
  totals.servicioMateriales = totals.servicioIngresos * 0.27;
  totals.servicioLiquido = totals.servicioIngresos * 0.47;
  totals.utilidadVentas = totals.productoGanancia + totals.servicioIngresos;
  totals.disponible = totals.productoGanancia + totals.servicioIngresos + totals.ingresosExtra - totals.gastos;
  return { totals, ventas, movimientos };
}

function renderCards() {
  const { totals, ventas, movimientos } = resumen();
  const meta = Number(refs.metaInput.value || 0);
  const avance = meta > 0 ? Math.max(0, Math.min((totals.disponible / meta) * 100, 100)) : 0;

  refs.totalDisponible.textContent = dinero(totals.disponible);
  refs.balanceDetalle.textContent = `Productos S/${dinero(totals.productoGanancia)} + servicios S/${dinero(totals.servicioIngresos)} + extras S/${dinero(totals.ingresosExtra)} - gastos S/${dinero(totals.gastos)}`;
  refs.ingresosTotal.textContent = dinero(totals.productoGanancia + totals.servicioIngresos + totals.ingresosExtra);
  refs.gastosTotal.textContent = dinero(totals.gastos);
  refs.ventasTotal.textContent = dinero(totals.totalVentas);
  refs.ventasDetalle.textContent = `${totals.ventasCount} ventas leidas`;
  refs.productoGanancia.textContent = dinero(totals.productoGanancia);
  refs.productoVendido.textContent = dinero(totals.productoVendido);
  refs.productoInversion.textContent = dinero(totals.productoInversion);
  refs.servicioIngresos.textContent = dinero(totals.servicioIngresos);
  refs.servicioReinversion.textContent = dinero(totals.servicioReinversion);
  refs.servicioMateriales.textContent = dinero(totals.servicioMateriales);
  refs.servicioLiquido.textContent = dinero(totals.servicioLiquido);
  refs.extraIngresos.textContent = dinero(totals.ingresosExtra);
  refs.extraCantidad.textContent = totals.extraCantidad;
  refs.efectivoTotal.textContent = dinero(totals.efectivo);
  refs.digitalTotal.textContent = dinero(totals.digital);
  refs.bancoTotal.textContent = dinero(totals.banco);
  refs.ahorroTotal.textContent = dinero(totals.ahorro);
  refs.emergenciaTotal.textContent = dinero(totals.emergencia);
  refs.tallerTotal.textContent = dinero(totals.taller);
  refs.avanceMeta.textContent = `${avance.toFixed(1)}%`;
  refs.barraMeta.style.width = `${avance}%`;

  renderMovimientos(movimientos);
  renderVentas(ventas);
}

function emptyItem(texto) {
  const item = document.createElement("li");
  item.className = "empty";
  item.textContent = texto;
  return item;
}

function renderMovimientos(movimientos) {
  refs.listaMovimientos.innerHTML = "";
  const ordered = movimientos.slice().sort((a, b) => b.fechaDate - a.fechaDate);
  if (!ordered.length) {
    refs.listaMovimientos.appendChild(emptyItem("Aun no hay movimientos en este periodo."));
    return;
  }

  ordered.slice(0, 18).forEach((movimiento) => {
    const item = document.createElement("li");
    const info = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    const amount = document.createElement("span");
    const actions = document.createElement("div");
    const edit = document.createElement("button");
    const remove = document.createElement("button");

    title.textContent = movimiento.concepto || "Movimiento";
    detail.textContent = `${fechaCorta(movimiento.fechaDate)} - ${movimiento.tipo} - ${movimiento.metodo || "sin metodo"} - ${movimiento.bolsillo || "libre"}`;
    amount.className = `amount ${movimiento.tipo === "gasto" ? "negative" : "positive"}`;
    amount.textContent = `${movimiento.tipo === "gasto" ? "-" : "+"} S/${dinero(movimiento.monto)}`;
    edit.textContent = "Editar";
    remove.textContent = "Borrar";
    remove.className = "danger-button";
    actions.className = "item-actions";

    edit.addEventListener("click", () => editarMovimiento(movimiento));
    remove.addEventListener("click", () => eliminarMovimiento(movimiento.id));
    info.append(title, detail);
    actions.append(edit, remove);
    item.append(info, amount, actions);
    refs.listaMovimientos.appendChild(item);
  });
}

function renderVentas(ventas) {
  refs.listaVentas.innerHTML = "";
  const ordered = ventas.slice().sort((a, b) => b.fechaDate - a.fechaDate);
  if (!ordered.length) {
    refs.listaVentas.appendChild(emptyItem("No hay ventas del sistema en este periodo."));
    return;
  }

  ordered.slice(0, 12).forEach((venta) => {
    const item = document.createElement("li");
    const info = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    const amount = document.createElement("span");

    title.textContent = nombreVenta(venta);
    detail.textContent = `${fechaCorta(venta.fechaDate)} - ${venta.metodoPago || "sin metodo"} - utilidad S/${dinero(utilidadVenta(venta))}`;
    amount.className = "amount positive";
    amount.textContent = `S/${dinero(venta.total)}`;
    info.append(title, detail);
    item.append(info, amount);
    refs.listaVentas.appendChild(item);
  });
}

function resetForm() {
  refs.movimientoForm.reset();
  refs.movimientoId.value = "";
  refs.fechaInput.value = fechaISO();
  refs.guardarMovimiento.textContent = "Guardar movimiento";
  refs.movimientoForm.classList.remove("editing");
}

function editarMovimiento(movimiento) {
  refs.movimientoId.value = movimiento.id;
  refs.conceptoInput.value = movimiento.concepto || "";
  refs.montoInput.value = movimiento.monto || "";
  refs.tipoInput.value = movimiento.tipo || "ingreso";
  refs.metodoInput.value = movimiento.metodo || "efectivo";
  refs.bolsilloInput.value = movimiento.bolsillo || "libre";
  refs.categoriaInput.value = movimiento.categoria || "Otro";
  refs.fechaInput.value = movimiento.fecha || movimiento.fechaClave || fechaISO();
  refs.guardarMovimiento.textContent = "Actualizar movimiento";
  refs.movimientoForm.classList.add("editing");
  refs.conceptoInput.focus();
}

async function eliminarMovimiento(id) {
  await deleteDoc(doc(db, COLLECTIONS.movimientos, id));
  state.movimientos = state.movimientos.filter((item) => item.id !== id);
  renderCards();
}

async function guardarMovimiento(event) {
  event.preventDefault();
  const monto = Number(refs.montoInput.value || 0);
  const concepto = refs.conceptoInput.value.trim();
  if (monto <= 0 || !concepto) return;

  const data = {
    concepto,
    monto,
    tipo: refs.tipoInput.value,
    metodo: refs.metodoInput.value,
    bolsillo: refs.bolsilloInput.value,
    categoria: refs.categoriaInput.value,
    fecha: refs.fechaInput.value || fechaISO(),
    actualizadoEn: new Date().toISOString()
  };

  if (refs.movimientoId.value) {
    await updateDoc(doc(db, COLLECTIONS.movimientos, refs.movimientoId.value), data);
  } else {
    await addDoc(collection(db, COLLECTIONS.movimientos), {
      ...data,
      creadoEn: new Date().toISOString()
    });
  }

  resetForm();
  await cargarTodo();
}

async function cargarTodo() {
  refs.conexionEstado.textContent = "Sincronizando con Firebase...";
  try {
    const [ventas, movimientos] = await Promise.all([
      cargarColeccion(COLLECTIONS.ventas),
      cargarColeccion(COLLECTIONS.movimientos)
    ]);
    state.ventas = ventas;
    state.movimientos = movimientos;
    refs.conexionEstado.textContent = `Firebase activo: ${ventas.length} ventas y ${movimientos.length} movimientos.`;
  } catch (error) {
    refs.conexionEstado.textContent = "No se pudo conectar con Firebase.";
    console.error(error);
  }
  renderCards();
}

function registrarEventos() {
  $$(".period-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".period-tabs button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.periodo = button.dataset.period;
      renderCards();
    });
  });

  refs.guardarMeta.addEventListener("click", () => {
    localStorage.setItem(META_KEY, refs.metaInput.value || "0");
    renderCards();
  });

  refs.movimientoForm.addEventListener("submit", guardarMovimiento);
  refs.cancelarEdicion.addEventListener("click", resetForm);

  refs.instalarApp.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    refs.instalarApp.disabled = false;
  });
}

refs.metaInput.value = localStorage.getItem(META_KEY) || "5000";
refs.fechaInput.value = fechaISO();
refs.instalarApp.disabled = true;
registrarEventos();
renderCards();
cargarTodo();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
