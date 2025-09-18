// Utilidades
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Estado + storage
const storageKey = 'm1-actividades';
const state = { actividades: [], busqueda: '' };

function load(){
  try{ state.actividades = JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch{ state.actividades = []; }
  render();
}
function save(){ localStorage.setItem(storageKey, JSON.stringify(state.actividades)); }

// Helpers
function urlOrFallback(url){
  if(!url) return 'https://picsum.photos/600/400?grayscale';
  try{ new URL(url); return url; } catch { return 'https://picsum.photos/600/400?blur=2'; }
}

function makeCard({ titulo, descripcion, imagen }, idx){
  const art = document.createElement('article');
  art.className = 'card card-activity';
  art.innerHTML = `
    <img alt="Imagen de actividad" loading="lazy" src="${urlOrFallback(imagen)}" />
    <div>
      <h3 style="font-size: var(--fs-1); margin-bottom: 4px;">${titulo}</h3>
      <p class="lead" style="font-size: var(--fs--1);">${descripcion}</p>
    </div>
    <div class="actions">
      <button class="btn btn-outline" data-remove="${idx}" aria-label="Eliminar ${titulo}">Eliminar</button>
    </div>`;
  return art;
}

function render(){
  const list = $('#listaActividades');
  const term = (state.busqueda || '').toLowerCase();
  const items = state.actividades.filter(a =>
    a.titulo.toLowerCase().includes(term) || a.descripcion.toLowerCase().includes(term)
  );

  list.innerHTML = '';
  items.forEach((a, i) => list.appendChild(makeCard(a, i)));

  const contador = $('#contador');
  if (contador) contador.textContent = `${items.length} ${items.length === 1 ? 'actividad' : 'actividades'}`;
}

function setError(msg){
  const box = $('#mensajeError');
  box.textContent = msg || '';
}

// Acciones: agregar / limpiar / eliminar
function onSubmit(ev){
  ev.preventDefault();
  const titulo = $('#titulo').value.trim();
  const descripcion = $('#descripcion').value.trim();
  const imagen = $('#imagen').value.trim();

  if(!titulo || !descripcion){
    setError('Completá título y descripción 🙂');
    return;
  }
  setError('');
  state.actividades.unshift({ titulo, descripcion, imagen });
  save();
  render();
  ev.target.reset();
  $('#titulo').focus();
}

function onClear(){
  if(confirm('¿Borrar todas las actividades?')){
    state.actividades = [];
    save();
    render();
  }
}

function onClickGlobal(e){
  const btn = e.target.closest('[data-remove]');
  if(!btn) return;
  const idx = Number(btn.dataset.remove);
  state.actividades.splice(idx, 1);
  save();
  render();
}

// Búsqueda
function onSearch(e){
  state.busqueda = e.target.value || '';
  render();
}

// Exportar / Importar JSON
function exportar(){
  const data = JSON.stringify(state.actividades, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'actividades.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importar(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const arr = JSON.parse(reader.result);
      if(!Array.isArray(arr)) throw new Error('Formato inválido');
      // Validación mínima
      const sane = arr.filter(x => x && typeof x.titulo === 'string' && typeof x.descripcion === 'string')
                      .map(x => ({ titulo: x.titulo, descripcion: x.descripcion, imagen: x.imagen || '' }));
      if(sane.length === 0) return alert('No hay actividades válidas en el archivo.');
      if(confirm('Esto reemplazará tus actividades actuales. ¿Continuar?')){
        state.actividades = sane;
        save(); render();
      }
    }catch(e){
      alert('Archivo inválido. Debe ser JSON exportado desde esta app.');
    }
  };
  reader.readAsText(file);
}

// Back-to-top
function onScroll(){
  const btn = $('#backToTop');
  if(!btn) return;
  if (window.scrollY > 200) btn.classList.add('show');
  else btn.classList.remove('show');
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('anio');
  if (y) y.textContent = new Date().getFullYear();

  const form = document.getElementById('formActividad');
  if (form) form.addEventListener('submit', onSubmit);

  const limpiar = document.getElementById('limpiarActividades');
  if (limpiar) limpiar.addEventListener('click', onClear);

  document.addEventListener('click', onClickGlobal);

  const buscar = $('#buscar');
  if (buscar) buscar.addEventListener('input', onSearch);

  const exportarBtn = $('#exportar');
  if (exportarBtn) exportarBtn.addEventListener('click', exportar);

  const importInput = $('#importFile');
  if (importInput) importInput.addEventListener('change', e => importar(e.target.files[0]));

  window.addEventListener('scroll', onScroll);

  load();
  onScroll(); // estado inicial del botón "arriba"
});
