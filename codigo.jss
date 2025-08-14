  <script>
    const usuarios = [{usuario:"David Vargas R.",password:"1234"}];
    function showSection(id) {
      document.querySelectorAll('.frame').forEach(f => f.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');
    }

    window.addEventListener('DOMContentLoaded', () => {
     
      /* Login */
      // --- NAVEGACIÓN (Dashboard → Módulo Clientes)
document.getElementById('modClientes').onclick = () => {
  showSection('clientsModule');
  // Al entrar al módulo, mostramos la pantalla de inicio (dos tarjetas)
  document.getElementById('clientsHome')?.classList.remove('hidden');
  document.getElementById('clientsMenu')?.classList.add('hidden');
  document.getElementById('clientsList')?.classList.add('hidden');
};
  // === Navegación: Dashboard → Módulo Permisionarios ===
document.getElementById('modPerm').onclick = () => {
  showSection('permModule');              // muestra el frame de Permisionarios
  renderTablaPerms();                     // pinta/actualiza la tabla
};

// === “BD” local simple de permisionarios ===
const srPermKey = 'sr_permisionarios';
function getPerms(){ try { return JSON.parse(localStorage.getItem(srPermKey)) || []; } catch { return []; } }
function setPerms(arr){ localStorage.setItem(srPermKey, JSON.stringify(arr)); }

// === Render de la tabla de Permisionarios ===
function renderTablaPerms(filtro=''){
  const tbody = document.querySelector('#tablaPerms tbody');
  if(!tbody) return;

  const data = getPerms();
  const q = (filtro||'').toLowerCase();

  const fil = data.filter(p =>
    (!q) ||
    (String(p.id||'').toLowerCase().includes(q) ||
     (p.nombre||'').toLowerCase().includes(q) ||
     (p.rfc||'').toLowerCase().includes(q))
  );

  tbody.innerHTML = fil.map(p => `
    <tr>
      <td>${p.id || ''}</td>
      <td>${p.nombre || ''}</td>
      <td>${p.rfc || ''}</td>
      <td>${p.estatus || 'Activo'}</td>
      <td class="actions">
        <span class="icon-btn btnPermEdit" title="Editar" data-id="${p.id}">✏️</span>
        <span class="icon-btn btnPermDelete btnDelete" title="Eliminar" data-id="${p.id}">🗑️</span>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5">Sin registros</td></tr>`;

  // Listeners por fila
  tbody.querySelectorAll('.btnPermDelete').forEach(btn => {
    btn.addEventListener('click', () => openDeletePerm(btn.dataset.id));
  });
  tbody.querySelectorAll('.btnPermEdit').forEach(btn => {
    btn.addEventListener('click', () => editPerm(btn.dataset.id));
  });
}

// === Buscar en la lista de Permisionarios ===
document.getElementById('searchPerm')?.addEventListener('input', (e) => {
  renderTablaPerms(e.target.value);
});

// === Volver al Dashboard desde Permisionarios ===
document.getElementById('btnPermVolver')?.addEventListener('click', () => {
  showSection('dashboard');
});

// === Eliminar Permisionario (reusa tu modal de confirmación) ===
let deletePermId = null;
function openDeletePerm(id){
  deletePermId = id;
  // Reutilizamos el mismo modal de confirmación existente
  const confirmDeleteModal = document.getElementById('confirmDeleteModal');
  confirmDeleteModal.classList.remove('hidden');
  confirmDeleteModal.style.display = 'flex';

  // Aseguramos handlers locales:
  const yes = document.getElementById('deleteConfirmYes');
  const no  = document.getElementById('deleteConfirmNo');

  const onYes = () => {
    const arr = getPerms();
    const idx = arr.findIndex(p => p.id === deletePermId);
    if(idx >= 0){ arr.splice(idx,1); setPerms(arr); renderTablaPerms(); }
    cleanup();
  };
  const onNo = cleanup;

  function cleanup(){
    // Cerramos modal
    confirmDeleteModal.classList.add('hidden');
    confirmDeleteModal.style.display = 'none';
    // Quitamos estos listeners puntuales para no duplicar
    yes.removeEventListener('click', onYes);
    no.removeEventListener('click', onNo);
    deletePermId = null;
  }

  yes.addEventListener('click', onYes);
  no.addEventListener('click', onNo);
}

// === Editar Permisionario (flujo mínimo: por ahora solo alerta) ===
function editPerm(id){
  const perm = getPerms().find(p => p.id === id);
  if(!perm){ return; }
  // Aquí puedes abrir un formulario de edición (similar a "Nuevo Cliente")
  alert(`Editar Permisionario: ${perm.id} - ${perm.nombre}`);
}

// === Utilidad para generar ID consecutivo tipo LTR-PR-01 ===
function generarSiguienteIdPerm(arr){
  const prefijo = 'LTR-PR-';
  const maxNum = arr.reduce((max, p) => {
    const m = (p.id || '').match(/^LTR-PR-(\d+)$/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 0);
  return `${prefijo}${String(maxNum + 1).padStart(2, '0')}`;
}

// (Opcional) Semilla de ejemplo para que veas algo en la tabla la 1ª vez:
if(getPerms().length === 0){
  setPerms([
    { id: 'LTR-PR-01', nombre: 'Permisionario Demo S.A. de C.V.', rfc: 'PDE010101AB1', estatus: 'Activo' },
    { id: 'LTR-PR-02', nombre: 'Transporte Ejemplar S.A.', rfc: 'TEJ020202CD2', estatus: 'Inactivo' }
  ]);
  }
  
  //  Mostrar formulario Nuevo Permisionario 
document.getElementById('btnPermNuevo')?.addEventListener('click', () => {
  // Limpiar formulario
  document.getElementById('permNombre').value = '';
  document.getElementById('permRFC').value = '';
  document.getElementById('permEstatus').value = 'Activo';
  document.getElementById('permContacto').value = '';
 // Algunos campos pueden no existir dependiendo de la versión del formulario
  const licInput = document.getElementById('permLicencia');
  if(licInput) licInput.value = '';
  const vigInput = document.getElementById('permVigencia');
  if(vigInput) vigInput.value = '';


  // Reset de subpestañas
  document.querySelectorAll('#permsMenu .subtab').forEach(t => t.classList.remove('active'));
  document.querySelector('#permsMenu .subtab[data-target="perm-datos"]').classList.add('active');
  document.querySelectorAll('#permsMenu .subcontent').forEach(c => c.classList.remove('active'));
  document.getElementById('perm-datos').classList.add('active');

  // Mostrar formulario y ocultar lista
  document.getElementById('permsList').classList.add('hidden');
  document.getElementById('permsMenu').classList.remove('hidden');
});

//  Subpestañas (Datos / Documentos / Unidades / Comentarios) 
document.querySelectorAll('#permsMenu .subtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#permsMenu .subtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tgt = tab.dataset.target;
    document.querySelectorAll('#permsMenu .subcontent').forEach(c => c.classList.remove('active'));
    document.getElementById(tgt).classList.add('active');
  });
});

// Cancelar (volver a la lista) ===
document.getElementById('btnPermCancelar')?.addEventListener('click', () => {
  document.getElementById('permsMenu').classList.add('hidden');
  document.getElementById('permsList').classList.remove('hidden');
});

// Guardar Permisionario ===
document.getElementById('btnPermGuardar')?.addEventListener('click', () => {
  const nombre   = document.getElementById('permNombre').value.trim();
  const rfc      = document.getElementById('permRFC').value.trim();
  const estatus  = document.getElementById('permEstatus').value;
  const contacto = document.getElementById('permContacto').value.trim();
  const licencia = document.getElementById('permLicencia')?.value.trim() || '';
  const vigencia = document.getElementById('permVigencia')?.value || '';
  const unidades = document.getElementById('permUnidades').value.trim();
  const notas    = document.getElementById('permNotas').value.trim();

  if(!nombre || !rfc){
    alert('Por favor, completa al menos Nombre/Razón social y RFC.');
    return;
  }

  const arr = getPerms();
  const id = generarSiguienteIdPerm(arr);
      

  arr.push({
    id, nombre, rfc, estatus,
    contacto, licencia, vigencia, unidades, notas
  });
  setPerms(arr);
 

 
  // Feedback (puedes reemplazar por tu modal con éxito)
  alert(`¡Permisionario guardado!\nID: ${id}\nNombre: ${nombre}`);

  // Volver a la lista y refrescar
  document.getElementById('permsMenu').classList.add('hidden');
  document.getElementById('permsList').classList.remove('hidden');
  renderTablaPerms();
});
    

// --- Helpers de vistas dentro del módulo de clientes (HOISTED/FUERA de cualquier click)
const clientsHome = document.getElementById('clientsHome');
const clientsMenu = document.getElementById('clientsMenu');
const clientsList = document.getElementById('clientsList');

function showInClientsModule(el){
  [clientsHome, clientsMenu, clientsList].forEach(x => x && x.classList.add('hidden'));
  el && el.classList.remove('hidden');
}

// “BD” local simple de clientes (HOISTED)
const srStoreKey = 'sr_clientes';
let editingClientId = null;
function getClientes(){ try { return JSON.parse(localStorage.getItem(srStoreKey)) || []; } catch { return []; } }
function setClientes(arr){ localStorage.setItem(srStoreKey, JSON.stringify(arr)); }

function renderTablaClientes(filtro=''){
  const tbody = document.querySelector('#tablaClientes tbody');
  if(!tbody) return;
  const data = getClientes();
  const q = (filtro||'').toLowerCase();
  const fil = data.filter(c =>
    (!q) || (c.nombre?.toLowerCase().includes(q) || c.rfc?.toLowerCase().includes(q) || String(c.id||'').toLowerCase().includes(q))
  );

  tbody.innerHTML = fil.map(c => `
    <tr>
      <td><span class="client-id-link" data-id="${c.id}">${c.id || ''}</span></td>
      <td>${c.nombre || ''}</td>
      <td>${c.rfc || ''}</td>
      <td>${c.estatus || 'Activo'}</td>
      <td class="actions">
              <span class="icon-btn btnEdit" title="Editar" data-id="${c.id}">✏️</span>
        <span class="icon-btn btnDelete" title="Eliminar" data-id="${c.id}">🗑️</span>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5">Sin registros</td></tr>`;

  // Listeners (si prefieres mantenerlos así)
  tbody.querySelectorAll('.btnDelete').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
  });
   tbody.querySelectorAll('.btnEdit').forEach(btn => {
    btn.addEventListener('click', () => editCliente(btn.dataset.id));
  });
  tbody.querySelectorAll('.client-id-link').forEach(link => {
    link.addEventListener('click', () => mostrarDetalleCliente(link.dataset.id));
  });
}
// --- Eliminar cliente ---
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const deleteConfirmYes = document.getElementById('deleteConfirmYes');
const deleteConfirmNo  = document.getElementById('deleteConfirmNo');
let deleteId = null;

function openDeleteModal(id){
  deleteId = id;
  confirmDeleteModal.classList.remove('hidden');
  confirmDeleteModal.style.display = 'flex';
}
function closeDeleteModal(){
  confirmDeleteModal.classList.add('hidden');
  confirmDeleteModal.style.display = 'none';
  deleteId = null;
}
deleteConfirmYes?.addEventListener('click', () => {
  if(deleteId){
    const arr = getClientes();
    const idx = arr.findIndex(c => c.id === deleteId);
    if(idx >= 0){
      arr.splice(idx,1);
      setClientes(arr);
      renderTablaClientes();
    }
  }
  closeDeleteModal();
});
deleteConfirmNo?.addEventListener('click', closeDeleteModal);
confirmDeleteModal?.querySelector('.close')?.addEventListener('click', closeDeleteModal);
window.addEventListener('click', e => { if(e.target === confirmDeleteModal) closeDeleteModal(); });

// --- Editar cliente ---
function editCliente(id){
  const cliente = getClientes().find(c => c.id === id);
  if(!cliente) return;
  editingClientId = id;
  document.getElementById('tituloCliente').textContent = 'Editar Cliente';
  showInClientsModule(clientsMenu);
  document.querySelector('.sub-tab[data-content="tab-datos"]')?.click();
  limpiarFormularioCliente();
  document.getElementById('inpNombre').value = cliente.nombre || '';
  document.getElementById('selEstatus').value = cliente.estatus || 'Activo';
  document.getElementById('inpRFC').value = cliente.rfc || '';
  document.getElementById('txtDireccion').value = cliente.domicilio || '';
  document.getElementById('txtComentario').value = cliente.comentario || '';
  (cliente.docs || []).forEach((doc, idx) => {
    const st = document.getElementById(`status${idx+1}`);
    if(st){
      if(doc.estatus){
        st.textContent = '✅ Sí';
        st.classList.remove('status-no');
        st.classList.add('status-yes');
      } else {
        st.textContent = '❌ No';
        st.classList.remove('status-yes');
        st.classList.add('status-no');
      }
    }
  });
  const tarifasBody = document.querySelector('#tablaTarifas tbody');
  if(tarifasBody){
    tarifasBody.innerHTML = '';
    (cliente.tarifas || []).forEach(t => {
      const tr = document.createElement('tr');
      tr.dataset.info = JSON.stringify(t);
      const cOrigenDestino = `${t.estadoOrigen} - ${t.estadoDestino}`;
      const cTipo = t.tipoUnidad;
      const cTarifa = Number(t.tarifa).toLocaleString('es-MX', {style:'currency', currency:'MXN'});
      const cCred  = t.diasCredito || 0;
      const cKm    = t.kmRecorrer || 0;
      tr.innerHTML = `<td>${cOrigenDestino}</td><td>${cTipo}</td><td>${cTarifa}</td><td>${cCred}</td><td>${cKm}</td><td><span class="icon-btn edit-tarifa" title="Editar">✏️</span></td>`;
      tarifasBody.appendChild(tr);
    });
  }
}

      
// Limpiar formularios del apartado "Nuevo Cliente"
function limpiarFormularioCliente(){
  if(!clientsMenu) return;
  clientsMenu.querySelectorAll('input, textarea').forEach(el => {
    el.value = '';
    if(el.type === 'file'){ el.value = ''; }
  });
  clientsMenu.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
  // Reinicia los estados de documentación
  clientsMenu.querySelectorAll('.status').forEach(st => {
    st.textContent = '❌ No';
    st.classList.remove('status-yes');
    st.classList.add('status-no');
  });
  // Limpia la tabla de tarifas
  const tarifasBody = document.querySelector('#tablaTarifas tbody');
  if(tarifasBody) tarifasBody.innerHTML = '';
}

// Botón “Nuevo Cliente” (tarjeta izquierda)
document.getElementById('btnNuevoCliente')?.addEventListener('click', () => {
  editingClientId = null;
  limpiarFormularioCliente();
  document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
  showInClientsModule(clientsMenu);
  // Activa la subpestaña “Datos”
  document.querySelector('.sub-tab[data-content="tab-datos"]')?.click();
});

// Botón “CLIENTES” (tarjeta derecha)
document.getElementById('btnVerClientes')?.addEventListener('click', () => {
   editingClientId = null;
  document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
  showInClientsModule(clientsList);
  renderTablaClientes(); // pinta/actualiza la tabla
  limpiarFormularioCliente(); // limpia formulario de nuevo cliente
});

      
// Volver al dashboard desde el menú principal de Clientes ---
document.getElementById('btnClientesBack')?.addEventListener('click', () => {
  showSection('dashboard');
});

         
// Botones dentro de la ventana “Clientes”
document.getElementById('btnVolverHome')?.addEventListener('click', () => {
  editingClientId = null;
  document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
  showInClientsModule(clientsHome);
});

document.getElementById('btnNuevoDesdeLista')?.addEventListener('click', () => {
  editingClientId = null;
  limpiarFormularioCliente();
  document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
  showInClientsModule(clientsMenu);
  document.querySelector('.sub-tab[data-content="tab-datos"]')?.click();
});

// Búsqueda en la lista
document.getElementById('searchCli')?.addEventListener('input', (e) => {
  renderTablaClientes(e.target.value);
});

      const last = localStorage.getItem('sr_last_user');
      if (last) document.getElementById('usuario').value = last;
      document.getElementById('btnGuardar').onclick = () => {
        localStorage.setItem('sr_last_user', document.getElementById('usuario').value);
        alert('Usuario guardado');
      };
      document.getElementById('btnEntrar').onclick = () => {
        const u = document.getElementById('usuario').value;
        const p = document.getElementById('password').value;
        if (usuarios.find(x => x.usuario === u && x.password === p)) showSection('dashboard');
        else alert('Usuario o contraseña incorrectos');
      };

      document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(tab.dataset.content).classList.add('active');
        };
      });
      document.getElementById('exitClient').onclick = () => showSection('dashboard');
