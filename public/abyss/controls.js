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
    if (e.code === 'KeyF') on.torch();
    if (e.code === 'KeyI' || e.code === 'Tab') { e.preventDefault(); on.inventory(); }
  });
  addEventListener('keyup', (e) => { keys.delete(e.code); upd(); });
  addEventListener('blur', () => { keys.clear(); upd(); });

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
  const joy = { active: false, id: null, x0: 0, y0: 0 };
  const look = { id: null, x: 0, y: 0 };
  const stick = root.querySelector('.ab-joy'), knob = root.querySelector('.ab-joy i');
  let btnUD = 0;
  const area = root.querySelector('.ab-touch');
  if (area) {
    area.addEventListener('touchstart', (e) => {
      if (!C.enabled) return;
      // i tocchi sui pulsanti (✋, torcia) devono restare clic normali
      if ([...e.changedTouches].every((t) => t.target.closest('button'))) return;
      for (const t of e.changedTouches) {
        if (t.target.closest('button')) continue;
        if (t.clientX < innerWidth * 0.45 && joy.id === null) {
          joy.id = t.identifier; joy.active = true; joy.x0 = t.clientX; joy.y0 = t.clientY;
          stick.style.left = t.clientX + 'px'; stick.style.top = t.clientY + 'px'; stick.classList.add('on');
        } else if (look.id === null) { look.id = t.identifier; look.x = t.clientX; look.y = t.clientY; }
      }
      e.preventDefault();
    }, { passive: false });
    area.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joy.id) {
          let dx = t.clientX - joy.x0, dy = t.clientY - joy.y0; const L = Math.hypot(dx, dy), M = 48;
          if (L > M) { dx *= M / L; dy *= M / L; }
          knob.style.transform = `translate(${dx}px,${dy}px)`;
          C.move.r = dx / M; C.move.f = -dy / M;
        } else if (t.identifier === look.id) {
          C.look.dx += (t.clientX - look.x) * 1.6; C.look.dy += (t.clientY - look.y) * 1.6; look.x = t.clientX; look.y = t.clientY;
        }
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joy.id) { joy.id = null; joy.active = false; C.move.f = C.move.r = 0; knob.style.transform = ''; stick.classList.remove('on'); }
        if (t.identifier === look.id) look.id = null;
      }
    };
    area.addEventListener('touchend', end); area.addEventListener('touchcancel', end);
    const hold = (sel, v) => {
      const b = root.querySelector(sel); if (!b) return;
      const dn = (e) => { e.preventDefault(); btnUD = v; C.move.u = v; b.classList.add('on'); };
      const up = (e) => { e.preventDefault(); btnUD = 0; C.move.u = 0; b.classList.remove('on'); };
      b.addEventListener('touchstart', dn, { passive: false }); b.addEventListener('touchend', up); b.addEventListener('touchcancel', up);
      b.addEventListener('mousedown', dn); b.addEventListener('mouseup', up); b.addEventListener('mouseleave', up);
    };
    hold('[data-up]', 1); hold('[data-down]', -1);
  }

  C.reset = () => { keys.clear(); C.move.f = C.move.r = C.move.u = 0; btnUD = 0; C.look.dx = C.look.dy = 0; };
  C.consumeLook = () => { const l = { ...C.look }; C.look.dx = C.look.dy = 0; return l; };
  C.release = () => { if (document.pointerLockElement) document.exitPointerLock(); };
  return C;
}
