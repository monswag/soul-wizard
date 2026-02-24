import * as THREE from 'three'
import type { OrbParams } from './types'

// More particles, smaller size → refined dust/star look
const PARTICLE_COUNT = 9000

// ─── Vertex Shader ───────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform float uTurbulence;
  uniform float uClarity;
  uniform float uChaos;    // 0=smooth/orbital  1=sharp/scattered  (x axis)
  uniform float uFlow;     // 0=loose/free      1=tight/structured  (y axis)

  attribute float aScale;
  attribute vec3  aVelocity;

  varying float vAlpha;
  varying float vDist;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 pos = position;
    float t = uTime * uFrequency;

    // Low chaos: slow, organic, sweeping motion
    float slowNoise = snoise(pos * 1.5 + vec3(t * 0.25, t * 0.18, t * 0.12));
    // High chaos: fast, sharp, fragmented motion
    float fastNoise = snoise(pos * 4.2 + vec3(t * 0.85, t * 0.70, t * 0.58));
    float noise = mix(slowNoise, fastNoise, uChaos);

    float noise2 = snoise(pos * 2.5 - vec3(t * 0.15, t * 0.40, t * 0.25));

    // High uFlow = particles stay close to sphere surface (tight/rational)
    // Low uFlow  = particles drift outward freely (loose/emotional)
    float radialScale = mix(0.50, 0.16, uFlow);
    vec3 displaced = pos + normalize(pos) * noise * uAmplitude * radialScale;
    displaced += aVelocity * noise2 * uTurbulence * mix(0.28, 0.07, uFlow);

    float pulse = sin(t * 6.28318) * 0.5 + 0.5;
    displaced *= 1.0 + pulse * uAmplitude * 0.06;

    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    vDist  = length(pos);
    vAlpha = (0.35 + uClarity * 0.65) * (0.45 + 0.55 * noise);

    // Smaller, more refined point sizes
    float sizeVar = mix(0.7, 1.4, uChaos) * aScale;
    gl_PointSize  = sizeVar * (6.0 / -mvPos.z);
    gl_Position   = projectionMatrix * mvPos;
  }
`

// ─── Fragment Shader — sharper, more star-like dots ──────────────────────────

const fragmentShader = /* glsl */ `
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uTime;

  varying float vAlpha;
  varying float vDist;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    // Sharper falloff → smaller bright core, more star-like
    float soft = 1.0 - smoothstep(0.04, 0.5, d);

    float t = sin(uTime * 0.5 + vDist * 3.0) * 0.5 + 0.5;
    vec3 color = mix(uColorA, uColorB, t);

    // Subtle per-particle twinkle
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.8 + vDist * 11.0);

    gl_FragColor = vec4(color, soft * vAlpha * twinkle);
  }
`

// ─── SoulOrb ─────────────────────────────────────────────────────────────────

export class SoulOrb {
  private renderer: THREE.WebGLRenderer
  private scene:    THREE.Scene
  private camera:   THREE.PerspectiveCamera
  private points:   THREE.Points
  private material: THREE.ShaderMaterial
  private clock:    THREE.Clock
  private rafId:    number | null = null

  private targetParams:  OrbParams
  private currentParams: OrbParams

  constructor(canvas: HTMLCanvasElement, initialParams: OrbParams) {
    this.targetParams  = { ...initialParams }
    this.currentParams = { ...initialParams }

    // Opaque warm-dark background so additive-blended particles show clearly
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x1e1810, 1)  // warm dark umber — not pure black

    this.scene  = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    this.camera.position.z = 3.0

    this.clock = new THREE.Clock()

    const geometry = this.buildGeometry()

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:       { value: 0 },
        uFrequency:  { value: initialParams.pulseFrequency },
        uAmplitude:  { value: initialParams.amplitude },
        uTurbulence: { value: initialParams.turbulence },
        uClarity:    { value: initialParams.clarity },
        uChaos:      { value: initialParams.chaos },
        uFlow:       { value: initialParams.flow },
        uColorA:     { value: new THREE.Color(...initialParams.primaryColor) },
        uColorB:     { value: new THREE.Color(...initialParams.secondaryColor) },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geometry, this.material)
    this.scene.add(this.points)

    this.resize()
    window.addEventListener('resize', this.resize)
  }

  private buildGeometry(): THREE.BufferGeometry {
    const geo        = new THREE.BufferGeometry()
    const positions  = new Float32Array(PARTICLE_COUNT * 3)
    const scales     = new Float32Array(PARTICLE_COUNT)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.acos(2 * Math.random() - 1)
      const phi   = Math.random() * Math.PI * 2
      const r     = 0.78 + Math.random() * 0.44

      positions[i * 3]     = r * Math.sin(theta) * Math.cos(phi)
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = r * Math.cos(theta)

      // Smaller, more refined particles
      scales[i] = 0.25 + Math.random() * 1.0

      velocities[i * 3]     = (Math.random() - 0.5) * 2
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2
    }

    geo.setAttribute('position',  new THREE.BufferAttribute(positions,  3))
    geo.setAttribute('aScale',    new THREE.BufferAttribute(scales,     1))
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3))
    return geo
  }

  private resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  start() {
    const tick = () => {
      this.rafId = requestAnimationFrame(tick)
      const elapsed = this.clock.getElapsedTime()
      this.lerpToTarget(0.03)

      const u = this.material.uniforms
      u.uTime.value       = elapsed
      u.uFrequency.value  = this.currentParams.pulseFrequency
      u.uAmplitude.value  = this.currentParams.amplitude
      u.uTurbulence.value = this.currentParams.turbulence
      u.uClarity.value    = this.currentParams.clarity
      u.uChaos.value      = this.currentParams.chaos
      u.uFlow.value       = this.currentParams.flow
      u.uColorA.value.setRGB(...this.currentParams.primaryColor)
      u.uColorB.value.setRGB(...this.currentParams.secondaryColor)

      this.points.rotation.y = elapsed * 0.08
      this.points.rotation.x = Math.sin(elapsed * 0.06) * 0.12

      this.renderer.render(this.scene, this.camera)
    }
    tick()
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  setParams(params: OrbParams) { this.targetParams = { ...params } }

  nudge(partial: Partial<OrbParams>) {
    this.targetParams = { ...this.targetParams, ...partial }
  }

  private lerpToTarget(t: number) {
    const cur = this.currentParams
    const tgt = this.targetParams
    cur.pulseFrequency = lerp(cur.pulseFrequency, tgt.pulseFrequency, t)
    cur.amplitude      = lerp(cur.amplitude,      tgt.amplitude,      t)
    cur.turbulence     = lerp(cur.turbulence,     tgt.turbulence,     t)
    cur.clarity        = lerp(cur.clarity,         tgt.clarity,        t)
    cur.chaos          = lerp(cur.chaos,           tgt.chaos,          t)
    cur.flow           = lerp(cur.flow,            tgt.flow,           t)
    cur.primaryColor   = lerpColor(cur.primaryColor,   tgt.primaryColor,   t)
    cur.secondaryColor = lerpColor(cur.secondaryColor, tgt.secondaryColor, t)
  }

  dispose() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    this.points.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}
