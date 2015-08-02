---
author: 0owen
comments: true
date: 2014-06-19 13:42:20+00:00
layout: post
slug: 'make-your-own-vim-weapon'
title: 打造属于自己的Vim神器
wordpress_id: 261
categories:
- Vim
tags:
- vim
---

 
<!-- toc -->

## Why Vim?

为什么要使用Vim？

让我们先看看其他人怎么说：

<blockquote>
  Vim or Emacs就好比倚天和屠龙，得一可得天下。

  Vim就像学钢琴一样，一旦学会，终身受益无穷。  

  <!-- more -->
</blockquote>

这些话都是出自vim高手之口，对于Vim新手，可能暂时没办法体会。而我使用Vim也有一段时间了，肯定不能算是高手，但至少也是一个熟手。

我现在主要使用Vim来编写c/c++、js、lua代码,我觉得非常方便，比Xcode和Eclise都强（调试部分可能相对弱一点）。当然，我还使用Vim来修改其它文档，比如Html、XML、文本文件等。现在我正在使用Vim书写本篇博文，非常酷，非常爽！

我转成Vim党的感受，一句话：

<blockquote>
  Vim streamline my daily workflow and boost my coding productivity.
</blockquote>


现在，我客观地说明一下Vim的一些好处：

  * 跨平台、支持N（N>40)种编程语言

  * 可安装各种插件，也可以编写自定义的插件，编辑器功能可无限扩展。

  * 配合Git管理Vim配置和插件,可极大地提高编辑器的适配性

  * 小巧、安装方便、开源、免费

  * 可打造出属于自已的个性化IDE工作环境，提高生产率

## Why not Vim?

为什么不使用Vim？

可能有以下几种声音：

  * Vim过时了，用Vim就是找虐，别装比了，专心学好数据结构与算法吧。

  * 我是Java党，我只用Eclipse，也能安装各种插件。我是.Net党，我喜欢强大的VS,也有牛比的插件（如VC助手)

  * 我是果粉，我喜欢Xcode的优雅，也是免费的，有苹果罩着，LLVM代码补全用着超爽。

  * 我也知道用Vim或者Emacs很强大，但是学习曲线真的很陡，我还是老老实实用我的IDE吧。

  * 我在用TextMate、Notepad++、Sumbline text 2，我用着很爽，这些也是神器，我不需要Vim。

我在这里不去说现代的IDE有什么不好，或者Vim相比于这些IDE来说有哪些优点。我知道这样说，又马上会引起一场语言之争，编辑器大战出来。其实，真的是没必要去纠结用什么开发工具,也没必要纠结用什么语言。

只是我觉得程序员天生就是用来折腾的。有牛人讲过一句话：

<blockquote>
  每年学习一门新的编程语言，而且这门语言跟你之前熟悉的语言关系越远越好
</blockquote>

现在，我也呼吁一下吧：从现在起，学习一门新的文本编辑工具Vim，它跟你之前所用到的编辑器体验完全不一样。它的Modal Editing是独一无二的，程序员值得拥有。而且你不用每年换一个编辑器，因为你只需要一个Vim编辑器。你越了解它，越使用它，就越会对它爱不释手。

让我们一起来折腾吧！Vim, the Killer! Oh~Ye.:)

## How to make Vim as an IDE?

<blockquote>
  Know the saw, then sharpen it.
</blockquote>

很多人不使用Vim的原因很简单，除了不习惯它的Modal Editing之外，更多的是觉得它算不上一个IDE。但是，稍微对Vim有过了解的朋友都知道，Vim是可以被打造成一个IDE的，而且是专门属于自己的IDE。

