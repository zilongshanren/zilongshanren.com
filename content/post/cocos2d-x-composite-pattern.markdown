---
comments: true
date: 2014-06-18
slug: cocos2d-x-composite-patterns
title: 'Cocos2D-X设计模式: 组合模式'
wordpress_id: 112
categories:
- Cocos2d-x
- design pattern
tags:
- Cocos2d-x
- design pattern
---

 
<!-- toc -->
在开始挖掘cocos2d-x里面的组合模式之前，我先武断地下个结论：

“几乎所有与GUI相关的框架设计都应用了组合设计模式”。（PS：大家注意我的用词，是“几乎所有”，给自己留条后路，哈哈）
<!-- more -->



## 1、应用场景



Cocoa编程框架APPKit和UIKit都应用了组合模式，各种各样的View及其派生类组成了一棵树状结构的层级视图，而这里面就应用了组合模式。当然，Cocos2D-x里面的Node组织方式也采用的是这个方法，最终游戏界面中的Nodes也会形成一棵树。

说到树，我们马上就会想到树根，树干和树叶。一棵树一般只包含一个根，若干树干和大量的叶子。同时，树干长在树根上，树叶长在树干上。（PS：这有点废话了，不过读者莫急，耐着性着往下看。）对应于Cocos2d-x里面，就是一个游戏有一个主场景GameScene，它是树根，然后它有若干个树干（GameLayer、HudLayer、InputLayer、BackgroundLayer和LevelLayer等），最后，每一个树干又包含若干个树叶（比如sprite、particles、font、TiledMap nodes、etc）。

![tree-node](https://zilongshanren.com/img/tree-nodes-labeled.png)

说完了这些，你可能会问了，这跟组合模式有毛关系啊。好，组合模式正式登场！

cocos2d-x里面的CCScene、CCLayer、CCNode派生类(不含CCLayer和CCScene)共同组成了一个树形结构，这样我们便可以以一致地方式来处理这些类，比如addChild、removeChild和getChildren。处理“整体-部分关系”（通常是树形结构），并且能够以一致地方式来对待整体与部分，这不正是组合模式的应用场景吗。



## 2、使用该模式的优缺点



优点：

1）、优化处理递归或分级数据结构。

2）、一致地对待组合对象与单个对象，可以简化客户端调用

缺点：

1）、如果是透明实现的组合模式，单个对象也会包含组合对象的方法，这样会给客户端调用造成麻烦，因为单个对象实际上是不会实现这些组合对象的方法的。



## 3、模式定义及一般实现



模式定义：

将对象组合成树形结构以表示“部分整体”的层次结构。组合模式使得用户对单个对象和使用具有一致性。

UML类图：

![diagram](https://zilongshanren.com/img/600px-Composite_UML_class_diagram_fixed.png)

一般实现：参考[这篇文章](http://www.cnblogs.com/tiandsp/archive/2012/06/26/2563575.html)



## 4、游戏开发中如何运用此模式



因为游戏开发不是设计框架，基本上使用组合模式的情形不多。但是，如果有递归或者树形结构的对象关系，都可以考虑使用组合模式。



## 5、与其它模式的关系



暂不讨论
