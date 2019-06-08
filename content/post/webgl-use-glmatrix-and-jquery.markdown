---
comments: true
date: 2014-06-28 15:05:45+00:00 +08:00
slug: webgl-use-glmatrix-and-jquery
title: WebGL教程:使用glMatrix和JQuery(2)
wordpress_id: 354
categories:
- WebGL
tags:
- glMatrix.js
- jquery
- welgl
---

 
<!-- toc -->
[上篇文章](http://zilongshanren.com/blog/2014-06-07-webgl-your-first-triangles.html)介绍了如何使用WebGL来绘制一个三角形。从那个教程中，我们可以看出，其实WebGL只是一个[2D API](http://games.greggman.com/game/webgl-fundamentals/),我们只需要在Vertex Shader里面指定绘制图元的裁剪坐标系的坐标(取值范围从-1到+1)，同时在Fragment Shader里面指定顶点最终的像素颜色即可。如果要实现3D效果，必须由程序员自己来指定3D空间坐标变换，即Model-View-Projection变换。

而WebGL本身是不提供数学库来做这些事情的，所以我们需要借助一些第三方的库（当然，也可以自己编写，但是效率可能会有问题,除非是学习，否则建议不要自己写）。现在Js的数学库比较多，而本教程主要介绍如何使用[glMatrix.js](https://github.com/toji/gl-matrix)来做MVP变换，在文章的最后，我们通过集成Jquery可以让3D场景更具有交互性。（当然，本教程只是通过往场景里面添加一个slider来改变三角形的颜色）

<!-- more -->

在继续阅读教程之前，可以先看看本教程最终的样子：(别忘了拖动两下滑块哦）


<iframe class="webgl_example" width="800" height="400" src="/webgl/ex04.html"></iframe>




## 下载和安装glMatrix.js

下载glMatrix很简单，直接去[glMatrix.js首页](http://glmatrix.net/)上下载最新版本即可，当然也可以去[github](https://github.com/toji/gl-matrix)上面下载。当前的最新发布版本是v2.2.1，它与之前的API相比有一些不同。具体的内容在glMatrix.js首页上面都有介绍，这里就不赘述了。当然，这也导致了我们如果去看网上[其它一些教程](http://learningwebgl.com/blog/?page_id=1217)的时候，可能使用的是老版本的glMatrix.js。大家注意对照[最新版本的API文档](http://glmatrix.net/docs/2.2.0/)来进行编程即可。
因为是js库，所以安装过程基本为0。只需要把解压缩里面的dist目录下面的gl-matrix-min.js拷贝到我们的工程目录下面，并在html文件里面引入即可:

## 编写一些重用的功能

因为每一个WebGL程序都需要以下二个步骤：

  * 从canvas获取WebGL上下文

  * 创建vertex shader和fragment shader并链接成一个shader program

所以这里，我们把这些操作封装成函数并放到webgl_utils.js里面:

首先是从canvas里面获取WebGL上下文:

```cpp
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
```

然后，是创建shader program的函数：

```cpp
//根据shdaer的str和type来创建vertex shader和fragment shader
function createShader(gl, str, type){
  var shader = gl.createShader(type);
  gl.shaderSource(shader,str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}
//使用vertex shader和fragment shader来创建shader program
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
```

有了这两个函数，我们每一次编写一个WebGL的程序的时候就不用重复造轮子了。另外，由于之前的vertex shader和fragment shader都是直接硬编码为字符串的，这样书写极为不便，同时也很难维护。

## 定义自己的script标签

本节我们将使用自定义的标签来放置vertex shader和fragment shader.

因为html5的标准规定，如果script标签里面的type不是text/javascript或者src="..."之类的话，浏览器会把这段script标签里面的内容解析成文本。

因此，我们自定义两种type分别用来存放vertex shader和fragment shader：

```cpp
      //下面是vertex shader的定义
      <script type="x-shader/x-vertex" id="vertex-shader">
      attribute vec2 a_position;
      uniform mat4 u_ModelViewMatrix;
      uniform mat4 u_PMatrix;
      void main()
      {
        gl_Position = u_PMatrix * u_ModelViewMatrix * vec4(a_position,0.0,1.0);
      }
    </script>
```

```cpp
    //下面是fragment shader的定义
    <script type="x-shader/x-fragment" id="fragment-shader">
      //this line must be added
      precision mediump float;
      uniform vec4 u_color;
      void main()
      {
       gl_FragColor =  u_color;
      }
    </script>
```

最后，为了方便使用，我还封装了下面的函数用来从script id来创建shader program.

```cpp
function createProgramFromElementId(gl, vertexId, fragmentId)
{
  var vertex = document.getElementById(vertexId);
  var fragment = document.getElementById(fragmentId);

return createProgram(gl,vertex.text, fragment.text);
}
```

## Model View Projection变换

在讨论Model View Projection变换之前，我们先指定Model坐标吧。这次为了简单起见，我们还是绘制一个三角形，只是这三角形的坐标不再是设备坐标系空间（normalized device space）的坐标了，如下所示：

```cpp
 function initBuffers(gl)
 {
     var vertexBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 480,0, 240,320]), gl.STATIC_DRAW);
 }
```
我们的canvas大小是480*320,这是一个横版iPhone4S的大小。我们这里定义的三角形坐标正好是canvas的左下角，右下角和中间最顶端的点。这个坐标我们暂且把它称之为模型坐标。而这三个点最终在normalized device space的坐标系应该是(-1,-1),(1,-1)和(0,1)。我们可以经过Model-to-View和View-to-Projection变换把(0,0),(480,0)和(240,320)这三个点变换为(-1,-1),(1,-1)和(0,1)。

首先，介绍的是Model-to-View变换。在介绍这个变换之前，让我们先粗略地讲一下OpenGL的照相机原理。它其实就是模拟人的眼睛看周围世界的方式。而Model-to-View变换就是把模型空间变换成Camera空间。就好比，现在你的身后有个人，你想要看到他，你必须转过身去，或者他跑到你面前来。不管是哪种方式，都需要应用ModelView变换。

在OpenGL里面是使用glLookAt这个函数来进行ModelView变换的。

```cpp
 var mvMatrix = mat4.create();
var zEye = 320 / 1.1566;
mat4.lookAt(mvMatrix, [240,160,zEye],[240,160,0],[0,1,0]);
```

这里的代码与cocos2d-x当中的ModelView变换是一模一样的（我表示拿来主义哈）。mat4.lookAt的第一个参数是一个out型参数，后面三个参数的意义分别是eye,center和up,即眼睛所在的位置，眼睛注意的物体的中心点位置和头的方向。这个解释不是很精确，强烈建议大家[阅读10遍这篇文章](http://blog.db-in.com/cameras-on-opengl-es-2-x/).

模型视图变换完以后，此时的坐标已经在camera范围内了，但是最终opengl需要的是normalized device space坐标系的坐标，那个坐标系的取值范围是-1到+1.因此我们需要做一次View-to-Projection变换来把视图坐标系变换到normalized device space坐标系。

```cpp
var fov = 60 * 3.1415926 / 180;
mat4.perspective(pMatrix, fov , 480/320, 10, zEye + 160);
```
这段代码也没啥好解释的，建议[看看这个](https://user.xmission.com/~nate/tutors.html)就明白了.记得要下载可执行程序跑起来看看哦。

最后就是把这两个matrix通过uniform的形式传给vertex shader啦:

```cpp
mvMatrixLocation = gl.getUniformLocation(program,"u_ModelViewMatrix");
pMatrixLocation = gl.getUniformLocation(program, "u_PMatrix");

gl.uniformMatrix4fv(pMatrixLocation, false, pMatrix);
gl.uniformMatrix4fv(mvMatrixLocation, false, mvMatrix);
```

## 集成Jquery

接下来，我们往场景里面添加一个slider，用来控制三角形的红色通道的颜色值。

```cpp
 <div>
拖动这个滑块: <div id="slider" ></div>
</div>

$("#slider").slider({
          orientation: "horizontal",
          max: 1,
          min: 0,
          step:0.1,
          value: 0.5,
          slide : function(event, ui) { 
              sliderValue =  $("#slider").slider("value");
              drawScene(gl);
          } 
      });
```

在拖动滑块的时候，我们调用了drawScene来重绘整个OpenGL场景 。

## 结语

最后，附上本教程的[源码](http://git.oschina.net/zilongshanren/Learning-WebGL/blob/master/ex04.html)
