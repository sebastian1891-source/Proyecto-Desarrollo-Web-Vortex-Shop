// =========================================================
// PERFIL (página protegida)
// ---------------------------------------------------------
// 1. Espera a que Firebase recupere la sesión.
// 2. Si no hay usuario, redirige a login.html?redirect=perfil.html.
// 3. Si hay usuario, lee su documento usuarios/{uid} en Firestore
//    y muestra sus datos.
// =========================================================

import { obtenerUsuarioActual, obtenerDatosUsuario } from "./firebase/auth.js";
import { obtenerPedidosDelUsuario, numeroPedido } from "./firebase/pedidos.js";
import { guardarMensajePendiente, escaparHtml } from "./mensajes.js";
import { formatearPrecio } from "./productosUI.js";

const contenedor = document.querySelector("#perfil-container");

function formatearFecha(timestamp) {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("es-UY", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function crearFilaDato(etiqueta, valor) {
    return `
        <div class="perfil-dato">
            <span>${etiqueta}</span>
            <strong>${escaparHtml(valor)}</strong>
        </div>
    `;
}

function renderizarPerfil(usuario, datos) {
    // Si el documento no existe (ej: usuario creado a mano en la consola)
    // se usan los datos básicos de Authentication.
    const nombre = datos?.nombre ?? usuario.displayName?.split(" ")[0] ?? "";
    const apellido = datos?.apellido ?? usuario.displayName?.split(" ").slice(1).join(" ") ?? "";
    const nombreCompleto = `${nombre} ${apellido}`.trim() || usuario.email;
    const inicial = (nombre || usuario.email).charAt(0).toUpperCase();

    contenedor.innerHTML = `
        <div class="section-heading mb-4">
            <div>
                <span class="eyebrow">Mi cuenta</span>
                <h1 class="fw-bold">Mi perfil</h1>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-4">
                <div class="auth-card text-center h-100">
                    <div class="avatar-grande">${escaparHtml(inicial)}</div>
                    <h2 class="h5 fw-bold mb-1">${escaparHtml(nombreCompleto)}</h2>
                    <p class="text-secondary small mb-3">${escaparHtml(usuario.email)}</p>
                    <span class="badge rounded-pill badge-hero text-capitalize">${escaparHtml(datos?.rol ?? "cliente")}</span>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="auth-card h-100">
                    <h2 class="h5 fw-bold mb-3">Datos de la cuenta</h2>
                    ${crearFilaDato("Nombre", nombre || "—")}
                    ${crearFilaDato("Apellido", apellido || "—")}
                    ${crearFilaDato("Correo electrónico", usuario.email)}
                    ${crearFilaDato("Miembro desde", formatearFecha(datos?.fechaRegistro))}
                    ${datos ? "" : `<p class="text-warning small mt-3 mb-0">No se encontraron datos adicionales de esta cuenta en Firestore.</p>`}
                </div>
            </div>

            <div class="col-12" id="pedidos">
                <div class="auth-card">
                    <h2 class="h5 fw-bold mb-3">Mis pedidos</h2>
                    <div id="pedidos-container">
                        <div class="text-center py-3 text-secondary">
                            <div class="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
                            Cargando tus pedidos...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

const ESTADOS_PEDIDO = {
    pendiente: { texto: "Pendiente", clase: "text-bg-warning" },
    enviado: { texto: "Enviado", clase: "text-bg-info" },
    entregado: { texto: "Entregado", clase: "text-bg-success" },
    cancelado: { texto: "Cancelado", clase: "text-bg-secondary" }
};

function crearTarjetaPedido(pedido) {
    const estado = ESTADOS_PEDIDO[pedido.estado] ?? { texto: pedido.estado, clase: "text-bg-light" };
    const fecha = pedido.fecha?.toDate
        ? pedido.fecha.toDate().toLocaleString("es-UY", { dateStyle: "medium", timeStyle: "short" })
        : "—";

    return `
        <article class="pedido-card">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                    <strong class="pedido-numero">Pedido ${numeroPedido(pedido.id)}</strong>
                    <div class="text-secondary small">${fecha}</div>
                </div>
                <span class="badge rounded-pill ${estado.clase}">${escaparHtml(estado.texto)}</span>
            </div>

            <div class="table-responsive">
                <table class="table table-sm align-middle mb-2">
                    <thead>
                        <tr><th>Producto</th><th class="text-end">Precio</th><th class="text-end">Cant.</th><th class="text-end">Subtotal</th></tr>
                    </thead>
                    <tbody>
                        ${(pedido.items ?? []).map(item => `
                            <tr>
                                <td><a href="producto.html?id=${encodeURIComponent(item.idProducto)}" class="link-carrito">${escaparHtml(item.nombre)}</a></td>
                                <td class="text-end">${formatearPrecio(item.precioUnitario)}</td>
                                <td class="text-end">${item.cantidad}</td>
                                <td class="text-end">${formatearPrecio(item.subtotal)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="text-end small text-secondary">Envío: ${pedido.envio === 0 ? "Gratis" : formatearPrecio(pedido.envio ?? 0)}</div>
            <div class="text-end fw-bold" style="color: var(--primary);">Total: ${formatearPrecio(pedido.total ?? 0)}</div>
        </article>
    `;
}

// Solo se consultan los pedidos cuyo uid es el del usuario autenticado
async function cargarPedidos(uid) {
    const contenedorPedidos = document.querySelector("#pedidos-container");

    try {
        const pedidos = await obtenerPedidosDelUsuario(uid);

        if (pedidos.length === 0) {
            contenedorPedidos.innerHTML = `
                <p class="text-secondary mb-2">Todavía no hiciste ninguna compra.</p>
                <a href="catalogo.html" class="btn btn-primary btn-sm">Ir al catálogo</a>
            `;
            return;
        }

        contenedorPedidos.innerHTML = pedidos.map(crearTarjetaPedido).join("");

        // Si se llegó con perfil.html#pedidos (ej: después de comprar), se baja hasta la sección
        if (window.location.hash === "#pedidos") {
            document.querySelector("#pedidos").scrollIntoView({ behavior: "smooth" });
        }
    } catch (error) {
        console.error(error);
        contenedorPedidos.innerHTML = `
            <p class="text-danger mb-2">No se pudieron cargar tus pedidos. Revisá tu conexión e intentá de nuevo.</p>
            <button class="btn btn-outline-primary btn-sm" id="btnReintentarPedidos">Reintentar</button>
        `;
        contenedorPedidos.querySelector("#btnReintentarPedidos").addEventListener("click", () => cargarPedidos(uid));
    }
}

function renderizarError() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">⚠️</div>
            <h1>No pudimos cargar tu perfil</h1>
            <p class="lead">Revisá tu conexión e intentá de nuevo.</p>
            <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
        </section>
    `;
}

const usuario = await obtenerUsuarioActual();

if (!usuario) {
    // Página protegida: sin sesión se manda al login y luego se vuelve acá
    guardarMensajePendiente("Iniciá sesión para ver tu perfil.");
    window.location.replace("login.html?redirect=perfil.html");
} else {
    try {
        const datos = await obtenerDatosUsuario(usuario.uid);
        renderizarPerfil(usuario, datos);
        cargarPedidos(usuario.uid);
    } catch (error) {
        console.error(error);
        // Si Firestore falla (reglas o conexión) igual se muestran los datos de Authentication
        if (error.code === "permission-denied") {
            renderizarPerfil(usuario, null);
            cargarPedidos(usuario.uid);
        } else {
            renderizarError();
        }
    }
}
