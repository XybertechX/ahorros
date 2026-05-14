import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
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

const META_KEY = "xybertechx_ahorros_meta";
const COLLECTIONS = {
  ingresos: "finanzas_ingresos_servicios",
  extras: "finanzas_ingresos_extra",
  gastos: "finanzas_gastos",
  sueldos: "finanzas_sueldos",
  ahorros: "finanzas_ahorros",
  reportes: "finanzas_reportes_mensuales"
};
const REPORT_START_KEY = "2026-05-14";
const REPORT_START_MONTH = REPORT_START_KEY.slice(0, 7);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  ventas: [],
  ingresos: [],
  extras: [],
  gastos: [],
  sueldos: [],
  ahorros: [],
  periodo: "today",
  reporteMes: new Date().toISOString().slice(0, 7)
};

const refs = {
  conexionEstado: $("#conexionEstado"),
  metaInput: $("#metaInput"),
  guardarMeta: $("#guardarMeta"),
  reporteMes: $("#reporteMes"),
  gananciaLimpia: $("#gananciaLimpia"),
  ventasTotal: $("#ventasTotal"),
  gastosTotal: $("#gastosTotal"),
  inversionTotal: $("#inversionTotal"),
  ahorroActual: $("#ahorroActual"),
  avanceMeta: $("#avanceMeta"),
  barraMeta: $("#barraMeta"),
  utilidadTotal: $("#utilidadTotal"),
  ventasCount: $("#ventasCount"),
  bolsaEmergencia: $("#bolsaEmergencia"),
  bolsaTaller: $("#bolsaTaller"),
  sueldoLibre: $("#sueldoLibre"),
  gananciaServicios: $("#gananciaServicios"),
  sueldoRecibido: $("#sueldoRecibido"),
  sueldoViveres: $("#sueldoViveres"),
  sueldoEmergenciaCalc: $("#sueldoEmergenciaCalc"),
  sueldoAhorroCalc: $("#sueldoAhorroCalc"),
  sueldoLujos: $("#sueldoLujos"),
  sueldoLibreCalc: $("#sueldoLibreCalc"),
  ventasHoy: $("#ventasHoy"),
  utilidadHoy: $("#utilidadHoy"),
  gastosHoy: $("#gastosHoy"),
  quedaHoy: $("#quedaHoy"),
  ventasHoyLista: $("#ventasHoyLista"),
  ingresoForm: $("#ingresoForm"),
  ingresoId: $("#ingresoId"),
  ingresoConcepto: $("#ingresoConcepto"),
  ingresoMonto: $("#ingresoMonto"),
  ingresoMetodo: $("#ingresoMetodo"),
  ingresoCategoria: $("#ingresoCategoria"),
  ingresoFecha: $("#ingresoFecha"),
  guardarIngreso: $("#guardarIngreso"),
  cancelarIngreso: $("#cancelarIngreso"),
  gastoForm: $("#gastoForm"),
  gastoId: $("#gastoId"),
  gastoConcepto: $("#gastoConcepto"),
  gastoMonto: $("#gastoMonto"),
  gastoTipo: $("#gastoTipo"),
  gastoArea: $("#gastoArea"),
  gastoCategoria: $("#gastoCategoria"),
  gastoFecha: $("#gastoFecha"),
  guardarGasto: $("#guardarGasto"),
  cancelarGasto: $("#cancelarGasto"),
  sueldoForm: $("#sueldoForm"),
  sueldoId: $("#sueldoId"),
  sueldoMonto: $("#sueldoMonto"),
  sueldoFecha: $("#sueldoFecha"),
  sueldoDeudas: $("#sueldoDeudas"),
  sueldoPendientes: $("#sueldoPendientes"),
  sueldoAlquiler: $("#sueldoAlquiler"),
  sueldoInesperados: $("#sueldoInesperados"),
  sueldoPreview: $("#sueldoPreview"),
  sueldoNota: $("#sueldoNota"),
  guardarSueldo: $("#guardarSueldo"),
  cancelarSueldo: $("#cancelarSueldo"),
  ahorroForm: $("#ahorroForm"),
  montoAhorro: $("#montoAhorro"),
  tipoAhorro: $("#tipoAhorro"),
  notaAhorro: $("#notaAhorro"),
  listaGastos: $("#listaGastos"),
  listaIngresos: $("#listaIngresos"),
  listaExtras: $("#listaExtras"),
  listaSueldos: $("#listaSueldos"),
  listaAhorros: $("#listaAhorros")
};

function dinero(valor) {
  return Number(valor || 0).toFixed(2);
}

function fechaComoDate(fecha) {
  if (!fecha) return null;
  if (fecha.toDate) return fecha.toDate();
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const convertida = new Date(fecha);
  return Number.isNaN(convertida.getTime()) ? null : convertida;
}

function fechaComoClave(fecha) {
  if (!fecha) return "";
  if (fecha.toDate) return fecha.toDate().toISOString().slice(0, 10);
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;

  const convertida = new Date(fecha);
  return Number.isNaN(convertida.getTime()) ? "" : convertida.toISOString().slice(0, 10);
}

function fechaISO(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10);
}

