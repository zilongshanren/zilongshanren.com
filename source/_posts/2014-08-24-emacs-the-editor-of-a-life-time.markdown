---
author: 0owen
comments: true
date: 2014-08-24 02:23:16+00:00
layout: post
slug: 'emacs the editor of a life time'
title: Emacs, The Editor of a Life Time
wordpress_id: 351
categories:
- Emacs
tags:
- emacs
---

* table of contents
{:toc}

最近看了一个关于Emacs的视频，视频的标题为[The Editor of a Life Time](https://www.youtube.com/watch?v=VADudzQGvU8)。一个程序员，使用Emacs 31年了，不得不说让人很震撼。认识我的朋友都知道，我之前是一个不折不扣的Vim党，也写过一篇《打造属于自己的Vim神器》，可能还有一些朋友看了这篇文章和文中的视频，受到了一些鼓舞，于是开始接触并认真学习Vim。可是，我怎么这么快就“叛变”了呢？！且听我慢慢道来。
<!-- more -->



# 与Emacs结缘



我是从去年10月份接触Emacs的，之前只是耳闻有这么一个编辑器，很多人鼓吹它是“伪装成编辑器的操作系统”。而且，作为一个Vim党，肯定要维护党派利益。当我的同事（一叶道长）向我极力推荐Emacs的时候，我当时是这么说的，“你演示一下Emacs牛比的操作给我看看”。看完后，我还是觉得Emacs很一般，因为同样的任务，如果我使用Vim来做的话，明显比他使用Emacs要快很多。而且那种虐人的快捷键，别说记住了，就是用手去按，小拇指也会很酸痛的。可是，Vim党只需要把大写键映射成Ctrl键，然后用Ctrl-[，而不是Esc来切换模式，最后把Leader键映射成逗号，把常用的快捷键换成Leader开头。这样左右手的工作量就均衡了，并且Vim的Modal Editing还会让人敲键盘上瘾（不是传销，真的），写代码更持久！

后面，我们每一次下班回家都会争论Vim和Emacs孰优孰劣，哈哈，程序员的通病。我跟他大谈特谈"The Art of Vim"，他就跟我鼓吹“只有你想不到，没有你做不到”。就这样，折腾了一周，后面我们都有点动摇了，他想学点Vim，而我也想尝试一下Emacs了。反正就是试一下嘛，如果不合适，不用就是了，又不会损失什么。但是，Vim的Modal Editing一下子是很难适应的，所以，道长最后还是没有用上Vim。而做为Vim党，本来记快捷键就很厉害的我，最后踏入了Emacs的“深坑”。



# Org-mode和GTD



因为当时我看道长使用Org-mode来做任务管理，感觉比较新鲜，只要几个快捷键就可以把一个任务从"TODO"变为"Done"，很不错。之前我用Vimwiki也做过任务管理，但是跟Org Mode比起来显然就差远了。于是，我向道长请教Org Mode，因为我当时完全是Emacs菜鸟，所以，它当然只教了我C-c C-t（用来切换任务状态的，如果我没记错的话，这个快捷键应该是TODO<->Done来回切换）。后面我听他说Org Mode非常强大，特别是GTD。于是我开始Google GTD，后面就一发不可收拾。刚开始是Org Mode做简单的每日任务管理，后来是GTD和写博客，再到现在的Org Habit。现在我每天几乎都在用Org Mode，一方面实践GTD，另一方面可以让自己养成好的习惯。Org Mode真的是领先了Vim一大截，虽然后面也有Vimer把Org Mode移植到Vim，但是功能差远了。而且，也有很多非软件开发人员使用Emacs，为的就是它的Org Mode，可见其影响力和强大威力。



# EVIL和Prelude



虽说Emacs的Org Mode很强大，但是作为一个Vimer，如果自己编程的时候没有使用Modal Editing就会感觉浑身不自在（比如我给Xcode安装了XVim，给VS安装了vsVim,给Eclipse安装了vrapper,甚至给浏览器也安装了Vimium）。我的日常编程工作，随处可见是Vim。当时我的状态是，大部分时候使用Vim，做任务管理使用Emacs的Org Mode。但是如果Emacs只能用来做任务管理，有点杀鸡用牛刀的感觉。另外，切换程序本来就是影响工作效率的一件事。Vim和Emacs都追求编辑文字的时候手不离键盘，不要去碰“菜单”和“鼠标”，尽量让所有的事情都在编辑器里面完成。所以，我开始寻找能否在Emacs里面运行Vim。我是幸运的，现在的Emacs有一个[EVIL mode](http://www.emacswiki.org/emacs/Evil)，它几乎模拟了80+的Vim的功能。它的强大超过了之前提到的所有插件（XVim,vsVim,vrapper等）。并且，我对于EVIL有完全的控制权，我可以通过Lisp来扩展它。于是我决定把Emacs作为我主要的编辑工具，我开始用Emacs写代码，写博客，做GTD，运行Git，Shell，远程登陆等。

当时，我还看到有个大神，写了一篇文章[像神一样使用编辑器](http://blog.binchen.org/posts/yi-nian-chen-wei-emacs-gao-shou.html)。很多EVIL相关的插件都是他移植的,他也是一个非常热心的人，经常活跃在G+的Emacs版块。他的文章里面提到了一点，要站到巨人的肩膀上。于是我开始尝试使用这位大神的配置（因为他也使用EVIL嘛），不过用了几个月后，发现不是很对我的胃口，我换了现在的[prelude](https://github.com/bbatsov/prelude)配置。大神的配置有一个好处是，它的快捷键都是精心设计的，这样不仅方便使用，还方便记忆。另外，大神的配置会对常用的一些编程任务所需的mode和配置做一些优化，毕竟这些是Emacs的前辈，跟着他们的脚步肯定错不了。如果某些mode和快捷键，自己在用的过程中觉得不适合，随时可以优化，自己去改配置就是了。



# 使用Vim和Emacs的体会



Vim和Emacs我都使用了一年（如果算上Emacs和各种其它编辑器里面使用Vim，那Vim算两年好啦）了，现在我大致谈一谈我对于Vim和Emacs的感受。当然，这些只是我的个人观点，不喜勿喷。

使用Vim前几周是折腾灭人性的模式切换和各种模式下的命令，不过一旦适应，就如鱼得水。接下来几个月是苦苦寻找各种插件和配置，东拼西凑，打造属于自己的屠龙宝刀。然后理解Vim的精髓之后，会删除很多无用的插件，追寻Vim本身的高效。慢慢的，由于Vim本身的局限性，我使用它最多的场合可能是服务端端管理，还有就是临时打开一些文件做简单的修改。大部分时候还是会用IDE+Vim模拟器来做开发工作。因为Vim的调试和工程管理确实不尽如人意，虽然我也折腾过很多方案，但是依旧不给力。（不过脚本开发，Rails,Python，js和web开发，还是有很多人使用Vim的。）不管怎么说，Modal Editing是独一无二的，也是一旦学会就终身受益的。

使用Emacs前几周则是折腾Ctrl,Meta,Super,Shift的各种组合，对于一个Vimer来说，肯定是无法接受的。所以，我很快就给Emacs加上了EVIL，然后大喜，我现在有一个更强大的“Vim”了。不过有些Mode还是emacs的，所以还是得对Emacs的一些快捷键做了解和熟悉。可能是因为之前自己折腾了大半年Vim的缘故，我入手Emacs感觉并没有那么难。Emacs用着用着，感觉不爽了，马上切换到.emacs.d下去，修改一下配置，然后c-x c-e执行一下立马生效。如果某个快捷键的作用不记得了，或者某个函数的快捷键忘了，都可以用c-h f/k来轻松得到，这个真是太爽了！



# 结语



如果你是一个Vim党，如果你想尝试一下Emacs，可以看看这些文章：
1. [How to learn Emacs](http://sachachua.com/blog/2013/05/how-to-learn-emacs-a-hand-drawn-one-pager-for-beginners/)
2. [emacs-as-my-leader-vim-survival-guide/](http://bling.github.io/blog/2013/10/27/emacs-as-my-leader-vim-survival-guide/)

如果你还在选择使用Emacs和Vim之间徘徊，那么可以先学Vim，再学Emacs。（上面的文章1也是这么建议的）

如果你只喜欢IDE和Sublime Text，我也建议你看下Emacs，除了快捷键比较多，其实真的不难。而且很多时候直接输命令就是了，不一定要去记快捷键。更重要的是，我们可以随时查看每个major mode下面的快捷键。

可能你会问：为什么要学习Vim或者Emacs？借用文章开头视频里面提到的一句话：专业的程序员会自己制作工具，而Vim和Emacs就是可以让你自己定制和不断打磨的工具。另外，习惯的力量是巨大的，一万小时定律，对于Vimer和Emacser来说，肯定是成立的。

不管是Vim还是Emacs，它们讲究的都是使用一个编辑器干完所有的事情。它们各有所长，不过现在，我觉得Emacs+EVIL才是完美的编辑器,并且我会使用它一辈子。

最后的最后，送大家一句话：The only way to truly master something is stick to it. 与诸君共勉。

现在，我管自己叫Vimacser :)

欢迎大家加入Vimacser。