// Mostrar/ocultar botón Guardar según la pestaña activa
const saveBtn = document.getElementById('saveClient');
function updateSaveButtonVisibility() {
  const activeTab = document.querySelector('.sub-tab.active');
  if (activeTab && activeTab.dataset.content === 'tab-comentario') {
    saveBtn.style.display = 'inline-block';
  } else {
    saveBtn.style.display = 'none';
  }
}
updateSaveButtonVisibility();

document.querySelectorAll('.sub-tab').forEach(tab => {
  tab.addEventListener('click', updateSaveButtonVisibility);
});

// Guardar cliente y mostrar confirmación ---
const clienteModal = document.getElementById('clienteModal');
const clienteModalClose = clienteModal.querySelector('.close');
const clienteModalBtnCerrar = clienteModal.querySelector('.btn-cerrar');

// Función para generar siguiente ID consecutivo
function generarSiguienteId(arr) {
  const prefijo = 'LTR-CL-';
  const maxNum = arr.reduce((max, c) => {
    const m = (c.id || '').match(/^LTR-CL-(\d+)$/);
    const n = m ? parseInt(m[1], 10) : 0;
    return n > max ? n : max;
  }, 0);
  return `${prefijo}${String(maxNum + 1).padStart(2, '0')}`;
}

saveBtn.addEventListener('click', () => {
  const nombre = (document.getElementById('inpNombre')?.value || '').trim();
  const rfc = (document.getElementById('inpRFC')?.value || '').trim();
  const estatus = document.getElementById('selEstatus')?.value || 'Activo';
  const domicilio = (document.getElementById('txtDireccion')?.value || '').trim();
const comentario = (document.getElementById('txtComentario')?.value || '').trim();

  const docNames = [
    'Acta Constitutiva',
    'Poder Rep. Legal',
    'Comprobante de Domicilio',
    'Constancia de Situación Fiscal',
    'INE Rep. Legal',
    'Contrato'
  ];
  const docs = docNames.map((nombre, idx) => {
    const st = document.getElementById(`status${idx+1}`);
    return { nombre, estatus: st?.classList.contains('status-yes') };
  });

  const tarifas = Array.from(document.querySelectorAll('#tablaTarifas tbody tr')).map(tr => {
    try { return JSON.parse(tr.dataset.info || '{}'); } catch { return {}; }
  });
  // Validación básica
  if (!nombre || !rfc) {
    alert('Por favor llena al menos Nombre/Razón Social y RFC.');
    return;
  }

  const arr = getClientes();
  let id = editingClientId;
  if(editingClientId){
    const idx = arr.findIndex(c => c.id === editingClientId);
    if(idx >= 0){
      arr[idx] = { id: editingClientId, nombre, rfc, estatus, domicilio, comentario, docs, tarifas };
    }
  } else {
    id = generarSiguienteId(arr);
    arr.push({ id, nombre, rfc, estatus, domicilio, comentario, docs, tarifas });
  }
  setClientes(arr);

  // 🔄 Actualizar tabla en vista "Clientes registrados"
  renderTablaClientes();

  // Llenar modal de confirmación
  document.getElementById('idClienteTexto').textContent = id;
  document.getElementById('nombreCliente').textContent = nombre;
  document.getElementById('rfcCliente').textContent = rfc;
  document.getElementById('domicilioCliente').textContent = domicilio;

  // Mostrar modal
  clienteModal.classList.remove('hidden');
  clienteModal.style.display = 'flex';
  editingClientId = null;

 document.getElementById('tituloCliente').textContent = 'Nuevo Cliente';
});

