// =========================================================
// PANEL ADMINISTRATIVO (admin.html) · Sprint 4
// ---------------------------------------------------------
// Página protegida: solo la ven usuarios con rol "administrador".
// Un cliente que escriba admin.html en la barra de direcciones es
// redirigido al inicio con un aviso (ver exigirAdministrador en roles.js).
//
// Gestión básica de productos:
//   - Lista de productos obtenida desde Firestore (nombre, categoría,
//     precio, stock y disponibilidad).
//   - Formulario para crear un producto nuevo.
//   - Botón "Editar" que carga los datos del producto en el mismo
//     formulario para modificarlos.
//   - Validación de nombre, categoría, precio y stock antes de guardar.
//   - Mensaje de éxito o error y botón deshabilitado mientras se guarda.
// =========================================================

import { exigirAdministrador } from "./firebase/roles.js";
import {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    mensajeErrorProductos,
    CATEGORIAS,
    IMAGEN_POR_DEFECTO
} from "./firebase/productos.js";
import { escaparHtml, mostrarAviso } from "./mensajes.js";
import { formatearPrecio } from "./productosUI.js";
import {
    marcarCampo,
    mostrarAlertaFormulario,
    ocultarAlertaFormulario,
    setBotonCargando
} from "./validaciones.js";

const contenedor = document.querySelector("#admin-container");

const LIMITES = {
    nombreMin: 3,
    nombreMax: 100,
    precioMax: 10000000,
    stockMax: 9999,
    descripcionMax: 300,
    caracteristicasMax: 10
};

// Estado del panel
let productos = [];          // lista leída de Firestore
let productoEnEdicion = null; // null = modo "nuevo producto"
let guardando = false;        // evita envíos dobles

// ---------------------------------------------------------
// Estructura de la página
// ---------------------------------------------------------
function dibujarPanel(usuario) {
    const nombre = usuario.displayName?.split(" ")[0] ?? usuario.email;

    contenedor.innerHTML = `
        <div class="section-heading mb-4">
            <div>
                <span class="eyebrow">Administración</span>
                <h1 class="fw-bold mb-1">Gestión de productos</h1>
                <p class="text-secondary mb-0">Hola, ${escaparHtml(nombre)}. Creá productos nuevos o editá los existentes; los cambios se ven al instante en el catálogo.</p>
            </div>
            <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-outline-primary btn-sm" href="catalogo.html" target="_blank" rel="noopener">Ver catálogo</a>
                <a class="btn btn-outline-secondary btn-sm" href="carga-inicial.html">Carga inicial</a>
            </div>
        </div>

        <div class="row g-4 align-items-start">
            <!-- FORMULARIO -->
            <div class="col-lg-5">
                <div class="auth-card admin-form-card" id="tarjetaFormulario">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h5 fw-bold mb-0" id="tituloFormulario">Nuevo producto</h2>
                        <span class="badge rounded-pill text-bg-primary" id="etiquetaModo">Crear</span>
                    </div>

                    <div id="alertaFormulario" class="alert d-none" role="alert"></div>

                    <form id="formProducto" novalidate>
                        <fieldset id="camposFormulario">
                            <div class="mb-3">
                                <label class="form-label" for="prodNombre">Nombre *</label>
                                <input type="text" class="form-control" id="prodNombre" maxlength="${LIMITES.nombreMax}" placeholder="Ej: Mouse inalámbrico Logitech M185">
                                <div class="invalid-feedback"></div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label" for="prodCategoria">Categoría *</label>
                                <select class="form-select" id="prodCategoria">
                                    <option value="">Elegí una categoría</option>
                                    ${CATEGORIAS.map(c => `<option value="${escaparHtml(c)}">${escaparHtml(c)}</option>`).join("")}
                                </select>
                                <div class="invalid-feedback"></div>
                            </div>

                            <div class="row g-3">
                                <div class="col-sm-6">
                                    <div class="mb-3">
                                        <label class="form-label" for="prodPrecio">Precio ($) *</label>
                                        <input type="number" class="form-control" id="prodPrecio" min="1" step="1" inputmode="numeric" placeholder="Ej: 1490">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="mb-3">
                                        <label class="form-label" for="prodStock">Stock *</label>
                                        <input type="number" class="form-control" id="prodStock" min="0" step="1" inputmode="numeric" placeholder="Ej: 10">
                                        <div class="invalid-feedback"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" role="switch" id="prodDisponible" checked>
                                <label class="form-check-label" for="prodDisponible">Disponible para la venta</label>
                            </div>

                            <div class="mb-3">
                                <label class="form-label" for="prodDescripcion">Descripción <span class="text-secondary small">(opcional)</span></label>
                                <textarea class="form-control" id="prodDescripcion" rows="2" maxlength="${LIMITES.descripcionMax}" placeholder="Frase corta que se muestra en la tarjeta del catálogo"></textarea>
                                <div class="invalid-feedback"></div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label" for="prodImagen">Imagen <span class="text-secondary small">(opcional)</span></label>
                                <input type="text" class="form-control" id="prodImagen" placeholder="img/MiProducto.jpg o https://...">
                                <div class="form-text">Ruta de un archivo de la carpeta <code>img/</code> o una dirección web. Si se deja vacío se usa una imagen genérica.</div>
                                <div class="invalid-feedback"></div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label" for="prodCaracteristicas">Características <span class="text-secondary small">(opcional, una por línea)</span></label>
                                <textarea class="form-control" id="prodCaracteristicas" rows="3" placeholder="Bluetooth 5.0&#10;Batería de 20 horas"></textarea>
                                <div class="invalid-feedback"></div>
                            </div>
                        </fieldset>

                        <div class="d-flex gap-2 flex-wrap">
                            <button type="submit" class="btn btn-primary" id="btnGuardar">Crear producto</button>
                            <button type="button" class="btn btn-outline-secondary d-none" id="btnCancelar">Cancelar edición</button>
                        </div>
                        <p class="text-secondary small mt-2 mb-0">* Campos obligatorios</p>
                    </form>
                </div>
            </div>

            <!-- LISTA -->
            <div class="col-lg-7">
                <div class="auth-card">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h2 class="h5 fw-bold mb-0">Productos <span class="text-secondary fw-normal" id="contadorProductos"></span></h2>
                        <button type="button" class="btn btn-outline-primary btn-sm" id="btnRecargar">Actualizar lista</button>
                    </div>
                    <div id="listaProductos"></div>
                </div>
            </div>
        </div>
    `;

    conectarFormulario();
    contenedor.querySelector("#btnRecargar").addEventListener("click", cargarProductos);
}