function inicioMesClave(mesClave) {
  if (!mesClave) return REPORT_START_KEY;
  return mesClave === REPORT_START_MONTH ? REPORT_START_KEY : `${mesClave}-01`;
}

function claveMesActual() {
  return fechaISO().slice(0, 7);
}

function mesClaveOffset(mesClave, offset) {
  const [year, month] = mesClave.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}

function fechaCorta(fecha) {
  return fecha ? fecha.toLocaleDateString("es-PE") : "Sin fecha";
}

function hoyInicio() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

function inicioDelPeriodo(periodo) {
  const hoy = hoyInicio();

  if (periodo === "today") return hoy;
  if (periodo === "month") return new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  return null;
}

function enPeriodo(fecha, periodo = state.periodo) {
  if (fecha && typeof fecha === "object" && fecha.fechaClave) {
    const hoyClave = fechaISO();
    const mesActual = claveMesActual();
    const mesReporte = state.reporteMes || mesActual;

    if (periodo === "today") return fecha.fechaClave === hoyClave;
    if (periodo === "month") {
      return fecha.fechaClave.startsWith(mesActual) && fecha.fechaClave >= inicioMesClave(mesActual);
    }
    if (periodo === "report") {
      return fecha.fechaClave.startsWith(mesReporte) && fecha.fechaClave >= inicioMesClave(mesReporte);
    }

    return fecha.fechaClave >= REPORT_START_KEY;
  }

  const inicio = inicioDelPeriodo(periodo);
  if (!inicio) return true;

  return fecha && fecha >= inicio;
}

function ventaValida(venta) {
  return !(venta.origen === "POS" && venta.estado === "devuelta");
}

function numeroInput(input) {
  return Number(input.value || 0);
}

function resetFormulario(form) {
  form.reset();
  form.classList.remove("editing");
  refs.ingresoFecha.value = fechaISO();
  refs.gastoFecha.value = fechaISO();
  refs.sueldoFecha.value = fechaISO();
  refs.ingresoId.value = "";
  refs.gastoId.value = "";
  refs.sueldoId.value = "";
  refs.guardarIngreso.textContent = "Guardar ingreso";
  refs.guardarGasto.textContent = "Guardar movimiento";
  refs.guardarSueldo.textContent = "Guardar sueldo";
}

async function cargarColeccion(nombre) {
  const snap = await getDocs(collection(db, nombre));
  const datos = [];

  snap.forEach((docu) => {
    const data = docu.data();
    datos.push({
      id: docu.id,
      ...data,
      fechaDate: fechaComoDate(data.fecha) || fechaComoDate(data.creadoEn) || new Date(0),
      fechaClave: fechaComoClave(data.fecha) || fechaComoClave(data.creadoEn)
    });
  });

  return datos;
}

async function guardarDocumento(coleccion, id, data) {
  if (id) {
    await updateDoc(doc(db, coleccion, id), data);
    return id;
  }

  const nuevo = await addDoc(collection(db, coleccion), data);
  return nuevo.id;
}

async function borrarDocumento(coleccion, id) {
  await deleteDoc(doc(db, coleccion, id));
}

function esServicio(venta) {
  const productos = venta.productos || [];
  const texto = [
    venta.cliente,
    venta.nota,
    venta.observacion,
    venta.comentario,
    ...productos.flatMap((producto) => [producto.nombre, producto.categoria])
  ].join(" ").toLowerCase();

  return texto.includes("servicio")
    || texto.includes("program")
    || texto.includes("mantenimiento")
    || texto.includes("pasta")
    || texto.includes("repar")
    || texto.includes("logo")
    || productos.every((producto) => Number(producto.costo || 0) === 0);
}

function esProductoInventario(venta) {
  return ventaValida(venta) && !esServicio(venta);
}

function costoVenta(venta) {
  return (venta.productos || []).reduce((sum, producto) => {
    const cantidad = Number(producto.cantidad || 0);
    const costo = Number(producto.costo || 0);
    return sum + (costo * cantidad);
  }, 0);
}

function utilidadVenta(venta) {
  const guardada = Number(venta.utilidad ?? venta.ganancia ?? NaN);
  if (!Number.isNaN(guardada)) return guardada;

  return Number(venta.total || 0) - costoVenta(venta);
}

function textoMovimiento(item) {
  return [
    item.concepto,
    item.categoria,
    item.tipo
  ].join(" ").toLowerCase();
}

function esAporteMaterial(item) {
  const texto = textoMovimiento(item);
  return item.tipo === "material"
    || (item.tipo === "ingreso" && (texto.includes("material") || texto.includes("pasta") || texto.includes("insumo")));
}

function esExtraGananciaServicio(item) {
  return item.tipo === "ganancia_servicio";
}

