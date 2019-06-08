---
comments: true
date: 2014-08-31 22:52:22+00:00 +08:00
slug: 'how to use cmake to compile static library'
title: 使用CMake编译跨平台静态库
wordpress_id: 827
categories:
- tools
tags:
- CMake
---
 
<!-- toc -->

在开始介绍如何使用CMake编译跨平台的静态库之前，先讲讲我在没有使用CMake之前所趟过的坑。因为很多开源的程序，比如png，都是自带编译脚本的。我们可以使用下列脚本来进行编译：

```cpp
./configure  --prefix=/xxx/xx --enable-static=YES
make 
make install
```

相信手动在类Unix系统上面编译过开源程序的同学对上面的命令肯定非常熟悉。但是，如果不配置编译器和一些编译、链接参数，这样的操作，最后编译出来的静态库只能在本系统上面被链接使用。比如你在mac上面运行上面的命令，编译出来的静态库就只能给mac程序链接使用。如果在Linux上面运行上述命令，则也只能给Linux上面的程序所链接使用。如果我们想要在Mac上面编译出ios和android的静态库，就必须要用到交叉编译。
<!-- more -->

要进行交叉编译，一般来说要指定目标编译平台的编译器，通常是指定一个CC环境变量，根据编译的是c库还是c++库，要分别指定C_flags和CXX_flag，当然还需要指定c/c++和系统sdk的头文件包含路径。总之，非常之繁琐，大家可以看一下我之前把png编译到ios和mac上面的静态库所使用的[脚本](https://github.com/minggo/png/blob/master/ios_mac/build_libpng.sh)。

## 为什么要使用CMake

为什么我们不使用autoconf？为什么我们不使用QMake,JAM,ANT呢？具体原因大家可以参考我在本文最后的参考链接里面的[《Mastering CMake》](http://download.csdn.net/detail/sower/6850649)一书的第一章。我自己使用CMake的感受就是：我原来编写bash，配置configure参数，读各个开源库的INSTALL文件(因为不同库的configure参数有差别)，配置各种编译flag，头文件包含等。最后3天时间，折腾了png和jepg两个库的编译。当然，中间我还写了android和linux的编译脚本。而换用CMake以后，我2天时间编译完了Box2D,spine和Chipmunk的编译。并且配置脚本相当简单，添加新的库，基本上只是拷贝脚本，修改一两个参数即可。有了CMake，编译跨平台静态库和生成跨平台可执行程序So Easy！

## 编写CMakeLists.txt

编写一个静态库的CMake配置文件过程如下：（这里我以Box2D为例）

### 指定头文件和源文件

```cpp
include_directories(
  ${CMAKE_CURRENT_SOURCE_DIR}
)

file(GLOB_RECURSE box2d_source_files "${CMAKE_CURRENT_SOURCE_DIR}/Box2D/*.cpp")
```

我的CMakeLists.txt和Box2D的文件结构关系如下图所示：

![box2d_cmake](https://zilongshanren.com/img/box2d-cmake.png)

这里的`${CMAKE_CURRENT_SOURCE_DIR}`表示CMakeLists.txt所在的目录。而GLOB_RECURSE可以递归地去搜索Box2D目录下面所有的.cpp文件来参与静态库的编译。而include_directories和file指令，显而易见，它们是用来指定静态库的头文件和实现文件。

### 指定库的名字

```cpp
add_library(Box2D STATIC ${box2d_source_files})
```
这里add_library表示最终编译为一个库，static表示是静态库，如果想编译动态库，可以修改为shared.
至此，一个静态库的配置就完成了。当然，因为这个库没有包括其它外部的头文件，所以会比较简单。但这也远比一个Makefile要简单N倍。

## 编译linux静态库（含64位和32位）

编译linux的静态库是非常简单的，只需要安装好cmake以后，运行以下命令即可:

```cpp
cmake .
make
```

注意，如果是64位的系统，那么这样只能生成64位的静态库。想要编译出32位的静态库，则必须要先安装32位系统的编译工具链。

```cpp
sudo apt-get install libx32gcc-4.8-dev
sudo apt-get install libc6-dev-i386
sudo apt-get install lib32stdc++6
sudo apt-get install g++-multilib
```

然后，只需要指定cxx_flags为-m32即可，对应的CMake的写法为：

```cpp
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -m32")
```
最后用cmake生成makefile并make即可生成32位的静态库

## 编译ios静态库

编译ios库，最好先用cmake生成xcode工程。但是cmake默认的写法

```cpp
cmake -GXcode .
```

只能生成mac平台的xcode工程，而不能生成ios平台的xcode工程。不过我们可以借助[ios-cmake](https://code.google.com/p/ios-cmake/)开源项目。
下载iOS_32.cmake这个toolchain文件，然后使用下列命令来生成ios工程:

```cpp
cmake -DCMAKE_TOOLCHAIN_FILE=../toolchain/iOS_32.cmake  -DCMAKE_IOS_DEVELOPER_ROOT=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/  -GXcode ..
```

有了ios工程以后，我们就可以调用xcodebuild来生成静态库了:

```cpp
xcodebuild -project Project.xcodeproj -alltargets -sdk iphonesimulator7.1 -configuration Release
```
这条命令会生成一个胖包（armv7、armv7s）。但是默认只会生成32位的胖包。因此，我修改了iOS_32.cmake，让它可以生成64位的静态库。这个文件为[iOS_64.cmake](https://github.com/andyque/Box2D-cocos2d-x/blob/master/Box2D/toolchain/iOS_64.cmake).

所有的ios静态库（i386,x86_64,armv7,armv7s,arm64）生成完以后，可以用lipo来生成一个胖包，命令如下：

```cpp
lipo lib/i386/libBox2D.a lib/x86_64/libBox2D.a lib/armv7/libBox2D.a lib/arm64/libBox2D.a -create -output libBox2D.a
```

## 编译mac静态库

这个比较简单，直接`Xcode -GXcode`，然后用xcodebuild命令即可。

## 编译Andoird静态库

编译android库我们同样可以引入一个toolchain文件，这里我是从[android-cmake](https://github.com/taka-no-me/android-cmake)里面下载的。
在使用这个toolchain文件之前，我们先要使用ndk自带的make-standalone-toolchain.sh脚本来生成对应平台的toolchain.这个脚本位于你的NDK的路径下面的buil/tools目录下。

比如要生成arm平台的toolchain，我们可以使用下列命令:

```cpp
sh $ANDROID_NDK/build/tools/make-standalone-toolchain.sh --platform=android-$ANDROID_API_LEVEL --install-dir=./android-toolchain --system=darwin-x86_64 --ndk-dir=/Users/guanghui/AndroidDev/android-ndk-r9d/ --toolchain=arm-linux-androideabi-4.8
```


这里的`$ANDROID_NDK `为你的NDK的安装路径。这段命令可以生成arm的toolchain，最终可以编译出armeabi和armeabi-v7a静态库。
如果想生成x86的toolchain，指需要使用下列命令:

```cpp
sh $ANDROID_NDK/build/tools/make-standalone-toolchain.sh --platform=android-$ANDROID_API_LEVEL --install-dir=./android-toolchain-x86 --system=darwin-x86_64 --ndk-dir=/Users/guanghui/AndroidDev/android-ndk-r9d/ --toolchain=x86-4.8
```

```cpp
export PATH=$PATH:./android-toolchain/bin
export ANDROID_STANDALONE_TOOLCHAIN=./android-toolchain
cmake -DCMAKE_TOOLCHAIN_FILE=../android.toolchain.cmake -DANDROID_ABI="armeabi" ..
```

## 编译Win32，wp8和winrt静态库

这里直接使用cmake-gui生成对应的VS工程，然后再手动编译即可。

关于Box2D完整的跨平台编译脚本可以参考[我的Github](https://github.com/andyque/Box2D-cocos2d-x)

## Reference

  * [cmake by example](http://mirkokiefer.com/blog/2013/03/cmake-by-example/)

  * [mastering cmake pdf](http://download.csdn.net/detail/sower/6850649)

  * [Meta-configuration of C/C++ projects with CMake](http://www.kitware.com/source/home/post/136)

  * [Setting up Android standalone toolchain for CMake](http://cganime.wordpress.com/2012/09/26/setting-up-android-standalone-toolchain-for-cmake/)

  * [cmake and the Android NDK](http://flohofwoe.blogspot.com/2014/04/cmake-and-android-ndk.html)

  * [android-cmake](https://github.com/taka-no-me/android-cmake)

  * [CMake for Andrioid](http://www.srombauts.fr/2011/03/15/cmake-for-android/)

  * [ios-cmake google code](https://code.google.com/p/ios-cmake/)

