import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// level: -1 მიწისქვეშა, 0 პირველი, 1 მეორე სართული
const FLOOR_Y = { '-1': -1, '0': 0, '1': 1 };

const zones = [
  { name:'მიწისქვეშა პარკინგი', type:'parking', x:0, z:0, w:14, d:8, h:1, level:-1, color:0x44484f,
    info:'ელექტრომობილების დამტენებით აღჭურვილი მიწისქვეშა საპარკინგე ზონა.' },
  { name:'საცურაო აუზი', type:'pool', x:-5, z:-2.5, w:4, d:3, h:1, level:0, color:0xcfd8dc,
    info:'საცურაო აუზი ბილიკებით და დასასვენებელი ზონით.' },
  { name:'ყინულის სასრიალო', type:'ice', x:0, z:-2.5, w:5, d:3, h:1, level:0, color:0x78909c,
    info:'ყინულის მოედანი ჰოკეისა და ფიგურული სრიალისთვის.' },
  { name:'საფეხბურთო მოედანი', type:'field', x:6, z:-2, w:4, d:4, h:0.3, level:0, color:0x2e7d32,
    info:'გარე საფეხბურთო მოედანი.' },
  { name:'გარე საკალათბურთო მოედნები', type:'court', x:-5, z:2.5, w:3, d:2.5, h:0.3, level:0, color:0xd9531e,
    info:'ორი გარე საკალათბურთო მოედანი.' },
  { name:'სამედიცინო დახმარება', type:'medical', x:-1.5, z:2.5, w:2.5, d:2, h:1, level:0, color:0xeceff1,
    info:'პირველადი დახმარება და ფიზიოთერაპია.' },
  { name:'სპორტული მაღაზია', type:'shop', x:1.5, z:2.5, w:2, d:2, h:1, level:0, color:0xfdd835,
    info:'პროტეინები, სპორტული დანამატები და ინვენტარი.' },
  { name:'გასახდელები და შხაპები', type:'plain', x:4, z:2.5, w:2, d:2, h:1, level:0, color:0x8d6e63,
    info:'ჭკვიანი კარადები, შხაპები და აბაზანები. ჭკვიანი ჟილეტები აგროვებს მონაცემებს.', img:'/img/vest.jpg' },
  { name:'საკალათბურთო დარბაზი', type:'court', x:-3, z:0, w:5, d:4, h:1.2, level:1, color:0xe07a3f,
    info:'შიდა საკალათბურთო მოედანი მაყურებლის ადგილებით.' },
  { name:'კრივის დარბაზი', type:'ring', x:3, z:0, w:4, d:4, h:1.2, level:1, color:0x6a1b9a,
    info:'კრივის რინგი და ტრენაჟორები.' },
  { name:'AI ტესტირების ზონა', type:'ai', x:0, z:3.2, w:5, d:2, h:1.2, level:1, color:0xe10613,
    info:'ლაბორატორია, სადაც კამერები და AI აანალიზებენ მოძრაობას.', img:'/img/ai.png' },
];

const $ = (id) => document.getElementById(id);
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
$('panel').style.display = 'none';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0c);
scene.fog = new THREE.Fog(0x0b0b0c, 35, 80);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(13, 9, 15);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 0.5, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 1.3);
sun.position.set(10, 20, 10);
scene.add(sun);
scene.add(new THREE.GridHelper(60, 60, 0xe10613, 0x1d1d22));

// ბაზა (პლინთი) და გარემო
const plinth = new THREE.Mesh(
  new THREE.BoxGeometry(24, 0.3, 15),
  new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.9 })
);
plinth.position.set(0.5, -1.15, 0);
scene.add(plinth);

function tree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
  trunk.position.y = 0.25;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
  crown.position.y = 1.2;
  g.add(trunk, crown);
  g.position.set(x, -1, z);
  scene.add(g);
}
[[-9,-5],[-9,-2],[-9,1],[-9,4],[-9,6],[10,3],[10,5.5],[8,6],[5,6],[2,6],[-2,6],[-6,6.5],[-10,-6],[10,-5]]
  .forEach(([x, z]) => tree(x, z));