function resumenServicios(periodo = state.periodo) {
  const base = {
    total: 0,
    cantidad: 0,
    items: []
  };

  const ventas = state.ventas
    .filter(ventaValida)
    .filter(esServicio)
    .filter((venta) => enPeriodo(venta, periodo))
    .reduce((resumen, venta) => {
      const total = Number(venta.total || 0);

      resumen.total += total;
      resumen.cantidad += 1;
      resumen.items.push({
        ...venta,
        origenFinanzas: "venta"
      });
      return resumen;
    }, base);

  state.ingresos
    .filter((ingreso) => enPeriodo(ingreso, periodo))
    .forEach((ingreso) => {
      ventas.total += Number(ingreso.monto || 0);
      ventas.cantidad += 1;
      ventas.items.push({
        ...ingreso,
        total: Number(ingreso.monto || 0),
        metodoPago: ingreso.metodo,
        origenFinanzas: "manual"
      });
    });

  state.extras
    .filter((extra) => (extra.area || "producto") === "servicio")
    .filter((extra) => enPeriodo(extra, periodo))
    .forEach((extra) => {
      ventas.total += Number(extra.monto || 0);
      ventas.cantidad += 1;
      ventas.items.push({
        ...extra,
        total: Number(extra.monto || 0),
        metodoPago: extra.metodo,
        origenFinanzas: "extra"
      });
    });

  state.gastos
    .filter((extra) => extra.tipo === "ingreso")
    .filter((extra) => !esAporteMaterial(extra))
    .filter((extra) => (extra.area || "producto") === "servicio")
    .filter((extra) => enPeriodo(extra, periodo))
    .forEach((extra) => {
      ventas.total += Number(extra.monto || 0);
      ventas.cantidad += 1;
      ventas.items.push({
        ...extra,
        total: Number(extra.monto || 0),
        metodoPago: "Ingreso aplicado",
        origenFinanzas: "extra"
      });
    });

  return ventas;
}

function resumenProductos(periodo = state.periodo) {
  const resumen = state.ventas
    .filter(esProductoInventario)
    .filter((venta) => enPeriodo(venta, periodo))
    .reduce((resumen, venta) => {
      const total = Number(venta.total || 0);
      const costo = costoVenta(venta);
      const utilidad = utilidadVenta(venta);

      resumen.total += total;
      resumen.costo += costo;
      resumen.ganancia += utilidad;
      resumen.cantidad += 1;
      resumen.items.push({
        ...venta,
        costoCalculado: costo,
        utilidadCalculada: utilidad
      });
      return resumen;
    }, {
      total: 0,
      costo: 0,
      ganancia: 0,
      cantidad: 0,
      items: []
    });

  state.extras
    .filter((extra) => (extra.area || "producto") === "producto")
    .filter((extra) => enPeriodo(extra, periodo))
    .forEach((extra) => {
      const monto = Number(extra.monto || 0);
      resumen.total += monto;
      resumen.ganancia += monto;
      resumen.items.push({
        ...extra,
        total: monto,
        costoCalculado: 0,
        utilidadCalculada: monto,
        origenFinanzas: "extra"
      });
    });

  state.gastos
    .filter((extra) => extra.tipo === "ingreso")
    .filter((extra) => (extra.area || "producto") === "producto")
    .filter((extra) => enPeriodo(extra, periodo))
    .forEach((extra) => {
      const monto = Number(extra.monto || 0);
      resumen.total += monto;
      resumen.ganancia += monto;
      resumen.items.push({
        ...extra,
        total: monto,
        costoCalculado: 0,
        utilidadCalculada: monto,
        origenFinanzas: "extra"
      });
    });

  return resumen;
}

function resumenExtras(periodo = state.periodo, area = "") {
  const extrasColeccion = state.extras
    .filter((extra) => enPeriodo(extra, periodo))
    .filter((extra) => !area || (extra.area || "producto") === area);
  const extrasMovimientos = state.gastos
    .filter((extra) => extra.tipo === "ingreso")
    .filter((extra) => !esAporteMaterial(extra))
    .filter((extra) => enPeriodo(extra, periodo))
    .filter((extra) => !area || (extra.area || "producto") === area);

  return [...extrasColeccion, ...extrasMovimientos]
    .reduce((sum, extra) => sum + Number(extra.monto || 0), 0);
}

function resumenGastos(periodo = state.periodo, area = "") {
  return state.gastos
    .filter((gasto) => enPeriodo(gasto, periodo))
    .filter((gasto) => !area || (gasto.area || "producto") === area)
    .filter((gasto) => gasto.tipo !== "ingreso" || esAporteMaterial(gasto))
    .filter((gasto) => !esExtraGananciaServicio(gasto))
    .reduce((resumen, gasto) => {
      const monto = Number(gasto.monto || 0);
      if (esAporteMaterial(gasto)) {
        resumen.material += monto;
      } else if (gasto.tipo === "inversion") {
        resumen.inversion += monto;
      } else {
        resumen.gasto += monto;
      }
      return resumen;
    }, { gasto: 0, material: 0, inversion: 0 });
}

function resumenGananciaServicioExtra(periodo = state.periodo) {
  return state.gastos
    .filter((item) => esExtraGananciaServicio(item))
    .filter((item) => (item.area || "servicio") === "servicio")
    .filter((item) => enPeriodo(item, periodo))
    .reduce((sum, item) => sum + Number(item.monto || 0), 0);
}

