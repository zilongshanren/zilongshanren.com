---
comments: true
date: 2014-05-31
slug: opengl-es-2-0-your-first-triangles
title: OpenGL ES 2.0教程：你的第一个三角形(1)
wordpress_id: 55
categories:
- Cocos2d-x
- OpenGL ES 
tags:
- Cocos2d-x
- opengl
---

 
<!-- toc -->

## 前言
学习程序世界里面的任何一项技能都有一个HelloWorld，而OpenGL的HelloWorld就是自己画一个三角形。当然，在
cocos2d-x里面使用DrawPrimitives可以轻松画出一个三角形。但是，我们这一次希望只通过底层的图形API就能够绘制一个三
角形。

<!-- more -->

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

![first](https://zilongshanren.com/img/cocos2d-x-es-1.0.png)

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

![cocos2d-x-es-1.1](https://zilongshanren.com/img/cocos2d-x-es-1.1.png)


### 结束语

为了保持第一篇文章的简单性，我只在画三角形的代码里面给了一些注释，因为我并不想一开始就涉及到OpenGL底层的一些细节，而且有些内容我一时半会儿也很难说清楚。所以，我会在文章的最后给出一些参考链接，强烈推荐大家在看完本文后，有时间就多看一看这些链接，相信对理解上面的代码有帮助。下一篇文章中，我将给大家介绍如何编写自己的shader，包括vertex attribute, uniform，vertex shader， fragment shader等内容。如果您对本文有什么建议或者意义，欢迎在下方评论。


### 推荐阅读

1. http://learnopengl.com/
