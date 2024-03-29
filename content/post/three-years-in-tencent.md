+++
title = "在腾讯工作三年总结"
date = 2021-02-21T17:59:00+08:00
lastmod = 2022-06-19T11:30:26+08:00
tags = ["WORK", "LIFE"]
categories = ["work", "life"]
draft = false
author = "zilongshanren"
+++

不知不觉，来腾讯工作已经超过 3 年了，由于工作比较忙，在深圳的生活节奏很快，一直没有时间来写博客。今天，趁着周末有空，也来总结一下我在腾讯这 3 年的情况。


## 加入腾讯之路 {#加入腾讯之路}

  其实我加入腾讯的过程还是挺曲折的，本科的时候跟室友一起去武汉笔试、面试，前后跑了两次都没有被录用。（一次是实习，另一次是校招）。后来，我保送了本校研究生，在研二的时候又去武汉面试了暑假实习生，而这一次我直接 1 天就通关，一面面试官直接推荐我进入二面，然后二面做了一个智力题就直接找 HR 谈了（其实就是 offer 有了） 。这次我比所有同学都提前拿到了实习 offer, 但是最后我却没有去实习。（因为当时导师有一个项目也走不开，不过我争取一下也许能去的）

后来毕业之后，我也没有再投腾讯，而是直接加入了一家创业公司--触控科技，开始了我的“技术追梦之旅”。因为当时我的个人技术博客的访问量已经超过 100w 次 pv 了，而且我这个人好像特别喜欢布道，所以，我爽快地答应了王哲的邀请，去了成都当起了 cocos2d-x 的布道师，半年后转岗成为引擎工程师。如果没有触控 4 年的引擎开发经验，也不会有后面进入腾讯的顺利。


### 怎么进腾讯的？ {#怎么进腾讯的}

我正式加入腾讯的时间是 2017 年 8 月，那时，我在触控一共干了整整 4 年，期间虽然有不少猎头和公司挖我，我都不为所动，坚持自己的技术理想，不断地磨剑。这一次加入腾讯，还是因为第二次出差腾讯给他们做技术支持（其实就是做外包苦力），然后被"推荐"
过来的。 由于之前我拿了实习 offer 没来，所以这次进入腾讯，我被迫直接沿用了研究生那时起的英文名 lionqu 。但是同事们都习惯称呼我为“子龙”，很少有人直接叫我
lionqu 。因为在 cocos2d-x 的社区里面，我一直使用“子龙山人”这个网名，算是一名
KOL 吧。


### 为什么要进腾讯？ {#为什么要进腾讯}

当时对我来说，第一个是觉得大公司吧，福利待遇好，背书不错，利于后面的职业生涯。同时我也可以换一个赛道----去做游戏，去寻找最初的梦想，而不是只做引擎工具，这两者其实是有非常大的区别的。

还有就是当时厦门房价暴涨，而我当时的收入也不太符合预期，当然算了一下，就算不吃不喝再干 3 年也还是买不起厦门的房子。而且小孩越来越大也快要到上学的年纪了。当腾讯开出比我当时收入高的条件后，一对比我就过来了。

另外，腾讯人才密度高，与优秀的人共事能够学习到更多的东西。


### 关于找工作的思考 {#关于找工作的思考}

我的第一份实习 offer, 就是那个一天通关的 offer, 是因为我当时给面试官展示了一款 iOS 跑酷游戏，这款游戏完全是我一个人自学完成的，而且我还给二面面试官展示我的游戏和博客。笔记成绩据说是一般，但是在 2011 年能拿出一个完整的 iOS 游戏几乎已经领先同龄的应聘者好几级了，刚好鹅厂当时也在往移动端转型，我的技能是可以直接胜任工作的。

而我在技术写作方面的热情和能力，又让我几乎没有面试就拿到了触控科技的 offer 。而拿到腾讯的正式 offer, 虽然面试过程中有一些题答的不是特别好，但是由于能力和经验已经有背书了，所以也是非常简单的。我当时是在鹅厂跟着他们的正式员工一起开发了 2 个月的，中间独立承担了整个项目的前端开发，同时解决了一些突发的技术问题。

这三件事都体现了一个点：就是我向面试官展示出了足够的胜任工作的能力。其实就是影响力，让别人能够信任你。现在会刷题的人越来越多了，这条路上的竞争必然会很激烈，多注重些实战经验和提高技术影响力也是个不错的途径。


## 参与的两个项目 {#参与的两个项目}

进入腾讯以后，我主要参与了两个项目：欢乐麻将小游戏和欢乐麻将 3D 3.0 版本。


### 欢乐麻将小游戏 {#欢乐麻将小游戏}

我是国内第一批微信小游戏开发者，cocos creator 最早的 Adapter 层就是我贡献的。微信最早上线的 10 款小游戏里面就有麻将。这款麻将的开发方式跟其他游戏不太一样，我采用的方案是把 Unity 的欢乐麻将通过代码翻译的方式来复用代码逻辑，节约开发成本。同时，做了一个 cocos creator 到 Unity 的引擎适配层，让 Unity 的接口代码可以跑在 cocos creator 上。当然，由于两个引擎的 API 接口差异很大，这里还是有不少人工的工作量在里面。

后来基于这个项目，我移植了 QQ 玩一玩和 QQ 小游戏。至此，我的小游戏开发工作暂告一段落。


### 欢乐麻将 3D 终端 {#欢乐麻将-3d-终端}

这个项目主要就是目前大家手机上能够玩到的欢乐麻将，升级了 3D Avatar 形象，采用全新的 PBR 制作的 Avatar ，同时升级了套装。另外，程序层面把 NGUI 升级成了 UGUI(这个工作量是非常巨大的，也很有挑战性，后面会写文章分享下改造方法和改造过程), 全面拥抱 AssetBundle, 完善了资源管理，资源更新工作流，热更工作流，同时梳理并规范了业务逻辑开发的基本框架。因为我之前没有正儿八经做过
Unity3D 的项目，这一次上手还是挺快的，得益于之前的自学以及在引擎开发过程中的积累，我很快就上手了 Unity。

在这两个项目中，每一次我都是赶鸭子上架的感觉（项目 Deadline 都很紧），一方面觉得自己责任很大，一定要把事情做好，做完美。另一方面，由于历史遗留问题和工期问题，也只能在疯狂的加班中找到一个平衡点了。由于业务开发跟引擎开发的巨大差异，我也开始学会在业务开发中不断寻找平衡解，而不是最优解。在两个项目攻坚开发的过程中，压力是非常巨大的，但是还好都挺过来了。

做完小游戏的项目，我从 9 级（原 3-1)升级到了 10 级（原 3-2），目前正在努力晋升 11
级中。


## 目前现状 {#目前现状}

目前的状态我还是比较满意的，主要是赶在 2019 年深圳房价大涨前上车了，而且还是一个不错的学位房，虽然面积比较小，但是暂时够一家三口在深圳扎根了。


### 生活 {#生活}

每天还是很忙碌，忙工作，忙学习，抽时间陪家人。有了属于自己的房子，也住进来了，生活质量相比租房有了比较大的提升，目前也准备再购置一辆车扩展一下全家人的出行半径。总之，通过自己的努力，生活在变得越来越好，还是挺开心的。


### 工作 {#工作}

工作上，老大们也比较看重我，能让我在完成业务开发之余有一些时间和精力去改进项目中的不足，去填坑，去不断地提升项目的质量和开发效率。


## 今后展望 {#今后展望}

希望能更好地平衡工作和生活，不断提升自己的影响力，提升工作效率，帮助和影响到更多的人。如果大家想来腾讯，请一定要找我内推哈！
