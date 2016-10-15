---
author: 0owen
comments: true
date: 2014-07-01 14:20:54+00:00
layout: post
slug: 'opengl es2.0 tutorials your first cube'
title: OpenGL ES2.0教程：你的第一个立方体(5)
wordpress_id: 429
categories:
- Cocos2d-x
- OpenGL ES
tags:
- Cocos2d-x
- opengl
---

 
<!-- toc -->
在[上篇文章](http://zilongshanren.com/blog/2014/06/22/opengl-es2-use-vbo/)中，我们介绍了VBO索引的使用，使用VBO索引可以有效地减少顶点个数,优化内存，提高程序效率。

本教程将带领大家一起走进3D--绘制一个立方体。其实画立方体本质上和画三角形没什么区别，所有的模型最终都要转换为三角形。

同时，本文还会介绍如何通过修改MVP矩阵来让此立方体不停地旋转。另外，大家还可以动手去修改本教程的示例代码，借此我们可以更加深入地理解OpenGL的normalized device space。

<!-- more -->

## 准备立方体数据

在开始真正的绘制代码之前，我们先要准备好数据。首先，我们需要改进的是代表顶点属性的结构体：

```cpp
 typedef struct {
        float Position[3];
        float Color[4];
} Vertex;
```
这里，我们把Position从一个长度为2的数组变成了一个长度为3的数组，用于存储顶点的xyz的值。

接下来是顶点数据，因为一共有6个面。每个面由二个三角形组成，因此需要4个顶点，那么整个立方体就需要4*6=24个顶点。

```cpp
 Vertex data[] =
    {
        // Front
        { {1, -1, 0}, {1, 0, 0, 1}},
        { {1, 1, 0}, {0, 1, 0, 1}},
        { {-1, 1, 0}, {0, 0, 1, 1}},
        { {-1, -1, 0}, {0, 0, 0, 1}},
        // Back
        { {1, 1, -2}, {1, 0, 0, 1}},
        { {-1, -1, -2}, {0, 1, 0, 1}},
        { {1, -1, -2}, {0, 0, 1, 1}},
        { {-1, 1, -2}, {0, 0, 0, 1}},
        // Left
        { {-1, -1, 0}, {1, 0, 0, 1}},
        { {-1, 1, 0}, {0, 1, 0, 1}},
        { {-1, 1, -2}, {0, 0, 1, 1}},
        { {-1, -1, -2}, {0, 0, 0, 1}},
        // Right
        { {1, -1, -2}, {1, 0, 0, 1}},
        { {1, 1, -2}, {0, 1, 0, 1}},
        { {1, 1, 0}, {0, 0, 1, 1}},
        { {1, -1, 0}, {0, 0, 0, 1}},
        // Top
        { {1, 1, 0}, {1, 0, 0, 1}},
        { {1, 1, -2}, {0, 1, 0, 1}},
        { {-1, 1, -2}, {0, 0, 1, 1}},
        { {-1, 1, 0}, {0, 0, 0, 1}},
        // Bottom
        { {1, -1, -2}, {1, 0, 0, 1}},
        { {1, -1, 0}, {0, 1, 0, 1}},
        { {-1, -1, 0}, {0, 0, 1, 1}},
        { {-1, -1, -2}, {0, 0, 0, 1}}
    };
```

接下来，当然是最重要的VBO索引啦：

```cpp
 GLubyte indices[] = {
        // Front
        0, 1, 2,
        2, 3, 0,
        // Back
        4, 5, 6,
        4, 5, 7,
        // Left
        8, 9, 10,
        10, 11, 8,
        // Right
        12, 13, 14,
        14, 15, 12,
        // Top
        16, 17, 18,
        18, 19, 16,
        // Bottom
        20, 21, 22,
        22, 23, 20
    }; 
```

最后，由于我们修改了顶点属性，所以我们要相应地修改vertex shader和glVertexAttribPointer的调用:

```cpp
    glVertexAttribPointer(positionLocation,
                          3,
                          GL_FLOAT,
                          GL_FALSE,
                          sizeof(Vertex),
                          (GLvoid*)offsetof(Vertex,Position));

//下面是vertex shader

attribute vec3 a_position;  //注意之前我们使用的是vec2
attribute vec4 a_color;

varying vec4 v_fragmentColor;

void main()
{
    gl_Position = CC_MVPMatrix * vec4(a_position.xyz,1);  //这里用swizzle的时候是xyz
    v_fragmentColor = a_color;
}
```

此时，编译运行，你会得到如下结果 ：

![cube01](https://zilongshanren.com/img/cube01.png)

别诧异，这就是一个立方体，只不过现在它离我们的“眼睛”(Cemera)很近，所以我们只能看到一个面。接下来，让我们修改一个modelView矩阵，让它离我们的camera远一点。

## 让立方体动起来

我们有很多方法可以让立方体转起来。比如直接修改modelView矩阵，也可以使用modelView配合projection矩阵。

首先，是最简单的方法，我们把整个立方体数据先缩小一半，然后再往-z轴方向移动0.5个单位，最后让它围绕着x轴不停地旋转。

```cpp
modelViewMatrix.scale(0.5);
modelViewMatrix.translate(0.0,0, -0.5);

static float rotation = 0;
modelViewMatrix.rotate(Vec3(1,0,0),CC_DEGREES_TO_RADIANS(rotation));
rotation++;
if (rotation < 360) {
    rotation = 0;
}

Director::getInstance()->multiplyMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW, modelViewMatrix);
```

注意，这里我们操纵顶点的取值范围只能是-1~+1，xyz每一个轴都是这样。超出这个区域（normalized device space）就会裁剪掉。但是我们实际操作一个物体的移动的时，肯定不可能局限于这么小的范围，我们可以通过modelView和projection矩阵来定义一个更好用的坐标系，然后基于这个坐标系去指定物体的坐标。
比如cocos2d-x里面，通过下列代码指定了自己的坐标系范围在(0~size.width)和(0~size.height)之间。

```cpp
case Projection::_3D:
{
    float zeye = this->getZEye();
    Mat4 matrixPerspective, matrixLookup;
    loadIdentityMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION);
    // issue #1334
    Mat4::createPerspective(60, (GLfloat)size.width/size.height, 10, zeye+size.height/2, &matrixPerspective);
    multiplyMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION, matrixPerspective);
    Vec3 eye(size.width/2, size.height/2, zeye), center(size.width/2, size.height/2, 0.0f), up(0.0f, 1.0f, 0.0f);
    Mat4::createLookAt(eye, center, up, &matrixLookup);
    multiplyMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION, matrixLookup);
    loadIdentityMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW);
    break;
}
```

这里面，我们可以直接拿来用，也可以自己再写一个。下面是我用的代码：

```cpp
Mat4 projectionMatrix;
Mat4::createPerspective(60, 480/320, 1.0, 42, &projectionMatrix);
Director::getInstance()->multiplyMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION, projectionMatrix);

Mat4 modelViewMatrix;
Mat4::createLookAt(Vec3(0,0,1), Vec3(0,0,0), Vec3(0,1,0), &modelViewMatrix);
modelViewMatrix.translate(0, 0, -5);

static float rotation = 0;
modelViewMatrix.rotate(Vec3(1,1,1),CC_DEGREES_TO_RADIANS(rotation));
rotation++;
if (rotation < 360) {
    rotation = 0;
}
Director::getInstance()->multiplyMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW, modelViewMatrix);
```

这里我让camera的位置位于（0，0，1）,然后看着(0,0,0)点，并且头朝上（0,1,0）。大家可以尝试去修改createLookAt的参数，看看每一个参数具体是什么意思。[这里有一个非常不错的程序介绍View Frustum的，强烈推荐！](http://user.xmission.com/~nate/tutors.html)

最终效果：（如果你看不到，请升级你的浏览器！！！）

<iframe  width="800" height="400" src="/webgl/ex05.html"></iframe>

## 结语

附上[本教程源码](http://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/tree/lesson05)，从下篇文章开始，我们将介绍纹理映射。

## 推荐阅读

  * [Iphone OpenGL ES 2.0开发指引](http://www.cnblogs.com/zilongshanren/archive/2011/08/08/2131019.html)