// ---------------------------------------------------------
// Lista de productos
// ---------------------------------------------------------
function estadoDisponibilidad(producto) {
    if (!producto.disponible) return `<span class="badge text-bg-secondary">No disponible</span>`;
    if (producto.stock === 0) return `<span class="badge text-bg-warning">Sin stock</span>`;
    return `<span class="badge text-bg-success">Disponible</span>`;
}

function dibujarLista() {
    const lista = contenedor.querySelector("#listaProductos");
    contenedor.querySelector("#contadorProductos").textContent = `(${productos.length})`;

    if (productos.length === 0) {
        lista.innerHTML = `
            <p class="text-secondary mb-0">Todavía no hay productos en Firestore. Creá el primero con el formulario
            o usá la <a href="carga-inicial.html">carga inicial</a>.</p>
        `;
        return;
    }

    lista.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 tabla-admin">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th class="text-end">Precio</th>
                        <th class="text-end">Stock</th>
                        <th>Estado</th>
                        <th class="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos.map(p => `
                        <tr data-id="${escaparHtml(p.id)}" class="${productoEnEdicion?.id === p.id ? "fila-editando" : ""}">
                            <td class="fw-semibold">${escaparHtml(p.nombre)}</td>
                            <td>${escaparHtml(p.categoria)}</td>
                            <td class="text-end text-nowrap">${formatearPrecio(p.precio)}</td>
                            <td class="text-end">${p.stock}</td>
                            <td>${estadoDisponibilidad(p)}</td>
                            <td class="text-end text-nowrap">
                                <a class="btn btn-link btn-sm px-1" href="producto.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">Ver</a>
                                <button type="button" class="btn btn-outline-primary btn-sm btn-editar" data-id="${escaparHtml(p.id)}" ${guardando ? "disabled" : ""}>Editar</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    lista.querySelectorAll(".btn-editar").forEach(boton =>
        boton.addEventListener("click", () => empezarEdicion(boton.dataset.id))
    );
}

async function cargarProductos() {
    const lista = contenedor.querySelector("#listaProductos");
    const botonRecargar = contenedor.querySelector("#btnRecargar");

    botonRecargar.disabled = true;
    lista.innerHTML = `
        <div class="text-center py-4 text-secondary">
            <div class="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
            Cargando productos desde Firestore...
        </div>
    `;

    try {
        productos = (await obtenerProductos()).sort((a, b) =>
            a.categoria.localeCompare(b.categoria, "es") || a.nombre.localeCompare(b.nombre, "es")
        );
        dibujarLista();
    } catch (error) {
        console.error(error);
        lista.innerHTML = `
            <div class="alert alert-danger mb-0">
                ${escaparHtml(mensajeErrorProductos(error))}
                <button type="button" class="btn btn-sm btn-outline-danger ms-2" id="btnReintentar">Reintentar</button>
            </div>
        `;
        lista.querySelector("#btnReintentar").addEventListener("click", cargarProductos);
    } finally {
        botonRecargar.disabled = false;
    }
}