// Cerrar modal de confirmación
function cerrarClienteModal() {
  clienteModal.classList.add('hidden');
  clienteModal.style.display = 'none';
}
clienteModalClose.addEventListener('click', cerrarClienteModal);
clienteModalBtnCerrar.addEventListener('click', cerrarClienteModal);
window.addEventListener('click', (e) => {
  if (e.target === clienteModal) cerrarClienteModal();
});

clienteModalClose.addEventListener('click', () => {
  clienteModal.classList.add('hidden');
  clienteModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === clienteModal) {
    clienteModal.classList.add('hidden');
    clienteModal.style.display = 'none';
  }
});

      /* Documentación */
      document.querySelectorAll('.folder').forEach(btn => {
        btn.onclick = () => {
          const row = btn.dataset.row;
          const inp = document.getElementById('file' + row);
          inp.click();
          inp.onchange = () => {
            const st = document.getElementById('status' + row);
            st.textContent = '✅ Sí';
            st.classList.remove('status-no');
            st.classList.add('status-yes');
          };
        };
      });
      document.querySelectorAll('.view').forEach(btn => {
        btn.onclick = () => {
          const row = btn.dataset.row;
          const inp = document.getElementById('file' + row);
          if (inp.files.length) {
            const url = URL.createObjectURL(inp.files[0]);
            window.open(url);
          } else {
            alert('No hay archivo cargado aún');
          }
        };
      });
  document.querySelectorAll('.perm-folder').forEach(btn => {
        btn.onclick = () => {
          const row = btn.dataset.row;
          const inp = document.getElementById('permFile' + row);
          inp.click();
          inp.onchange = () => {
            const st = document.getElementById('permStatus' + row);
            st.textContent = '✅ Sí';
            st.classList.remove('status-no');
            st.classList.add('status-yes');
          };
        };
      });
      document.querySelectorAll('.perm-view').forEach(btn => {
        btn.onclick = () => {
          const row = btn.dataset.row;
          const inp = document.getElementById('permFile' + row);
          if (inp.files.length) {
            const url = URL.createObjectURL(inp.files[0]);
            window.open(url);
          } else {
            alert('No hay archivo cargado aún');
          }
        };
      });
      /* --- Tarifas / Modal --- */
      const modal = document.getElementById('tarifaModal');
      const tablaTarifas = document.querySelector('#tablaTarifas tbody');
      // fila en edición (si es null, se creará una nueva)
      let editingRow = null;
      const tituloModal = modal.querySelector('h3');

      function mostrarModal() {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
      function ocultarModal() {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      }
      function activarTabTarifas() {
        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.sub-tab[data-content="tab-tarifas"]').classList.add('active');
        document.getElementById('tab-tarifas').classList.add('active');
      }
      function limpiarFormulario() {
        document.getElementById('estadoOrigen').value = '';
        document.getElementById('municipioOrigen').value = '';
        document.getElementById('estadoDestino').value = '';
        document.getElementById('municipioDestino').value = '';
        document.getElementById('tipoUnidad').selectedIndex = 0;
        document.getElementById('diasCredito').value = '';
        document.getElementById('kmRecorrer').value = '';
        document.getElementById('tarifa').value = '';
      }
      function cargarFormulario(datos) {
        document.getElementById('estadoOrigen').value   = datos.estadoOrigen || '';
        document.getElementById('municipioOrigen').value= datos.municipioOrigen || '';
        document.getElementById('estadoDestino').value  = datos.estadoDestino || '';
        document.getElementById('municipioDestino').value= datos.municipioDestino || '';
        document.getElementById('tipoUnidad').value     = datos.tipoUnidad || '';
        document.getElementById('diasCredito').value    = datos.diasCredito ?? '';
        document.getElementById('kmRecorrer').value     = datos.kmRecorrer ?? '';
        document.getElementById('tarifa').value         = datos.tarifa ?? '';
      }
      function guardarTarifa() {
        const datos = {
          estadoOrigen: document.getElementById('estadoOrigen').value.trim(),
          municipioOrigen: document.getElementById('municipioOrigen').value.trim(),
          estadoDestino: document.getElementById('estadoDestino').value.trim(),
          municipioDestino: document.getElementById('municipioDestino').value.trim(),
          tipoUnidad: document.getElementById('tipoUnidad').value,
          diasCredito: document.getElementById('diasCredito').value,
          kmRecorrer: document.getElementById('kmRecorrer').value,
          tarifa: document.getElementById('tarifa').value
        };

        if (!datos.estadoOrigen || !datos.estadoDestino || !datos.tipoUnidad || !datos.tarifa) {
          alert('Por favor complete todos los campos obligatorios (*)');
          return;
        }

        const cOrigenDestino = `${datos.estadoOrigen} - ${datos.estadoDestino}`;
        const cTipo = datos.tipoUnidad;
        const cTarifa = Number(datos.tarifa).toLocaleString('es-MX', {style:'currency', currency:'MXN'});
        const cCred  = datos.diasCredito || 0;
        const cKm    = datos.kmRecorrer || 0;

        if (editingRow) {
          // Actualiza celdas existentes
          editingRow.cells[0].textContent = cOrigenDestino;
          editingRow.cells[1].textContent = cTipo;
          editingRow.cells[2].textContent = cTarifa;
          editingRow.cells[3].textContent = cCred;
          editingRow.cells[4].textContent = cKm;
          editingRow.dataset.info = JSON.stringify(datos);
        } else {
          const tr = document.createElement('tr');
          tr.dataset.info = JSON.stringify(datos);
          tr.innerHTML = `
            <td>${cOrigenDestino}</td>
            <td>${cTipo}</td>
            <td>${cTarifa}</td>
            <td>${cCred}</td>
            <td>${cKm}</td>
            <td><span class="icon-btn edit-tarifa" title="Editar">✏️</span></td>
          `;
          tablaTarifas.appendChild(tr);
        }

        ocultarModal();
        limpiarFormulario();
        activarTabTarifas();
        // Reiniciar estado de edición
        editingRow = null;
        tituloModal.textContent = 'Agregar Nueva Ruta/Tarifa';
      }

      const agregarBtn = document.querySelector('.add-route');
      if (agregarBtn) agregarBtn.addEventListener('click', mostrarModal);
      if (agregarBtn) agregarBtn.addEventListener('click', () => {
        editingRow = null;
        tituloModal.textContent = 'Agregar Nueva Ruta/Tarifa';
        limpiarFormulario();
      });

      document.querySelector('#tarifaModal .close').addEventListener('click', () => { ocultarModal(); activarTabTarifas(); });
      document.querySelector('#tarifaModal .btn-cancelar').addEventListener('click', () => { ocultarModal(); activarTabTarifas(); });
      document.querySelector('#tarifaModal .btn-guardar').addEventListener('click', guardarTarifa);

      window.addEventListener('click', (e) => { if (e.target === modal) ocultarModal(); });

          // Delegación: clic en ícono ✏️ para editar
        tablaTarifas.addEventListener('click', (e) => {
          const btn = e.target.closest('.edit-tarifa');
          if (!btn) return;
          const row = btn.closest('tr');
          try {
            const datos = JSON.parse(row.dataset.info || '{}');
            cargarFormulario(datos);
            editingRow = row;
            tituloModal.textContent = 'Editar Ruta/Tarifa';
            mostrarModal();
          } catch {
            alert('No fue posible cargar los datos de la fila para edición.');
          }
        });
      function mostrarModalConfirmacion(cliente) {
  document.getElementById('idClienteTexto').textContent = cliente.id;
  document.getElementById('nombreCliente').textContent = cliente.nombre;
  document.getElementById('rfcCliente').textContent = cliente.rfc;
  document.getElementById('domicilioCliente').textContent = cliente.domicilio;

  document.getElementById('clienteModal').classList.remove('hidden');
  document.getElementById('clienteModal').style.display = 'flex';
}

document.querySelector('#clienteModal .btn-cerrar').addEventListener('click', () => {
  document.getElementById('clienteModal').classList.add('hidden');
  document.getElementById('clienteModal').style.display = 'none';
});

      
function mostrarDetalleCliente(id){
  const cliente = getClientes().find(c => c.id === id);
  if(!cliente) return;
  const cont = document.getElementById('detalleClienteContenido');
  const docList = (cliente.docs || []).map(d => `<li>${d.nombre}: ${d.estatus ? 'Sí' : 'No'}</li>`).join('');
  const tarifasTabla = (cliente.tarifas && cliente.tarifas.length)
    ? `<table class="doc-table"><thead><tr><th>Origen - Destino</th><th>Tipo de Unidad</th><th>Tarifa</th><th>Días de Crédito</th><th>Km</th></tr></thead><tbody>${cliente.tarifas.map(t => `<tr><td>${t.estadoOrigen} - ${t.estadoDestino}</td><td>${t.tipoUnidad}</td><td>${Number(t.tarifa).toLocaleString('es-MX',{style:'currency',currency:'MXN'})}</td><td>${t.diasCredito}</td><td>${t.kmRecorrer}</td></tr>`).join('')}</tbody></table>`
    : '<p>Sin tarifas registradas</p>';
  cont.innerHTML = `
    <h3 class="section-title">Datos Generales</h3>
    <p><strong>Nombre/Razón Social:</strong> ${cliente.nombre || ''}</p>
    <p><strong>RFC:</strong> ${cliente.rfc || ''}</p>
    <p><strong>Estatus:</strong> ${cliente.estatus || ''}</p>
    <p><strong>Domicilio:</strong> ${cliente.domicilio || ''}</p>
    <h3 class="section-title">Contactos</h3>
    <p><strong>Operaciones:</strong> ${((cliente.contactos||{}).operaciones||{}).nombre||""} / ${((cliente.contactos||{}).operaciones||{}).email||""} / ${((cliente.contactos||{}).operaciones||{}).tel||""}</p>
    <p><strong>Administración:</strong> ${((cliente.contactos||{}).administracion||{}).nombre||""} / ${((cliente.contactos||{}).administracion||{}).email||""} / ${((cliente.contactos||{}).administracion||{}).tel||""}</p>
    <p><strong>Comercial:</strong> ${((cliente.contactos||{}).comercial||{}).nombre||""} / ${((cliente.contactos||{}).comercial||{}).email||""} / ${((cliente.contactos||{}).comercial||{}).tel||""}</p>
    <h3 class="section-title">Tarifas</h3>
    ${tarifasTabla}
    <h3 class="section-title">Documentación</h3>
    <ul>${docList}</ul>
    <h3 class="section-title">Comentarios</h3>
    <p>${cliente.comentario || ''}</p>
  `;
  const modal = document.getElementById('detalleClienteModal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

const detalleModal = document.getElementById('detalleClienteModal');
detalleModal.querySelector('.close').addEventListener('click', () => {
  detalleModal.classList.add('hidden');
  detalleModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === detalleModal) {
    detalleModal.classList.add('hidden');
    detalleModal.style.display = 'none';
  }
});
    });
  </script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<script>
