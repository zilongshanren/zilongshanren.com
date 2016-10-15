---
author: 0owen
comments: true
date: 2014-06-20 14:57:52+00:00
layout: post
slug: cocos2d-x-design-patterns-delegation
title: Cocos2D-X设计模式:委托模式
wordpress_id: 116
categories:
- Cocos2d-x
- design pattern
tags:
- Cocos2d-x
- design pattern
---

 
<!-- toc -->

前言：

[前一篇文章](http://zilongshanren.com/blog/2014/06/20/cocos2d-x-design-pattern-mediator/)讨论了cocos2d-x里面的中介者模式，但是，由于概念把握上面的偏差，我把GoF的中介者模式搞混淆了。幸好有读者给我提出了这个问题，我在上一篇文章中也补充说明了。虽然我谈到的应用场景跟中介者模式有点类似，但是，经典的模式就是模式，我不能随便篡改，更不能张冠李戴。所以，这篇文章我将谈到的是委托模式（delegation pattern），而不是GoF里面的代理模式（Proxy pattern）,虽然delegate也可以翻译成“代理”，但是，为了以示区别，这里使用委托。当然，文章观点如果有误，欢迎大家指出。

<!-- more -->

在讨论cocos2d-x里面的委托模式之前，先来讲讲什么是委托，以及c++里面如何实现委托。委托通常还会跟回调、闭包联系在一起，而委托和委托模式也有一点区别。下面先看看委托模式的例子

一个打印机类的委托模式实现：

```cpp
class RealPrinter { // the "delegate"
public:
     void print() {
        //do something
     }
 }；

class Printer {      // the "delegator"
public:
     Printer(): p(new RealPrinter()){} // create the delegate
     void print() {
       p->print(); // delegation
     }
     ~Printer(){
       if(NULL != p){
          delete p;
          p = NULL;
       }
     }
private:
     RealPrinter *p;
 };

int main()
{
    Printer *p = new Printer;
    p->print();  //client don’t know the exists of delegate class
    delete p;
}
```

Printer这个类要实现打印功能，它不是自己去实现，而是委托RealPrinter这个类来实现。更一般化的示例如下：

```cpp
class PrinterDelegate{
public:
    virtual ~PrinterDelegate(){} // why virtual function , see Effective c++ Item 7.
    virtual void print() = 0;
};

class RealPrinter : public PrinterDelegate { // the "delegate"
public:
    void print() {
        //do something
    }
};

class Printer{
public:
    Printer():delegate(new RealPrinter){}
    void print(){
        if (NULL != delegate) {
            delegate->print();
        }
    }
    ~Printer(){
       if(NULL != delegate){
          delete delegate;
          delegate = NULL;
       }
     }
private:
    PrinterDelegate *delegate;
};

int main()
{
    Printer *p = new Printer;
    p->print();  //client don’t know the exists of delegate class
    delete p;
}
```

看完这个实现之后，相信大家对objc里面的delegate如何用c++实现也差不多有了解了吧。其实很简单，就是一个针对接口编程嘛。

看完这个实现之后，你可能会说，“切！这就是你说的委托模式啊，也太简单了吧”。不过，我们要把委托更一般化，或者更具体化。用过c＃的朋友都知道，c#里面有一种类型delegate，它可以申明委托方法，从而实现事件驱动编程。具体的内容读者可以谷歌一下“c#的委托和事件”。

其实委托就是一个方法，但是它可以被当作“First-classvariable”来对待。即函数可以被存储，被传参，还可以从其它函数内部返回。拥有这种特性，同时大量采用这种特性的语言还有javascript，lua等，这也是现在我们津津乐道的函数式编程。那么c++能不能拥有函数式编程体验呢？答案是肯定的。c++中的函数指针，指向成员函数的指针、函数子对象都可以被存储、被传参，还可以从其它函数内部返回。而cocos2d-x里面也是大量采用了这种指向成员函数的指针来实现委托，这个留到后面再讨论。自从c++11的标准发布以后，我们还可以采用lambda表达式。那么c++到底有多少种方式可以实现委托呢？请参考这个[链接](http://stackoverflow.com/questions/9568150/what-is-a-c-delegate)。对于更多的实现委托的方式，可以参考文章结尾给出的链接，很重要哦，感兴趣的读者不可错过。看完这些文章，相信读者对于什么是委托、c++里面如何实现委托以及什么是委托模式，它们之间有什么区别应该比较清楚了。

好了，讲了这么多题外话，现在回到cocos2d-x的委托设计模式发掘中来吧！

### 一、应用场景

在挖掘委托模式之前，我们先探究一下，什么情况下会使用委托模式。（因为我们前面回答了what和how的问题，现在来研究下when）。如果我们了解了应用委托模式的一般原则和场景，那么接下来的发掘过程会容易很多。

一个典型的应用场景是GUI编程中，当一个按钮被点击或者一个窗口被关闭时，程序需要做相应的响应，这时候就需要委托了。什么意思呢？因为我们的GUI程序一直在等待用户输入，然后根据用户输入作出相应的响应，在用户没有做出“按下按钮”这个动作之前，我们的程序是不知道如何响应的。这个按钮被按下去的响应动作，在你设计按钮类的时候是无法确定的，必须在客户程序中指定。客户程序实现响应按钮事件的接口，然后注册，这样当事件发生的时候，客户端程序类（相当于委托类）就可以作出定制的处理了。

这种在运行时刻进行任务委派的功能，在设计框架和可重用的组件的时候非常有用，大名鼎鼎的MVC就大量采用了委托设计模式（观察者模式和策略模式都可以看到是一般化的委托模式）。

这时候，我们再来挖掘cocos2d-x里面的委托设计模式，其实已经非常简单了。Cocos2d-x里面的CCMenu的响应事件，CCControlButton的响应事件，还有一大堆scheduler的实现，都采用了委托设计模式。它的实现细节就是采用了指向成员函数的指针，不过由于采用了宏定义的方式，所以编写代码还算方便。打开CCObject.h，你可以看到一大堆函数指针和相关的宏定义：

```cpp
typedef void (CCObject:: *SEL_SCHEDULE)(float);
typedef void (CCObject:: *SEL_CallFunc)();
typedef void (CCObject:: *SEL_CallFuncN)(CCNode *);
typedef void (CCObject:: *SEL_CallFuncND)(CCNode *, void *);
typedef void (CCObject:: *SEL_CallFuncO)(CCObject *);
typedef void (CCObject:: *SEL_MenuHandler)(CCObject *);
typedef void (CCObject:: *SEL_EventHandler)(CCEvent *);
typedef int (CCObject:: *SEL_Compare)(CCObject *);
```

上面列举的是指向成员函数的指针来实现委托，那有没有采用接口来实现委托的呢？答案也是肯定的。在解析CocosBuilder生成的文件的时候，我们定制的类如果要关联成员变量，或者定义控件的响应消息的话，都需要实现相应的委托接口，如下：

```cpp
class AnimationsTestLayer :public cocos2d::CCLayer
, public cocos2d::extension::CCBSelectorResolver
, public cocos2d::extension::CCBMemberVariableAssigner
{
    virtual cocos2d::SEL_MenuHandler onResolveCCBCCMenuItemSelector(CCObject * pTarget, cocos2d::CCString * pSelectorName);
    virtual cocos2d::extension::SEL_CCControlHandler onResolveCCBCCControlSelector(cocos2d::CCObject * pTarget, cocos2d::CCString * pSelectorName);
    virtual bool onAssignCCBMemberVariable(cocos2d::CCObject * pTarget, cocos2d::CCString * pMemberVariableName, cocos2d::CCNode * pNode);
    void onCCControlButtonIdleClicked(cocos2d::CCObject * pSender, cocos2d::extension::CCControlEvent pCCControlEvent);
    void onCCControlButtonWaveClicked(cocos2d::CCObject * pSender, cocos2d::extension::CCControlEvent pCCControlEvent);
    void onCCControlButtonJumpClicked(cocos2d::CCObject * pSender, cocos2d::extension::CCControlEvent pCCControlEvent);
    void onCCControlButtonFunkyClicked(cocos2d::CCObject * pSender, cocos2d::extension::CCControlEvent pCCControlEvent);
｝
```

这中间很多代码省略掉了，具体的可以查考cocos2d-x自带的test里面的extensionTest。

### 二、该模式优缺点

优点：

1、解耦，将应用相关的内容与框架完全分享出来，在设计可重用的组件的时候特别有用。

2、可扩展性和可配置性高，而且可以在运行时候切换委托对象，具有很强的灵活性。

缺点：

1、采用接口的实现，由于使用了虚函数，所以性能上会有一点损失。虽然采用指向成员函数的指针的方式来实现效率非常高，但是，语法很诡异，使用起来其实还是不太爽的。尽管cocos2d-x已经用宏定义让使用方便了一些。

2、如果过度使用，容易导致职责分散，导致维护麻烦。

### 三、定义及一般实现

定义：参考[维基百科](http://en.wikipedia.org/wiki/Delegation_pattern)（因为我实在是很难给出一个精确的定义orz）

一般实现：也请参考[维基百科](http://en.wikipedia.org/wiki/Delegation_pattern)（呵呵，其实之前已经在文章最开始的时候给出来了）

### 四、游戏开发中如何运用此模式

其实就是你要设计一些可重用的组件，或者有些行为在编译的时候无法确定，需要根据运行时环境指定，也可以采用委托。其实说白了，也就是对象组合+针对接口编程的产物。如果遵守了这些良好的设计原则，你的软件系统之中到处可以见到委托的缩影。

当然，前面讨论的委托还是两个对象之间通信的一种方式。为什么不直接通信呢？因为解耦嘛，你懂的。

最后，我还是给出一个我自己使用委托设计的可重用的[模态对话框类](http://dl.vmall.com/c0of5hl18w)。注意，这里采用的是cocos2d-iphone设计的。读者如果有兴趣，可以改成c++来实现，权当是一次练手的机会啦。

### 五、与其它模式的关系

委托模式与mvc、观察者和策略模式有着千丝万缕的联系：）。

### References:

[http://en.wikipedia.org/wiki/Delegation_programming](http://en.wikipedia.org/wiki/Delegation_programming)

[http://en.wikipedia.org/wiki/Delegation_pattern](http://en.wikipedia.org/wiki/Delegation_pattern)

[http://allenchou.net/2012/04/easy-c-delegates/](http://allenchou.net/2012/04/easy-c-delegates/)

[http://allenchou.net/2012/04/function-pointers-vs-member-function-pointers/](http://allenchou.net/2012/04/function-pointers-vs-member-function-pointers/)

[http://www.codeproject.com/Articles/7150/Member-Function-Pointers-and-the-Fastest-Possible](http://www.codeproject.com/Articles/7150/Member-Function-Pointers-and-the-Fastest-Possible)

[http://stackoverflow.com/questions/9568150/what-is-a-c-delegate](http://stackoverflow.com/questions/9568150/what-is-a-c-delegate)

[http://www.cppblog.com/huangwei1024/archive/2010/11/17/133870.html](http://www.cppblog.com/huangwei1024/archive/2010/11/17/133870.html)

[http://www.codeproject.com/Articles/11464/Yet-Another-C-style-Delegate-Class-in-Standard-C](http://www.codeproject.com/Articles/11464/Yet-Another-C-style-Delegate-Class-in-Standard-C)

[http://www.codeproject.com/Articles/13287/Fast-C-Delegate](http://www.codeproject.com/Articles/13287/Fast-C-Delegate)

[http://www.codeproject.com/Articles/11015/The-Impossibly-Fast-C-Delegates](http://www.codeproject.com/Articles/11015/The-Impossibly-Fast-C-Delegates)