// ---------------------------------------------------------
// Formulario: campos y validaciones
// ---------------------------------------------------------
const campo = id => contenedor.querySelector(`#${id}`);

function obtenerCampos() {
    return {
        nombre: campo("prodNombre"),
        categoria: campo("prodCategoria"),
        precio: campo("prodPrecio"),
        stock: campo("prodStock"),
        disponible: campo("prodDisponible"),
        descripcion: campo("prodDescripcion"),
        imagen: campo("prodImagen"),
        caracteristicas: campo("prodCaracteristicas")
    };
}

function separarCaracteristicas(texto) {
    return texto.split("\n").map(l => l.trim()).filter(Boolean);
}

// Cada validador devuelve "" si el valor es correcto, o el mensaje de error
const validadores = {
    nombre(valor) {
        const texto = valor.trim();
        if (texto === "") return "Ingresá el nombre del producto.";
        if (texto.length < LIMITES.nombreMin) return `El nombre debe tener al menos ${LIMITES.nombreMin} caracteres.`;
        if (texto.length > LIMITES.nombreMax) return `El nombre no puede superar los ${LIMITES.nombreMax} caracteres.`;

        const repetido = productos.some(p =>
            p.id !== productoEnEdicion?.id && p.nombre.trim().toLowerCase() === texto.toLowerCase()
        );
        if (repetido) return "Ya existe un producto con ese nombre.";
        return "";
    },

    categoria(valor) {
        return valor === "" ? "Elegí una categoría." : "";
    },

    precio(valor) {
        if (valor.trim() === "") return "Ingresá el precio.";
        const numero = Number(valor);
        if (!Number.isFinite(numero)) return "El precio debe ser un número.";
        if (!Number.isInteger(numero)) return "Ingresá el precio sin decimales.";
        if (numero <= 0) return "El precio debe ser mayor a 0.";
        if (numero > LIMITES.precioMax) return "El precio es demasiado alto. Revisá el valor.";
        return "";
    },

    stock(valor) {
        if (valor.trim() === "") return "Ingresá el stock (puede ser 0).";
        const numero = Number(valor);
        if (!Number.isInteger(numero)) return "El stock debe ser un número entero.";
        if (numero < 0) return "El stock no puede ser negativo.";
        if (numero > LIMITES.stockMax) return `El stock no puede superar las ${LIMITES.stockMax} unidades.`;
        return "";
    },

    descripcion(valor) {
        return valor.trim().length > LIMITES.descripcionMax
            ? `La descripción no puede superar los ${LIMITES.descripcionMax} caracteres.` : "";
    },

    imagen(valor) {
        const texto = valor.trim();
        if (texto === "") return "";
        if (/^img\/[\w .()-]+\.(png|jpe?g|webp|gif|svg)$/i.test(texto)) return "";
        if (/^https:\/\/\S+$/i.test(texto)) return "";
        return "Usá una ruta como img/MiProducto.jpg o una dirección que empiece con https://";
    },

    caracteristicas(valor) {
        return separarCaracteristicas(valor).length > LIMITES.caracteristicasMax
            ? `Podés cargar hasta ${LIMITES.caracteristicasMax} características.` : "";
    }
};

function validarCampo(nombre) {
    const input = obtenerCampos()[nombre];
    return marcarCampo(input, validadores[nombre](input.value));
}

function validarFormulario() {
    return Object.keys(validadores).map(validarCampo).every(Boolean);
}

function limpiarMarcas() {
    contenedor.querySelectorAll("#formProducto .is-invalid, #formProducto .is-valid")
        .forEach(el => el.classList.remove("is-invalid", "is-valid"));
}

function leerFormulario() {
    const c = obtenerCampos();
    return {
        nombre: c.nombre.value.trim(),
        categoria: c.categoria.value,
        precio: Number(c.precio.value),
        stock: Number(c.stock.value),
        disponible: c.disponible.checked,
        descripcion: c.descripcion.value.trim(),
        imagen: c.imagen.value.trim(),
        caracteristicas: separarCaracteristicas(c.caracteristicas.value)
    };
}

// ---------------------------------------------------------
// Modos del formulario: crear / editar
// ---------------------------------------------------------
function asegurarOpcionCategoria(categoria) {
    const select = obtenerCampos().categoria;
    if (categoria && ![...select.options].some(o => o.value === categoria)) {
        select.add(new Option(categoria, categoria));
    }
}

function modoCrear() {
    productoEnEdicion = null;
    contenedor.querySelector("#formProducto").reset();
    limpiarMarcas();
    campo("tituloFormulario").textContent = "Nuevo producto";
    campo("etiquetaModo").textContent = "Crear";
    campo("etiquetaModo").className = "badge rounded-pill text-bg-primary";
    campo("btnGuardar").textContent = "Crear producto";
    campo("btnCancelar").classList.add("d-none");
    contenedor.querySelectorAll(".fila-editando").forEach(f => f.classList.remove("fila-editando"));
}

