const CLAVE_CARRITO = "vortexCarrito";
const COSTO_ENVIO_SIMULADO = 200;
const UMBRAL_ENVIO_GRATIS = 20000;

function obtenerCarrito() {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// Agrega un producto al carrito (o suma cantidad si ya estaba),
// sin superar el stock disponible.
// Devuelve qué pasó, para poder mostrar el mensaje correcto:
//   "agregado"  -> se sumó al carrito
//   "limite"    -> ya estaba la cantidad máxima disponible, no se agregó nada
//   "sinStock"  -> el producto no tiene stock (o no existe)
function agregarAlCarrito(idProducto, cantidad = 1) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto || producto.stock === 0) return "sinStock";

    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === idProducto);

    if (item) {
        if (item.cantidad >= producto.stock) return "limite";
        item.cantidad = Math.min(item.cantidad + cantidad, producto.stock);
    } else {
        carrito.push({ id: idProducto, cantidad: Math.min(cantidad, producto.stock) });
    }

    guardarCarrito(carrito);
    return "agregado";
}

// Agrega el producto y muestra el mensaje que corresponde según el resultado.
// La usan el catálogo, la ficha de producto y los productos relacionados.
function agregarYNotificar(idProducto, cantidad = 1) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const resultado = agregarAlCarrito(idProducto, cantidad);

    if (resultado === "agregado") {
        mostrarToast(`"${producto.nombre}" se agregó al carrito.`);
    } else if (resultado === "limite") {
        mostrarToast(`Ya tenés en el carrito las ${producto.stock} unidades disponibles de "${producto.nombre}". No se pueden agregar más.`);
    } else {
        mostrarToast(`"${producto.nombre}" no tiene stock por el momento.`);
    }
}

function quitarDelCarrito(idProducto) {
    guardarCarrito(obtenerCarrito().filter(i => i.id !== idProducto));
}

// Cambia la cantidad de un ítem, respetando el mínimo (1) y el stock disponible
function cambiarCantidadCarrito(idProducto, nuevaCantidad) {
    const producto = productos.find(p => p.id === idProducto);
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === idProducto);
    if (!item || !producto) return;

    item.cantidad = Math.max(1, Math.min(nuevaCantidad, producto.stock));
    guardarCarrito(carrito);
}

// Muestra un toast reutilizando los elementos #appToast/#toastMessage
// que ya existen en todas las páginas del sitio.
function mostrarToast(mensaje) {
    const toastEl = document.querySelector("#appToast");
    const toastBody = document.querySelector("#toastMessage");
    if (!toastEl || !toastBody) return;

    toastBody.textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

function vaciarCarrito() {
    guardarCarrito([]);
}

// ---- Renderizado (solo aplica si existe #carrito-container, es decir en carrito.html) ----

function crearFilaCarrito(item, producto) {
    const subtotal = producto.precio * item.cantidad;

    const fila = document.createElement("div");
    fila.className = "d-flex align-items-center gap-3 py-3 border-bottom flex-wrap";

    const urlProducto = `producto.html?id=${producto.id}`;

    fila.innerHTML = `
        <a href="${urlProducto}" title="Ver ${producto.nombre}">
            <img src="${producto.imagen}" alt="${producto.nombre}"
                 style="width:70px;height:70px;object-fit:cover;border-radius:10px;">
        </a>

        <div class="flex-grow-1">
            <span class="eyebrow">${producto.categoria}</span>
            <h3 class="h6 mb-0 mt-1">
                <a href="${urlProducto}" class="link-carrito">${producto.nombre}</a>
            </h3>
            <small class="text-secondary">Precio unitario: ${formatearPrecio(producto.precio)}</small>
        </div>

        <div class="text-center">
            <input type="number" min="1" max="${producto.stock}" value="${item.cantidad}"
                   class="form-control form-control-sm campo-cantidad" style="width:70px;"
                   data-id="${producto.id}" aria-label="Cantidad">
            <small class="text-secondary">Máx. ${producto.stock}</small>
        </div>

        <div style="min-width:100px;text-align:right;">
            <small class="text-secondary d-block">Subtotal</small>
            <strong>${formatearPrecio(subtotal)}</strong>
        </div>

        <button class="btn btn-outline-danger btn-sm btn-quitar" data-id="${producto.id}">
            Quitar
        </button>
    `;

    return fila;
}

function renderizarCarrito() {
    const contenedor = document.querySelector("#carrito-container");
    if (!contenedor) return;

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <section class="locked-module">
                <div class="locked-icon">🛒</div>
                <h1>Tu carrito está vacío</h1>
                <p class="lead">Todavía no agregaste productos.</p>
                <a href="catalogo.html" class="btn btn-primary mt-3">Ir al catálogo</a>
            </section>
        `;
        return;
    }

    contenedor.innerHTML = "";

    const listaEl = document.createElement("div");
    listaEl.className = "p-4 rounded-4 border bg-white shadow-sm";

    let subtotal = 0;

    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (!producto) return; // el producto ya no existe en el catálogo

        subtotal += producto.precio * item.cantidad;
        listaEl.appendChild(crearFilaCarrito(item, producto));
    });

    contenedor.appendChild(listaEl);

    const envio = subtotal >= UMBRAL_ENVIO_GRATIS ? 0 : COSTO_ENVIO_SIMULADO;
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
                Envío (simulado): ${envio === 0 ? "Gratis" : formatearPrecio(envio)}
            </p>
            <div class="d-flex align-items-center gap-3">
                <h2 class="fw-bold mb-0" style="color: var(--primary);">Total: ${formatearPrecio(total)}</h2>
                <button class="btn btn-primary" id="btnConfirmarCompra">Confirmar compra</button>
            </div>
        </div>
    `;
    contenedor.appendChild(resumenEl);

    conectarEventosCarrito();
}

function conectarEventosCarrito() {
    document.querySelectorAll(".campo-cantidad").forEach(input => {
        input.addEventListener("change", () => {
            cambiarCantidadCarrito(input.dataset.id, parseInt(input.value, 10) || 1);
            renderizarCarrito();
        });
    });

    document.querySelectorAll(".btn-quitar").forEach(boton => {
        boton.addEventListener("click", () => {
            quitarDelCarrito(boton.dataset.id);
            renderizarCarrito();
        });
    });

    document.querySelector("#btnVaciarCarrito")?.addEventListener("click", () => {
        vaciarCarrito();
        renderizarCarrito();
    });

    document.querySelector("#btnConfirmarCompra")?.addEventListener("click", () => {
        mostrarToast("Compra simulada: esta etapa todavía no procesa pagos reales.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
});