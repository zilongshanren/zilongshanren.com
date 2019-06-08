---
comments: true
date: 2014-06-19 14:23:44+00:00 +08:00
slug: 'setup-wordpress-blog'
title: 搭建wordpress博客
wordpress_id: 267
categories:
- Wordpress
tags:
- wordpress
---

 
<!-- toc -->

更新：（2016-10-15）
**目前我已经使用 hexo 来搭建静态 blog，使用 org + emacs 来写博客，所以 wordpress 已不推荐。**

## 前言

写这篇博客的目的主要有两点：

  * 备忘录。自己前后折腾过几次wordpress，每次折腾起来都要耗费半天时间。

  * 给wordpress新手一些启发。主要是能让大家少走弯路。

下面，我具体讲一下我的建站过程。

<!-- more -->

## 准备工作

### 购买域名和服务器

我现在用的.cn域名是每年50左右，推荐一次性购买三年以上。（偷偷的告诉你，博主买了十年哦。），服务器用的阿里云的云主机，费用为每个月50块左右 。如果你想拥有自己的服务器和网站，那么大约每个月要从牙缝里面省出55块钱。这点钱对于一个程序员来讲，应该是九牛一毛。千万不要省不得，这是一项[值得的投资](http://peter8015.iteye.com/blog/2077459)。
购买域名推荐[万网](http://www.net.cn/)和[Godaddy](http://www.godaddy.com/)，具体购买过程这个就不啰嗦了。

### 备案

因为是选用的国内的主机，所以备案这个环节是躲不过的。当然也有朋友不想购买国内的主机，可以选择在Github上面用Github Page来搭建自己的博客。说到这里，我再多说两句。我的[英文网站](http://blog.zilongshanren.com)就是托管在Github上面的，采用的[octopress](http://octopress.org/)，我现在主要用Emacs+org-mode来写英文博客，还是挺爽的。
如果是购买的阿里云的主机，记得一定要去阿里云备案（好像有点废话）。如果不备案，到时候wordpress博客搭建好，域名解析是会出问题的。就是你输入服务器ip可以访问网站，但是域名是死活跳不过去的。博主就在这里坑了好久。。
备案的时候至少准备1个月吧，有点耐心吧，具体备案的注意事项阿里云里面有详细说明。如果你填的资料比较敏感，阿里云的客服会打电话给你，教你巧妙地修改来顺利通过管局的审核。

## 阿里云服务器配置

阿里云购买的时候可以选择操作系统，尽量拣自己熟悉的系统选吧。全部是linux系统，不过这难不倒坚强的程序员。服务器刚买来的时候多少是要打磨一下才会比较好用。
因为是阿里云，所以一般的ubuntu装机后的必备操作很多是不需要的，比如更换源这种事。
我主要对服务器做的配置有以下几点：

  * 更新软件包 apt-get update

  * 安装Git

  * 安装Vim，同时使用[我的vim仓库](https://github.com/andyque/dotfiles)一秒钟土枪变神器。

  * [配置ssh](https://gist.github.com/andyque/9290567)，这样客户端访问可以免输密码。因为阿里云的密码要求很严格，那种密码我根本记不住。

至此，对于搭建wordpress博客而言，配置就这些了。（当然，我买服务器不可能只是为了写博客啦，写点游戏服务端程序不是蛮好的嘛！）

## wordpress搭建

我这次搭建wordpress的方案是目前来说比较时髦的方案：LEMP(Ubuntu12.04 + php + nginx + mysql).

具体搭建方案可以参考下面两个链接：[链接一](https://www.digitalocean.com/community/articles/how-to-install-wordpress-with-nginx-on-ubuntu-12-04),  [链接二](https://www.digitalocean.com/community/articles/how-to-install-linux-nginx-mysql-php-lemp-stack-on-ubuntu-12-04)

## wordpress搭建完必做的几件事

这里是重点了。

  * 选择一个喜欢的主题。博主选择是twentytwelve，简洁，我喜欢。

  * 安装必备的插件。

    * Akismet （防垃圾评论神器）

    * All In One SEO Pack （SEO你懂的）

    * Jetpack Markdown (使用markdown写博客）

    * WP Super Cache （优化wordpress的）

    * WPJAM 七牛镜像存储 （cdn加速你的网站访问）

    * UpdraftPlus Backup （可以定期把我的博客和数据库备份到Google Driver上面）

    * Disqus(社会化评论插件，wordpress自带的评论太丑了!!!)
其它还有一些插件，不是很必备，就不罗列了，大家可以去搜索引擎上面找自己想要的插件。建议不要安装太多插件，怕影响网站性能。同时，插件安装以最小满足需求为原则，能不用插件就尽量不用，不要贪大求全。

  * 去除google字体。（这个是必须中的必须啊，否则你的网站访问速度跟蜗牛一样。）具体方法，可以google一下。

  * 配置SMTP，可以通过在服务器里面用apt-get install sendmail就可以了。也可以安装一个插件Configure SMTP。如果不配置，新用户注册或者评论我们是收不到邮件的。

  * 用[百度站长工具](http://zhanzhang.baidu.com/optimization/index)检查一下网站的访问速度，给出一些页面优化建议，并根据这些建议去做一些优化。比如GZip。

  * 定制一些Page和Widget，让网站变得更加美观。

## 杂顶

  1. 设定域名URL重定向
因为我以前一直是用zilongshanren.com这个博客在写文章，现在转到新域名了，很多朋友可能还不知道这个域名。所以，我做了URL转发。你在浏览器里面输入zilongshanren.com会自动跳转到4gamers.cn这个域名。具体做法如下：
修改/etc/nginx/sites-available/wordpress文件（假设你的站点在nginx里面叫wordpress），然后添加下面一段话就好了：

```cpp
server{
      server_name  zilongshanren.com;
      rewrite ^(.*) http://zilongshanren.com$1 permanent;
}
```
最后，只需要把zilongshanren.com这个域名的A记录也解析到阿里云服务器的ip。至于为什么要换域名，因为4gamers = for gamers,比zilongshanren.com好记，简单易输入。

## 遇到的问题

  1. 博客的mysql经常挂掉，[解决办法](http://hongjiang.info/aliyun-vps-mysql-aborting/)

## 结语

最后，别忘了每周都至少更新一篇博客，否则一个月55块白白浪费了呀。如果大家在建站过程中遇到什么问题，欢迎在下方留言，我知道的话一定知无不言。

## 推荐阅读

  * [如何正确配置Nginx+PHP及正确的nginx URL重写](http://blog.csdn.net/zqtsx/article/details/24729485)

  * [nginx泛域名解析并禁止IP访问，禁止多余www.泛域名访问](http://blog.csdn.net/zqtsx/article/details/24657373)

  * [https://rtcamp.com/wordpress-nginx/tutorials/](https://rtcamp.com/wordpress-nginx/tutorials/)

  * [https://rtcamp.com/wordpress-nginx/tutorials/single-site/wp-super-cache/](https://rtcamp.com/wordpress-nginx/tutorials/single-site/wp-super-cache/)

  * [http://wordpress.org/support/topic/working-nginx-rewrite-rules-for-wordpress-multisite-3x-wp-super-cache](http://wordpress.org/support/topic/working-nginx-rewrite-rules-for-wordpress-multisite-3x-wp-super-cache)