function empezarEdicion(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto || guardando) return;

    productoEnEdicion = producto;
    ocultarAlertaFormulario();
    limpiarMarcas();

    const c = obtenerCampos();
    asegurarOpcionCategoria(producto.categoria);
    c.nombre.value = producto.nombre;
    c.categoria.value = producto.categoria;
    c.precio.value = producto.precio;
    c.stock.value = producto.stock;
    c.disponible.checked = producto.disponible;
    c.descripcion.value = producto.descripcion;
    c.imagen.value = producto.imagen === IMAGEN_POR_DEFECTO ? "" : producto.imagen;
    c.caracteristicas.value = producto.caracteristicas.join("\n");

    campo("tituloFormulario").textContent = "Editar producto";
    campo("etiquetaModo").textContent = "Editando";
    campo("etiquetaModo").className = "badge rounded-pill text-bg-warning";
    campo("btnGuardar").textContent = "Guardar cambios";
    campo("btnCancelar").classList.remove("d-none");

    contenedor.querySelectorAll("tr[data-id]").forEach(fila =>
        fila.classList.toggle("fila-editando", fila.dataset.id === producto.id)
    );

    campo("tarjetaFormulario").scrollIntoView({ behavior: "smooth", block: "start" });
    c.nombre.focus({ preventScroll: true });
}

// Bloquea o desbloquea el formulario y los botones mientras se guarda
function bloquearPanel(bloquear, textoBoton) {
    guardando = bloquear;
    campo("camposFormulario").disabled = bloquear;
    campo("btnCancelar").disabled = bloquear;
    campo("btnRecargar").disabled = bloquear;
    contenedor.querySelectorAll(".btn-editar").forEach(b => (b.disabled = bloquear));
    setBotonCargando(campo("btnGuardar"), bloquear, textoBoton);
}

function mostrarExito(mensaje, idProducto) {
    const alerta = campo("alertaFormulario");
    alerta.className = "alert alert-success";
    alerta.innerHTML = `${escaparHtml(mensaje)}
        <a href="producto.html?id=${encodeURIComponent(idProducto)}" target="_blank" rel="noopener" class="alert-link">Ver en el catálogo</a>`;
}

function conectarFormulario() {
    const formulario = contenedor.querySelector("#formProducto");
    const campos = obtenerCampos();

    // Validación en vivo: al salir del campo y al corregir uno marcado en rojo
    Object.keys(validadores).forEach(nombre => {
        const input = campos[nombre];
        input.addEventListener("blur", evento => {
            if (evento.relatedTarget === campo("btnGuardar")) return;
            if (input.value !== "") validarCampo(nombre);
        });
        input.addEventListener("input", () => {
            if (input.classList.contains("is-invalid")) validarCampo(nombre);
        });
        input.addEventListener("change", () => {
            if (input.tagName === "SELECT") validarCampo(nombre);
        });
    });

    campo("btnCancelar").addEventListener("click", () => {
        modoCrear();
        ocultarAlertaFormulario();
    });

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        if (guardando) return;
        ocultarAlertaFormulario();

        if (!validarFormulario()) {
            mostrarAlertaFormulario("Revisá los campos marcados en rojo.");
            formulario.querySelector(".is-invalid")?.focus();
            return;
        }

        const datos = leerFormulario();
        const editando = productoEnEdicion;

        bloquearPanel(true, editando ? "Guardando cambios..." : "Creando producto...");

        try {
            let idProducto;
            if (editando) {
                await actualizarProducto(editando.id, datos, editando.imagenes);
                idProducto = editando.id;
            } else {
                idProducto = await crearProducto(datos);
            }

            bloquearPanel(false);
            modoCrear();

            const mensaje = editando
                ? `Se guardaron los cambios de "${datos.nombre}".`
                : `Se creó el producto "${datos.nombre}".`;
            mostrarExito(mensaje, idProducto);
            mostrarAviso(mensaje);

            // Se vuelve a leer Firestore para mostrar los datos realmente guardados
            await cargarProductos();
            contenedor.querySelector(`tr[data-id="${CSS.escape(idProducto)}"]`)?.classList.add("fila-guardada");
        } catch (error) {
            console.error(error);
            bloquearPanel(false);

            const mensaje = error?.code === "permission-denied" || error?.code === "not-found"
                ? mensajeErrorProductos(error)
                : "No se pudo guardar el producto. Revisá tu conexión e intentá de nuevo.";
            mostrarAlertaFormulario(mensaje);
        }
    });
}

// ---------------------------------------------------------
// Inicio
// ---------------------------------------------------------
const usuario = await exigirAdministrador("admin.html");
if (usuario) {
    dibujarPanel(usuario);
    await cargarProductos();
}
