---
author: 0owen
comments: true
date: 2014-05-31 07:22:56+00:00
layout: post
slug: opengl-es-2-0-your-first-triangles
title: OpenGL ES 2.0教程：你的第一个三角形(1)
wordpress_id: 55
categories:
- Cocos2d-x
- OpenGL ES 
series:
- Cocos2D-X OpenGL ES 2.0教程
tags:
- Cocos2d-x
- opengl
---

* table of contents
{:toc}

## 前言

在本系列教程中，我会以当下最流行的2D引擎Cocos2D-X为基础，介绍OpenGL ES 2.0的一些基本用法。本系列教程的宗旨是OpenGL扫盲，让大家在使用Cocos2D-X过程中，知其然，更知其所以然。因为我自己的图形学水平有限，所以这些教程不会涉及非常底层的数学原理，同时也不会过多地提及OpenGL本身的一些细节知识。但是我会在每篇文章的最后给出一些参考链接，大家可以顺藤摸瓜，一举Get OpenGL这个新技能。

我第一次学习OpenGL是在2008年，但是那时候学得很烂，被各种矩阵变换搞得云里雾里。我于今年年初彻底重新学习OpenGL，目前来讲，应该算是入门了，至少矩阵变换是理解了，同时也会自己写一些简单的shader，可以进行OpenGL调试了。但是，我的学习之路才刚刚开始，我希望在我自己学习的过程，把有用的一些知识记录下来，方便自己和他人查阅。经过这次重新学习，我个人觉得，OpenGL真的没有那么难，只要你用心，就一定可以学会。当然，好的学习方法和好的学习资料肯定是会使之事半功倍的，希望接下来我的这些博文能为大家带来些许帮助。

<!-- more -->

在第一篇文章正式开始前，我谈下我自己的入门心得体会吧，而《如何学习OpenGL》这是个更大的话题，等我OpenGL水平精进之后，我再单独写一篇文章来谈谈我的看法。

目前来说，我的体会是“三要”和“三不要”。

  * 要理解OpenGL渲染管线

  * 要理解OpenGL是个状态机

  * 要多动手实践。

当然还有最重要的“三不要”：

  * 不要每天去群里问怎样最快能学好OpenGL

  * 不要每天去看各种资料而不动手写一点代码

  * 不要出了问题到处问，尝试先自己解决，实在解决不了再问

## 正文

### 准备工作

首先，是创建一个新的工程(注意我这里使用的版本是3.7. Update: Tuesday, June 16, 2015)。打开命令行工具，然后输入下列命令：

```cpp
cocos new -l cpp
```

