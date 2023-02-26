const vSource = `
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;

void main() {
    gl_Position = vPosition;
    gl_PointSize = 8.0;
    fColor = vColor;
}`;

const fSource = `
precision mediump float;
varying vec4 fColor;

void main() {
    gl_FragColor = fColor;
}`;

// canvas setup
const canvas = document.getElementById('canvas');
const gl = setupWebGL(canvas);
const offsetCorr = (3.5 / 100) * window.innerHeight;    // corrections for css

let vertices = [];  // list of [x, y] where -1 < x, y < 1
let colors = [];    // list of [r, g, b, a] where 0 < r, g, b, a < 1

// state
let isDown = false; // true when mouse is clicked
let cursor = false; // true when button cursor pressed. Used for vertex drag
let isDrag = false;

let models = [];    // list of model
let drawModel = ""; // current model
let dragModel = "";
let idxVertices=[];
let dx = 0;
let dy = 0;
let d = 0;
let verticesCount = 0;

const verticesInShape = {
    rectangle: 4, 
    square: 4, 
    line: 2};

// list objects
let objectNum = -1;
let vertexNum = -1;
let objectFirstNum =-1; 

const polygonBtn = document.getElementById("polygonBtn");
let isFirstVertex = true;
let isLastVertex = true;
let polygonsVertices = [];
let countPolygonVertices = 0;
let savedShape = [];

const setPolygon = () => {
    // clicked
    if (polygonBtn.classList.contains("btnClicked")) {
        polygonBtn.classList.remove("btnClicked");
    } 
    // not clicked
    else {
        polygonBtn.classList.add("btnClicked");
        drawModel = "polygon"
    }
}

const setLine = () => {
    drawModel = "line"
}

const setSquare = () => {
    drawModel = "square"
}

const setRectangle = () => {
    drawModel = "rectangle"
}

const choose = () => {
    drawModel=""

}

const isNearbyVertice = (e, vertice) => {
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;
    return ((vertice[0] - 0.05 < x) && (x < vertice[0] + 0.05)
        && (vertice[1] - 0.05 < y) && (y < vertice[1] + 0.05));
}

const listObject = document.getElementById("listObject");

const mouseMoveListener = (e) => {
    // count mouse's coordinates
    if(isDrag) {
        let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
        let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;
        dragModel = models[objectNum]
        if (dragModel == "rectangle") {
            vertices[idx][0] = x;
            vertices[idx][1] = y;
            if(vertexNum==3){
                vertices[idx-1][1] = y;
                vertices[idx-2][0] = x;
            }
            else if(vertexNum==2){
                vertices[idx+1][1] = y;
                vertices[idx-2][0] = x;
            }
            else if(vertexNum==1){
                vertices[idx-1][1] = y;
                vertices[idx+2][0] = x;
            }
            else if(vertexNum==0){
                vertices[idx+1][1] = y;
                vertices[idx+2][0] = x;
            }
                
        } else if (dragModel == "line") {
            vertices[idx][0] = x;
            vertices[idx][1] = y;
        } else if (dragModel == "square") {
            if(vertexNum==3){
                dx = x - vertices[idx-3][0];
                dy = y - vertices[idx-3][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx-3][0] + dx;
                vertices[idx][1] = vertices[idx-3][1] + dy;
                vertices[idx-1][1] = vertices[idx-3][1] + dy;
                vertices[idx-2][0] = vertices[idx-3][0] + dx;
            }
            else if(vertexNum==2){
                dx = x - vertices[idx-1][0];
                dy = y - vertices[idx-1][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx-1][0] + dx;
                vertices[idx][1] = vertices[idx-1][1] + dy;
                vertices[idx+1][1] = vertices[idx-1][1] + dy;
                vertices[idx-2][0] = vertices[idx-1][0] + dx;
            }
            else if(vertexNum==1){
                dx = x - vertices[idx+1][0];
                dy = y - vertices[idx+1][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx+1][0] + dx;
                vertices[idx][1] = vertices[idx+1][1] + dy;
                vertices[idx-1][1] = vertices[idx+1][1] + dy;
                vertices[idx+2][0] = vertices[idx+1][0] + dx;
            }
            else if(vertexNum==0){
                dx = x - vertices[idx+3][0];
                dy = y - vertices[idx+3][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx+3][0] + dx;
                vertices[idx][1] = vertices[idx+3][1] + dy;
                vertices[idx+1][1] = vertices[idx+3][1] + dy;
                vertices[idx+2][0] = vertices[idx+3][0] + dx;
            }
        } else if (dragModel == "polygon") {
            vertices[idx][0] = x;
            vertices[idx][1] = y;
        }
        else {

        }
    }

    if (isDown) {
        // convert pixel to clip space (-1 to 1)
        let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
        let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;
        // vertices per model and shapes
        if (drawModel == "rectangle") {
            vertices[vertices.length - 1][0] = x;
            vertices[vertices.length - 1][1] = y;
            vertices[vertices.length - 2][1] = y;
            vertices[vertices.length - 3][0] = x;
        } else if (drawModel == "line") {
            vertices[vertices.length - 1][0] = x;
            vertices[vertices.length - 1][1] = y;
        } else if (drawModel == "square") {
            dx = x - vertices[vertices.length - 4][0];
            dy = y - vertices[vertices.length - 4][1];
            d = Math.min(Math.abs(dx), Math.abs(dy));
            dx > 0 ? dx = d : dx = -d;
            dy > 0 ? dy = d : dy = -d;
            vertices[vertices.length - 1][0] = vertices[vertices.length - 4][0] + dx;
            vertices[vertices.length - 1][1] = vertices[vertices.length - 4][1] + dy;
            vertices[vertices.length - 2][1] = vertices[vertices.length - 4][1] + dy;
            vertices[vertices.length - 3][0] = vertices[vertices.length - 4][0] + dx;
        } else if (drawModel == "polygon") {
            vertices[vertices.length - 1][0] = x;
            vertices[vertices.length - 1][1] = y;
        }
        else {

        }
    }
}

