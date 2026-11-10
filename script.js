// SOLICITUDES DE SOPORTE TÉCNICO
// Aplicación educativa: guarda los registros en LocalStorage del navegador.
// La contraseña de ejemplo no constituye seguridad real para una aplicación publicada.

const CLAVE_ADMIN = "134200";
const STORAGE = "solicitudesSoporte";

const portada = document.getElementById("portada");
const sistema = document.getElementById("sistema");
const login = document.getElementById("login");
const clave = document.getElementById("clave");
const errorLogin = document.getElementById("errorLogin");
const btnInvitado = document.getElementById("btnInvitado");
const btnMostrarLogin = document.getElementById("btnMostrarLogin");
const btnSalir = document.getElementById("btnSalir");
const rol = document.getElementById("rol");

const form = document.getElementById("formSolicitud");
const equipo = document.getElementById("equipo");
const reportado = document.getElementById("reportado");
const fecha = document.getElementById("fecha");
const descripcion = document.getElementById("descripcion");
const indiceEdicion = document.getElementById("indiceEdicion");
const panelFormulario = document.getElementById("panelFormulario");
const tituloForm = document.getElementById("tituloForm");
const btnGuardar = document.getElementById("btnGuardar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnCancelar = document.getElementById("btnCancelar");
const mensajeForm = document.getElementById("mensajeForm");
const tabla = document.getElementById("tabla");
const vacio = document.getElementById("vacio");
const buscar = document.getElementById("buscar");
const filtroEstado = document.getElementById("filtroEstado");

let esAdministrador = false;
let solicitudes = cargarSolicitudes();

// Recupera los registros almacenados.
function cargarSolicitudes() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error al leer LocalStorage:", error);
    return [];
  }
}

// Guarda todos los registros.
function guardarDatos() {
  localStorage.setItem(STORAGE, JSON.stringify(solicitudes));
}

function mostrarSistema(tipo) {
  esAdministrador = tipo === "Administrador";
  portada.classList.add("oculto");
  sistema.classList.remove("oculto");
  rol.textContent = `Modo ${tipo.toLowerCase()}`;
  panelFormulario.classList.toggle("solo-admin-oculto", !esAdministrador);
  dibujarTabla();
  limpiarFormulario();
}

function volverPortada() {
  sistema.classList.add("oculto");
  portada.classList.remove("oculto");
  login.classList.add("oculto");
  clave.value = "";
  errorLogin.textContent = "";
  buscar.value = "";
  filtroEstado.value = "";
  limpiarFormulario();
}

function mensaje(texto, tipo = "") {
  mensajeForm.textContent = texto;
  mensajeForm.className = `mensaje ${tipo}`;
}

function limpiarFormulario(limpiarMensaje = true) {
  form.reset();
  indiceEdicion.value = "";
  tituloForm.textContent = "Registrar solicitud";
  btnGuardar.textContent = "Registrar solicitud";
  btnCancelar.classList.add("oculto");
  if (limpiarMensaje) mensaje("");
}

// Registra una solicitud nueva o actualiza una existente.
function guardarSolicitud(evento) {
  evento.preventDefault();
  if (!esAdministrador) return;

  const datos = {
    equipo: equipo.value.trim(),
    reportado: reportado.value.trim(),
    fecha: fecha.value,
    descripcion: descripcion.value.trim()
  };

  if (!datos.equipo || !datos.reportado || !datos.fecha || !datos.descripcion) {
    mensaje("Completa todos los campos obligatorios.", "error");
    return;
  }

  const indice = indiceEdicion.value === "" ? -1 : Number(indiceEdicion.value);

  if (indice >= 0) {
    // Al editar se conserva el estado actual de la solicitud.
    datos.estado = solicitudes[indice].estado;
    solicitudes[indice] = datos;
    mensaje("Solicitud actualizada correctamente.", "exito");
  } else {
    datos.estado = "Pendiente";
    solicitudes.push(datos);
    mensaje("Solicitud registrada con estado pendiente.", "exito");
  }

  guardarDatos();
  dibujarTabla();
  limpiarFormulario(false);
}

