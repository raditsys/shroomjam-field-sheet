// Small worksheet tools; all shared writes are supplied by the collaboration layer.
const COLORS = ['#d5ec76', '#f3a38e', '#84c7de', '#ad9fee', '#f2c96b', '#a7dec2'];
const LIGHT_INK = ['#637818', '#b6412b', '#166784', '#6547a3', '#a36c0d', '#287554'];
const SVG = 'http://www.w3.org/2000/svg';

export function setupSheetTools({sheet, profile, saveStroke, removeStroke, reset}) {
  const $ = selector => document.querySelector(selector);
  const layers = [...document.querySelectorAll('.panel')].map((panel, step) => {
    const layer = document.createElementNS(SVG, 'svg');
    layer.classList.add('drawing-surface');
    layer.setAttribute('viewBox', '0 0 1000 1000');
    layer.setAttribute('preserveAspectRatio', 'none');
    layer.setAttribute('aria-label', 'Shared drawings on page '+(step+1));
    panel.append(layer);
    return layer;
  });
  let drawings = sheet.getDrawings();
  let enabled = false;
  let visible = true;
  let current = null;
  let publishTimer = 0;
  const ownStrokes = [];

  function render() {
    for (const layer of layers) layer.replaceChildren();
    for (const drawing of Object.values(drawings)) {
      if (!drawing || !layers[drawing.step] || typeof drawing.path !== 'string') continue;
      const path = document.createElementNS(SVG, 'path');
      path.setAttribute('d', drawing.path);
      const index = COLORS.indexOf(drawing.color);
      path.setAttribute('stroke', index < 0 ? 'currentColor' :
        document.documentElement.dataset.theme === 'dark' ? COLORS[index] : LIGHT_INK[index]);
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      layers[drawing.step].append(path);
    }
    $('#btn-undo-drawing').disabled = !ownStrokes.some(id => drawings[id]);
  }
  function applyDrawings(incoming) {
    drawings = {...incoming};
    if (current) drawings[current.id] = current.data;
    sheet.setDrawings(drawings);
    render();
  }
  function theme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('#btn-theme').textContent = dark ? 'LIGHT MODE' : 'DARK MODE';
    $('#btn-theme').setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#101713' : '#e9e8df';
    try {localStorage.setItem('shroomjam:theme', dark ? 'dark' : 'light');} catch {}
    render();
  }
  function drawMode(on) {
    if (current) finish();
    enabled = on;
    if (on) visible = true;
    document.body.classList.toggle('drawing-enabled', on);
    document.body.classList.toggle('drawings-hidden', !visible);
    $('#btn-draw').textContent = on ? 'DRAW: ON' : 'DRAW: OFF';
    $('#btn-draw').setAttribute('aria-pressed', String(on));
    $('#btn-drawings').textContent = visible ? 'HIDE DRAWINGS' : 'SHOW DRAWINGS';
    $('#btn-drawings').setAttribute('aria-pressed', String(visible));
    $('#btn-undo-drawing').hidden = !on;
  }
  function publish() {
    clearTimeout(publishTimer);
    publishTimer = 0;
    if (current) saveStroke(current.id, {...current.data});
  }
  function point(event, layer) {
    const box = layer.getBoundingClientRect();
    return [event.clientX-box.left, event.clientY-box.top].map((v, i) =>
      Math.round(Math.max(0, Math.min(1000, v/(i ? box.height : box.width)*1000))));
  }
  function begin(event, layer, step) {
    if (!enabled || (event.type === 'pointerdown' && event.button !== 0) || current) return;
    event.preventDefault();
    layer.setPointerCapture(event.pointerId);
    const [x,y] = point(event, layer);
    const id = crypto.randomUUID().replaceAll('-', '');
    current = {id, pointerId:event.pointerId, layer, points:1, last:[x,y], data:{
      step, color:profile().color, path:`M${x},${y} L${x+.1},${y+.1}`
    }};
    ownStrokes.push(id);
    drawings[id] = current.data;
    sheet.setDrawings(drawings);
    render();
    publish();
  }
  function move(event, layer) {
    if (!current || current.pointerId !== event.pointerId) return;
    const [x,y] = point(event, layer);
    if (Math.hypot(x-current.last[0], y-current.last[1]) < 1) return;
    // Bound each stroke. Holding the pen down starts another segment automatically.
    if (current.points >= 400) {
      const step = current.data.step;
      finish();
      begin(event, layer, step);
      return;
    }
    current.last = [x,y];
    current.points++;
    current.data.path += ` L${x},${y}`;
    render();
    if (!publishTimer) publishTimer = setTimeout(publish, 180);
  }
  function finish() {
    if (!current) return;
    publish();
    const {layer,pointerId} = current;
    current = null;
    if (layer.hasPointerCapture(pointerId)) layer.releasePointerCapture(pointerId);
  }
  layers.forEach((layer, step) => {
    layer.addEventListener('pointerdown', event => begin(event,layer,step));
    layer.addEventListener('pointermove', event => move(event,layer));
    for (const name of ['pointerup','pointercancel','lostpointercapture']) layer.addEventListener(name,finish);
  });
  document.addEventListener('shroom:step', finish);
  document.addEventListener('visibilitychange', () => {if(document.hidden) finish();});
  $('#btn-theme').addEventListener('click', () => theme(document.documentElement.dataset.theme !== 'dark'));
  $('#btn-draw').addEventListener('click', () => drawMode(!enabled));
  $('#btn-drawings').addEventListener('click', () => {
    drawMode(false);
    visible = !visible;
    document.body.classList.toggle('drawings-hidden', !visible);
    $('#btn-drawings').textContent = visible ? 'HIDE DRAWINGS' : 'SHOW DRAWINGS';
    $('#btn-drawings').setAttribute('aria-pressed', String(visible));
  });
  $('#btn-undo-drawing').addEventListener('click', () => {
    finish();
    let id;
    while ((id = ownStrokes.pop()) && !drawings[id]) {}
    if (id) removeStroke(id);
  });
  let logoClicks = [];
  const ownerDialog = $('#owner-dialog');
  function showOwnerDialog(confirmReset) {
    $('#owner-unlock').hidden = confirmReset;
    $('#owner-confirm').hidden = !confirmReset;
    $('#owner-error').hidden = true;
    $('#owner-password').value = '';
    $('#owner-title').textContent = confirmReset ? 'Reset the shared sheet?' : 'Owner controls';
    ownerDialog.showModal();
    if (!confirmReset) $('#owner-password').focus();
  }
  $('.logo').addEventListener('click', () => {
    const now = performance.now();
    logoClicks = [...logoClicks.filter(time => now-time < 3000),now];
    if (logoClicks.length < 5) return;
    logoClicks = [];
    showOwnerDialog(false);
  });
  $('#owner-unlock').addEventListener('submit', event => {
    event.preventDefault();
    // This is an intentional casual UI lock, not server-side authorization.
    if ($('#owner-password').value !== 'bignut') {$('#owner-error').hidden=false;return;}
    $('#btn-reset').hidden = false;
    ownerDialog.close();
  });
  ownerDialog.addEventListener('close', () => {$('#owner-password').value='';});
  ownerDialog.querySelectorAll('[data-owner-cancel]').forEach(button => button.addEventListener('click',()=>ownerDialog.close()));
  $('#btn-reset').addEventListener('click', () => showOwnerDialog(true));
  $('#btn-confirm-reset').addEventListener('click', async () => {
    ownerDialog.close();
    drawMode(false);
    await reset();
  });
  theme(document.documentElement.dataset.theme === 'dark');
  return {applyDrawings, finish, disable:() => drawMode(false)};
}
