function crearCarruselHtml(producto) {
    const imagenes = (producto.imagenes && producto.imagenes.length)
        ? producto.imagenes
        : [producto.imagen];

    const indicadores = imagenes.length > 1
        ? `<div class="carousel-indicators">
            ${imagenes.map((_, i) => `
                <button type="button" data-bs-target="#carruselProducto" data-bs-slide-to="${i}"
                    class="${i === 0 ? "active" : ""}" aria-current="${i === 0 ? "true" : "false"}"></button>
            `).join("")}
           </div>`
        : "";

    const controles = imagenes.length > 1
        ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#carruselProducto" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carruselProducto" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        `
        : "";

    return `
        <div class="hero-card">
            <div class="hero-card-header">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <div id="carruselProducto" class="carousel slide">
                <div class="carousel-inner">
                    ${imagenes.map((img, i) => `
                        <div class="carousel-item ${i === 0 ? "active" : ""}">
                            <img src="${img}" class="d-block w-100" alt="${producto.nombre}">
                        </div>
                    `).join("")}
                </div>
                ${indicadores}
                ${controles}
            </div>
        </div>
    `;
}

// Lista de características técnicas (solo se muestra si el producto las tiene cargadas)
function crearCaracteristicasHtml(producto) {
    if (!producto.caracteristicas || producto.caracteristicas.length === 0) return "";

    return `
        <div class="mt-4">
            <h3 class="h6">Características</h3>
            <ul class="mb-0">
                ${producto.caracteristicas.map(c => `<li>${c}</li>`).join("")}
            </ul>
        </div>
    `;
}

// Arma el HTML de la ficha completa: carrusel + info + espacio para
// valoraciones y productos relacionados (esos dos se rellenan después,
// una vez que este HTML ya está insertado en la página).
function crearFichaProducto(producto) {
    const hayStock = producto.stock > 0;
    const textoStock = hayStock
        ? `${producto.stock} unidades disponibles`
        : "Sin stock por el momento";
    const claseStock = hayStock ? "text-secondary" : "text-danger fw-semibold";

    const hayRelacionados = productos.some(p => p.categoria === producto.categoria && p.id !== producto.id);

    return `
        <div class="row g-5 align-items-start">
            <div class="col-lg-6">
                ${crearCarruselHtml(producto)}
            </div>

            <div class="col-lg-6">
                <span class="eyebrow">${producto.categoria}</span>
                <h1 class="fw-bold mt-2">${producto.nombre}</h1>
                <p class="lead">${producto.descripcion}</p>
                <p class="${claseStock} mb-3">${textoStock}</p>
                <h2 class="fw-bold mb-3" style="color: var(--primary);">${formatearPrecio(producto.precio)}</h2>

                <button class="btn btn-primary btn-lg" id="btnAgregarCarrito" ${hayStock ? "" : "disabled"}>
                    Agregar al carrito
                </button>

                <div class="mt-3">
                    <a href="catalogo.html" class="btn btn-outline-dark btn-sm">Volver al catálogo</a>
                </div>

                ${crearCaracteristicasHtml(producto)}
            </div>
        </div>

        <section class="mt-5">
            <div class="section-heading mb-3">
                <div>
                    <span class="eyebrow">Opiniones</span>
                    <h2 class="h4 fw-bold mb-0">Valoraciones del producto</h2>
                </div>
            </div>
            <div id="valoraciones-container"></div>
        </section>

        ${hayRelacionados ? `
        <section class="mt-5">
            <div class="section-heading mb-3">
                <div>
                    <span class="eyebrow">También te puede interesar</span>
                    <h2 class="h4 fw-bold mb-0">Productos relacionados</h2>
                </div>
            </div>
            <div class="row g-4" id="relacionados-container"></div>
        </section>
        ` : ""}
    `;
}

// Arma el HTML que se muestra cuando no hay un producto válido
function crearMensajeProductoNoEncontrado() {
    return `
        <section class="locked-module">
            <div class="locked-icon">🔍</div>
            <h1>Producto no encontrado</h1>
            <p class="lead">Elegí un producto desde el catálogo para ver su ficha completa.</p>
            <a href="catalogo.html" class="btn btn-primary mt-3">Ir al catálogo</a>
        </section>
    `;
}

// Inserta las tarjetas de productos de la misma categoría (excluyendo el actual)
// y conecta su propio botón "Agregar" mediante delegación de eventos.
function renderizarRelacionados(producto) {
    const contenedorRelacionados = document.querySelector("#relacionados-container");
    if (!contenedorRelacionados) return;

    const relacionados = productos.filter(p => p.categoria === producto.categoria && p.id !== producto.id);
    relacionados.forEach(p => contenedorRelacionados.appendChild(crearTarjetaProducto(p)));

    contenedorRelacionados.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".btn-agregar-carrito");
        if (!boton) return;

        const idBoton = boton.dataset.id;
        const productoBoton = productos.find(p => p.id === idBoton);
        if (!productoBoton) return;

        agregarAlCarrito(idBoton, 1);
        mostrarToast(`"${productoBoton.nombre}" se agregó al carrito.`);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector("#detalle-producto");
    if (!contenedor) return;

    const idProducto = new URLSearchParams(window.location.search).get("id");
    const producto = productos.find(p => p.id === idProducto);

    if (!producto) {
        contenedor.innerHTML = crearMensajeProductoNoEncontrado();
        return;
    }

    contenedor.innerHTML = crearFichaProducto(producto);

    document.querySelector("#btnAgregarCarrito")?.addEventListener("click", () => {
        agregarAlCarrito(producto.id, 1);
        mostrarToast(`"${producto.nombre}" se agregó al carrito.`);
    });

    renderizarValoraciones(producto.id, "valoraciones-container");
    renderizarRelacionados(producto);
});