function resumenAhorrosManual(periodo = state.periodo) {
  return state.ahorros
    .filter((item) => enPeriodo(item, periodo))
    .reduce((sum, item) => {
      const monto = Number(item.monto || 0);
      return item.tipo === "retiro" ? sum - monto : sum + monto;
    }, 0);
}

function resumenSueldos() {
  return state.sueldos.reduce((resumen, sueldo) => {
    const monto = Number(sueldo.monto || 0);
    const deudas = Number(sueldo.deudas || 0);
    const pendientes = Number(sueldo.pendientes || 0);
    const alquiler = Number(sueldo.alquiler || 0);
    const inesperados = Number(sueldo.inesperados || 0);
    const disponible = Math.max(monto - deudas - pendientes - alquiler - inesperados, 0);
    const viveres = disponible * 0.35;
    const emergencia = disponible * 0.20;
    const ahorro = disponible * 0.20;
    const lujos = disponible * 0.10;
    const libre = disponible * 0.15;

    resumen.sueldos += monto;
    resumen.deudas += deudas;
    resumen.pendientes += pendientes;
    resumen.alquiler += alquiler;
    resumen.inesperados += inesperados;
    resumen.viveres += viveres;
    resumen.emergencia += emergencia;
    resumen.ahorro += ahorro;
    resumen.lujos += lujos;
    resumen.libre += libre;
    return resumen;
  }, {
    sueldos: 0,
    deudas: 0,
    pendientes: 0,
    alquiler: 0,
    inesperados: 0,
    viveres: 0,
    emergencia: 0,
    ahorro: 0,
    lujos: 0,
    libre: 0
  });
}

function totalAhorros(periodo = state.periodo) {
  const resumen = calcularFinanzas(periodo);
  return resumen.sueldos.ahorro + resumen.gananciaReal + resumen.ahorroManual;
}

function calcularFinanzas(periodo = state.periodo) {
  const servicios = resumenServicios(periodo);
  const productos = resumenProductos(periodo);
  const salidasServicio = resumenGastos(periodo, "servicio");
  const salidasProducto = resumenGastos(periodo, "producto");
  const salidasGeneral = resumenGastos(periodo, "general");
  const salidasTodas = resumenGastos(periodo);
  const extrasGeneral = resumenExtras(periodo, "general");
  const gananciaServicioExtra = resumenGananciaServicioExtra(periodo);
  const servicioNeto = servicios.total - salidasServicio.gasto;
  const servicioBase = Math.max(servicioNeto, 0);
  const materialesServicios = servicioBase * 0.27;
  const reinversionServicios = servicioBase * 0.27;
  const inversionManual = salidasServicio.inversion + salidasProducto.inversion + salidasGeneral.inversion;
  const materialManual = salidasServicio.material + salidasProducto.material + salidasGeneral.material;
  const gananciaServicios = (servicioBase * 0.46) + gananciaServicioExtra;
  const productoNeto = productos.ganancia - salidasProducto.gasto;
  const materialesTotal = materialesServicios + materialManual;
  const reinversionTotal = reinversionServicios + inversionManual;
  const sueldos = resumenSueldos();
  const ahorroManual = resumenAhorrosManual(periodo);
  const gananciaReal = productoNeto + servicioNeto + gananciaServicioExtra + extrasGeneral - salidasGeneral.gasto;
  const gananciaRepartida = gananciaReal + materialesTotal + reinversionTotal;

  return {
    productos: {
      ...productos,
      gastos: salidasProducto.gasto,
      neto: productoNeto
    },
    servicios: {
      ...servicios,
      gastos: salidasServicio.gasto,
      neto: servicioNeto,
      materialesSugeridos: materialesTotal,
      materialesBase: materialesServicios,
      materialesManual: materialManual,
      reinversionBase: reinversionTotal,
      reinversionSugerida: reinversionServicios,
      reinversionManual: inversionManual,
      gananciaExtra: gananciaServicioExtra,
      ganancia: gananciaServicios
    },
    generales: salidasGeneral,
    extrasGeneral,
    salidasTodas,
    sueldos,
    ahorroManual,
    gananciaRepartida,
    gananciaReal
  };
}

