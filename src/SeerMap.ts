class SeerMap {
    private gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement;
    private xyzAxis: XYZAxis;
    private mapBg: MapBackground;
    private mapPoint: MapPoint;
    private mapLine: MapLine;
    private camera: Camera2D;
    private mousePrePos: number[];

    constructor(canvas: HTMLCanvasElement) {
        this.mousePrePos = [0,0,0];
        // 获取OpenGLES2.0 上下文
        this.gl = canvas.getContext('webgl2')!!;
        this.canvas = canvas;
        // 鼠标按下
        canvas.addEventListener('mousedown', this.mouseClicked.bind(this));
        // 鼠标释放
        window.addEventListener('mouseup', this.mouseReleased.bind(this));
        // 鼠标移动
        window.addEventListener('mousemove', this.mouseMoved.bind(this));
        // 滚轮事件
        canvas.addEventListener('wheel', this.mouseWheel.bind(this));
        this.camera = new Camera2D(canvas.width, canvas.height);
        /*** 实例化着色器程序************************************************************/
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.xyzAxis = new XYZAxis(this.gl);
        this.mapBg = new MapBackground(this.gl);
        this.mapPoint = new MapPoint(this.gl);
        this.mapLine = new MapLine(this.gl);
        /*******************************************************************************/
        this.resizeGL();
        this.draw();
    }

    public resizeGL() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.camera.setSize(this.canvas.width, this.canvas.height);
        this.camera.updateCamera();
        this.draw();
    }

    public draw() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.mapBg.draw(this.camera);
        this.mapPoint.draw(this.camera);
        this.gl.enable(this.gl.BLEND);
        this.mapLine.draw(this.camera);
        this.gl.disable(this.gl.BLEND);
        this.xyzAxis.draw(this.camera);
    }

    public readMap(smap: Seer.Map) {
        const reader = new MapReader;
        reader.readMapPoints(smap);
        this.mapPoint.setData(reader.points, reader.pointsIndices);
        reader.readMapLines(smap);
        this.mapLine.setData(reader.lines, reader.linesIndices);
        this.mapBg.setBound(reader.pointsBound, 10);
        this.draw();
    }

    private mouseClicked(event: MouseEvent) {
        if (event.button == 0) {  // left
            this.mousePrePos = [event.clientX, event.clientY, 1];
        }
    }

    private mouseReleased(event: MouseEvent) {
        this.mousePrePos[2] = 0;
    }

    private mouseMoved(event: MouseEvent) {
        if (this.mousePrePos[2] == 0) return;
        const diifX = event.clientX - this.mousePrePos[0];
        const diffY = event.clientY - this.mousePrePos[1];
        this.camera.cameraMove(-diifX, diffY);
        this.camera.updateCamera();
        this.draw();
        this.mousePrePos[0] = event.clientX;
        this.mousePrePos[1] = event.clientY;
    }

    private mouseWheel(event: WheelEvent) {
        const offset = event.deltaY > 0 ? 0.9 : 1.1;
        this.camera.cameraZoom(offset, offset);
        this.camera.updateCamera();
        this.draw();
    }
}
