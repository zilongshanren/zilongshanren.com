---
author: 0owen
comments: true
date: 2014-06-07 07:15:14+00:00
layout: post
slug: webgl-your-first-triangles
title: WebGL教程：你的第一个三角形(1)
wordpress_id: 158
categories:
- WebGL
tags:
- welgl
---

* table of contents
{:toc}

本人最近正在学习WebGL，所以想借着自己写《Cocos2D-X OpenGLES 2.0教程系列》的同时再应用到WebGL上面来。一来可以加深自己的理解，二来也可以对比两者的差别，提高学习效率。WebGL目前各大厂商都在推，就连微软也开始重视这项技术了，不得不说这是一项不小的进步。而最近我看到一篇文章，讲到[《为什么要使用WebGL来做图形学的研究》](http://www.realtimerendering.com/blog/why-use-webgl-for-graphics-research/)，深受启发。而且javascript编写OpenGL代码也非常地方便和简洁。另外，js在编写3D程序方面，它的性能是可以和C媲美的。

话不多说，让我们开始吧。

Note: 建议使用Chrome和最新版本的Firefox, Safari来实践此教程。具体有哪些现代浏览器支持WebGL，请查看[此网页](http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation#Safari)

**声明：由于我是边学边写教程，如果读者有发现错误或者不正确的地方，欢迎批评指正。**

<!-- more -->

## 创建OpenGL画布

首先，新建一个html文件并加入以下代码：

```cpp
<html>
    <canvas id ='c' width='480' height='320'</canvas>
    <script>
        var canvas = document.getElementById('c');
        var names = ["webgl",
                  "experimental-webgl",
                  "webkit-3d", 
                  "moz-webgl"];
      for (var i = 0; i < names.length; ++i) {
          try {
              gl = canvas.getContext(names[i]);
          } 
          catch(e) {}
          if (gl) break;
      }
      if (gl == null){
         alert("WebGL is not available");
      }
gl.clearColor(0,0,0.8,1);
gl.clear(gl.COLOR_BUFFER_BIT);
    </script>
  </html>
```

使用浏览器运行，你将得到下列结果：（注意下图是WebGL绘制出来的哦，因为你右键是看不到“保存图片”的选项的，以后再也不用费事去截图了！）

<iframe class="webgl_example" width="500" height="400" src="/webgl/ex01.html"></iframe>

## 创建VBO并且准备顶点数据

```javascript
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
var vertices = [-0.5, -0.5, 0.5, -0.5, 0, 0.5];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
```

可以看出，这些函数跟OpenGLES很类似。只是glGenBuffer被重合名为createBuffer了。然后所有OpenGL的函数都位于webgl context对象之中了。

## 编写Vertex Shader和Fragment Shader

```javascript
//setup for the vertex shader and fragment shader
var vs = 'attribute vec2 pos;' +
'void main(){ gl_Position = vec4(pos,0,1);}';
var fs = 'precision mediump float;' +
'void main(){ gl_FragColor = vec4(0,0.8,0,1);}';
```

这里我们把vertex shader和fragment shader写到两个字符串vs和fs中。因为比较简单，所以才这样做。如果shader很复杂，建议把shader文件单独放置在对应的文件中。

## 编写Shader Program

接下来，我们需要编译，链接并最终生成我们的shader program，具体代码如下：

```javascript
function createShader(str, type){
  var shader = gl.createShader(type);
  gl.shaderSource(shader,str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}
function createProgram(vstr,fstr){
  var program = gl.createProgram();
  var vshader = createShader(vstr,gl.VERTEX_SHADER);
  var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
  gl.attachShader(program,vshader);
  gl.attachShader(program,fshader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  return program;
}
//创建shader program
var program = createProgram(vs,fs);
gl.useProgram(program);
```

## 发送顶点数据给Vertex Shader

首先，我们要获取Vertex attribute的location。接着，激活该attribute，最后调用vertexAttribPointer来传递顶点数据。

```javascript
program.vertexPosAttrib = gl.getAttribLocation(program,'pos');
gl.enableVertexAttribArray(program.vertexPosAttrib);
gl.vertexAttribPointer(program.vertexPosAttrib, 2, gl.FLOAT, false, 0, 0);
```

## 绘制三角形

最后，我们调用drawArrays来绘制三角形。

```javascript
gl.drawArrays(gl.TRIANGLES,0,3); 
```

## 最终运行结果：

<iframe class="webgl_example" width="600" height="400" src="/webgl/ex02.html"></iframe>


## 结语

可以看到，一个完整的WebGL绘制三角形的代码与一个OpenGLES 2.0的代码非常类似，但是写起来却非常爽。更重要的是，我们可以用浏览器来实时调试看效果。省去了c++等静态语言的编译链接时间。

本文源码仓库地址：[https://git.oschina.net/zilongshanren/Learning-WebGL](https://git.oschina.net/zilongshanren/Learning-WebGL)

## 推荐阅读

  * [http://learningwebgl.com/blog/?p=28](http://learningwebgl.com/blog/?p=28)

  * [http://games.greggman.com/game/webgl-fundamentals/](http://games.greggman.com/game/webgl-fundamentals/)

