// =========================================================
// CARRITO DE COMPRAS
// ---------------------------------------------------------
// En LocalStorage solo se guarda { id, cantidad } de cada producto.
// Los datos del producto (nombre, precio, stock, disponibilidad)
// se consultan siempre en Firestore, así el carrito nunca usa
// información vieja.
// =========================================================

import { obtenerProductoPorId, obtenerProductos, mensajeErrorProductos } from "./firebase/productos.js";
import { crearPedido, calcularEnvio, numeroPedido, mensajeErrorPedido, ErrorCompra } from "./firebase/pedidos.js";
import { obtenerUsuarioActual } from "./firebase/auth.js";
import { mostrarAviso, escaparHtml } from "./mensajes.js";
import { formatearPrecio, crearHtmlEstado } from "./productosUI.js";

const CLAVE_CARRITO = "vortexCarrito";

export function obtenerCarrito() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function quitarDelCarrito(idProducto) {
    guardarCarrito(obtenerCarrito().filter(i => i.id !== idProducto));
}

function vaciarCarrito() {
    guardarCarrito([]);
}

// Agrega un producto al carrito validando ANTES, con los datos actuales de Firestore:
//   - que el producto exista
//   - que esté disponible
//   - que tenga stock
//   - que la cantidad total en el carrito no supere el stock
// Muestra el mensaje que corresponde en cada caso.
export async function agregarYNotificar(idProducto, cantidad = 1) {
    let producto;

    try {
        producto = await obtenerProductoPorId(idProducto);
    } catch (error) {
        console.error(error);
        mostrarAviso("No se pudo verificar el stock del producto. Intentá de nuevo.");
        return "error";
    }

    if (!producto) {
        mostrarAviso("Este producto ya no está en el catálogo.");
        return "noExiste";
    }

    if (!producto.disponible) {
        mostrarAviso(`"${producto.nombre}" no está disponible por el momento.`);
        return "noDisponible";
    }

    if (producto.stock === 0) {
        mostrarAviso(`"${producto.nombre}" no tiene stock por el momento.`);
        return "sinStock";
    }

    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === idProducto);
    const cantidadActual = item ? item.cantidad : 0;

    if (cantidadActual >= producto.stock) {
        const unidades = producto.stock === 1 ? "la única unidad disponible" : `las ${producto.stock} unidades disponibles`;
        mostrarAviso(`Ya tenés en el carrito ${unidades} de "${producto.nombre}". No se pueden agregar más.`);
        return "limite";
    }

    const nuevaCantidad = Math.min(cantidadActual + cantidad, producto.stock);

    if (item) {
        item.cantidad = nuevaCantidad;
    } else {
        carrito.push({ id: idProducto, cantidad: nuevaCantidad });
    }

    guardarCarrito(carrito);
    mostrarAviso(`"${producto.nombre}" se agregó al carrito.`);
    return "agregado";
}

// =========================================================
// PÁGINA DEL CARRITO (solo si existe #carrito-container)
// =========================================================

const contenedor = document.querySelector("#carrito-container");

// Productos consultados en Firestore para los ítems del carrito (id -> producto)
let productosDelCarrito = new Map();

function crearFilaCarrito(item, producto) {
    const subtotal = producto.precio * item.cantidad;
    const urlProducto = `producto.html?id=${encodeURIComponent(producto.id)}`;

    const fila = document.createElement("div");
    fila.className = "d-flex align-items-center gap-3 py-3 border-bottom flex-wrap";

    fila.innerHTML = `
        <a href="${urlProducto}" title="Ver ${escaparHtml(producto.nombre)}">
            <img onerror="this.onerror=null;this.src='img/sin-imagen.svg'" src="${escaparHtml(producto.imagen)}" alt="${escaparHtml(producto.nombre)}"
                 style="width:70px;height:70px;object-fit:cover;border-radius:10px;">
        </a>

        <div class="flex-grow-1">
            <span class="eyebrow">${escaparHtml(producto.categoria)}</span>
            <h3 class="h6 mb-0 mt-1">
                <a href="${urlProducto}" class="link-carrito">${escaparHtml(producto.nombre)}</a>
            </h3>
            <small class="text-secondary">Precio unitario: ${formatearPrecio(producto.precio)}</small>
        </div>

        <div class="text-center">
            <input type="number" min="1" max="${producto.stock}" value="${item.cantidad}"
                   class="form-control form-control-sm campo-cantidad" style="width:70px;"
                   data-id="${escaparHtml(producto.id)}" aria-label="Cantidad">
            <small class="text-secondary">Máx. ${producto.stock}</small>
        </div>

        <div style="min-width:100px;text-align:right;">
            <small class="text-secondary d-block">Subtotal</small>
            <strong>${formatearPrecio(subtotal)}</strong>
        </div>

        <button class="btn btn-outline-danger btn-sm btn-quitar" data-id="${escaparHtml(producto.id)}">
            Quitar
        </button>
    `;

    return fila;
}

