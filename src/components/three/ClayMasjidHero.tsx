'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ClayMasjidHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & Anti-Aliased Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      30,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Flat-plane perspective for clean unprojection calculations
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Procedural White Marble & Geometric Textures
    // A. Pure White Carrara Marble Texture
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 512;
    marbleCanvas.height = 512;
    const mCtx = marbleCanvas.getContext('2d')!;
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, 512, 512);
    mCtx.strokeStyle = 'rgba(215, 222, 228, 0.4)';
    mCtx.lineWidth = 1.6;
    for (let i = 0; i < 22; i++) {
      mCtx.beginPath();
      mCtx.moveTo(Math.random() * 512, 0);
      mCtx.bezierCurveTo(
        Math.random() * 512, 160,
        Math.random() * 512, 320,
        Math.random() * 512, 512
      );
      mCtx.stroke();
    }
    // Vertical facade panel dividers
    mCtx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
    mCtx.lineWidth = 3;
    for (let x = 0; x <= 512; x += 64) {
      mCtx.strokeRect(x + 4, 12, 56, 488);
    }
    const whiteMarbleTex = new THREE.CanvasTexture(marbleCanvas);
    whiteMarbleTex.wrapS = THREE.RepeatWrapping;
    whiteMarbleTex.wrapT = THREE.RepeatWrapping;

    // B. Upper Frieze with Gilded Fillets
    const friezeCanvas = document.createElement('canvas');
    friezeCanvas.width = 512;
    friezeCanvas.height = 256;
    const fCtx = friezeCanvas.getContext('2d')!;
    fCtx.fillStyle = '#f8fafc';
    fCtx.fillRect(0, 0, 512, 256);
    fCtx.fillStyle = '#f59e0b';
    fCtx.fillRect(0, 0, 512, 14);
    fCtx.fillRect(0, 242, 512, 14);
    fCtx.strokeStyle = '#e2e8f0';
    fCtx.lineWidth = 2;
    for (let x = 0; x <= 512; x += 32) {
      for (let y = 16; y < 240; y += 32) {
        fCtx.strokeRect(x, y, 32, 32);
        fCtx.fillStyle = '#fef3c7';
        fCtx.beginPath();
        fCtx.arc(x + 16, y + 16, 3.5, 0, Math.PI * 2);
        fCtx.fill();
      }
    }
    const friezeTex = new THREE.CanvasTexture(friezeCanvas);
    friezeTex.wrapS = THREE.RepeatWrapping;
    friezeTex.wrapT = THREE.RepeatWrapping;
    friezeTex.repeat.set(8, 1);

    // 3. Materials
    const whiteMarbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: whiteMarbleTex,
      roughness: 0.22,
      metalness: 0.04,
    });

    const upperFriezeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: friezeTex,
      roughness: 0.35,
      metalness: 0.08,
    });

    const stoneTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.05,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Radiant 24K polished gold
      roughness: 0.14,
      metalness: 0.95,
    });

    const windowGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
    });

    // 4. Mosque Group
    const mosqueGroup = new THREE.Group();

    // ==========================================
    // A. PRISTINE WHITE OCTAGONAL BASE
    // ==========================================
    const octagonRadius = 2.0;
    const lowerHeight = 0.55;
    const upperHeight = 0.55;

    // Lower Facade (Pure White Marble)
    const lowerOctagonGeo = new THREE.CylinderGeometry(
      octagonRadius,
      octagonRadius,
      lowerHeight,
      8,
      1,
      false
    );
    const lowerOctagon = new THREE.Mesh(lowerOctagonGeo, whiteMarbleMat);
    lowerOctagon.position.y = -0.62;
    mosqueGroup.add(lowerOctagon);

    // Upper Facade (White Frieze)
    const upperOctagonGeo = new THREE.CylinderGeometry(
      octagonRadius * 0.99,
      octagonRadius,
      upperHeight,
      8,
      1,
      false
    );
    const upperOctagon = new THREE.Mesh(upperOctagonGeo, upperFriezeMat);
    upperOctagon.position.y = -0.07;
    mosqueGroup.add(upperOctagon);

    // Cornice Balustrade & Trims
    const corniceGeo = new THREE.CylinderGeometry(
      octagonRadius * 1.025,
      octagonRadius * 0.99,
      0.1,
      8,
      1,
      false
    );
    const cornice = new THREE.Mesh(corniceGeo, stoneTrimMat);
    cornice.position.y = 0.23;
    mosqueGroup.add(cornice);

    const goldFillet = new THREE.Mesh(
      new THREE.CylinderGeometry(octagonRadius * 1.028, octagonRadius * 1.028, 0.02, 8),
      goldMat
    );
    goldFillet.position.y = 0.28;
    mosqueGroup.add(goldFillet);

    const roofDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(octagonRadius * 0.99, octagonRadius * 0.99, 0.04, 8),
      stoneTrimMat
    );
    roofDeck.position.y = 0.3;
    mosqueGroup.add(roofDeck);

    // 5 Arched Windows per Facet
    for (let f = 0; f < 8; f++) {
      const facetAngle = (f / 8) * Math.PI * 2 + Math.PI / 8;
      const facetDist = octagonRadius * 0.92;

      for (let w = -2; w <= 2; w++) {
        const offset = w * 0.23;
        const archMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.11, 0.26),
          windowGlowMat
        );
        const normalX = Math.cos(facetAngle);
        const normalZ = Math.sin(facetAngle);
        const tangentX = -Math.sin(facetAngle);
        const tangentZ = Math.cos(facetAngle);

        archMesh.position.set(
          normalX * facetDist + tangentX * offset,
          -0.06,
          normalZ * facetDist + tangentZ * offset
        );
        archMesh.rotation.y = -facetAngle + Math.PI / 2;
        mosqueGroup.add(archMesh);
      }
    }

    // ==========================================
    // B. ELEVATED DRUM WITH ARCADED WINDOWS
    // ==========================================
    const drumRadius = 1.1;
    const drumHeight = 0.6;
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(drumRadius, drumRadius, drumHeight, 36),
      whiteMarbleMat
    );
    drum.position.y = 0.6;
    mosqueGroup.add(drum);

    [-0.28, 0.28].forEach((offsetY) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(drumRadius + 0.015, 0.02, 12, 48),
        goldMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.6 + offsetY;
      mosqueGroup.add(ring);
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dWin = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.22),
        windowGlowMat
      );
      dWin.position.set(
        Math.cos(angle) * (drumRadius + 0.015),
        0.6,
        Math.sin(angle) * (drumRadius + 0.015)
      );
      dWin.rotation.y = -angle + Math.PI / 2;
      mosqueGroup.add(dWin);
    }

    // ==========================================
    // C. RADIANT GOLD DOME & ACCURATE HALF MOON (HILAL)
    // ==========================================
    const domeRadius = 1.14;
    const domeGeo = new THREE.SphereGeometry(
      domeRadius,
      48,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.54
    );
    const domeMesh = new THREE.Mesh(domeGeo, goldMat);
    domeMesh.position.y = 0.9;
    mosqueGroup.add(domeMesh);

    // 24 Longitudinal Seam Ribs
    for (let r = 0; r < 24; r++) {
      const ribAngle = (r / 24) * Math.PI * 2;
      const ribCurve = new THREE.EllipseCurve(
        0, 0,
        domeRadius * 1.006, domeRadius * 1.006,
        0, Math.PI * 0.54,
        false, 0
      );
      const pts = ribCurve.getPoints(24).map((p) => new THREE.Vector3(p.x, p.y, 0));
      const ribMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.012, 6, false),
        goldMat
      );
      ribMesh.rotation.y = ribAngle;
      ribMesh.position.y = 0.9;
      mosqueGroup.add(ribMesh);
    }

    // --- ACCURATE ISLAMIC HALF-MOON CRESCENT (HILAL) FINIAL ---
    const finialGroup = new THREE.Group();
    finialGroup.position.y = 2.05;

    // Spire Stem
    const finialRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.03, 0.65, 12),
      goldMat
    );
    finialRod.position.y = 0.32;
    finialGroup.add(finialRod);

    // Graduated spheres
    [0.15, 0.34, 0.52].forEach((py, idx) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 - idx * 0.012, 16, 16),
        goldMat
      );
      orb.position.y = py;
      finialGroup.add(orb);
    });

    // Parametric Upright Crescent Moon (Hilal)
    // Points meet cleanly at left/right tips, scooping into an upward-facing crescent
    const crescentShape = new THREE.Shape();
    crescentShape.moveTo(-0.14, 0.22);
    // Outer arc curving down around the base
    crescentShape.bezierCurveTo(-0.18, 0.02, -0.12, -0.18, 0, -0.18);
    crescentShape.bezierCurveTo(0.12, -0.18, 0.18, 0.02, 0.14, 0.22);
    // Inner scoop curving back up to the sharp tips
    crescentShape.bezierCurveTo(0.10, 0.08, 0.06, -0.05, 0, -0.05);
    crescentShape.bezierCurveTo(-0.06, -0.05, -0.10, 0.08, -0.14, 0.22);

    const crescentGeo = new THREE.ExtrudeGeometry(crescentShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    const crescentMesh = new THREE.Mesh(crescentGeo, goldMat);
    crescentMesh.position.set(0, 0.72, -0.011);
    finialGroup.add(crescentMesh);

    mosqueGroup.add(finialGroup);

    // ==========================================
    // D. COLONNADED ENTRANCE PORTICO & PODIUM
    // ==========================================
    const porticoGroup = new THREE.Group();
    const porchWidth = 1.25;
    const porchDepth = 0.42;

    const porchRoof = new THREE.Mesh(
      new THREE.BoxGeometry(porchWidth, 0.07, porchDepth),
      stoneTrimMat
    );
    porchRoof.position.set(0, -0.15, octagonRadius * 0.95 + porchDepth / 2);
    porticoGroup.add(porchRoof);

    const portalDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.65),
      new THREE.MeshBasicMaterial({ color: 0x33261d })
    );
    portalDoor.position.set(0, -0.58, octagonRadius * 0.96);
    porticoGroup.add(portalDoor);

    [-0.5, -0.2, 0.2, 0.5].forEach((cx) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.048, 0.72, 16),
        whiteMarbleMat
      );
      col.position.set(cx, -0.54, octagonRadius * 0.95 + porchDepth - 0.04);

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.038, 0.06, 12),
        goldMat
      );
      cap.position.set(cx, -0.18, octagonRadius * 0.95 + porchDepth - 0.04);

      porticoGroup.add(col);
      porticoGroup.add(cap);
    });
    mosqueGroup.add(porticoGroup);

    // Stepped Marble Plinth Base (Bottom edge at y = -1.04)
    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(2.32, 2.42, 0.16, 8),
      stoneTrimMat
    );
    podium.position.y = -0.96;
    mosqueGroup.add(podium);

    scene.add(mosqueGroup);

    // ==========================================
    // 5. LIGHTING (CLEAN WHITE & GOLD SHEEN)
    // ==========================================
    scene.add(new THREE.AmbientLight(0xffffff, 1.45));

    const sunKey = new THREE.DirectionalLight(0xfffbeb, 3.4);
    sunKey.position.set(5, 7, 5);
    scene.add(sunKey);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.3);
    fillLight.position.set(-6, 3, -3);
    scene.add(fillLight);

    const emeraldRim = new THREE.DirectionalLight(0x10b981, 1.5);
    emeraldRim.position.set(-4, -1, 4);
    scene.add(emeraldRim);

    // ==========================================
    // 6. EXACT CORNER ALIGNMENT TO DIV CORNERS
    // ==========================================
    const updateCornerAlignment = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Frustum boundary calculations at z = 0
      const dist = camera.position.z;
      const vFovRad = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * dist;
      const visibleWidth = visibleHeight * aspect;

      const isMobile = width < 768;
      // Proportional scale to fit beautifully inside the right corner
      const scale = isMobile
        ? Math.min(width / 520, 0.62)
        : Math.min(height / 360, 0.88);

      mosqueGroup.scale.setScalar(scale);

      // Model base is at y = -1.04 in local coordinates
      // Placing base exactly grounded at the bottom corner of the div
      const cornerY = -visibleHeight / 2 + 0.98 * scale;
      // Placing rightmost perimeter flush against the right edge of the div
      const cornerX = visibleWidth / 2 - 1.48 * scale;

      mosqueGroup.position.set(cornerX, cornerY, 0);
      mosqueGroup.rotation.x = 0.16; // Slight perspective pitch
    };

    updateCornerAlignment();

    // ==========================================
    // 7. AUTONOMOUS ROTATION ONLY (NO POINTER EVENTS)
    // ==========================================
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth continuous turntable rotation
      mosqueGroup.rotation.y += 0.0032;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      updateCornerAlignment();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
    />
  );
}