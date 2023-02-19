/**
const vSource = `
    attribute vec4 vPosition;
    atrribute vec4 vColor;
    varying vec4 fColor;
    void main() {
        gl_Position = vPosition;
        fColor = vColor;
    }
`;

const fSource = `
    precision mediump float;
    varying vec4 fColor;
    void main() {
        gl_FragColor = fColor;
    }
`;
**/

const vSource = `
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;

void main() {
    gl_Position = vPosition;
    fColor = vColor;
}`;

const fSource = `
precision mediump float;
varying vec4 fColor;

void main() {
    gl_FragColor = fColor;
}`;



// canvas purposes
const canvas = document.getElementById('canvas');
const gl = setupWebGL(canvas);

let vertices = [];
let colors = [];
let list_of_vertices = [];

let dx = 0;
let dy = 0;
let d = 0;
let isDown = false;
const offset = (3.5/100) * window.innerHeight;
var currentModel = [];


const setPolygon = () => {
    currentModel.push("polygon");
}
const setLine = () => {
    currentModel = "line";
}
const setSquare = () =>{
    currentModel = "square";
}
const setRectangle = () =>{
    currentModel = "rectangle";
}

const setLine = () => {
    currentModel.push("line");
}

const setSquare = () => {
    currentModel.push("square");
}

const setRectangle = () => {
    currentModel.push("rectangle");
}


gl.clearColor(0.95, 0.95, 0.95, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const isNearby = (e) => {
    let nearby = false;
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;
    let verticeNearby = vertices.filter(isNearbyV);

    function isNearbyV(vertice) {
        return ((vertice[0] - 0.05 < x) && (x < vertice[0] + 0.05) 
        && (vertice[1] - 0.05 < y) && (y < vertice[1] + 0.05));
    }

    return (verticeNearby.length > 0);
}

const mouseMoveListener = (e) => {
    // count mouse's coordinates
    if (isDown) {
        // convert pixel to clip space (-1 to 1)
        let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
        let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;
        
        //vertices per model and shapes
        if(currentModel[currentModel.length-1] == "rectangle"){
            vertices[vertices.length-1][0] = x;
            vertices[vertices.length-1][1] = y;
            vertices[vertices.length-2][1] = y;
            vertices[vertices.length-3][0] = x;
            list_of_vertices.push(vertices);
        } else if (currentModel[currentModel.length-1] == "line"){
            vertices[vertices.length-1][1] = y;
            vertices[vertices.length-1][0] = x;
            list_of_vertices.push(vertices);
        } else if (currentModel[currentModel.length-1] == "square"){
            dx = x - vertices[vertices.length-1][0];
            dy = y - vertices[vertices.length-1][1];
            d = Math.min(Math.abs(dx),Math.abs(dy));
            dx > 0? dx = d : dx = -d;
            dy > 0? dy = d : dy = -d;
            vertices[vertices.length-3][1] = vertices[vertices.length-3][1] + dy;
            vertices[vertices.length-2][0] = vertices[vertices.length-2][0] + dx;
            vertices[vertices.length-2][1] = vertices[vertices.length-2][1] + dy;
            vertices[vertices.length-1][0] = vertices[vertices.length-1][0] + dx;
            list_of_vertices.push(vertices);
        }else{
            //POLYGON
        }
    }
}
var colorMenu = [
    [ 0.0, 0.0, 0.0, 1.0],  // black
    [ 1.0, 0.0, 0.0, 1.0],  // red
    [ 1.0, 1.0, 0.0, 1.0],  // yellow
    [ 0.0, 1.0, 0.0, 1.0],  // green
    [ 0.0, 0.0, 1.0, 1.0],  // blue
    [ 1.0, 0.0, 1.0, 1.0],  // magenta
    [ 0.0, 1.0, 1.0, 1.0]  // cyan
];
var color = [0.0,0.0,0.0,1.0];
var m = document.getElementById("mymenu");
    m.addEventListener("click", function() {
       color = colorMenu[m.selectedIndex]
    });
var a = document.getElementById("Button1")
    a.addEventListener("click", function(){
    render();
    });

canvas.addEventListener('mousedown', (e) => {
    // convert pixel to (-1 to 1)
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;
    let count = 2;
    if ((currentModel[currentModel.length-1] == "rectangle") || (currentModel[currentModel.length-1] == "square")){
        count = 4;
    } else if(currentModel[currentModel.length-1] = "line"){
        count = 2;
    }
     
    for (let i = 0; i < count; i++) {
        vertices.push([x, y]);
        colors.push(color);
        
    }
    
    isDown = true;
})

canvas.addEventListener("mouseup", (e) => {
    isDown = false;
})

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

// load shaders and initialize attribute buffers
const program = initShaders(gl, vSource, fSource);
gl.useProgram(program);

// associate out shader variables with our data buffer
const vBuffer = gl.createBuffer();
const cBuffer = gl.createBuffer();

render();
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
    
    //gl tool per model
    let vertice_count = 0;
    for(let i = 0; i < list_of_vertices.length; i+= 1){
        if(currentModel[i] == "rectangle"){
            vertice_count = 4;
            gltool = gl.TRIANGLE_STRIP;
            for (let i = 0; i < vertices.length; i+= vertice_count) {
                gl.drawArrays(gltool, i, vertice_count);
            }
        
        }else if(currentModel[i] == "line"){
            vertice_count = 2;
            gltool = gl.LINE_STRIP;
            for (let i = 0; i < vertices.length; i+= vertice_count) {
                gl.drawArrays(gltool, i, vertice_count);
            }
        
        }else if (currentModel[i] == "square"){
            vertice_count = 4;
            gltool = gl.TRIANGLE_FAN;
            for (let i = 0; i < vertices.length; i+= vertice_count) {
                gl.drawArrays(gltool, i, vertice_count);
            }
        }else{
            //POLYGON
        }
    }
    window.requestAnimFrame(render);
}

