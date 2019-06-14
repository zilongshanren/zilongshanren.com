+++
title = "博客从 hexo 迁移到 hugo"
lastmod = 2019-06-14T08:02:16+08:00
tags = ["blog", "hugo"]
categories = ["blog"]
draft = false
author = "zilongshanren"
+++

## 为什么又迁移博客 {#为什么又迁移博客}

熟悉我的朋友可能会发现，我几乎每隔一段时间都会换一个博客平台 :joy:

从最早的Wordpress到Octopress，再到Hexo，最后到如今的Hugo，博客没写多少，博客平台却折腾不少。

每一次折腾完后，我都会写下一篇类似的文章，讲我的迁移过程，而且似乎每次都声称这是最后一次折腾Blog了 :joy:

因为我自己是个不折不扣的工具控，可能天生就爱折腾。

<!--more-->

而这一次折腾Blog的主要原因有几点：

1.  Hexo生成文章的速度不如Hugo，可能要慢好几倍。虽然我的博文数量不多，但是已经明显感觉到差异了。
2.  hexo里面使用Org-mode写博客的流程没有ox-hugo这么爽，hugo天生对org文件支持，之前hexo写博客需要把org导出成HTML。
3.  我希望给我的静态博客添加评论功能。之前使用过『有言』，『多说』，『disqus』等第三方评论平台，但是出于各种原因都用不了了。 这次我把目光转向了基于Github的评论插件，而Hugo配置这些插件真的非常简单。

迁移完后，我表示非常满意。因为我发现插入并显示emoji和图片都非常得舒服。作为一名
Emacs党，什么都想在Emacs里面完成。

配合ox-hugo插件，写博客简直不要太爽。它可以自动把org文件里面的每一个subtree转换成一个md文件（即一篇文章），在保存org文件的时候会把修改自动同步到md文件。

打开 hugo 的 watch 功能，可以实时更新博客在浏览器里的预览效果。


## 如何迁移 {#如何迁移}

关于如何迁移，网上随便一搜都有好多文章，我这里就不详细讨论了。

具体如何迁移可以参考以下文章：

-   《从 Hexo 迁移到 Hugo》[^fn:1]

-   《把博客生成工具从 Hexo 迁移到 Hugo --- 配置与设置》[^fn:2]

我主要把我是怎么迁移的大致步骤记录一下：

1.  安装 Hugo 并配置 Even 主题，同时新建一篇博文测试一下显示效果。
2.  迁移博文。因为我自己之前的博文结构比较复杂，有从wordpress迁移过来的markdown文件，有手写的markdown文件，有org-mode文件，还有HTML（主要是由org文件导出的）。对于HTML文件，直接copy过来就可以使用了，这个问题不大。如果是手写的markdown文件，copy到hugo的时候，会发现有些设置hugo不支持，可能会导致预览出错。我们需要做的就是删除这些无效的tag，比如我的header里面使用了 -- series，这些是不支持的。网站包含的静态资源(比如图片等)只要从hexo同步到hugo的static目录即可。
3.  另外，hugo的日期格式跟hexo也不太一样，多个tag和category的语法也不一样，如果你发现博文显示的日期，tag和category不正常，就需要关注这个了。
4.  配置站点的基本信息：站点名称，你的个人信息（Github，博客，邮箱等），这些都是在config.toml里面设置的。你还可以像我一样配置两个赞赏的二维码。(大家可以参考一下我的config.toml
    配置)
5.  配置About页面和LearnEmacs页面，这个只需要在Content目录新建两个文件夹，然后在文件夹里面分别放置两个index.md文件。最后在config.toml里面设置这两个页面就可以了。

    {{< highlight sh >}}
    [[menu.main]]
    name = "LearnEmacs"
    weight = 15
    identifier = "emacs"
    url = "/LearnEmacs/"

    [[menu.main]]
    name = "About"
    weight = 50
    identifier = "about"
    url = "/about/"
    {{< /highlight >}}
