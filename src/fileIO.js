const background = new Image();

$('#background-file').addEventListener('change', function(e) {
  if (e.target.files[0]) {
    background.src = URL.createObjectURL(e.target.files[0]);
    // canvas.style.backgroundImage = `url("${URL.createObjectURL(e.target.files[0])}")`;
  }
});

$('#state-file').addEventListener('change', function(e) {
  if (e.target.files[0]) {
    fetch(URL.createObjectURL(e.target.files[0]))
      .then((res) => res.json())
      .then((obj) => {
        loadState(obj)
      })
      .catch((e) => alert("Nie jest to poprawny plik .json"));
  }
})

$('#download-file').addEventListener('click', () => {
  let lastState = getState()
  download(
    JSON.stringify(lastState, null, 2),
    `${lastState.timestamp}.json`,
    'json'
  )
})



$('#download-comp-file').addEventListener('click', () => {
  let buffer = "";
  let lastState = getState()
  let intct = 0;
  let intus = 0;
  let clusterIndex = 0;
  for ( cluster of lastState.clusters ) {
    let spline = new Spline(
      cluster, 
      skipCoefficient, 
      momentSpeedupCoefficient, 
      100, 
      splinePointsRounding
    );
    let lodref = LOD[clusterLOD[clusterIndex]];
    let unoptimizedPoints = [...spline.nextPoint(true)];
    let optimizedPoints = CurveSimplificationAlgorithm(unoptimizedPoints, lodref.lineApproximationAngle);
    optimizedPoints = simplify_line(optimizedPoints, RDPReduction)
    
    intct += spline.points.length;

    let bufferX = `x := [${spline.points.map( e => e['x'])}]`;
    let bufferY = `y := [${spline.points.map( e => e['y'])}]`;
    let bufferT = `t := [${spline.points.map( (_,i) => spline.x(i))}]`;
    intus += optimizedPoints.length;
    let bufferU = `u:= [${optimizedPoints.map( p => p.u )}]`;
    buffer += bufferX + " " + bufferY + " " + bufferT + " " + bufferU + "\n\n";
    clusterIndex++;
  }

  download(buffer, "konkurs-I-344635-dane.txt", "text")
  download(`${lastState.clusters.length}, ${intct}, ${intus}`, "konkurs-I-344635-podsumowanie.txt", "text")
})


function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}