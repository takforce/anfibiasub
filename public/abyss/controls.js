// Comandi: mouse + tastiera su PC, joystick e trascinamento su smartphone
export function createControls(canvas, root, on) {
  const C = {
    enabled: false, locked: false,
    move: { f: 0, r: 0, u: 0 }, fast: false,
    look: { dx: 0, dy: 0 },
    touch: matchMedia('(pointer: coarse)').matches,
  };
  const keys = new Set();

  const upd = () => {
    if (C.touch && joy.active) return;
    C.move.f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    C.move.r = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    C.move.u = (keys.has('Space') ? 1 : 0) - (keys.has('KeyC') || keys.has('ControlLeft') || keys.has('ControlRight') ? 1 : 0) + btnUD;
    C.fast = keys.has('ShiftLeft') || keys.has('ShiftRight');
  };

  addEventListener('keydown', (e) => {
    if (e.code === 'Escape') { on.escape(); return; }
    if (!C.enabled) return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code); upd();
    if (e.code === 'KeyE') on.interact();
    if (e.code === 'KeyQ') C.blast = true;
    if (e.code === 'KeyF') on.torch();
    if (e.code === 'KeyR' && on.fire) on.fire();
    if (e.code === 'KeyI' || e.code === 'Tab') { e.preventDefault(); on.inventory(); }
  });
  addEventListener('keyup', (e) => { keys.delete(e.code); upd(); if (e.code === 'KeyQ') C.blast = false; });
  addEventListener('blur', () => { keys.clear(); C.blast = false; upd(); });

  // ---- mouse: pointer lock, con ripiego a trascinamento ----
  canvas.addEventListener('click', () => {
    if (!C.enabled || C.touch) return;
    if (!C.locked && canvas.requestPointerLock) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (_) { /* nessun pointer lock */ } }
    else if (C.locked) on.interact();
  });
  document.addEventListener('pointerlockchange', () => {
    const was = C.locked;
    C.locked = document.pointerLockElement === canvas;
    if (was && !C.locked) on.unlocked();
    on.lockChange(C.locked);
  });
  addEventListener('mousemove', (e) => {
    if (!C.enabled || C.touch) return;
    if (C.locked || drag) { C.look.dx += e.movementX; C.look.dy += e.movementY; }
  });
  let drag = false;
  canvas.addEventListener('mousedown', (e) => { if (!C.locked && !C.touch && e.button === 0) drag = true; });
  addEventListener('mouseup', () => { drag = false; });

  // ---- touch ----
  // ---- touch: due joystick fissi. Sinistro = nuoto (avanti/indietro/laterale), destro = sguardo (gira e inclina).
  //      Si nuota nella direzione in cui si guarda: per scendere si guarda in basso e si va avanti.
  const joy = { active: false, id: null, el: root.querySelector('.ab-joy-l'), cx: 0, cy: 0 };
  const lk = { active: false, id: null, el: root.querySelector('.ab-joy-r'), cx: 0, cy: 0 };
  C.stick = { x: 0, y: 0 };            // joystick destro: velocità di rotazione (-1..1)
  const area = root.querySelector('.ab-touch');
  const M = 46;
  const center = (s) => { const r = s.el.getBoundingClientRect(); s.cx = r.left + r.width / 2; s.cy = r.top + r.height / 2; };
  const knobAt = (s, dx, dy) => { s.el.querySelector('i').style.transform = `translate(${dx}px,${dy}px)`; };
  const stickVal = (s, t) => {
    let dx = t.clientX - s.cx, dy = t.clientY - s.cy; const L = Math.hypot(dx, dy);
    if (L > M) { dx *= M / L; dy *= M / L; }
    knobAt(s, dx, dy);
    const dz = (v) => (Math.abs(v) < 0.12 ? 0 : (v - Math.sign(v) * 0.12) / 0.88);   // zona morta
    return { x: dz(dx / M), y: dz(dy / M) };
  };
  if (area) {
    area.addEventListener('touchstart', (e) => {
      if (!C.enabled) return;
      if ([...e.changedTouches].every((t) => t.target.closest('button'))) return;   // ✋ e torcia restano clic normali
      for (const t of e.changedTouches) {
        if (t.target.closest('button')) continue;
        const s = t.clientX < (window.visualViewport ? visualViewport.width : innerWidth) / 2 ? joy : lk;
        if (s.id !== null) continue;
        s.id = t.identifier; s.active = true; center(s); s.el.classList.add('on');
        const v = stickVal(s, t);
        if (s === joy) { C.move.r = v.x; C.move.f = -v.y; } else { C.stick.x = v.x; C.stick.y = v.y; }
      }
      e.preventDefault();
    }, { passive: false });
    area.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joy.id) { const v = stickVal(joy, t); C.move.r = v.x; C.move.f = -v.y; }
        else if (t.identifier === lk.id) { const v = stickVal(lk, t); C.stick.x = v.x; C.stick.y = v.y; }
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joy.id) { joy.id = null; joy.active = false; C.move.f = C.move.r = 0; knobAt(joy, 0, 0); joy.el.classList.remove('on'); }
        if (t.identifier === lk.id) { lk.id = null; lk.active = false; C.stick.x = C.stick.y = 0; knobAt(lk, 0, 0); lk.el.classList.remove('on'); }
      }
    };
    area.addEventListener('touchend', end); area.addEventListener('touchcancel', end);
  }
  let btnUD = 0;   // (tasti su/giù rimossi: resta 0)
  // tasto ARIA: si tiene premuto
  C.blast = false;
  const bb = root.querySelector('[data-blast]');
  if (bb) {
    const dn = (e) => { e.preventDefault(); if (C.enabled) { C.blast = true; bb.classList.add('on'); } };
    const up = (e) => { e.preventDefault(); C.blast = false; bb.classList.remove('on'); };
    bb.addEventListener('touchstart', dn, { passive: false }); bb.addEventListener('touchend', up); bb.addEventListener('touchcancel', up);
    bb.addEventListener('mousedown', dn); bb.addEventListener('mouseup', up); bb.addEventListener('mouseleave', up);
  }

  C.reset = () => { keys.clear(); C.blast = false; C.move.f = C.move.r = C.move.u = 0; btnUD = 0; C.look.dx = C.look.dy = 0; if (C.stick) C.stick.x = C.stick.y = 0; };
  C.consumeLook = () => { const l = { ...C.look }; C.look.dx = C.look.dy = 0; return l; };
  C.release = () => { if (document.pointerLockElement) document.exitPointerLock(); };
  return C;
}
