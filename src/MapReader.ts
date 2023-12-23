enum LineArrow {
    None = 0,
    OneWay,
    TowWay
}

enum Align {
    Left = 0x0001,
    Right = 0x0002,
    HCenter = 0x0004,
    Top = 0x0008,
    Bottom = 0x0010,
    VCenter = 0x0020,
    Center = VCenter | HCenter
}

type lineObject = {
    [key: string]: {
        arrow: LineArrow,
        line: Seer.AdvancedCurve
    }
};

class vertextData {
    public vertext: Float32Array;
    public indices: Uint32Array;
    constructor(vertext: number[], indices: number[]) {
        this.vertext = new Float32Array(vertext);
        this.indices = new Uint32Array(indices);
    }

}

const N: number = 100;
class MapReader {
    public points!: Float32Array;
    public pointsIndices!: Uint32Array;
    public pointsBound: number[] = [];
    public lines!: Float32Array;
    public linesIndices!: Uint32Array;
    public meshes!: Float32Array;
    public meshesIndices!: Uint32Array;
    public meshesBound: number[] = [];
    constructor() {
    }

    // 点

    public readMapPoints(smap: Seer.Map) {
        var vertext: number[] = [];
        var indices: number[] = [];

        if (smap.normalPosList.length != 0) {
            this.pointsBound = [smap.normalPosList[0].x || 0, smap.normalPosList[0].x || 0, smap.normalPosList[0].y || 0, smap.normalPosList[0].y || 0];
        } else if (smap.rssiPosList.length != 0) {
            this.pointsBound = [smap.rssiPosList[0].x || 0, smap.rssiPosList[0].x || 0, smap.rssiPosList[0].y || 0, smap.rssiPosList[0].y || 0];
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

    // 线
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
            p1x, p1y, 1, 0, 0, 0.8,
            p2x, p2y, 1, 0, 0, 0.8
        );
        offsetX = diffY * -1 / norm * 0.08;
        offsetY = diffX / norm * 0.08;
        vertext.push(
            centerX + offsetX, centerY + offsetY, 1, 0, 0, 0.8,
        );
        indices.push(index, index + 1, index + 2);
        if (arrow == LineArrow.TowWay) {
            vertext.push(
                centerX - offsetX, centerY - offsetY, 1, 0, 0, 0.8,
            );
            indices.push(index, index + 1, index + 3);
        }
    }

    private static calcBezierMesh(obj: lineObject, color: number[], vertext: number[], indices: number[]) {
        var p1x, p2x, p3x, p4x, p1y, p2y, p3y, p4y, s, v;
        for (const k in obj) {
            let points: Seer.MapPos[] = [];
            p1x = obj[k].line.startPos.pos.x || 0;
            p1y = obj[k].line.startPos.pos.y || 0;
            p2x = obj[k].line.controlPos1.x || 0;
            p2y = obj[k].line.controlPos1.y || 0;
            p3x = obj[k].line.controlPos2.x || 0;
            p3y = obj[k].line.controlPos2.y || 0;
            p4x = obj[k].line.endPos.pos.x || 0;
            p4y = obj[k].line.endPos.pos.y || 0;
            for (let i = 0; i < N; ++i) {
                v = i / (N - 1);
                s = 1 - v;
                points.push(
                    {
                        x: (s * s * s) * p1x + 3 * (s * s) * v * p2x + 3 * s * (v * v) * p3x + (v * v * v) * p4x,
                        y: (s * s * s) * p1y + 3 * (s * s) * v * p2y + 3 * s * (v * v) * p3y + (v * v * v) * p4y,
                        z: 0
                    }
                );
            }

            MapReader.calcLineMesh(points, obj[k].arrow, color, vertext, indices);
        }
    }

