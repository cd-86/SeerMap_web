/**
 * 
 * @param gl OpenGLES2.0 上下文
 * @param vertextCode 顶点着色器代码
 * @param fragmentCode 片段着色器代码
 * @returns 
 */
function createShaderProgram(gl: WebGL2RenderingContext, vertextCode: string, fragmentCode: string): WebGLProgram | null {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
        console.log("Create vertext shader Failed");
        return null;
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
        console.log("Create fragment shader Failed");
        return null;
    }
    const program = gl.createProgram();
    if (!program) {
        console.log("Create Program Failed");
        return null;
    }
    gl.shaderSource(vertexShader, vertextCode);
    gl.shaderSource(fragmentShader, fragmentCode);
    gl.compileShader(vertexShader);
    let log = gl.getShaderInfoLog(vertexShader);
    if (log) {
        console.log(log);
        return null;
    }
    gl.compileShader(fragmentShader);
    log = gl.getShaderInfoLog(fragmentShader);
    if (log) {
        console.log(log);
        return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    log = gl.getProgramInfoLog(program);
    if (log) {
        console.log(log);
        return null;
    }

    return program;
}