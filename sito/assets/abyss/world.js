// Ambiente: fondale, rocce, gorgonie, cima d'ormeggio, superficie, raggi, particelle, bolle, pesci
import * as THREE from '../vendor/three/three.module.min.js';
import { mergeGeometries } from '../vendor/three/BufferGeometryUtils.js';
import { fbm2, fbm3, noise2, rng } from './noise.js';
import { CFG } from './config.js';

export function heightAt(x, z) {
  let h = CFG.seabed + (fbm2(x * 0.022 + 10, z * 0.022 + 4) - 0.5) * 5 + (fbm2(x * 0.11, z * 0.11) - 0.5) * 1.1;
  const c = Math.abs(noise2(x * 0.045 + 3, z * 0.045 + 8) - 0.5);
  if (c < 0.05) h -= (1 - c / 0.05) * 1.4;                                   // crepacci
  const w = Math.exp(-((x * x) / 500 + (z * z) / 200));                        // piano sotto il relitto
  h = h * (1 - w) + (CFG.seabed - 0.3) * w;
  const r = Math.hypot(x, z);
  if (r > 55) h -= (r - 55) * 0.45;                                           // oltre: la scarpata verso il blu
  return h;
}

const rand = rng(7);
const R = (a, b) => a + (b - a) * rand();

