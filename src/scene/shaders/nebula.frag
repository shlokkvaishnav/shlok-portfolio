precision highp float;

uniform float uTime;
uniform float uDepthGrade;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  // Drift is glacial; the field slides slowly with page depth.
  vec2 p = vUv * vec2(2.6, 1.8) + vec2(uTime * 0.004, uDepthGrade * 1.4);
  float n = fbm(p);

  // Deep blue-teal breath, warming faintly at full depth (contact).
  vec3 deep = vec3(0.028, 0.048, 0.085);
  vec3 warmth = vec3(0.075, 0.055, 0.035);
  vec3 tint = mix(deep, warmth, smoothstep(0.8, 1.0, uDepthGrade));

  vec3 col = tint * smoothstep(0.42, 0.95, n) * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