    private static calcDegenerateBezierMesh(obj: lineObject, color: number[], vertext: number[], indices: number[]) {
        var p1x, p2x, p3x, p4x, p1y, p2y, p3y, p4y, s, v;
        for (const k in obj) {
            let points: Seer.MapPos[] = [];
            p1x = obj[k].line.startPos.pos.x || 0;
            p1y = obj[k].line.startPos.pos.y || 0;
            p2x = obj[k].line.controlPos1.x || 0;
            p2y = obj[k].line.controlPos1.y || 0;
            p3x = obj[k].line.controlPos2.x || 0;
            p3y = obj[k].line.controlPos2.y || 0;
            p4x = obj[k].line.endPos.pos.x || 0;
            p4y = obj[k].line.endPos.pos.y || 0;
            for (let i = 0; i < N; ++i) {
                v = i / (N - 1);
                s = 1 - v;
                points.push(
                    {
                        x: (s * s * s * s * s) * p1x +
                            5 * (s * s * s * s) * v * p2x +
                            10 * (s * s * s) * (v * v) * p2x +
                            10 * (s * s) * (v * v * v) * p3x +
                            5 * (s) * (v * v * v * v) * p3x +
                            (v * v * v * v * v) * p4x,
                        y: (s * s * s * s * s) * p1y +
                            5 * (s * s * s * s) * v * p2y +
                            10 * (s * s * s) * (v * v) * p2y +
                            10 * (s * s) * (v * v * v) * p3y +
                            5 * (s) * (v * v * v * v) * p3y +
                            (v * v * v * v * v) * p4y,
                        z: 0
                    }
                );
            }

            MapReader.calcLineMesh(points, obj[k].arrow, color, vertext, indices);
        }
    }

    private static calcStraightMesh(obj: lineObject, color: number[], vertext: number[], indices: number[]) {
        var p1x, p2x, p1y, p2y;
        for (const k in obj) {
            MapReader.calcLineMesh([obj[k].line.startPos.pos, obj[k].line.endPos.pos], obj[k].arrow, color, vertext, indices);
        }
    }

    private static calcArcMesh(obj: lineObject, color: number[], vertext: number[], indices: number[]) {
        var x1, x2, x3, y1, y2, y3;
        for (const k in obj) {
            x1 = obj[k].line.startPos.pos.x || 0;
            y1 = obj[k].line.startPos.pos.y || 0;
            x2 = obj[k].line.controlPos1.x || 0;
            y2 = obj[k].line.controlPos1.y || 0;
            x3 = obj[k].line.endPos.pos.x || 0;
            y3 = obj[k].line.endPos.pos.y || 0;

            let A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
            if (Math.abs(A) <= 1e-12) {
                MapReader.calcLineMesh([obj[k].line.startPos.pos, obj[k].line.endPos.pos], obj[k].arrow, color, vertext, indices);
                continue;
            }
            let points: Seer.MapPos[] = [];

            let x1x1py1y1 = x1 * x1 + y1 * y1;
            let x2x2py2y2 = x2 * x2 + y2 * y2;
            let x3x3py3y3 = x3 * x3 + y3 * y3;

            let B = x1x1py1y1 * (-y2 + y3) + x2x2py2y2 * (y1 - y3) + x3x3py3y3 * (y2 - y1);
            let C = x1x1py1y1 * (x2 - x3) + x2x2py2y2 * (x3 - x1) + x3x3py3y3 * (x1 - x2);
            let D = x1x1py1y1 * (x3 * y2 - x2 * y3) + x2x2py2y2 * (x1 * y3 - x3 * y1) + x3x3py3y3 * (x2 * y1 - x1 * y2);

            let x = -B / (2 * A);
            let y = -C / (2 * A);
            let r = Math.sqrt((B * B + C * C - 4 * A * D) / (4 * A * A));

            let theta1 = Math.atan2(y1 - y, x1 - x);
            let theta3 = Math.atan2(y3 - y, x3 - x);

            if (((x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)) > 0) {
                if (theta1 > theta3) theta3 += 2 * Math.PI;
            } else {
                if (theta1 < theta3) theta3 -= 2 * Math.PI;
            }
            for (let i = 0; i < N; i++) {
                let theta = theta3 + (theta1 - theta3) * i / (N - 1);
                points.push({
                    x: x + r * Math.cos(theta),
                    y: y + r * Math.sin(theta),
                    z: 0
                });
            }
            MapReader.calcLineMesh(points, obj[k].arrow, color, vertext, indices);
        }
    }

