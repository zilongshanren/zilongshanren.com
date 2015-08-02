---
author: 0owen
comments: true
date: 2014-06-22 01:52:41+00:00
layout: post
slug: opengl-es2-0-use-vbo
title: OpenGL ES2.0教程:使用VBO索引(4)
wordpress_id: 331
categories:
- Cocos2d-x
- OpenGL ES
tags:
- Cocos2d-x
- opengl
---

* table of contents
<!-- toc -->

在[上一篇文章](http://4gamers.cn/blog/2014/06/15/opengl-es2-meet-mvp/)中，我们介绍了uniform和模型-视图-投影变换，相信大家对于OpenGL ES 2.0应该有一点感觉了。在这篇文章中，我们不再画三角形了，改为画四边形。下篇教程，我们就可以画立方体了，到时候就是真3D了，哈哈。

为什么三角形在OpenGL教程里面这么受欢迎呢？因为在OpenGL的世界里面，所有的几何体都可以用三角形组合出来。我们的四边形也一样，它可以用两个三角形组合出来。

<!-- more -->

## 你的第一个四边形

首先，因为OpenGL里面没有直接绘制四边形的命令的，所以我们需要画两个三角形来拼成一个四边形。这样的话，这样的话我们一共需要6个顶点。这6个顶点的坐标如下所示:

```cpp
    float vertercies[] =
        { -1,-1,
        1, -1,
        -1, 1,
        -1, 1,
        1,1,
        1, -1};
```

此时，我们还需要修改glDrawArray和CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES宏，如下所示：

```cpp
 //注意3个顶点，变成了6个顶点，这里一定要改成6，否则OpenGL只会画3个顶点
    glDrawArrays(GL_TRIANGLES, 0, 6); 
    glBindVertexArray(0);
//这里的6是可选的，改成6可以更好地与cocos2d-x引擎融合
    CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES(1, 6);  

```

此时，运行程序，你会发现只有一个三角形。那是因为我们的顶点属性color只有3份，现在6个顶点了，所以也需要6份颜色数据。另外，为了显示好看，这里把6个颜色统一修改成绿色：

```cpp
    float color[] = { 0, 1,0, 1,
                        0,1,0, 1,
                        0, 1, 0, 1,
                        0, 1,0, 1,
                        0,1,0, 1,
                        0,1, 0, 1};
```

同时，记得把上一篇教程中设置的uniform u_color也重置一下：

```cpp
    float uColor[] = {1.0, 1.0, 1.0, 1.0};
    glUniform4fv(uColorLocation,1, uColor);
```

此时，编译并运行，你会得到一个纯绿色的四边形：
![greenrectangle](http://guanghuiqu.qiniudn.com/greenrectangle.png)

怎么样，画4边形不过如此吧，只需要多准备点数据就行啦。另外，注意一下三角形的顶点顺序。不过，细心的读者立马就会发现，我们的顶点数据里面有两个顶点是重复的。这其实是一种内存浪费。假设我们现在渲染一个复杂的模型，它可能包含几千个三角形，如果采用这种方式，那不知道要浪费多少内存。接下来，我们要介绍一种方法，使用索引数组来重用顶点数据。

## 使用VBO索引

推荐大家先看看[VBO索引原理](http://opengl.zilongshanren.com/opengl-tutorial/tut09/zh.html)，相信大家看完之后应该知道怎么实现了。
1. 修改原始顶点数据
把vertercies修改为下面的样子:

```cpp
 float vertercies[] =
        { -1,-1,
        1, -1,
        -1, 1,
        1,1};
```
从上面的顶点数据可以看出，这4个点刚好就是normalized device space的四个边界的顶点。

  1. 指定2个三角形的索引
我们需要为两个三角形指定索引数据，如下所示：

```cpp
GLubyte indices[] = { 0,1,2,  //第一个三角形索引
                    2,3,1}; //第二个三角形索引
```

  2. 创建索引缓冲区并绑定索引数据到缓冲区
  
```cpp
GLuint indexVBO;
glGenBuffers(1, &indexVBO);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexVBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices) , indices, GL_STATIC_DRAW);
```
这里索引缓冲区与之前的GL_ARRAY_BUFFER的创建与使用方式是一样的。

  3. 最后，我们把glDrawArray替换成[glDrawElements](https://www.khronos.org/opengles/sdk/docs/man/xhtml/glDrawElements.xml)
  
```cpp
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_BYTE,(GLvoid*)0);
```

  * 第一个参数：指定绘制基本图元的类型，这里我们指定的是三角形

  * 第二个参数：需要绘制的元素个数，即索引的数量，我们一共是6个索引

  * 第三个参数：指定索引数据的类型，注意必须是 GL_UNSIGNED_BYTE和GL_UNSIGNED_SHORT中的一个。推荐用GL_UNSIGNED_BYTE。

  * 第四4个参数：指定开始绘制的第一个索引数据在缓冲区的偏移。

此时，编译并运行，我们还是得到了和之前一样的四边形。

## 改进顶点数据结构

现在顶点属性包含位置(position)和颜色(color)，将来还会有法线（normal），纹理坐标（texture coordinate）等数据。如果每一种类型的顶点数据都分开来存放，一来不利于管理，二来也会产生内存碎片。

在本小节中，我将向大家介绍如何使用一个结构体来封装这些数据。这也是cocos2d-x里面所用的方法，比如一个Quard的定义如下：

```cpp
struct V3F_C4B_T2F
{
    //! vertices (3F)
    Vec3     vertices;            // 12 bytes
    //! colors (4B)
    Color4B      colors;              // 4 bytes
    // tex coords (2F)
    Tex2F        texCoords;           // 8 bytes
};
```

仿照上面的结构体，我们也定义一个结构体Vertex，用来表示顶点的数据，目前它里面包含位置和颜色:

```cpp
    typedef struct {
        float Position[2];
        float Color[4];
    } Vertex;
```

下面是我们的顶点数据定义：

```cpp
 Vertex data[] =
    {
        { {-1,-1},{0,1,0,1} },
        { {1,-1},{0,1,0,1} },
        { {-1,1},{0,1,0,1} },
        { {1,1},{0,1,0,1} }
    };
```

注意，我们画四边形需要4个顶点，所以，需要四份Vertex数据。接下来，我们指定Vertex Shader如何读取这些属性:

```cpp
 glVertexAttribPointer(positionLocation,
                          2,
                          GL_FLOAT,
                          GL_FALSE,
                          sizeof(Vertex),
                          (GLvoid* )offsetof(Vertex,Position));
    //set for color
//    glGenBuffers(1, &colorVBO);
//    glBindBuffer(GL_ARRAY_BUFFER, colorVBO);
//    glBufferData(GL_ARRAY_BUFFER, sizeof(data), data, GL_STATIC_DRAW);
    GLuint colorLocation = glGetAttribLocation(program->getProgram(), "a_color");
    glEnableVertexAttribArray(colorLocation);
    glVertexAttribPointer(colorLocation,
                          4,
                          GL_FLOAT,
                          GL_FALSE,
                          sizeof(Vertex),
                          (GLvoid* )offsetof(Vertex,Color));
```

这里，我们需要指定[glVertexAttribPointer](https://www.khronos.org/opengles/sdk/docs/man/xhtml/glVertexAttribPointer.xml)的第5个参数和第6个参数。

下图告诉我们Vertex Shader是如何读取属性的：
![multiplevertexattri](http://guanghuiqu.qiniudn.com/multiplevertexattribute.png)

注意，我们这里把colorVBO的生成和绑定代码注释掉了，因为已经不需要了。
编译并运行，这时候你还是会看到一个绿色的四边形。

## 结语

从本例中可以看到，VBO可以一次性传递所有的顶点数据给vertex shader（目前是position和color，以后还有法线和纹理坐标），然后使用glVertexAttribPointer按一定的规则去取数据就行了。至于几何图元如何组装，可以交给索引VBO去解决，最后调用glDrawElements来完成实际的绘制。

另外如果我们只想画纯色的四边形，那么建议不要使用attribute，直接使用uniform并把该uniform的值传给gl_FragColor就行了。这个就留给读者自行去实验啦。

本教程源码[下载地址](http://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/tree/lesson4)

## 推荐阅读

  * [顶点属性](http://www.arcsynthesis.org/gltut/Basics/Tut02%20Vertex%20Attributes.html)

  * [使用VBO索引](http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-9-vbo-indexing/)

