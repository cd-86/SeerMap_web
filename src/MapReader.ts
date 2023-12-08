class MapReader {
    public points! : Float32Array;
    public pointsIndices!: Uint32Array;
    public pointsBound: number[] = [];
    constructor() {
    }

    public readMapPoints(smap: SMap){
        let size = smap.normalPosList.length + smap.rssiPosList.length;
        this.points = new Float32Array(size * 4 * 3);
        this.pointsIndices = new Uint32Array(size * 6);

        if (smap.normalPosList.length != 0) {
            this.pointsBound = [smap.normalPosList[0].x, smap.normalPosList[0].x, smap.normalPosList[0].y, smap.normalPosList[0].y];
        } else if (smap.rssiPosList.length != 0) {
            this.pointsBound = [smap.rssiPosList[0].x, smap.rssiPosList[0].x, smap.rssiPosList[0].y, smap.rssiPosList[0].y];
        }
        let pi = 0, ii = 0, pn = 0;
        smap.normalPosList.forEach((p)=>{
            this.pointsBound[0] = Math.min(p.x, this.pointsBound[0]);
            this.pointsBound[1] = Math.max(p.x, this.pointsBound[1]);
            this.pointsBound[2] = Math.min(p.y, this.pointsBound[2]);
            this.pointsBound[3] = Math.max(p.y, this.pointsBound[3]);
            this.points[pi++] = p.x - 0.005;
            this.points[pi++] = p.y + 0.005;
            this.points[pi++] = 0;
            this.points[pi++] = p.x + 0.005;
            this.points[pi++] = p.y + 0.005;
            this.points[pi++] = 0;
            this.points[pi++] = p.x + 0.005;
            this.points[pi++] = p.y - 0.005;
            this.points[pi++] = 0;
            this.points[pi++] = p.x - 0.005;
            this.points[pi++] = p.y - 0.005;
            this.points[pi++] = 0;
            this.pointsIndices[ii++] = pn + 0;
            this.pointsIndices[ii++] = pn + 1;
            this.pointsIndices[ii++] = pn + 2;
            this.pointsIndices[ii++] = pn + 0;
            this.pointsIndices[ii++] = pn + 2;
            this.pointsIndices[ii++] = pn + 3;
            pn += 4;
        });
        smap.rssiPosList.forEach((p)=>{
            this.pointsBound[0] = Math.min(p.x, this.pointsBound[0]);
            this.pointsBound[1] = Math.max(p.x, this.pointsBound[1]);
            this.pointsBound[2] = Math.min(p.y, this.pointsBound[2]);
            this.pointsBound[3] = Math.max(p.y, this.pointsBound[3]);
            this.points[pi++] = p.x - 0.005;
            this.points[pi++] = p.y + 0.005;
            this.points[pi++] = 1;
            this.points[pi++] = p.x + 0.005;
            this.points[pi++] = p.y + 0.005;
            this.points[pi++] = 1;
            this.points[pi++] = p.x + 0.005;
            this.points[pi++] = p.y - 0.005;
            this.points[pi++] = 1;
            this.points[pi++] = p.x - 0.005;
            this.points[pi++] = p.y - 0.005;
            this.points[pi++] = 1;
            this.pointsIndices[ii++] = pn + 0;
            this.pointsIndices[ii++] = pn + 1;
            this.pointsIndices[ii++] = pn + 2;
            this.pointsIndices[ii++] = pn + 0;
            this.pointsIndices[ii++] = pn + 2;
            this.pointsIndices[ii++] = pn + 3;
            pn += 4;
        });
    }
}