// color settings
var colorPicker = [
    [0.0, 0.0, 0.0, 1.0],  // black
    [1.0, 0.0, 0.0, 1.0],  // red
    [1.0, 1.0, 0.0, 1.0],  // yellow
    [0.0, 1.0, 0.0, 1.0],  // green
    [0.0, 0.0, 1.0, 1.0],  // blue
    [1.0, 0.0, 1.0, 1.0],  // magenta
    [0.0, 1.0, 1.0, 1.0]   // cyan
];
var color = [0.0, 0.0, 0.0, 1.0];   // default
var colorMenu = document.getElementById("colorMenu");

// count how many vertices before object or start of object
const countOffset = (objectNum) => {
    let offset = 0;
    let countPolygon = 0;
    for (let i = 0; i < objectNum; i++) {
        if (models[i] == "polygon") {
            verticesCount = polygonsVertices[countPolygon];
            countPolygon++;
        }
        else {
            verticesCount = verticesInShape[models[i]];
        }
        offset += verticesCount;
    }
    offset -= verticesCount;
    return {offset, verticesCount};
}

colorMenu.addEventListener("click", function () {
    let colorPicked = colorPicker[colorMenu.selectedIndex]
    color = colorPicked;
});

var changeColor = document.getElementById("changeColor")
changeColor.addEventListener("click", function () {
    let {offset, verticesCount} = countOffset(objectNum);
    // if vertex selected
    if (objectNum != -1 && vertexNum != -1) {
        colors[offset + (vertexNum - 1)] = color;
    }
    // else if object selected
    else if (objectNum != -1) {
        for (let i = offset; i < offset + verticesCount; i++) {
            colors[i] = color;
        }
    }
    render();
});

// moving vertex
var sliderX = document.getElementById("X")
var sliderY = document.getElementById("Y")
// sliderX.oninput = function (){
//     if()
// }

canvas.addEventListener('mousedown', (e) => {
    // convert pixel to (-1 to 1)
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;

    vertexNum = -1;

    let verticeNearby = isNearby(e)
    if (verticeNearby.length > 0){
        idx = objectNearby(vertices,verticeNearby[0]);
        objectNum,vertexNum,objectFirstNum = objectIdx(idxVertices,idx);
        console.log(objectNum,vertexNum,objectFirstNum,idx)
        isDrag=true
    }

    if (drawModel == "polygon") {
        // if first vertex
        if (isFirstVertex) {
            idxVertices.push(vertices.length)
            models.push(drawModel);
            isFirstVertex = false;
            isLastVertex = false;
            vertices.push([x, y]);
            colors.push(color);
            countPolygonVertices = 1;
            polygonsVertices.push(countPolygonVertices);
            objectNum = models.length;
        } 
        // else if new vertex is nearby the first vertex or last vertex
        else if (isNearbyVertice(e, vertices[vertices.length - countPolygonVertices])) {
            isFirstVertex = true;
            isLastVertex = true;
            polygonsVertices.pop();
            polygonsVertices.push(countPolygonVertices);
            polygonBtn.classList.remove("btnClicked");
        }
        // other vertices
        else {
            vertices.push([x, y]);
            colors.push(color);
            polygonsVertices.pop();
            countPolygonVertices++;
            polygonsVertices.push(countPolygonVertices);
        }

        isDown = true;
    } else if (drawModel != "") {
        models.push(drawModel);
        idxVertices.push(vertices.length)
        objectNum = models.length;

        for (let i = 0; i < verticesInShape[drawModel]; i++) {
            vertices.push([x, y]);
            colors.push(color);
        }

        isDown = true;
    }
})

