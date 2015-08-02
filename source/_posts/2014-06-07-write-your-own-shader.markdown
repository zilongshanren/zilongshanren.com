---
author: 0owen
comments: true
date: 2014-06-07 03:41:09+00:00
layout: post
slug: opengl-es20-write-your-own-shader
title: OpenGL ES2.0教程：编写自己的shader(2)
wordpress_id: 131
categories:
- Cocos2d-x
- OpenGL ES
series:
- Cocos2D-X OpenGL ES 2.0教程
tags:
- Cocos2d-x
- opengl
---

 
<!-- toc -->

在[上篇文章](http://4gamers.cn/blog/2014/05/31/opengl-es-2-0-your-first-traingles/)中，我给大家介绍了如何在cocos2d-x里面绘制一个三角形，当时我们使用的是cocos2d-x引擎自带的shader和一些辅助函数。在本文中，我将演示一下如何编写自己的shader，同时，我们还会介绍VBO（顶点缓冲区对象）和VAO（顶点数组对象）的基本用法。

在编写自己的shader之前，我觉得有必要提一下OpenGL渲染管线。
理解OpenGL渲染管线，对于学习OpenGL非常重要。下面是OpenGL渲染管线的示意图：（图中淡蓝色区域是可以编程的阶段）
<!-- more -->

![pipeline](http://guanghuiqu.qiniudn.com/RenderingPipeline.png)

此图是从[wiki](http://www.opengl.org/wiki/Rendering_Pipeline_Overview)中拿过来的，OpenGL的渲染管线主要包括：

  1. 准备顶点数据（通过VBO、VAO和Vertex attribute来传递数据给OpenGL）

  2. 顶点处理（这里主要由Vertex Shader来完成，从上图中可以看出，它还包括可选的Tessellation和Geometry shader阶段）

  3. 顶点后处理（主要包括Clipping,顶点坐标归一化和viewport变换）

  4. Primitive组装(比如3点组装成一个3角形）

  5. 光栅化成一个个像素

  6. 使用Fragment shader来处理这些像素

  7. 采样处理（主要包括Scissor Test, Depth Test, Blending, Stencil Test等）

更详细的信息可以参考本网站推荐的阅读材料和Wiki。

## 编写你的第一个Vertex Shader

首先是创建一个文件，把它命名为myVertextShader.vert, 并输入下列代码：

```cpp    
    attribute vec4 a_position;
    attribute vec4 a_color;

    varying vec4 v_fragmentColor;

    void main()
    {
        gl_Position = CC_MVPMatrix * a_position;
        v_fragmentColor = a_color;
    }
``` 

OpenGL Shader Language,简称GLSL，它是一种类似于C语言的专门为GPU设计的语言，它可以放在GPU里面被并行运行。下面我们来简单解释一下这一小段代码。

首先，每一个Shader程序都有一个main函数，这一点和c语言是一样的。然后这里面有两种类型的变量，一种是attribute，另一种是varying. attribute是从外部传进来的，每一个顶点都会有这两个属性，所以它也叫做vertex attribute（顶点属性）。而varying类型的变量是在vertex shader和fragment shader之间传递数据用的。这里的变量命名规则保持跟c一样就行了，注意gl_开头的变量名是系统内置的变量，所以大家在定义自己的变量名时，请不要以gl_开头。而CC_MVPMatrix是一个mat4类型的变量，它是在cocos2d-x内部设置进来的。这一点，我们后面再谈。

vertex shader是作用于每一个顶点的，我们本例中有三个点，所以这个vertex shader会被执行三次。

## 编写你的第一个Fragment Shader

首先，新建一个myFragmentShader.frag并输入下列代码：

```cpp    
    varying vec4 v_fragmentColor;

    void main()
    {
        gl_FragColor = v_fragmentColor;
    }
``` 

fragment shader中也有一个main函数，同时我们看到这里也声明了一个与vertex shader相同的变量v_fragmentColor。前面我们讲过，这个变量是用来在vertex shader和fragment shader之间传递数据用的。所以，它们的参数类型必须完全相同。如果一个是vec3,一个是vec4，shader编译的时候是会报错的。而gl_FragColor我们知道它肯定是一个系统内置变量了，它的作用是定义最终画在屏幕上面的像素点的颜色。我们回过头去看上一篇文章中画出来的三角形，我们指定的是三个顶点的颜色，分别为Red,Green和Blue，但是最后的三角形的颜色是通过这三个点的颜色插值出来的。因为最终三角形的像素点可不只有三个，理解这一点非常重要。

最后，让我们修改一下shader progam的创建代码：

```cpp 
       //create my own program
        auto program = new GLProgram;
        program->initWithFilenames("myVertextShader.vert", "myFragmentShader.frag");
        program->link();
        //set uniform locations
        program->updateUniforms();
```        

编译并运行，此时你会得到和之前效果一样的三角形。

下图解释了我们的顶点数据是如何渲染成最终屏幕上面的像素的：

![graphics_pipline](http://guanghuiqu.qiniudn.com/graphics_pipeline.png)

## VAO和VBO初探

VBO，全名Vertex Buffer Object。它是GPU里面的一块缓冲区，当我们需要传递数据的时候，可以先向GPU申请一块内存，然后往里面填充数据。最后，再通过调用glVertexAttribPointer把数据传递给Vertex Shader。而VAO，全名为Vertex Array Object，它的作用主要是记录当前有哪些VBO，每个VBO里面绑定的是什么数据，还有每一个vertex attribute绑定的是哪一个VBO。关于VBO和VAO更详细的介绍，请参考[此文](http://blog.sina.com.cn/s/blog_4a657c5a01016f8s.html)

使用VBO和VAO的步骤都差不多，步骤如下：
1. glGenXXX
2. glBindXXX

让我们修改之前的代码：

```cpp  
       //创建和绑定vao
        glGenVertexArrays(1, &vao;);
        glBindVertexArray(vao);

        //创建和绑定vbo
        glGenBuffers(1, &vertexVBO;);
        glBindBuffer(GL_ARRAY_BUFFER, vertexVBO);

        auto size = Director::getInstance()->getVisibleSize();
        float vertercies[] = { 0,0,   //第一个点的坐标
            size.width, 0,   //第二个点的坐标
            size.width / 2, size.height};  //第三个点的坐标

        float color[] = { 0, 1,0, 1,  1,0,0, 1, 0, 0, 1, 1};

        glBufferData(GL_ARRAY_BUFFER, sizeof(vertercies), vertercies, GL_STATIC_DRAW);
        //获取vertex attribute "a_position"的入口点
        GLuint positionLocation = glGetAttribLocation(program->getProgram(), "a_position");
        //打开入a_position入口点
        glEnableVertexAttribArray(positionLocation);
        //传递顶点数据给a_position，注意最后一个参数是数组的偏移了。
        glVertexAttribPointer(positionLocation, 2, GL_FLOAT, GL_FALSE, 0, (GLvoid*)0);

        //set for color
        glGenBuffers(1, &colorVBO;);
        glBindBuffer(GL_ARRAY_BUFFER, colorVBO);
        glBufferData(GL_ARRAY_BUFFER, sizeof(color), color, GL_STATIC_DRAW);

        GLuint colorLocation = glGetAttribLocation(program->getProgram(), "a_color");
        glEnableVertexAttribArray(colorLocation);
        glVertexAttribPointer(colorLocation, 4, GL_FLOAT, GL_FALSE, 0, (GLvoid*)0);

        //for safty
        glBindVertexArray(0);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
```    

这里glBufferData把我们定义好的顶点和颜色数据传给VBO，此时，注意glVertexAttribPointer的最后一个参数，这里传递的都是(GLvoid*)0。而不像之前一样传的是vertex和color的数组地址。**这一点是使用VBO和不使用VBO时要特别注意的。**

## 顶点数据是怎么传递的

要弄明白程序里面定义的数组是怎么传递到vertex shader的，我们需要先弄清楚vertex attribute。

```cpp    
    attribute vec4 a_position;
    attribute vec4 a_color;

    varying vec4 v_fragmentColor;

    void main()
    {
        gl_Position = CC_MVPMatrix * a_position;
        v_fragmentColor = a_color;
    }
```    

每一个attribute在vertex shader里面有一个location，它是用来传递数据的入口。我们可以通过下列代码获取这个入口值:

```cpp    
        GLuint positionLocation = glGetAttribLocation(program->getProgram(), "a_position");
        glEnableVertexAttribArray(positionLocation);
```    

glGetAttribLocation是用来获得vertex attribute的入口的，在我们要传递数据之前，首先要告诉OpenGL，所以要调用glEnableVertexAttribArray。最后的数据通过glVertexAttribPointer传进来。它的第一个参数就是glGetAttribLocation返回的值。

## 重用VAO

最后，为了不让这些生成和绑定VBO和VAO的操作在每一帧都被执行，我们需要把它放在初始化函数里面。最终我们的draw函数如下：

```cpp    
     auto glProgram = getGLProgram();

        glProgram->use();

        //set uniform values, the order of the line is very important
        glProgram->setUniformsForBuiltins();

        auto size = Director::getInstance()->getWinSize();

        //use vao，因为vao记录了每一个顶点属性和缓冲区的状态，所以只需要绑定就可以使用了
        glBindVertexArray(vao);

        glDrawArrays(GL_TRIANGLES, 0, 3);

        glBindVertexArray(0);

        CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES(1, 3);
        CHECK_GL_ERROR_DEBUG();
```    

这里可以看出，VAO对于简化程序作用是很大的。

好了，编译并运行，还是原来的三角形。

![triangle](http://guanghuiqu.qiniudn.com/cocos2d-x-es-1.1.png)

下一篇文章，我们将讲一下OpenGL各种坐标系及其变换。当然，最重要的是World-to-Model变换，Model-to-View变换和View-to-Projection变换。

本文[源代码下载](https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/repository/archive?ref=tutorial02), 源代码仓库地址是：[https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0](https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0)

## 参考资料

  1. [http://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html](http://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html)

  2. [http://opengl.zilongshanren.com/opengl-tutorial/tut02/zh.html](http://opengl.zilongshanren.com/opengl-tutorial/tut02/zh.html)

  3. [http://www.opengl.org/wiki/Rendering_Pipeline_Overview](http://www.opengl.org/wiki/Rendering_Pipeline_Overview)

