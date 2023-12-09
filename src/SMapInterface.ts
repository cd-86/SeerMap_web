namespace Seer {
    export type MapHeader = {
        mapType: string;
        mapName: string;
        minPos: MapPos;
        maxPos: MapPos;
        resolution: number;
        version: string;
    }

    export type LaserDevice = {
        id: number;
        laserMarginPos: MapPos;
    }

    export type Device = {
        modelName: string;
        laserDevices: LaserDevice[];
        ultrasonicDist: number[];
        fallingdownDist: number[];
    }
    export type MapProperty = {
        key: string;
        type: string;
        value: ArrayBuffer;
        // oneof
        stringValue: string;
        boolValue: boolean;
        int32Value: number;
        uint32Value: number;
        int64Value: number;
        uint64Value: number;
        floatValue: number;
        doubleValue: number;
        bytesValue: ArrayBuffer;
        //
        tag: string;
    }

    export type MapAttribute = {
        description: string;
        colorPen: number;
        colorBrush: number;
        colorFont: number;
    }

    export type MapPos = {
        x: number;
        y: number;
        z: number;
    }

    export type MapRSSIPos = {
        x: number;
        y: number;
    }

    export type MapLine = {
        startPos: MapPos;
        endPos: MapPos;
    }

    export type AdvancedPoint = {
        className: string;
        instanceName: string;
        pos: MapPos;
        dir: number;
        property: MapProperty[];
        ignoreDir: boolean;
        desc: ArrayBuffer;
        attribute: MapAttribute;
    }

    export type AdvancedLine = {
        className: string;
        instanceName: string;
        line: MapLine;
        property: MapProperty[];
        desc: ArrayBuffer;
        attribute: MapAttribute;
    }

    export type AdvancedCurve = {
        className: string;
        instanceName: string;
        startPos: AdvancedPoint;
        endPos: AdvancedPoint;
        controlPos1: MapPos;
        controlPos2: MapPos;
        property: MapProperty[];
        desc: ArrayBuffer;
        controlPos3: MapPos;
        controlPos4: MapPos;
        devices: Device[];
        attribute: MapAttribute;
    }

    export type AdvancedArea = {
        className: string;
        instanceName: string;
        posGroup: MapPos[];
        dir: number;
        property: MapProperty[];
        desc: ArrayBuffer;
        devices: Device[];
        attribute: MapAttribute;
    }

    export type PatrolRouteStation = {
        id: string;
    }

    export type PatrolRoute = {
        name: string;
        stationList: PatrolRouteStation[];
        maxSpeed: number;
        maxAcc: number;
        maxRot: number;
        maxRotAcc: number;
        desc: ArrayBuffer;
        maxDec: number;
        maxRotDec: number;
    }

    export type ReflectorPos = {
        type: string;
        width: number;
        x: number;
        y: number;
    }

    export type TagPos = {
        tagValue: number;
        x: number;
        y: number;
        angle: number;
        isDMTDetected: boolean;
        z: number;
        qx: number;
        qy: number;
        qz: number;
        qw: number;
        variance: number;
        className: string;
        property: MapProperty[];
    }

    export type Primitive = {
        className: string;
        instanceName: string;
        startPos: AdvancedPoint;
        endPos: AdvancedPoint;
        controlPosList: MapPos;
        property: MapProperty[];
        desc: ArrayBuffer;
        attribute: MapAttribute;
    }

    export type ExternalDevice = {
        className: string;
        instanceName: string;
        isEnabled: boolean;
        property: MapProperty[];
        desc: ArrayBuffer;
        attribute: MapAttribute;
    }

    export type BinLocation = {
        className: string;
        instanceName: string;
        groupName: string;
        pointName: string;
        pos: MapPos;
        property: MapProperty[];
        desc: ArrayBuffer;
        attribute: MapAttribute;
    }

    export type BinLocations = {
        binLocationList: BinLocation[];
    }

    export type Map = {
        mapDirectory: string;
        header: MapHeader;

        normalPosList: MapPos[];
        normalLineList: MapLine[];
        normalPos3dList: MapPos[];
        advancedPointList: AdvancedPoint[];
        advancedLineList: AdvancedLine[];
        advancedCurveList: AdvancedCurve[];
        advancedAreaList: AdvancedArea[];
        patrolRouteList: PatrolRoute[];
        rssiPosList: MapRSSIPos[];
        reflectorPosList: ReflectorPos[];
        tagPosList: TagPos[];
        primitiveList: Primitive[];
        externalDeviceList: ExternalDevice[];
        binLocationsList: BinLocations[];

        userData: MapProperty[];
    }

    export type Map3D = {
        mapDirectory: string;
        header: MapHeader;
        normalPos3dList: MapPos;
    }
}