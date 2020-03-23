+++
title = "为什么我的游戏发热量很高"
date = 2019-06-16T20:19:00+08:00
lastmod = 2019-06-16T20:19:24+08:00
tags = ["gamedev"]
categories = ["gamedev"]
draft = false
author = "zilongshanren"
+++

一般谈到游戏为什么会发热，我们首先想到的就是CPU占用过高。因为在我们的常识里面，当自己笔记本电脑的CPU风扇疯狂转动的时候，肯定就是到了可以『煮鸡蛋』的时候了 :joy:

但是移动设备除了CPU以外，还有其他因素可能比CPU更耗电。
<!--more-->


## 为什么要关心设备电量消耗 {#为什么要关心设备电量消耗}

移动设备对于电量的使用是非常克制的，操作系统层面就做了很多耗电的优化。由于移动设备的电池容量有限，智能手机一天一充已然成为常态。

像Google和Apple都会给App的开者编写应用耗电优化的指南。但是，作为游戏开发者，鲜有这方面的指导。我们大多数时候只关心游戏内存占用和游戏帧率，而忽视了游戏耗电。

其实我们是需要关心自己游戏的耗电的，如果你的游戏耗电太高，让用户手机滚烫，一来会影响用户的游戏体验（长时间过高的温度还会损害用户手机的寿命，同时影响游戏性能）,二来用户手机都没电了就会变相减少玩游戏的时间，对于一些高arp值的游戏来说，游戏省电尤为重要。


## 哪些因素影响移动设备电量消耗和发热 {#哪些因素影响移动设备电量消耗和发热}

游戏设备的电量消耗大头其实还是屏幕，特别是现在手机尺寸都很大，分辨都很高，适当地调节用户的屏幕亮度，或者在用户操作空闲的时候，让游戏屏幕的亮度降下来是非常省电的。

但是，这个只影响省电，跟发热可能还没有太直接的关系。

一般来说，移动设备的系统资源主要分为：CPU，GPU, 内存，SSD（闪存），网络等，对于这些系统资源的大量频繁的I/O操作是导致移动设备发热的主要原因。(有可能不对，如有错误，欢迎斧正)

CPU如果占用太高，肯定是会影响游戏的发热的。但是通常情况下面，我们的CPU和GPU占用都不高，但是还是发烫。这时候，你可能要关心IO操作了。

因为移动设备的CPU和GPU是共享同一块内存的，当你的游戏的Draw call数量比较大时，这意味着你会更频繁地修改GPU这个状态机的状态，而这些状态的修改需要通过memcpy等方式在CPU
和GPU之间进行数据传输，而这些数据的传输非常耗电。

这里，其实就是我们经常说的带宽瓶颈。这个带宽就像高速公路一样，CPU和GPU的数据都要从这里通过，如果这些「数据通道」很忙，那你的手机系统自然发热量就大。

减少不必要的IO操作(读写文件，数据库等)，最大化Batch Draw Call，同时减少网络操作（网络也是一种IO）才能让你的游戏耗电变得更低。


## 如何优化游戏电量消耗 {#如何优化游戏电量消耗}

这里有一个非常实用的技巧：优化你的游戏Draw call，保证Draw call数量最低，减少CPU
里面的复杂操作（减少计算或者移到GPU进行计算），保持你的游戏的帧率可以跑满60帧。

然后，如果你的游戏不是格斗类等对FPS要求特别高的话，可以把游戏降帧为30帧。

降到30帧，玩家一般是感觉不到差异的，但是却可以让你的游戏的CPU和GPU都空闲下来。

如果上面的操作都解救不了你，可以尝试用Xcode连上你的手机，然后逐一Check上面我们提到的系统资源的消耗情况，对症下药。


## 总结 {#总结}

最近我们的游戏因为blend func的修改导致draw call数量大增，结果发热量也大增。通过
profiler查看，CPU和GPU占用并不高，游戏FPS也调成30帧了，而且帧率也比较稳定。

最后，通过优化Draw call数量，完美解决了iOS设备发热过高的问题。