function renderResumen() {
  const resumen = calcularFinanzas();
  const hoy = calcularFinanzas("today");
  const ahorro = totalAhorros();
  const meta = Number(refs.metaInput.value || 0);
  const avance = meta > 0 ? Math.min((ahorro / meta) * 100, 100) : 0;

  refs.gananciaLimpia.textContent = dinero(resumen.gananciaReal);
  refs.ventasTotal.textContent = dinero(resumen.productos.total);
  refs.gastosTotal.textContent = dinero(resumen.productos.costo);
  refs.inversionTotal.textContent = dinero(resumen.salidasTodas.gasto);
  refs.ahorroActual.textContent = dinero(ahorro);
  refs.avanceMeta.textContent = `${avance.toFixed(1)}%`;
  refs.barraMeta.style.width = `${avance}%`;
  refs.utilidadTotal.textContent = dinero(resumen.gananciaRepartida);
  refs.ventasCount.textContent = `${resumen.productos.cantidad} productos, ${resumen.servicios.cantidad} servicios y reparto`;
  refs.bolsaEmergencia.textContent = dinero(resumen.servicios.materialesSugeridos);
  refs.bolsaTaller.textContent = dinero(resumen.servicios.total);
  refs.sueldoLibre.textContent = dinero(resumen.servicios.reinversionBase);
  refs.gananciaServicios.textContent = dinero(resumen.servicios.ganancia);
  refs.sueldoRecibido.textContent = dinero(resumen.sueldos.sueldos);
  refs.sueldoViveres.textContent = dinero(resumen.sueldos.viveres);
  refs.sueldoEmergenciaCalc.textContent = dinero(resumen.sueldos.emergencia);
  refs.sueldoAhorroCalc.textContent = dinero(resumen.sueldos.ahorro);
  refs.sueldoLujos.textContent = dinero(resumen.sueldos.lujos);
  refs.sueldoLibreCalc.textContent = dinero(resumen.sueldos.libre);
  refs.ventasHoy.textContent = dinero(hoy.productos.total);
  refs.utilidadHoy.textContent = dinero(hoy.servicios.total);
  refs.gastosHoy.textContent = dinero(hoy.productos.gastos + hoy.servicios.gastos + hoy.generales.gasto);
  refs.quedaHoy.textContent = dinero(hoy.gananciaReal);

  renderVentasHoy([...hoy.productos.items, ...hoy.servicios.items]);
  renderListas();
  renderSueldoPreview();
}

function calcularSueldoFormulario() {
  const monto = numeroInput(refs.sueldoMonto);
  const descuentos = numeroInput(refs.sueldoDeudas)
    + numeroInput(refs.sueldoPendientes)
    + numeroInput(refs.sueldoAlquiler)
    + numeroInput(refs.sueldoInesperados);
  const disponible = Math.max(monto - descuentos, 0);

  return {
    disponible,
    viveres: disponible * 0.35,
    emergencia: disponible * 0.20,
    ahorro: disponible * 0.20,
    lujos: disponible * 0.10,
    libre: disponible * 0.15
  };
}

function renderSueldoPreview() {
  if (!refs.sueldoPreview) return;

  const calculo = calcularSueldoFormulario();
  const valores = [
    calculo.disponible,
    calculo.viveres,
    calculo.emergencia,
    calculo.ahorro,
    calculo.lujos,
    calculo.libre
  ];

  refs.sueldoPreview.querySelectorAll("strong").forEach((node, index) => {
    node.textContent = `S/ ${dinero(valores[index])}`;
  });
}

function crearMonto(valor, negativo = false) {
  const span = document.createElement("span");
  span.className = `amount${negativo ? " negative" : ""}`;
  span.textContent = valor;
  return span;
}

function agregarVacio(lista, texto) {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = texto;
  lista.appendChild(li);
}

function agregarItem(lista, titulo, detalle, valor, negativo = false, acciones = []) {
  const li = document.createElement("li");
  const texto = document.createElement("div");
  const nombre = document.createElement("strong");
  const sub = document.createElement("small");

  nombre.textContent = titulo;
  sub.textContent = detalle;
  texto.append(nombre, sub);
  li.append(texto, crearMonto(valor, negativo));

  if (acciones.length) {
    const actionBox = document.createElement("div");
    actionBox.className = "item-actions";
    acciones.forEach(({ label, onClick, danger }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.className = danger ? "danger-button" : "";
      button.addEventListener("click", onClick);
      actionBox.appendChild(button);
    });
    li.appendChild(actionBox);
  }

  lista.appendChild(li);
}

function renderVentasHoy(ventas) {
  refs.ventasHoyLista.innerHTML = "";

  if (ventas.length === 0) {
    agregarVacio(refs.ventasHoyLista, "Hoy aun no hay ventas registradas.");
    return;
  }

  ventas
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 6)
    .forEach((venta) => {
      const productos = (venta.productos || [])
        .map((p) => `${p.nombre || "Producto"} x${p.cantidad || 0}`)
        .join(", ");
      agregarItem(
        refs.ventasHoyLista,
        productos || venta.concepto || venta.cliente || "Venta registrada",
        venta.origenFinanzas === "manual" || venta.origenFinanzas === "extra"
          ? `${venta.metodoPago || "Sin metodo"} - ${venta.origenFinanzas === "extra" ? "extra" : "ingreso manual"}`
          : `${venta.metodoPago || "Sin metodo"} - costo S/${dinero(venta.costoCalculado || 0)} - ganancia S/${dinero(venta.utilidadCalculada ?? venta.utilidad ?? venta.ganancia)}`,
        `S/${dinero(venta.total)}`
      );
    });
}

