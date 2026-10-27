// I tre reperti: modelli 3D generati (sostituibili con GLB), posizionati intorno al relitto
import * as THREE from '../vendor/three/three.module.min.js';
import { heightAt } from './world.js?v=beda70ae';
import { compassCard, plateTex, tagTex } from './textures.js?v=beda70ae';
import { CFG } from './config.js?v=beda70ae';

function glintTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(0.15, 'rgba(255,220,150,0.6)'); r.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(255,240,210,0.9)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(64, 8); g.lineTo(64, 120); g.moveTo(8, 64); g.lineTo(120, 64); g.stroke();
  return new THREE.CanvasTexture(c);
}

function makeCompass(brass) {
  const g = new THREE.Group();
  const prof = [[0, 0], [0.13, 0], [0.15, 0.02], [0.155, 0.07], [0.14, 0.085], [0.125, 0.07], [0.12, 0.03], [0, 0.03]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), brass));
  const card = new THREE.Mesh(new THREE.CircleGeometry(0.118, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: compassCard(CFG.artifacts[0].digit), roughness: 0.7 }));
  card.position.y = 0.045; g.add(card);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.125, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9fc6cc, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1 }));
  glass.position.y = 0.07; g.add(glass);
  const gimbal = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 8, 40), brass); gimbal.rotation.x = Math.PI / 2 + 0.3; gimbal.position.y = 0.04; g.add(gimbal);
  return g;
}

function makePlate(brass, rust) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.05, 0.85, 6, 1, 4), rust);
  const p = hull.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + Math.sin(p.getX(i) * 2) * 0.05 + p.getZ(i) * p.getZ(i) * 0.08);
  hull.geometry.computeVertexNormals(); g.add(hull);
  const face = new THREE.MeshStandardMaterial({ map: plateTex(CFG.artifacts[1].digit), metalness: 0.85, roughness: 0.45 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.28), [brass, brass, face, brass, brass, brass]);
  plate.position.set(0.1, 0.06, -0.05); g.add(plate);
  for (const [x, z] of [[-0.09, -0.17], [0.29, -0.17], [-0.09, 0.07], [0.29, 0.07]]) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), brass); r.position.set(x, 0.072, z); g.add(r); }
  return g;
}

function makeKey(brass) {
  const g = new THREE.Group();
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 10, 28), brass); bow.rotation.x = Math.PI / 2; bow.position.x = -0.18; g.add(bow);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 12).rotateZ(Math.PI / 2), brass); shaft.position.x = 0.02; g.add(shaft);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12).rotateZ(Math.PI / 2), brass); collar.position.x = -0.1; g.add(collar);
  for (const [x, h] of [[0.12, 0.05], [0.155, 0.035]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, h), brass); b.position.set(x, 0, h / 2 + 0.01); g.add(b); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 16), brass); ring.position.set(-0.24, 0, 0.02); ring.rotation.x = Math.PI / 2; g.add(ring);
  const tag = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tagTex(CFG.artifacts[2].digit), metalness: 0.8, roughness: 0.45 }));
  tag.position.set(-0.29, 0.004, 0.06); g.add(tag);
  g.scale.setScalar(1.25);
  return g;
}

export function buildArtifacts(scene, wreck, tex) {
  const brass = wreck.materials.brass.clone();
  brass.emissive = new THREE.Color(0xb08d57); brass.emissiveIntensity = 0;
  const sandM = new THREE.MeshStandardMaterial({ map: tex.sand.map, normalMap: tex.sand.normalMap, roughness: 1 });
  const glint = glintTex();
  const list = [];
  const place = (id, obj, pos, rot, hitR) => {
    obj.position.copy(pos); obj.rotation.copy(rot);
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(obj);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glint, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sp.scale.setScalar(0.5); sp.position.copy(pos).add(new THREE.Vector3(0, 0.12, 0)); scene.add(sp);
    const a = CFG.artifacts.find((x) => x.id === id);
    list.push({ ...a, obj, glint: sp, hitR, home: { pos: pos.clone(), rot: rot.clone() }, center: pos.clone().add(new THREE.Vector3(0, 0.08, 0)), taken: false });
  };

  // 1. bussola: semisepolta nella sabbia vicino alla poppa, tra le casse cadute
  {
    const w = wreck.toW(-9.6, 0, -7.4); w.y = heightAt(w.x, w.z) - 0.03;
    place('bussola', makeCompass(brass), w, new THREE.Euler(0.32, 0.6, 0.12), 0.5);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10).scale(1.2, 0.35, 0.8), sandM); mound.position.copy(w).add(new THREE.Vector3(0.12, 0.02, 0.05)); scene.add(mound);
    list[list.length - 1].extra = [mound];
  }
  // 2. targhetta: rivettata a un pezzo di scafo staccato, appoggiato sul fondale davanti allo squarcio
  {
    const w = wreck.toW(7.6, 0, -7.6); w.y = heightAt(w.x, w.z) + 0.18;
    place('targhetta', makePlate(brass, wreck.materials.rust), w, new THREE.Euler(-0.35, 1.9, 0.2), 0.7);
  }
  // 3. chiave: sotto la catena dell'ancora
  {
    const p = wreck.chainCurve.getPointAt(0.8), t = wreck.chainCurve.getTangentAt(0.8);
    const sideV = new THREE.Vector3(-t.z, 0, t.x).normalize();
    const w = p.clone().addScaledVector(sideV, 0.18); w.y = heightAt(w.x, w.z) + 0.03;
    place('chiave', makeKey(brass), w, new THREE.Euler(0, Math.atan2(t.x, t.z) + 0.9, 0), 0.45);
  }

  return {
    list, brass,
    reset() {
      for (const a of list) {
        a.taken = false; a.obj.visible = true; a.obj.position.copy(a.home.pos); a.obj.rotation.copy(a.home.rot); a.obj.scale.setScalar(a.id === 'chiave' ? 1.25 : 1);
        if (a.obj.parent !== scene) scene.add(a.obj);
        (a.extra || []).forEach((m) => { m.visible = true; });
      }
    },
  };
}
