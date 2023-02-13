"use strict";

const vertexShader2d=`
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_scale;

void main() {
  // Scale the position
  vec2 scaledPosition = a_position * u_scale + vec2(300,300);
  
  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = scaledPosition / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}`;
const fragmentShader2d=`
precision mediump float;

uniform vec4 u_color;

void main() {
   gl_FragColor = u_color;
}`;

function rectangle() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    var program = webglUtils.createProgramFromScripts(gl, [vertexShader2d, fragmentShader2d]);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
  
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var scaleLocation = gl.getUniformLocation(program, "u_scale");

    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);
    var scale = [1, 1];
    var color = [Math.random(), Math.random(), Math.random(), 1];
    drawScene();

    document.getElementById("scaleX").onchange = function(event){
        scale[0] = event.target.value;
        drawScene();
    };
    document.getElementById("scaleY").onchange = function(event){
        scale[1] = event.target.value;
        drawScene();
    };
    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
    
        // Turn on the attribute
        gl.enableVertexAttribArray(positionLocation);
    
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);
    
        // set the resolution
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    
        // set the color
        gl.uniform4fv(colorLocation, color);

        // Set the scale.
        gl.uniform2fv(scaleLocation, scale);
    
        // Draw the geometry.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;  // 6 triangles in the 'F', 3 points per triangle
        gl.drawArrays(primitiveType, offset, count);
      }

}
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150
        ]),
        gl.STATIC_DRAW);
  }

  rectangle()