// დეტალები ზონების თავზე
const mat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o });
function flat(w, d, y, color, opacity) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(color, opacity));
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  return m;
}
function rectLine(w, d, y, color = 0xffffff) {
  const p = [new THREE.Vector3(-w/2, y, -d/2), new THREE.Vector3(w/2, y, -d/2),
             new THREE.Vector3(w/2, y, d/2), new THREE.Vector3(-w/2, y, d/2)];
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(p), new THREE.LineBasicMaterial({ color }));
}
function addDetails(mesh, z) {
  const top = z.h / 2 + 0.02;
  switch (z.type) {
    case 'field': {
      mesh.add(rectLine(z.w * 0.92, z.d * 0.92, top));
      mesh.add(flat(0.05, z.d * 0.92, top, 0xffffff));
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.55, 32), mat(0xffffff));
      ring.rotation.x = -Math.PI / 2; ring.position.y = top; mesh.add(ring);
      break;
    }
    case 'pool': {
      mesh.add(flat(z.w - 0.4, z.d - 0.4, top, 0x29b6f6, 0.85));
      for (let i = 1; i < 5; i++) {
        const l = flat(z.w - 0.5, 0.03, top + 0.01, 0xffffff);
        l.position.z = -z.d / 2 + 0.2 + i * ((z.d - 0.4) / 5);
        mesh.add(l);
      }
      break;
    }
    case 'ice': {
      mesh.add(flat(z.w - 0.4, z.d - 0.4, top, 0xe3f2fd));
      mesh.add(flat(0.06, z.d - 0.4, top + 0.01, 0xe53935));
      mesh.add(rectLine(z.w - 0.4, z.d - 0.4, top + 0.01, 0x1e88e5));
      break;
    }
    case 'court': {
      mesh.add(rectLine(z.w * 0.9, z.d * 0.9, top));
      mesh.add(flat(0.05, z.d * 0.9, top, 0xffffff));
      break;
    }
    case 'parking': {
      for (let i = -6; i <= 6; i += 1.5) mesh.add(flat(0.05, 1.2, top, 0xffffff).translateX(i).translateY(0));
      break;
    }
    case 'ring': {
      mesh.add(flat(2, 2, top, 0xe10613));
      mesh.add(rectLine(2, 2, top + 0.15, 0xffffff));
      break;
    }
    case 'medical': {
      mesh.add(flat(0.9, 0.25, top, 0xe53935));
      mesh.add(flat(0.25, 0.9, top, 0xe53935));
      break;
    }
  }
}

// წარწერები
function makeLabel(text) {
  const c = document.createElement('canvas');
  c.width = 768; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(11,11,12,0.85)';
  g.fillRect(0, 0, 768, 128);
  g.fillStyle = '#e10613';
  g.fillRect(0, 0, 14, 128);
  g.fillStyle = '#ffffff';
  g.font = '600 38px "Noto Sans Georgian", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 394, 64);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  sp.scale.set(3.6, 0.6, 1);
  sp.renderOrder = 10;
  return sp;
}

const meshes = [];
zones.forEach((z) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(z.w, z.h, z.d),
    new THREE.MeshStandardMaterial({ color: z.color, emissive: 0x000000, roughness: 0.6 })
  );
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })));
  addDetails(mesh, z);
  z.baseY = FLOOR_Y[z.level] + z.h / 2;
  mesh.position.set(z.x, z.baseY, z.z);
  mesh.userData = z;
  scene.add(mesh);
  meshes.push(mesh);
});
document.fonts.load('600 38px "Noto Sans Georgian"').finally(() => {
  meshes.forEach((m) => {
    const l = makeLabel(m.userData.name);
    l.position.y = m.userData.h / 2 + 0.7;
    m.add(l);
  });
});

// დაშლა
let explode = 0;
$('explode').addEventListener('input', (e) => (explode = +e.target.value));

// hover / click
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2(9, 9);
let hovered = null;
let fly = null;

addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});

function select(mesh) {
  const z = mesh.userData;
  $('pt').textContent = z.name;
  $('pd').textContent = z.info;
  const img = $('pimg');
  if (z.img) { img.src = z.img; img.style.display = 'block'; } else { img.style.display = 'none'; }
  $('panel').style.display = 'block';
  const t = mesh.position.clone();
  fly = { target: t, camPos: t.clone().add(new THREE.Vector3(6, 5, 7)) };
}
canvas.addEventListener('click', () => { if (hovered) select(hovered); });
$('close').addEventListener('click', () => ($('panel').style.display = 'none'));
controls.addEventListener('start', () => (fly = null));

// ავტომატური ტური
let tourTimer = null, tourIdx = 0;
$('tour').addEventListener('click', () => {
  if (tourTimer) {
    clearInterval(tourTimer); tourTimer = null;
    $('tour').textContent = '▶ ავტომატური ტური';
    return;
  }
  $('tour').textContent = '■ ტურის გაჩერება';
  const step = () => { select(meshes[tourIdx % meshes.length]); tourIdx++; };
  step();
  tourTimer = setInterval(step, 4000);
});

function animate() {
  requestAnimationFrame(animate);
  meshes.forEach((m) => {
    const z = m.userData;
    const ty = z.baseY + z.level * explode * 4;
    m.position.y += (ty - m.position.y) * 0.1;
  });
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(meshes, false)[0]?.object || null;
  if (hit !== hovered) {
    if (hovered) hovered.material.emissive.setHex(0x000000);
    hovered = hit;
    if (hovered) hovered.material.emissive.setHex(0x661111);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  }
  if (fly) {
    controls.target.lerp(fly.target, 0.06);
    camera.position.lerp(fly.camPos, 0.04);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});