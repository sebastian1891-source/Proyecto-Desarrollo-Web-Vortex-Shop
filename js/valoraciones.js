// =========================================================
// VALORACIONES Y COMENTARIOS (ficha de producto)
// ---------------------------------------------------------
// Se leen y guardan en Firestore (js/firebase/valoraciones.js).
// Cualquiera puede leerlas; para opinar hay que iniciar sesión.
// =========================================================

import { observarSesion } from "./firebase/auth.js";
import {
    obtenerValoraciones,
    guardarValoracion,
    validarValoracion,
    LARGO_MAXIMO_COMENTARIO
} from "./firebase/valoraciones.js";
import { mostrarAviso, escaparHtml } from "./mensajes.js";

// Las valoraciones del Sprint 2 estaban en LocalStorage y eran anónimas,
// por eso no se pueden asociar a un usuario: se descartan.
localStorage.removeItem("vortexValoraciones");

function calcularPromedio(valoraciones) {
    if (valoraciones.length === 0) return 0;
    const suma = valoraciones.reduce((acumulado, v) => acumulado + v.estrellas, 0);
    return suma / valoraciones.length;
}

// Representación en texto de las estrellas, ej: "★★★★☆"
function crearEstrellasTexto(promedio) {
    const llenas = Math.round(promedio);
    return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

function formatearFecha(fecha) {
    return fecha?.toDate ? fecha.toDate().toLocaleDateString("es-UY") : "";
}

function crearHtmlLista(valoraciones, uidActual) {
    if (valoraciones.length === 0) {
        return `<p class="text-secondary small">Todavía no hay valoraciones para este producto. ¡Sé el primero en dejar una!</p>`;
    }

    return valoraciones.map(v => `
        <div class="valoracion-item">
            <div class="d-flex justify-content-between flex-wrap gap-2">
                <span class="valoracion-autor">
                    ${escaparHtml(v.autor)}${v.uid === uidActual ? ` <span class="badge text-bg-light border">Tu opinión</span>` : ""}
                </span>
                <small class="text-secondary">${formatearFecha(v.fecha)}</small>
            </div>
            <div class="text-warning" aria-label="${v.estrellas} de 5 estrellas">${crearEstrellasTexto(v.estrellas)}</div>
            <p class="mb-0">${escaparHtml(v.comentario)}</p>
        </div>
    `).join("");
}

function crearHtmlFormulario(miValoracion) {
    return `
        <div class="locked-card">
            <h3 class="h6">${miValoracion ? "Editar tu valoración" : "Dejá tu valoración"}</h3>

            <div class="d-flex gap-1 mb-2" id="selector-estrellas" role="radiogroup" aria-label="Puntuación">
                ${[1, 2, 3, 4, 5].map(n => `
                    <button type="button" class="estrella-seleccionable" data-valor="${n}"
                        role="radio" aria-label="${n} ${n === 1 ? "estrella" : "estrellas"}">★</button>
                `).join("")}
            </div>

            <textarea class="form-control mb-1" id="comentarioNuevo" rows="3" maxlength="${LARGO_MAXIMO_COMENTARIO}"
                placeholder="Contanos tu experiencia con el producto">${escaparHtml(miValoracion?.comentario ?? "")}</textarea>
            <div class="d-flex justify-content-between mb-2">
                <small class="text-danger" id="errorValoracion"></small>
                <small class="text-secondary"><span id="contadorComentario">0</span>/${LARGO_MAXIMO_COMENTARIO}</small>
            </div>

            <button class="btn btn-primary btn-sm" id="btnEnviarValoracion">
                ${miValoracion ? "Actualizar valoración" : "Enviar valoración"}
            </button>
        </div>
    `;
}

function crearHtmlInvitacion(idProducto) {
    const destino = encodeURIComponent(`producto.html?id=${idProducto}`);
    return `
        <div class="locked-card">
            <h3 class="h6">¿Compraste este producto?</h3>
            <p class="mb-0">
                <a href="login.html?redirect=${destino}">Iniciá sesión</a> para dejar tu valoración.
            </p>
        </div>
    `;
}

// Conecta las estrellas, el contador de caracteres y el botón de envío
function conectarFormulario(contenedor, usuario, idProducto, miValoracion, alGuardar) {
    let estrellasSeleccionadas = miValoracion?.estrellas ?? 0;

    const estrellas = contenedor.querySelectorAll(".estrella-seleccionable");
    const textarea = contenedor.querySelector("#comentarioNuevo");
    const contador = contenedor.querySelector("#contadorComentario");
    const error = contenedor.querySelector("#errorValoracion");
    const boton = contenedor.querySelector("#btnEnviarValoracion");

    const pintar = cantidad => estrellas.forEach(e => {
        const activa = Number(e.dataset.valor) <= cantidad;
        e.classList.toggle("activa", activa);
        e.setAttribute("aria-checked", String(Number(e.dataset.valor) === estrellasSeleccionadas));
    });

    estrellas.forEach(estrella => {
        estrella.addEventListener("click", () => {
            estrellasSeleccionadas = Number(estrella.dataset.valor);
            error.textContent = "";
            pintar(estrellasSeleccionadas);
        });
        estrella.addEventListener("mouseenter", () => pintar(Number(estrella.dataset.valor)));
        estrella.addEventListener("mouseleave", () => pintar(estrellasSeleccionadas));
    });

    const actualizarContador = () => { contador.textContent = textarea.value.trim().length; };
    textarea.addEventListener("input", () => { actualizarContador(); error.textContent = ""; });

    pintar(estrellasSeleccionadas);
    actualizarContador();

    boton.addEventListener("click", async () => {
        const mensajeError = validarValoracion(estrellasSeleccionadas, textarea.value);
        if (mensajeError) {
            error.textContent = mensajeError;
            return;
        }

        boton.disabled = true;
        boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Guardando...`;

        try {
            await guardarValoracion(usuario, idProducto, estrellasSeleccionadas, textarea.value);
            mostrarAviso(miValoracion ? "Tu valoración se actualizó." : "¡Gracias por tu valoración!");
            alGuardar();
        } catch (e) {
            console.error(e);
            error.textContent = e.code === "permission-denied"
                ? "No tenés permiso para guardar esta valoración. Iniciá sesión de nuevo."
                : "No se pudo guardar tu valoración. Intentá de nuevo.";
            boton.disabled = false;
            boton.textContent = miValoracion ? "Actualizar valoración" : "Enviar valoración";
        }
    });
}

async function dibujar(contenedor, idProducto, usuario) {
    contenedor.innerHTML = `
        <div class="text-secondary py-2">
            <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando valoraciones...
        </div>
    `;

    let valoraciones;
    try {
        valoraciones = await obtenerValoraciones(idProducto);
    } catch (e) {
        console.error(e);
        contenedor.innerHTML = `
            <p class="text-danger mb-2">No se pudieron cargar las valoraciones.</p>
            <button class="btn btn-outline-primary btn-sm" id="btnReintentarValoraciones">Reintentar</button>
        `;
        contenedor.querySelector("#btnReintentarValoraciones")
            .addEventListener("click", () => dibujar(contenedor, idProducto, usuario));
        return;
    }

    const promedio = calcularPromedio(valoraciones);
    const miValoracion = usuario ? valoraciones.find(v => v.uid === usuario.uid) : null;

    contenedor.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span class="text-warning fs-4">${crearEstrellasTexto(promedio)}</span>
            <span class="text-secondary small">
                ${promedio > 0 ? promedio.toFixed(1) : "Sin valoraciones"}
                (${valoraciones.length} ${valoraciones.length === 1 ? "valoración" : "valoraciones"})
            </span>
        </div>

        <div class="mb-4">${crearHtmlLista(valoraciones, usuario?.uid)}</div>

        ${usuario ? crearHtmlFormulario(miValoracion) : crearHtmlInvitacion(idProducto)}
    `;

    if (usuario) {
        conectarFormulario(contenedor, usuario, idProducto, miValoracion,
            () => dibujar(contenedor, idProducto, usuario));
    }
}

// Dibuja el bloque de valoraciones y lo actualiza si el usuario inicia o cierra sesión
export function renderizarValoraciones(idProducto, idContenedor) {
    const contenedor = document.querySelector(`#${idContenedor}`);
    if (!contenedor) return;

    observarSesion(usuario => dibujar(contenedor, idProducto, usuario));
}
