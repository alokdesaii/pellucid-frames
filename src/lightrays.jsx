// LightRays — volumetric light-ray shader (React Bits port).
// Original uses the `ogl` lib; ported here to the global THREE renderer used elsewhere
// in this project (same fullscreen-quad pattern as the other shaders). Exports to window.
const { useEffect: lrUseEffect, useRef: lrUseRef } = React;

const lrHexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const lrAnchorAndDir = (origin, w, h) => {
  const outside = 0.2;
  switch (origin) {
    case "top-left": return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right": return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left": return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right": return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left": return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case "bottom-center": return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case "bottom-right": return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

const LR_VERT = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LR_FRAG = `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

function LightRays({
  raysOrigin = "top-center",
  raysColor = "#ffffff",
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.0,
  distortion = 0.0,
  opacity = 1,
  blur = 0,
}) {
  const mountRef = lrUseRef(null);
  const propsRef = lrUseRef(null);
  const mouseRef = lrUseRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = lrUseRef({ x: 0.5, y: 0.5 });

  propsRef.current = {
    raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, pulsating,
    fadeDistance, saturation, followMouse, mouseInfluence, noiseAmount, distortion,
  };

  lrUseEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof THREE === "undefined") return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true });
    } catch (e) {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      rayPos: { value: new THREE.Vector2(0, 0) },
      rayDir: { value: new THREE.Vector2(0, 1) },
      raysColor: { value: new THREE.Vector3(...lrHexToRgb(raysColor)) },
      raysSpeed: { value: raysSpeed },
      lightSpread: { value: lightSpread },
      rayLength: { value: rayLength },
      pulsating: { value: pulsating ? 1.0 : 0.0 },
      fadeDistance: { value: fadeDistance },
      saturation: { value: saturation },
      mousePos: { value: new THREE.Vector2(0.5, 0.5) },
      mouseInfluence: { value: mouseInfluence },
      noiseAmount: { value: noiseAmount },
      distortion: { value: distortion },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: LR_VERT,
      fragmentShader: LR_FRAG,
      uniforms,
      transparent: true,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(quad);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const updatePlacement = () => {
      const wCSS = mount.clientWidth || 1;
      const hCSS = mount.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(wCSS, hCSS, false);
      const w = wCSS * dpr;
      const h = hCSS * dpr;
      uniforms.iResolution.value.set(w, h);
      const { anchor, dir } = lrAnchorAndDir(propsRef.current.raysOrigin, w, h);
      uniforms.rayPos.value.set(anchor[0], anchor[1]);
      uniforms.rayDir.value.set(dir[0], dir[1]);
    };
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    const ro = new ResizeObserver(updatePlacement);
    ro.observe(mount);

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener("mousemove", onMouseMove);

    let frameId;
    const animate = (t) => {
      frameId = requestAnimationFrame(animate);
      const p = propsRef.current;

      uniforms.iTime.value = t * 0.001;

      if (p.followMouse && p.mouseInfluence > 0.0) {
        const s = 0.92;
        smoothMouseRef.current.x = smoothMouseRef.current.x * s + mouseRef.current.x * (1 - s);
        smoothMouseRef.current.y = smoothMouseRef.current.y * s + mouseRef.current.y * (1 - s);
        uniforms.mousePos.value.set(smoothMouseRef.current.x, smoothMouseRef.current.y);
      }

      uniforms.raysColor.value.set(...lrHexToRgb(p.raysColor));
      uniforms.raysSpeed.value = p.raysSpeed;
      uniforms.lightSpread.value = p.lightSpread;
      uniforms.rayLength.value = p.rayLength;
      uniforms.pulsating.value = p.pulsating ? 1.0 : 0.0;
      uniforms.fadeDistance.value = p.fadeDistance;
      uniforms.saturation.value = p.saturation;
      uniforms.mouseInfluence.value = p.mouseInfluence;
      uniforms.noiseAmount.value = p.noiseAmount;
      uniforms.distortion.value = p.distortion;

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
      quad.geometry.dispose();
    };
  }, []);

  const style = { width: "100%", height: "100%" };
  if (opacity !== 1) style.opacity = opacity;
  if (blur > 0) style.filter = `blur(${blur}px)`;

  return <div ref={mountRef} className="light-rays-container" style={style} />;
}

Object.assign(window, { LightRays });