canvas.addEventListener("mouseup", (e) => {
    // create list button for shape and vertex
    if (drawModel != "" && isLastVertex) {
        let newButtonObject = document.createElement("button");
        let newElList = document.createElement("li");
        let newListVertex = document.createElement("ul")
        newButtonObject.innerText = models[models.length - 1] + " " + models.length;
        newButtonObject.value = models.length

        newButtonObject.onclick = function () {
            objectNum = newButtonObject.value;
            vertexNum = -1;
            // clicked
            if (newButtonObject.classList.contains("btnClicked")) {
                newButtonObject.classList.remove("btnClicked");
            } 
            // not clicked
            else {
                newButtonObject.classList.add("btnClicked");
            }
        }

        newElList.appendChild(newButtonObject)
        newElList.appendChild(newListVertex)

        drawModel == "polygon" ? verticesCount = countPolygonVertices : verticesCount = verticesInShape[drawModel];

        for (let i = 0; i < verticesCount; i++) {
            let newButtonVertex = document.createElement("button")
            newButtonVertex.innerText = "Vertex " + (i + 1)
            newButtonVertex.value = i + 1
            newButtonVertex.onclick = function () {
                objectNum = newButtonObject.value;
                vertexNum = i + 1;
            }
            newListVertex.appendChild(newButtonVertex)
        }
        listObject.appendChild(newElList);
        drawModel = "";
    }
    isDrag = false
    isDown = false;
})

// save all configuration in one array
document.getElementById("save").addEventListener("click", function (e) {
    let fileName = document.getElementById('filename').value;
    savedShape = []
    savedShape.push(models);
    savedShape.push(vertices);
    savedShape.push(colors);
    savedShape.push(polygonsVertices);
    if (fileName == "") {
      fileName = "untitledCanvas";
    }
    if (fileName.slice(fileName.length-5) != ".json") {
      fileName = fileName + ".json";
    }
    downloadAllShapes(savedShape, fileName, "text/plain");
});

function downloadAllShapes(data, filename, type) {
    var file = new Blob([JSON.stringify(data)], {type: type});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}

//download all shapes in json format



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

    // gl tool per model
    let offsetBuffer = 0;
    let polygonCount = 0;
    for (let i = 0; i < models.length; i++) {
        if (models[i] == "rectangle") {
            gl.drawArrays(gl.POINTS, offsetBuffer, verticesInShape["rectangle"]);
            gl.drawArrays(gl.TRIANGLE_STRIP, offsetBuffer, verticesInShape["rectangle"]);
            offsetBuffer += verticesInShape["rectangle"];
        }
        else if (models[i] == "square") {
            gl.drawArrays(gl.POINTS, offsetBuffer, verticesInShape["square"]);
            gl.drawArrays(gl.TRIANGLE_STRIP, offsetBuffer, verticesInShape["square"]);
            offsetBuffer += verticesInShape["square"];
        }
        else if (models[i] == "line") {
            gl.drawArrays(gl.POINTS, offsetBuffer, verticesInShape["line"]);
            gl.drawArrays(gl.LINE_STRIP, offsetBuffer, verticesInShape["line"]);
            offsetBuffer += verticesInShape["line"];
        }
        else if (models[i] == "polygon") {
            gl.drawArrays(gl.POINTS, offsetBuffer, polygonsVertices[polygonCount]);
            gl.drawArrays(gl.TRIANGLE_FAN, offsetBuffer, polygonsVertices[polygonCount]);
            offsetBuffer += polygonsVertices[polygonCount];
            polygonCount++;
        }
    }
    window.requestAnimFrame(render);
}