function renderListas() {
  refs.listaIngresos.innerHTML = "";
  refs.listaExtras.innerHTML = "";
  refs.listaGastos.innerHTML = "";
  refs.listaSueldos.innerHTML = "";
  refs.listaAhorros.innerHTML = "";

  const ingresos = state.ingresos
    .slice()
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 12);

  if (ingresos.length === 0) {
    agregarVacio(refs.listaIngresos, "No hay ingresos manuales de servicios.");
  } else {
    ingresos.forEach((ingreso) => {
      agregarItem(
        refs.listaIngresos,
        ingreso.concepto || "Servicio",
        `${fechaCorta(ingreso.fechaDate)} - ${ingreso.categoria || "Servicio"} - ${ingreso.metodo || "Sin metodo"}`,
        `S/${dinero(ingreso.monto)}`,
        false,
        [
          { label: "Editar", onClick: () => editarIngreso(ingreso.id) },
          { label: "Borrar", danger: true, onClick: () => eliminarIngreso(ingreso.id) }
        ]
      );
    });
  }

  const extras = [
    ...state.extras,
    ...state.gastos.filter((gasto) => gasto.tipo === "ingreso")
  ]
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 12);

  if (extras.length === 0) {
    agregarVacio(refs.listaExtras, "No hay ingresos extra registrados.");
  } else {
    extras.forEach((extra) => {
      agregarItem(
        refs.listaExtras,
        extra.concepto || "Ingreso extra",
        `${fechaCorta(extra.fechaDate)} - ${extra.area || "producto"} - ${extra.metodo || "Sin metodo"}`,
        `+ S/${dinero(extra.monto)}`,
        false,
        [
          { label: "Editar", onClick: () => editarExtra(extra.id) },
          { label: "Borrar", danger: true, onClick: () => eliminarExtra(extra.id) }
        ]
      );
    });
  }

  const gastos = state.gastos
    .slice()
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 12);

  if (gastos.length === 0) {
    agregarVacio(refs.listaGastos, "No hay gastos ni inversiones registrados.");
  } else {
    gastos.forEach((gasto) => {
      const esInversion = gasto.tipo === "inversion";
      const esMaterial = esAporteMaterial(gasto);
      const esIngreso = gasto.tipo === "ingreso" && !esMaterial;
      const esGananciaServicio = esExtraGananciaServicio(gasto);
      agregarItem(
        refs.listaGastos,
        gasto.concepto || "Movimiento",
        `${fechaCorta(gasto.fechaDate)} - ${gasto.area || "producto"} - ${gasto.categoria || "Otro"} - ${esGananciaServicio ? "Ganancia servicio" : esIngreso ? "Ingreso" : esMaterial ? "Material" : esInversion ? "Reinversion" : "Gasto"}`,
        `${esIngreso || esGananciaServicio ? "+ " : ""}S/${dinero(gasto.monto)}`,
        !esInversion && !esIngreso && !esGananciaServicio && !esMaterial,
        [
          { label: "Editar", onClick: () => editarGasto(gasto.id) },
          { label: "Borrar", danger: true, onClick: () => eliminarGasto(gasto.id) }
        ]
      );
    });
  }

  const sueldos = state.sueldos
    .slice()
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 10);

  if (sueldos.length === 0) {
    agregarVacio(refs.listaSueldos, "Aun no registraste sueldo o pagos personales.");
  } else {
    sueldos.forEach((sueldo) => {
      const base = Math.max(
        Number(sueldo.monto || 0)
          - Number(sueldo.deudas || 0)
          - Number(sueldo.pendientes || 0)
          - Number(sueldo.alquiler || 0)
          - Number(sueldo.inesperados || 0),
        0
      );
      const emergencia = base * 0.20;
      const ahorro = base * 0.20;
      const lujos = base * 0.10;
      const libre = base * 0.15;
      agregarItem(
        refs.listaSueldos,
        sueldo.nota || "Sueldo administrado",
        `${fechaCorta(sueldo.fechaDate)} - alquiler S/${dinero(sueldo.alquiler)} - inesperados S/${dinero(sueldo.inesperados)} - emergencia S/${dinero(emergencia)} - ahorro S/${dinero(ahorro)} - lujos S/${dinero(lujos)}`,
        `Libre S/${dinero(libre)}`,
        libre < 0,
        [
          { label: "Editar", onClick: () => editarSueldo(sueldo.id) },
          { label: "Borrar", danger: true, onClick: () => eliminarSueldo(sueldo.id) }
        ]
      );
    });
  }

  const ahorros = state.ahorros
    .slice()
    .sort((a, b) => b.fechaDate - a.fechaDate)
    .slice(0, 10);

  if (ahorros.length === 0) {
    agregarVacio(refs.listaAhorros, "No hay ahorro manual todavia.");
  } else {
    ahorros.forEach((item) => {
      const negativo = item.tipo === "retiro";
      agregarItem(
        refs.listaAhorros,
        item.tipo === "retiro" ? "Retiro" : "Aporte",
        `${fechaCorta(item.fechaDate)} - ${item.nota || "Sin nota"}`,
        `${negativo ? "-" : "+"} S/${dinero(item.monto)}`,
        negativo
      );
    });
  }
}

function editarIngreso(id) {
  const ingreso = state.ingresos.find((item) => item.id === id);
  if (!ingreso) return;

  refs.ingresoId.value = ingreso.id;
  refs.ingresoConcepto.value = ingreso.concepto || "";
  refs.ingresoMonto.value = ingreso.monto || "";
  refs.ingresoMetodo.value = ingreso.metodo || "Yape";
  refs.ingresoCategoria.value = ingreso.categoria || "Otro servicio";
  refs.ingresoFecha.value = ingreso.fecha || fechaISO(ingreso.fechaDate);
  refs.guardarIngreso.textContent = "Actualizar ingreso";
  refs.ingresoForm.classList.add("editing");
  refs.ingresoConcepto.focus();
}

