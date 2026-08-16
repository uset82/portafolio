import * as THREE from "three";
import { PROJECTS, ORBIT_CONFIG as CFG } from "./projects.js";
import { iconCanvas } from "./icons.js";
import {
  getOrbitPosition,
  nodeAngle,
  shortestDelta,
  depth01,
  easeInOutCubic,
  damp,
} from "./orbit-math.js";

const COLORS = {
  brass: 0xb8934f,
  brassDim: 0x8a6a3c,
  bronze: 0x5d4526,
  graphite: 0x14100c,
  housing: 0x1a1511,
  ivory: 0xf4e3c6,
  taupe: 0xa38772,
};

export function createProjectOrbit(root) {
  const canvasHost = root.querySelector("[data-orbit-canvas]");
  const labelLayer = root.querySelector("[data-orbit-labels]");
  const panel = root.querySelector("[data-orbit-panel]");
  const projects = PROJECTS.filter((p) => p.enabled);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
  } catch (err) {
    root.dataset.orbitState = "fallback";
    return null;
  }
  if (!renderer.getContext()) {
    root.dataset.orbitState = "fallback";
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  canvasHost.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "pan-y";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 2, 0.1, 100);
  const world = new THREE.Group();
  scene.add(world);

  /* ---------- warm studio environment (metal needs reflections) ---------- */
  const envCanvas = document.createElement("canvas");
  envCanvas.width = 64;
  envCanvas.height = 256;
  {
    const g = envCanvas.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#6b543c");
    grad.addColorStop(0.42, "#2b211a");
    grad.addColorStop(0.6, "#120e0a");
    grad.addColorStop(1, "#070605");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 256);
    g.fillStyle = "rgba(255, 226, 178, 0.85)";
    g.fillRect(0, 22, 64, 26);
  }
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0x4a3a2a, 0.5));
  const key = new THREE.DirectionalLight(0xffd9a3, 1.45);
  key.position.set(-4.5, 8, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc17a, 0.7);
  rim.position.set(6, 3.5, -6);
  scene.add(rim);
  const core = new THREE.PointLight(0xffb972, 3.4, 11, 2.1);
  core.position.set(0, 0.7, 2.4);
  scene.add(core);

  /* ---------------------------- materials ---------------------------- */
  const matBrass = new THREE.MeshStandardMaterial({
    name: "antique-brass",
    color: COLORS.brass,
    metalness: 0.95,
    roughness: 0.28,
  });
  const matBronze = new THREE.MeshStandardMaterial({
    name: "blackened-bronze",
    color: COLORS.bronze,
    metalness: 0.9,
    roughness: 0.42,
  });
  const matGraphite = new THREE.MeshStandardMaterial({
    name: "graphite",
    color: COLORS.graphite,
    metalness: 0.42,
    roughness: 0.55,
  });
  const matHousing = new THREE.MeshStandardMaterial({
    name: "node-housing",
    color: COLORS.housing,
    metalness: 0.5,
    roughness: 0.5,
  });

  /* ------------------------------ rails ------------------------------ */
  function railCurve(rx, rz) {
    const curve = new THREE.EllipseCurve(0, 0, rx, rz, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y));
    return new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5);
  }
  const rails = new THREE.Group();
  const railSpecs = [
    { rx: CFG.radiusX, rz: CFG.radiusZ, r: 0.05, mat: matBrass, y: 0 },
    { rx: CFG.radiusX - 0.34, rz: CFG.radiusZ - 0.26, r: 0.028, mat: matBronze, y: -0.02 },
    { rx: CFG.radiusX + 0.38, rz: CFG.radiusZ + 0.3, r: 0.016, mat: matBronze, y: -0.05 },
  ];
  railSpecs.forEach((s) => {
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve(s.rx, s.rz), 300, s.r, 14, true),
      s.mat
    );
    tube.name = `rail-${s.r}`;
    tube.position.y = s.y;
    rails.add(tube);
  });
  world.add(rails);

  // Faint instrument arc between rail and medallion.
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.004, 4, 200),
    new THREE.MeshBasicMaterial({ color: COLORS.taupe, transparent: true, opacity: 0.1 })
  );
  arc.rotation.x = Math.PI / 2;
  arc.scale.set(CFG.radiusX * 0.66, CFG.radiusZ * 0.66, 1);
  world.add(arc);

  /* ---------------------------- medallion ---------------------------- */
  const medallion = new THREE.Group();
  medallion.position.y = 0.16;
  world.add(medallion);
  const R = 1.7;
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 72), matGraphite);
  face.name = "medallion-face";
  medallion.add(face);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(R + 0.02, 0.085, 18, 96), matBrass);
  bezel.name = "medallion-rim";
  medallion.add(bezel);
  const bezelOuter = new THREE.Mesh(
    new THREE.TorusGeometry(R + 0.2, 0.02, 10, 96),
    matBronze
  );
  medallion.add(bezelOuter);

  const logoTex = new THREE.TextureLoader().load("assets/ca2m-mark.png", () => {
    repaint();
  });
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.anisotropy = 4;
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
  const logoSpinner = new THREE.Group();
  logoSpinner.position.z = 0.06;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.34, R * 1.34), logoMat);
  logo.name = "cam2-mark";
  logoSpinner.add(logo);
  // Back face carries the same mark, so the spin never shows a mirrored logo.
  const logoBack = new THREE.Mesh(logo.geometry, logoMat);
  logoBack.rotation.y = Math.PI;
  logoSpinner.add(logoBack);
  medallion.add(logoSpinner);

  // Soft specular sheen across the mark — a bright reflection, not a light rig.
  const sheenCanvas = document.createElement("canvas");
  sheenCanvas.width = sheenCanvas.height = 256;
  {
    const g = sheenCanvas.getContext("2d");
    const rad = g.createRadialGradient(96, 78, 4, 128, 128, 132);
    rad.addColorStop(0, "rgba(255, 244, 222, 0.5)");
    rad.addColorStop(0.34, "rgba(255, 219, 168, 0.15)");
    rad.addColorStop(1, "rgba(255, 200, 140, 0)");
    g.fillStyle = rad;
    g.beginPath();
    g.arc(128, 128, 128, 0, Math.PI * 2);
    g.fill();
  }
  const sheenTex = new THREE.CanvasTexture(sheenCanvas);
  sheenTex.colorSpace = THREE.SRGBColorSpace;
  const sheen = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.02, 64),
    new THREE.MeshBasicMaterial({
      map: sheenTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  sheen.name = "medallion-sheen";
  sheen.position.z = 0.08;
  medallion.add(sheen);

  // Sun glow: warm light cast outward from the mark.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 256;
  {
    const g = glowCanvas.getContext("2d");
    const rad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    rad.addColorStop(0, "rgba(255, 232, 188, 0.72)");
    rad.addColorStop(0.2, "rgba(233, 178, 105, 0.28)");
    rad.addColorStop(0.5, "rgba(160, 104, 48, 0.09)");
    rad.addColorStop(1, "rgba(90, 55, 20, 0)");
    g.fillStyle = rad;
    g.fillRect(0, 0, 256, 256);
  }
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5,
    })
  );
  sunGlow.name = "sun-glow";
  sunGlow.position.set(0, 0.16, -0.05);
  sunGlow.scale.setScalar(R * 3.6);
  world.add(sunGlow);

  /* -------------------------- bearing balls -------------------------- */
  const ballCount = window.innerWidth < 760 ? 14 : CFG.bearingBalls;
  const balls = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.088, 18, 12),
    new THREE.MeshStandardMaterial({
      name: "polished-brass",
      color: 0xd7ae70,
      metalness: 1,
      roughness: 0.14,
    }),
    ballCount
  );
  balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  balls.frustumCulled = false;
  world.add(balls);
  const ballOffsets = Array.from(
    { length: ballCount },
    (_, i) => (i / ballCount) * Math.PI * 2 + 0.14
  );
  const dummy = new THREE.Object3D();

  /* ---------------------- calibration dot lines ---------------------- */
  const DOTS = 6;
  const dotGeo = new THREE.BufferGeometry();
  const dotPos = new Float32Array(projects.length * DOTS * 3);
  dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
  const dotLines = new THREE.Points(
    dotGeo,
    new THREE.PointsMaterial({
      color: COLORS.taupe,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
  );
  world.add(dotLines);

  /* ------------------------------ nodes ------------------------------ */
  const NODE_R = 0.56;
  const housingGeo = new THREE.CylinderGeometry(NODE_R, NODE_R, 0.13, 48);
  const ringGeo = new THREE.TorusGeometry(NODE_R + 0.015, 0.032, 12, 64);
  const faceGeo = new THREE.CircleGeometry(NODE_R - 0.03, 48);
  const hitGeo = new THREE.SphereGeometry(NODE_R + 0.24, 10, 8);
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

  const nodes = projects.map((project, i) => {
    const group = new THREE.Group();
    group.name = `node-${project.id}`;

    const housing = new THREE.Mesh(housingGeo, matHousing);
    housing.rotation.x = Math.PI / 2;
    group.add(housing);

    const ring = new THREE.Mesh(ringGeo, matBrass.clone());
    ring.position.z = 0.02;
    group.add(ring);

    const disc = new THREE.Mesh(faceGeo, matGraphite);
    disc.position.z = 0.075;
    group.add(disc);

    const iconTex = new THREE.CanvasTexture(iconCanvas(project.icon));
    iconTex.colorSpace = THREE.SRGBColorSpace;
    const icon = new THREE.Mesh(
      new THREE.PlaneGeometry(NODE_R * 1.24, NODE_R * 1.24),
      new THREE.MeshBasicMaterial({ map: iconTex, transparent: true, opacity: 0.9 })
    );
    icon.position.z = 0.085;
    group.add(icon);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(NODE_R + 0.07, NODE_R + 0.2, 64),
      new THREE.MeshBasicMaterial({
        color: 0xe8b06a,
        transparent: true,
        opacity: project.featured ? 0.32 : 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    halo.position.z = 0.01;
    group.add(halo);

    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.userData.projectId = project.id;
    group.add(hit);

    world.add(group);
    return { project, group, ring, icon, halo, hit, index: i, scale: 1, glow: 0 };
  });

  /* ----------------------------- labels ----------------------------- */
  const labels = nodes.map(({ project }) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "orbit-label";
    el.textContent = project.name;
    el.dataset.projectId = project.id;
    el.tabIndex = -1;
    el.setAttribute("aria-hidden", "true");
    el.addEventListener("click", () => selectProject(project.id));
    labelLayer.appendChild(el);
    return el;
  });

  /* ------------------------------ state ------------------------------ */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let rotation = Math.PI / 2 - (0 / projects.length) * Math.PI * 2; // ASTRAEA up top
  rotation = -Math.PI / 2;
  let velocity = 0;
  let paused = false;
  let inView = true;
  let hoveredId = null;
  let selectedId = null;
  let focusFrom = 0;
  let focusTo = 0;
  let focusStart = 0;
  let focusing = false;
  let speedScale = 1;
  const baseSpeed = (Math.PI * 2) / CFG.revolutionSeconds;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const parallax = new THREE.Vector2();
  const parallaxTarget = new THREE.Vector2();
  const hitMeshes = nodes.map((n) => n.hit);
  const tmp = new THREE.Vector3();

  /* --------------------------- layout / size --------------------------- */
  let rect = { width: 1, height: 1 };
  function layout() {
    rect = canvasHost.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w < 760;
    world.scale.setScalar(narrow ? 0.82 : 1);
    // Leave real pixel room outside the ellipse for the side labels.
    const marginPx = Math.min(260, Math.max(200, w * 0.17));
    const fitX = CFG.radiusX * (narrow ? 0.82 : 1) * (w / 2) / Math.max(60, w / 2 - marginPx);
    const dist = Math.max(
      10.5,
      fitX / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect)
    );
    // ~52° elevation: the flattened ellipse reads as an ellipse, not a line.
    camera.position.set(0, dist * 0.788, dist * 0.616);
    camera.lookAt(0, -0.3, 0);
    camera.updateProjectionMatrix();
  }
  layout();
  new ResizeObserver(() => {
    layout();
    repaint();
  }).observe(canvasHost);

  /* --------------------------- interactions --------------------------- */
  let pointerDown = null;
  let dragging = false;
  const el = renderer.domElement;

  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    parallaxTarget.set(pointer.x, pointer.y);
    if (pointerDown) {
      const dx = e.clientX - pointerDown.x;
      const dy = e.clientY - pointerDown.y;
      if (!dragging && Math.hypot(dx, dy) > CFG.dragThresholdPx) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        root.dataset.orbitDrag = "true";
      }
      if (dragging) {
        const step = -(e.clientX - pointerDown.last) * 0.0042;
        rotation += step;
        velocity = step;
        pointerDown.last = e.clientX;
        focusing = false;
      }
    } else {
      updateHover();
    }
  });

  el.addEventListener("pointerdown", (e) => {
    pointerDown = { x: e.clientX, y: e.clientY, last: e.clientX, id: e.pointerId };
  });

  el.addEventListener("pointerup", (e) => {
    const wasDrag = dragging;
    if (dragging && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    dragging = false;
    pointerDown = null;
    delete root.dataset.orbitDrag;
    if (wasDrag) return;
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const hit = pick();
    if (hit) {
      if (CFG.openOnFirstClick || selectedId === hit) openProject(hit);
      else selectProject(hit);
    } else {
      clearSelection();
    }
  });

  el.addEventListener("pointerleave", () => {
    hoveredId = null;
    parallaxTarget.set(0, 0);
    el.style.cursor = "default";
  });

  el.addEventListener("dblclick", () => {
    const hit = pick();
    if (hit) openProject(hit);
  });

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitMeshes, false);
    return hits.length ? hits[0].object.userData.projectId : null;
  }

  function updateHover() {
    const id = pick();
    if (id !== hoveredId) {
      hoveredId = id;
      el.style.cursor = id ? "pointer" : "default";
    }
  }

  /* ------------------------------ panel ------------------------------ */
  function actionsFor(p) {
    const list = [];
    if (p.liveUrl) list.push({ label: "Open App ↗", href: p.liveUrl, external: true, primary: true });
    if (p.internalRoute && p.destinationType === "internal-route")
      list.push({ label: "View Project", href: p.internalRoute, primary: !list.length });
    if (p.githubUrl) list.push({ label: "GitHub", href: p.githubUrl, external: true, primary: !list.length });
    if (p.agentId) list.push({ label: "Ask ANA", href: `#ana=${p.agentId}`, agent: p.agentId });
    return list;
  }

  function renderPanel(p) {
    if (!p) {
      panel.dataset.open = "false";
      panel.innerHTML = "";
      return;
    }
    panel.dataset.open = "true";
    panel.innerHTML = "";
    const name = document.createElement("h3");
    name.className = "orbit-panel__name";
    name.textContent = p.name;
    const desc = document.createElement("p");
    desc.className = "orbit-panel__desc";
    desc.textContent = p.description || "";
    const row = document.createElement("div");
    row.className = "orbit-panel__actions";
    actionsFor(p).forEach((a) => {
      const link = document.createElement("a");
      link.className = "orbit-action" + (a.primary ? " orbit-action--primary" : "");
      link.textContent = a.label;
      link.href = a.href;
      if (a.external) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      if (a.agent) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          activateAgent(a.agent);
        });
      }
      row.appendChild(link);
    });
    const close = document.createElement("button");
    close.type = "button";
    close.className = "orbit-panel__close";
    close.setAttribute("aria-label", "Close project details");
    close.textContent = "×";
    close.addEventListener("click", clearSelection);
    panel.append(name, desc, row, close);
  }

  /* -------------------------- public orbit API -------------------------- */
  function emit(type, detail) {
    root.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  }

  function focusProject(id) {
    const node = nodes.find((n) => n.project.id === id);
    if (!node) return;
    const base = (node.index / projects.length) * Math.PI * 2;
    const target = CFG.focusAngle - base;
    const delta = shortestDelta(rotation, target);
    focusFrom = rotation;
    focusTo = rotation + delta;
    focusStart = performance.now();
    focusing = true;
    velocity = 0;
  }

  function selectProject(id) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    selectedId = id;
    focusProject(id);
    renderPanel(project);
    root.querySelectorAll("[data-orbit-fallback] a").forEach((a) => {
      a.setAttribute("aria-current", a.dataset.projectId === id ? "true" : "false");
    });
    emit("orbit:select", { project });
  }

  function clearSelection() {
    if (!selectedId) return;
    selectedId = null;
    renderPanel(null);
    emit("orbit:select", { project: null });
  }

  function openProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    emit("orbit:open", { project: p });
    switch (p.destinationType) {
      case "external-app":
      case "github":
        window.open(p.liveUrl || p.githubUrl || p.href, "_blank", "noopener,noreferrer");
        break;
      case "agent":
        activateAgent(p.agentId);
        break;
      default:
        window.location.href = p.internalRoute || p.href;
    }
  }

  const activateProject = (id) => {
    selectProject(id);
    window.setTimeout(() => openProject(id), CFG.focusDurationMs);
  };
  const activateAgent = (agentId) => emit("orbit:agent", { agentId });
  const activateAgentFlow = (sourceId, targetId) =>
    emit("orbit:agent-flow", { sourceId, targetId });
  const pauseOrbit = () => (paused = true);
  const resumeOrbit = () => (paused = false);
  const resetOrbit = () => {
    clearSelection();
    focusing = false;
    velocity = 0;
    rotation = -Math.PI / 2;
    paused = false;
  };

  /* ------------------- keyboard / semantic fallback ------------------- */
  root.querySelectorAll("[data-orbit-fallback] a").forEach((a) => {
    a.addEventListener("focus", () => selectProject(a.dataset.projectId));
    a.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault();
        selectProject(a.dataset.projectId);
      }
    });
  });

  /* ------------------------------ loop ------------------------------ */
  const io = new IntersectionObserver(
    (entries) => (inView = entries[0].isIntersecting),
    { threshold: 0.05 }
  );
  io.observe(root);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) last = performance.now();
  });

  let last = performance.now();
  let entrance = 0;
  let logoSpin = 0;
  let hasPainted = false;
  let loopRan = false;
  // Re-render at the CURRENT visual state without advancing the entrance ramp.
  function repaint() {
    if (!hasPainted) return;
    const held = entrance;
    entrance = loopRan ? held : 1;
    step(performance.now(), 0);
    entrance = held;
  }
  root.dataset.orbitState = "ready";

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden || !inView) {
      // Loop never ran: keep the at-rest frame on screen so the section is
      // never blank (hidden tab, throttled rAF, screenshot/print capture).
      if (!loopRan) repaint();
      return;
    }
    loopRan = true;
    step(now, dt);
  }

  function step(now, dt) {
    const reduce = reduced.matches;
    entrance = Math.min(1, entrance + dt / (reduce ? 0.2 : 1.4));
    const e = easeInOutCubic(entrance);

    // rotation: focus animation > drag inertia > idle clockwork
    if (focusing) {
      const t = Math.min(1, (now - focusStart) / (reduce ? 160 : CFG.focusDurationMs));
      rotation = focusFrom + (focusTo - focusFrom) * easeInOutCubic(t);
      if (t >= 1) focusing = false;
    } else if (Math.abs(velocity) > 0.00002) {
      rotation += velocity;
      velocity *= 0.93;
    } else if (!paused && !selectedId && !reduce && !dragging) {
      const wanted = hoveredId ? CFG.hoverSlowFactor : 1;
      speedScale = damp(speedScale, wanted, 6, dt);
      rotation += baseSpeed * dt * speedScale; // clockwise from the viewer
    }

    // medallion parallax
    parallax.lerp(parallaxTarget, 1 - Math.exp(-5 * dt));
    medallion.lookAt(camera.position);
    medallion.rotation.x += parallax.y * 0.05;
    medallion.rotation.y += parallax.x * 0.05;
    // solar breathing on the reflection
    const breathe = 0.5 + 0.5 * Math.sin(now / 3400);
    sheen.material.opacity = (0.7 + breathe * 0.3) * e;
    sunGlow.material.opacity = (0.22 + breathe * 0.09) * e;
    sunGlow.scale.setScalar(R * (3.5 + breathe * 0.3) * (0.75 + 0.25 * e));
    core.intensity = (2.4 + breathe * 0.6) * e;
    medallion.scale.setScalar(0.6 + 0.4 * e);
    logo.material.opacity = e;
    // The sun turns counter-clockwise on its vertical axis; the ring of
    // projects runs clockwise around it.
    if (!reduce) logoSpin += dt * ((Math.PI * 2) / 26);
    logoSpinner.rotation.y = logoSpin;
    rails.children.forEach((r, i) => {
      r.visible = e > 0.12 + i * 0.06;
    });

    // nodes
    const cx = camera.position;
    const panelBox =
      panel.dataset.open === "true"
        ? (() => {
            const p = panel.getBoundingClientRect();
            const l = labelLayer.getBoundingClientRect();
            return { x: p.left - l.left, y: p.top - l.top, w: p.width, h: p.height };
          })()
        : null;
    camera.updateMatrixWorld();
    world.updateMatrixWorld();
    nodes.forEach((n, i) => {
      const a = nodeAngle(n.index, projects.length, rotation);
      const p = getOrbitPosition(a, CFG.radiusX, CFG.radiusZ, 0.16);
      n.group.position.set(p.x, p.y, p.z);
      n.group.lookAt(cx);

      const d = depth01(p.z, CFG.radiusZ);
      const isSel = n.project.id === selectedId;
      const isHover = n.project.id === hoveredId;
      const target =
        (0.84 + d * 0.26) * (isSel ? 1.16 : isHover ? 1.07 : 1) *
        Math.min(1, Math.max(0, (entrance - i * 0.045) * 3.4));
      n.scale = damp(n.scale, Math.max(0.001, target), 12, dt);
      n.group.scale.setScalar(n.scale);

      const glowTarget = isSel ? 1 : isHover ? 0.7 : 0;
      n.glow = damp(n.glow, glowTarget, 9, dt);
      n.ring.material.color
        .setHex(COLORS.brass)
        .lerp(new THREE.Color(0xffe0ac), n.glow * 0.8)
        .multiplyScalar(0.62 + d * 0.38);
      n.icon.material.opacity = (0.6 + d * 0.32) * (0.85 + n.glow * 0.15);
      if (n.project.featured || n.glow > 0.01) {
        n.halo.material.opacity =
          (n.project.featured ? 0.16 + Math.sin(now / 900) * 0.05 : 0) + n.glow * 0.3;
      }

      // dotted calibration line toward CAM²
      for (let k = 0; k < DOTS; k++) {
        const t = 0.34 + (k / (DOTS - 1)) * 0.52;
        const idx = (i * DOTS + k) * 3;
        dotPos[idx] = p.x * (1 - t);
        dotPos[idx + 1] = 0.16;
        dotPos[idx + 2] = p.z * (1 - t);
      }

      // label
      const label = labels[i];
      tmp.copy(n.group.position).applyMatrix4(world.matrixWorld).project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * rect.width;
      const sy = (-tmp.y * 0.5 + 0.5) * rect.height;
      const off = 52 * n.scale * world.scale.x;
      const cosA = Math.cos(a);
      let tx = "translate(-50%, -50%)";
      let px = sx;
      let py = sy;
      if (cosA < -0.28) {
        tx = "translate(-100%, -50%)";
        px = sx - off;
      } else if (cosA > 0.28) {
        tx = "translate(0, -50%)";
        px = sx + off;
      } else if (Math.sin(a) > 0) {
        tx = "translate(-50%, 0)";
        py = sy + off * 0.86;
      } else {
        tx = "translate(-50%, -100%)";
        py = sy - off * 0.86;
      }
      label.style.transform = `translate(${px}px, ${py}px) ${tx}`;
      const narrow = rect.width < 760;
      let vis = narrow ? (isSel || isHover ? 1 : d > 0.55 ? 0.85 : 0) : 0.45 + d * 0.55;
      if (panelBox) {
        if (!label._w) {
          label._w = label.offsetWidth;
          label._h = label.offsetHeight;
        }
        const lx = px - (tx.startsWith("translate(-100%") ? label._w : tx.startsWith("translate(-50%") ? label._w / 2 : 0);
        const ly = py - (tx.endsWith("-100%)") ? label._h : tx.endsWith("-50%)") ? label._h / 2 : 0);
        const hitsPanel =
          lx < panelBox.x + panelBox.w &&
          lx + label._w > panelBox.x &&
          ly < panelBox.y + panelBox.h &&
          ly + label._h > panelBox.y;
        if (hitsPanel) vis = 0;
      }
      label.style.opacity = (vis * e).toFixed(3);
      label.style.zIndex = String(100 + Math.round(d * 100));
      label.dataset.active = isSel || isHover ? "true" : "false";
    });
    dotGeo.attributes.position.needsUpdate = true;
    dotLines.material.opacity = 0.8 * e;

    // bearing balls — same channel, slightly faster
    const ballRot = rotation * 1.45;
    for (let i = 0; i < ballCount; i++) {
      const a = ballOffsets[i] + ballRot;
      const p = getOrbitPosition(a, CFG.radiusX, CFG.radiusZ, 0.16);
      dummy.position.set(p.x, p.y + 0.055, p.z);
      dummy.scale.setScalar(e);
      dummy.updateMatrix();
      balls.setMatrixAt(i, dummy.matrix);
    }
    balls.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
    hasPainted = true;
  }

  // Paint one assembled frame synchronously. When rAF runs (visible page) the
  // entrance flourish overwrites it before the first composite; when the page
  // is hidden/throttled the section still shows the instrument at rest.
  entrance = 1;
  step(performance.now(), 0.016);
  entrance = 0;
  requestAnimationFrame(frame);

  const api = {
    selectProject,
    focusProject,
    activateProject,
    openProject,
    activateAgent,
    activateAgentFlow,
    pauseOrbit,
    resumeOrbit,
    resetOrbit,
    get rotation() {
      return rotation;
    },
    get selectedProjectId() {
      return selectedId;
    },
    projects,
    // Verification hook: paint one frame immediately, fully entered.
    renderNow(advance = 0) {
      entrance = 1;
      rotation += baseSpeed * advance;
      step(performance.now(), 0.016);
    },
  };
  return api;
}