    private static generateKnots(points: Seer.MapPos[], n: number, k: number, knots: number[]) {
        for (let i = 0; i < k; i++) {
            knots[i] = 0;
        }
        for (let i = n + 1; i < n + k + 1; i++) {
            knots[i] = 1;
        }
        let denominator = 0;
        let numerator: number[] = [];
        for (let loop1 = k; loop1 <= n + 1; loop1++) {
            let temp = 0;
            for (let loop2 = loop1 - k; loop2 <= loop1 - 2; loop2++) {
                let diff_x = (points[loop2 + 1].x || 0) - (points[loop2].x || 0);
                let diff_y = (points[loop2 + 1].y || 0) - (points[loop2].y || 0);
                temp += Math.sqrt(diff_x * diff_x + diff_y * diff_y);
            }
            denominator += temp;
            numerator.push(temp);
        }
        for (let loop1 = k; loop1 <= n + 1; loop1++) {
            knots[loop1] = knots[loop1 - 1] + numerator[loop1 - k] / denominator;
        }
    }

    private static bValue(knots: number[], i: number, k: number, u: number): number {
        if (k == 1) {
            if (knots[i] < u && u <= knots[i + 1]) {
                return 1;
            }
            else {
                return 0;
            }
        }
        let front = 0, after = 0;
        if (u - knots[i] != 0 && knots[i + k - 1] - knots[i] != 0) {
            front = (u - knots[i]) / (knots[i + k - 1] - knots[i]);
        }
        if (knots[i + k] - u != 0 && knots[i + k] - knots[i + 1] != 0) {
            after = (knots[i + k] - u) / (knots[i + k] - knots[i + 1]);
        }
        return front * MapReader.bValue(knots, i, k - 1, u) + after * MapReader.bValue(knots, i + 1, k - 1, u);
    }

    private static generatePath(inPoints: Seer.MapPos[], n: number, k: number, knots: number[], outPoints: Seer.MapPos[]) {
        const Epsilon = 1e-10;
        let u = 0;
        while (u <= 1) {
            let temp_fenzi_x = 0;
            let temp_fenzi_y = 0;
            let temp_fenmu = 0;
            for (let i = 0; i <= n; i++) {
                let v = inPoints[i].z * MapReader.bValue(knots, i, k, u);
                temp_fenzi_x += inPoints[i].x * v;
                temp_fenzi_y += inPoints[i].y * v;
                temp_fenmu += v;
            }
            if (temp_fenmu != 0) {
                outPoints.push({ x: temp_fenzi_x / temp_fenmu, y: temp_fenzi_y / temp_fenmu, z: 0 });
            }
            u += Epsilon + 0.01;
        }
        // outPoints.unshift(inPoints[0]);
        outPoints.push(inPoints[inPoints.length - 1]);
    }

    private static calcNURBS6Mesh(obj: lineObject, color: number[], vertext: number[], indices: number[]) {
        const n = 5, k = 4;
        var knots: Array<number> = Array(n + k + 1); // n+k+1
        for (const kk in obj) {
            let outPoints: Seer.MapPos[] = [];
            let inPoints = [
                obj[kk].line.startPos.pos,
                obj[kk].line.controlPos1,
                obj[kk].line.controlPos2,
                obj[kk].line.controlPos3,
                obj[kk].line.controlPos4,
                obj[kk].line.endPos.pos
            ]
            MapReader.generateKnots(inPoints, n, k, knots);
            MapReader.generatePath(inPoints, n, k, knots, outPoints);

            MapReader.calcLineMesh(outPoints, obj[kk].arrow, color, vertext, indices);
        }
    }

