class Camera2D {
    public width;
    public height;
    public worldUp: Vector3;
    public zoom: Vector3;
    public center: Vector3;
    public cameraPos: Vector3;
    public viewMat: Matrix4;
    public projectionMat: Matrix4;

    constructor(width: number = 1, height: number = 1) {
        this.width = width;
        this.height = height;
        this.worldUp = new Vector3(0, 1, 0);
        this.zoom = new Vector3(0.5, 0.5, 0.5);
        this.center = new Vector3;
        this.cameraPos = new Vector3(0, 0, 10000);
        this.viewMat = new Matrix4;
        this.projectionMat = new Matrix4;
    }

    public setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public setCenter(x: number, y: number, z: number | null) {
        this.center.elements[0] = x;
        this.center.elements[1] = y;
        if (z) this.center.elements[2] = z;
    }

    public updateCamera() {
        this.cameraPos.elements[0] = this.center.elements[0];
        this.cameraPos.elements[1] = this.center.elements[1];

        this.viewMat.setIdentity();
        const e = this.cameraPos.elements;
        const c = this.center.elements;
        const u = this.worldUp.elements;
        this.viewMat.lookAt(e[0],e[1],e[2], c[0], c[1], c[2], u[0], u[1], u[2]);

        this.projectionMat.setIdentity();
        const z = this.zoom.elements;
        
        this.projectionMat.ortho(-this.width/2 * z[0], this.width/2 * z[0], -this.height/2 * z[1], this.height/2 * z[1], 0.1, 10000);
    }

    public cameraZoom(xOff: number, yOff: number) {
        this.zoom.elements[0] *= xOff;
        this.zoom.elements[1] *= yOff;
    }

    public cameraMove(xOff: number, yOff: number) {
        this.center.elements[0] += xOff * this.zoom.elements[0];
        this.center.elements[1] += yOff * this.zoom.elements[1];
    }

}