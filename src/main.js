function drawCursorAt(point) {
    point = point
    // console.log(point)
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0 0 0 / 20%)";
    ctx.moveTo(0, point.y)
    ctx.lineTo(canvas.width, point.y);
    ctx.stroke();
    ctx.moveTo(point.x, 0)
    ctx.lineTo(point.x, canvas.height);
    ctx.stroke();
}

function drawClusters() {
    let clusterIdx = 0;
    for ( let cluster of clusters ) {
        clusterIdx++;
        if (cluster.length <= 0) continue;
        if(clusterIdx-1 != selectedCluseter) continue;
        let maX = 0, maY = 0, miX = raster_pt(cluster[0]).x, miY = raster_pt(cluster[0]).y;
        for (let pt of cluster) {
            pt = point = raster_pt(pt)
            maX = Math.max(maX, pt.x)
            maY = Math.max(maY, pt.y)
            miX = Math.min(miX, pt.x)
            miY = Math.min(miY, pt.y)
        }
        ctx.rect(miX, miY, maX - miX, maY- miY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(210 0 0 / 25%)";
        ctx.stroke();
        ctx.font = "12px serif";
        ctx.fillStyle = "rgb(0 0 0 / 100%)";
        ctx.fillText(`Obiekt ${clusterIdx}`, miX, miY-2)
        drawKnots(cluster)
    }
}

function drawKnots(knots) {
    if ( knots.length == 0 ) return;
    ctx.beginPath()
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0 0 255 / 20%)";
    ctx.moveTo(raster_pt(knots[0]).x, raster_pt(knots[0]).y)
    for ( let i = 1; i<knots.length; i++ ) {
        ctx.lineTo(raster_pt(knots[i]).x, raster_pt(knots[i]).y)
    }
    ctx.stroke()
    
    for ( let knot of knots ) {
        knot = raster_pt(knot)
        ctx.beginPath();
        ctx.fillStyle = "rgb(0 255 0 / 70%)"
        ctx.arc(knot.x, knot.y, 2, 0, 2*Math.PI)
        ctx.fill();
    }
}




function variableSplineThickness(time) {
    return splineThickness * zoom * Math.min(1, (0.4 + time))
}

function variableSplineOpacity(time) {
    return (time)
}

function drawSplinesFast() {
    let clusterIdx = 0;
    let ct=0;
    for ( let cluster of clusters ) {
        clusterIdx++;
        if (cluster.length <= 0) continue;
        let pts = cluster
        if(clusterIdx-1 == selectedCluseter && shiftIsPressed) {
            pts = [...pts, (deraster_pt(getMousePos()))];
        }

        const lodref = LOD[clusterLOD[clusterIdx-1]] 

        let spline = new Spline(
            pts, 
            lodref.skipCoefficient, 
            lodref.momentSpeedupCoefficient, 
            lodref.baseControlPointCount, 
            lodref.splinePointsRounding,
            distanceNormalizationCoefficient
        );

        let unoptimizedPoints = [...spline.nextPoint()];
        if ( unoptimizedPoints.length <= 0 ) continue;
        let optimizedPoints = CurveSimplificationAlgorithm(unoptimizedPoints, lodref.lineApproximationAngle);
        // let xs = optimizedPoints.map(e => e.u)
        // optimizedPoints = DeriviativeAnglePointReduction(
        //     optimizedPoints, xs, optimizedPoints[0].sx, optimizedPoints[0].sy, optimizedPoints[0].ex, optimizedPoints[0].ey, dapreduction
        // );
        optimizedPoints = simplify_line(optimizedPoints, RDPReduction)

        let last_pt = optimizedPoints[0];
        


        let idx = 0;
        for (const point of optimizedPoints) {
            
            
            // let dst = distance(last_pt, point);//distance(last_pt, point);

            // angle between first deriviative and second deriviative and perhaps length of snd derriviative


            // linear approximation of current snd deriviative

            // let moment = make_point(
            //     point.sx + (idx/optimizedPoints.length)*(point.ex - point.sx), 
            //     point.sy + (idx/optimizedPoints.length)*(point.ey - point.sy)
            // );
            // let dy = make_point((point.x - last_pt.x)/(point.u - last_pt.u), (point.y - last_pt.y)/(point.u - last_pt.u));
            // let ang = tpAngle(moment, {x:0,y:0}, dy); 
            let last_pt_raster = raster_pt(last_pt);
            ctx.beginPath()
            ctx.moveTo(last_pt_raster.x, last_pt_raster.y);
            let pt = raster_pt(point);
            ctx.lineTo(pt.x, pt.y);
            ct++;
            last_pt = point;
            ctx.lineCap = 'round'
            let x = (idx/optimizedPoints.length);
            let t = 4*x*(1-x)
            // console.log(t)
            let op = (variableSplineOpacity(t)) * 100;
            ctx.strokeStyle = `rgb(200 0 0 / ${op}%)`
            ctx.lineWidth = variableSplineThickness(t);
            ctx.stroke();

            last_pt = point
                
            // console.log(dst)
            

            // if ( idx % 4 == 0 ) {
            //     ctx.beginPath();
            //     let mv = make_point(
            //         point.x + point.sx + (idx/optimizedPoints.length)*(point.ex - point.sx), 
            //         point.y + point.sy + (idx/optimizedPoints.length)*(point.ey - point.sy)
            //     );
            //     mv = raster_pt(mv);
            //     ctx.moveTo(pt.x, pt.y)
            //     ctx.lineTo(mv.x, mv.y)
            //     ctx.lineWidth = 2;
            //     ctx.strokeStyle = "black";
            //     ctx.stroke()
            // }
            idx++;

        }  

        
              
    }
    updatePointsCalculated(ct);

}

