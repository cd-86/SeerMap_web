var canvas: HTMLCanvasElement;
var gl :WebGL2RenderingContext;
var mapBg :MapBackground;
var camera :Camera2D;
var mousePrePos = [0, 0, 0];

window.onload = () => {
    canvas = <HTMLCanvasElement>document.getElementById('canvas');
    // 鼠标按下
    canvas.addEventListener('mousedown', mouseClicked);
    // 鼠标释放
    canvas.addEventListener('mouseup', mouseReleased);
    // 鼠标移动
    canvas.addEventListener('mousemove', mouseMoved);
    // 滚轮事件
    canvas.addEventListener('wheel', mouseWheel);
    // 调整画布大小
    window.addEventListener('resize', resizeGL);
    // 获取OpenGLES2.0 上下文
    gl = canvas.getContext('webgl2')!!;
    camera = new Camera2D(canvas.width, canvas.height);
    // 实例化着色器程序
    initGL();
    resizeGL();
    draw();
}

function resizeGL() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.setSize(canvas.width, canvas.height);
    camera.updateCamera();
    draw();
    
}

function initGL() {
    gl.clearColor(0, 0, 0, 1);
    mapBg = new MapBackground;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    mapBg.draw();
}

function mouseClicked(event: MouseEvent) {
    if (event.button == 0) {  // left
        mousePrePos = [event.clientX, event.clientY, 1];
    }
}

function mouseReleased(event: MouseEvent) {
    mousePrePos[2] = 0;
}

function mouseMoved(event: MouseEvent) {
    if (mousePrePos[2] == 0) return;
    const diifX = event.clientX - mousePrePos[0];
    const diffY = event.clientY - mousePrePos[1];
    camera.cameraMove(-diifX, diffY);
    camera.updateCamera();
    draw();
    mousePrePos[0] = event.clientX;
    mousePrePos[1] = event.clientY;
}

function mouseWheel(event: WheelEvent) {
    const offset = event.deltaY > 0 ? 0.9 : 1.1;
    camera.cameraZoom(offset, offset);
    camera.updateCamera();
    draw();
}

// let x = 0;
// setInterval(() => {
//     x += 0.1;
//     if (x > 1.0) {
//         x = 0;
//     }
//     // 只改变x值
//     gl.vertexAttrib1f(aPosition, x)

//     gl.drawArrays(gl.POINTS, 0, 1);
// }, 200)
