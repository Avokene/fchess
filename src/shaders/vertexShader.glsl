// vertexShader.glsl
attribute vec4 a_position;
uniform mat4 u_projection;

void main() {
    gl_Position = a_position;
}
