const $ = x => document.querySelector(x);

function make_point(x, y) {
    return {x, y}
}

function raster_pt(point) {
    return make_point((point.x - canvas.width/2) * zoom + canvas.width/2 - cameraX, (point.y - canvas.height/2) * zoom + canvas.height/2 - cameraY)
}

function deraster_pt(point) {
    return make_point((point.x - canvas.width/2 + cameraX) / zoom  + canvas.width/2, (point.y - canvas.height/2 + cameraY) / zoom  + canvas.height/2)
}

function lerp(t, v1, v2) {
    return v1 + (v2-v1)*t;
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

// angle between 3 points
function tpAngle(s, m, e) {
    let v1 = make_point(s.x - m.x, s.y - m.y);
    let v2 = make_point(e.x - m.x, e.y - m.y);
    return 180 * (Math.acos((v1.x * v2.x + v1.y * v2.y)/(Math.sqrt(v1.x**2 + v1.y**2)*Math.sqrt(v2.x**2 + v2.y**2))) / Math.PI);
}

// point reduction algoirthm by difference
function CurveSimplificationAlgorithm(points, tollerance, maxIterations = 110) {
    if ( points.length < 3 ) return points;
    // we need to rerun this algorithm until no updates are being made
    let didUpdate = true;
    while (didUpdate && maxIterations > 0) {
        maxIterations--;
        didUpdate=false;
        for ( let i = points.length - 2; i >= 1; i-- ) {
            if ( tpAngle(points[i+1], points[i], points[i-1]) < tollerance && !points[i].isControllPoint ) {
                // slow as hell
                points = points.filter( (_,j) => j != i )
                i--;
                didUpdate=true;
            }
        }
    }
    // first and the last point must not be considered for optimization
    return points;
}


// simplify(points)
//   heap = minHeap(compareArea)
//   maxArea = 0
//   intersecting = []

//   for (point in points)
//     point.area = area(point)
//     heap.add(point)

//   while (point = heap.pop())
//     if (point.area < maxArea) point.area = maxArea
//     else maxArea = point.area

//     // Check that the new segment doesn’t intersect with
//     // any existing segments, except for the point’s
//     // immediate neighbours.
//     if (intersect(heap, point.previous, point.next))
//       intersecting.push(point)
//       continue

//     // Reattempt to process points that previously would
//     // have caused intersections when removed.
//     while (i = intersecting.pop()) heap.push(i)

//     remove(point) // remove from doubly linked list
//     update(point.previous, heap)
//     update(point.next, heap)

// update(point, heap)
//   point.area = area(point)
//   heap.update(point)

function VisvalingamWhyatt(points, tollerance) {
    // TODO: Implement
}



// this should only be used between control points
function DeriviativeAnglePointReduction(ss, xs, msx, msy, mex, mey, strength) {
    // The idea is that if the angle between 
    // S'(x) and S''(x) is small enough, we can eliminate points, 
    // because that means we're currently building a straight line


    let result = [ss[0]];

    // first and last the point must stay
    for ( let i = 0; i<ss.length; i++ ) {
        result.push(ss[i])
        for ( let j = i+1; j<ss.length; j++ ) {
            dyApproximation = make_point(
                (ss[j-1].x - ss[i].x)/(xs[i] - xs[i-1]), 
                (ss[j-1].y - ss[i].y)/(xs[i] - xs[i-1])
            )
            
            let moment = make_point(
                msx + (j/ss.length)*(mex - msx), 
                msy + (j/ss.length)*(mey - msy)
            );
            let ang = tpAngle(moment, {x:0,y:0}, dyApproximation) * Math.sqrt(moment.x ** 2 + moment.y ** 2);
            
            // greedy approach
            if ( ang > strength || ss[j].isControllPoint ) {
                result.push(ss[i]);
                i = j;
                break;
            }
        }
    }
    result.push(ss[ss.length-1])
    return result;
}


function RDPCurveSimplification(pts, epsilon) {
    function perpendicularDistance(root, line) {
        let x1 = line[0].x; let x2 = line[line.length-1].x;
        let y1 = line[0].y; let y2 = line[line.length-1].y;
        let x0 = root.x; let y0 = root.y;
        return Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1)/Math.sqrt((y2-y1)**2 + (x2 - x1)**2);

    }

    let dmax = 0;
    let index = 0;
    for ( let i = 1; i<pts.length - 1; i++ ) {
        let d = perpendicularDistance(pts[i], pts)
        if ( d > dmax ) {
            index = i;
            dmax = d;
        }
    }

    result = [];

    if ( dmax > epsilon ) {
        let rec1 = RDPCurveSimplification(pts.slice(0, index+1), epsilon);
        let rec2 = RDPCurveSimplification(pts.slice(index, pts.length), epsilon);
        result = [...rec1, ...rec2];
    } else {
        result = [pts[0], pts[pts.length-1]];
    }

    return result;
}

// Implementation of the Visvalingam-Whyatt algorithm in JavaScript
function visvalingamWhyatt(points, epsilon) {
    if (points.length <= 2) {
      // If there are 2 or fewer points, return them as they cannot be simplified further
      return points;
    }
  
    // Helper function to calculate the effective area of a triangle formed by three points
    function calculateArea(p1, p2, p3) {
      return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
    }
  
    // Create an array to store the effective areas for each point
    const areas = points.map((point, index) => {
      if (index === 0 || index === points.length - 1) {
        // First and last points have an undefined area (treated as infinity to preserve them)
        return Infinity;
      } else {
        return calculateArea(points[index - 1], point, points[index + 1]);
      }
    });
  
    // While there are points with an area less than epsilon, simplify the list
    while (true) {
      // Find the point with the smallest effective area
      let minArea = Infinity;
      let minIndex = -1;
  
      for (let i = 1; i < areas.length - 1; i++) {
        if (areas[i] < minArea) {
          minArea = areas[i];
          minIndex = i;
        }
      }
  
      // If the smallest area is greater than or equal to epsilon, stop simplifying
      if (minArea >= epsilon) {
        break;
      }
  
      // Remove the point with the smallest area
      points.splice(minIndex, 1);
      areas.splice(minIndex, 1);
  
      // Recalculate areas for affected neighbors
      if (minIndex > 0 && minIndex < areas.length) {
        areas[minIndex - 1] = calculateArea(points[minIndex - 2], points[minIndex - 1], points[minIndex]);
      }
      if (minIndex < areas.length - 1) {
        areas[minIndex] = calculateArea(points[minIndex - 1], points[minIndex], points[minIndex + 1]);
      }
    }
  
    return points;
  }


function simplify_line(points, min_area)
{
	// We need 3+ points to use this algorithm!
	if(points.length < 3)
		return points;
	
	points = points.slice(); // Shallow clone the array
	
	while(true)
	{
		let smallest_area = Number.MAX_SAFE_INTEGER, smallest_area_i = 1;
		
		for(let i = 1; i < points.length - 1; i++)
		{
			let next_area = triangle_area(points[i - 1], points[i], points[i + 1]);
			if(next_area < smallest_area) {
				smallest_area = next_area;
				smallest_area_i = i;
			}
		}
		
		if(smallest_area >= min_area || points.length <= 3)
			break;
		
		// Remove the central point of the smallest triangle
		points.splice(smallest_area_i, 1);
	}
	
	return points;
}


function triangle_area(a, b, c)
{
	return Math.abs(
		(
			a.x * (b.y - c.y) +
			b.x * (c.y - a.y) +
			c.x * (a.y - b.y)
		) / 2
	);
}
