// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para mostrar mensajes de interacción
function mostrarMensaje(mensaje) {
    const mensajeInteraccion = document.getElementById('mensaje-interaccion');
    mensajeInteraccion.innerHTML = `<p class="p-interaccion">${mensaje}</p>`;
}

// Función para agregar un producto al carrito
function agregarAlCarrito(nombre, precio) {
    const productoExistente = carrito.find(item => item.nombre === nombre);
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(nombre, cantidad) {
    cantidad = parseInt(cantidad);

    let index = -1;
    carrito.forEach((item, i) => {
        if (item.nombre === nombre) {
            index = i;
        }
    });

    if (index !== -1) {
        carrito[index].cantidad -= cantidad;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
}

// Función para renderizar el carrito
function renderizarCarrito() {
    const carritoLista = document.getElementById('carritoLista');
    carritoLista.innerHTML = '';
    let total = 0;
    carrito.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.nombre} x ${item.cantidad} - $${item.precio * item.cantidad}`;
        carritoLista.appendChild(listItem);
        // Botón para eliminar del carrito
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.addEventListener('click', () => {
            eliminarDelCarrito(item.nombre, 1); // Eliminar de a uno
        });
        listItem.appendChild(eliminarBtn);
        total += item.precio * item.cantidad;
    });
    const totalPagar = document.getElementById('totalPagar');
    totalPagar.textContent = `Total a pagar: $${total}`;
}

// Evento para agregar un producto al carrito
function manejarAgregarAlCarrito(event) {
    const agregarBtn = event.target;
    const nombre = agregarBtn.getAttribute('data-nombre');
    const precio = parseInt(agregarBtn.getAttribute('data-precio'));
    agregarAlCarrito(nombre, precio);
}

// Evento para finalizar la compra
function manejarFinalizarCompra() {
    if (carrito.length === 0) {
        mostrarMensaje('Su carrito está vacío. Agregue productos para continuar.');
    } else {
        // Crear el formulario
        const formularioHTML = `
            <div id="formulario-comprador">
                <h2>Datos del comprador</h2>
                <form id="formComprador">
                    <div>
                        <label for="nombre">Nombre del comprador:</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div>
                        <label for="direccion">Dirección de despacho:</label>
                        <input type="text" id="direccion" name="direccion" required>
                    </div>
                    <div>
                        <label for="telefono">Número telefónico:</label>
                        <input type="tel" id="telefono" name="telefono" required>
                    </div>
                    <div>
                        <label for="email">Email de contacto:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <button type="submit">Confirmar compra</button>
                </form>
            </div>
        `;
        // Mostrar el formulario
        mostrarVentanaEmergente(formularioHTML);

        // Agregar evento para mostrar la ventana de confirmación
        const formComprador = document.getElementById('formComprador');
        formComprador.addEventListener('submit', (event) => {
            event.preventDefault();
            const precioTotal = calcularPrecioTotal();
            mostrarVentanaConfirmacion(precioTotal);
        });
    }
}

// Función para confirmar la compra
function mostrarVentanaConfirmacion(precioTotal) {
    const mensajeConfirmacion = `
        Está a punto de confirmar su pago por $${precioTotal}.
        <button id="confirmarCompraBtn">Confirmar</button>
        <button id="cancelarCompraBtn">Cancelar</button>
    `;
    mostrarVentanaEmergente(mensajeConfirmacion);
    const confirmarCompraBtn = document.getElementById('confirmarCompraBtn');
    confirmarCompraBtn.addEventListener('click', () => {
        cerrarVentanaEmergente();
        carrito = [];
        localStorage.removeItem('carrito');
        Swal.fire({
            title: '¡Compra exitosa!',
            text: '¡Muchas gracias por tu compra! Vuelve pronto.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            renderizarCarrito();
        });
    });
    const cancelarCompraBtn = document.getElementById('cancelarCompraBtn');
    cancelarCompraBtn.addEventListener('click', () => {
        mostrarMensaje('Compra cancelada.');
        cerrarVentanaEmergente();
    });
}

// Función para mostrar la ventana emergente
function mostrarVentanaEmergente(contenidoHTML) {
    const ventanaEmergente = document.getElementById('ventanaEmergente');
    ventanaEmergente.style.display = 'block';
    const contenidoVentana = document.getElementById('contenidoVentana');
    contenidoVentana.innerHTML = contenidoHTML;

    // Evento para cerrar la ventana emergente al clickear "X"
    const cerrarBtn = document.querySelector('.cerrar');
    cerrarBtn.addEventListener('click', cerrarVentanaEmergente);
}

// Función para cerrar la ventana emergente
function cerrarVentanaEmergente() {
    const ventanaEmergente = document.getElementById('ventanaEmergente');
    ventanaEmergente.style.display = 'none';
}

// Función para calcular el precio total del carrito
function calcularPrecioTotal() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Cargar productos desde el archivo JSON utilizando una promesa
function cargarProductos() {
    return new Promise((resolve, reject) => {
        fetch('productos.json')
            .then(response => {
                if (response.ok) {
                    resolve(response.json());
                } else {
                    reject('Error al cargar los productos');
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Manejar la carga de productos y renderizarlos
function manejarCargaProductos() {
    cargarProductos()
        .then(data => {
            const productosContainer = document.getElementById('productos');
            data.forEach(producto => {
                const productoHTML = `
                    <div class="producto">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <p>${producto.nombre}</p>
                        <p>$${producto.precio}</p>
                        <button class="agregarBtn" data-nombre="${producto.nombre}" data-precio="${producto.precio}">Agregar al carrito</button>
                    </div>
                `;
                productosContainer.innerHTML += productoHTML;
            });

            // Evento a los botones de agregar al carrito
            const agregarBtns = document.querySelectorAll('.agregarBtn');
            agregarBtns.forEach(btn => {
                btn.addEventListener('click', manejarAgregarAlCarrito);
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
}

// Evento para finalizar la compra
const finalizarBtn = document.getElementById('finalizarBtn');
finalizarBtn.addEventListener('click', manejarFinalizarCompra);

// Verificar si hay un carrito guardado en el localStorage al cargar la página
renderizarCarrito();

// Cargar productos al cargar la página
manejarCargaProductos();