function drawSplinesPretty() {
    let clusterIdx = 0;
    let ct = 0;
    for ( let cluster of clusters ) {
        clusterIdx++;
        if (cluster.length <= 0) continue;
        let pts = cluster
        if(clusterIdx-1 == selectedCluseter && shiftIsPressed) {
            pts = [...pts, (deraster_pt(getMousePos()))];
        }

        let spline = new Spline(
            pts, 
            skipCoefficient, 
            momentSpeedupCoefficient, 
            100, 
            splinePointsRounding
        );
        let last_pt = spline.nextPoint().next().value;
        let first_pt = last_pt;
        last_pt = raster_pt(last_pt);
        // line smoothing
        for (const point of spline.nextPoint()) {
            let pt = raster_pt(point);
            // penBrushLine(last_pt, pt, 12);
            // last_pt = pt;
            ctx.beginPath()
            ctx.moveTo(last_pt.x, last_pt.y)
            ctx.lineTo(pt.x, pt.y);
            ctx.lineCap = 'round'
            ctx.strokeStyle = "rgb(200 0 0 / 80%)"
            ctx.lineWidth = variableSplineThickness(Math.sqrt((first_pt.x - point.x)**2 + (first_pt.y - point.y)**2));
            // if (ct % 100 == 0) console.log(Math.sqrt((first_pt.x - point.x)**2 + (first_pt.y - point.y)**2))
            ctx.stroke();
            last_pt = pt;
            ct++;
            // ctx.arc(pt.x, pt.y, 2, 0, 2*Math.PI)
            // ctx.fill();
        }        
    }
    updatePointsCalculated(ct);
}

function drawSplinesDebug() {
    let clusterIdx = 0;
    let ct=0;
    for ( let cluster of clusters ) {
        clusterIdx++;
        if (cluster.length <= 0) continue;
        let pts = cluster
        if(clusterIdx-1 == selectedCluseter && shiftIsPressed) {
            pts = [...pts, (deraster_pt(getMousePos()))];
        }

        let spline = new Spline(
            pts, 
            skipCoefficient, 
            momentSpeedupCoefficient, 
            100, 
            splinePointsRounding
        );
        let last_pt = raster_pt(spline.nextPoint());
        // line smoothing
        for (const point of spline.nextPoint()) {
            let pt = raster_pt(point);
            // penBrushLine(last_pt, pt, 12);
            // last_pt = pt;
            ctx.beginPath()
            // ctx.moveTo(last_pt.x, last_pt.y)
            // ctx.lineTo(pt.x, pt.y);
            ctx.lineCap = 'round'
            // let grad = ctx.createLinearGradient(50, 50, 150, 150);
            // let ss = point.sM/6;
            // let es = point.eM/6;
            // grad.addColorStop(0, `rgb(${255*(1-ss)} ${255*(ss)} 0 / 80%)`);
            // grad.addColorStop(1, `rgb(${255*(1-es)} ${255*(es)} 0 / 80%)`);
            // ctx.strokeStyle = grad;
            // ctx.strokeStyle = "rgb(200 0 0 / 80%)"
            // ctx.lineWidth = variableSplineThickness(point);
            // ctx.stroke();
            // last_pt = pt;
            ct++;
            ctx.fillStyle = 'black'
            ctx.arc(pt.x, pt.y, splineThickness * zoom, 0, 2*Math.PI)
            ctx.fill();
        }        
    }
    updatePointsCalculated(ct);

}

function drawAxis() 
{
    ctx.beginPath();
    let centre = raster_pt({x: canvas.width/2, y: canvas.height/2});
    ctx.lineTo(centre.x, 999999);
    ctx.lineTo(centre.x, -999999);
    ctx.lineTo(999999, centre.y);
    ctx.lineTo(-999999, centre.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0 0 0 / 10%)"
    ctx.stroke()
}

function updatePointsCalculated(pointsCalculated) {
    $("#points-calculated").innerHTML = `pointsCalculated: ${pointsCalculated}`
}

function drawLoop(timestamp) {
    // if(wasUpdated) wasUpdated = false;
    // else return requestAnimationFrame(drawLoop);
    if (!lastFrameTime) lastFrameTime = timestamp;
    let dt = timestamp - lastFrameTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(255 255 255 / 100%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let tl = raster_pt(make_point(0,0))
    let br = raster_pt(make_point(canvas.height * (background.width/background.height),canvas.height))
    ctx.drawImage(
        background,
        tl.x, tl.y,
        br.x - tl.x, br.y - tl.y 
    );
    // drawAxis();
    drawCursorAt(getMousePos())
    drawSplinesFast();
    // drawSplinesPretty();
    // drawSplinesDebug();

    // drawClusters();
    // console.log(dt)
    zoom = lerp(dt / 100, zoom, targetZoom)

    lastFrameTime = timestamp;
    requestAnimationFrame(drawLoop)
}

requestAnimationFrame(drawLoop)