// Dibuja la tabla y aplica búsqueda y filtro de estado.
function dibujarTabla() {
  const texto = buscar.value.trim().toLowerCase();
  const estadoSeleccionado = filtroEstado.value;

  const resultados = solicitudes
    .map((solicitud, indice) => ({ solicitud, indice }))
    .filter(({ solicitud }) => {
      const coincideTexto =
        solicitud.equipo.toLowerCase().includes(texto) ||
        solicitud.descripcion.toLowerCase().includes(texto) ||
        solicitud.reportado.toLowerCase().includes(texto);
      const coincideEstado = !estadoSeleccionado || solicitud.estado === estadoSeleccionado;
      return coincideTexto && coincideEstado;
    });

  tabla.innerHTML = "";

  resultados.forEach(({ solicitud, indice }) => {
    const fila = document.createElement("tr");
    const valores = [
      String(indice + 1),
      solicitud.equipo,
      solicitud.reportado,
      solicitud.fecha
    ];

    valores.forEach(valor => {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    });

    const celdaDescripcion = document.createElement("td");
    celdaDescripcion.className = "descripcion";
    celdaDescripcion.textContent = solicitud.descripcion;
    fila.appendChild(celdaDescripcion);

    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = `estado ${solicitud.estado === "Resuelto" ? "estado-resuelto" : "estado-pendiente"}`;
    etiqueta.textContent = solicitud.estado;
    celdaEstado.appendChild(etiqueta);
    fila.appendChild(celdaEstado);

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "acciones-col";

    if (esAdministrador) {
      const grupo = document.createElement("div");
      grupo.className = "acciones-fila";

      const btnEstado = document.createElement("button");
      btnEstado.className = "btn-mini btn-estado";
      btnEstado.type = "button";
      btnEstado.textContent = solicitud.estado === "Pendiente" ? "Resolver" : "Reabrir";
      btnEstado.addEventListener("click", () => cambiarEstado(indice));

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-mini btn-editar";
      btnEditar.type = "button";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => editarSolicitud(indice));

      const btnBorrar = document.createElement("button");
      btnBorrar.className = "btn-mini btn-borrar";
      btnBorrar.type = "button";
      btnBorrar.textContent = "Eliminar";
      btnBorrar.addEventListener("click", () => eliminarSolicitud(indice));

      grupo.append(btnEstado, btnEditar, btnBorrar);
      celdaAcciones.appendChild(grupo);
    } else {
      celdaAcciones.textContent = "Solo consulta";
    }

    fila.appendChild(celdaAcciones);
    tabla.appendChild(fila);
  });

  vacio.classList.toggle("oculto", resultados.length > 0);
  vacio.textContent = resultados.length === 0 && solicitudes.length > 0
    ? "No hay solicitudes que coincidan con la búsqueda."
    : "Todavía no hay solicitudes registradas.";

  document.getElementById("total").textContent = solicitudes.length;
  document.getElementById("pendientes").textContent =
    solicitudes.filter(s => s.estado === "Pendiente").length;
  document.getElementById("resueltas").textContent =
    solicitudes.filter(s => s.estado === "Resuelto").length;
  document.getElementById("contador").textContent =
    `Mostrando ${resultados.length} de ${solicitudes.length} solicitud(es)`;
}

// Cambia el estado entre Pendiente y Resuelto.
function cambiarEstado(indice) {
  if (!esAdministrador) return;
  solicitudes[indice].estado =
    solicitudes[indice].estado === "Pendiente" ? "Resuelto" : "Pendiente";
  guardarDatos();
  dibujarTabla();
}

// Carga una solicitud en el formulario para modificarla.
function editarSolicitud(indice) {
  if (!esAdministrador) return;
  const solicitud = solicitudes[indice];
  equipo.value = solicitud.equipo;
  reportado.value = solicitud.reportado;
  fecha.value = solicitud.fecha;
  descripcion.value = solicitud.descripcion;
  indiceEdicion.value = String(indice);
  tituloForm.textContent = "Editar solicitud";
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.classList.remove("oculto");
  mensaje("Modifica los datos y guarda los cambios.", "exito");
  panelFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Elimina una solicitud con confirmación.
function eliminarSolicitud(indice) {
  if (!esAdministrador) return;
  if (!confirm("¿Deseas eliminar esta solicitud de soporte?")) return;
  solicitudes.splice(indice, 1);
  guardarDatos();
  dibujarTabla();
  limpiarFormulario();
  mensaje("Solicitud eliminada correctamente.", "exito");
}

// EVENTOS DE LA INTERFAZ
btnInvitado.addEventListener("click", () => mostrarSistema("Invitado"));
btnMostrarLogin.addEventListener("click", () => {
  login.classList.toggle("oculto");
  clave.focus();
});
login.addEventListener("submit", evento => {
  evento.preventDefault();
  if (clave.value === CLAVE_ADMIN) {
    errorLogin.textContent = "";
    mostrarSistema("Administrador");
  } else {
    errorLogin.textContent = "Contraseña incorrecta.";
    clave.select();
  }
});
btnSalir.addEventListener("click", volverPortada);
form.addEventListener("submit", guardarSolicitud);
btnLimpiar.addEventListener("click", () => limpiarFormulario());
btnCancelar.addEventListener("click", () => limpiarFormulario());
buscar.addEventListener("input", dibujarTabla);
filtroEstado.addEventListener("change", dibujarTabla);
document.getElementById("btnImprimir").addEventListener("click", () => window.print());

// Fecha actual como valor inicial del formulario.
fecha.value = new Date().toISOString().slice(0, 10);
dibujarTabla();
