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
- **Carga inicial** (`carga-inicial.html`, solo administradores): sube a Firestore los productos del arreglo local que todavía no existen, sin modificar los ya cargados.

### Organización de los archivos JavaScript
Todos los archivos que usan Firebase son módulos (`type="module"`), por eso el sitio debe abrirse con Live Server.

| Carpeta / archivo | Responsabilidad |
|---|---|
| `js/firebase/config.js` | Inicializa Firebase y exporta `auth` y `db` |
| `js/firebase/auth.js` | Registro, login, logout, observador de sesión y mensajes de error |
| `js/firebase/productos.js` | Consultas a la colección `productos` |
| `js/firebase/pedidos.js` | Transacción de compra y consulta de pedidos del usuario |
| `js/firebase/valoraciones.js` | Lectura, validación y guardado de opiniones |
| `js/data/productosIniciales.js` | Arreglo local, usado solo para la carga inicial |
| `js/productos.js` · `js/detalleProducto.js` · `js/carrito.js` | Lógica del catálogo, la ficha y el carrito |
| `js/registro.js` · `js/login.js` · `js/perfil.js` · `js/cargaInicial.js` | Lógica de cada página |
| `js/sesion.js` | Actualiza el navbar en todas las páginas |
| `js/valoraciones.js` | Bloque de opiniones de la ficha |
| `js/productosUI.js` · `js/validaciones.js` · `js/mensajes.js` | Piezas de interfaz, validaciones y avisos compartidos |
| `js/base.js` | Página activa del menú y modal del inicio |

### Registro y autenticación de usuarios
1. En `registro.html` se piden nombre, apellido, correo, contraseña y su confirmación. Antes de enviar se valida que no haya campos vacíos, el formato del correo, que la contraseña tenga al menos 6 caracteres con letras y números, y que ambas coincidan.
2. Firebase Authentication crea la cuenta y se guarda en Firestore el documento `usuarios/{uid}` con nombre, apellido, correo, `rol: "cliente"` y fecha de registro.
3. En `login.html` se inicia sesión con correo y contraseña. Los errores de Firebase se traducen a mensajes claros (credenciales incorrectas, demasiados intentos, sin conexión, etc.).
4. La sesión se mantiene al recargar (`browserLocalPersistence`) y se cierra desde el navbar.
5. El rol `admin` solo puede asignarse manualmente desde la consola de Firebase; las reglas impiden que un usuario se lo cambie a sí mismo.

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

**Funcionalidades pendientes para el siguiente sprint**
- Pago real (la compra registra el pedido, pero no procesa pagos).
- Edición de los datos del perfil.
- Panel administrativo funcional.
- Gestión del estado de los pedidos por parte del administrador.