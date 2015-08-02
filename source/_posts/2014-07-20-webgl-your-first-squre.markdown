---
author: 0owen
comments: true
date: 2014-07-20 13:08:59+00:00
layout: post
slug: webGL your first cube'
title: WebGL教程:你的第一个立方体(3)
wordpress_id: 465
categories:
- WebGL
series:
- WebGL教程
tags:
- welgl
---

* table of contents
{:toc}
在[上一篇文章](http://4gamers.cn/blog/2014/06/28/webgl-use-glmatrix-and-jquery/)中，我们介绍了如何使用glMatrix.js来处理3D图形里面的数学运算，主要谈到了MVP的应用。同时，我们还简单地提到了如何使用JQuery来丰富我们的WebGL应用。

本文将介绍如何使用WebGL来制作一个旋转的立方体。在这篇教程里面，我们会提到以下内容：

  * VBO(Vertex Buffer Object)和IBO（Index Buffer Object）

  * 如何绘制3D立方体

<!-- more -->

## VBO和IBO

VBO就是我们常说的“顶点缓冲区对象”，这个在之前的三角形教程中已经介绍过了。而IBO则是索引缓冲区对象，全称是Index Buffer Object。它主要用来保存顶点的索引数据。

如果我们不使用IBO，而直接使用VBO的话，那么要绘制一个立方体，一共需要6*6=36个顶点。而使用IBO的话，每一个面只需要4个顶点即可，因为两个相邻的三角形是共用两个顶点的。任何复杂的几何模型都可以通过指定顶点和顶点索引定义出来。

首先，让我们看一下立方体的顶点数据定义，这里我们使用的是javascript数组：

```cpp
var vertecies = 
 //front
[1,-1,0,
 1,1,0,
 -1,1,0,
 -1,-1,0,
 //back
 1,1,-2,
 -1,-1,-2,
 1,-1,-2,
 -1,1,-2,
 //left
 -1,-1,0,
 -1,1,0,
 -1,1,-2,
 -1,-1,-2,
 //right
 1,-1,-2,
 1,1,-2,
 1,1,0,
 1,-1,0,
 //top
 1,1,0,
 1,1,-2,
 -1,1,-2,
 -1,1,0,
 //botto
 1,-1,-2,
 1,-1,0,
 -1,-1,0,
 -1,-1,-2];
```

每一个顶点有x,y,z三个坐标，每一个面由两个三角形组成，所以需要6个顶点。不过我们可以这里使用的是IBO来共用顶点，所以每个面只需要4个顶点即可。下面是IBO的定义：

```cpp
var index = [0,1,2,//front
         2,3,0,
         //back
         4,5,6,
         4,5,7,
         //left
         8,9,10,
         10,11,8,
         //right
         12,13,14,
         14,15,12,
         //top
         16,17,18,
         18,19,16,
         //bottom
         20,21,22,
         22,23,20
        ];
```

## 绑定VBO和IBO并传递数据

首先，当然是创建VBO和IBO了：

```cpp
//创建并绑定IBO
indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
//创建并绑定VBO
vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);  

```

接来是往这两个buffer里面填充数据，WebGL是不能直接把Js的数组传递给GPU的，必须把它们转换成WebGL规定的类型，比如Float32Array和Uint16Array。
具体的代码如下所示：

```cpp
//传递顶点数据给VBO
var vertexData = new Float32Array(vertecies);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
//传递顶点索引数据给IBO
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);
```

## vertex shader

指定vertex shader如何读取VBO和IBO里面的数据。
这次我们使用gl.vertexAttribPointer函数时需要注意，最后一个参数是读取数据时的起始偏移量。

```cpp
   var positionLocation = gl.getAttribLocation(program, "a_position");
   gl.enableVertexAttribArray(positionLocation);
   gl.vertexAttribPointer(positionLocation,3, gl.FLOAT, false,0,0);
```

## 绘制立方体

要绘制立方体，只需要调用gl.drawElements这个函数即可：

```cpp
gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0
```
注意这个函数的第1个参数是指绘制几何图元的类型，第2个参数是指索引的个数，第3个参数一定要是gl.UNSIGNED_SHORT或者gl.UNSIGNED_BYTE中的一个，最后一个参数是指索引数据的读取起始偏移量。

这样子绘制出来的立方体它是没有颜色的，如果我们需要每一个顶点指定颜色，则还需要创建一个VBO，然后绑定这个VBO，再通过vertex shader把这个颜色数据传递过去。

## 传递颜色数据

如果按照传递的c/c++程序的做法，我们一般会定义一个顶点属性的结构体：

```cpp
typedef
{
    float position[3];
    float color[4];
}Vertex;
```
但是，js里面是不能这些定义的。我们可以直接把顶点和颜色放置在一个数组里面就行了:

```cpp
  var vertecies = [1,-1,0,1,0,0,1,
                   1,1,0,0,1,0,1,
                   -1,1,0,0,0,1,1,
                   -1,-1,0,0,0,0,1,
                   //back
                   1,1,-2,1,0,0,1,
                   -1,-1,-2,0,1,0,1,
                   1,-1,-2,0,0,1,1,
                   -1,1,-2,0,0,0,1,
                   //left
                   -1,-1,0,1,0,0,1,
                   -1,1,0,0,1,0,1,
                   -1,1,-2,0,0,1,1,
                   -1,-1,-2,0,0,0,1,
                   //right
                   1,-1,-2,1,0,0,1,
                   1,1,-2,0,1,0,1,
                   1,1,0,0,0,1,1,
                   1,-1,0,0,0,0,1,
                   //top
                   1,1,0,1,0,0,1,
                   1,1,-2,0,1,0,1,
                   -1,1,-2,0,0,1,1,
                   -1,1,0,0,0,0,1,
                   //bottom
                   1,-1,-2,1,0,0,1,
                   1,-1,0,0,1,0,1,
                   -1,-1,0,0,0,1,1,
                   -1,-1,-2,0,0,0,1
                   ];
```

此时，如果使用gl.vertexAttribPointer时，strid的计算如下：

```cpp
    var step = Float32Array.BYTES_PER_ELEMENT;
    stride = step * (vertex component Count + color component count);
```

比如，本例中，每一个顶点属性是7个数（3个顶点+4个颜色位）：

```cpp
   gl.vertexAttribPointer(positionLocation,3, gl.FLOAT, false, 7 * step ,0);
   var colorLocation = gl.getAttribLocation(program,"a_color");
   gl.enableVertexAttribArray(colorLocation);
   gl.vertexAttribPointer(colorLocation,4,gl.FLOAT,false, 7 * step ,3 * step);

```

## Animation Loop

使用requestAnimationFrame制作Animation Loop,避免使用setTimeOut方法。

```cpp
fpsInterval = 1000/60;
then = Date.now();
startTime = then;
(function animloop(time){
  now = Date.now();
  elapsed = now - then;
  if(elapsed > fpsInterval){
    drawScene(time);
  }
  requestAnimationFrame(animloop);
})();
```

## 程序运行结果:


<iframe  width="800" height="400" src="/webgl/ex05.html"></iframe>

本文源代码：[传送门](http://git.oschina.net/zilongshanren/Learning-WebGL/blob/master/ex05.html)

## 结语

这里的顶点数据我们除了使用Javascript数组来存取外，还可以使用json格式的数据。由于json可以给不同的数据命名，比如一个立方体的数据可以描述为以下json文件：

```cpp
{
    "vertex" : {xxx},
    "color" : {xxx},
    "texCoord" : {xxx},
    "normal" : {xxx},
    ...
```
另外，json文件还可以使用AJAX来加载，这样我们就可以把需要绘制的顶点数据存在服务器上，需要的时候发一个AJAX请求即可。该方法特别适合于复杂模型的加载。