    public readMapLines(smap: Seer.Map) {
        var vertext: number[] = [];
        var indices: number[] = [];
        smap.advancedLineList?.forEach(l => {
            MapReader.calcLineMesh([l.line.startPos, l.line.endPos], LineArrow.None, [1, 0, 0, 0.8], vertext, indices);
        });
        var bezierObj: lineObject = {};
        var degenerateBezierObj: lineObject = {};
        var straightObj: lineObject = {};
        var arcObj: lineObject = {};
        var NURBS6Obj: lineObject = {};
        smap.advancedCurveList.forEach(l => {
            const key = l.endPos.instanceName + "-" + l.startPos.instanceName;
            switch (l.className) {
                case "BezierPath":

                    if (key in bezierObj &&
                        l.startPos.pos.x == bezierObj[key].line.endPos.pos.x &&
                        l.startPos.pos.y == bezierObj[key].line.endPos.pos.y &&
                        l.endPos.pos.x == bezierObj[key].line.startPos.pos.x &&
                        l.endPos.pos.y == bezierObj[key].line.startPos.pos.y &&
                        l.controlPos1.x == bezierObj[key].line.controlPos2.x &&
                        l.controlPos1.y == bezierObj[key].line.controlPos2.y &&
                        l.controlPos2.x == bezierObj[key].line.controlPos1.x &&
                        l.controlPos2.y == bezierObj[key].line.controlPos1.y
                    ) {
                        bezierObj[key].arrow = LineArrow.TowWay;
                    } else {
                        bezierObj[l.instanceName] = { arrow: LineArrow.OneWay, line: l };
                    }
                    break;
                case "DegenerateBezier":
                    if (key in degenerateBezierObj &&
                        l.startPos.pos.x == degenerateBezierObj[key].line.endPos.pos.x &&
                        l.startPos.pos.y == degenerateBezierObj[key].line.endPos.pos.y &&
                        l.endPos.pos.x == degenerateBezierObj[key].line.startPos.pos.x &&
                        l.endPos.pos.y == degenerateBezierObj[key].line.startPos.pos.y &&
                        l.controlPos1.x == degenerateBezierObj[key].line.controlPos2.x &&
                        l.controlPos1.y == degenerateBezierObj[key].line.controlPos2.y &&
                        l.controlPos2.x == degenerateBezierObj[key].line.controlPos1.x &&
                        l.controlPos2.y == degenerateBezierObj[key].line.controlPos1.y
                    ) {
                        degenerateBezierObj[key].arrow = LineArrow.TowWay;
                    } else {
                        degenerateBezierObj[l.instanceName] = { arrow: LineArrow.OneWay, line: l };
                    }
                    break;
                case "StraightPath":
                    if (key in straightObj &&
                        l.startPos.pos.x == straightObj[key].line.endPos.pos.x &&
                        l.startPos.pos.y == straightObj[key].line.endPos.pos.y &&
                        l.endPos.pos.x == straightObj[key].line.startPos.pos.x &&
                        l.endPos.pos.y == straightObj[key].line.startPos.pos.y
                    ) {
                        straightObj[key].arrow = LineArrow.TowWay;
                    } else {
                        straightObj[l.instanceName] = { arrow: LineArrow.OneWay, line: l };
                    }
                    break;
                case "ArcPath":
                    if (key in arcObj &&
                        l.startPos.pos.x == arcObj[key].line.endPos.pos.x &&
                        l.startPos.pos.y == arcObj[key].line.endPos.pos.y &&
                        l.endPos.pos.x == arcObj[key].line.startPos.pos.x &&
                        l.endPos.pos.y == arcObj[key].line.startPos.pos.y &&
                        l.controlPos1.x == arcObj[key].line.controlPos1.x &&
                        l.controlPos1.y == arcObj[key].line.controlPos1.y
                    ) {
                        arcObj[key].arrow = LineArrow.TowWay;
                    } else {
                        arcObj[l.instanceName] = { arrow: LineArrow.OneWay, line: l };
                    }
                    break;
                case "NURBS6":
                    if (key in NURBS6Obj &&
                        l.startPos.pos.x == NURBS6Obj[key].line.endPos.pos.x &&
                        l.startPos.pos.y == NURBS6Obj[key].line.endPos.pos.y &&
                        l.endPos.pos.x == NURBS6Obj[key].line.startPos.pos.x &&
                        l.endPos.pos.y == NURBS6Obj[key].line.startPos.pos.y &&
                        l.controlPos1.x == NURBS6Obj[key].line.controlPos4.x &&
                        l.controlPos1.y == NURBS6Obj[key].line.controlPos4.y &&
                        l.controlPos2.x == NURBS6Obj[key].line.controlPos3.x &&
                        l.controlPos2.y == NURBS6Obj[key].line.controlPos3.y &&
                        l.controlPos3.x == NURBS6Obj[key].line.controlPos2.x &&
                        l.controlPos3.y == NURBS6Obj[key].line.controlPos2.y &&
                        l.controlPos4.x == NURBS6Obj[key].line.controlPos1.x &&
                        l.controlPos4.y == NURBS6Obj[key].line.controlPos1.y
                    ) {
                        NURBS6Obj[key].arrow = LineArrow.TowWay;
                    } else {
                        NURBS6Obj[l.instanceName] = { arrow: LineArrow.OneWay, line: l };
                    }
                    break;
            }
        });

        MapReader.calcBezierMesh(bezierObj, [170 / 255, 85 / 255, 0, 0.8], vertext, indices);
        MapReader.calcDegenerateBezierMesh(degenerateBezierObj, [170.0 / 255, 200 / 255, 0, 0.8], vertext, indices);
        MapReader.calcStraightMesh(straightObj, [18 / 255, 150 / 255, 219 / 255, 0.8], vertext, indices);
        MapReader.calcArcMesh(arcObj, [134 / 255, 13 / 255, 214 / 255, 0.8], vertext, indices);
        MapReader.calcNURBS6Mesh(NURBS6Obj, [0, 1, 246 / 255, 0.8], vertext, indices);

        this.lines = new Float32Array(vertext);
        this.linesIndices = new Uint32Array(indices);
    }

