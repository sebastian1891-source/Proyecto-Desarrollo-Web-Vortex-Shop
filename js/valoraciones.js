// Valoraciones y comentarios de cada producto (guardados en LocalStorage)

import { mostrarAviso, escaparHtml } from "./mensajes.js";

const CLAVE_VALORACIONES = "vortexValoraciones";

function obtenerTodasLasValoraciones() {
    const datos = localStorage.getItem(CLAVE_VALORACIONES);
    return datos ? JSON.parse(datos) : {};
}

function obtenerValoraciones(idProducto) {
    const todas = obtenerTodasLasValoraciones();
    return todas[idProducto] || [];
}

function guardarValoracion(idProducto, estrellas, comentario) {
    const todas = obtenerTodasLasValoraciones();
    if (!todas[idProducto]) todas[idProducto] = [];

    todas[idProducto].push({
        estrellas,
        comentario: comentario.trim(),
        fecha: new Date().toLocaleDateString("es-UY")
    });

    localStorage.setItem(CLAVE_VALORACIONES, JSON.stringify(todas));
}

function calcularPromedio(valoraciones) {
    if (valoraciones.length === 0) return 0;
    const suma = valoraciones.reduce((acumulado, v) => acumulado + v.estrellas, 0);
    return suma / valoraciones.length;
}

// Devuelve una representación en texto de las estrellas, ej: "★★★★☆"
function crearEstrellasTexto(promedio) {
    const llenas = Math.round(promedio);
    return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

function crearHtmlListaComentarios(valoraciones) {
    if (valoraciones.length === 0) {
        return `<p class="text-secondary small">Todavía no hay valoraciones para este producto. ¡Sé el primero en dejar una!</p>`;
    }

    return valoraciones
        .slice()
        .reverse()
        .map(v => `
            <div class="border-bottom py-2">
                <div class="text-warning">${crearEstrellasTexto(v.estrellas)}</div>
                ${v.comentario ? `<p class="mb-1">${escaparHtml(v.comentario)}</p>` : ""}
                <small class="text-secondary">${v.fecha}</small>
            </div>
        `)
        .join("");
}

// Dibuja el bloque completo (promedio + lista de comentarios + formulario de estrellas)
// dentro del contenedor indicado, y conecta los eventos del formulario.
export function renderizarValoraciones(idProducto, idContenedor) {
    const contenedor = document.querySelector(`#${idContenedor}`);
    if (!contenedor) return;

    const valoraciones = obtenerValoraciones(idProducto);
    const promedio = calcularPromedio(valoraciones);

    contenedor.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span class="text-warning fs-4">${crearEstrellasTexto(promedio)}</span>
            <span class="text-secondary small">
                ${promedio > 0 ? promedio.toFixed(1) : "Sin valoraciones"}
                (${valoraciones.length} ${valoraciones.length === 1 ? "valoración" : "valoraciones"})
            </span>
        </div>

        <div class="mb-4">
            ${crearHtmlListaComentarios(valoraciones)}
        </div>

        <div class="locked-card">
            <h3 class="h6">Dejá tu valoración</h3>

            <div class="d-flex gap-1 fs-3 mb-2" id="selector-estrellas">
                ${[1, 2, 3, 4, 5]
                    .map(n => `<span class="estrella-seleccionable" data-valor="${n}" style="cursor:pointer;color:#cbd5e1;">★</span>`)
                    .join("")}
            </div>

            <textarea class="form-control mb-2" id="comentarioNuevo" rows="2"
                placeholder="Contanos tu experiencia (opcional)"></textarea>

            <button class="btn btn-primary btn-sm" id="btnEnviarValoracion">Enviar valoración</button>
        </div>
    `;

    let estrellasSeleccionadas = 0;
    const estrellasEls = contenedor.querySelectorAll(".estrella-seleccionable");

    const pintarEstrellas = (cantidad) => {
        estrellasEls.forEach(estrella => {
            const valor = Number(estrella.dataset.valor);
            estrella.style.color = valor <= cantidad ? "#f5b301" : "#cbd5e1";
        });
    };

    estrellasEls.forEach(estrella => {
        estrella.addEventListener("click", () => {
            estrellasSeleccionadas = Number(estrella.dataset.valor);
            pintarEstrellas(estrellasSeleccionadas);
        });

        estrella.addEventListener("mouseenter", () => pintarEstrellas(Number(estrella.dataset.valor)));
        estrella.addEventListener("mouseleave", () => pintarEstrellas(estrellasSeleccionadas));
    });

    contenedor.querySelector("#btnEnviarValoracion")?.addEventListener("click", () => {
        if (estrellasSeleccionadas === 0) {
            mostrarAviso("Elegí de 1 a 5 estrellas antes de enviar tu valoración.");
            return;
        }

        const comentario = contenedor.querySelector("#comentarioNuevo").value;
        guardarValoracion(idProducto, estrellasSeleccionadas, comentario);

        mostrarAviso("¡Gracias por tu valoración!");
        renderizarValoraciones(idProducto, idContenedor);
    });
}