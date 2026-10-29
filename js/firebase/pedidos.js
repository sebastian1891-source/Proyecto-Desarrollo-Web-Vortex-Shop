// =========================================================
// PEDIDOS EN CLOUD FIRESTORE
// ---------------------------------------------------------
// Al confirmar una compra se usa una TRANSACCIÓN: Firestore lee
// los productos, se valida todo y recién ahí se escribe. Si algo
// falla en el medio, no se guarda nada (ni el pedido ni el stock).
//
// Estructura de cada documento de "pedidos":
//   uid, cliente { nombre, email },
//   items [ { idProducto, nombre, precioUnitario, cantidad, subtotal } ],
//   subtotal, envio, total, fecha, estado
// =========================================================

import { db } from "./config.js";
import { COLECCION_PRODUCTOS } from "./productos.js";

import {
    collection,
    doc,
    getDocs,
    query,
    where,
    runTransaction,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const COLECCION_PEDIDOS = "pedidos";
export const COSTO_ENVIO = 200;
export const UMBRAL_ENVIO_GRATIS = 20000;

// Estados posibles de un pedido (se usan en "Mi perfil" y en el panel).
// "cancelado" es definitivo: al cancelar se devuelve el stock.
export const ESTADOS_PEDIDO = {
    pendiente: { texto: "Pendiente", clase: "text-bg-warning" },
    preparando: { texto: "En preparación", clase: "text-bg-primary" },
    enviado: { texto: "Enviado", clase: "text-bg-info" },
    entregado: { texto: "Entregado", clase: "text-bg-success" },
    cancelado: { texto: "Cancelado", clase: "text-bg-secondary" }
};

export function datosEstado(estado) {
    return ESTADOS_PEDIDO[estado] ?? { texto: estado ?? "—", clase: "text-bg-light" };
}

export function calcularEnvio(subtotal) {
    return subtotal >= UMBRAL_ENVIO_GRATIS ? 0 : COSTO_ENVIO;
}

// Error propio para cuando un producto no se puede comprar.
// Lleva un mensaje pensado para mostrarle al usuario.
export class ErrorCompra extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorCompra";
    }
}

// Crea el pedido y descuenta el stock en una sola operación.
//   usuario: el usuario autenticado de Firebase Auth
//   itemsCarrito: [{ id, cantidad }] tal como está en LocalStorage
// Devuelve { id, ...datosDelPedido } si todo salió bien.
export async function crearPedido(usuario, itemsCarrito) {
    if (!usuario) throw new ErrorCompra("Tenés que iniciar sesión para confirmar la compra.");
    if (!itemsCarrito || itemsCarrito.length === 0) throw new ErrorCompra("Tu carrito está vacío.");

    const referenciaPedido = doc(collection(db, COLECCION_PEDIDOS));

    const pedido = await runTransaction(db, async (transaccion) => {
        // 1) LEER: todos los productos del carrito, con los datos actuales
        const referencias = itemsCarrito.map(item => doc(db, COLECCION_PRODUCTOS, item.id));
        const documentos = await Promise.all(referencias.map(ref => transaccion.get(ref)));

        // 2) VALIDAR: existencia, disponibilidad, stock y cantidad
        const items = itemsCarrito.map((item, i) => {
            const documento = documentos[i];

            if (!documento.exists()) {
                throw new ErrorCompra("Uno de los productos de tu carrito ya no está en el catálogo.");
            }

            const producto = documento.data();
            const stock = Number(producto.stock) || 0;
            const cantidad = Number(item.cantidad);

            if (!Number.isInteger(cantidad) || cantidad < 1) {
                throw new ErrorCompra(`La cantidad de "${producto.nombre}" no es válida.`);
            }
            if (producto.disponible === false || stock === 0) {
                throw new ErrorCompra(`"${producto.nombre}" ya no está disponible.`);
            }
            if (cantidad > stock) {
                const unidades = stock === 1 ? "queda 1 unidad" : `quedan ${stock} unidades`;
                throw new ErrorCompra(`Solo ${unidades} de "${producto.nombre}". Ajustá la cantidad e intentá de nuevo.`);
            }

            // Se usa el precio ACTUAL de Firestore, no el que estaba en pantalla
            const precioUnitario = Number(producto.precio) || 0;

            return {
                idProducto: item.id,
                nombre: producto.nombre,
                precioUnitario,
                cantidad,
                subtotal: precioUnitario * cantidad,
                stockRestante: stock - cantidad
            };
        });

        // 3) CALCULAR el total con la información actual
        const subtotal = items.reduce((suma, item) => suma + item.subtotal, 0);
        const envio = calcularEnvio(subtotal);
        const total = subtotal + envio;

        // 4) ESCRIBIR: descontar stock (nunca negativo, ya validado arriba) y crear el pedido
        items.forEach((item, i) => {
            transaccion.update(referencias[i], { stock: Math.max(0, item.stockRestante) });
        });

        const datosPedido = {
            uid: usuario.uid,
            cliente: {
                nombre: usuario.displayName || "",
                email: usuario.email
            },
            items: items.map(({ stockRestante, ...resto }) => resto),
            subtotal,
            envio,
            total,
            fecha: serverTimestamp(),
            estado: "pendiente"
        };

        transaccion.set(referenciaPedido, datosPedido);
        return datosPedido;
    });

    return { id: referenciaPedido.id, ...pedido };
}

