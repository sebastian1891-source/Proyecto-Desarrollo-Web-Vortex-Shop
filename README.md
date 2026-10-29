# Vortex Shop

**Sitio publicado:** [https://sebastian1891-source.github.io/Proyecto-Desarrollo-Web-Vortex-Shop/](https://sebastian1891-source.github.io/Proyecto-Desarrollo-Web-Vortex-Shop/)

**Repositorio:** [github.com/sebastian1891-source/Proyecto-Desarrollo-Web-Vortex-Shop](https://github.com/sebastian1891-source/Proyecto-Desarrollo-Web-Vortex-Shop)

# Identidad del proyecto

**Nombre del proyecto**: Vortex Shop

**Nombre del estudiante**: Sebastián Camacho

**Descripción del e-commerce**: 
Vortex Shop es un sitio web de comercio electrónico especializado en productos de tecnología y electrónica. La tienda está orientada a ofrecer una experiencia de navegación moderna, clara y accesible, permitiendo a los usuarios conocer diferentes categorías de productos tecnológicos.
El proyecto se desarrolla de forma incremental mediante sprints, ampliando progresivamente las funcionalidades del sistema sin eliminar las implementadas en etapas anteriores.

**Temática**: Tecnología y electrónica

**Productos**: Celulares, computadoras, periféricos, componentes y accesorios tecnológicos.

**Público objetivo**: Jóvenes y adultos interesados en tecnología, gaming, informática y dispositivos electrónicos.

**Tecnologías utilizadas**: 
Durante el Sprint 1 se utilizaron las siguientes tecnologías:
HTML5: estructura semántica de la página.
CSS3: personalización de la identidad visual y diseño responsive.
Bootstrap 5.3.3: sistema de grillas, navbar, botones, modal y componentes responsivos.
Bootstrap Icons: íconos utilizados en la identidad visual y distintas secciones.
Git: control de versiones.
GitHub: almacenamiento remoto del repositorio y seguimiento de los commits.
Visual Studio Code: entorno de desarrollo.
Live Server: ejecución local del proyecto durante el desarrollo.
JavaScript y LocalStorage (Sprint 2): catálogo dinámico y carrito.
Firebase 10.12.2 (Sprint 3): Authentication (correo y contraseña) y Cloud Firestore (usuarios, productos, pedidos y valoraciones).

**Estilo de comunicación**: Moderno, directo, tecnológico y accesible

**Colores principales**: Azul oscuro, celeste y blanco

**Tipografía**: Inter

**Identidad visual**: Logotipo con el nombre "Vortex Shop" acompañado de un ícono de computadora

**Categorías iniciales**: Celulares, Computación, Gaming, Periféricos y Accesorios.

**Instrucciones de ejecución**:
Clonar o descargar el repositorio del proyecto.
Abrir la carpeta del proyecto en Visual Studio Code.
Verificar que la extensión Live Server esté instalada.
Hacer clic derecho sobre el archivo index.html.
Seleccionar la opción Open with Live Server.
El sitio se abrirá en el navegador predeterminado.

**Funcionalidades desarrolladas en el Sprint 1**
Durante el Sprint 1 se desarrollaron las siguientes funcionalidades y características:

Personalización completa de la identidad visual del proyecto.
Cambio del nombre de la tienda a Vortex Shop.
Incorporación de una marca visual con ícono de computadora.
Definición de una paleta de colores coherente basada en azul oscuro, celeste y blanco.
Aplicación de la tipografía Inter.
Personalización del navbar.
Creación de una sección hero adaptada a la temática del e-commerce.
Incorporación de productos destacados estáticos.
Creación de tarjetas de productos utilizando Bootstrap.
Incorporación de una sección de beneficios.
Personalización del footer.
Uso de Bootstrap para la estructura y los componentes.
Implementación de diseño responsive.
Pruebas del sitio en tamaños aproximados de:
375 px (teléfono),
768 px (tablet),
1366 px (escritorio).
Verificación de la correcta reorganización de las tarjetas y adaptación del navbar, imágenes, botones y textos.

**Decisiones de diseño adoptadas**:
Para mantener una identidad visual uniforme en toda la aplicación se adoptaron las siguientes decisiones:

Color principal: azul oscuro (#0b1f3a), utilizado en el navbar, secciones destacadas y elementos estructurales.
Color secundario: celeste (#38bdf8), utilizado en botones, íconos y elementos de interacción.
Color de acento: blanco, utilizado para superficies y contraste.
Tipografía: Inter, elegida por su legibilidad y estética moderna.
Botones: bordes redondeados y efectos hover sutiles para reforzar la interacción.
Tarjetas: fondos blancos, bordes suaves, esquinas redondeadas y sombras discretas.
Fondos: tonos claros para el contenido principal y azul oscuro para las secciones que requieren mayor contraste.
Diseño responsive: se utilizaron las grillas y componentes de Bootstrap junto con media queries en CSS para adaptar la interfaz a teléfonos, tablets y escritorios.

**Funcionalidades incorporadas en el Sprint 2**
- Catálogo generado dinámicamente desde JavaScript (antes escrito a mano en el HTML).
- Buscador de productos por nombre y filtro por categoría, combinables entre sí, sin recargar la página.
- Ordenamiento por nombre y por precio, y contador de resultados encontrados.
- Detalle de producto dinámico mediante una única página (`producto.html?id=`).
- Carrito de compras: agregar, quitar y modificar cantidades, con control de stock, subtotal, total y envío simulado.
- Carrusel de imágenes, características técnicas, productos relacionados y valoraciones/comentarios en el detalle de producto.

**Correcciones posteriores a la devolución del Sprint 2**
- Si el carrito ya tiene la cantidad máxima disponible de un producto, al intentar agregarlo de nuevo se muestra un aviso de que no se pueden agregar más unidades (antes decía que se había agregado).
- Se quitó la opción "Producto" del menú y del footer: la ficha se abre desde "Ver producto" en el catálogo, y en ella el menú resalta "Catálogo".
- El carrito muestra el precio unitario de cada artículo además del subtotal.
- Desde el carrito se puede volver al producto (clic en la imagen o el nombre) y seguir comprando con el botón "Seguir comprando".
- El iPhone 16 Pro Max tiene dos imágenes en el carrusel de su ficha.

**Información guardada en LocalStorage (Sprint 2)**
- Carrito de compras: `id` de cada producto agregado y su cantidad. Desde el Sprint 3 es lo único que queda en LocalStorage; los productos y las valoraciones pasaron a Firestore.

## Sprint 3 · Firebase

### Funcionalidades incorporadas
- **Autenticación real** con Firebase Authentication (correo y contraseña): registro, inicio y cierre de sesión, sesión persistente al recargar y navbar que cambia según el estado.
- **Perfil protegido** (`perfil.html`): sin sesión redirige al login; con sesión muestra los datos del usuario y su historial de pedidos.
- **Productos en Cloud Firestore** (colección `productos`, 16 productos en 5 categorías). El catálogo, la ficha y el carrito consultan Firestore y conservan búsqueda, filtros, orden, carrusel y relacionados.
- **Compras reales**: el botón "Confirmar compra" registra el pedido en la colección `pedidos` y descuenta el stock.
- **Valoraciones en Firestore** (colección `valoraciones`), asociadas al usuario autenticado, con puntuación y comentario validados. Una opinión por usuario y producto (si vuelve a opinar, se edita).
- **Estados en la interfaz**: mensajes de carga, de catálogo vacío, de producto inexistente y de error de conexión (con botón "Reintentar").
- **Administración** (`admin.html`): protegida por rol; el link del menú solo aparece para administradores. El panel completo es una sección en desarrollo para próximas entregas.
- **Carga inicial** (`carga-inicial.html`, solo administradores): sube a Firestore los productos del arreglo local que todavía no existen, sin modificar los ya cargados.

### Organización de los archivos JavaScript
Todos los archivos que usan Firebase son módulos (`type="module"`), por eso el sitio debe abrirse con Live Server.

| Carpeta / archivo | Responsabilidad |
|---|---|
| `js/firebase/config.js` | Inicializa Firebase y exporta `auth` y `db` |
| `js/firebase/auth.js` | Registro, login, logout, observador de sesión y mensajes de error |
| `js/firebase/roles.js` | Roles `cliente` / `administrador`, consulta del rol y protección de páginas de administración (Sprint 4) |
| `js/firebase/productos.js` | Consultas a la colección `productos`; alta y edición desde el panel (Sprint 4) |
| `js/firebase/pedidos.js` | Transacción de compra y consulta de pedidos del usuario |
| `js/firebase/valoraciones.js` | Lectura, validación y guardado de opiniones |
| `js/data/productosIniciales.js` | Arreglo local, usado solo para la carga inicial |
| `js/productos.js` · `js/detalleProducto.js` · `js/carrito.js` | Lógica del catálogo, la ficha y el carrito |
| `js/registro.js` · `js/login.js` · `js/perfil.js` · `js/cargaInicial.js` | Lógica de cada página |
| `js/admin.js` | Panel administrativo: protección por rol, pestañas y datos compartidos (Sprint 4) |
| `js/admin/` | Una pestaña por archivo: `resumen.js`, `productos.js`, `pedidos.js`, `comentarios.js`, `usuarios.js`, más `confirmar.js` (ventana de confirmación) y `utilidades.js` |
| `js/sesion.js` | Actualiza el navbar en todas las páginas |
| `js/valoraciones.js` | Bloque de opiniones de la ficha |
| `js/productosUI.js` · `js/validaciones.js` · `js/mensajes.js` | Piezas de interfaz, validaciones y avisos compartidos |
| `js/base.js` | Página activa del menú y modal del inicio |

### Registro y autenticación de usuarios
1. En `registro.html` se piden nombre, apellido, correo, contraseña y su confirmación. Antes de enviar se valida que no haya campos vacíos, el formato del correo, que la contraseña tenga al menos 6 caracteres con letras y números, y que ambas coincidan.
2. Firebase Authentication crea la cuenta y se guarda en Firestore el documento `usuarios/{uid}` con nombre, apellido, correo, `rol: "cliente"` y fecha de registro.
3. En `login.html` se inicia sesión con correo y contraseña. Los errores de Firebase se traducen a mensajes claros (credenciales incorrectas, demasiados intentos, sin conexión, etc.).
4. La sesión se mantiene al recargar (`browserLocalPersistence`) y se cierra desde el navbar.
5. El rol `administrador` solo puede asignarse manualmente desde la consola de Firebase; las reglas impiden que un usuario se lo cambie a sí mismo (ver Sprint 4).

### Confirmación de una compra y actualización del stock
1. Si no hay sesión, no se permite comprar y se ofrece iniciar sesión (el carrito se conserva).
2. Se revisa el carrito contra Firestore: si un producto ya no está disponible o tiene menos stock, se avisa y se ajusta antes de confirmar.
3. Se ejecuta una **transacción** de Firestore que vuelve a leer cada producto, valida disponibilidad y stock, calcula el total con los precios actuales, descuenta el stock (nunca queda negativo) y crea el pedido. Si algún paso falla, no se guarda nada.
4. Recién si la transacción terminó bien se vacía el carrito y se muestra el número de pedido.
5. Cada pedido guarda: usuario, productos, cantidades, precios unitarios, subtotales, envío, total, fecha y estado (`pendiente`). En "Mi perfil" cada usuario ve solo sus pedidos.

Las reglas de seguridad (`firestore.rules`) refuerzan todo esto: cualquiera puede ver los productos, pero un cliente solo puede **bajar** su stock; cada usuario lee solo sus pedidos y crea pedidos a su nombre; las opiniones solo las crea o edita su autor.

### Usuarios de prueba
Cuentas creadas exclusivamente para evaluar el proyecto (no son datos personales):

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | `cliente.prueba@vortexshop.com` | `Prueba2026` |
| Administrador | `admin.prueba@vortexshop.com` | `Admin2026` |

El administrador puede acceder además a `carga-inicial.html`.

## Sprint 4 · Roles y panel administrativo

### Semana 1 · Roles y acceso administrativo

#### Roles
El sitio trabaja con dos roles, guardados en el campo `rol` del documento de cada usuario en Firestore:

| Rol | Cómo se obtiene | Qué puede hacer |
|---|---|---|
| `cliente` | Automáticamente al registrarse | Comprar, ver su perfil y sus pedidos, opinar |
| `administrador` | Manualmente desde la consola de Firestore | Todo lo anterior, más el panel de administración y la carga inicial |

```
usuarios/ uid-del-usuario/
    nombre: "Ana"
    apellido: "Pérez"
    email: "ana@email.com"
    rol: "cliente"
    fechaRegistro: <fecha>
```

#### Funcionalidades incorporadas
- **Campo `rol`** en el documento `usuarios/{uid}` de cada usuario.
- **Registro como cliente**: todo usuario nuevo se guarda con `rol: "cliente"`. El formulario de registro no tiene ningún campo de rol, y las reglas de Firestore rechazan la creación de un usuario con otro rol aunque se intente desde la consola del navegador.
- **Consulta del rol al iniciar sesión**: después del login se lee el rol en Firestore; el mensaje de bienvenida indica si se ingresó como administrador, y "Mi perfil" muestra el rol de la cuenta.
- **Link "Administración" solo para administradores**: está oculto por defecto en el menú de todas las páginas y se muestra únicamente si el rol es `administrador`.
- **`admin.html` protegido**: si un cliente escribe la URL directamente, se lo redirige al inicio con el aviso *"No tenés permisos para acceder al panel de administración"*. Sin sesión, se lo envía al login y, al ingresar, vuelve al panel. Mientras se verifica el permiso solo se ve "Verificando permisos...", nunca el contenido del panel. Lo mismo aplica a `carga-inicial.html`.
- **Lógica centralizada** en `js/firebase/roles.js`: los nombres de los roles están definidos en un solo lugar (`ROLES`) y todas las páginas usan `obtenerRolUsuario`, `esAdministrador` y `exigirAdministrador`. Si un documento no tiene rol, se lo trata como cliente (nunca se dan permisos de administrador por defecto).

#### Asignar el rol administrador a una cuenta de prueba
1. Crear la cuenta normalmente desde `registro.html` (queda como `cliente`).
2. En la consola de Firebase: **Firestore Database > usuarios >** documento con el uid de esa cuenta.
3. Editar el campo `rol` y cambiar su valor de `cliente` a `administrador`.
4. Cerrar sesión y volver a ingresar con esa cuenta: aparece el link "Administración".

#### Seguridad
Ocultar el link y redirigir desde JavaScript mejora la experiencia, pero lo que protege los datos son las reglas de `firestore.rules`, que verifican el mismo campo `rol == "administrador"`: solo un administrador puede crear o borrar productos, ver todos los pedidos o cambiar su estado, y ningún usuario puede modificar su propio rol.

#### Comprobaciones con las cuentas de prueba (resultado esperado)
| Prueba | Cliente | Administrador |
|---|---|---|
| Se registra con rol `cliente` | ✔ | (se cambió a mano) |
| Ve el link "Administración" en el menú | No | Sí |
| Entra a `admin.html` escribiendo la URL | Redirigido al inicio con aviso | Ve el panel |
| Entra a `carga-inicial.html` escribiendo la URL | Redirigido al inicio con aviso | Ve la carga inicial |
| Mensaje al iniciar sesión | "Iniciaste sesión correctamente" | "Iniciaste sesión como administrador" |
| Sin sesión, entra a `admin.html` | Enviado al login | Enviado al login |

### Semana 2 · Panel administrativo básico
`admin.html` pasó de ser una sección "en desarrollo" a un panel funcional enfocado en la gestión de productos. Solo pueden usarlo los administradores (misma protección de la semana 1).

#### Funcionalidades incorporadas
- **Lista de productos desde Firestore** con nombre, categoría, precio, stock y estado (*Disponible*, *Sin stock* o *No disponible*). Se ordena por categoría y nombre, tiene botón "Actualizar lista" y mensajes de carga y de error con "Reintentar".
- **Formulario para crear un producto**: nombre, categoría, precio, stock y disponibilidad; además descripción, imagen y características (opcionales). Firestore genera el id del documento.
- **Edición**: el botón "Editar" de cada fila carga los datos del producto en el mismo formulario, que cambia a modo edición ("Guardar cambios" / "Cancelar edición") y resalta la fila. Se guarda con `updateDoc`, por lo que no se pierden los campos que el formulario no muestra (por ejemplo, las imágenes extra del carrusel).
- **Validaciones** antes de enviar, campo por campo y en vivo:
  - Nombre: obligatorio, entre 3 y 100 caracteres y sin repetir el de otro producto.
  - Categoría: obligatoria, elegida de la lista (Accesorios, Celulares, Computación, Gaming, Periféricos).
  - Precio: obligatorio, número entero mayor a 0.
  - Stock: obligatorio, número entero entre 0 y 9999.
  - Opcionales: descripción de hasta 300 caracteres, imagen con ruta `img/...` o dirección `https://`, hasta 10 características.
- **Mensajes después de guardar**: aviso de éxito con link "Ver en el catálogo", o mensaje de error comprensible (sin conexión, sin permisos, producto inexistente).
- **Botón deshabilitado mientras se guarda**: muestra un spinner y "Guardando...", y se bloquean el formulario y los botones "Editar" para evitar envíos dobles.
- **Reflejo en el catálogo**: después de guardar se vuelve a leer Firestore para mostrar lo realmente guardado. El catálogo, la ficha y el carrito leen la misma colección, así que el producto nuevo o editado aparece al recargarlos.

Las funciones `crearProducto` y `actualizarProducto` están en `js/firebase/productos.js`; la lógica de la página, en `js/admin.js`. Las reglas de Firestore ya permitían crear y editar productos solo a administradores.

#### Comprobaciones (resultado esperado)
1. Ingresar como administrador y abrir "Administración": se ve la lista con los productos de Firestore.
2. Enviar el formulario vacío: se marcan en rojo nombre, categoría, precio y stock, y no se guarda nada.
3. Crear un producto válido: aparece el mensaje de éxito, el producto se suma a la lista y se ve en `catalogo.html`.
4. Editar el precio o el stock de un producto: el cambio se ve en la lista, en el catálogo y en su ficha.
5. Desmarcar "Disponible para la venta": en el catálogo el producto figura como *No disponible* y no se puede agregar al carrito.
6. Ingresar como cliente y escribir `admin.html`: se redirige al inicio con el aviso de falta de permisos.

### Opcionales incorporados
Una vez terminado lo obligatorio, el panel se organizó en cinco pestañas (`admin.html#resumen`, `#productos`, `#pedidos`, `#comentarios`, `#usuarios`; la pestaña queda en la URL al recargar).

| Opcional | Dónde | Qué hace |
|---|---|---|
| Eliminar o desactivar productos | Productos | **Desactivar/Activar** cambia `disponible` sin borrar nada: el producto sigue en el catálogo como *No disponible*. **Eliminar** pide confirmación y borra el producto junto con sus opiniones; los pedidos anteriores no cambian porque guardan su propia copia de nombre y precio. |
| Estadísticas generales | Resumen | Productos (a la venta, sin stock, desactivados, unidades), pedidos (total y pendientes), ingresos y ticket promedio sin contar cancelados, clientes y administradores, opiniones con su promedio, productos más vendidos, pedidos por estado, alertas de stock bajo (3 o menos) y últimos pedidos. Cada tarjeta lleva a su pestaña. |
| Consultar pedidos | Pedidos | Todos los pedidos con fecha, cliente, detalle de productos y total. Búsqueda por número, nombre o correo, y filtro por estado. |
| Gestionar comentarios y usuarios | Comentarios · Usuarios | Moderación de opiniones (búsqueda, filtro por producto y puntuación, eliminar con confirmación). Consulta de usuarios con rol, fecha de registro, cantidad de pedidos y total comprado. Los roles se siguen asignando desde Firestore. |
| Modificar el estado de un pedido | Pedidos | Estados: *Pendiente → En preparación → Enviado → Entregado*, o *Cancelado*. Cancelar pide confirmación, devuelve las unidades al stock en la misma transacción y es definitivo. El cliente ve el estado actualizado en "Mi perfil". |

Para esto se ajustaron las reglas de Firestore: el administrador puede leer todos los usuarios, y al modificar un pedido solo puede cambiar el campo `estado` (a un valor válido y nunca desde `cancelado`).

### Semana 3 · Revisión, seguridad básica y publicación

#### Reglas de Firestore
El modo de prueba se reemplazó por las reglas de `firestore.rules`, publicadas en la consola de Firebase:

| Colección | Lectura | Escritura |
|---|---|---|
| `productos` | Pública (cualquier visitante) | Crear, editar y borrar: solo administradores. Un cliente solo puede **bajar** el stock al confirmar una compra |
| `pedidos` | Cada usuario solo los suyos (el administrador, todos) | Crear: solo a nombre propio y en estado `pendiente`. Cambiar el estado: solo administradores, y nunca desde `cancelado` |
| `usuarios` | Cada usuario solo su documento (el administrador, todos) | Al registrarse, solo con rol `cliente`; nadie puede cambiarse el rol |
| `valoraciones` | Pública | Solo el autor, con puntuación y comentario válidos |

El historial de "Mi perfil" consulta los pedidos con `where("uid", "==", uid)`, así la consulta cumple la regla y un usuario nunca recibe pedidos de otra persona.

#### Recorridos comprobados
- Registro, inicio y cierre de sesión.
- Catálogo (búsqueda, filtro y orden), detalle de producto, carrito y confirmación de compra.
- Acceso como cliente (sin link de administración y redirigido si escribe `admin.html`) y como administrador (panel de productos).
- Páginas principales en un teléfono (375 px): menú desplegable, tarjetas en una columna y tablas con desplazamiento horizontal.

#### Correcciones de esta etapa
- Se revisaron todos los enlaces, imágenes e imports entre archivos: no quedaron enlaces rotos.
- En teléfonos, el inicio y la ficha de producto quedaban 12 px más anchos que la pantalla y se podían desplazar hacia los costados (filas de Bootstrap con `g-5`). Se cambió a `g-4 g-lg-5`: espaciado amplio en escritorio y sin desborde en celulares.
- Se reemplazó en el pie de página el texto de la plantilla ("Versión inicial para estudiantes") por el nombre del autor.
- Se publicó la versión final con GitHub Pages y se agregó el enlace al comienzo de este README.
- Se comprobó en el sitio publicado que, sin iniciar sesión, se pueden leer los productos pero no los pedidos ni los usuarios (las reglas reemplazaron al modo de prueba).

#### Limitación conocida
Como el sitio no tiene servidor propio, el descuento de stock lo hace el navegador del cliente dentro de una transacción. Las reglas impiden subir el stock, dejarlo negativo o tocar otros campos, pero no pueden comprobar que cada descuento corresponda a un pedido. Resolverlo requeriría Cloud Functions, que está fuera del alcance del curso.

**Funcionalidades pendientes para el siguiente sprint**
- Pago real (la compra registra el pedido, pero no procesa pagos).
- Edición de los datos del perfil.
- Baja (eliminación) de productos desde el panel.
- Gestión del estado de los pedidos por parte del administrador.