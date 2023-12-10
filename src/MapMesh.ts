class MapMesh {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private ebo: WebGLBuffer | null = null;
    private texture: WebGLTexture | null = null;
    private count: number = 0;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const VERTEX: string = `#version 300 es
        layout (location = 0) in vec2 aPosition;
        layout (location = 1) in vec4 aTexCoord;

        out vec2 vTexCoord;
        out vec2 vTexCoord2;
        flat out int vIgnoreDir;

        uniform mat4 uMatrix;
        void main() {
            gl_Position = uMatrix * vec4(aPosition, 0, 1);
            vTexCoord = aTexCoord.xy;
            vIgnoreDir = int(aTexCoord.w);
            if (vIgnoreDir == 0) {
                vTexCoord2 = vec2((aTexCoord.z == 0.) ? 8./9. : 1., aTexCoord.y);
            }
        }
        `;

        const FRAGMENT: string = `#version 300 es
        precision mediump float;

        in vec2 vTexCoord;
        in vec2 vTexCoord2;
        flat in int vIgnoreDir;

        uniform sampler2D uTexture;

        out vec4 FragColor;

        void main() {
            vec4 color = texture(uTexture, vTexCoord);
            if (vIgnoreDir == 0) {
                color *= texture(uTexture, vTexCoord2);
            }
            FragColor = color;
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 6 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 6 * 4, 2 * 4);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        this.texture = gl.createTexture();

        let img:HTMLImageElement = new Image;
        img.src = "stationTexture.png";
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        img.onerror = () => {
            console.log(`图片加载失败[${img.src}]`);  
        }
    }

    public destroy() {
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.vbo);
        this.gl.deleteBuffer(this.ebo);
        this.gl.deleteProgram(this.shader);
        this.gl.deleteTexture(this.texture);
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
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader!!, "uTexture"), 0);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader!!, "uMatrix"), false, Matrix4.multiplyMatris(camera.projectionMat, camera.viewMat).elements);
        this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_INT, 0);
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}