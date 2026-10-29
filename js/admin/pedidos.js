// =========================================================
// PANEL · PESTAÑA PEDIDOS (opcional)
// ---------------------------------------------------------
// - Consulta de todos los pedidos, filtrables por estado y por
//   número, nombre o correo del cliente.
// - Cambio de estado: pendiente → en preparación → enviado → entregado.
//   Cancelar devuelve el stock y es definitivo (se pide confirmación).
// =========================================================

import {
    obtenerTodosLosPedidos,
    cambiarEstadoPedido,
    numeroPedido,
    datosEstado,
    ESTADOS_PEDIDO
} from "../firebase/pedidos.js";
import { escaparHtml, mostrarAviso } from "../mensajes.js";
import { formatearPrecio } from "../productosUI.js";
import { confirmar } from "./confirmar.js";
import { formatearFecha, mensajeCargando, mostrarErrorCarga, mensajeErrorFirestore, normalizar } from "./utilidades.js";

let seccion, ctx;

function dibujarSeccion() {
    seccion.innerHTML = `
        <div class="auth-card">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h2 class="h5 fw-bold mb-0">Pedidos <span class="text-secondary fw-normal" id="contadorPedidos"></span></h2>
                <button type="button" class="btn btn-outline-primary btn-sm" id="btnRecargarPedidos">Actualizar</button>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-sm-7">
                    <input type="search" class="form-control form-control-sm" id="buscarPedido" placeholder="Buscar por número, nombre o correo">
                </div>
                <div class="col-sm-5">
                    <select class="form-select form-select-sm" id="filtroEstadoPedido" aria-label="Filtrar por estado">
                        <option value="">Todos los estados</option>
                        ${Object.entries(ESTADOS_PEDIDO).map(([valor, e]) => `<option value="${valor}">${e.texto}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div id="listaPedidos"></div>
            <p class="text-secondary small mt-3 mb-0">
                Al <strong>cancelar</strong> un pedido se devuelven sus unidades al stock. Un pedido cancelado ya no puede cambiar de estado.
            </p>
        </div>
    `;

    seccion.querySelector("#btnRecargarPedidos").addEventListener("click", cargar);
    seccion.querySelector("#buscarPedido").addEventListener("input", dibujarLista);
    seccion.querySelector("#filtroEstadoPedido").addEventListener("change", dibujarLista);

    seccion.querySelector("#listaPedidos").addEventListener("change", evento => {
        const select = evento.target.closest("select[data-pedido]");
        if (select) cambiarEstado(select);
    });
}

function filtrar(pedidos) {
    const texto = normalizar(seccion.querySelector("#buscarPedido").value.trim());
    const estado = seccion.querySelector("#filtroEstadoPedido").value;

    return pedidos.filter(p =>
        (estado === "" || p.estado === estado) &&
        (texto === "" || normalizar(`${numeroPedido(p.id)} ${p.cliente?.nombre} ${p.cliente?.email}`).includes(texto))
    );
}

function selectorEstado(pedido) {
    if (pedido.estado === "cancelado") {
        return `<span class="badge rounded-pill ${datosEstado("cancelado").clase}">Cancelado</span>`;
    }
    return `
        <select class="form-select form-select-sm selector-estado" data-pedido="${escaparHtml(pedido.id)}" aria-label="Estado del pedido ${numeroPedido(pedido.id)}">
            ${Object.entries(ESTADOS_PEDIDO).map(([valor, e]) =>
                `<option value="${valor}" ${valor === pedido.estado ? "selected" : ""}>${e.texto}</option>`).join("")}
        </select>
    `;
}

function dibujarLista() {
    const lista = seccion.querySelector("#listaPedidos");
    const todos = ctx.datos.pedidos ?? [];
    const pedidos = filtrar(todos);

    seccion.querySelector("#contadorPedidos").textContent =
        pedidos.length === todos.length ? `(${todos.length})` : `(${pedidos.length} de ${todos.length})`;

    if (todos.length === 0) {
        lista.innerHTML = `<p class="text-secondary mb-0">Todavía no hay pedidos.</p>`;
        return;
    }
    if (pedidos.length === 0) {
        lista.innerHTML = `<p class="text-secondary mb-0">Ningún pedido coincide con la búsqueda.</p>`;
        return;
    }

    lista.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle mb-0 tabla-admin">
                <thead>
                    <tr><th>Pedido</th><th>Cliente</th><th>Productos</th><th class="text-end">Total</th><th>Estado</th></tr>
                </thead>
                <tbody>
                    ${pedidos.map(p => {
                        const unidades = (p.items ?? []).reduce((s, i) => s + (Number(i.cantidad) || 0), 0);
                        return `
                        <tr>
                            <td class="text-nowrap">
                                <strong>${numeroPedido(p.id)}</strong>
                                <div class="text-secondary small">${formatearFecha(p.fecha, true)}</div>
                            </td>
                            <td>
                                ${escaparHtml(p.cliente?.nombre || "—")}
                                <div class="text-secondary small text-break">${escaparHtml(p.cliente?.email || "")}</div>
                            </td>
                            <td>
                                <details>
                                    <summary class="small">${unidades} ${unidades === 1 ? "unidad" : "unidades"}</summary>
                                    <ul class="small ps-3 mb-0 mt-1">
                                        ${(p.items ?? []).map(i => `<li>${i.cantidad} × ${escaparHtml(i.nombre)} <span class="text-secondary">(${formatearPrecio(i.subtotal)})</span></li>`).join("")}
                                    </ul>
                                </details>
                            </td>
                            <td class="text-end text-nowrap fw-semibold">${formatearPrecio(p.total ?? 0)}</td>
                            <td style="min-width: 150px;">${selectorEstado(p)}</td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

async function cambiarEstado(select) {
    const idPedido = select.dataset.pedido;
    const pedido = (ctx.datos.pedidos ?? []).find(p => p.id === idPedido);
    const nuevoEstado = select.value;
    if (!pedido || nuevoEstado === pedido.estado) return;

    if (nuevoEstado === "cancelado") {
        const acepta = await confirmar({
            titulo: `Cancelar pedido ${numeroPedido(idPedido)}`,
            mensaje: `Se devolverán sus unidades al stock y el pedido no podrá volver a cambiar de estado. ¿Querés cancelarlo?`,
            textoBoton: "Cancelar pedido",
            peligro: true
        });
        if (!acepta) {
            select.value = pedido.estado;
            return;
        }
    }

    select.disabled = true;
    try {
        await cambiarEstadoPedido(idPedido, nuevoEstado);
        mostrarAviso(`Pedido ${numeroPedido(idPedido)}: ${datosEstado(nuevoEstado).texto.toLowerCase()}.` +
            (nuevoEstado === "cancelado" ? " Se devolvió el stock." : ""));

        await cargar();
        if (nuevoEstado === "cancelado") await ctx.recargarProductos();
    } catch (error) {
        console.error(error);
        mostrarAviso(mensajeErrorFirestore(error, "No se pudo cambiar el estado del pedido. Intentá de nuevo."));
        select.value = pedido.estado;
        select.disabled = false;
    }
}

async function cargar() {
    const lista = seccion.querySelector("#listaPedidos");
    lista.innerHTML = mensajeCargando("Cargando pedidos...");

    try {
        ctx.datos.pedidos = await obtenerTodosLosPedidos();
        dibujarLista();
        ctx.avisarCambio("pedidos");
    } catch (error) {
        console.error(error);
        mostrarErrorCarga(lista, mensajeErrorFirestore(error, "No se pudieron cargar los pedidos."), cargar);
    }
}

export async function iniciarPedidos(elemento, contexto) {
    seccion = elemento;
    ctx = contexto;
    dibujarSeccion();
    await cargar();
}
