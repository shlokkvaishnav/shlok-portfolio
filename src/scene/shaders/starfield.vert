uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform vec2 uPointer;
uniform float uDevelop;
uniform float uAspect;
uniform float uDpr;

attribute float aDepth;
attribute float aSize;
attribute float aPhase;
attribute float aTwinkle;
attribute float aDelay;

varying float vAlpha;
varying float vStretch;

float wrapY(float v) {
  return -1.15 + mod(v + 1.15, 2.3);
}

void main() {
  vec3 p = position;

  // Parallax travel: nearer stars sweep farther across the page scroll.
  p.y = wrapY(p.y + uScroll * aDepth * 1.7);

  // Cursor gravity: stars within ~0.25 units lean toward the pointer, max ~2px.
  vec2 toPointer = uPointer - p.xy;
  float dist = length(toPointer * vec2(uAspect, 1.0));
  float pull = smoothstep(0.25, 0.0, dist) * 0.006 * aDepth;
  p.xy += normalize(toPointer + 1e-5) * pull;

  gl_Position = vec4(p.x / uAspect, p.y, 0.0, 1.0);

  // Long-exposure develop-in, dimmest stars first (aDelay is blue-noise-ish).
  float develop = smoothstep(aDelay, aDelay + 0.25, uDevelop);

  float tw = mix(
    1.0,
    0.72 + 0.28 * sin(uTime * (0.6 + aPhase * 0.9) + aPhase * 6.2831),
    aTwinkle
  );

  vAlpha = develop * tw * (0.3 + 0.7 * aDepth);
  vStretch = clamp(abs(uVelocity) * 2.5, 0.0, 1.0) * aDepth;

  gl_PointSize = aSize * uDpr * (1.0 + vStretch * 2.2);
}
