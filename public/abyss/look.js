// Resa "subacquea vera": assorbimento dei colori con la distanza (il rosso sparisce prima),
// caustiche (riflessi della superficie che si muovono sul fondo), fascio della torcia nell'acqua.
// Tutto procedurale: nessun file esterno.
import * as THREE from '../vendor/three/three.module.min.js';

// ---- 1. nebbia con assorbimento selettivo: rosso > verde > blu (vale per tutti i materiali) ----
THREE.ShaderChunk.fog_fragment = `
#ifdef USE_FOG
  #ifdef FOG_EXP2
    vec3 fogF = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth * vec3( 1.75, 1.0, 0.82 ) );
  #else
    vec3 fogF = vec3( smoothstep( fogNear, fogFar, vFogDepth ) );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, clamp( fogF, 0.0, 1.0 ) );
#endif`;

// ---- 2. texture delle caustiche: reticolo di Voronoi a bordi luminosi, ripetibile ----
function causticTex(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data;
  const N = 9, pts = [];
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) pts.push([(i + 0.15 + rnd() * 0.7) / N, (j + 0.15 + rnd() * 0.7) / N]);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size; let f1 = 9, f2 = 9;
    for (const [px, py] of pts) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const dx = u - px - ox, dy = v - py - oy, dd = dx * dx + dy * dy;
      if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd;
    }
    const e = Math.sqrt(f2) - Math.sqrt(f1);                  // distanza dal bordo della cella
    const val = Math.pow(Math.max(0, 1 - e * N * 1.5), 2.4);   // bordi morbidi, come la luce vera filtrata dalle onde
    const k = (y * size + x) * 4; d[k] = d[k + 1] = d[k + 2] = Math.round(val * 255); d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export const CAUSTIC = { uCaTex: { value: null }, uCaTime: { value: 0 }, uCaStr: { value: 0.5 }, uCaCol: { value: new THREE.Color(0xbff3ff) } };

export function causticTexture() { if (!CAUSTIC.uCaTex.value) CAUSTIC.uCaTex.value = causticTex(); return CAUSTIC.uCaTex.value; }

// applica le caustiche a tutti i MeshStandardMaterial della scena (fondale, rocce, relitto, oggetti)
export function addCaustics(scene, skip = () => false) {
  if (!CAUSTIC.uCaTex.value) CAUSTIC.uCaTex.value = causticTex();
  const done = new Set();
  scene.traverse((o) => {
    if (!o.isMesh || skip(o)) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m || !m.isMeshStandardMaterial || done.has(m) || m.userData.noCaustics) continue;
      done.add(m); patch(m);
    }
  });
}
function patch(m) {
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    Object.assign(sh.uniforms, CAUSTIC);
    sh.vertexShader = 'varying vec3 vCaW;\n' + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
      { vec4 cw = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          cw = instanceMatrix * cw;
        #endif
        vCaW = ( modelMatrix * cw ).xyz; }`);
    sh.fragmentShader = 'varying vec3 vCaW;\nuniform sampler2D uCaTex; uniform float uCaTime; uniform float uCaStr; uniform vec3 uCaCol;\n' +
      sh.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
      {
        vec3 nW = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
        float up = smoothstep( 0.05, 0.75, nW.y );
        vec2 p = vCaW.xz * 0.115 + vec2( sin( vCaW.z * 0.21 + uCaTime * 0.3 ), cos( vCaW.x * 0.19 - uCaTime * 0.25 ) ) * 0.035;
        float c1 = texture2D( uCaTex, p + vec2( uCaTime * 0.031, uCaTime * 0.017 ) ).r;
        float c2 = texture2D( uCaTex, p * 1.37 + vec2( -uCaTime * 0.022, uCaTime * 0.027 ) + 0.5 ).r;
        float ca = min( c1, c2 ) * 1.7 + c1 * c2 * 0.9;
        reflectedLight.directDiffuse += diffuseColor.rgb * uCaCol * ca * up * uCaStr;
      }`);
  };
  const pk = prev ? prev.toString() : '';
  m.customProgramCacheKey = () => pk + '|caustics';
  m.needsUpdate = true;
}

// ---- 3. fascio della torcia visibile nell'acqua (luce diffusa dalle particelle sospese) ----
export function makeBeam(angle, range) {
  const len = range * 0.75, rad = Math.tan(angle) * len;
  const geo = new THREE.ConeGeometry(rad, len, 40, 12, true);
  geo.translate(0, -len / 2, 0); geo.rotateX(-Math.PI / 2);   // apice nell'origine, apertura verso -z (davanti alla camera)
  const mat = new THREE.ShaderMaterial({
    uniforms: { uOn: { value: 0 }, uLen: { value: len }, uTime: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uOn; uniform float uLen; uniform float uTime; varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){
        float t = clamp(-vP.z / uLen, 0., 1.);
        float along = pow(1. - t, 1.6) * smoothstep(0.0, 0.08, t);
        float edge = pow(abs(dot(vN, vV)), 1.3);          // più denso verso l'asse del fascio
        float flick = 0.94 + 0.06 * sin(uTime * 7.0 + vP.z * 0.8);
        gl_FragColor = vec4(vec3(0.62, 0.8, 0.86) * along * edge * flick * uOn * 0.085, 1.);
      }`,
  });
  const beam = new THREE.Mesh(geo, mat);
  beam.frustumCulled = false; beam.renderOrder = 5;
  return beam;
}
