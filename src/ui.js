let removed_temp = {};

function remLastPoint() {
    if ( !(selectedCluseter in removed_temp) ) removed_temp[selectedCluseter] = [];
    removed_temp[selectedCluseter].push(clusters[selectedCluseter][clusters[selectedCluseter].length-1])
    clusters[selectedCluseter].pop()
}

function revertRemLastPoint() {
    if ( !(selectedCluseter in removed_temp) ) return;
    if (removed_temp[selectedCluseter].length <= 0 ) return;
    let last = removed_temp[selectedCluseter][removed_temp[selectedCluseter].length - 1];
    clusters[selectedCluseter].push(last);
    removed_temp[selectedCluseter].pop();
}

function refreshObjectSelector() {
    let objectList = "";
    for ( let i = 0; i<clusters.length; i++ ) {
        objectList += `<option ${selectedCluseter==i?`selected`:``} id="${i}">Obiekt ${i+1}</option>\n`
    }

    let pointList = "";
    if (clusters[selectedCluseter]) {
        for ( let pt of clusters[selectedCluseter] ) {
            pointList += `<option>(${pt.x},${pt.y})</option>\n`
        }
    }
    
    $('#object-sel').innerHTML = objectList;
    $('#object-sel').size = 20
    $('#point-sel').innerHTML = pointList;
    $('#point-sel').size = 20
    $('#lod-sel').value = clusterLOD[selectedCluseter]
}

refreshObjectSelector();

function addPoint(point) {
    if (clusters.length == 0) addObject();
    if (selectedCluseter < 0 ) selectedCluseter = 0;
    if (selectedCluseter >= clusters.length) selectedCluseter = clusters.length-1;
    clusters[selectedCluseter].push(deraster_pt(point));
}

function remObject() {
    clusters = clusters.filter((_,i) => i != selectedCluseter);
    selectedCluseter = Math.max(0,selectedCluseter - 1);
    refreshObjectSelector()
}

function addObject() {
    clusters.push([]);
    clusterLOD.push('medium')
    selectedCluseter = clusters.length - 1;
    refreshObjectSelector()
}

for ( const level of ["low", "medium", "high"] ) {
    $(`#lod-${level} > .rounding`).addEventListener("input", () => {
        LOD[level].splinePointsRounding = Number($(`#lod-${level} > .rounding`).value);
    })
    
    $(`#lod-${level} > .skip-coefficient`).addEventListener("input", () => {
        LOD[level].skipCoefficient = Number($(`#lod-${level} > .skip-coefficient`).value);
    })
    
    $(`#lod-${level} > .moment-speedup-coefficient`).addEventListener("input", () => {
        LOD[level].momentSpeedupCoefficient = Number($(`#lod-${level} > .moment-speedup-coefficient`).value);
    })
    
    $(`#lod-${level} > .line-approximation-angle`).addEventListener("input", () => {
        LOD[level].lineApproximationAngle = Number($(`#lod-${level} > .line-approximation-angle`).value);
    })
    
    $(`#lod-${level} > .base-control-point-count`).addEventListener("input", () => {
        LOD[level].baseControlPointCount = Number($(`#lod-${level} > .base-control-point-count`).value);
    })
}

$("#thickness").addEventListener("input", () => {
    splineThickness = Number($("#thickness").value);
})

$("#distanceNormCoefficient").addEventListener("input", () => {
    distanceNormalizationCoefficient = Number($("#distanceNormCoefficient").value);
})

$("#heatMapSensitivity").addEventListener("input", () => {
    heatMapSensitivity = Number($("#heatMapSensitivity").value);
})

$("#dapreduction").addEventListener("input", () => {
    dapreduction = Number($("#dapreduction").value);
})

$("#RDPReduction").addEventListener("input", () => {
    RDPReduction = Number($("#RDPReduction").value);
})

$('#add-obj-btn').addEventListener('click', addObject)
$('#rem-obj-btn').addEventListener('click', remObject)

$('#object-sel').addEventListener('change', _ => { 
    selectedCluseter = $('#object-sel').selectedOptions[0].id
    refreshObjectSelector()
})

$('#lod-sel').addEventListener('change', _ => { 
    clusterLOD[selectedCluseter] = $('#lod-sel').value
    refreshObjectSelector()
})

$('#rem-point-btn').addEventListener('click', remLastPoint)
$('#revert-rem-point-btn').addEventListener('click', revertRemLastPoint)

$("#download-image").addEventListener('click', () => {
    let link = $("#download-image");
    link.setAttribute('download', 'konkurs-I-344635.jpg');
    link.setAttribute('href', canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream"));
    // link.click();
});
