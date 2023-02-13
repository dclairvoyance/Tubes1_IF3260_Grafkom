"use strict";

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);
    var scale = [1, 1];
    var color = [0,0,1, 1,0,0, 0,1,0, 1,0,1,1,0,1,1,0,1];
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
  
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
    var scaleLocation = gl.getUniformLocation(program, "u_scale");

    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);
    
    drawScene();
    var colors = [
        [ 0.0, 0.0, 0.0, 1.0],  // black
        [ 1.0, 0.0, 0.0, 1.0],  // red
        [ 1.0, 1.0, 0.0, 1.0],  // yellow
        [ 0.0, 1.0, 0.0, 1.0],  // green
        [ 0.0, 0.0, 1.0, 1.0],  // blue
        [ 1.0, 0.0, 1.0, 1.0],  // magenta
        [ 0.0, 1.0, 1.0, 1.0]  // cyan
    ];
    var m = document.getElementById("mymenu");
    m.addEventListener("click", function() {
       color = colors[m.selectedIndex]
    });
    var a = document.getElementById("Button1")
    a.addEventListener("click", function(){
    drawScene();
    });

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
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    
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
    
        // get the attribute location
        var vertColor = gl.getAttribLocation(program, "vertColor");
 
        // point attribute to the volor buffer object
        gl.vertexAttribPointer(vertColor, 3, gl.FLOAT, false,0,0) ;

        gl.enableVertexAttribArray(vertColor);
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
            50, 0,
            0, 150,
            0, 150,
            50, 0,
            50, 150
        ]),
        gl.STATIC_DRAW);
  }
  
  main();