如果对于上述命令不了解的用户，请[猛戳这里](http://cocos2d-x.org/wiki/How_to_Start_A_New_Cocos2D-X_Game).

编译并运行成功，然后把HelloWorldScene.cpp里面的init函数修改成下面的样子：

```cpp
bool HelloWorld::init()
{
    //////////////////////////////
    // 1. super init first
    if ( !Layer::init() )
    {
        return false;
    }
    return true;
    }
```

此时，再编译运行之。你将会得到以下界面。

![first](http://guanghuiqu.qiniudn.com/cocos2d-x-es-1.0.png)

### 发送CustomCommand

由于Cocos2D-X 从3.0开始引入了一种新的渲染机制，所有的OpenGL渲染代码不再放到每一个node的draw函数里面，而是通过各种RenderCommand封装起来，然后添加到一个渲染队列里面去，最后在每一帧结束时把所有的这些命令都渲染出来。具体细节，大家可以参考[这个文档](http://cocos2d-x.org/wiki/Cocos2d_v30_renderer_pipeline_roadmap).

首先，打开HelloWorldScene.h，添加一个onDraw函数，一个CustomCommand成员变量，并且重载Layer的visit函数，代码如下：

```cpp
    class HelloWorld : public cocos2d::Layer
    {
    public: 
        //其它函数省略
        virtual void visit(Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags) override;

        void onDraw();
    private:
        CustomCommand _command;
    };
```

然后我们实现这个visit函数：

```cpp
    void HelloWorld::visit(cocos2d::Renderer *renderer, const Mat4 &transform,uint32_t parentFlags)
    {
        Layer::visit(renderer, transform, parentFlags);
        _command.init(_globalZOrder);
        _command.func = CC_CALLBACK_0(HelloWorld::onDraw, this);
        Director::getInstance()->getRenderer()->addCommand(&_command);
    }
```

这里要稍微解释一下。由于此函数是个重载的虚函数，所以我们在函数的最开始调用了父类的visit函数。如果你不调用父类的visit函数，那么当你往HelloWorldScene里面添加节点的时候，它们是不会被渲染出来的。（这个留给读者自己去完成）

然后，我们使用_globalZOrder和一个std::function来初始化CustomCommand。_globalZOrder会影响渲染的顺序，这个在后面的博文中再详细探讨。而std::function会在CustomCommand被render队列处理的时候被调用。最后我们把该CustomCommand添加到renderer里面去。

最后，让我们看看onDraw函数，它是整个绘制三角形的核心。

```cpp
    void HelloWorld::onDraw()
    {
        //获得当前HelloWorld的shader
        auto glProgram = getGLProgram();
       //使用此shader
        glProgram->use();
       //设置该shader的一些内置uniform,主要是MVP，即model-view-project矩阵
        glProgram->setUniformsForBuiltins();

        auto size = Director::getInstance()->getWinSize();
        //指定将要绘制的三角形的三个顶点，分别位到屏幕左下角，右下角和正中间的顶端
        float vertercies[] = { 0,0,   //第一个点的坐标
                                size.width, 0,   //第二个点的坐标
                               size.width / 2, size.height};  //第三个点的坐标
        //指定每一个顶点的颜色，颜色值是RGBA格式的，取值范围是0-1
        float color[] = { 0, 1,0, 1,    //第一个点的颜色，绿色
                            1,0,0, 1,  //第二个点的颜色, 红色
                             0, 0, 1, 1};  //第三个点的颜色， 蓝色
        //激活名字为position和color的vertex attribute
        GL::enableVertexAttribs(GL::VERTEX_ATTRIB_FLAG_POSITION | GL::VERTEX_ATTRIB_FLAG_COLOR);
        //分别给position和color指定数据源
        glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_POSITION, 2, GL_FLOAT, GL_FALSE, 0, vertercies);
        glVertexAttribPointer(GLProgram::VERTEX_ATTRIB_COLOR, 4, GL_FLOAT, GL_FALSE, 0, color);
        //绘制三角形，所谓的draw call就是指这个函数调用
        glDrawArrays(GL_TRIANGLES, 0, 3);
        //通知cocos2d-x 的renderer，让它在合适的时候调用这些OpenGL命令
        CC_INCREMENT_GL_DRAWN_BATCHES_AND_VERTICES(1, 3);
        //如果出错了，可以使用这个函数来获取出错信息
        CHECK_GL_ERROR_DEBUG();
    }
```

如果你现在直接运行程序，会crash。这是因为我们还没有指定Shader，所以下面的调用会失败：

```cpp
auto glProgram = getGLProgram();
glProgram->use();
glProgram->setUniformsForBuiltins();
``` 

接下来，让我们在HelloWorldScene.cpp的init方法中加入下列代码：

```cpp
this->setGLProgram(GLProgramCache::getInstance()->getGLProgram(GLProgram::SHADER_NAME_POSITION_COLOR));
```

这个调用的含义是从Cocos2D-X的shader缓存中取出一个带有position和color顶点属性的shader，然后传给HelloWorld这个Layer.如果你是第一次接触OpenGL ES,看到这句话肯定无法理解，不过没有关系，后面的文章我们逐步讲清楚。如果你等不及，也可以先看我在文章最后推荐的链接。

接下来，运行一下程序.恭喜你，你的第一个漂亮的三角形完成啦，还算简单吧：）

![cocos2d-x-es-1.1](http://guanghuiqu.qiniudn.com/cocos2d-x-es-1.1.png)

本教程[源代码下载](http://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/tree/tutorial1),请认准tutorial1分支。

Git仓库地址: [https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0](https://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0)

### 结束语

为了保持第一篇文章的简单性，我只在画三角形的代码里面给了一些注释，因为我并不想一开始就涉及到OpenGL底层的一些细节，而且有些内容我一时半会儿也很难说清楚。所以，我会在文章的最后给出一些参考链接，强烈推荐大家在看完本文后，有时间就多看一看这些链接，相信对理解上面的代码有帮助。下一篇文章中，我将给大家介绍如何编写自己的shader，包括vertex attribute, uniform，vertex shader， fragment shader等内容。如果您对本文有什么建议或者意义，欢迎在下方评论。

### 写在最后

关于参考链接：所有的推荐阅读都是我精心挑选的，部分内容我自己看过，另外一些我也正在计划看。如果大家有好的资料，欢迎推荐给我。
关于评论：请不要找我要电子书，所有的电子书都可以通过google找到。

另外，我推荐的资料大部分都是英文版，如果对英文不是很感冒的同学，可以看[翻译的版本](http://opengl.zilongshanren.com/)。

### 推荐阅读

网站：

1. [http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter01.html](http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter01.html)
2. [http://www.opengl-tutorial.org/](http://www.opengl-tutorial.org/)
3. [http://antongerdelan.net/opengl/index.html](http://antongerdelan.net/opengl/index.html)
4. [http://www.arcsynthesis.org/gltut/](http://www.arcsynthesis.org/gltut/)
5. [http://www.scratchapixel.com/](http://www.scratchapixel.com/)
6. [http://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html](http://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html)

视频：

[https://www.youtube.com/watch?v=-tonZsbHty8&index=26&list=PLRwVmtr-pp06qT6ckboaOhnm9FxmzHpbY](http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter01.html)

书籍：

[Iphone 3D programming](http://www.amazon.com/iPhone-Programming-Developing-Graphical-Applications/dp/0596804822)

[OpenGL ES 2.0 for Android](http://www.amazon.com/OpenGL-Android-Quick-Start-Pragmatic-Programmers/dp/1937785343)

[OpenGL ES 2.0 Programming Guide ](http://www.amazon.com/OpenGL-ES-2-0-Programming-Guide/dp/0321502795/ref=sr_1_1?s=books&ie=UTF8&qid=1401529388&sr=1-1&keywords=opengl+es+2.0)

[Real-Time Rendering, Third Edition ](http://www.amazon.com/Real-Time-Rendering-Third-Tomas-Akenine-Moller/dp/1568814240/ref=sr_1_1?s=books&ie=UTF8&qid=1401529337&sr=1-1&keywords=real+time+rendering)
