// scripts/ia.js
// Sugerencia de IA minimalista que NO toca tu lógica existente.
// - Si el server IA está (http://localhost:3002 o 3001), lo usa.
// - Si no, devuelve una idea MOCK y una imagen por defecto.
// - Completa la descripción si está vacía y la imagen si no pusiste URL.

// Helpers
const _q = (sel, ctx = document) => ctx.querySelector(sel);

function setIaMsg(text) {
  const box = _q("#iaMsg");
  if (!box) return;
  box.textContent = text || "";
}

function imagenPorDefecto(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("cocin") || t.includes("receta")) {
    return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200";
  }
  if (t.includes("guitarra") || t.includes("música") || t.includes("cantar")) {
    return "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200";
  }
  if (t.includes("leer") || t.includes("libro")) {
    return "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200";
  }
  if (t.includes("estudi") || t.includes("aprender") || t.includes("program")) {
    return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200";
  }
  if (t.includes("gim") || t.includes("correr") || t.includes("deport")) {
    return "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200";
  }
  if (t.includes("viaje") || t.includes("playa")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";
  }
  return "https://images.unsplash.com/photo-1496302662116-45b9309ccdd9?q=80&w=1200";
}

async function postJSON(url, body, timeoutMs = 7000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

async function pedirSugerenciaIA(title, description) {
  const BASES = ["http://localhost:3002", "http://localhost:3001"];
  for (const base of BASES) {
    try {
      const data = await postJSON(base + "/suggest", { title, description });
      if (data && data.suggestion) return data.suggestion;
    } catch (_) {}
  }
  // MOCK local si no hay server
  const idea = (title || "").toLowerCase().includes("cocin")
    ? "Preparar pastas caseras con salsa rápida (tomate, ajo, albahaca) y foto del emplatado."
    : `Hacer 25 minutos sobre "${title || "la actividad"}" y anotar 1 mejora concreta.`;
  return { idea, imagen: imagenPorDefecto(title) };
}

// Bootstrap IA
window.addEventListener("DOMContentLoaded", () => {
  const btn = _q("#sugerirIA");
  const titulo = _q("#titulo");
  const descripcion = _q("#descripcion");
  const imagen = _q("#imagen");

  if (!btn) return;

  // limpiar mensajito al tipear
  [titulo, descripcion, imagen].forEach((el) =>
    el && el.addEventListener("input", () => setIaMsg(""))
  );

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const title = (titulo?.value || "").trim();
    const desc = (descripcion?.value || "").trim();

    setIaMsg("Generando sugerencia…");
    try {
      const s = await pedirSugerenciaIA(title, desc);
      setIaMsg("Idea: " + (s.idea || "—"));

      // completa campos solo si están vacíos
      if (descripcion && !descripcion.value && s.idea) {
        descripcion.value = s.idea;
      }
      if (imagen && !imagen.value) {
        imagen.value = s.imagen || imagenPorDefecto(title);
      }
    } catch {
      setIaMsg("No pude generar la sugerencia.");
    }
  });
});
