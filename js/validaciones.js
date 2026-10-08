// =========================================================
// VALIDACIONES DE FORMULARIOS (registro e inicio de sesión)
// ---------------------------------------------------------
// Cada función devuelve un mensaje de error, o "" si el valor es válido.
// Se valida antes de llamar a Firebase para dar mensajes claros
// y no hacer pedidos innecesarios.
// =========================================================

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/;

export const LARGO_MINIMO_PASSWORD = 6;

export function validarNombre(valor, campo = "nombre") {
    const texto = valor.trim();
    if (texto === "") return `Ingresá tu ${campo}.`;
    if (texto.length < 2) return `El ${campo} debe tener al menos 2 letras.`;
    if (!REGEX_NOMBRE.test(texto)) return `El ${campo} solo puede contener letras.`;
    return "";
}

export function validarEmail(valor) {
    const texto = valor.trim();
    if (texto === "") return "Ingresá tu correo electrónico.";
    if (!REGEX_EMAIL.test(texto)) return "El correo no tiene un formato válido (ej: nombre@correo.com).";
    return "";
}

// Validación completa (para el registro)
export function validarPasswordNueva(valor) {
    if (valor === "") return "Ingresá una contraseña.";
    if (valor.length < LARGO_MINIMO_PASSWORD) return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`;
    if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) return "La contraseña debe incluir al menos una letra y un número.";
    return "";
}

export function validarConfirmacion(password, confirmacion) {
    if (confirmacion === "") return "Repetí la contraseña.";
    if (password !== confirmacion) return "Las contraseñas no coinciden.";
    return "";
}

// Para el inicio de sesión solo se exige que no esté vacía
export function validarPasswordIngreso(valor) {
    return valor === "" ? "Ingresá tu contraseña." : "";
}

// Marca el campo en rojo/verde con las clases de Bootstrap y escribe el mensaje
export function marcarCampo(input, mensajeError) {
    const feedback = input.closest(".mb-3")?.querySelector(".invalid-feedback");

    input.classList.toggle("is-invalid", mensajeError !== "");
    input.classList.toggle("is-valid", mensajeError === "");

    if (feedback) feedback.textContent = mensajeError;

    return mensajeError === "";
}

// Muestra un mensaje general arriba del formulario (error o éxito)
export function mostrarAlertaFormulario(mensaje, tipo = "danger") {
    const alerta = document.querySelector("#alertaFormulario");
    if (!alerta) return;

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

export function ocultarAlertaFormulario() {
    document.querySelector("#alertaFormulario")?.classList.add("d-none");
}

// Deshabilita el botón y muestra un spinner mientras se espera a Firebase
export function setBotonCargando(boton, cargando, textoCargando) {
    if (cargando) {
        boton.dataset.textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${textoCargando}`;
    } else {
        boton.disabled = false;
        boton.textContent = boton.dataset.textoOriginal || boton.textContent;
    }
}

// Solo permite redirigir a páginas internas del sitio (evita redirecciones a otros dominios)
export function obtenerDestinoSeguro(predeterminado = "index.html") {
    const destino = new URLSearchParams(window.location.search).get("redirect");
    return destino && /^[a-z]+\.html$/.test(destino) ? destino : predeterminado;
}