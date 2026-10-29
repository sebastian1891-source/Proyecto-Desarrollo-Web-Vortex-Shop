// =========================================================
// PANEL · PESTAÑA RESUMEN (opcional)
// ---------------------------------------------------------
// Estadísticas generales calculadas con los datos que ya cargaron
// las demás pestañas (no hace consultas propias). Se redibuja cada
// vez que cambian productos, pedidos, usuarios o comentarios.
// =========================================================

import { escaparHtml } from "../mensajes.js";
import { formatearPrecio } from "../productosUI.js";
import { numeroPedido, datosEstado, ESTADOS_PEDIDO } from "../firebase/pedidos.js";
import { ROLES } from "../firebase/roles.js";
import { formatearFecha } from "./utilidades.js";

const STOCK_BAJO = 3;
let seccion, ctx;

function tarjeta(titulo, valor, detalle = "", destino = "") {
    return `
        <div class="col-6 col-lg-3">
            <div class="stat-card h-100" ${destino ? `role="button" tabindex="0" data-ir="${destino}"` : ""}>
                <span class="stat-titulo">${titulo}</span>
                <strong class="stat-valor">${valor}</strong>
                <span class="stat-detalle">${detalle}</span>
            </div>
        </div>
    `;
}

const cargando = `<span class="placeholder col-6"></span>`;

function barras(filas) {
    const maximo = Math.max(1, ...filas.map(f => f.valor));
    return filas.map(f => `
        <div class="barra-fila">
            <div class="d-flex justify-content-between small mb-1">
                <span class="text-truncate me-2">${f.etiqueta}</span><strong>${f.textoValor ?? f.valor}</strong>
            </div>
            <div class="progress" style="height: 8px;" role="presentation">
                <div class="progress-bar ${f.clase ?? ""}" style="width: ${(f.valor / maximo) * 100}%"></div>
            </div>
        </div>
    `).join("");
}

