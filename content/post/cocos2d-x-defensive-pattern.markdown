---
comments: true
date: 2014-06-15 13:50:05+00:00 +08:00
slug: cocos2d-x-defensive-programming
title: Cocos2D-X设计模式：防御式编程模式
wordpress_id: 106
categories:
- Cocos2d-x
- design pattern
tags:
- Cocos2d-x
- design pattern
---

<!-- toc -->
声明：防御式编程是提高程序代码质量的一种手段，它不能算是真正意义上的模式。但是，这里，我还是要给它冠之以“模式”二字。

原因有三：

  1. cocos2d-x的框架源代码大量采用了防御式编程技术，用来确保框架的代码质量和稳定性。

  2. 标题党，引起大家对于防御式编程的重视。特别是当大家给cocos2d-x贡献源代码的时候，更应该要注意保证代码质量。

  3. 防御式编程非常重要，运用得当可以减少被bug折腾的时间。

<!-- more -->

## 1.应用场景

- 检查指针的参数值

首先，第一个大量使用的是CCLayer的init函数：

```cpp
bool CCLayer::init()
{
    bool bRet = false;
    do
    {
        CCDirector * pDirector;
        CC_BREAK_IF(!(pDirector = CCDirector::sharedDirector()));
        this->setContentSize(pDirector->getWinSize());
        m_bIsTouchEnabled = false;
        m_bIsAccelerometerEnabled = false;
        // success
        bRet = true;
    } while(0);
    return bRet;
}
```

这里使用了do…while(0);惯用法，同时配合CC_BREAK_IF宏来做错误处理。关于为什么要使用do…while(0)惯用法，可以参考[这篇文章](http://www.cnblogs.com/baiyanhuang/archive/2009/09/16/1730736.html)：

另一个地方就是一些内存管理的宏，这些宏可以帮助我们编写更健壮的内存管理代码：

```cpp
#define CC_SAFE_DELETE(p)            do { if(p) { delete (p); (p) = 0; } } while(0)
#define CC_SAFE_DELETE_ARRAY(p)     do { if(p) { delete[] (p); (p) = 0; } } while(0)
#define CC_SAFE_FREE(p)                do { if(p) { free(p); (p) = 0; } } while(0)
#define CC_SAFE_RELEASE(p)            do { if(p) { (p)->release(); } } while(0)
#define CC_SAFE_RELEASE_NULL(p)        do { if(p) { (p)->release(); (p) = 0; } } while(0)
#define CC_SAFE_RETAIN(p)            do { if(p) { (p)->retain(); } } while(0)
```

- 在变量使用的地方定义变量，在变量定义之后一定要保证其初始化

一切诡异的程序问题都源自变量定义未初始化，使用的时候是一些垃圾值，恰巧有些垃圾值可以用，所以程序偶尔工作，但是换个编译环境，代码就又出错了。当遇到这样的问题时，多半是由于变量定义未初始的原因。

- 使用const和assert宏来验证编程时的假设

具体指的是在函数的入口处，或者需要保证某些“不变量”的时候，使用assert断言来确保参数和返回结果的有效性。这个在cocos2d-x的源代码中也到处是可以看到的。

如果某些值是不被改变的就声明为const常量，某些函数保证不会修改对象内部状态也要声明为const。

## 2.使用此模式的优缺点

优点：

提高代码质量，使得代码的健壮性和稳定性都有保障。可以防止子程序由于接收到了非法数据而遭受破坏。

缺点：

过度的防御式编程也会引来问题，如果你在每一个能想到的地方用每一种能想到的方法检查从参数传入的数据，那么你的程序将会变得臃肿而缓慢。更糟糕的是，防御式编程引入的额外代码增加了软件的复杂度。所以运用是需谨慎。

## 3.此模式的定义及一般实现

子程序应该不因传入错误数据而被破坏，哪怕是由其他子程序产生的错误数据。

我们一般可以采用以下手段来进行防御式编程：

1）检查每个子程序的入口参数，记住“垃圾进、垃圾出”这个隐喻。必要的时候可以使用断言来确保函数的先验条件是符合假定的。因为很多时候，我们编写代码都是隐藏了一系列的假定的，只是你自己没有感觉到，有时候，这些假定没有关系，出了bug也容易找出来。但是，有时候，就不是那么幸运了。

2）不要直接使用文字常量，比如3、“Hero.png”这种常量。尽可能地定义const定义常量或者使用宏定义。

3）尽可能让函数返回一些东西，这样如果当函数运行出现问题时，可以根据返回值做一些处理。如果全部设计成void类型的函数，那么出现异常要么就是try—catch，要么就是直接让程序崩溃了。由于c++的异常机制并不是那么完善，所以，也一直为人们所诟病，cocos2d-x里面几乎没有使用c++的异常处理机制。最后，必要的时候要检查函数里面调用其它子程序时的返回值。

## 4.实际开发中如何采用此模式

在实际开发中，我个人觉得必要的防御式编程的态度和做法还是要有的。特别是函数的输入输出，因为函数的逻辑部分是我们关注地最多的，虽然它是最复杂的，但是，往往这部分出错的概率不高。

相反，是函数的一些边界条件和异常情况导致程序bug的滋生。有些时候除了验证函数参数的数据值范围有效性以外，更加要注意的是验证数据的业务条件是否满足。这一点恰恰最容易被忽视。

在做内存管理的时候，尽可能地使用cocos2d-x里面定义的一些宏来清理资源，比如CC_SAFE_DELETE等。当实现自定义的CCLayer对象的时候，也尽可能地采用do…while(0)的写法，如果里面出现问题，可以用CC_BREAK_IF来判断并退出。

## 5.此模式与其它模式的关系

此模式是万人迷，任何模式在实现的时候都可以考虑把它加进去。
