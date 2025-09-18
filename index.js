// Utilidades
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Estado + storage
const storageKey = 'm1-actividades';
const state = { actividades: [] };

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
  list.innerHTML = '';
  state.actividades.forEach((a, i) => list.appendChild(makeCard(a, i)));
}

function setError(msg){
  const box = $('#mensajeError');
  box.textContent = msg || '';
}

// Acciones
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

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('anio');
  if (y) y.textContent = new Date().getFullYear();
  const form = document.getElementById('formActividad');
  if (form) form.addEventListener('submit', onSubmit);
  const limpiar = document.getElementById('limpiarActividades');
  if (limpiar) limpiar.addEventListener('click', onClear);
  document.addEventListener('click', onClickGlobal);
  load();
});