    private static calcStringMesh(str: string, x: number, y: number, scale: number, align: Align, color: number[], vertext: number[], indices: number[]) {
        var w: number[] = [0]
        for (const c of str) {
            if (c == "\n") {
                w.push(0);
                continue;
            }
            let k = fontTexCoords.hasOwnProperty(c) ? <keyof typeof fontTexCoords>c : "?";
            w[w.length - 1] += fontTexCoords[k].advance * scale;
        }

        if (align & Align.HCenter)
            for (let i = 0; i < w.length; i++)
                w[i] = x - w[i] / 2;
        else if (align & Align.Right)
            for (let i = 0; i < w.length; i++)
                w[i] = x - w[i];
        else
            for (let i = 0; i < w.length; i++)
                w[i] = x;

        if (align & Align.VCenter)
            y += (w.length - 1) * 48 * scale - 24 * scale;
        else if (align & Align.Bottom)
            y += w.length * 48 * scale;

        x = w[0];

        let line = 0, x1, x2, y1, y2;
        for (const c of str) {
            if (c == "\n") {
                line += 1;
                x = w[line];
                y -= 48 * scale;
                continue;
            }
            let k = fontTexCoords.hasOwnProperty(c) ? <keyof typeof fontTexCoords>c : "?";
            const obj = fontTexCoords[k];
            x1 = x + obj.bearingX * scale;
            y1 = y + obj.bearingY * scale;
            x2 = x1 + obj.width * scale;
            y2 = y1 - obj.height * scale;

            let index = vertext.length / 8;
            vertext.push(
                x1, y1, obj.topLeft.x, obj.topLeft.y, color[0], color[1], color[2], color[3],
                x2, y1, obj.topRight.x, obj.topRight.y, color[0], color[1], color[2], color[3],
                x2, y2, obj.bottomRight.x, obj.bottomRight.y, color[0], color[1], color[2], color[3],
                x1, y2, obj.bottomLeft.x, obj.bottomLeft.y, color[0], color[1], color[2], color[3]
            );
            indices.push(index + 0, index + 1, index + 2, index + 0, index + 2, index + 3);
            x += obj.advance * scale;
        }

    }

