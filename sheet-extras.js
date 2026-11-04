// Independent sheets and a small shared image board. No external services or libraries.
export function validImage(image) {
  return image && typeof image === 'object' && typeof image.data === 'string' &&
    image.data.length <= 240000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image.data) &&
    typeof image.name === 'string' && image.name.length <= 120;
}

export function normalizeImages(raw) {
  return Object.fromEntries(Object.entries(raw || {}).map(([key,image]) => [image?.id || key,image]).filter(([id, image]) =>
    /^[a-f0-9]{32}$/.test(id) && validImage(image)).slice(0, 8));
}

export function setupExtras({sheet, saveImage, navigate, notify, localOnly=false}) {
  const $ = selector => document.querySelector(selector);
  const number = window.ShroomSheet;
  const available = new Set([1, number]);
  const checked = new Set();
  let images = sheet.getImages();
  let busy = false;
  $('#sheet-number').textContent = String(number).padStart(3, '0');
  document.title = 'SHROOMJAM — Sheet '+number;

  function renderSheets() {
    document.querySelectorAll('[data-sheet]').forEach(button => {
      const n = Number(button.dataset.sheet);
      button.hidden = !available.has(n);
      button.setAttribute('aria-current', n === number ? 'page' : 'false');
    });
    $('#btn-new-sheet').disabled = available.size === 3 || (!localOnly && checked.size < 2);
    $('#btn-new-sheet').textContent = available.size === 3 ? '3 SHEETS' : '+ NEW SHEET';
  }
  document.querySelectorAll('[data-sheet]').forEach(button => button.addEventListener('click', () => {
    if (Number(button.dataset.sheet) !== number) navigate(Number(button.dataset.sheet));
  }));
  $('#btn-new-sheet').addEventListener('click', () => {
    const next = [2, 3].find(n => !available.has(n));
    if (next) navigate(next);
  });

  function render() {
    const gallery = $('#sheet-images');
    gallery.replaceChildren();
    $('#image-count').textContent = Object.keys(images).length+' / 8';
    for (const [id, image] of Object.entries(images)) {
      if (!validImage(image)) continue;
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.src = image.data; img.alt = image.name || 'Pasted reference image'; img.loading = 'lazy';
      const caption = document.createElement('figcaption');
      const label = document.createElement('span'); label.textContent = image.name || 'Pasted image';
      const remove = document.createElement('button'); remove.className = 'tool-btn';
      remove.textContent = 'REMOVE'; remove.setAttribute('aria-label', 'Remove '+label.textContent);
      remove.addEventListener('click', () => saveImage(id, null));
      caption.append(label, remove); figure.append(img, caption); gallery.append(figure);
    }
  }
  async function compress(file) {
    if (!/^image\/(png|jpeg|webp|gif|avif|bmp)$/.test(file.type)) throw Error('Paste or choose a PNG, JPEG, WebP, GIF, AVIF, or BMP image.');
    if (file.size > 20 * 1024 * 1024) throw Error('Choose an image smaller than 20 MB.');
    const bitmap = await createImageBitmap(file);
    try {
      if (bitmap.width * bitmap.height > 40000000) throw Error('Choose an image smaller than 40 megapixels.');
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [.82, .65, .45, .25]) {
        const data = canvas.toDataURL('image/webp', quality);
        if (data.length <= 240000) return data;
      }
      throw Error('Image is too detailed. Resize it before pasting.');
    } finally {bitmap.close();}
  }
  async function add(files) {
    if (busy) return;
    busy = true;
    $('#image-status').textContent = 'Preparing image…';
    try {
      for (const file of files) {
        if (Object.keys(images).length >= 8) throw Error('Eight images per sheet. Remove one before adding another.');
        const data = await compress(file);
        saveImage(crypto.randomUUID().replaceAll('-', ''), {data, name:(file.name || 'Pasted image').slice(0, 120)});
      }
      $('#image-status').textContent = 'Images save automatically with this sheet.';
    } catch (error) {$('#image-status').textContent = error.message; notify(error.message);}
    finally {busy = false; $('#image-upload').value = '';}
  }
  const zone = $('#image-paste');
  zone.addEventListener('paste', event => {
    const files = [...(event.clipboardData?.items || [])].filter(item => item.kind === 'file').map(item => item.getAsFile()).filter(Boolean);
    if (files.length) {event.preventDefault(); add(files);}
  });
  zone.addEventListener('dragover', event => event.preventDefault());
  zone.addEventListener('drop', event => {event.preventDefault(); add([...(event.dataTransfer?.files || [])]);});
  $('#btn-add-image').addEventListener('click', () => $('#image-upload').click());
  $('#image-upload').addEventListener('change', event => add([...event.target.files]));
  renderSheets(); render();
  return {
    applyImages(data) {images = normalizeImages(data); sheet.setImages(images); render();},
    setAvailable(n, exists) {checked.add(n);if (exists) available.add(n); else if (n !== number && n !== 1) available.delete(n); renderSheets();},
    isBusy:() => busy
  };
}