export function buildWorld(scene, tex, q, avoid) {
  const W = { colliders: [], updaters: [] };

  // ---------------- fondale ----------------
  {
    const seg = q.mobile ? 150 : 230;
    const g = new THREE.PlaneGeometry(220, 220, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
    g.computeVertexNormals();
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 44, uv.getY(i) * 44);
    const m = new THREE.MeshStandardMaterial({ map: tex.sand.map, normalMap: tex.sand.normalMap, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // ---------------- rocce (forme tutte diverse) ----------------
  {
    const bases = [];
    for (let b = 0; b < 7; b++) {
      const g = new THREE.IcosahedronGeometry(1, q.mobile ? 3 : 4);
      const p = g.attributes.position, v = new THREE.Vector3();
      const o = b * 13.7;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const n = fbm3(v.x * 1.3 + o, v.y * 1.3, v.z * 1.3, 5);
        const ridge = Math.abs(fbm3(v.x * 3 + o, v.y * 3, v.z * 3, 3) - 0.5);
        v.multiplyScalar(0.72 + n * 0.62 - ridge * 0.25);
        if (v.y < -0.25) v.y = -0.25 + (v.y + 0.25) * 0.3;                         // base appiattita
        p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      bases.push({ g, list: [] });
    }
    const add = (x, z, s, sy) => {
      if (avoid(x, z, s * 1.2)) return;
      const k = Math.floor(rand() * bases.length);
      const sc = new THREE.Vector3(s * R(0.8, 1.3), s * sy, s * R(0.8, 1.3));
      const y = heightAt(x, z) - sc.y * R(0.05, 0.35);   // in parte sepolte nel sedimento
      const rot = R(0, Math.PI * 2);
      bases[k].list.push({ x, y, z, sc, rot });
      W.colliders.push({ c: new THREE.Vector3(x, y, z), s: sc.clone().multiplyScalar(0.92), rot });
    };
    // gruppi di rocce intorno al relitto e scogli più lontani
    const clusters = [[16, -9, 9], [-15, 10, 8], [12, 11, 6], [-20, -12, 10], [26, 4, 8], [-4, 22, 7], [3, -20, 9], [-30, 2, 10], [30, -24, 10], [-26, 26, 9]];
    for (const [cx, cz, n] of clusters) {
      add(cx, cz, R(2.4, 4), R(0.5, 0.8));                                    // scoglio principale
      for (let i = 0; i < n; i++) { const a = R(0, 7), d = R(1.5, 6); add(cx + Math.cos(a) * d, cz + Math.sin(a) * d, R(0.3, 1.8) * (1 - d / 9), R(0.4, 0.85)); }
    }
    for (let i = 0; i < 26; i++) { const a = R(0, 7), d = R(30, 66); add(Math.cos(a) * d, Math.sin(a) * d, R(2, 6), R(0.4, 0.9)); }   // scogli lontani
    for (let i = 0; i < 30; i++) { const a = R(0, 7), d = R(12, 50); add(Math.cos(a) * d, Math.sin(a) * d, R(0.4, 1.4), R(0.4, 0.9)); }
    for (let i = 0; i < 90; i++) { const a = R(0, 7), d = R(6, 40); add(Math.cos(a) * d, Math.sin(a) * d, R(0.15, 0.45), R(0.5, 0.9)); } // ciottoli
    const m = new THREE.MeshStandardMaterial({ map: tex.rock.map, normalMap: tex.rock.normalMap, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.95 });
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
    for (const b of bases) {
      if (!b.list.length) continue;
      const im = new THREE.InstancedMesh(b.g, m, b.list.length);
      b.list.forEach((r, i) => { Q.setFromEuler(E.set(R(-0.15, 0.15), r.rot, R(-0.15, 0.15))); M.compose(new THREE.Vector3(r.x, r.y, r.z), Q, r.sc); im.setMatrixAt(i, M); });
      im.castShadow = im.receiveShadow = true;
      scene.add(im);
    }
    W.rocks = bases.flatMap((b) => b.list);
  }

  // ---------------- gorgonie rosse e spugne ----------------
  {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const branch = (x, y, a, L, w, d) => {
      const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
      g.strokeStyle = d > 4 ? '#e8b23a' : '#8e1d1d'; g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      if (d < 6) { branch(x2, y2, a - 0.38 + Math.random() * 0.15, L * 0.78, w * 0.72, d + 1); branch(x2, y2, a + 0.38 - Math.random() * 0.15, L * 0.78, w * 0.72, d + 1); }
    };
    branch(128, 256, -Math.PI / 2, 52, 9, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const p1 = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), p2 = p1.clone().rotateY(Math.PI / 2);
    const geo = mergeGeometries([p1, p2]);
    const mat = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9 });
    const spots = W.rocks.filter((r) => r.sc.x > 0.9).slice(0, 60);
    const im = new THREE.InstancedMesh(geo, mat, spots.length * 2);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion();
    let k = 0;
    for (const r of spots) for (let j = 0; j < 2; j++) {
      const a = R(0, 7), s = R(0.5, 1.3);
      const pos = new THREE.Vector3(r.x + Math.cos(a) * r.sc.x * 0.4, r.y + r.sc.y * 0.75, r.z + Math.sin(a) * r.sc.z * 0.4);
      Q.setFromEuler(new THREE.Euler(R(-0.2, 0.2), R(0, 7), R(-0.2, 0.2)));
      M.compose(pos, Q, new THREE.Vector3(s, s, s)); im.setMatrixAt(k++, M);
    }
    im.count = k;
    scene.add(im);

    const sg = new THREE.SphereGeometry(1, 10, 8);
    const sm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const sp = new THREE.InstancedMesh(sg, sm, 160);
    const cols = [0xd8792c, 0xc9a33a, 0x9a3b52, 0xb85a2a];
    for (let i = 0; i < 160; i++) {
      const r = W.rocks[Math.floor(rand() * W.rocks.length)];
      const a = R(0, 7), s = R(0.05, 0.16);
      M.compose(new THREE.Vector3(r.x + Math.cos(a) * r.sc.x * 0.6, r.y + r.sc.y * R(0.2, 0.7), r.z + Math.sin(a) * r.sc.z * 0.6), Q.identity(), new THREE.Vector3(s, s * R(0.6, 1.4), s));
      sp.setMatrixAt(i, M); sp.setColorAt(i, new THREE.Color(cols[i % 4]));
    }
    scene.add(sp);
  }

  // ---------------- cima d'ormeggio con boa e corpo morto ----------------
  {
    const top = new THREE.Vector3(CFG.line.x, 0.1, CFG.line.z);
    const bx = CFG.line.bx, bz = CFG.line.bz, by = heightAt(bx, bz);
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      pts.push(new THREE.Vector3(top.x + (bx - top.x) * t + Math.sin(t * 9) * 0.25 * (1 - t), top.y + (by + 0.6 - top.y) * t, top.z + (bz - top.z) * t + Math.cos(t * 7) * 0.2 * (1 - t)));
    }
    W.lineCurve = new THREE.CatmullRomCurve3(pts);
    const rope = new THREE.Mesh(new THREE.TubeGeometry(W.lineCurve, 200, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0xb8a888, roughness: 1 }));
    scene.add(rope);
    const buoy = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), new THREE.MeshStandardMaterial({ color: 0xd2541f, roughness: 0.6 }));
    buoy.position.copy(top); scene.add(buoy); W.buoy = buoy;
    const block = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), new THREE.MeshStandardMaterial({ map: tex.rock.map, roughness: 1, color: 0x9a9a90 }));
    block.position.set(bx, by + 0.2, bz); block.rotation.y = 0.4; scene.add(block);
    W.colliders.push({ c: block.position.clone(), s: new THREE.Vector3(0.7, 0.45, 0.7), rot: 0 });
  }

  // ---------------- superficie vista da sotto (finestra di Snell) ----------------
  {
    const mat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, transparent: false,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uDeep: { value: new THREE.Color(0x0b3047) }, uSky: { value: new THREE.Color(0xcff3ff) }, uFog: { value: new THREE.Color() }, uDensity: { value: 0.03 } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uCam, uDeep, uSky, uFog; uniform float uDensity; varying vec3 vW;
        float wv(vec2 p){ return sin(p.x*.9+uTime*1.3)*.5+sin(p.y*1.3-uTime*1.1)*.5+sin((p.x+p.y)*2.1+uTime*1.9)*.35+sin((p.x-p.y)*3.3-uTime*2.3)*.2; }
        void main(){
          vec3 d = normalize(vW-uCam);
          vec2 p = vW.xz*.6; float w = wv(p); float w2 = wv(p*2.7+5.);
          float c = d.y + w*.035 + w2*.015;
          float win = smoothstep(.62,.72,c);
          vec3 col = mix(uDeep*.8, uSky*(1.15+w*.18+w2*.08), win);
          col += uSky*.25*pow(max(0., w2), 6.)*win;
          float f = 1.-exp(-pow(uDensity*length(vW-uCam),2.));
          gl_FragColor = vec4(mix(col, uFog, f*(1.-win*.55)),1.);
          #include <colorspace_fragment>
        }`,
    });
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 1, 1).rotateX(Math.PI / 2), mat);
    surf.position.y = 0; scene.add(surf);
    W.surface = mat;
  }

  // ---------------- fasci di luce dalla superficie ----------------
  {
    const geo = mergeGeometries([new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0), new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0).rotateY(Math.PI / 2)]);
    const mat = new THREE.MeshBasicMaterial({ map: tex.ray, color: 0x9fe4ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const n = q.mobile ? 10 : 18;
    const rays = new THREE.InstancedMesh(geo, mat, n);
    const data = [];
    for (let i = 0; i < n; i++) data.push({ x: R(-22, 22), z: R(-22, 22), w: R(1.2, 4), h: R(18, 34), ph: R(0, 7), tilt: R(0.08, 0.2) });
    rays.frustumCulled = false;
    scene.add(rays);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
    W.updaters.push((dt, t, cam) => {
      data.forEach((r, i) => {
        // i fasci seguono il sub (ricollocati a griglia) così ce ne sono sempre intorno
        const gx = cam.position.x + ((r.x - cam.position.x + 22) % 44 + 44) % 44 - 22;
        const gz = cam.position.z + ((r.z - cam.position.z + 22) % 44 + 44) % 44 - 22;
        P.set(gx, 0, gz); Q.setFromEuler(E.set(r.tilt, r.ph, r.tilt * 0.5));
        const pulse = 0.65 + 0.35 * Math.sin(t * 0.4 + r.ph);
        S.set(r.w * pulse, r.h, r.w * pulse);
        M.compose(P, Q, S); rays.setMatrixAt(i, M);
      });
      rays.instanceMatrix.needsUpdate = true;
      const depth = -cam.position.y;
      mat.opacity = 0.11 * Math.max(0.15, 1 - depth / 34);
    });
  }

  // ---------------- particelle sospese (illuminate dalla torcia) ----------------
  {
    const N = q.particles, B = 34;
    const pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = R(0, B); pos[i * 3 + 1] = R(0, B); pos[i * 3 + 2] = R(0, B); seed[i] = rand(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uDir: { value: new THREE.Vector3() }, uTorch: { value: 1 }, uAmb: { value: 0.2 }, uPR: { value: 1 }, uB: { value: B }, uCone: { value: CFG.torch.angle } },
      vertexShader: `attribute float aSeed; uniform float uTime, uTorch, uAmb, uPR, uB, uCone; uniform vec3 uCam, uDir; varying float vA;
        void main(){
          vec3 p = position + vec3(sin(uTime*.2+aSeed*40.)*.4, -uTime*(.03+aSeed*.05), cos(uTime*.17+aSeed*30.)*.4);
          p = mod(p - uCam + uB*.5, uB) - uB*.5 + uCam;
          vec3 d = p - uCam; float dist = length(d);
          float cone = smoothstep(cos(uCone*1.15), cos(uCone*.35), dot(d/dist, uDir));
          float lit = uTorch * cone / (1. + dist*dist*.035);
          vA = (uAmb*.35 + lit*1.6) * smoothstep(uB*.5, uB*.3, dist) * (.4+aSeed*.6);
          vec4 mv = modelViewMatrix*vec4(p,1.);
          gl_PointSize = (1.2+aSeed*2.6) * uPR * 9. / max(.5,-mv.z);
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord-.5; float a = smoothstep(.5,.0,length(c)); gl_FragColor = vec4(vec3(.85,.93,1.)*vA*a, 1.); }`,
    });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; scene.add(pts);
    W.particles = mat;
  }

  // ---------------- bolle dell'erogatore ----------------
  {
    const N = 90;
    const pos = new Float32Array(N * 3), size = new Float32Array(N);
    const life = new Float32Array(N).fill(-1), vel = new Float32Array(N);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uPR: { value: 1 }, uAmb: { value: 0.5 } },
      vertexShader: `attribute float aSize; uniform float uPR; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = aSize*uPR*300./max(.3,-mv.z); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform float uAmb; void main(){ vec2 c = gl_PointCoord-.5; float r = length(c); if(r>.5) discard; float rim = smoothstep(.32,.48,r)*(1.-smoothstep(.48,.5,r)); float hl = smoothstep(.12,.0,length(c-vec2(-.15,.15))); gl_FragColor = vec4(vec3(.8,.95,1.), (rim*.55+hl*.8+.05)*uAmb); }`,
    });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; scene.add(pts);
    let next = 0;
    W.bubbles = {
      mat,
      emit(origin, n) {
        for (let k = 0; k < n; k++) {
          const i = next; next = (next + 1) % N;
          pos[i * 3] = origin.x + R(-0.08, 0.08); pos[i * 3 + 1] = origin.y + R(-0.05, 0.05); pos[i * 3 + 2] = origin.z + R(-0.08, 0.08);
          size[i] = R(0.004, 0.02); life[i] = 0; vel[i] = R(0.4, 0.9);
        }
      },
      burst(origin, n, spread) {
        for (let k = 0; k < n; k++) {
          const i = next; next = (next + 1) % N;
          pos[i * 3] = origin.x + R(-spread, spread); pos[i * 3 + 1] = origin.y + R(0, 0.3); pos[i * 3 + 2] = origin.z + R(-spread, spread);
          size[i] = R(0.006, 0.03); life[i] = R(-0.6, 0); vel[i] = R(0.4, 1.2);
        }
      },
      clear() { life.fill(-1); size.fill(0); },
    };
    W.updaters.push((dt, t) => {
      for (let i = 0; i < N; i++) {
        if (life[i] < 0) { if (life[i] > -1) life[i] += dt; else size[i] = 0; continue; }
        life[i] += dt; vel[i] = Math.min(vel[i] + dt * 0.5, 2);
        pos[i * 3 + 1] += vel[i] * dt;
        pos[i * 3] += Math.sin(t * 6 + i) * dt * 0.15; pos[i * 3 + 2] += Math.cos(t * 5 + i) * dt * 0.15;
        size[i] *= 1 + dt * 0.03;
        if (life[i] > 9 || pos[i * 3 + 1] > -0.1) { life[i] = -1; size[i] = 0; }
      }
      g.attributes.position.needsUpdate = true; g.attributes.aSize.needsUpdate = true;
    });
  }

  // ---------------- pesci: castagnole in banco e qualche sarago ----------------
  {
    const fishGeo = (len, h, w) => {
      const body = new THREE.SphereGeometry(1, 12, 8); body.scale(w, h, len * 0.5);
      const tail = new THREE.BufferGeometry();
      const z0 = -len * 0.45, z1 = -len * 0.72;
      tail.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, z0, 0, h * 0.9, z1, 0, 0.05 * h, z1 + len * 0.06, 0, 0, z0, 0, -0.05 * h, z1 + len * 0.06, 0, -h * 0.9, z1], 3));
      tail.computeVertexNormals();
      const b = body.toNonIndexed(); b.deleteAttribute('uv');
      return mergeGeometries([b, tail]);
    };
    const wiggle = (m, amp) => {
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = W.fishTime;
        sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
          `#include <begin_vertex>
           float ph = float(gl_InstanceID)*1.7;
           transformed.x += sin(uTime*9. + ph + position.z*22.) * ${amp.toFixed(3)} * smoothstep(.02,-.1,position.z);`);
      };
    };
    W.fishTime = { value: 0 };
    const schools = [];
    const mk = (geo, color, metal, count, homes, speed, spread, scaleR) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: metal, side: THREE.DoubleSide });
      wiggle(m, 0.012 * scaleR);
      const im = new THREE.InstancedMesh(geo, m, count); im.frustumCulled = false; scene.add(im);
      const f = [];
      for (let i = 0; i < count; i++) {
        const h = homes[i % homes.length];
        f.push({ home: h, p: new THREE.Vector3(h.x + R(-3, 3), h.y + R(-1, 1), h.z + R(-3, 3)), v: new THREE.Vector3(R(-1, 1), 0, R(-1, 1)).multiplyScalar(0.3), off: new THREE.Vector3(R(-1, 1) * spread, R(-0.4, 0.4) * spread, R(-1, 1) * spread), s: R(0.8, 1.25) * scaleR });
      }
      schools.push({ im, f, speed });
    };
    const H = (x, z, dy) => new THREE.Vector3(x, heightAt(x, z) + dy, z);
    mk(fishGeo(0.14, 0.05, 0.022), 0x2f3a4a, 0.35, q.mobile ? 70 : 130, [H(2, -1, 6.5), H(-7, 3, 5.5), H(10, 2, 5)], 0.9, 2.6, 1);
    mk(fishGeo(0.34, 0.11, 0.04), 0x9aa3a8, 0.7, 10, [H(14, -6, 1.2), H(-12, 8, 1), H(5, 12, 0.8)], 0.6, 5, 1);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), tgt = new THREE.Vector3(), des = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), L = new THREE.Matrix4();
    W.updaters.push((dt, t, cam) => {
      W.fishTime.value = t;
      for (const sc of schools) {
        sc.f.forEach((f, i) => {
          const h = f.home;
          tgt.set(h.x + Math.sin(t * 0.07 + h.z) * 4, h.y + Math.sin(t * 0.13 + h.x) * 0.8, h.z + Math.cos(t * 0.06 + h.x) * 4).add(f.off);
          des.subVectors(tgt, f.p).multiplyScalar(0.35);
          const dc = f.p.distanceTo(cam.position);
          if (dc < 3) des.add(f.p.clone().sub(cam.position).normalize().multiplyScalar((3 - dc) * 1.6)); // si allontanano dal sub
          f.v.lerp(des, Math.min(1, dt * 0.9));
          const sp = f.v.length(), mx = sc.speed * (dc < 3 ? 2.2 : 1);
          if (sp > mx) f.v.multiplyScalar(mx / sp);
          if (sp < 0.12) f.v.addScaledVector(f.v.clone().normalize(), 0.05);
          f.p.addScaledVector(f.v, dt);
          const fl = heightAt(f.p.x, f.p.z) + 0.3; if (f.p.y < fl) f.p.y = fl;
          L.lookAt(f.p, tgt.copy(f.p).sub(f.v), up); Q.setFromRotationMatrix(L);
          S.setScalar(f.s); M.compose(f.p, Q, S); sc.im.setMatrixAt(i, M);
        });
        sc.im.instanceMatrix.needsUpdate = true;
      }
    });
  }

  return W;
}

// collisioni con rocce (ellissoidi) e fondale
const _l = new THREE.Vector3();
export function collideWorld(W, p, r) {
  for (const c of W.colliders) {
    _l.subVectors(p, c.c);
    if (Math.abs(_l.x) > c.s.x + r + 0.5 || Math.abs(_l.z) > c.s.z + r + 0.5 || Math.abs(_l.y) > c.s.y + r + 0.5) continue;
    const cs = Math.cos(-c.rot), sn = Math.sin(-c.rot);
    const lx = _l.x * cs - _l.z * sn, lz = _l.x * sn + _l.z * cs;
    const ex = lx / (c.s.x + r), ey = _l.y / (c.s.y + r), ez = lz / (c.s.z + r);
    const d = Math.hypot(ex, ey, ez);
    if (d < 1 && d > 1e-4) {
      const k = 1 / d;
      const nx = ex * k * (c.s.x + r), ny = ey * k * (c.s.y + r), nz = ez * k * (c.s.z + r);
      const cs2 = Math.cos(c.rot), sn2 = Math.sin(c.rot);
      p.set(c.c.x + nx * cs2 - nz * sn2, c.c.y + ny, c.c.z + nx * sn2 + nz * cs2);
    }
  }
  const fl = heightAt(p.x, p.z) + r + 0.15;
  if (p.y < fl) p.y = fl;
  if (p.y > -0.35) p.y = -0.35;
  const rr = Math.hypot(p.x, p.z);
  if (rr > CFG.limit) { p.x *= CFG.limit / rr; p.z *= CFG.limit / rr; }
}
