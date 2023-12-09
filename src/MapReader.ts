enum LineArrow {
    None = 0,
    OneWay,
    TowWay
}

class MapReader {
    public points!: Float32Array;
    public pointsIndices!: Uint32Array;
    public pointsBound: number[] = [];
    public lines!: Float32Array;
    public linesIndices!: Uint32Array;
    constructor() {
    }

    public readMapPoints(smap: Seer.Map) {

        // var size = smap.normalPosList?.length + smap.rssiPosList?.length;
        // this.points = new Float32Array(size * 4 * 3);
        // this.pointsIndices = new Uint32Array(size * 6);
        var vertext: number[] = [];
        var indices: number[] = [];

        if (smap.normalPosList.length != 0) {
            this.pointsBound = [smap.normalPosList[0].x, smap.normalPosList[0].x, smap.normalPosList[0].y, smap.normalPosList[0].y];
        } else if (smap.rssiPosList.length != 0) {
            this.pointsBound = [smap.rssiPosList[0].x, smap.rssiPosList[0].x, smap.rssiPosList[0].y, smap.rssiPosList[0].y];
        }

        var index = 0;
        smap.normalPosList?.forEach((p) => {
            let x = p.x || 0;
            let y = p.y || 0;
            this.pointsBound[0] = Math.min(x, this.pointsBound[0]);
            this.pointsBound[1] = Math.max(x, this.pointsBound[1]);
            this.pointsBound[2] = Math.min(y, this.pointsBound[2]);
            this.pointsBound[3] = Math.max(y, this.pointsBound[3]);
            vertext.push(
                x - 0.005, y + 0.005, 0,
                x + 0.005, y + 0.005, 0,
                x + 0.005, y - 0.005, 0,
                x - 0.005, y - 0.005, 0
            );
            indices.push(index + 0, index + 1, index + 2, index + 0, index + 2, index + 3);
            index += 4;
        });
        smap.rssiPosList?.forEach((p) => {
            let x = p.x || 0;
            let y = p.y || 0;
            this.pointsBound[0] = Math.min(x, this.pointsBound[0]);
            this.pointsBound[1] = Math.max(x, this.pointsBound[1]);
            this.pointsBound[2] = Math.min(y, this.pointsBound[2]);
            this.pointsBound[3] = Math.max(y, this.pointsBound[3]);
            vertext.push(
                x - 0.005, y + 0.005, 1,
                x + 0.005, y + 0.005, 1,
                x + 0.005, y - 0.005, 1,
                x - 0.005, y - 0.005, 1
            );
            indices.push(index + 0, index + 1, index + 2, index + 0, index + 2, index + 3);
            index += 4;
        });
        this.points = new Float32Array(vertext);
        this.pointsIndices = new Uint32Array(indices);
    }

    private static calcLineMesh(points: Seer.MapPos[], arrow: LineArrow, color: number[], vertext: number[], indices: number[]) {
        // if (points.length < 2) return;
        var p1x, p2x, p1y, p2y, tempDiffX, tempDiffY, offsetX, offsetY, centerX, centerY, norm;
        var diffX = ((points[1].y || 0) - (points[0].y || 0)) * -1;
        var diffY = (points[1].x || 0) - (points[0].x || 0);
        var index = vertext.length / 6;
        for (let i = 0; i < points.length - 1; i++) {
            tempDiffX = ((points[i + 1].y || 0) - (points[i].y || 0)) * -1;
            tempDiffY = (points[i + 1].x || 0) - (points[i].x || 0);
            diffX = (diffX + tempDiffX) / 2;
            diffY = (diffY + tempDiffY) / 2;
            norm = Math.sqrt(diffX * diffX + diffY * diffY);
            offsetX = diffX / norm * 0.03;
            offsetY = diffY / norm * 0.03;
            p1x = (points[i].x || 0) - offsetX / 2;
            p1y = (points[i].y || 0) - offsetY / 2;
            p2x = p1x + offsetX;
            p2y = p1y + offsetY;
            vertext.push(
                p1x, p1y, color[0], color[1], color[2], color[3],
                p2x, p2y, color[0], color[1], color[2], color[3]
            );
            diffX = tempDiffX;
            diffY = tempDiffY;
        }
        norm = Math.sqrt(diffX * diffX + diffY * diffY);
        offsetX = diffX / norm * 0.03;
        offsetY = diffY / norm * 0.03;
        p1x = (points[points.length - 1].x || 0) - offsetX / 2;
        p1y = (points[points.length - 1].y || 0) - offsetY / 2;
        p2x = p1x + offsetX;
        p2y = p1y + offsetY;
        vertext.push(
            p1x, p1y, color[0], color[1], color[2], color[3],
            p2x, p2y, color[0], color[1], color[2], color[3]
        );
        let len = vertext.length / 6 - index - 2;
        for (let i = 0; i < len; ++i) {
            indices.push(index + i, index + i + 1, index + i + 2);
        }

        if (arrow == LineArrow.None) return;
        index = vertext.length / 6;
        let i = points.length == 2 ? 0 : points.length / 2;
        centerX = ((points[i].x || 0) + (points[i + 1].x || 0)) / 2;
        centerY = ((points[i].y || 0) + (points[i + 1].y || 0)) / 2;
        diffX = ((points[i].y || 0) - (points[i + 1].y || 0)) * -1;
        diffY = (points[i].x || 0) - (points[i + 1].x || 0);
        norm = Math.sqrt(diffX * diffX + diffY * diffY);
        offsetX = diffX / norm * 0.06;
        offsetY = diffY / norm * 0.06;
        p1x = centerX + offsetX;
        p1y = centerY + offsetY;
        p2x = centerX - offsetX;
        p2y = centerY - offsetY;
        vertext.push(
            p1x, p1y, 1, 0, 0, 0.5,
            p2x, p2y, 1, 0, 0, 0.5
        );
        offsetX = diffY * -1 / norm * 0.08;
        offsetY = diffX / norm * 0.08;
        vertext.push(
            centerX + offsetX, centerY + offsetY, 1, 0, 0, 0.5,
            p2x, p2y, 1, 0, 0, 0.5
        );
        indices.push(index, index + 1, index + 2);
        if (arrow == LineArrow.TowWay) {
            vertext.push(
                centerX - offsetX, centerY - offsetY, 1, 0, 0, 0.5,
                p2x, p2y, 1, 0, 0, 0.5
            );
            indices.push(index, index + 1, index + 3);
        }
    }

    public readMapLines(smap: Seer.Map) {
        var vertext: number[] = [];
        var indices: number[] = [];
        smap.advancedLineList?.forEach((l) => {
            MapReader.calcLineMesh([l.line.startPos, l.line.endPos], LineArrow.None, [1, 0, 0, 0.5], vertext, indices);
        });
        this.lines = new Float32Array(vertext);
        this.linesIndices = new Uint32Array(indices);
    }
}