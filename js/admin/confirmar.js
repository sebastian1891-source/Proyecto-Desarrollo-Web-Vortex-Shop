// =========================================================
// PANEL · VENTANA DE CONFIRMACIÓN
// ---------------------------------------------------------
// Modal de Bootstrap reutilizable para acciones que no se pueden
// deshacer (eliminar un producto, borrar una opinión, cancelar un pedido).
// Uso:  if (await confirmar({ titulo, mensaje, textoBoton, peligro })) { ... }
// =========================================================

let modal, elemento;

function crearModal() {
    elemento = document.createElement("div");
    elemento.className = "modal fade";
    elemento.tabIndex = -1;
    elemento.setAttribute("aria-hidden", "true");
    elemento.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title h5" id="confirmarTitulo"></h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body"><p class="mb-0" id="confirmarMensaje"></p></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn" id="confirmarAceptar"></button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(elemento);
    modal = new bootstrap.Modal(elemento);
}

export function confirmar({ titulo, mensaje, textoBoton = "Aceptar", peligro = false }) {
    // Si Bootstrap no cargó, se usa el confirm del navegador
    if (!window.bootstrap) return Promise.resolve(window.confirm(mensaje));
    if (!modal) crearModal();

    elemento.querySelector("#confirmarTitulo").textContent = titulo;
    elemento.querySelector("#confirmarMensaje").textContent = mensaje;

    const aceptar = elemento.querySelector("#confirmarAceptar");
    aceptar.textContent = textoBoton;
    aceptar.className = `btn ${peligro ? "btn-danger" : "btn-primary"}`;

    return new Promise(resolve => {
        let respuesta = false;

        const alAceptar = () => { respuesta = true; modal.hide(); };
        aceptar.addEventListener("click", alAceptar, { once: true });

        elemento.addEventListener("hidden.bs.modal", () => {
            aceptar.removeEventListener("click", alAceptar);
            resolve(respuesta);
        }, { once: true });

        modal.show();
    });
}
