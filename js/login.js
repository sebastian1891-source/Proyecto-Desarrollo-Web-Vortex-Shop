import { iniciarSesion, obtenerUsuarioActual, traducirError } from "./firebase/auth.js";
import { guardarMensajePendiente } from "./mensajes.js";
import { obtenerRolUsuario, ROLES } from "./firebase/roles.js";
import {
    validarEmail,
    validarPasswordIngreso,
    marcarCampo,
    mostrarAlertaFormulario,
    ocultarAlertaFormulario,
    setBotonCargando,
    obtenerDestinoSeguro
} from "./validaciones.js";

const formulario = document.querySelector("#formLogin");
const inputEmail = document.querySelector("#loginEmail");
const inputPassword = document.querySelector("#loginPassword");
const boton = document.querySelector("#btnIngresar");

// Página a la que se vuelve después de ingresar (ej: login.html?redirect=perfil.html)
const destino = obtenerDestinoSeguro("index.html");


formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarAlertaFormulario();

    const emailValido = marcarCampo(inputEmail, validarEmail(inputEmail.value));
    const passwordValida = marcarCampo(inputPassword, validarPasswordIngreso(inputPassword.value));
    if (!emailValido || !passwordValida) return;

    setBotonCargando(boton, true, "Ingresando...");

    try {
        const usuario = await iniciarSesion(inputEmail.value.trim().toLowerCase(), inputPassword.value);

        const nombre = usuario.displayName ? usuario.displayName.split(" ")[0] : usuario.email;

        // Después de iniciar sesión se consulta el rol guardado en Firestore
        let rol = ROLES.CLIENTE;
        try {
            rol = await obtenerRolUsuario(usuario.uid);
        } catch (error) {
            console.error(error); // si falla, se lo trata como cliente
        }

        guardarMensajePendiente(rol === ROLES.ADMINISTRADOR
            ? `¡Hola, ${nombre}! Iniciaste sesión como administrador.`
            : `¡Hola, ${nombre}! Iniciaste sesión correctamente.`);

        window.location.href = destino;
    } catch (error) {
        console.error(error);
        mostrarAlertaFormulario(traducirError(error));

        // Por seguridad no se indica cuál de los dos datos está mal
        inputPassword.value = "";
        inputPassword.classList.remove("is-valid");
        setBotonCargando(boton, false);
    }
});

// (Se hace al final, después de conectar el formulario, para que un clic
// temprano no recargue la página mientras Firebase todavía está cargando.)
// Si ya hay una sesión abierta, se envía directo al destino
const usuarioActual = await obtenerUsuarioActual();
if (usuarioActual) {
    window.location.replace(destino === "index.html" ? "perfil.html" : destino);
}
