---
layout: post
title: "《Mastering Emacs》读后感"
date: 2015-05-25 21:01:38 +0800
comments: true
categories: Emacs
---

![linua-emacs-talk](http://guanghuiqu.qiniudn.com/linus-talk-emacs.jpeg)

本文主要记录我的《Mastering Emacs》的读书心得，上图取自Google，在《Mastering Emacs》一书第五章篇头有引用。

PS:该书是周六晚上才发布的，目前只有[电子版](https://www.masteringemacs.org/article/my-ebook-mastering-emacs-now-out). 由于该书有点小贵，我在Hick的群里面组织了团购，最后有8人参团，平均每人25。虽然从某种程度算说，这也是盗版。但是，我想说的是，我们尽力了。

<!-- more -->

## 此书与作者博客的关系
介绍Emacs的书本来就很少，在阅读本书之前，我只读过一本[Write GNU Emacs Extensions](http://www.amazon.com/Writing-GNU-Emacs-Extensions-Glickstein/dp/1565922611). 其它大部分时候，我都是在阅读别人的博客和一些starter kit学习和使用Emacs.在作者宣传他要写这样一本书的时候，我立马就订阅了邮件通知。（订阅可以享受20%的折扣，可惜买的时候我并没有使用优惠链接，不过无所谓啦。）

本书所介绍的内容与作者的博客交集很少，大部分内容都是全新的。所以，也算得上是良心之作。不过全书不到280页，对于Emacs这么庞大的系统而言，确实也显得单薄。而epub书的排版也不是非常好，pdf在手机上面勉强可以阅读，但是建议还是用电脑阅读效果会比较好。

这么短小精悍的一本书，一天时间足以阅读完了。实际上，我也是用了一天的时间。当然，我中间有两章是泛读，因为对于我而言，能收吸收的内容不多。最主要的原因还是因为我是Evil用户，而且是有经验的Emacser，书中介绍的内容大多数对我无用。

## 阅读体会
本书在一开始介绍了该书的目标读者主要是初学Emacs或者尝试了多次Emacs未能入教的人。当然，作者也说了，有一定经验的Emacser也能学到一些东西。（我确实学到了一些。）

本书主要分以下四个部分介绍Emacs:

- Emacs专业术语，安装配置Emacs，Ask Emacs the Right Question。 

- Emacs移动理论：介绍了如何移动光标，如何移动窗口，buffer，bookmark, search and index.（我用Evil，所以，我采用的是略读）

- Emacs编辑理论: yank, kill, transpose, align and format text.（我用Evil，所以我采用的是略读）

- Emacs实践：主要介绍了shell, dired, tramp and working with large files.

我认为这里最有价值的就是“Ask Emacs the Right Question.” 作者详细地介绍了如何使用Emacs自带的帮助系统来学习Emacs.

以version control为例：

首先，通过info-apropos，搜索version control，然后可以得到一些info page。然后得知这些命令都是以vc-开头的命令。

然后以apropos-command(C-h a)搜索^vc-,可以列出所有以vc开头的命令。 通过这些命令，可以看到它们的key binding大多数是C-x v开头的，通过输入C-x v C-h可以进一步列出所有以C-x v开头的快捷键组合。

最后可以通过C-h f, C-h v 和C-h k来查看相应的函数，变量和keybinding的值。

本书最后列出了一些不错的博客链接，其中很多链接都是我每天必读的。现在在这里也分享一下：

- [http://sachachua.com/blog/]([http://sachachua.com/blog/])

- [http://irreal.org/blog/](http://irreal.org/blog/)

- [http://endlessparentheses.com/](http://endlessparentheses.com/)

- [http://www.lunaryorn.com/](http://www.lunaryorn.com/)

- [http://batsov.com/](http://batsov.com/)

- [http://kitchingroup.cheme.cmu.edu/blog/](http://kitchingroup.cheme.cmu.edu/blog/)

- [http://planet.emacsen.org/](http://planet.emacsen.org/)

最后，我本人再推荐几个：

- [http://emacsist.com/](http://emacsist.com/) (Hick 维护)

- [http://xahlee.org/](http://xahlee.org/)

- [http://blog.binchen.org/](http://blog.binchen.org/)

- [http://tuhdo.github.io/](http://tuhdo.github.io/)

当然还有该书作者的博客啦： [https://www.masteringemacs.org/](https://www.masteringemacs.org/)

## 结语
作为Emacs领域内为数不多的入门书，我认为Emacser还是有必要读一下的，特别是作者对于"Ask Emacs the Right Question"的讨论， 相信会让你受益匪浅。Happy hacking :)

