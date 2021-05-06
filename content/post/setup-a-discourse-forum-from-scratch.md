+++
title = "从头开始搭建 Discourse 论坛"
date = 2021-03-07T20:29:00+08:00
lastmod = 2021-03-07T20:29:40+08:00
draft = false
author = "zilongshanren"
+++

## 前言 {#前言}

在国内安装 Discourse 论坛其实是一件挺困难的事情,因为网络不太好，而且 Github 访问经常会抽风，导致安装非常容易失败。所以，想要尝试在国内 VPS 安装 Discourse 的同学，一定要准备好梯子，并且掌握 Linux 命令行代理配置技巧，否则不建议你尝试，基本是浪费时间。


## 搭建步骤 {#搭建步骤}


### 申请 VPS {#申请-vps}

如果你是新用户，那么申请腾讯云的活动机器是非常划算的，一年只需要 90 元，非常适合用来搭建论坛和个人博客。


### 申请域名 {#申请域名}

申请域名各个托管平台都可以，一般哪家便宜就用哪家呗。我看腾讯的域名首年只要 1
块钱，真是白菜价啊。


### 备案 {#备案}

有了 VPS 如果要使用国内的云服务器，你需要备好案，这样域名才可以绑定云主机并开始你的业务。备案过程比较复杂，这里就不细说了，一般按照云服务商的指引去弄即可。按照我以前的经验，备案需要准备很多资料，而且通常要 1-2 个月，还是非常折磨人的，好歹这个过程一般只需要做一次。


### 配置国内源 {#配置国内源}

有了 vps 之后，第一步就是设置国内源，使用 vim 打开 /etc/apt/sources.list，然后粘贴以下代码：

{{< highlight nil >}}
deb http://mirrors.tencentyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.tencentyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.tencentyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.tencentyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.tencentyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.tencentyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable
{{< /highlight >}}

如果购买的是腾讯云，这些设置是自动 ok 的，也可以忽略不管，只不过你需要验证下。备案好源以后，执行一下 `apt-get update` 更新一下。


### 安装 Docker {#安装-docker}

  安装 docker 的过程也还算比较简单，可以参考知乎[^fn:1]这个文章。注意安装完以后，需要设置一下，主要是代理和 MTU.
代理主要是修改 `/etc/default/docker/`:

{{< highlight nil >}}
 DOCKER_OPTS="--dns 8.8.8.8 --dns 8.8.4.4"
# If you need Docker to use an HTTP proxy, it can also be specified here.
export http_proxy="http://127.0.0.1:7890/"
{{< /highlight >}}

  接下来是修改 MTU 设备：打开文件 `/lib/systemd/system/docker.service`:
  找到这个文件里面的 `ExecStart=/usr/bin/dockerd -H fd://`
把它修改为： `ExecStart=/usr/bin/dockerd --mtu=1400 -H fd://`

当然，还需要配置下 Docker 的国内源[^fn:2]。

修改完成以后，运行一下 `service docker restart` 重启一下就生效了。


### 重新编译支持 openssl 的 Git(非常重要) {#重新编译支持-openssl-的-git--非常重要}

使用脚本来安装[^fn:3]，最好是有梯子，否则 Git 源码下载会非常慢，甚至失败。如果你不重新编译 Git, 默认 Git 使用的是 GNU TLS 来握手，会导致即使你有代理也会拉取仓库失败。

常见的错误主要是下面两个，这些都是由于 GNU TLS 引起的：

> gnutls\_handshake()

<!--quoteend-->

> Clone failed RPC failed; curl 56 GnuTLS recv error (-54): Error in the pull function.


### 安装 Discourse {#安装-discourse}

具体的安装步骤网上一搜一大把，大家可以优先选择更新日期比较近的文章来参考。我一般喜欢参考 DigitalOcean 网站的指引，非常的详细，这里有一份翻译版本[^fn:4]。安装 Discourse 的过程比较简单，网络好，梯子给力的话，基本一次就能成功。如果失败，看看失败原因，去 Google 一下基本也都能找到解决方案。按照本文介绍的踩坑指南来弄，基本是不会失败。

注意在 contaienrs/app.yml 中添加 `templates/web.china.template.yml` 来添加 ruby
国内镜像，否则在后面的 `./launcher rebuild app` 的时候容易失败或者速度极慢。

{{< highlight nil >}}
templates:
  - "templates/postgres.template.yml"
  - "templates/redis.template.yml"
  - "templates/web.template.yml"
  - "templates/web.china.template.yml"
#- "templates/web.ratelimited.template.yml"
## Uncomment these two lines if you wish to add Lets Encrypt (https)
#  - "templates/web.ssl.template.yml"
#  - "templates/web.letsencrypt.ssl.template.yml"

## which TCP/IP ports should this container expose?
## If you want Discourse to share a port with another webserver like Apache or nginx,
## see https://meta.discourse.org/t/17247 for details
expose:
  - "25653:80"
#- "80:80"   # http
#- "443:443" # https
{{< /highlight >}}

如果要在 vps 上同时安装 Disourse 和个人博客等多个论坛，需要安装 nginx ，同时配置一下网站转发规则，具体参考这两篇文章[^fn:5]<sup>, </sup>[^fn:6]。


### 配置邮件系统 {#配置邮件系统}

邮件系统我选择的是 MailGun ，这个邮件提供商配置简单，并且收费比较便宜，对于用户量不大的论坛足够用了，可以限制一个用户每天接收的邮件数量，一般我是设置为 2 封。像之前 emacs-china 有 4k 的用户，一个月不到 2 美元，还算是比较实惠的。


## 总结 {#总结}

本人最近在搭建一个游戏开发者学习论坛，虽然之前已经有 Emacs-China[^fn:7] 的安装经验了，但是还是折腾了特别久。主要就是 Git 不是 openssl 导致的问题，一直拉取 github 仓库失败，希望本文能够帮到有需要的人。

[^fn:1]: <https://zhuanlan.zhihu.com/p/106186391>
[^fn:2]: <https://juejin.cn/post/6844904111582740493>
[^fn:3]: <https://github.com/paul-nelson-baker/git-openssl-shellscript/blob/main/compile-git-with-openssl.sh>
[^fn:4]: <https://blog.csdn.net/cukw6666/article/details/108080756>
[^fn:5]: <https://meta.discourse.org/t/running-other-websites-on-the-same-machine-as-discourse/17247>
[^fn:6]: <https://blog.khophi.co/install-run-discourse-behind-nginx-right-way-first-time/>
[^fn:7]: www.emacs-china.org