    // 站点 ~~高级区域 二维码区域 库位 ...~~
    public readMapMesh(smap: Seer.Map) {
        if (smap.advancedPointList?.length != 0) {
            this.meshesBound = [
                smap.advancedPointList[0].pos.x || 0,
                smap.advancedPointList[0].pos.x || 0,
                smap.advancedPointList[0].pos.y || 0,
                smap.advancedPointList[0].pos.y || 0
            ];
        }
        const textCoords = {
            LocationMark: { p1: { x: 0, y: 0 }, p2: { x: 1 / 9, y: 0 }, p3: { x: 1 / 9, y: 1 }, p4: { x: 0, y: 1 } },
            ActionPoint: { p1: { x: 1 / 9, y: 0 }, p2: { x: 2 / 9, y: 0 }, p3: { x: 2 / 9, y: 1 }, p4: { x: 1 / 9, y: 1 } },
            ChargePoint: { p1: { x: 2 / 9, y: 0 }, p2: { x: 3 / 9, y: 0 }, p3: { x: 3 / 9, y: 1 }, p4: { x: 2 / 9, y: 1 } },
            ParkPoint: { p1: { x: 3 / 9, y: 0 }, p2: { x: 4 / 9, y: 0 }, p3: { x: 4 / 9, y: 1 }, p4: { x: 3 / 9, y: 1 } },
            SwitchMap: { p1: { x: 4 / 9, y: 0 }, p2: { x: 5 / 9, y: 0 }, p3: { x: 5 / 9, y: 1 }, p4: { x: 4 / 9, y: 1 } },
            HomeRegion: { p1: { x: 5 / 9, y: 0 }, p2: { x: 6 / 9, y: 0 }, p3: { x: 6 / 9, y: 1 }, p4: { x: 5 / 9, y: 1 } },
            TransferLocation: { p1: { x: 6 / 9, y: 0 }, p2: { x: 7 / 9, y: 0 }, p3: { x: 7 / 9, y: 1 }, p4: { x: 6 / 9, y: 1 } },
            WorkingLocation: { p1: { x: 7 / 9, y: 0 }, p2: { x: 8 / 9, y: 0 }, p3: { x: 8 / 9, y: 1 }, p4: { x: 7 / 9, y: 1 } }
        }
        var vertext: number[] = [];
        var indices: number[] = [];
        const LEN = 0.2;
        smap.advancedPointList?.forEach((ap) => {
            let x = ap.pos.x || 0;
            let y = ap.pos.y || 0;
            let cos = Math.cos(ap.dir || 0);
            let sin = Math.sin(ap.dir || 0);
            this.meshesBound[0] = Math.min(x, this.meshesBound[0]);
            this.meshesBound[1] = Math.max(x, this.meshesBound[1]);
            this.meshesBound[2] = Math.min(y, this.meshesBound[2]);
            this.meshesBound[3] = Math.max(y, this.meshesBound[3]);

            let x1 = (-LEN * cos) - (LEN * sin) + x;
            let y1 = (-LEN * sin) + (LEN * cos) + y;
            let x2 = (LEN * cos) - (LEN * sin) + x;
            let y2 = (LEN * sin) + (LEN * cos) + y;
            let x3 = (LEN * cos) - (-LEN * sin) + x;
            let y3 = (LEN * sin) + (-LEN * cos) + y;
            let x4 = (-LEN * cos) - (-LEN * sin) + x;
            let y4 = (-LEN * sin) + (-LEN * cos) + y;

            let coord = textCoords[<keyof typeof textCoords>ap.className]
            let ignoreDir = (ap.ignoreDir || false) ? 1 : 0;
            let index = vertext.length / 8;
            vertext.push(
                x1, y1, coord.p1.x, coord.p1.y, 0, 0, ignoreDir, -1,
                x2, y2, coord.p2.x, coord.p2.y, 1, 0, ignoreDir, -1,
                x3, y3, coord.p3.x, coord.p3.y, 1, 0, ignoreDir, -1,
                x4, y4, coord.p4.x, coord.p4.y, 0, 0, ignoreDir, -1
            );
            indices.push(index + 0, index + 1, index + 2, index + 0, index + 2, index + 3);
            MapReader.calcStringMesh(ap.instanceName, x, y - 0.2, 0.003, Align.Center, [0, 0, 0, 1], vertext, indices);
        });
        this.meshes = new Float32Array(vertext);
        this.meshesIndices = new Uint32Array(indices);
    }

