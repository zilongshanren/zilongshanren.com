+++
title = "编程之道：饭后洗碗"
date = 2019-07-20T11:13:00+08:00
lastmod = 2019-07-20T11:17:33+08:00
tags = ["programming", "thoughts"]
categories = ["programming"]
draft = false
author = "zilongshanren"
+++

从今天起，我将写一系列《编程之道》的文章，主要用来记录我这些年来写代码的感悟。这些文章主要聚焦在如何写好代码。更多的是『道』--- 最佳实践，而不是『术』。写代码并不是一件非常难的事情，但是写『好代码』却没有那么简单。它需要我们拥有『足够的知识』和『超强的自律』。

<!--more-->


## 编程隐喻（Programming Metaphor） {#编程隐喻-programming-metaphor}

以前看《代码大全》和《程序员修炼之道》的时候，里面经常会提到『编程隐喻』这个词，使用这些隐喻来表达软件开发过程中的某种现象或活动非常形象，这个有点像设计模式，它增加了程序员们之间进行有效沟通的词汇。

另外，编程隐喻还非常容易记忆，比如『我的源代码被猫吃了』这个隐喻就很形象，让我们对于代码的版本控制的重要性一目了然。今天我要介绍的隐喻是『饭后洗碗』，请君看我详细道来。


## 饭后洗碗（Wash Bowls After Meal） {#饭后洗碗-wash-bowls-after-meal}

如果你在家里做饭，吃完饭后一定要去洗碗。因为洗碗的时候，你会发现，砧板是脏的，旁边有很多碎菜叶，有油渍，上面有碎肉等残渣。锅子里面有炒菜后剩下的各种残渣，灶台也是的。洗碗的时候，这些可别都视而不见，因为日积月累就会变得非常脏，然后就会引来蟑螂。相信租过房子的人都深受蟑螂之害。饭后洗碗，洗的可不只是碗，而是清洗整个厨房。

现在我们可以把它类比到我们的写代码过程中了。写完代码（做完饭），自测通过（吃饱了），能直接提交代码了吗？（你想不洗碗就下次接着做饭吗？）如果你不『洗碗』，你的代码库只会越来越脏，越来越难以维护，同时Bug的数量也会越来越多（不就等于厨房里面的Bug数量吗？）。

这个时候，我们需要做以下几件事情：


### 代码整理 {#代码整理}


#### DRY：Don't repeat yourself {#dry-don-t-repeat-yourself}

1.  清理重复代码：同样的函数实现不要存在多份
2.  清理不必要的注释：如果代码很清楚了，就不再要注释了。因为你下次修改代码的时候，可能会忘记更新注释，导致代码与注释不一致。所以写清晰可读的代码非常重要，注释反而不容易经常被更新。
3.  清理重复抽象：比起代码重复，更难被发现的是『知识重复』。同样的业务知识，由于编写代码的人不同，导致在同一个项目里面有多种不同的抽象。


#### 警惕修改现有代码 {#警惕修改现有代码}

主要是要注意并识别修改代码时的坏味道：

1.  添加一个功能时非常难下手，传递数据往往依赖『单例』
2.  新增很小的一个功能代码改动点都非常大，而且经常是在以前别人写的函数里面添加if else
3.  每次改东西都会修改同一个类（巨无霸类）

当频繁出现这些代码坏味道的时候，说明你的代码的结构已经非常僵化了，如果一直坐视不理，很可能某一天会出现新功能无法很快添加，bug数量层出不穷。


#### 注意封装副作用 {#注意封装副作用}

修改代码最怕的是影响现有代码的逻辑，其实就是担心自己的某些操作导致程序的状态发生不可预知的影响。如果是添加新功能，某些状态是该功能特有的，一定要封装起来，不要污染到以前的对象中，用class封装起来。另外，尽量使用『值对象』而不是引用对象，这样你的修改并不会影响现有的逻辑。如果一定要修改现有对象，请仔细审查你的操作会影响该对象的哪些状态，你是否清楚理解这些状态及其改变的时机。

副作用并不可怕，只要你用瓶子把它装起来就行。


### Commit 整理 {#commit-整理}

这个经常容易被大家忽视，就好比『洗碗』只是『洗碗』，而不洗砧板和锅子一样。

我们在实际项目开发过程中，经常能见到一些Commit非常庞大，里面可能包含了几十个文件，上千行的代码修改。这种Commit根本没法进行代码review，更别说日后通过Commit来理解代码了。

而且除了Big Commmits以外，我们会发现这些Commits的提交日志却是异常简洁。通常就几个字『Bug Fix』，『修改代码』和『实现XXX功能』。

这样的提交日志和这样的Commit提交方式，让代码的版本控制工具实际上变成了一个同步盘。你其实就是想保存代码和分享，然后可以回滚代码。（一般来说，版本发布后会打Tag，所以回滚在这样的操作面前还是能够应付的）

项目开发阶段，我们这样做确实能减少不少心智负担。但是一旦代码编成，其实我们是有工具可以整理这些commits的。使用Rebase和squash，我们可以让Commit的粒度足够小，每条
Commit的日志都足够清晰，并且整个历史记录可以按照时间线性排列。

别小看了这些操作，当你遇到Bug的时候，Git bisect 可以帮你忙。当你的项目进来很多新人的时候，这些操作可以让新人感觉更友好，更容易理解代码。

代码被阅读的次数是远远大于它被编写的次数的，如果每一行代码都有清晰明确的Commit提交历史，那么我们修改代码的时候就会更加自信。


### 添加测试 {#添加测试}

添加测试跟『洗碗』有关系吗？它更像是做完洗碗清洁工作之后，把刀和砧板收起来，碗收到消毒柜里面，防止这些工具被Bug爬，方便下次做饭的时候放心使用。

而测试的作用，主要也差不多类似。它可以防止代码出现『退化』，不至于新加的代码让现有的功能遭受破坏（如果是开发测试阶段发现了这种破坏还好，如果没发现，上线后就更麻烦了）。测试同时也能倒逼你的代码结构设计的更好。因为设计不好的代码结构是非常难于测试的，你需要添加大量的Mock才可以让测试跑起来。


## 总结 {#总结}

虽然道理都懂，但是你可能还是写不好代码。因为要做到这些，除了加强学习（懂git
rebase/squash，懂如何封装和抽象，懂如何编写测试），还需要非常强的自律。