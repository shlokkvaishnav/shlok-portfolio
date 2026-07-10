precision highp float;

uniform float uDepthGrade;

varying float vAlpha;
varying float vStretch;

void main() {
  vec2 uv = gl_PointCoord - 0.5;

  // Velocity elongates the falloff along the scroll axis (exposure streak).
  float aniso = 1.0 + vStretch * 5.0;
  float d = length(vec2(uv.x * aniso, uv.y));
  float star = exp(-d * d * 20.0);

  // The field cools as the page deepens.
  vec3 warm = vec3(0.98, 0.94, 0.86);
  vec3 cool = vec3(0.80, 0.87, 1.0);
  vec3 col = mix(warm, cool, uDepthGrade * 0.7);

  float exposure = 1.0 - 0.12 * vStretch;

  gl_FragColor = vec4(col, star * vAlpha * exposure);
}
