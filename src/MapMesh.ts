class MapMesh {
    private gl: WebGL2RenderingContext;
    private shader: WebGLProgram | null = null;
    private vao: WebGLVertexArrayObject | null = null;
    private vbo: WebGLBuffer | null = null;
    private ebo: WebGLBuffer | null = null;
    private stationTexture: WebGLTexture | null = null;
    private fontTexture: WebGLTexture | null = null;
    private count: number = 0;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const VERTEX: string = `#version 300 es
        layout (location = 0) in vec2 aPosition; // x, y
        layout (location = 1) in vec2 aTexCoord; // x, y
        layout (location = 2) in vec4 aColor; // [x, y, 0L|1R, ignoreDir] | [r, g, b, a]

        out vec2 vTexCoord;
        out vec2 vTexCoord2;
        out vec4 vColor;
        flat out int vType; // 0 station 1 font
        flat out int vIgnoreDir;

        uniform mat4 uMatrix;
        void main() {
            gl_Position = uMatrix * vec4(aPosition, 0, 1);
            vTexCoord = aTexCoord;
            if (aColor.w < 0.) {
                vType = 0;
                vIgnoreDir = int(aColor.z);
                if (vIgnoreDir == 0) {
                    vTexCoord2 = vec2((aColor.x == 0.) ? 8./9. : 1., aTexCoord.y);
                }
            } else {
                vType = 1;
                vColor = aColor;
            }
        }
        `;

        const FRAGMENT: string = `#version 300 es
        precision mediump float;

        in vec2 vTexCoord;
        in vec2 vTexCoord2;
        in vec4 vColor;
        flat in int vType;
        flat in int vIgnoreDir;

        uniform sampler2D uStationTexture;
        uniform sampler2D uFontTexture;

        out vec4 FragColor;

        void main() {
            if (vType == 0) {
                vec4 color = texture(uStationTexture, vTexCoord);
                if (vIgnoreDir == 0) {
                    color *= texture(uStationTexture, vTexCoord2);
                }
                FragColor = color;
            } else {
                FragColor = vec4(vColor.rgb, texture(uFontTexture, vTexCoord).r);
            }
        }
        `;
        this.shader = createShaderProgram(gl, VERTEX, FRAGMENT);

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8 * 4, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8 * 4, 2 * 4);
        gl.enableVertexAttribArray(1);

        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 8 * 4, 4 * 4);
        gl.enableVertexAttribArray(2);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        this.stationTexture = gl.createTexture();

        let stationImg:HTMLImageElement = new Image;
        stationImg.src = "stationTexture.png";
        stationImg.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.stationTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, stationImg);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        stationImg.onerror = () => {
            console.log(`图片加载失败[${stationImg.src}]`);  
        }

        this.fontTexture = gl.createTexture();

        let fontImg:HTMLImageElement = new Image;
        fontImg.src = "fontTexture.png";
        fontImg.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.fontTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fontImg);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        fontImg.onerror = () => {
            console.log(`图片加载失败[${fontImg.src}]`);  
        }
    }

    public destroy() {
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.vbo);
        this.gl.deleteBuffer(this.ebo);
        this.gl.deleteProgram(this.shader);
        this.gl.deleteTexture(this.stationTexture);
        this.gl.deleteTexture(this.fontTexture);

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
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.stationTexture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader!!, "uStationTexture"), 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.fontTexture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader!!, "uFontTexture"), 1);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader!!, "uMatrix"), false, Matrix4.multiplyMatris(camera.projectionMat, camera.viewMat).elements);
        this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_INT, 0);
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

}