function dibujar() {
    if (!seccion) return;
    const { productos, pedidos, usuarios, valoraciones } = ctx.datos;

    // ----- Productos -----
    const totalProductos = productos?.length;
    const aLaVenta = productos?.filter(p => p.disponible && p.stock > 0).length;
    const sinStock = productos?.filter(p => p.disponible && p.stock === 0).length;
    const inactivos = productos?.filter(p => !p.disponible).length;
    const unidades = productos?.reduce((s, p) => s + p.stock, 0);
    const stockBajo = (productos ?? []).filter(p => p.disponible && p.stock <= STOCK_BAJO)
        .sort((a, b) => a.stock - b.stock);

    // ----- Pedidos (los cancelados no cuentan como ventas) -----
    const validos = (pedidos ?? []).filter(p => p.estado !== "cancelado");
    const ingresos = validos.reduce((s, p) => s + (Number(p.total) || 0), 0);
    const pendientes = pedidos?.filter(p => p.estado === "pendiente").length;
    const ticket = validos.length ? Math.round(ingresos / validos.length) : 0;

    const vendidos = {};
    validos.forEach(p => (p.items ?? []).forEach(i => {
        const v = vendidos[i.idProducto] ??= { nombre: i.nombre, cantidad: 0, total: 0 };
        v.cantidad += Number(i.cantidad) || 0;
        v.total += Number(i.subtotal) || 0;
    }));
    const masVendidos = Object.values(vendidos).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    // ----- Usuarios y opiniones -----
    const clientes = usuarios?.filter(u => u.rol !== ROLES.ADMINISTRADOR).length;
    const admins = usuarios?.filter(u => u.rol === ROLES.ADMINISTRADOR).length;
    const promedio = valoraciones?.length
        ? (valoraciones.reduce((s, v) => s + (Number(v.estrellas) || 0), 0) / valoraciones.length).toFixed(1)
        : null;

    const v = (dato, formato = x => x) => dato === undefined ? cargando : formato(dato);

    seccion.innerHTML = `
        <div class="row g-3 mb-4">
            ${tarjeta("Productos", v(totalProductos), productos ? `${aLaVenta} a la venta` : "", "productos")}
            ${tarjeta("Sin stock / inactivos", v(productos && sinStock + inactivos), productos ? `${sinStock} sin stock · ${inactivos} desactivados` : "", "productos")}
            ${tarjeta("Unidades en stock", v(unidades), "", "productos")}
            ${tarjeta("Pedidos", v(pedidos?.length), pedidos ? `${pendientes} pendientes` : "", "pedidos")}
            ${tarjeta("Ingresos", v(pedidos && ingresos, formatearPrecio), pedidos ? "sin contar cancelados" : "", "pedidos")}
            ${tarjeta("Ticket promedio", v(pedidos && ticket, formatearPrecio), "", "pedidos")}
            ${tarjeta("Clientes", v(clientes), usuarios ? `${admins} ${admins === 1 ? "administrador" : "administradores"}` : "", "usuarios")}
            ${tarjeta("Opiniones", v(valoraciones?.length), promedio ? `promedio ${promedio} ★` : (valoraciones ? "sin opiniones" : ""), "comentarios")}
        </div>

        <div class="row g-4">
            <div class="col-lg-6">
                <div class="auth-card h-100">
                    <h2 class="h6 fw-bold mb-3">Productos más vendidos</h2>
                    ${!pedidos ? cargando : masVendidos.length
                        ? barras(masVendidos.map(m => ({ etiqueta: escaparHtml(m.nombre), valor: m.cantidad, textoValor: `${m.cantidad} u. · ${formatearPrecio(m.total)}` })))
                        : `<p class="text-secondary small mb-0">Todavía no hay ventas.</p>`}
                </div>
            </div>

            <div class="col-lg-6">
                <div class="auth-card h-100">
                    <h2 class="h6 fw-bold mb-3">Pedidos por estado</h2>
                    ${!pedidos ? cargando : pedidos.length
                        ? barras(Object.entries(ESTADOS_PEDIDO).map(([clave, e]) => ({
                            etiqueta: e.texto,
                            valor: pedidos.filter(p => p.estado === clave).length,
                            clase: e.clase.replace("text-bg-", "bg-")
                        })))
                        : `<p class="text-secondary small mb-0">Todavía no hay pedidos.</p>`}
                </div>
            </div>

            <div class="col-lg-6">
                <div class="auth-card h-100">
                    <h2 class="h6 fw-bold mb-3">Stock bajo <span class="text-secondary fw-normal small">(${STOCK_BAJO} unidades o menos)</span></h2>
                    ${!productos ? cargando : stockBajo.length ? `
                        <ul class="list-unstyled mb-0 small">
                            ${stockBajo.map(p => `
                                <li class="d-flex justify-content-between border-bottom py-1">
                                    <span class="text-truncate me-2">${escaparHtml(p.nombre)}</span>
                                    <span class="badge ${p.stock === 0 ? "text-bg-danger" : "text-bg-warning"}">${p.stock === 0 ? "Sin stock" : `${p.stock} u.`}</span>
                                </li>`).join("")}
                        </ul>` : `<p class="text-secondary small mb-0">Todos los productos activos tienen más de ${STOCK_BAJO} unidades.</p>`}
                </div>
            </div>

            <div class="col-lg-6">
                <div class="auth-card h-100">
                    <h2 class="h6 fw-bold mb-3">Últimos pedidos</h2>
                    ${!pedidos ? cargando : pedidos.length ? `
                        <ul class="list-unstyled mb-0 small">
                            ${pedidos.slice(0, 5).map(p => `
                                <li class="d-flex justify-content-between align-items-center gap-2 border-bottom py-1">
                                    <span><strong>${numeroPedido(p.id)}</strong> · ${escaparHtml(p.cliente?.nombre || p.cliente?.email || "—")}
                                        <span class="text-secondary d-block">${formatearFecha(p.fecha, true)}</span></span>
                                    <span class="text-end text-nowrap">${formatearPrecio(p.total ?? 0)}
                                        <span class="badge rounded-pill ${datosEstado(p.estado).clase} d-block mt-1">${datosEstado(p.estado).texto}</span></span>
                                </li>`).join("")}
                        </ul>` : `<p class="text-secondary small mb-0">Todavía no hay pedidos.</p>`}
                </div>
            </div>
        </div>
    `;
}

export function iniciarResumen(elemento, contexto) {
    seccion = elemento;
    ctx = contexto;
    dibujar();
    ctx.suscribir(dibujar);

    // Las tarjetas llevan a la pestaña correspondiente
    seccion.addEventListener("click", evento => {
        const destino = evento.target.closest("[data-ir]")?.dataset.ir;
        if (destino) ctx.irAPestania(destino);
    });
    seccion.addEventListener("keydown", evento => {
        const destino = evento.target.closest("[data-ir]")?.dataset.ir;
        if (destino && (evento.key === "Enter" || evento.key === " ")) {
            evento.preventDefault();
            ctx.irAPestania(destino);
        }
    });
}
