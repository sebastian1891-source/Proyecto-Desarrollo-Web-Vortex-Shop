import { registrarUsuario, obtenerUsuarioActual, traducirError } from "./firebase/auth.js";
import { guardarMensajePendiente } from "./mensajes.js";
import {
    validarNombre,
    validarEmail,
    validarPasswordNueva,
    validarConfirmacion,
    marcarCampo,
    mostrarAlertaFormulario,
    ocultarAlertaFormulario,
    setBotonCargando
} from "./validaciones.js";

const formulario = document.querySelector("#formRegistro");
const campos = {
    nombre: document.querySelector("#regNombre"),
    apellido: document.querySelector("#regApellido"),
    email: document.querySelector("#regEmail"),
    password: document.querySelector("#regPassword"),
    confirmacion: document.querySelector("#regConfirmacion")
};
const boton = document.querySelector("#btnRegistrarse");

// Si ya hay una sesión abierta no tiene sentido registrarse de nuevo
const usuarioActual = await obtenerUsuarioActual();
if (usuarioActual) {
    window.location.replace("perfil.html");
}

// Qué validación corresponde a cada campo
const validadores = {
    nombre: () => validarNombre(campos.nombre.value, "nombre"),
    apellido: () => validarNombre(campos.apellido.value, "apellido"),
    email: () => validarEmail(campos.email.value),
    password: () => validarPasswordNueva(campos.password.value),
    confirmacion: () => validarConfirmacion(campos.password.value, campos.confirmacion.value)
};

function validarCampo(nombreCampo) {
    return marcarCampo(campos[nombreCampo], validadores[nombreCampo]());
}

// Valida todos los campos; devuelve true si están todos bien
function validarFormulario() {
    return Object.keys(campos).map(validarCampo).every(Boolean);
}

// Validación en vivo, campo por campo:
// - al salir de un campo que tiene algo escrito
// - mientras se escribe, si el campo ya estaba marcado con error (para que el rojo desaparezca al corregirlo)
Object.entries(campos).forEach(([nombreCampo, input]) => {
    input.addEventListener("blur", (evento) => {
        // Si se sale del campo para tocar "Crear cuenta" no se valida acá
        // (lo hace el submit); así el mensaje de error no mueve el botón bajo el clic.
        if (evento.relatedTarget === boton) return;
        if (input.value !== "") validarCampo(nombreCampo);
    });

    input.addEventListener("input", () => {
        if (input.classList.contains("is-invalid")) validarCampo(nombreCampo);

        // Si cambia la contraseña, la confirmación ya revisada se vuelve a comprobar
        if (nombreCampo === "password" && campos.confirmacion.value !== "") validarCampo("confirmacion");
    });
});

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarAlertaFormulario();

    if (!validarFormulario()) {
        mostrarAlertaFormulario("Revisá los campos marcados en rojo.");
        return;
    }

    setBotonCargando(boton, true, "Creando cuenta...");

    try {
        const nombre = campos.nombre.value.trim();

        await registrarUsuario({
            nombre,
            apellido: campos.apellido.value.trim(),
            email: campos.email.value.trim().toLowerCase(),
            password: campos.password.value
        });

        guardarMensajePendiente(`¡Bienvenido/a, ${nombre}! Tu cuenta se creó correctamente.`);
        window.location.href = "perfil.html";
    } catch (error) {
        console.error(error);
        mostrarAlertaFormulario(traducirError(error));

        if (error.code === "auth/email-already-in-use") {
            marcarCampo(campos.email, "Ese correo ya está registrado.");
        }

        setBotonCargando(boton, false);
    }
});