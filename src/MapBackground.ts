class MapBackground {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private ebo: WebGLBuffer | null = null;
    private count: number = 0;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const VERTEX: string = `
        attribute vec2 aPosition;
        uniform mat4 uMatrix;
        void main() {
            gl_Position = uMatrix * vec4(aPosition, 0, 1);
        }
        `;
    
        const FRAGMENT: string = `
        void main() {
            gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);

        const vertices = new Float32Array([0.5, 0.5,  0.5, -0.5,  -0.5, -0.5,  -0.5, 0.5, -1, 0]);
        const indices = new Uint32Array([0,1,3, 1,2,3, 3, 2, 4]);
        this.count = indices.length;
    
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();
    
        gl.bindVertexArray(this.vao);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2*4, 0);
        gl.enableVertexAttribArray(0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
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