为什么要使用IDE，请看[此贴](http://stackoverflow.com/questions/208193/why-should-i-use-an-ide)

博客园的池建强写了一系列的博文《谁说Vim不是IDE》（[一](http://www.cnblogs.com/chijianqiang/archive/2012/10/30/vim-1.html)、[二](http://www.cnblogs.com/chijianqiang/archive/2012/10/31/vim-2.html)、[三](http://www.cnblogs.com/chijianqiang/archive/2012/11/06/vim-3.html)、[四](http://www.cnblogs.com/chijianqiang/archive/2012/12/17/vim-4.html)。）有兴趣的朋友可以去看看，看完后你会发现，原来Vim也可以变成IDE。：）

关于如何把Vim打造成一个IDE，只要你现在随便谷歌一下，你肯定能找到一大堆贴子。但是，由于Vim历史悠久，有许多贴之已经过时了。

其中最主要的变化有:

  * 有些插件有新的替代插件了（因为站在巨人肩膀上的缘故）

  * 安装和管理插件的方式变了，以前是手动复制相应目录和文件，现在改为插件管理器+Github了。

  * 有些插件已经不推荐使用了

但是，Vim社区总是很活跃的。目前，已经有牛人把最新的Vim配置方式分享出来了。我找到了3篇，大家可以参考一下。（不过都是英文哦）

  * [ Vim, The Killer ](http://oblita.com/blog/2012/08/30/vim-the-killer/)

  * [Vim as your IDE](http://haridas.in/vim-as-your-ide.html)

  * [Vim as a python IDE](https://github.com/mbrochh/vim-as-a-python-ide)

其实可以列举的还有很多，国内也有许多优秀的Vimer，欢迎你们推荐优秀的设置Vim为IDE的教程或者文章，Thanks.:)

## Recommended plugins

没有安装插件的Vim算不了什么，但是，一旦安装好插件，Vim立马就牛比了。这里，作为一名cocos2d-x游戏程序员，我给大家推荐一些插件，关于插件的用法，大家可以查看help文档，我这里就不赘述了。

### Basic plugins

[Pathogen](https://github.com/tpope/vim-pathogen):该插件用来管理Vim的插件，可以让插件的安装与卸载更加方便。配合Github和Submodule效果更佳。（2014-6-19号更新:现在我用Vundle了，更方便。）

[NerdTree](https://github.com/scrooloose/nerdtree):该插件会生成工程目录树

[TagBar](https://github.com/majutsushi/tagbar):该插件生成函数、变量列表。之前有一个插件叫TagList，我觉得那个有点不好用，推荐TagBar

[UltiSnips](https://github.com/SirVer/ultisnips):类似TextMate的snippets，之前有个插件叫SnipMate，这个基于SnipMate，比SnipMate要强很多。强烈推荐。

[vim-commentary](https://github.com/tpope/vim-commentary.git):注释代码的插件。

[syntastic](https://github.com/scrooloose/syntastic):保存文件时检查语法的插件。

[fugitive](https://github.com/tpope/vim-fugitive.git):方便在Vim里面使用Git的插件。

[vim-colors-solarized](https://github.com/altercation/vim-colors-solarized):Vim颜色配色方案。

[ctrlp](https://github.com/kien/ctrlp.vim.git)：搜索目录下的文件，类似功能的插件有Comment-T，我喜欢ctrlp，因为它不依赖于ruby，且是轻量级的.

[delimitMate](https://github.com/Raimondi/delimitMate.git):成对生成(),{},[]

[vim-surround](https://github.com/tpope/vim-surround.git)：给文本添加“外套”，呵呵，试试就知道有多强大了。

[supertab](https://github.com/ervandew/supertab):让tab键可以飞起来。

[a](https://github.com/vim-scripts/a.vim):让cpp文件在.h和.cpp文件中切换。

[buferexplorer](https://github.com/vim-scripts/bufexplorer.zip):方便浏览buffer的插件。

[clangComplete](https://github.com/oblitum/clang_complete):自动代码补全的插件，比OmniCppComplete好N多，速度有一点影响。不过配合neocomplcache，加上这个版本，效率还不错。

[neocomplcache](https://github.com/Shougo/neocomplcache):关键字补全、文件路径补全、tag补全等等，各种，非常好用，速度超快。

[neocomplcache-clang](https://github.com/osyo-manga/neocomplcache-clang_complete):解决clang_complete和neocomplcache的冲突。

[ TagHightlight ](https://github.com/magic-dot-files/TagHighlight):根据生成的Tag文件，高亮类、变量、函数和关键字。

### Bonus Plugins

[bufkill](https://github.com/oblitum/bufkill.git):让nerdTree在最后一个buffer窗口关闭时，不让其缩放。

[vimprj](https://github.com/oblitum/vimprj):方便管理工程相关的vim配置。参考如何设置Vim为IDE中的第一篇E文。

[vim-unimpaired](https://github.com/tpope/vim-unimpaired):一些不错的配置，可以让[]发挥奇效。

[vim-powerline](https://github.com/Lokaltog/vim-powerline):超有爱的状态栏。

[vim-textobj-line](https://github.com/kana/vim-textobj-line):文本对象插件，可以操纵当前行。

更多插件，可以到我的Github上面去查看。可以从本博右上角Fork Me on Github处进入。当然，如果各种Vimer有什么好的插件，也欢迎推荐给我。

## Troubleshootings

这部分主要记录我在打造神器的过程中遇到的一些问题：

  * Vim版本最好用gvim或者macvim，然后从源码编译最好。最好是支持python,ruby,cscope等,大部分vim发行版本都是支持这些特性的。

  * 使用Excubert-ctags和[DoctorJs](https://github.com/mozilla/doctorjs)来生成tag文件，配合cscope效果好。如果是mac用户，自带的ctags不管用，需要用homebrew或者macport来安装

  * 配置pyclewn时，安装需要指定Editor和home设置。运行的时候，如果要让GDB支持tty，还需要重新安装GDB，最好是homebrew或者macport来安装。安装好之后，要给gdb添加codesigning。

  * windows版本下有些配置可能不太一样，特别是vimrc文件的配置，跟*nix系统不太一样。可以考虑用has(win32)之类的代码来区分vimrc配置。这样可以让vim运行在多个平台上。

## Further Reading

强烈推荐阅读：[《Practical Vim》](http://pragprog.com/book/dnvim/practical-vim)

推荐视频网站三个：[Vimcasts.org](http://www.vimcasts.org/),[essential vim plugins](http://net.tutsplus.com/sessions/vim-essential-plugins/)和[Derek Wyatt's Blog](http://www.derekwyatt.org/vim/vim-tutorial-videos/)

国内站点推荐三个：[vimer世界](http://www.vimer.cn/),[易水的博客](http://easwy.com/blog/archives/advanced-vim-skills-catalog/),[水木清华社区](http://www.newsmth.net/bbsdoc.php?board=VIM)

最后推荐一个vimrc设置技巧网站[vimbits](http://www.vimbits.com/),这个网站会选出最流行的vimrc配置，大家可以时不时去上面淘金。当然，如果你发现好用的vimrc配置，也记得一定要分享出来啊。社区需要你！

## References

Google + Wiki. :)
