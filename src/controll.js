canvas.addEventListener('mousemove', e => {
    mousepos = make_point(e.offsetX, e.offsetY);
}, false);

canvas.addEventListener('mousemove', e => {
    mousepos = make_point(e.offsetX, e.offsetY);
    if(mousedown) {
        // console.log(e)
        cameraX -= e.movementX;
        cameraY -= e.movementY;
    }
}, false);

canvas.addEventListener('mousedown', e => {
    if (e.button !== 2) return;
    mousedown=true
})

canvas.addEventListener('mouseup', e => {
    if (e.button !== 2) return;
    mousedown=false
})

canvas.addEventListener('mouseleave', e => {
    if (e.button !== 2) return;
    mousedown=false
})

canvas.addEventListener('click', () => {
    addPoint(getMousePos());
    refreshObjectSelector();
})

canvas.addEventListener('wheel', e => {
    targetZoom -= e.deltaY/500
    targetZoom = Math.max(0.1, targetZoom)
})

window.addEventListener('keydown', (e) => {
    // console.log(e)
    velocity = 10;
    if(e.key.toLowerCase() === 'a') {
        cameraX -= velocity;
    }

    if(e.key.toLowerCase() === 'w') {
        cameraY -= velocity;
    }

    if(e.key.toLowerCase() === 's') {
        cameraY += velocity;
    }

    if(e.key.toLowerCase() === 'd') {
        cameraX += velocity;
    }
    
    if(e.key.toLowerCase() === 'shift') {
        shiftIsPressed=true;
    }
    
    if(e.code === 'KeyX' && e.ctrlKey ) {
        revertRemLastPoint();
    }
    else if(e.code === 'KeyZ' && e.ctrlKey) {
        remLastPoint();
    }
    
})

window.addEventListener('keyup', (e) => {
    if(e.key.toLowerCase() === 'shift') {
        shiftIsPressed=false;
    }
})


function getMousePos() {
    return mousepos;
}

