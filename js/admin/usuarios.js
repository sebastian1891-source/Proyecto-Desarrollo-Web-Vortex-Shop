// =========================================================
// PANEL · PESTAÑA USUARIOS (opcional)
// ---------------------------------------------------------
// Consulta de los usuarios registrados con su rol, fecha de alta
// y actividad (cantidad de pedidos y total comprado).
// El rol administrador se sigue asignando a mano desde Firestore,
// como pide la consigna: desde el panel no se pueden cambiar roles.
// =========================================================

import { obtenerTodosLosUsuarios } from "../firebase/auth.js";
import { ROLES } from "../firebase/roles.js";
import { escaparHtml } from "../mensajes.js";
import { formatearPrecio } from "../productosUI.js";
import { formatearFecha, mensajeCargando, mostrarErrorCarga, mensajeErrorFirestore, normalizar } from "./utilidades.js";

let seccion, ctx;

function dibujarSeccion() {
    seccion.innerHTML = `
        <div class="auth-card">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h2 class="h5 fw-bold mb-0">Usuarios <span class="text-secondary fw-normal" id="contadorUsuarios"></span></h2>
                <button type="button" class="btn btn-outline-primary btn-sm" id="btnRecargarUsuarios">Actualizar</button>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-sm-8">
                    <input type="search" class="form-control form-control-sm" id="buscarUsuario" placeholder="Buscar por nombre o correo">
                </div>
                <div class="col-sm-4">
                    <select class="form-select form-select-sm" id="filtroRol" aria-label="Filtrar por rol">
                        <option value="">Todos los roles</option>
                        <option value="${ROLES.CLIENTE}">Clientes</option>
                        <option value="${ROLES.ADMINISTRADOR}">Administradores</option>
                    </select>
                </div>
            </div>

            <div id="listaUsuarios"></div>
            <p class="text-secondary small mt-3 mb-0">
                El rol <strong>administrador</strong> se asigna manualmente desde la consola de Firestore
                (campo <code>rol</code> del documento del usuario). El total comprado no incluye pedidos cancelados.
            </p>
        </div>
    `;

    seccion.querySelector("#btnRecargarUsuarios").addEventListener("click", cargar);
    seccion.querySelector("#buscarUsuario").addEventListener("input", dibujarLista);
    seccion.querySelector("#filtroRol").addEventListener("change", dibujarLista);
}

// Cantidad de pedidos y total comprado por cada uid
function actividadPorUsuario() {
    const actividad = {};
    (ctx.datos.pedidos ?? []).forEach(p => {
        const a = actividad[p.uid] ??= { pedidos: 0, total: 0 };
        a.pedidos++;
        if (p.estado !== "cancelado") a.total += Number(p.total) || 0;
    });
    return actividad;
}

function dibujarLista() {
    if (!seccion) return;
    const lista = seccion.querySelector("#listaUsuarios");
    const todos = ctx.datos.usuarios;
    if (!todos) return;

    const texto = normalizar(seccion.querySelector("#buscarUsuario").value.trim());
    const rol = seccion.querySelector("#filtroRol").value;
    const actividad = actividadPorUsuario();
    const hayPedidos = Array.isArray(ctx.datos.pedidos);

    const usuarios = todos
        .map(u => ({ ...u, rolNormal: u.rol === ROLES.ADMINISTRADOR ? ROLES.ADMINISTRADOR : ROLES.CLIENTE }))
        .filter(u =>
            (rol === "" || u.rolNormal === rol) &&
            (texto === "" || normalizar(`${u.nombre} ${u.apellido} ${u.email}`).includes(texto)))
        .sort((a, b) => (b.fechaRegistro?.toMillis?.() ?? 0) - (a.fechaRegistro?.toMillis?.() ?? 0));

    seccion.querySelector("#contadorUsuarios").textContent =
        usuarios.length === todos.length ? `(${todos.length})` : `(${usuarios.length} de ${todos.length})`;

    if (usuarios.length === 0) {
        lista.innerHTML = `<p class="text-secondary mb-0">Ningún usuario coincide con la búsqueda.</p>`;
        return;
    }

    lista.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle mb-0 tabla-admin">
                <thead>
                    <tr><th>Usuario</th><th>Rol</th><th>Registro</th><th class="text-end">Pedidos</th><th class="text-end">Total comprado</th></tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => {
                        const a = actividad[u.id] ?? { pedidos: 0, total: 0 };
                        const nombre = `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || "—";
                        return `
                        <tr>
                            <td>
                                <span class="fw-semibold">${escaparHtml(nombre)}</span>
                                <div class="text-secondary small text-break">${escaparHtml(u.email ?? "")}</div>
                            </td>
                            <td>${u.rolNormal === ROLES.ADMINISTRADOR
                                ? `<span class="badge text-bg-success">Administrador</span>`
                                : `<span class="badge text-bg-light border">Cliente</span>`}</td>
                            <td class="text-nowrap">${formatearFecha(u.fechaRegistro)}</td>
                            <td class="text-end">${hayPedidos ? a.pedidos : "—"}</td>
                            <td class="text-end text-nowrap">${hayPedidos ? formatearPrecio(a.total) : "—"}</td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

async function cargar() {
    const lista = seccion.querySelector("#listaUsuarios");
    lista.innerHTML = mensajeCargando("Cargando usuarios...");

    try {
        ctx.datos.usuarios = await obtenerTodosLosUsuarios();
        dibujarLista();
        ctx.avisarCambio("usuarios");
    } catch (error) {
        console.error(error);
        mostrarErrorCarga(lista, mensajeErrorFirestore(error, "No se pudieron cargar los usuarios."), cargar);
    }
}

export async function iniciarUsuarios(elemento, contexto) {
    seccion = elemento;
    ctx = contexto;
    dibujarSeccion();

    // La actividad depende de los pedidos: se recalcula cuando cambian
    ctx.suscribir(clave => { if (clave === "pedidos") dibujarLista(); });

    await cargar();
}
