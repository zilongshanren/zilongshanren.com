---
author: 0owen
comments: true
date: 2014-06-20 14:52:32+00:00
layout: post
slug: cocos2d-x-design-pattern-mediator
title: Cocos2D-X设计模式:中介者模式
wordpress_id: 114
categories:
- Cocos2d-x
- design pattern
tags:
- Cocos2d-x
- design pattern
---

* table of contents
{:toc}
上周写了关于[cocos2d-x里面的观察者模式](http://4gamers.cn/blog/2014/06/20/cocos2d-x-design-pattern-observer/)，文章最后提到一个应用场景：“你的GameScene里面有两个layer，一个gameLayer，它包含了游戏中的对象，比如玩家、敌人等。另一个层是HudLayer，它包含了游戏中显示分数、生命值等信息。如何让这两个层相互通信。”

关于这两个层之间如何通信的问题，读者Llllong和我畅快淋漓地讨论了一番，详细的内容可以参考那篇文章的留言部分。最后，我们总结出三种通信方式：委托、观察者模式、中介者模式。（PS：剧透一下，下周跟大家一起来探讨一下cocos2d-x里面的委托设计模式。我12年翻译了[cocos2d如何实现mvc系列文章](http://www.cnblogs.com/andyque/archive/2012/03/11/2390814.html)，里面涉及到委托的使用，可是代码是objc写的，有一些童鞋不知道c++如何实现委托，导致port代码有困难。别急，下周我们见分晓。）

本文将延续前面几篇文章的风格，跟大家一起来探讨cocos2d-x里面的中介者模式。也非常欢迎读者对此文进行拍砖，很多思绪的火光，“拍着拍着”就冒出来了。

<!-- more -->

## 1、应用场景

谈到中介者模式这个词，我马上就想到了cocos2d-x里面的CCDirector类。这个类除了应用了单例模式，还应用了中介者模式。Why？因为它封装了Scheduler、ActionManager、TouchDispatcher、KeypadDispatcher和Accelerometer这五个对象的交互。它使得这几个对象之间的交互不需要显式地相互引用，使其耦合度变低。当然更多的是使得我们游戏中的对象可以方便地与这些类进行交互，而不需要显式地引用这些类。同时，由于Director类被设计成单例类，这样更加方便了客户程序调用。

由于之前Scheduler、ActionManager、TouchDispatcher这些类都被设计成了单例类，现在通过Director这个中介类，减少了系统中单例的数目，同时也使得这些类获得了单例的属性。（唯一实例和全局访问点都靠Director类来保障，这也是我为什么在介绍单例模式的时候讲过一句话“至少需要一个单例模式”的原因，因为其它“单例”可以通过此单例也获得“单例的属性”）

补充：我这里介绍的Director的应用场景，跟GoF标准中介者设计模式存在一定出入，但是，我觉得某些思想是相通的。GoF中提到的中介者模式的本质是“封装交互”，这一点在Director类中并没有体现出来。我这里冒然将二者联系在一起，实属认识上的不足，可能得了所谓的“模式病”吧。大家注意区分一下就行啦。所以，我感觉有时候设计思想比模式本身更重要，希望我尽快修成正果。

## 2、使用该模式的优缺点

优点：

1）、把多个同事对象的交互封装到一个中介者对象中，使得同事对象之间松散耦合，互不依赖

2）、集中控制交互

3）、多对多变成了一对多

缺点：

1）、容易造成中介者对象变成巨无霸类，维护和修改变得更加困难

## 3、模式定义及一般实现

定义：

用一个中介对象来封装一系列的对象交互。中介者使得各对象不需要显式地相互引用，从而使其松散耦合，而且可以独立地改变它们之间的交互。

UML图：

![mediator.jpg](http://guanghuiqu.qiniudn.com/mediator.jpg)

一般实现：参考[wikipedia](http://en.wikipedia.org/wiki/Mediator_pattern)

## 4、游戏开发中如何运用此模式

游戏世界里的对象关系非常复杂，如果设计得不好，极容易形成强耦合。而游戏天生又是需要经常更新、修改bug和升级的，这就导致了游戏程序的维护和扩展非常地难。使用中介者模式可以减少游戏世界里面对象之间的多对多关系，使之转变成多对一的关系。

关于中介者的实现，可以把AppDelegate类设计成中介者对象，也可以自定义中介者对象，比如GameManager类。把此类设计成单例类，可以方便访问，同时，此类可以拥有像gameScene，levelSaver等类的引用，方便其它对象与这些对象进行交互。

## 5、与其它模式的关系

中介者模式的实现可以采用单例模式，参考Director的实现。同时，在处理同事对象之间的交互的时候，可以采用观察者模式。
