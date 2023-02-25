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

// canvas setup
const canvas = document.getElementById('canvas');
const gl = setupWebGL(canvas);
const offset = (3.5 / 100) * window.innerHeight;    // corrections for css

let vertices = [];  // list of [x, y] where -1 < x, y < 1
let colors = [];    // list of [r, g, b, a] where 0 < r, g, b, a < 1

// state
let isDown = false; // true when mouse is clicked
let cursor = false;

let models = [];    // list of model
let drawModel = ""; // current model
let dx = 0;
let dy = 0;
let d = 0;

const verticesInShape = {
    rectangle: 4, 
    square: 4, 
    line: 2};

// list objects
let objectNum = -1;
let vertexNum = -1;

const setPolygon = () => {
    drawModel = "polygon"
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
    cursor = true

}

const isNearby = (e) => {
    let nearby = false;
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;
    let verticeNearby = vertices.filter(isNearbyV);

    function isNearbyV(vertice) {
        return ((vertice[0] - 0.05 < x) && (x < vertice[0] + 0.05)
            && (vertice[1] - 0.05 < y) && (y < vertice[1] + 0.05));
    }

    // return the vertice too?
    return (verticeNearby.length > 0);
}

const listObject = document.getElementById("listObject");

const mouseMoveListener = (e) => {
    // count mouse's coordinates
    if (isDown) {
        // convert pixel to clip space (-1 to 1)
        let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
        let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;
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
            //POLYGON
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
    for (let i = 0; i < objectNum - 1; i++) {
        offset += verticesInShape[models[i]];
    }
    return offset;
}

colorMenu.addEventListener("click", function () {
    let colorPicked = colorPicker[colorMenu.selectedIndex]
    color = colorPicked;
});

var changeColor = document.getElementById("changeColor")
changeColor.addEventListener("click", function () {
    // if vertex selected
    if (objectNum != -1 && vertexNum != -1) {
        colors[countOffset(objectNum) + (vertexNum - 1)] = color;
    }
    // else if object selected
    else if (objectNum != -1) {
        for (let i = countOffset(objectNum); i < countOffset(objectNum) + verticesInShape[models[objectNum - 1]]; i++) {
            colors[i] = color;
        }
    }
    render();
});

canvas.addEventListener('mousedown', (e) => {
    // convert pixel to (-1 to 1)
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offset - canvas.offsetTop)) / canvas.clientHeight;

    if (drawModel != "") {
        models.push(drawModel);
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
    if (drawModel != "") {
        let newButtonObject = document.createElement("button");
        let newElList = document.createElement("li");
        let newListVertex = document.createElement("ul")
        newButtonObject.innerText = models[models.length - 1] + " " + models.length;
        newButtonObject.value = models.length

        newButtonObject.onclick = function () {
            objectNum = newButtonObject.value;
            vertexNum = -1;
            // not clicked
            if (newButtonObject.classList.contains("btnClicked")) {
                newButtonObject.classList.remove("btnClicked");
                console.log("clicked");
            } 
            // clicked
            else {
                newButtonObject.classList.add("btnClicked");
                console.log("not");
            }
        }

        newElList.appendChild(newButtonObject)
        newElList.appendChild(newListVertex)

        for (let i = 0; i < verticesInShape[drawModel]; i++) {
            let newButtonVertex = document.createElement("button")
            newButtonVertex.innerText = "Vertex " + (i + 1)
            newButtonVertex.value = i + 1
            newButtonVertex.onclick = function () {
                objectNum = newButtonObject.value;
                vertexNum = i + 1;
                console.log(objectNum, vertexNum);
            }
            newListVertex.appendChild(newButtonVertex)
        }
        listObject.appendChild(newElList);
    }

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

    // gl tool per model
    let offsetBuffer = 0;
    for (let i = 0; i < models.length; i++) {
        if (models[i] == "rectangle") {
            gl.drawArrays(gl.TRIANGLE_STRIP, offsetBuffer, verticesInShape["rectangle"]);
            offsetBuffer += verticesInShape["rectangle"];
        }
        else if (models[i] == "square") {
            gl.drawArrays(gl.TRIANGLE_STRIP, offsetBuffer, verticesInShape["square"]);
            offsetBuffer += verticesInShape["square"];
        }
        else if (models[i] == "line") {
            gl.drawArrays(gl.LINE_STRIP, offsetBuffer, verticesInShape["line"]);
            offsetBuffer += verticesInShape["line"];
        }
    }
    window.requestAnimFrame(render);
}