// Pedidos del usuario autenticado, del más nuevo al más viejo
export async function obtenerPedidosDelUsuario(uid) {
    const consulta = query(collection(db, COLECCION_PEDIDOS), where("uid", "==", uid));
    const snapshot = await getDocs(consulta);

    return snapshot.docs
        .map(documento => ({ id: documento.id, ...documento.data() }))
        .sort((a, b) => (b.fecha?.toMillis?.() ?? 0) - (a.fecha?.toMillis?.() ?? 0));
}

// ---------- PANEL ADMINISTRATIVO ----------
// Todos los pedidos (las reglas solo lo permiten a administradores)
export async function obtenerTodosLosPedidos() {
    const snapshot = await getDocs(collection(db, COLECCION_PEDIDOS));

    return snapshot.docs
        .map(documento => ({ id: documento.id, ...documento.data() }))
        .sort((a, b) => (b.fecha?.toMillis?.() ?? 0) - (a.fecha?.toMillis?.() ?? 0));
}

// Cambia el estado de un pedido. Si el nuevo estado es "cancelado",
// en la misma transacción se devuelve al stock lo que se había descontado
// (solo para los productos que todavía existen).
export async function cambiarEstadoPedido(idPedido, nuevoEstado) {
    if (!ESTADOS_PEDIDO[nuevoEstado]) throw new ErrorCompra("El estado elegido no es válido.");

    const referenciaPedido = doc(db, COLECCION_PEDIDOS, idPedido);

    await runTransaction(db, async (transaccion) => {
        // 1) LEER el pedido y, si se cancela, sus productos
        const documentoPedido = await transaccion.get(referenciaPedido);
        if (!documentoPedido.exists()) throw new ErrorCompra("El pedido ya no existe.");

        const pedido = documentoPedido.data();
        if (pedido.estado === "cancelado") {
            throw new ErrorCompra("Un pedido cancelado no puede cambiar de estado.");
        }

        let productosADevolver = [];
        if (nuevoEstado === "cancelado") {
            const items = pedido.items ?? [];
            const referencias = items.map(item => doc(db, COLECCION_PRODUCTOS, item.idProducto));
            const documentos = await Promise.all(referencias.map(ref => transaccion.get(ref)));

            productosADevolver = items
                .map((item, i) => ({ referencia: referencias[i], cantidad: Number(item.cantidad) || 0, existe: documentos[i].exists() }))
                .filter(p => p.existe && p.cantidad > 0);
        }

        // 2) ESCRIBIR
        productosADevolver.forEach(p => transaccion.update(p.referencia, { stock: increment(p.cantidad) }));
        transaccion.update(referenciaPedido, { estado: nuevoEstado, fechaActualizacion: serverTimestamp() });
    });
}

// Número de pedido corto para mostrar (ej: "#A1B2C3")
export function numeroPedido(id) {
    return "#" + id.slice(0, 6).toUpperCase();
}

export function mensajeErrorPedido(error) {
    if (error instanceof ErrorCompra) return error.message;

    switch (error?.code) {
        case "permission-denied":
            return "No se pudo registrar la compra: permiso denegado. Iniciá sesión de nuevo e intentá otra vez.";
        case "unavailable":
        case "deadline-exceeded":
            return "No se pudo conectar con el servidor. Tu carrito no se modificó; intentá de nuevo.";
        case "aborted":
            return "Otro usuario estaba comprando el mismo producto. Intentá de nuevo.";
        default:
            return "No se pudo completar la compra. Tu carrito no se modificó; intentá de nuevo.";
    }
}