function editarExtra(id) {
  const extra = state.gastos.find((item) => item.id === id);
  if (!extra) return;

  editarGasto(id);
}

function editarGasto(id) {
  const gasto = state.gastos.find((item) => item.id === id);
  if (!gasto) return;

  refs.gastoId.value = gasto.id;
  refs.gastoConcepto.value = gasto.concepto || "";
  refs.gastoMonto.value = gasto.monto || "";
  refs.gastoTipo.value = gasto.tipo || "gasto";
  refs.gastoArea.value = gasto.area || "producto";
  refs.gastoCategoria.value = gasto.categoria || "Otro";
  refs.gastoFecha.value = gasto.fecha || fechaISO(gasto.fechaDate);
  refs.guardarGasto.textContent = "Actualizar movimiento";
  refs.gastoForm.classList.add("editing");
  refs.gastoConcepto.focus();
}

function editarSueldo(id) {
  const sueldo = state.sueldos.find((item) => item.id === id);
  if (!sueldo) return;

  refs.sueldoId.value = sueldo.id;
  refs.sueldoMonto.value = sueldo.monto || "";
  refs.sueldoFecha.value = sueldo.fecha || fechaISO(sueldo.fechaDate);
  refs.sueldoDeudas.value = sueldo.deudas || 0;
  refs.sueldoPendientes.value = sueldo.pendientes || 0;
  refs.sueldoAlquiler.value = sueldo.alquiler || 0;
  refs.sueldoInesperados.value = sueldo.inesperados || 0;
  refs.sueldoNota.value = sueldo.nota || "";
  refs.guardarSueldo.textContent = "Actualizar sueldo";
  refs.sueldoForm.classList.add("editing");
  renderSueldoPreview();
  refs.sueldoMonto.focus();
}

async function eliminarGasto(id) {
  await borrarDocumento(COLLECTIONS.gastos, id);
  state.gastos = state.gastos.filter((item) => item.id !== id);
  await guardarReporteMensualActual();
  renderResumen();
}

async function eliminarIngreso(id) {
  await borrarDocumento(COLLECTIONS.ingresos, id);
  state.ingresos = state.ingresos.filter((item) => item.id !== id);
  await guardarReporteMensualActual();
  renderResumen();
}

async function eliminarExtra(id) {
  await eliminarGasto(id);
  renderResumen();
}

async function eliminarSueldo(id) {
  await borrarDocumento(COLLECTIONS.sueldos, id);
  state.sueldos = state.sueldos.filter((item) => item.id !== id);
  await guardarReporteMensualActual();
  renderResumen();
}

async function recargarFinanzas() {
  const [ingresos, extras, gastos, sueldos, ahorros] = await Promise.all([
    cargarColeccion(COLLECTIONS.ingresos),
    cargarColeccion(COLLECTIONS.extras),
    cargarColeccion(COLLECTIONS.gastos),
    cargarColeccion(COLLECTIONS.sueldos),
    cargarColeccion(COLLECTIONS.ahorros)
  ]);

  state.ingresos = ingresos;
  state.extras = extras;
  state.gastos = gastos;
  state.sueldos = sueldos;
  state.ahorros = ahorros;
}

async function guardarReporteMensualActual() {
  try {
    const mes = claveMesActual();
    const resumen = calcularFinanzas("month");

    await setDoc(doc(db, COLLECTIONS.reportes, mes), {
      mes,
      desde: inicioMesClave(mes),
      actualizadoEn: new Date().toISOString(),
      productosTotal: resumen.productos.total,
      inversionBase: resumen.productos.costo,
      gastosAplicados: resumen.productos.gastos + resumen.servicios.gastos + resumen.generales.gasto,
      serviciosTotal: resumen.servicios.total,
      materialesServicios: resumen.servicios.materialesSugeridos,
      materialesBase: resumen.servicios.materialesBase,
      materialesManual: resumen.servicios.materialesManual,
      reinversionServicios: resumen.servicios.reinversionBase,
      reinversionBase: resumen.servicios.reinversionSugerida,
      reinversionManual: resumen.servicios.reinversionManual,
      gananciaServicios: resumen.servicios.ganancia,
      gananciaServicioExtra: resumen.servicios.gananciaExtra,
      gananciaRepartida: resumen.gananciaRepartida,
      gananciaProductos: resumen.productos.neto,
      gananciaReal: resumen.gananciaReal,
      ahorroCalculado: resumen.sueldos.ahorro + resumen.gananciaReal + resumen.ahorroManual
    }, { merge: true });
  } catch (error) {
    console.warn("No se pudo guardar el reporte mensual.", error);
  }
}

async function limpiarReportesAntiguos() {
  try {
    const limite = mesClaveOffset(claveMesActual(), -2);
    const snap = await getDocs(collection(db, COLLECTIONS.reportes));
    const borrados = snap.docs
      .filter((item) => item.id <= limite)
      .map((item) => deleteDoc(doc(db, COLLECTIONS.reportes, item.id)));

    await Promise.all(borrados);
  } catch (error) {
    console.warn("No se pudieron limpiar reportes antiguos.", error);
  }
}

