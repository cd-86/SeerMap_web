class MapLine {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private ebo: WebGLBuffer | null = null;
    private count: number = 0;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const VERTEX: string = `#version 300 es
        layout (location = 0) in vec2 aPosition;
        layout (location = 1) in vec4 aColor;

        out vec4 vColor;

        uniform mat4 uMatrix;
        void main() {
            gl_Position = uMatrix * vec4(aPosition, 0, 1);
            vColor = aColor;
        }
        `;
    
        const FRAGMENT: string = `#version 300 es
        precision mediump float;

        in vec4 vColor;

        out vec4 FragColor;

        void main() {
            FragColor = vColor;
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);
    
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();
    
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 6*4, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 6*4, 2*4);
        gl.enableVertexAttribArray(1);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public destroy() {
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.vbo);
        this.gl.deleteBuffer(this.ebo);
        this.gl.deleteProgram(this.shader);
    }
    
    public setData(vertextData: Float32Array, indices: Uint32Array) {
        this.count = indices.length;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertextData, this.gl.STATIC_DRAW);
    
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    }

    public draw(camera: Camera2D) {
        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.vao);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader!!, "uMatrix"), false, Matrix4.multiplyMatris(camera.projectionMat, camera.viewMat).elements);
        this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_INT, 0);
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}