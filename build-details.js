// Fixed, individually synchronized fields for the jam's build specification.
(() => {
  'use strict';
  const schema = {};
  const controls = new Map();
  const $ = selector => document.querySelector(selector);
  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }
  function field(parent, key, label, placeholder='', options=null, multiline=false, url=false) {
    schema[key] = {label, options, url};
    const wrap = node('div', 'build-field');
    const caption = node('label', 'build-label', label.split(' · ').at(-1));
    caption.htmlFor = 'build-'+key;
    const input = node(options ? 'select' : multiline ? 'textarea' : 'input', 'build-input');
    input.id = caption.htmlFor;
    input.dataset.build = key;
    if (options) {
      for (const value of ['',...options]) {
        const option = node('option','',value || '—');
        option.value = value;
        input.append(option);
      }
    } else {
      if (!multiline) input.type = url ? 'url' : 'text';
      else input.rows = key === 'minute' ? 5 : 2;
      input.placeholder = placeholder;
      input.maxLength = url ? 2048 : 4000;
      input.autocomplete = 'off';
    }
    input.setAttribute('aria-label',label);
    wrap.append(caption,input);
    if (url) {
      const link = node('a','build-reference-link','OPEN REFERENCE ↗');
      link.target = '_blank';link.rel = 'noopener noreferrer';link.hidden = true;
      wrap.append(link);
    }
    parent.append(wrap);
    controls.set(key,input);
    return input;
  }
  function render() {
    const contract = $('#build-contract');
    field(contract,'controls','CAMERA & CONTROLS','Perspective, platform, players, inputs, and limits',null,true);
    field(contract,'goal','PLAYER GOAL','What concrete state counts as success?',null,true);
    field(contract,'failure','FAILURE & RETRY','What ends a run, and what happens next?',null,true);
    field(contract,'minute','FIRST PLAYABLE MINUTE','1. See…\n2. Try…\n3. Learn…\n4. Struggle…\n5. Complete…',null,true);
    for (let i=0;i<3;i++) {
      const group = node('fieldset','build-mechanic');
      group.append(node('legend','eyebrow','MECHANIC '+String(i+1).padStart(2,'0')));
      for (const [key,label,hint] of [
        ['name','NAME','One player verb or system'],
        ['input','INPUT / TRIGGER','What does the player do? When is it allowed?'],
        ['rule','RULE / LIMIT','What happens? Include one constraint or edge case.'],
        ['feedback','FEEDBACK','What makes the response clear: image, sound, timing?'],
        ['test','TEST','An observable result that proves this works']
      ]) field(group,`mechanic_${i}_${key}`,`MECHANIC ${i+1} · ${label}`,hint,null,key!=='name');
      $('#build-mechanics').append(group);
    }
    const direction = $('#build-direction');
    field(direction,'feel','THREE FEEL WORDS','e.g. nimble, tense, mischievous');
    field(direction,'visual','VISUAL DIRECTION','Shapes, palette, lighting, camera, animation',null,true);
    field(direction,'audio','AUDIO & RESPONSE','Sound, silence, impact, and timing that support the feel',null,true);
    field(direction,'avoid','AVOID','What would undermine this experience?',null,true);
    for (let i=0;i<3;i++) {
      const group = node('fieldset','build-reference');
      group.append(node('legend','eyebrow','REFERENCE '+String(i+1).padStart(2,'0')));
      field(group,`reference_${i}_title`,`REFERENCE ${i+1} · TITLE`,'Game, film, image, or audio');
      field(group,`reference_${i}_url`,`REFERENCE ${i+1} · URL`,'https://…',null,false,true);
      field(group,`reference_${i}_why`,`REFERENCE ${i+1} · WHAT WE BORROW / WHY`,'Name the specific behaviour, feeling, or treatment.',null,true);
      $('#build-references').append(group);
    }
    for (let i=0;i<8;i++) {
      const row = node('fieldset','build-asset');
      row.append(node('legend','build-asset-number',String(i+1).padStart(2,'0')));
      field(row,`asset_${i}_name`,`ASSET ${i+1} · ASSET / PURPOSE`,'e.g. Door ×2 — teaches interaction');
      field(row,`asset_${i}_kind`,`ASSET ${i+1} · KIND`,'',['Art','Animation','VFX','Audio','UI','Level']);
      field(row,`asset_${i}_approach`,`ASSET ${i+1} · APPROACH`,'',['Make','Reuse']);
      field(row,`asset_${i}_owner`,`ASSET ${i+1} · OWNER`,'Name');
      field(row,`asset_${i}_state`,`ASSET ${i+1} · STATE`,'',['Needed','Making','Ready','Cut']);
      field(row,`asset_${i}_source`,`ASSET ${i+1} · SOURCE / CREDIT`,'Optional source link or attribution');
      $('#build-assets').append(row);
    }
    document.addEventListener('input', event => {if(event.target.hasAttribute('data-build')) refresh();});
    document.addEventListener('shroom:step',refresh);
    $('#build-assets-section').addEventListener('toggle',refresh);
    window.addEventListener('resize',refresh,{passive:true});
    let assetsWereOpen=false;
    window.addEventListener('beforeprint',()=>{assetsWereOpen=$('#build-assets-section').open;$('#build-assets-section').open=true;refresh();});
    window.addEventListener('afterprint',()=>{$('#build-assets-section').open=assetsWereOpen;refresh();});
  }
  function safeURL(value) {
    try {const url=new URL(value);return ['http:','https:'].includes(url.protocol) && !!url.hostname ? url.href : null;} catch {return null;}
  }
  function valid(key,value) {
    const entry=schema[key];
    return !!entry && typeof value==='string' && value.length <= (entry.url ? 2048 : 4000)
      && (!entry.options || value==='' || entry.options.includes(value))
      && (!entry.url || value==='' || !!safeURL(value));
  }
  function defaults() {return Object.fromEntries(Object.keys(schema).map(key=>[key,'']));}
  function normalize(raw) {
    const result=defaults();
    for (const key of Object.keys(result)) if(valid(key,raw?.[key])) result[key]=raw[key];
    return result;
  }
  function refresh() {
    document.querySelectorAll('.build-mechanic,.build-reference,.build-asset').forEach(group=>
      group.classList.toggle('has-content',[...group.querySelectorAll('[data-build]')].some(input=>input.value.trim())));
    for(const [key,input] of controls) {
      if(input.tagName==='TEXTAREA' && input.offsetParent!==null) {
        input.style.height='auto';input.style.height=Math.max(input.scrollHeight,54)+'px';
      }
      if(!schema[key].url)continue;
      const url=safeURL(input.value);
      input.setCustomValidity(input.value && !url ? 'Use a complete HTTP or HTTPS URL.' : '');
      const link=input.nextElementSibling;
      link.hidden=!url;
      if(url)link.href=url;else link.removeAttribute('href');
    }
  }
  function markdown(raw) {
    const data=normalize(raw);
    const lines=[];
    for(const key of ['controls','goal','failure','minute']) if(data[key].trim()) lines.push(`### ${schema[key].label}\n${data[key].trim()}`);
    for(let i=0;i<3;i++) {
      const keys=['name','input','rule','feedback','test'].map(part=>`mechanic_${i}_${part}`);
      if(keys.some(key=>data[key].trim())) lines.push(`### Mechanic ${i+1}\n`+keys.filter(key=>data[key].trim()).map(key=>`${schema[key].label.split(' · ')[1]}: ${data[key].trim()}`).join('\n'));
    }
    for(const key of ['feel','visual','audio','avoid']) if(data[key].trim()) lines.push(`### ${schema[key].label}\n${data[key].trim()}`);
    for(let i=0;i<3;i++) {
      const keys=['title','url','why'].map(part=>`reference_${i}_${part}`);
      if(keys.some(key=>data[key].trim())) lines.push(`### Reference ${i+1}\n`+keys.filter(key=>data[key].trim()).map(key=>data[key].trim()).join('\n'));
    }
    const assets=[];
    for(let i=0;i<8;i++) {
      const keys=['name','kind','approach','owner','state','source'].map(part=>`asset_${i}_${part}`);
      if(keys.some(key=>data[key].trim()))assets.push('- '+keys.filter(key=>data[key].trim()).map(key=>`${schema[key].label.split(' · ')[1]}: ${data[key].trim()}`).join(' | '));
    }
    if(assets.length)lines.push('### Assets to ship\n'+assets.join('\n'));
    return lines.length ? '\n## Build the details\n\n'+lines.join('\n\n')+'\n' : '';
  }
  window.BuildDetails={render,defaults,normalize,valid,refresh,markdown};
})();