async function cargarTodo() {
  refs.conexionEstado.textContent = "Conectando con ventas y finanzas...";

  try {
    const [ventas] = await Promise.all([
      cargarColeccion("ventas"),
      recargarFinanzas()
    ]);

    state.ventas = ventas;
    await guardarReporteMensualActual();
    await limpiarReportesAntiguos();
    refs.conexionEstado.textContent = `Conexion activa: ${state.ventas.length} ventas, ${state.ingresos.length} ingresos de servicio y ${state.gastos.length} movimientos aplicados.`;
  } catch (error) {
    refs.conexionEstado.textContent = "No se pudo leer o escribir en Firestore. Revisa internet, permisos o reglas.";
    console.error(error);
  }

  renderResumen();
}

function registrarEventos() {
  $$(".period-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".period-tabs button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.periodo = button.dataset.period;
      renderResumen();
    });
  });

  refs.reporteMes.addEventListener("change", () => {
    state.reporteMes = refs.reporteMes.value || claveMesActual();
    state.periodo = "report";
    $$(".period-tabs button").forEach((item) => {
      item.classList.toggle("active", item.dataset.period === "report");
    });
    renderResumen();
  });

  refs.guardarMeta.addEventListener("click", () => {
    localStorage.setItem(META_KEY, refs.metaInput.value || "0");
    renderResumen();
  });

  refs.ingresoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const monto = numeroInput(refs.ingresoMonto);
    const concepto = refs.ingresoConcepto.value.trim();
    if (monto <= 0 || !concepto) return;

    await guardarDocumento(COLLECTIONS.ingresos, refs.ingresoId.value, {
      concepto,
      monto,
      metodo: refs.ingresoMetodo.value,
      categoria: refs.ingresoCategoria.value,
      fecha: refs.ingresoFecha.value || fechaISO(),
      actualizadoEn: new Date().toISOString()
    });

    resetFormulario(refs.ingresoForm);
    await recargarFinanzas();
    await guardarReporteMensualActual();
    renderResumen();
  });

  refs.cancelarIngreso.addEventListener("click", () => resetFormulario(refs.ingresoForm));

  refs.gastoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const monto = numeroInput(refs.gastoMonto);
    const concepto = refs.gastoConcepto.value.trim();
    if (monto <= 0 || !concepto) return;

    const data = {
      concepto,
      monto,
      tipo: refs.gastoTipo.value,
      area: refs.gastoArea.value,
      categoria: refs.gastoCategoria.value,
      fecha: refs.gastoFecha.value || fechaISO(),
      actualizadoEn: new Date().toISOString()
    };

    await guardarDocumento(COLLECTIONS.gastos, refs.gastoId.value, data);
    resetFormulario(refs.gastoForm);
    await recargarFinanzas();
    await guardarReporteMensualActual();
    renderResumen();
  });

  refs.cancelarGasto.addEventListener("click", () => resetFormulario(refs.gastoForm));

  refs.sueldoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const monto = numeroInput(refs.sueldoMonto);
    if (monto <= 0) return;

    const data = {
      monto,
      fecha: refs.sueldoFecha.value || fechaISO(),
      deudas: numeroInput(refs.sueldoDeudas),
      pendientes: numeroInput(refs.sueldoPendientes),
      alquiler: numeroInput(refs.sueldoAlquiler),
      inesperados: numeroInput(refs.sueldoInesperados),
      nota: refs.sueldoNota.value.trim(),
      actualizadoEn: new Date().toISOString()
    };

    await guardarDocumento(COLLECTIONS.sueldos, refs.sueldoId.value, data);
    resetFormulario(refs.sueldoForm);
    await recargarFinanzas();
    await guardarReporteMensualActual();
    renderResumen();
  });

  refs.cancelarSueldo.addEventListener("click", () => resetFormulario(refs.sueldoForm));

  refs.ahorroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const monto = numeroInput(refs.montoAhorro);
    if (monto <= 0) return;

    await guardarDocumento(COLLECTIONS.ahorros, "", {
      monto,
      tipo: refs.tipoAhorro.value,
      nota: refs.notaAhorro.value.trim(),
      fecha: fechaISO(),
      actualizadoEn: new Date().toISOString()
    });

    refs.ahorroForm.reset();
    await recargarFinanzas();
    await guardarReporteMensualActual();
    renderResumen();
  });

  [
    refs.sueldoMonto,
    refs.sueldoDeudas,
    refs.sueldoPendientes,
    refs.sueldoAlquiler,
    refs.sueldoInesperados
  ].forEach((input) => input.addEventListener("input", renderSueldoPreview));
}

refs.metaInput.value = localStorage.getItem(META_KEY) || "5000";
refs.reporteMes.value = state.reporteMes;
refs.ingresoFecha.value = fechaISO();
refs.gastoFecha.value = fechaISO();
refs.sueldoFecha.value = fechaISO();
registrarEventos();
renderResumen();
cargarTodo();