6.  关于评论系统，even主题默认支持3种评论系统，我这里选择的是 utterances，因为这个评论系统对你的Github仓库要求的权限最少，同时配置也非常简单。首先参考
    <https://utterances.es/> 安装app到你的github帐户。然后新建一个public仓库，把这个仓库的信息配置到config.toml里面即可。

    {{< highlight sh >}}
    [params.utterances]       # https://utteranc.es/
    owner = "zilongshanren"              # Your GitHub ID
    repo = "zilongshanren.com"               # The repo to store comments
    {{< /highlight >}}
7.  一键部署到我的VPS，我使用的是Rsync.

    {{< highlight sh >}}
    hugo --theme=even --baseUrl="https://zilongshanren.com"
    hugo && rsync -avz --delete public/ root@112.124.58.18:/var/www/octopress-cn
    {{< /highlight >}}


## 迁移后写博客工作流 {#迁移后写博客工作流}

1.  使用Emacs打开Org文件，然后把希望写的Blog建一个subtree，并把这个文件设置成TODO。设置成TODO的item默认是不导出的，而是作为草稿存在，但是我们可以在本地预览草稿的效果。可以设置文章的tag和category。tag直接使用org的tag就行，而category则是前面加@符号的tag，如下图所示:
    ![](/ox-hugo/category.png)
2.  当你完成博客以后，可以把TODO状态改成DONE状态，这个时候ox-hugo会为这篇文章新建一个发表日期，也就是你完成这篇文章的日期。
3.  上面的截图功能也非常方便，使用我自己写的一个elisp函数，使用M-x调用就可以在
    Emacs里面截图了。mac上面使用很爽，截图完以后会用imagemagick进行resize，所以需要安装一下
    imagemagick。下面是我的Elisp代码，默认截图是放在当前目录的，当你save org文件的时候，ox-hugo会帮你copy到你的博客路径下面去。

    {{< highlight emacs-lisp >}}
    (defun zilongshanren//insert-org-or-md-img-link (prefix imagename)
      (if (equal (file-name-extension (buffer-file-name)) "org")
          (insert (format "[[%s%s]]" prefix imagename))
        (insert (format "![%s](%s%s)" imagename prefix imagename))))

    (defun zilongshanren/capture-screenshot (basename)
      "Take a screenshot into a time stamped unique-named file in the
      same directory as the org-buffer/markdown-buffer and insert a link to this file."
      (interactive "sScreenshot name: ")
      (if (equal basename "")
          (setq basename (format-time-string "%Y%m%d_%H%M%S")))
      (progn
        (setq final-image-full-path (concat basename ".png"))
        (call-process "screencapture" nil nil nil "-s" final-image-full-path)
        (if (executable-find "convert")
            (progn
              (setq resize-command-str (format "convert %s -resize 800x600 %s" final-image-full-path final-image-full-path))
              (shell-command-to-string resize-command-str)))
        (zilongshanren//insert-org-or-md-img-link "./" (concat basename ".png")))
      (insert "\n"))
    {{< /highlight >}}

4.  那ox-hugo怎么知道你的博客位置呢？答案就在org文件的头部信息中：

    {{< highlight sh >}}
    #+hugo_base_dir: ~/zilongshanren
    #+hugo_section: post
    #+hugo_auto_set_lastmod: t
    #+author:
    #+hugo_custom_front_matter: :author "zilongshanren"
    #+hugo_code_fence: nil
    {{< /highlight >}}

    这里面要注意，我的博客路径是 ~/zilongshanren， even主题在设置author的时候，需要使用上面的组合，否则会出现hugo渲染不出博文报错。
5.  最后，我还编写了 prodigy service， 可以非常方便地在Emacs里面启动 hugo 的
    watch server。同时，我还编写了org capture template，可以非常方便地记录一些
    Blog的想法。


## 总结 {#总结}

  Emacs是我的主力开发工具，Org mode又是一个几乎找不到替代品的Killer app，Hugo生成静态博客非常快速，我感觉再也找不到比这个更舒服的写作平台了。

Emacs Rocks~

[^fn:1]: <https://scarletsky.github.io/2019/05/02/migrate-hexo-to-hugo/>
[^fn:2]: <https://jdhao.github.io/2018/10/10/hexo%5Fto%5Fhugo/>
