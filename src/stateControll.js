function getState() {
    return {
        timestamp: Date.now(), 
        clusters,
        clusterLOD
    }
}

function saveToLocalStorage() {
    let snapshot = getState()
    localStorage.setItem(`save-latest`, JSON.stringify(snapshot))
}

setInterval(()=>{
    saveToLocalStorage();
    console.log(`autosave...`)
}, 1000)

function loadLatestFromLocalStorage() {
    let lastsave = localStorage.getItem('save-latest');
    if(lastsave) {
        let parsed = JSON.parse(lastsave);
        loadState(parsed)
    }
}

function loadState(data) {
    if(data) {
        clusters = data['clusters']
        clusterLOD = data['clusterLOD'] ? data['clusterLOD'] : data['clusters'].map( _ => "medium" )
    }
}

loadLatestFromLocalStorage()

function getParametersState()
{
    return {
        splineThickness,
        LOD
    };
}

function saveParameters()
{
    localStorage.setItem(`latestParams`, JSON.stringify(getParametersState()))
}

function loadSavedParameters()
{
    let lastsave = localStorage.getItem('latestParams');
    if(lastsave) {
        let parsed = JSON.parse(lastsave);
        console.log(`Loading`, parsed)
        $(`#thickness`).value = parsed[splineThickness]
        for ( const level in parsed.LOD ) {
            console.log(level)
            let obj = parsed.LOD[level];
            LOD[level].splinePointsRounding = obj.splinePointsRounding
            $(`#lod-${level} > .rounding`).value = obj.splinePointsRounding
            LOD[level].skipCoefficient = obj.skipCoefficient
            $(`#lod-${level} > .skip-coefficient`).value = obj.skipCoefficient
            LOD[level].momentSpeedupCoefficient = obj.momentSpeedupCoefficient
            $(`#lod-${level} > .moment-speedup-coefficient`).value = obj.momentSpeedupCoefficient
            LOD[level].lineApproximationAngle = obj.lineApproximationAngle
            $(`#lod-${level} > .line-approximation-angle`).value = obj.lineApproximationAngle
            LOD[level].baseControlPointCount = obj.baseControlPointCount
            $(`#lod-${level} > .base-control-point-count`).value = obj.baseControlPointCount
        }
        
        
    }
}

loadSavedParameters();