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
let starting = [];

// state
let isDown = false; // true when mouse is clicked
let cursor = false; // true when button cursor pressed. Used for vertex drag
let isDrag = false;
let isAddVertex = false;
let isDeleteVertex = false;
let isMove = false;
let isScale = false;
let isDraw = true;

let models = [];    // list of model
let drawModel = ""; // current model
let dragModel = "";
let contact = [];
let idxVertices=[];
let dx = 0;
let dy = 0;
let d = 0;
let verticesCount = 0;
let verticesSquare = [[9, -9], [-9, -9], [9, 9], [-9, 9]];
let quadrant = 0;

const verticesInShape = {
    rectangle: 4, 
    square: 4, 
    line: 2};

// list objects
let objectNum = -1;
let vertexNum = -1;
let objectFirstNum =-1; 

const log = document.getElementById("log");
const current = document.getElementById("current");
current.innerHTML = "None";

// polygon
const polygonBtn = document.getElementById("polygonBtn");
let isFirstVertex = true;
let isLastVertex = true;
let polygonsVertices = [];
let countPolygonVertices = 0;

const setPolygon = () => {
    // clicked
    if (polygonBtn.classList.contains("btnClicked")) {
        polygonBtn.classList.remove("btnClicked");
    } 
    // not clicked
    else {
        polygonBtn.classList.add("btnClicked");
        drawModel = "polygon"
        log.innerHTML = "Preparing to draw polygon.";
    }
}

const setLine = () => {
    if (isDraw && drawModel != "polygon") {
        drawModel = "line";
        log.innerHTML = "Preparing to draw line.";
    }
}

const setSquare = () => {
    if (isDraw && drawModel != "polygon") {
        drawModel = "square";
        log.innerHTML = "Preparing to draw square.";
    }
}

const setRectangle = () => {
    if (isDraw && drawModel != "polygon") {
        drawModel = "rectangle";
        log.innerHTML = "Preparing to draw rectangle.";
    }
}

const choose = () => {
    drawModel=""
}

const addVertexBtn = document.getElementById("addVertexBtn");
const addVertex = () => {
    // no object is clicked
    if (objectNum == -1) {
        log.innerHTML = "Pick a polygon.";
    }
    // object is clicked
    else {
        let isPolygon = (models[objectNum - 1] == "polygon");
        let {offset, verticesCount, countPolygon} = countOffset(objectNum);
        // object is polygon
        if (isPolygon && polygonsVertices[countPolygon - 1] != 0) {
            isAddVertex = true;
            log.innerHTML = "Adding a vertex.";
            drawModel = "polygon";
        }
        else {
            log.innerHTML = "Not a polygon.";
        }
    }
}

const delVertexBtn = document.getElementById("delVertexBtn");
const delVertex = () => {

}

const moveBtn = document.getElementById("moveBtn");
const move = () => {
    // clicked
    if (moveBtn.classList.contains("btnClicked")) {
        moveBtn.classList.remove("btnClicked");
        isMove = false;
        isDraw = true;
        log.innerHTML = "";
    } 
    // not clicked
    else {
        // no object is clicked
        if (objectNum == -1) {
            log.innerHTML = "Pick an object.";
        }
        // object is clicked
        else {
            moveBtn.classList.add("btnClicked");
            log.innerHTML = "Moving an object.";
            isMove = true;
            isDraw = false;
        }
    }
}

const scaleBtn = document.getElementById("scaleBtn");
const scale = () => {
    // clicked
    if (scaleBtn.classList.contains("btnClicked")) {
        scaleBtn.classList.remove("btnClicked");
        isScale = false;
        isDraw = true;
        log.innerHTML = "";
    } 
    // not clicked
    else {
        // no object is clicked
        if (objectNum == -1) {
            log.innerHTML = "Pick an object.";
        }
        // object is clicked
        else {
            scaleBtn.classList.add("btnClicked");
            log.innerHTML = "Scaling an object.";
            isScale = true;
            isDraw = false;
        }
    }
}

const listObject = document.getElementById("listObject");