function dibujarCarritoVacio() {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">🛒</div>
            <h1>Tu carrito está vacío</h1>
            <p class="lead">Todavía no agregaste productos.</p>
            <a href="catalogo.html" class="btn btn-primary mt-3">Ir al catálogo</a>
        </section>
    `;
}

// Revisa el carrito contra los datos actuales de Firestore:
// quita productos que ya no existen o no están disponibles,
// y ajusta cantidades que superan el stock. Devuelve los avisos.
function sincronizarConStock() {
    const avisos = [];
    const carritoValido = [];

    obtenerCarrito().forEach(item => {
        const producto = productosDelCarrito.get(item.id);

        if (!producto) {
            avisos.push("Se quitó un producto que ya no está en el catálogo.");
            return;
        }

        if (!producto.disponible || producto.stock === 0) {
            avisos.push(`Se quitó "${producto.nombre}" porque ya no está disponible.`);
            return;
        }

        if (item.cantidad > producto.stock) {
            avisos.push(`La cantidad de "${producto.nombre}" se ajustó a ${producto.stock}, el stock disponible.`);
            item.cantidad = producto.stock;
        }

        carritoValido.push(item);
    });

    guardarCarrito(carritoValido);
    return avisos;
}

function dibujarCarrito(avisos = []) {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        dibujarCarritoVacio();
        if (avisos.length) mostrarAviso(avisos.join(" "));
        return;
    }

    contenedor.innerHTML = "";

    if (avisos.length) {
        const alerta = document.createElement("div");
        alerta.className = "alert alert-warning";
        alerta.innerHTML = avisos.map(a => `<div>${escaparHtml(a)}</div>`).join("");
        contenedor.appendChild(alerta);
    }

    const listaEl = document.createElement("div");
    listaEl.className = "p-4 rounded-4 border bg-white shadow-sm";

    let subtotal = 0;

    carrito.forEach(item => {
        const producto = productosDelCarrito.get(item.id);
        subtotal += producto.precio * item.cantidad;
        listaEl.appendChild(crearFilaCarrito(item, producto));
    });

    contenedor.appendChild(listaEl);

    const envio = calcularEnvio(subtotal);
    const total = subtotal + envio;

    const resumenEl = document.createElement("div");
    resumenEl.className = "d-flex justify-content-between align-items-end flex-wrap gap-2 mt-4";
    resumenEl.innerHTML = `
        <div class="d-flex gap-2 flex-wrap">
            <a href="catalogo.html" class="btn btn-outline-primary btn-sm">← Seguir comprando</a>
            <button class="btn btn-outline-secondary btn-sm" id="btnVaciarCarrito">Vaciar carrito</button>
        </div>
        <div class="text-end">
            <p class="mb-1 text-secondary small">Subtotal: ${formatearPrecio(subtotal)}</p>
            <p class="mb-2 text-secondary small">
                Envío: ${envio === 0 ? "Gratis" : formatearPrecio(envio)}
            </p>
            <div class="d-flex align-items-center gap-3">
                <h2 class="fw-bold mb-0" style="color: var(--primary);">Total: ${formatearPrecio(total)}</h2>
                <button class="btn btn-primary" id="btnConfirmarCompra">Confirmar compra</button>
            </div>
        </div>
    `;
    contenedor.appendChild(resumenEl);

    // Lugar para avisos de la compra (ej: "Iniciá sesión para comprar")
    const alertaCompra = document.createElement("div");
    alertaCompra.id = "alertaCompra";
    alertaCompra.className = "d-none";
    contenedor.appendChild(alertaCompra);
}

function mostrarAlertaCompra(html, tipo = "warning") {
    const alerta = document.querySelector("#alertaCompra");
    if (!alerta) return;
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.innerHTML = html;
}

// Pantalla de compra realizada
function dibujarCompraExitosa(pedido) {
    contenedor.innerHTML = `
        <section class="locked-module">
            <div class="locked-icon">✅</div>
            <h1>¡Compra confirmada!</h1>
            <p class="lead">Tu pedido <strong>${numeroPedido(pedido.id)}</strong> quedó registrado.</p>

            <div class="locked-card">
                <h2 class="h5">Resumen</h2>
                <ul>
                    ${pedido.items.map(item => `
                        <li>${escaparHtml(item.nombre)} × ${item.cantidad} — ${formatearPrecio(item.subtotal)}</li>
                    `).join("")}
                </ul>
                <p class="mb-1 mt-3">Envío: ${pedido.envio === 0 ? "Gratis" : formatearPrecio(pedido.envio)}</p>
                <p class="mb-0 fw-bold" style="color: var(--primary);">Total: ${formatearPrecio(pedido.total)}</p>
            </div>

            <div class="d-flex gap-2 justify-content-center flex-wrap mt-4">
                <a href="perfil.html#pedidos" class="btn btn-primary">Ver mis pedidos</a>
                <a href="catalogo.html" class="btn btn-outline-primary">Seguir comprando</a>
            </div>
        </section>
    `;
}

// Flujo completo de "Confirmar compra"
async function confirmarCompra(boton) {
    // 1) Sin sesión no se puede comprar
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
        mostrarAlertaCompra(`
            Para confirmar la compra tenés que iniciar sesión. Tu carrito se mantiene guardado.
            <a href="login.html?redirect=carrito.html" class="alert-link">Iniciar sesión</a> o
            <a href="registro.html" class="alert-link">crear una cuenta</a>.
        `);
        return;
    }

    boton.disabled = true;
    boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Procesando...`;

    // 2) Se revisa el carrito contra Firestore; si cambió algo, el usuario lo revisa primero
    const estado = await cargarCarrito();
    if (estado === "ajustado") {
        mostrarAviso("Algunos productos cambiaron. Revisá tu carrito antes de confirmar.");
    }
    if (estado !== "ok") return;   // si fue "error", ya se muestra el mensaje con "Reintentar"

    // 3) Transacción: vuelve a validar stock, calcula el total con precios actuales,
    //    descuenta el stock y registra el pedido. El carrito se vacía SOLO si todo salió bien.
    try {
        const pedido = await crearPedido(usuario, obtenerCarrito());
        vaciarCarrito();
        dibujarCompraExitosa(pedido);
        mostrarAviso(`¡Gracias por tu compra! Pedido ${numeroPedido(pedido.id)} registrado.`);
    } catch (error) {
        console.error(error);
        mostrarAviso(mensajeErrorPedido(error));

        // Si el problema fue de stock, se recarga el carrito para mostrar los datos actuales
        if (error instanceof ErrorCompra) {
            await cargarCarrito();
        } else {
            dibujarCarrito();
        }
        mostrarAlertaCompra(escaparHtml(mensajeErrorPedido(error)), "danger");
    }
}

