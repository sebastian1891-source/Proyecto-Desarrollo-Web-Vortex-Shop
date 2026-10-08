const productos = [
    {
        id: "p1",
        nombre: "Auriculares inalámbricos Aiwa Awknc1090",
        descripcion: "Sonido envolvente y conexión inalámbrica.",
        categoria: "Accesorios",
        precio: 2490,
        stock: 10,
        imagen: "img/Auriculares1.png",
        caracteristicas: [
            "Bluetooth 5.0",
            "Batería de hasta 20 horas",
            "Micrófono integrado",
            "Controles táctiles"
        ]
    },
    {
        id: "p2",
        nombre: "Iphone 16 Pro Max",
        descripcion: "Potencia y rendimiento para todos los días.",
        categoria: "Celulares",
        precio: 59990,
        stock: 5,
        imagen: "img/Iphone16ProMax1.jpg",
        imagenes: [
            "img/Iphone16ProMax1.jpg",
            "img/ImagenPrincipal1.jpg"
        ],
        caracteristicas: [
            "Pantalla OLED de 6.9\"",
            "Chip A18 Pro",
            "Cámara triple de 48MP",
            "Resistencia al agua IP68"
        ]
    },
    {
        id: "p3",
        nombre: "Notebook Pro",
        descripcion: "Rendimiento y movilidad para tus proyectos.",
        categoria: "Computación",
        precio: 34990,
        stock: 8,
        imagen: "img/Laptop1.png",
        caracteristicas: [
            "Procesador Intel Core i7",
            "16GB de memoria RAM",
            "SSD de 512GB",
            "Pantalla 15.6\" Full HD"
        ]
    },
    {
        id: "p4",
        nombre: "Teclado Mecánico RGB MKMinibes Switch Outemu Blue",
        descripcion: "Precisión y comodidad para trabajar y jugar.",
        categoria: "Periféricos",
        precio: 3750,
        stock: 15,
        imagen: "img/TecladoMecanico1.png",
        caracteristicas: [
            "Switches Outemu Blue",
            "Retroiluminación RGB",
            "Conexión USB-C",
            "Teclas anti-ghosting"
        ]
    }
];


// Da formato de moneda al precio, ej: 2500 -> "$ 2.500"
function formatearPrecio(precio) {
    return "$ " + precio.toLocaleString("es-UY");
}

// Crea el elemento HTML (columna + tarjeta) para un producto
function crearTarjetaProducto(producto) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-xl-3";

    const hayStock = producto.stock > 0;
    const textoStock = hayStock
        ? `${producto.stock} unidades disponibles`
        : "Sin stock";
    const claseStock = hayStock ? "text-secondary" : "text-danger fw-semibold";

    columna.innerHTML = `
        <article class="product-card h-100">
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="p-3">
                <span class="eyebrow">${producto.categoria}</span>
                <h3 class="h5 mt-2">${producto.nombre}</h3>
                <p class="text-secondary small mb-1">${producto.descripcion}</p>
                <p class="small ${claseStock} mb-2">${textoStock}</p>
                <div class="d-flex justify-content-between align-items-center product-footer">
                    <strong>${formatearPrecio(producto.precio)}</strong>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm btn-agregar-carrito"
                            data-id="${producto.id}" ${hayStock ? "" : "disabled"}>
                            Agregar
                        </button>
                        <a href="producto.html?id=${producto.id}" class="btn btn-primary btn-sm">Ver producto</a>
                    </div>
                </div>
            </div>
        </article>
    `;

    return columna;
}

// Recorre el arreglo de productos y agrega cada tarjeta al contenedor
function renderizarCatalogo(listaProductos) {
    const contenedor = document.querySelector("#catalogo-container");
    if (!contenedor) return;

    actualizarContadorResultados(listaProductos.length);

    contenedor.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `<p class="text-secondary">No se encontraron productos que coincidan con tu búsqueda.</p>`;
        return;
    }

    listaProductos.forEach(producto => {
        contenedor.appendChild(crearTarjetaProducto(producto));
    });
}

// Muestra cuántos productos coinciden con la búsqueda/filtro actual
function actualizarContadorResultados(cantidad) {
    const contador = document.querySelector("#resultado-contador");
    if (!contador) return;

    contador.textContent = cantidad === 1
        ? "1 producto encontrado"
        : `${cantidad} productos encontrados`;
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarCatalogo(productos);
    inicializarFiltroCategorias();
    inicializarEventosDeFiltro();
    inicializarEventosCatalogo();
});

// Delega el click en los botones "Agregar" de las tarjetas: como el contenedor
// se vuelve a dibujar en cada búsqueda/filtro, el listener se pone una sola vez
// sobre el contenedor (que no cambia) en vez de sobre cada botón.
function inicializarEventosCatalogo() {
    const contenedor = document.querySelector("#catalogo-container");
    if (!contenedor) return;

    contenedor.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".btn-agregar-carrito");
        if (!boton) return;

        agregarYNotificar(boton.dataset.id, 1);
    });
}

// Genera dinámicamente las opciones del <select> a partir de las
// categorías presentes en el arreglo de productos (sin repetidas)
function inicializarFiltroCategorias() {
    const selectCategoria = document.querySelector("#filtroCategoria");
    if (!selectCategoria) return;

    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))].sort();

    categoriasUnicas.forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

// Filtra el arreglo de productos según el texto buscado y la categoría elegida.
// Usa .filter() para quedarse solo con los productos que cumplen ambas condiciones.
function filtrarProductos(texto, categoria) {
    const textoBuscado = texto.trim().toLowerCase();

    return productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(textoBuscado);
        const coincideCategoria = categoria === "" || producto.categoria === categoria;

        return coincideNombre && coincideCategoria;
    });
}

// Lee los valores actuales del buscador, el select y el orden elegido,
// filtra, ordena y vuelve a renderizar
function aplicarFiltros() {
    const buscador = document.querySelector("#buscador");
    const selectCategoria = document.querySelector("#filtroCategoria");
    const selectOrden = document.querySelector("#ordenarPor");

    const texto = buscador ? buscador.value : "";
    const categoria = selectCategoria ? selectCategoria.value : "";
    const orden = selectOrden ? selectOrden.value : "";

    const filtrados = filtrarProductos(texto, categoria);
    const ordenados = ordenarProductos(filtrados, orden);

    renderizarCatalogo(ordenados);
}

// Ordena una copia del arreglo según el criterio elegido, sin modificar el original
function ordenarProductos(lista, criterio) {
    const copia = [...lista];

    switch (criterio) {
        case "nombre-asc":
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case "nombre-desc":
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        case "precio-asc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "precio-desc":
            return copia.sort((a, b) => b.precio - a.precio);
        default:
            return copia;
    }
}

// Conecta los eventos del buscador, el select de categoría, el de orden
// y el botón "Limpiar filtros"
function inicializarEventosDeFiltro() {
    const buscador = document.querySelector("#buscador");
    const selectCategoria = document.querySelector("#filtroCategoria");
    const selectOrden = document.querySelector("#ordenarPor");
    const btnLimpiar = document.querySelector("#btnLimpiarFiltros");

    // "input" para que la búsqueda se actualice mientras se escribe, sin recargar la página
    buscador?.addEventListener("input", aplicarFiltros);

    selectCategoria?.addEventListener("change", aplicarFiltros);
    selectOrden?.addEventListener("change", aplicarFiltros);

    btnLimpiar?.addEventListener("click", () => {
        if (buscador) buscador.value = "";
        if (selectCategoria) selectCategoria.value = "";
        if (selectOrden) selectOrden.value = "";
        renderizarCatalogo(productos);
    });
}