// Importación desde Excel (Clientes, Documentación, Tarifas y Contactos) ---
document.getElementById('btnImportExcel')?.addEventListener('click', () => {
  document.getElementById('excelInput').click();
});
function _norm(s){ return (String(s||'').trim()).replace(/\s+/g,' '); }

document.getElementById('excelInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try{
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });

    const shClientes = wb.Sheets['Clientes'];
    const shDocs     = wb.Sheets['Documentación'];
    const shTarifas  = wb.Sheets['Tarifas'];

    const rowsClientes = shClientes ? XLSX.utils.sheet_to_json(shClientes) : [];
    const rowsDocs     = shDocs     ? XLSX.utils.sheet_to_json(shDocs) : [];
    const rowsTarifas  = shTarifas  ? XLSX.utils.sheet_to_json(shTarifas) : [];

    // Indexar docs y tarifas por RFC
    const docsByRFC = {};
    rowsDocs.forEach(r => { docsByRFC[_norm(r.RFC)] = r; });

    const tarifasByRFC = {};
    rowsTarifas.forEach(r => {
      const rfc = _norm(r.RFC);
      if(!rfc) return;
      (tarifasByRFC[rfc] ||= []).push({
        estadoOrigen: _norm(r['Estado Origen']),
        municipioOrigen: _norm(r['Municipio Origen']),
        estadoDestino: _norm(r['Estado Destino']),
        municipioDestino: _norm(r['Municipio Destino']),
        tipoUnidad: _norm(r['Tipo Unidad']),
        diasCredito: Number(r['Dias Credito']||0),
        kmRecorrer: Number(r['Km Recorrer']||0),
        tarifa: Number(r['Tarifa']||0)
      });
      
    });

    const docNames = [
      'Acta Constitutiva',
      'Poder Rep. Legal',
      'Comprobante de Domicilio',
      'Constancia de Situación Fiscal',
      'INE Rep. Legal',
      'Contrato'
    ];

    const existentes = getClientes();
    const porRFC = {};
    existentes.forEach(c => { if (c.rfc) porRFC[_norm(c.rfc)] = c; });

    rowsClientes.forEach(r => {
      const nombre = _norm(r['Nombre'] || r['Nombre/Razón Social']);
      const rfc    = _norm(r['RFC']);
      if(!nombre || !rfc) return; // requeridos

      const estatus   = _norm(r['Estatus']||'Activo') || 'Activo';
      const domicilio = _norm(r['Domicilio'] || r['Dirección']);
      const comentario= _norm(r['Comentario']);

      // Contactos (opcionales)
      const contactos = {
        operaciones: {
          nombre: _norm(r['Contacto Operaciones (Nombre)']),
          email:  _norm(r['Contacto Operaciones (Email)']),
          tel:    _norm(r['Contacto Operaciones (Tel)']),
        },
        administracion: {
          nombre: _norm(r['Contacto Administración (Nombre)'] || r['Contacto Administracion (Nombre)']),
          email:  _norm(r['Contacto Administración (Email)']  || r['Contacto Administracion (Email)']),
          tel:    _norm(r['Contacto Administración (Tel)']    || r['Contacto Administracion (Tel)']),
        },
        comercial: {
          nombre: _norm(r['Contacto Comercial (Nombre)']),
          email:  _norm(r['Contacto Comercial (Email)']),
          tel:    _norm(r['Contacto Comercial (Tel)']),
        }
      };

      const drow = docsByRFC[rfc] || {};
      const docs = docNames.map(n => ({
        nombre: n,
        estatus: String(drow[n]||'No').toLowerCase().startsWith('s')
      }));

      const tarifas = (tarifasByRFC[rfc] || []).map(t => ({ ...t }));

      const existente = porRFC[rfc];
      if (existente) {
        existente.nombre = nombre;
        existente.estatus = estatus;
        existente.domicilio = domicilio;
        existente.comentario = comentario;
        existente.docs = docs;
        existente.tarifas = tarifas;
        existente.contactos = contactos;
      } else {
        const nuevoId = generarSiguienteId(existentes);
        const nuevo = { id: nuevoId, nombre, rfc, estatus, domicilio, comentario, docs, tarifas, contactos };
        existentes.push(nuevo);
        porRFC[rfc] = nuevo;
      }
    });

    setClientes(existentes);
    renderTablaClientes();
    alert('Importación completada ✅');
    e.target.value = '';
  }catch(err){
    console.error(err);
    alert('No fue posible leer el archivo. Verifica que sea .xlsx y tenga las hojas: Clientes, Documentacion y Tarifas.');
  }
      });
  // Modal "Alta de Unidad Vehicular" =====