// Consulta Firestore y vuelve a dibujar el carrito. Devuelve el resultado:
//   "ok"       -> el carrito está en orden
//   "ajustado" -> se quitaron productos o se corrigieron cantidades
//   "vacio"    -> no hay productos en el carrito
//   "error"    -> no se pudo consultar Firestore
async function cargarCarrito() {
    if (obtenerCarrito().length === 0) {
        dibujarCarritoVacio();
        return "vacio";
    }

    contenedor.innerHTML = `
        <div class="text-center py-5 text-secondary">
            <div class="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p class="mb-0">Cargando tu carrito...</p>
        </div>
    `;

    try {
        const productos = await obtenerProductos();
        productosDelCarrito = new Map(productos.map(p => [p.id, p]));
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = `<div class="row">${crearHtmlEstado({
            icono: "⚠️",
            titulo: "No pudimos cargar tu carrito",
            texto: mensajeErrorProductos(error),
            boton: `<button class="btn btn-primary mt-2" id="btnReintentarCarrito">Reintentar</button>`
        })}</div>`;
        return "error";
    }

    const avisos = sincronizarConStock();
    dibujarCarrito(avisos);

    if (obtenerCarrito().length === 0) return "vacio";
    return avisos.length === 0 ? "ok" : "ajustado";
}

// Un solo listener sobre el contenedor (delegación de eventos),
// porque su contenido se vuelve a dibujar en cada cambio.
function conectarEventosCarrito() {
    contenedor.addEventListener("change", evento => {
        const input = evento.target.closest(".campo-cantidad");
        if (!input) return;

        const producto = productosDelCarrito.get(input.dataset.id);
        const carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === input.dataset.id);
        if (!producto || !item) return;

        const pedida = parseInt(input.value, 10) || 1;
        item.cantidad = Math.max(1, Math.min(pedida, producto.stock));

        if (pedida > producto.stock) {
            mostrarAviso(producto.stock === 1
                ? `Solo queda 1 unidad disponible de "${producto.nombre}".`
                : `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}".`);
        }

        guardarCarrito(carrito);
        dibujarCarrito();
    });

    contenedor.addEventListener("click", async evento => {
        const botonQuitar = evento.target.closest(".btn-quitar");
        if (botonQuitar) {
            quitarDelCarrito(botonQuitar.dataset.id);
            dibujarCarrito();
            return;
        }

        if (evento.target.closest("#btnVaciarCarrito")) {
            vaciarCarrito();
            dibujarCarrito();
            return;
        }

        if (evento.target.closest("#btnReintentarCarrito")) {
            cargarCarrito();
            return;
        }

        const botonConfirmar = evento.target.closest("#btnConfirmarCompra");
        if (botonConfirmar) {
            await confirmarCompra(botonConfirmar);
        }
    });
}

if (contenedor) {
    conectarEventosCarrito();
    cargarCarrito();
}
