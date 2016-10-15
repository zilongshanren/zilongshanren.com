---
layout: post
title: "一套交叉编译脚本"
date: 2014-11-02 21:35:51 +0800
comments: true
categories: 
- cross compile
---

 
<!-- toc -->

现在移动平台非常火热，我们在使用C/C++开发一些移动应用的时候，经常可能需要将一些第三方c/c++库编译成对应的iOS/Android/WP/Tizen上面的静态库。
之前我介绍过[如何使用CMake来编译跨平台库](http://zilongshanren.com/blog/2014-09-01-how-to-use-cmake-to-compile-static-library.html)。
那种方法有一个局限性，它只针对一些提供了CMake支持或者源码本身不需要configure的库来说，使用会非常方便，但是如果库本身没有提供CMake或者
在编译之前需要configure的库，使用起来就会很麻烦了。最好的做法，其实是重用它本身提供的编译系统，然后提供交叉编译所需要的一些参数即可。

<!-- more -->

## 问题描述
对于提供了configure/make/make install编译系统的库来说，交叉编译只需要指定--build, --host，然后提供CC,CXX,AR,LD,RANLIB,STRIP等编译所需要的变量，最后可能还需要指定arch，CFLAGS，CXXFLAGS和LDFLAGS即可。

而对于提供了CMake支持的库来说，我们只需要为CMake提供一个交叉编译所需要的toolchain文件即可。一般来说，一个CMake的toolchain文件如下所示:

```cpp
#
# CMake Toolchain file for crosscompiling on ARM.
#
# This can be used when running cmake in the following way:
#  cd build/
#  cmake .. -DCMAKE_TOOLCHAIN_FILE=../cross-arm-linux-gnueabihf.cmake
#

set(CROSS_PATH /opt/gcc-linaro-arm-linux-gnueabihf-4.7-2013.02-01-20130221_linux)

# Target operating system name.
set(CMAKE_SYSTEM_NAME Linux)

# Name of C compiler.
set(CMAKE_C_COMPILER "${CROSS_PATH}/bin/arm-linux-gnueabihf-gcc")
set(CMAKE_CXX_COMPILER "${CROSS_PATH}/bin/arm-linux-gnueabihf-g++")

# Where to look for the target environment. (More paths can be added here)
set(CMAKE_FIND_ROOT_PATH "${CROSS_PATH}")

# Adjust the default behavior of the FIND_XXX() commands:
# search programs in the host environment only.
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)

# Search headers and libraries in the target environment only.
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
```
这里重要的是指定编译器，sysroot和编译时的CFLAGS，CXXFLAGS等参数。具体就不在这里展开了。

为什么我要研究这些东西呢？因为cocos2d-x现在依赖20多个第三方库，如果全部采用源码的形式，那开发编译的时间会变得非常长。为了减少编译等待时间，我们一般会把第三方库事先编译好，形成一堆.a文件。然后在程序运行的时候，指定链接参数给链接器就ok了。

但是，目前我们这些库都是临时编译的。当时编译的脚本没有保留下来了，也就是不清楚编译时候所指定的参数。
另外，编译各个平台下面的静态库，这本身也不是一件简单的事。如果没有相关经验，可能会无从下手。所以，我们为了解决这个问题，现在新建了一个仓库[cocos2d-x-3rd-party-libs-src](https://github.com/cocos2d/cocos2d-x-3rd-party-libs-src). 这个仓库会把cocos2d-x所需要编译的第三方库的编译脚本全部保存在这里，如果哪一天，我们需要升级第三方库，或者发现现有的第三方库有问题，也可以从编译脚本找问题。

## 交叉编译一般步骤

一般来讲，我们编译一个第三方库有以下几个步骤。

1. 下载第三方库的源码（一般下载稳定版本）

2. 阅读它自带的Install或者Readme文件，看看如何在本机上编译这个库

3. 如果在本机上不能顺利编译的，可能需要自己给第三方库写patch，这样做的好处是，下次别人下载这个库，只要应用你的patch就可以顺利编译了。

4. 指定交叉编译器，sysroot, CFLAGS, CXXFLAG等参数

5. ./configure, make, make install就搞定了。

一套成形的脚本看起来，大概是[这样子的](https://github.com/minggo/png/blob/master/build_libpng.sh).

## 解决办法
如果我们为每一个库都编写这样一套脚本，那会显得非常浪费。因为基本上每个平台的脚本都大同小异，如果可以把共用的部分抽取出来就最好了。
要抽取出公共的部分其实是有难度的，但是世界上做这件事情的人绝对不只你一个。本着不重复造轮子的原则，我们直接把[VLC](https://github.com/videolan/vlc/tree/master/contrib/src)
所使用的编译系统拿来改造一下就ok啦。

这套系统主要组成如下

1. 它有一个bootstrap脚本，主要用来配置一些交叉编译的平台参数，如果是Android，则需要指定NDK路径，ANDROID ABI和ANDROID API的版本，是否使用neon等。

2. 一堆rules.mk文件，每一个第三库都会编译一个rules.mk文件，用来指定交叉编译时的参数

3. 一个SHA512SUMS文件，主要用来对下载的第三库进行md5的验证。

4. 一些patch，这部分是可选的。当下载的第三方库在编译时遇到困难时可能需要自己编译一些patch.编写patch非常简单，使用git diff > xxx.patch即可。

具体的文档介绍，请看[README文件](https://github.com/cocos2d/cocos2d-x-3rd-party-libs-src/blob/master/contrib/src/README)

## 结论
编译链接这件事情，其实我之前是没有整得非常清楚的。尤其是configure, make, makefile, cmake这些东西。通过这次折腾这堆编译脚本，我学到了很多东西，对编译链接理解地更加深入了。
另外，我觉得在做任何一件比较棘手的事情之前，先想想是否别人也会遇到同样的问题。他们是怎么解决的，站在巨人的肩膀上会看得更远。
还有，Don't repeat yourself! 

## Reference

- [Introduction to making makefile](http://www.jfranken.de/homepages/johannes/vortraege/make.en.html)

- [GNU make reference](http://www.gnu.org/software/make/manual/make.html#Overview)

- [VLC github](https://github.com/videolan/vlc/tree/master/contrib/src)
