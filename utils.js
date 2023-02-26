const objectNearby= (vertices,verticeNearby) =>{
    return vertices.findIndex((e) => {
        return e[0] == verticeNearby[0] && e[1] == verticeNearby[1]
    })
}

// get list of vertices nearby in radius of 0.05
const isNearby = (e) => {
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;
    let verticeNearby = vertices.filter(function (vertice) {
        return euclideanDistance(vertice, [x, y]) <0.05;
    })
    return verticeNearby;
}

const isNearbyVertice = (e, vertice) => {
    let x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    let y = 1 - (2 * (e.clientY - offsetCorr - canvas.offsetTop)) / canvas.clientHeight;
    return euclideanDistance(vertice,[x,y]) < 0.05;
}

const objectIdx = (idxVertices,idx) => {
    objectNum = -1
    vertexNum = -1
    objectFirstNum = -1
    for( i = 0; i < idxVertices.length; i++){
        if(idxVertices[i] <= idx){
            objectNum = i
            vertexNum = idx - idxVertices[i]
            objectFirstNum = idxVertices[i]
        }
    }
    return {
        objectNum,
        vertexNum,
        objectFirstNum
    };
}

const euclideanDistance = (coor1, coor2) => {
    return Math.sqrt(
        (coor1[0] - coor2[0]) * (coor1[0] - coor2[0]) + (coor1[1] - coor2[1]) * (coor1[1] - coor2[1])
    );
};

const norm = (deg) => {
    return ((((deg + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 & Math.PI)) - Math.PI;
};

const atan3 = (coor1, coor2) => {
    return Math.atan2(coor2[1] - coor1[1], coor2[0] - coor1[0]);
};

const dec_hex = (dec) => {
    dec = Math.min(255, dec);
    return hexcode[Math.floor(dec / 16)] + hexcode[dec % 16];
};

const hex_dec = (hex) => {
    let toReturn = 0;
    for (let i = 0; i < hex.length; i++) {
        toReturn = toReturn * 16 + deccode[hex[i]];
    }
    return toReturn;
};

function setupWebGL(canvas) {
    const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');

    if (!gl) {
        alert("WebGL isn't available");
        return; // add
    }

    return gl;
}

function initShaders(gl, vertexSource, fragmentSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const msg =
            'Shader program failed to link. The error log is:' +
            '<pre>' +
            gl.getProgramInfoLog(program) +
            '<pre>';
        alert(msg);
        return -1;
    }
    
    return program;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occured compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return -1;
    }
    
    return shader;
}

function flatten(v) {
    if (v.matrix === true) {
        v = transpose(v);
    }

    let n = v.length;
    let elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    const floats = new Float32Array(n);

    if (elemsAreArrays) {
        let idx = 0;
        for (let i = 0; i < v.length; ++i) {
            for (let j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    } else {
        for (let i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}

window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000/60);
        }
    );
})();