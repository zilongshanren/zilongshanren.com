---
comments: true
date: 2014-07-12 15:17:43+00:00 +08:00
slug: opengl-es2-0-texturing-mapping
title: OpenGL ES2.0教程:纹理贴图(6)
wordpress_id: 551
categories:
- Cocos2d-x
- OpenGL ES
tags:
- Cocos2d-x
- opengl
---

 
<!-- toc -->

在[上一篇文章](http://zilongshanren.com/blog/2014-07-01-opengl-es2-your-first-cube.html)中，我们介绍了如何绘制一个立方体，里面涉及的知识点有VBO(Vertex Buffer Object)、IBO(Index Buffer Object)和MVP(Modile-View-Projection)变换。

本文将在[教程4](http://zilongshanren.com/blog/2014-06-22-opengl-es2-use-vbo.html)的基础之上，添加纹理贴图支持。最后，本文会把纹理贴图扩展至3D立方体上面。

## 基本方法

当我们把一张图片加载到内存里面之后，它是不能直接被GPU绘制出来的，纹理贴图过程如下：

首先，我们为之前的顶点添加纹理坐标属性并传到vertex shader里面去，然后把内存里面的纹理传给GPU，最后，在fragment shader里面通过采样器，就可以根据vertex shader传递过来的纹理坐标把纹理上面的颜色值用插值的方式映射到每一个像素上去。

接下来，让我们看看具体怎么做。
<!-- more -->

## 准备纹理坐标（纹理坐标也叫UV坐标）

首先，我们需要修改我们的顶点属性结构体,添加一个纹理坐标属性（TexCoord）:

```cpp
    typedef struct {
        float Position[2];
        float Color[4];
        float TexCoord[2];
    } Vertex;
```

接下来，需要修改顶点数组的值，主要就是添加UV坐标：

```cpp
  Vertex data[] =
    {
        { {-1,-1},{0,1,0,1},{0,1}},
        { {1,-1},{0,1,0,1},{1,1}},
        { {-1,1},{0,1,0,1},{0,0}},
        { {1,1},{0,1,0,1},{1,0}}
    };
```
注意，我们的纹理坐标的(0,0)点在图片的左上角，这个与OpenGL里面的左下角是(0,0)有所区别。所以为了让我们的图片显示正常，我们在指定左下角顶点(-1,-1)的时候，它对应的纹理坐标应该是(0,1)。其它的坐标点以此类推。

## 生成纹理

纹理的使用与之前的VBO使用方式差不多，都是先glGenXXX，然后glBindXXX，然后再把绑定数据。
首先，我们在头文件里面定义一个纹理的句柄：

```cpp
    GLuint textureId;
```
然后是生成纹理：

```cpp
    glGenTextures(1, &textureId);
```

## 绑定纹理

一旦纹理生成好以后，我们就需要把实际的纹理数据通过这个id传递给GPU。在传递纹理到GPU之前，

我们首先要把一张图片读到内存里面来。因为GPU是不认识png图片的，它只认识二进制的图像数组：

```cpp
  Image *image = new Image;
    std::string imagePath = FileUtils::getInstance()->fullPathForFilename("HelloWorld.png");
    image->initWithImageFile(imagePath);
```

然后，我们需要设置纹理在放大或者缩小的时候的插值方法(filter)以及在指定的纹理坐标超出(0-1）的范围的时候应该采用的策略（Wrap）:

```cpp
 glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER,  GL_LINEAR );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE );
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE );
```

最后，我们把纹理数据传递给GPU。

```cpp
unsigned char *imageData = image->getData();
    int width = image->getWidth();
    int height = image->getHeight();
    //调用此方法把imageData的图像数据传递给GPU
    glTexImage2D(GL_TEXTURE_2D,
                 0,
                 GL_RGB,
                 width,
                 height,
                 0,
                 GL_RGB,
                 GL_UNSIGNED_BYTE,//must be GL_UNSIGNED_BYTE
                 imageData);
   //别忘了释放image内存
    CC_SAFE_DELETE(image);
```

接下来，我需要处理Shader了。

## 修改Shader

首先，修改vertex shader，添加纹理坐标属性：

```cpp

attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_coord;

varying vec4 v_fragmentColor;
varying vec2 v_coord;

void main()
{
    gl_Position = CC_MVPMatrix * vec4(a_position.xy,0,1);
    v_fragmentColor = a_color;
    v_coord = a_coord;
}
```
因为纹理坐标最终要传递到fragment shader里面去，所以需要定义一个`varing vec2 v_coord`变量。

接下来是fragment shader的代码：

```cpp

varying vec4 v_fragmentColor;
varying vec2 v_coord;

uniform vec4 u_color;

void main()
{
    gl_FragColor = v_fragmentColor * texture2D(CC_Texture0,v_coord);
}
```
这边也定义了一个同样的varing变量，同时我们看到有一个texture2D函数，它可以通过CC_Texture0这个采样器和纹理坐标（v_coord）计算出对应的颜色值。

## 修改draw call

在调用draw call之前，我们需要绑定纹理。我们只需要在glDrawElements方法之前调用下列方法就可以了：

```cpp
    GL::bindTexture2D(textureId);
```

## 运行结果

![texturing](https://zilongshanren.com/img/texturing.png)

接下来，我们需要把立方体的六个面都添加这张纹理。

## 让立方体不再裸奔

这个过程大部分代码都是一样的，惟一的区别就是顶点数组的修改，我们需要为每一个面的顶点都指定UV坐标：

```cpp
#define TEX_COORD_MAX   1
    Vertex Vertices[] = {
        // Front
        { {1, -1, 0}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {1, 1, 0}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {-1, 1, 0}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}},
        { {-1, -1, 0}, {0, 0, 0, 1}, {0, 0}},
        // Back
        { {1, 1, -2}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {-1, -1, -2}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {1, -1, -2}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}},
        { {-1, 1, -2}, {0, 0, 0, 1}, {0, 0}},
        // Left
        { {-1, -1, 0}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {-1, 1, 0}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {-1, 1, -2}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}},
        { {-1, -1, -2}, {0, 0, 0, 1}, {0, 0}},
        // Right
        { {1, -1, -2}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {1, 1, -2}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {1, 1, 0}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}},
        { {1, -1, 0}, {0, 0, 0, 1}, {0, 0}},
        // Top
        { {1, 1, 0}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {1, 1, -2}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {-1, 1, -2}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}},
        { {-1, 1, 0}, {0, 0, 0, 1}, {0, 0}},
        // Bottom
        { {1, -1, -2}, {1, 0, 0, 1}, {TEX_COORD_MAX, 0}},
        { {1, -1, 0}, {0, 1, 0, 1}, {TEX_COORD_MAX, TEX_COORD_MAX}},
        { {-1, -1, 0}, {0, 0, 1, 1}, {0, TEX_COORD_MAX}}, 
        { {-1, -1, -2}, {0, 0, 0, 1}, {0, 0}}
    };
```

下面是立方体的六个面贴上纹理之后的效果：

![3dtexturing](https://zilongshanren.com/img/3dtexturing.png)

## 结语

其实我们在生成纹理的时候，还可以使用下面两种简化的方法：

```cpp
 //method2: the easier way
    Texture2D *texture = new Texture2D;
    texture->initWithImage(image);
    textureId = texture->getName();
   //method3: the easiest way
    Sprite *sprite = Sprite::create("HelloWorld.png");
    textureId = sprite->getTexture()->getName();
```

3D旋转立方体(带纹理贴图)[源代码下载](http://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/branches/recent) **master分支**
单个图片的纹理贴图[源码下载](http://git.oschina.net/zilongshanren/Cocos2D-X-OpenGL-ES-2.0/repository/archive?ref=tutorial6)

## Reference

  * [http://open.gl/textures](http://open.gl/textures)

  * [纹理立方体](http://opengl.zilongshanren.com/opengl-tutorial/tut05/zh.html)

