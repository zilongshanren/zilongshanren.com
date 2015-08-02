---
author: 0owen
comments: true
date: 2014-06-25 15:03:36+00:00
layout: post
slug: 'my git workflow part one'
title: 我的Git工作流(上)
wordpress_id: 224
categories:
- Git
tags:
- Git
---

* table of contents
<!-- toc -->

这篇文章主要是记录一下我自己的Git工作流。
我从2010年下半年开始接触Git起，到今天也有快4年的时间了。在接触Git之前，版本控制系统里面我只用过svn，而且还只是会最简单的update和commit。当时，感觉版本控制这东西挺不错的，程序出了问题，还可以回滚。但是，当时对于版本控制的理解，好像就仅限于“文件备份”功能--终于不用每一个版本都新建一个文件夹存起来，打上时间戳了。

<!-- more -->

但是，自从Git用了3年多时间后，我可以毫不夸张地说，它把svn不知道甩了几条街了。当然，本文绝不是吐槽来着，svn比较简单，用于非程序人员管理一些文件资源（比如美术和策划方案）还是挺不错的。因为你要向一个非程序人员培训Git，真的很不容易。

下面以我在做一个个人项目为例，该项目是一个游戏，名为SuperCandyNinjiaRun,为了节约成本，采用cocos2d-x来开发。目前只有我一个程序（兼职美术和策划）

## 初始化工作

新建好项目之后，打开终端，运行：

```cpp
git init
git add .
git commit -m 'first commit'
```

这样我的项目就纳入Git版本管理了。

接下来，我需要添加一个.gitignore文件，用来忽略掉一些不想被Git管理的文件，比如编译过程中产生的Obj和libs文件，以及一些用户相关的配置文件，另外还有mact系统下面恶心的.DS_Store文件。

```cpp
touch .gitignore
vim .gitignore
```

然后添加一些忽略规则进去：(规则里面支持正则表达式）

```cpp
.DS_Store
objs/
libs/
[Dd]ebug/
[Dd]ebug.win32/
```

## 功能开发

首先，游戏当然是开发核心玩法，即游戏原型制作。这个原型可能后面会被丢弃，或者被借鉴一部分。总之，这只是我的一些测试性idea。所以，这里当然要用分支(topic分支)啦。

```cpp
git checkout -b prototype
//do some coding
git commit -m 'finish featrue1'
//do some coding
git commit -m 'finish feature2'
```
注：这些分支存在的时间不会很长，实现功能以后就要合并到主分去，并且删除之。

当然，在原型实现的过程，可能还会遇到一些临时性的想法，还可以继续开分支，然后做完以后，如果ok就合并到prototype，如果不行，就丢掉。
合并我会用到下列命令:

```cpp
git merge test_feature3 prototype
git branch -d test_feature3
```

如果是丢掉这个分支里的内容，可以先切换回原来的分支，然后强制删除新的分支：

```cpp
git checkout prototype
git branch -D test_feature4 (注意这里需要用大写的-D)
```

这里我的原则就是，commit early and commit often. 同时尽量保持每一个commit做的事情单一。 如果要保持版本库的历史记录好看，在合并特性分支到主分支的时候，除了使用merge，还可以使用rebase，比如:

```cpp
//假调当前我在一个test_feature9上面
git rebase prototype  （或者使用rebase -i来整理commit log）
```

因为我们经常commit，就有可能导致有时候一些commit log写得不完整或者不清楚。有时候也可能导致一个功能可能被拆分到多个commit里面去了。这时候要使用rebase或者使用--squash的方法来整理git commit log。这一点，可以参考[这篇文章](https://sandofsky.com/blog/git-workflow.html)。

如果有时候在写代码的时候，忘了要切分支去弄了。可以先用git stash save xxx来保存工作区的内容，然后新建 一个分支并调用git stash pop就可以把刚刚的patch应用到新分支上面。

如果对于commit的log格式有特殊要求的，还可以编写钩子程序，用一些正则表达式来检查commit消息的格式是否正确。这样可以防止某些人在commit的时候写一些无用的commit log。

至于一个产品更细致的分支的艺术，请[参考此文](http://nvie.com/posts/a-successful-git-branching-model/)

## 使用Git作为个人项目管理的好处

分支可以让我编写代码的时候更自信，因为我完全不用担心自己的代码会不会破坏已有的代码。同时，由于我经常commit，这样我即使犯错，回滚的成本也很低。再次，它让我在项目过程中更愿意去尝试一些新的idea。我现在写代码要是没有Git，我写半个小时，心里就开始发慌了。因为代码量一多，我就感觉自己要hold不住了。
另外，如果自己不小心在test的时候，犯了错误 ，引起了bug。这个时候，你不清楚是哪一行代码修改导致的问题。可以尝试使用git bisect工具来找出有问题的commit记录。这个工具最近帮了我一个大忙，感谢Git！

## 结语

本文主要介绍我日常中用到的一些基本的Git命令，当然还有git reset, git clean等命令没有涉及到。
作为一个21世纪的程序员，如果还没有用Git和Github，那就真的Out了。
其中很多常用命令都被我重定义了，比如git简化为g，commit简化为cm。总之，怎么简单怎么来，更多配置信息可以查看Github上面的[gitconfig](https://github.com/andyque/dotfiles/blob/master/.gitconfig)

## 推荐阅读：

  * [一个成功的Git分支模型](http://nvie.com/posts/a-successful-git-branching-model/)

  * [git workflow](https://sandofsky.com/blog/git-workflow.html)

