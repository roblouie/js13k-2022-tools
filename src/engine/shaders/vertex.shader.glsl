#version 300 es

layout(location = 0) in vec3 a_coords;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in float aDepth;

uniform mat4 modelviewProjection;

out vec2 vTexCoord;
out float vDepth;
out vec3 vNormal;

void main() {
    vec4 coords = vec4(a_coords, 1.0);
    gl_Position = modelviewProjection * coords;

    vTexCoord = aTexCoord;
    vDepth = aDepth;
    vNormal = a_normal;
}
