const canvas = $('canvas')
const ctx = canvas.getContext('2d');

// state
let targetZoom = 1;
let zoom = 1;
let cameraX = 0;
let cameraY = 0;
let mousepos = make_point(0,0)
let selectedCluseter = 0;
let clusters = [
    [],
]

let clusterLOD = [
    'medium'
]

let LOD = {
    "low": {
        splinePointsRounding: 4,
        skipCoefficient: 2,
        momentSpeedupCoefficient: 0,
        lineApproximationAngle: 15,
        baseControlPointCount: 50
    },
    "medium": {
        splinePointsRounding: 4,
        skipCoefficient: 2,
        momentSpeedupCoefficient: 0,
        lineApproximationAngle: 15,
        baseControlPointCount: 50
    },
    "high": {
        splinePointsRounding: 4,
        skipCoefficient: 2,
        momentSpeedupCoefficient: 0,
        lineApproximationAngle: 15,
        baseControlPointCount: 50
    }
}

let mousedown = false;
let shiftIsPressed = false;
let lastFrameTime = undefined;
let splineThickness = 8;
let wasUpdated=true;


// DEPRECATED
let splinePointsRounding = 4;
let skipCoefficient = 2;
let momentSpeedupCoefficient = 0;
let lineApproximationAngle = 15;
let baseControlPointCount = 50;


let distanceNormalizationCoefficient = 1;
let heatMapSensitivity = 1;
let dapreduction = 1;
let RDPReduction = 0;