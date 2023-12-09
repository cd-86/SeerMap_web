class MapBackground {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
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
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public destroy() {
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.vbo);
        this.gl.deleteProgram(this.shader);
    }


    public setBound(rect: number[], offset: number = 0) {

        this.count = 4;
        let vertextData = new Float32Array(4 * 2);
        vertextData[0] = rect[0] - offset;
        vertextData[1] = rect[2] - offset;

        vertextData[2] = rect[0] - offset;
        vertextData[3] = rect[3] + offset;

        vertextData[4] = rect[1] + offset;
        vertextData[5] = rect[2] - offset;

        vertextData[6] = rect[1] + offset;
        vertextData[7] = rect[3] + offset;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertextData, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public draw(camera: Camera2D) {
        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.vao);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader!!, "uMatrix"), false, Matrix4.multiplyMatris(camera.projectionMat, camera.viewMat).elements);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.count);
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}