const mouseMoveListener = (e) => {
    // convert pixel to clip space (-1 to 1)
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;

    /*
    // if drag vertex
    if (isDrag) {
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
            } else if(vertexNum==2){
                dx = x - vertices[idx-1][0];
                dy = y - vertices[idx-1][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx-1][0] + dx;
                vertices[idx][1] = vertices[idx-1][1] + dy;
                vertices[idx+1][1] = vertices[idx-1][1] + dy;
                vertices[idx-2][0] = vertices[idx-1][0] + dx;
            } else if(vertexNum==1){
                dx = x - vertices[idx+1][0];
                dy = y - vertices[idx+1][1];
                d = Math.min(Math.abs(dx), Math.abs(dy));
                dx > 0 ? dx = d : dx = -d;
                dy > 0 ? dy = d : dy = -d;
                vertices[idx][0] = vertices[idx+1][0] + dx;
                vertices[idx][1] = vertices[idx+1][1] + dy;
                vertices[idx-1][1] = vertices[idx+1][1] + dy;
                vertices[idx+2][0] = vertices[idx+1][0] + dx;
            } else if(vertexNum==0){
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
    */
    // if move object
    if (isMove && contact.length > 0) {
        let {offset, verticesCount, } = countOffset(objectNum);
        dx = x - contact[0];
        dy = y - contact[1];
        
        for (let i = 0; i < verticesCount; i++) {
            vertices[offset + i][0] = starting[i*2] + dx;
            vertices[offset + i][1] = starting[i*2 + 1] + dy;
        }
    }
    // if scale object
    else if (isScale && contact.length > 0) {
        let point = [];
        if (quadrant == 1) {
            point = verticesSquare[3];
        }
        else if (quadrant == 2) {
            point = verticesSquare[2];
        }
        else if (quadrant == 3) {
            point = verticesSquare[1];
        }
        else {
            point = verticesSquare[0];
        }
        let scaleX = (x - point[0])/(contact[0] - point[0]);
        let scaleY = (y - point[1])/(contact[1] - point[1]);
        let scale = Math.max(Math.abs(scaleX), Math.abs(scaleY));
        scaleX > 0 ? scaleX = scale : scaleX = -scale;
        scaleY > 0 ? scaleY = scale : scaleY = -scale;
        let {offset, verticesCount, countPolygon} = countOffset(objectNum);
        for (let i = 0; i < verticesCount; i++) {
            vertices[offset + i][0] = scaleX * (starting[i*2] - point[0]) + point[0];
            vertices[offset + i][1] = scaleY * (starting[i*2 + 1] - point[1]) + point[1];
        }
    }
    // if draw
    else if (isDown) {
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
    return {offset, verticesCount, countPolygon};
}

colorMenu.addEventListener("click", function () {
    let colorPicked = colorPicker[colorMenu.selectedIndex]
    color = colorPicked;
});

var changeColor = document.getElementById("changeColor")
changeColor.addEventListener("click", function () {
    let {offset, verticesCount, } = countOffset(objectNum);
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

canvas.addEventListener('mousedown', (e) => {
    // convert pixel to (-1 to 1)
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;

    vertexNum = -1;

    /*
    let verticeNearby = isNearby(e)
    if (verticeNearby.length > 0){
        idx = objectNearby(vertices,verticeNearby[0]);
        objectNum,vertexNum,objectFirstNum = objectIdx(idxVertices,idx);
        isDrag = true
    }
    */

    // if add vertex
    if (isAddVertex) {
        let {offset, verticesCount, countPolygon} = countOffset(objectNum);
        let oldVertices = vertices.splice(offset, verticesCount);
        vertices.push(...oldVertices);
        vertices.push([x, y]);
        let oldColors = colors.splice(offset, verticesCount);
        colors.push(...oldColors);
        colors.push(color);
        polygonsVertices.splice(countPolygon - 1, 1, 0);
        polygonsVertices.push(verticesCount + 1);
        models.push(drawModel);
    } 
    // if move object
    else if (isMove) {
        contact = [x, y];
        let {offset, verticesCount, polygonCount} = countOffset(objectNum);
        for (let i = 0; i < verticesCount; i++) {
            for (let j = 0; j < 2; j++) {
                starting.push(vertices[offset + i][j]);
            }
        }
    }
    // if scale object
    else if (isScale) {
        let {offset, verticesCount, polygonCount} = countOffset(objectNum);
        console.log("yes");
        vertices.slice(offset, offset + verticesCount).forEach(function (item) {
            // check x
            if (item[0] < verticesSquare[0][0]) {
                verticesSquare[0][0] = item[0];
                verticesSquare[2][0] = item[0];
            }
            if (item[0] > verticesSquare[1][0]) {
                verticesSquare[1][0] = item[0];
                verticesSquare[3][0] = item[0];
            }
            // check y
            if (item[1] < verticesSquare[2][1]) {
                verticesSquare[2][1] = item[1];
                verticesSquare[3][1] = item[1];
            }
            if (item[1] > verticesSquare[1][1]) {
                verticesSquare[0][1] = item[1];
                verticesSquare[1][1] = item[1];
            }
        })

        for (let i = 0; i < verticesCount; i++) {
            for (let j = 0; j < 2; j++) {
                starting.push(vertices[offset + i][j]);
            }
        }

        let center = [(verticesSquare[0][0] + verticesSquare[1][0])/2, (verticesSquare[0][1] + verticesSquare[2][1])/2];
        if (x > center[0] && y > center[1]) {
            quadrant = 2;
        }
        else if (x >= center[0] && y <= center[1]) {
            quadrant = 4;
        }
        else if (x < center[0] && y < center[1]) {
            quadrant = 3;
        }
        else {
            quadrant = 1;
        }

        contact = [x, y];
    }
    // if draw polygon
    else if (drawModel == "polygon") {
        log.innerHTML = "";
        current.innerHTML = "Drawing polygon";
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
    } 
    // if draw others
    else if (drawModel != "" && isLastVertex) {
        log.innerHTML = "";
        current.innerHTML = "Drawing " + drawModel;
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
    if (isAddVertex) {
        let classRemove = ".shape" + objectNum;
        document.querySelectorAll(classRemove).forEach(e => e.remove());
        objectNum = models.length;
        log.innerHTML = "";
    }
    // create list button for shape and vertex
    if (drawModel != "" && isLastVertex) {
        let newButtonObject = document.createElement("button");
        let newElList = document.createElement("li");
        let newListVertex = document.createElement("ul")
        newButtonObject.innerText = models[models.length - 1] + " " + models.length;
        newButtonObject.value = models.length;
        let classAdd = "shape" + models.length;
        newButtonObject.classList.add(classAdd);
        current.innerHTML = "Object " + objectNum + ". Vertex " + vertexNum + ".";

        newButtonObject.onclick = function () {
            objectNum = newButtonObject.value;
            vertexNum = -1;
            current.innerHTML = "Object " + objectNum + ". Vertex " + vertexNum + ".";
        }

        newElList.appendChild(newButtonObject)
        newElList.appendChild(newListVertex)

        let {offset, verticesCount, countPolygon} = countOffset(models.length);
        countPolygonVertices = polygonsVertices[countPolygon - 1];
        drawModel == "polygon" ? verticesCount = countPolygonVertices : verticesCount = verticesInShape[drawModel];

        for (let i = 0; i < verticesCount; i++) {
            let newButtonVertex = document.createElement("button")
            newButtonVertex.innerText = "Vertex " + (i + 1)
            newButtonVertex.value = i + 1
            newButtonVertex.classList.add(classAdd);
            newButtonVertex.onclick = function () {
                objectNum = newButtonObject.value;
                vertexNum = i + 1;
                current.innerHTML = "Object " + objectNum + ". Vertex " + vertexNum + ".";
            }
            newListVertex.appendChild(newButtonVertex)
        }
        listObject.appendChild(newElList);
        drawModel = "";
    }
    isDrag = false;
    isDown = false;
    contact = [];
    starting = [];
    quadrant = 0;
    verticesSquare = [[9, -9], [-9, -9], [-9, 9], [9, 9]];
    isAddVertex = false;
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
            gl.drawArrays(gl.TRIANGLE_STRIP, offsetBuffer, polygonsVertices[polygonCount]);
            offsetBuffer += polygonsVertices[polygonCount];
            polygonCount++;
        }
    }
    window.requestAnimFrame(render);
}