(function(){
  const btnAddUnit = document.querySelector('#permsMenu .add-unit');
  const unidadModal = document.getElementById('unidadModal');
  const tablaUnidadesBody = document.querySelector('#tablaUnidades tbody');
      

  // Referencias a inputs
  const $ = (id) => document.getElementById(id);
  const f = {
    tarjeta: $('uTarjetaFile'),
    placas: $('uPlacas'),
    eco: $('uEco'),
    tipo: $('uTipo'),
    vencePoliza: $('uVencePoliza'),
    aseguradora: $('uAseguradora'),
    marca: $('uMarca'),
    anio: $('uAnio'),
    permiso: $('uPermisoSCT'),
  };

  let unidadEditingRow = null; // si no es null, estamos editando

  function limpiarFormUnidad(){
    f.tarjeta.value = '';
    f.placas.value = '';
    f.eco.value = '';
    f.tipo.value = '';
    f.vencePoliza.value = '';
    f.aseguradora.value = '';
    f.marca.value = '';
    f.anio.value = '';
    f.permiso.value = '';
  }

  function mostrarUnidadModal(){
    unidadModal.classList.remove('hidden');
    unidadModal.style.display = 'flex';
  }
  function ocultarUnidadModal(){
    unidadModal.classList.add('hidden');
    unidadModal.style.display = 'none';
  }

  // Abrir modal desde el botón +Agregar Unidad
  btnAddUnit?.addEventListener('click', () => {
    unidadEditingRow = null;
    limpiarFormUnidad();
    // título fijo (si quieres podrías alternarlo a "Editar Unidad")
    unidadModal.querySelector('h3').textContent = 'Alta de Unidad Vehicular';
    mostrarUnidadModal();
  });

  // Cerrar modal (X y Cancelar)
  unidadModal.querySelector('.close')?.addEventListener('click', ocultarUnidadModal);
  unidadModal.querySelector('.btn-cancelar')?.addEventListener('click', ocultarUnidadModal);

  // Guardar (crear/editar fila)
  unidadModal.querySelector('.btn-guardar')?.addEventListener('click', () => {
    const datos = {
      tarjeta: (f.tarjeta.value || '').trim(),
      placas: (f.placas.value || '').trim(),
      eco: (f.eco.value || '').trim(),
      tipo: f.tipo.value,
      vencePoliza: f.vencePoliza.value, // ISO yyyy-mm-dd
      aseguradora: (f.aseguradora.value || '').trim(),
      marca: (f.marca.value || '').trim(),
      anio: f.anio.value ? Number(f.anio.value) : '',
      permiso: (f.permiso.value || '').trim(),
    };

    // Validación mínima
    if(!datos.tarjeta || !datos.placas || !datos.tipo){
      alert('Completa los campos obligatorios: Tarjeta, Placas y Tipo.');
      return;
    }

    const venceLegible = datos.vencePoliza
      ? new Date(datos.vencePoliza + 'T00:00:00').toLocaleDateString('es-MX')
      : '';

    if (unidadEditingRow) {
      // Actualizar fila existente
      unidadEditingRow.cells[0].textContent = datos.tarjeta;
      unidadEditingRow.cells[1].textContent = datos.placas;
      unidadEditingRow.cells[2].textContent = datos.eco;
      unidadEditingRow.cells[3].textContent = datos.tipo;
      unidadEditingRow.cells[4].textContent = venceLegible;
      unidadEditingRow.cells[5].textContent = datos.aseguradora;
      unidadEditingRow.cells[6].textContent = datos.marca;
      unidadEditingRow.cells[7].textContent = datos.anio || '';
      unidadEditingRow.cells[8].textContent = datos.permiso;

      unidadEditingRow.dataset.info = JSON.stringify(datos);
    } else {
      // Crear nueva fila
      const tr = document.createElement('tr');
      tr.dataset.info = JSON.stringify(datos);
      tr.innerHTML = `
        <td>${datos.tarjeta}</td>
        <td>${datos.placas}</td>
        <td>${datos.eco}</td>
        <td>${datos.tipo}</td>
        <td>${venceLegible}</td>
        <td>${datos.aseguradora}</td>
        <td>${datos.marca}</td>
        <td>${datos.anio || ''}</td>
        <td>${datos.permiso}</td>
      `;
      tablaUnidadesBody.appendChild(tr);
    }

    ocultarUnidadModal();
    limpiarFormUnidad();
    unidadEditingRow = null;
  });

  // (Opcional) Cerrar clic afuera
  window.addEventListener('click', (e) => {
    if (e.target === unidadModal) ocultarUnidadModal();
  });

      
  // Habilitar edición al hacer doble clic en una fila
  tablaUnidadesBody?.addEventListener('dblclick', (e) => {
    const row = e.target.closest('tr');
    if(!row) return;
    try{
      const datos = JSON.parse(row.dataset.info || '{}');
      f.tarjeta.value = datos.tarjeta || '';
      f.placas.value = datos.placas || '';
      f.eco.value = datos.eco || '';
      f.tipo.value = datos.tipo || '';
      f.vencePoliza.value = datos.vencePoliza || '';
      f.aseguradora.value = datos.aseguradora || '';
      f.marca.value = datos.marca || '';
      f.anio.value = datos.anio || '';
      f.permiso.value = datos.permiso || '';

      unidadEditingRow = row;
      unidadModal.querySelector('h3').textContent = 'Editar Unidad Vehicular';
      mostrarUnidadModal();
    }catch{
      alert('No fue posible cargar los datos de la unidad para edición.');
    }
  });
})();
      const unidadesTbody = document.querySelector('#tablaUnidades tbody');
  const unidadModal   = document.getElementById('unidadModal');

  // --- File picker de Tarjeta de circulación ---
  const btnPick   = document.getElementById('btnUTarjetaPick');
  const fileInput = document.getElementById('uTarjetaFile');
  const fileName  = document.getElementById('uTarjetaName');

  btnPick?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    fileName.value = fileInput.files?.[0]?.name || '';
  });

  // --- Abrir modal desde "+ Agregar Unidad" si no lo tienes ya conectado ---
  document.querySelector('.add-unit')?.addEventListener('click', () => {
    unidadModal.classList.remove('hidden');
    unidadModal.style.display = 'flex';
  });

  // --- Cerrar modal (X y Cancelar) ---
  unidadModal.querySelector('.close')?.addEventListener('click', closeUnidadModal);
  unidadModal.querySelector('.btn-cancelar')?.addEventListener('click', closeUnidadModal);
  window.addEventListener('click', (e) => { if (e.target === unidadModal) closeUnidadModal(); });
  function closeUnidadModal(){
    unidadModal.classList.add('hidden');
    unidadModal.style.display = 'none';
  }

  // --- Guardar: crear fila con icono 🔍 que abre el archivo adjunto ---
  unidadModal.querySelector('.btn-guardar')?.addEventListener('click', () => {
    // Campos del formulario
    const uTarjetaOK    = fileInput.files && fileInput.files.length > 0;
    const uTarjetaFile  = uTarjetaOK ? fileInput.files[0] : null;
    const uTarjetaName  = fileName.value.trim();

    const uPlacas       = document.getElementById('uPlacas')?.value.trim() || '';
    const uEco          = document.getElementById('uEco')?.value.trim() || '';
    const uTipo         = document.getElementById('uTipo')?.value || '';
    const uVencePoliza  = document.getElementById('uVencePoliza')?.value || '';
    const uAseguradora  = document.getElementById('uAseguradora')?.value.trim() || '';
    const uMarca        = document.getElementById('uMarca')?.value.trim() || '';
    const uAnio         = document.getElementById('uAnio')?.value || '';
    const uPermisoSCT   = document.getElementById('uPermisoSCT')?.value.trim() || '';

    // Validación básica (Tarjeta es obligatoria)
    if (!uTarjetaOK) { alert('Adjunta la Tarjeta de circulación.'); return; }
    if (!uTipo)      { alert('Selecciona el Tipo de unidad.');    return; }

    // Prepara URL temporal para poder visualizar luego
    const tcUrl = URL.createObjectURL(uTarjetaFile);

    // Info serializable mínima para la fila (si lo necesitas para editar más tarde)
    const dataInfo = {
      placas: uPlacas, eco: uEco, tipo: uTipo, vencePoliza: uVencePoliza,
      aseguradora: uAseguradora, marca: uMarca, anio: uAnio, permisoSCT: uPermisoSCT,
      tcName: uTarjetaName
    };

    const tr = document.createElement('tr');
    tr.dataset.info = JSON.stringify(dataInfo);
    tr.dataset.tcUrl = tcUrl;                   // guardamos la URL para abrirla con la lupa
    tr.dataset.tcName = uTarjetaName || '';     // por si quieres mostrar tooltip con el nombre

    // Orden de columnas según tu thead:
    // Tarjeta de Circulación | Placas | Eco | Tipo | Vencimiento Poliza | Aseguradora | Marca | Año | Permiso SCT
    tr.innerHTML = `
      <td title="${uTarjetaName || 'Tarjeta de circulación'}">
        <span class="icon-btn ver-tc" aria-label="Ver Tarjeta de circulación" title="Ver Tarjeta de circulación">🔍</span>
      </td>
      <td>${uPlacas}</td>
      <td>${uEco}</td>
      <td>${uTipo}</td>
      <td>${uVencePoliza || ''}</td>
      <td>${uAseguradora}</td>
      <td>${uMarca}</td>
      <td>${uAnio}</td>
      <td>${uPermisoSCT}</td>
    `;

    unidadesTbody.appendChild(tr);

    // Limpia el formulario del modal para siguiente alta
    fileInput.value = '';
    fileName.value  = '';
    ['uPlacas','uEco','uTipo','uVencePoliza','uAseguradora','uMarca','uAnio','uPermisoSCT']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = (el.tagName === 'SELECT') ? '' : ''; });

    closeUnidadModal();
  });

  // --- Delegación: click en la lupa 🔍 para abrir el archivo ---
  unidadesTbody?.addEventListener('click', (e) => {
    const btn = e.target.closest('.ver-tc');
    if (!btn) return;
    const tr = btn.closest('tr');
    const url = tr?.dataset.tcUrl;
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No hay archivo adjuntado en esta fila.');
    }
  });
})();
</script>
