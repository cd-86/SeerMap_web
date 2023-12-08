class XYZAxis {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private mat : Matrix4;
    private count: number = 0;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.mat = new Matrix4;
        const VERTEX: string = `
        attribute vec2 aPosition;
        attribute float aColor;

        varying vec4 vColor;

        uniform mat4 uMatrix;
        void main() {
            gl_Position = uMatrix * vec4(aPosition, 0, 1);
            vColor = (aColor == 0.0 ? vec4(1, 0, 0, 1) : vec4(0, 1, 0, 1));
        }
        `;
    
        const FRAGMENT: string = `
        precision mediump float;

        varying vec4 vColor;

        void main() {
            gl_FragColor = vColor;
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);

        const vertices = new Float32Array([100,0,0,  0,0,0,  0,100,1, 0,0,1]);
        this.count = vertices.length / 3;
    
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
    
        gl.bindVertexArray(this.vao);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 3*4, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 3*4, 2*4);
        gl.enableVertexAttribArray(1);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public draw(camera: Camera2D) {
        this.gl.useProgram(this.shader);
        this.gl.bindVertexArray(this.vao);
        this.mat.setIdentity();
        this.mat.setScale(camera.zoom.elements[0], camera.zoom.elements[1],camera.zoom.elements[2]);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader!!, "uMatrix"), false, Matrix4.multiplyMatris(camera.projectionMat, camera.viewMat, this.mat).elements);
        this.gl.drawArrays(this.gl.LINES, 0, this.count);
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}