    // 小车
    public static calcRobotVertextAndIndicesData(width: number, head: number, tail: number): vertextData {
        let x1, x2, x3, x4, x5, x6, x7, x8, y1, y2, y3, y4, y5, y6, y7, y8;
        x1 = x4 = -tail;
        x2 = x5 = 0;
        x3 = x6 = head;
        y1 = y2 = y3 = width / 2;
        y4 = y5 = y6 = -y1;

        var vertext: number[] = [];
        var indices: number[] = [];
        // tail
        vertext.push(
            x1, y1, 9 / 255, 142 / 255, 227 / 255, 100 / 255,
            x2, y2, 9 / 255, 142 / 255, 227 / 255, 100 / 255,
            x4, y4, 9 / 255, 142 / 255, 227 / 255, 100 / 255,
            x5, y5, 9 / 255, 142 / 255, 227 / 255, 100 / 255,
        );
        indices.push(0, 1, 2, 1, 2, 3);
        // head
        vertext.push(
            x2, y2, 9 / 255, 109 / 255, 54 / 255, 100 / 255,
            x3, y3, 9 / 255, 109 / 255, 54 / 255, 100 / 255,
            x5, y5, 9 / 255, 109 / 255, 54 / 255, 100 / 255,
            x6, y6, 9 / 255, 109 / 255, 54 / 255, 100 / 255,
        );
        indices.push(4, 5, 6, 5, 6, 7);
        // center
        let v1 = 0.015, v2 = 0.115;

        vertext.push(
            -v2, v1, 0, 1, 0, 0.6,
            v2, v1, 0, 1, 0, 0.6,
            v2, -v1, 0, 1, 0, 0.6,
            -v2, -v1, 0, 1, 0, 0.6,

            -v1, v2, 0, 1, 0, 0.6,
            v1, v2, 0, 1, 0, 0.6,
            v1, -v2, 0, 1, 0, 0.6,
            -v1, -v2, 0, 1, 0, 0.6,
        );
        indices.push(8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15);
        //border
        let xlo = x1 - 0.01;
        let xli = x1 + 0.01;
        let xro = x3 + 0.01;
        let xri = x3 - 0.01;

        let yto = y1 + 0.01;
        let yti = y1 - 0.01;
        let ybo = y4 - 0.01;
        let ybi = y4 + 0.01;

        vertext.push(
            xlo, yto, 0.0, 0.45, 0.0, 0.6,
            xli, yto, 0.0, 0.45, 0.0, 0.6,
            xlo, ybo, 0.0, 0.45, 0.0, 0.6,
            xli, ybo, 0.0, 0.45, 0.0, 0.6,

            xro, yto, 0.0, 0.45, 0.0, 0.6,
            xri, yto, 0.0, 0.45, 0.0, 0.6,
            xro, ybo, 0.0, 0.45, 0.0, 0.6,
            xri, ybo, 0.0, 0.45, 0.0, 0.6,

            xli, yto, 0.0, 0.45, 0.0, 0.6,
            xri, yto, 0.0, 0.45, 0.0, 0.6,
            xli, yti, 0.0, 0.45, 0.0, 0.6,
            xri, yti, 0.0, 0.45, 0.0, 0.6,

            xli, ybo, 0.0, 0.45, 0.0, 0.6,
            xri, ybo, 0.0, 0.45, 0.0, 0.6,
            xli, ybi, 0.0, 0.45, 0.0, 0.6,
            xri, ybi, 0.0, 0.45, 0.0, 0.6,
        );
        indices.push(
            16, 17, 18, 17, 18, 19,
            20, 21, 22, 21, 22, 23,
            24, 25, 26, 25, 26, 27,
            28, 29, 30, 29, 30, 31,
        );
        // arrow
        y1 = head / 5;
        x1 = x2 = y1 * 3;
        y2 = -y1;
        x3 = y1 * 4;
        y3 = 0;
        vertext.push(
            x1, y1, 1.0, 0.0, 0.0, 0.6,
            x2, y2, 1.0, 0.0, 0.0, 0.6,
            x3, y3, 1.0, 0.0, 0.0, 0.6,
        );
        indices.push(32, 33, 34);

        return new vertextData(vertext, indices);
    }
}