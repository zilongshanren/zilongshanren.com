---
author: 0owen
comments: true
date: 2014-06-15 15:47:51+00:00
layout: post
slug: opengl-es2-meet-mvp
title: OpenGL ES2.0教程:初识MVP(3)
categories:
- Cocos2d-x
- OpenGL ES
tags:
- Cocos2d-x
- opengl
---

* table of contents
{:toc}

在[上一篇文章](http://4gamers.cn/blog/2014/06/07/write-your-own-shader/)中，我在介绍vertex shader的时候挖了一个坑：CC_MVPMatrix。它其实是一个uniform，每一个cocos2d-x预定义的shader都包含有这个uniform，
但是如果你在shader里面不使用这个变量的话，OpenGL底层会把它优化掉。

但是，CC_MVPMatrix是在什么时候设置进来的呢？我在shader里面明明没有看到它，它从哪儿来的？别急，请继续往下读。

<!-- more -->



## 初识Uniform



在回答上面几个问题之前，让我们先来介绍一下什么是uniform。简单来说，uniform是shader里面的一种变量，它是由外部程序设置进来的，它不像vertex的attribute，每个顶点都有一份数据。除非你显式地调用glUniformXXX函数来修改这个uniform的值，否则它的值恒定不变。接下来，让我们修改myFragmentShader.frag,给它添加一个新的uniform数据：

```cpp
varying vec4 v_fragmentColor;
uniform vec4 u_color;
void main()
{
    gl_FragColor = v_fragmentColor * u_color;
}
```

此时，我们需要在程序里面给这个u_color传值。它的基本做法与attribute的传值是一样的。

首先，我们需要获得这个uniform在shader里面的位置。

```cpp
    GLuint uColorLocation = glGetUniformLocation(glProgram->getProgram(), "u_color");
```

然后，我们可以通过glUniformXXX函数给这个uniform赋值：

```cpp
    float uColor[] = {1.0, 0.0, 0.0, 1.0};
    glUniform4fv(uColorLocation,1, uColor);
```

此时，我们就在c++代码和shader程序之间传递数据啦。编译并运行，我们会得到一个半红不红的三角形：

![triangle](http://guanghuiqu.qiniudn.com/triangle.jpg)



## 初识CC_MVPMatrix



CC_MVPMatrix是一个mat4类型的uniform,在shader代码被编译之前，它由cocos2d-x框架插入进来的。

```cpp
bool GLProgram::compileShader(GLuint * shader, GLenum type, const GLchar* source)
{
    //部分代码省略
    const GLchar *sources[] = {
        "uniform mat4 CC_PMatrix;\n"
        "uniform mat4 CC_MVMatrix;\n"
        "uniform mat4 CC_MVPMatrix;\n"
        "uniform vec4 CC_Time;\n"
        "uniform vec4 CC_SinTime;\n"
        "uniform vec4 CC_CosTime;\n"
        "uniform vec4 CC_Random01;\n"
        "uniform sampler2D CC_Texture0;\n"
        "uniform sampler2D CC_Texture1;\n"
        "uniform sampler2D CC_Texture2;\n"
        "uniform sampler2D CC_Texture3;\n"
        "//CC INCLUDES END\n\n",
        source,
    };
    *shader = glCreateShader(type);
    glShaderSource( *shader, sizeof(sources)/sizeof( *sources), sources, nullptr);
    glCompileShader( *shader);
    //下面的代码省略了...
}
```

从上面的代码，我们可以看到， 这里除了插入CC_MVPMatrix以外，还插入了其它一些uniform。只要你在后面的main函数里面不使用这些变量，最终shader program里面是看不到它们的。（被优化掉了）



### CC_MVPMatrix的作用



CC_MVPMatrix本质上是一个变换矩阵，用来把一个世界坐标系中的点转换到Clipping space。当然，如果学过OpenGL的人都知道，3D物体从建模到最终显示到屏幕上面要经历以下几个阶段：


  * 对象空间(Object Space)


  * 世界空间(World Space)


  * 照相机空间(Camera Space/Eye Space)


  * 裁剪空间(Clipping Space)


  * 设备空间（normalized device space）


  * 视口空间(Viewport)



从对象空间到世界空间的变换通常叫做Model-To-World变换，从世界空间到照相机空间的变换叫做World-To-View变换，而从照相机空间到裁剪空间的变换叫做View-To-Projection。合起来，就是我们常常提到的MVP变换。这里面每一个变换都是乘以一个矩阵，3个矩阵相乘最后还是一个矩阵，也就是cocos2d-x里面的CC_MVPMatrix啦。当然，实际开发过程中，我们往往会把MV变换放到一起，一般做法如下：

```cpp
gl_Position = P * MV * ObjectPosition;
```

具体这些变换是怎么计算的，另外每一个计算的几何意义是什么。本系列教程暂不讨论，感兴趣的读者可以去看看我在本系列教程第一篇的最后推荐的一些资源。



### 修改CC_MVPMatrix



我们怎么样修改CC_MVPMatrix呢？前面介绍过uniform变量的修改方法在这里是适用的，我们可以先通过glGetUniformLocation来获取这个uniform的入口，然后调用glUniformMatrix4fv来给它传值就行了。

但是，等等。我该怎么计算这个矩阵的值呢？有两个函数glLookAt和glPerspective可以做这些事，具体的用法 ，大家可以参考CCDirector.cpp里面的代码。我就不在此处展开讨论了，另外强烈推荐大家运行[此网页中的一个演示程序](http://user.xmission.com/~nate/tutors.html)，用来加深于这两个函数的理解。

在cocos2d-x里面，我们可以通过修改矩阵栈里面的ModelView和Projection栈顶元素，从而修改ModelView和Projection矩阵，最终达到修改CC_MVPMatrix的目的。

首先，让我们在onDraw函数的最开头加入下列代码：

```cpp
 Director::getInstance()->pushMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW);
    Director::getInstance()->loadIdentityMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW);
    Director::getInstance()->pushMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION);
    Director::getInstance()->loadIdentityMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION);
```

然后在onDraw函数返回前加入下列代码：

```cpp
  Director::getInstance()->popMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_PROJECTION);
    Director::getInstance()->popMatrix(MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW);
```

这里，我们通过调用pushMatrix把当前矩阵压栈，这个操作会把原来栈顶上的元素拷贝一份并压入栈，这样我们后续对于此矩阵的操作可以通过调用popMatrix来撤销影响。此处，我们把ModelView和Projection矩阵都重置成了单位矩阵。而我们通过调用下列代码可以更新CC_MVPMatrix:

```cpp
    glProgram->setUniformsForBuiltins();
```

此时，如果我们运行程序，会得到一个黑屏（什么也显示不了）。



## 设备空间(normalized device space)



为了解决上述问题，我们只需要把对象的顶点数据修改为：

```cpp
float vertercies[] = { -1,-1,   //第一个点的坐标
        1, -1,   //第二个点的坐标
        0, 1};  //第三个点的坐标
```

为什么要这样呢？因为任何一个顶点乘以一个单位矩阵，它的值是不变的。而normalized device space空间的取值范围是-1~+1，如下图所示：

![clippingspace](http://guanghuiqu.qiniudn.com/screenCoordinates-300x165.png)

所以，如果我们要想显示同之前一模一样的三角形，就必须修改这个顶点数据，让它的取值范围落在Clipping Space以内。这也是我们在其它许多书本上面看到的规范的三角形的范例。



## 结语



最后，按照惯例，附上本教程的源码[下载地址](https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/commit/858446408bbaad5b1c15012c756f2c2809c7cd6e)



## 推荐阅读


  * [https://www.youtube.com/watch?v=-tonZsbHty8&index=26&list=PLRwVmtr-pp06qT6ckboaOhnm9FxmzHpbY](https://www.youtube.com/watch?v=-tonZsbHty8&index=26&list=PLRwVmtr-pp06qT6ckboaOhnm9FxmzHpbY)


  * [http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/](http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/)


  * [http://blog.db-in.com/cameras-on-opengl-es-2-x/](http://blog.db-in.com/cameras-on-opengl-es-2-x/) (强烈推荐）


