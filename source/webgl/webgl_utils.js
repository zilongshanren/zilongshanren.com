function createGLContext(canvasId)
{
  var canvas = document.getElementById(canvasId);
  var names = ["webgl",
               "experimental-webgl",
               "webkit-3d",
               "moz-webgl"];

  var gl;
  for (var i = 0; i < names.length; ++i)
  {
    try
    {
      gl = canvas.getContext(names[i]);
    }
    catch(e)
    {
      throw("contex can't be created!");
    }
    if (gl) break;
  }

  if (gl == null){
    alert("WebGL is not available");
  }
  return gl;
}

function createShader(gl, str, type){
  var shader = gl.createShader(type);
  gl.shaderSource(shader,str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}

function createProgram(gl, vstr,fstr){
  var program = gl.createProgram();
  var vshader = createShader(gl,vstr,gl.VERTEX_SHADER);
  var fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER);
  gl.attachShader(program,vshader);
  gl.attachShader(program,fshader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  return program;
}

function createProgramFromElementId(gl, vertexId, fragmentId)
{
  var vertex = document.getElementById(vertexId);
  var fragment = document.getElementById(fragmentId);

  return createProgram(gl,vertex.text, fragment.text);
}


function setupRectangle(gl, x, y , width, height){
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1,y1,
    x2,y1,
    x1,y2,
    x1,y2,
    x2,y2,
    x2,y1
  ]), gl.STATIC_DRAW);
}

function randomInt(range){
  return Math.floor(Math.random() * range);
}
