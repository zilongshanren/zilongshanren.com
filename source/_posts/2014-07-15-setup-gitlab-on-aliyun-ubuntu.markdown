---
author: 0owen
comments: true
date: 2014-07-15 14:06:19+00:00
layout: post
slug: 'setup gitlab on ubuntu aliyun'
title: 阿里云ubuntu12.04搭建自己的gitlab
wordpress_id: 489
categories:
- Git
tags:
- Gitlab
- aliyun
---

 
<!-- toc -->

我对Github太爱了，但是它的私有仓库要钱，而且是每个月7美金，对于一个上有老下有小的屌丝来说，还是能省则省吧。
况且，我不是有一台阿里云的服务器么，我完全可以自己搭一个Gitlab嘛！
有人可能会说，直接搭一个Git服务器就行了嘛，分分钟搞定的事。（确实，我之前也搭过。）
但是，如果只是搭建一个Git服务器会有很多弊端：

1. 多人开发一个项目的时候，没办法做Code Review（而使用Gitlab可以发pull request的时候做Code Review）

2. 不好与CI服务器集成。

3. 权限管理不方便

4. Hook使用不方便

5. 没有issue系统，wiki系统

**温馨提示：搭建Gitlab的过程非常艰辛，要阅读非常长的英文文档，而且中途N多坑。准备尝试之前，请一定要做好心理准备，保护好自己的键盘(因为安装过程你可能有100次想砸电脑的冲动)。切记！**

<!-- more -->
其实我很早就想搭建一个自己的Gitlab服务器了，但是一直没狠下心来。（说白了就是懒嘛。）

## 阅读官方文档

如果你想安装**最新版本的Gitlab**，请一定要[阅读官方文档](https://github.com/gitlabhq/gitlabhq/blob/master/doc/install/installation.md)。因为Gitlab社区比较活跃，版本更新比较快，网上的很多教程基本都会过时。所以，切记一定要阅读官方文档 ，博主在这里被坑了！

不得不提一下，官方文档可能也有坑，不过不要紧，配置完以后，一定要记得执行下面一条命令来检查你的Gitlab是否配置好：

```cpp
sudo -u git -H bundle exec rake gitlab:check RAILS_ENV=production
```

我们看到这个命令前面有sudo -u git -H，建议大家直接使用Git用户登录vps，然后直接运行

```cpp
bundle exec rake gitlab:check RAILS_ENV=production
```

其实官方文档里面所有的命令，都可以采用类似的方式来弄。避免后面出现权限问题，博主在这里浪费了大量的时间。

## 遇到的问题汇总

### Unicorn服务起不来

解决办法：手动杀死进程

```cpp
netstat -tulpn | grep :8080 tcp 0 0 127.0.0.1:8080 0.0.0.0:* LISTEN 16429/unicorn.rb -E
ps aux | grep cupsd
kill -9
```

### gitlab内部错误

- **We're sorry, but something went wrong. gitlab**

解决办法：
运行命令：

```cpp
bundle exec rake gitlab:check RAILS_ENV=production
```

检查所有的错误，然后根据提示去fix all！

### 不能保存工程

- **gitlab Can't save project. Please try again later**

解决办法：

```cpp
安装 redit server:
http://www.91r.net/ask/16274837.html
https://github.com/gitlabhq/gitlabhq/issues/5967

安装redis如果还不能解决:
chmod 777 -R tmp
chmod 777 -R public
chmod 777 -R log
```

### 不能发送邮件

- **不能发送邮件**

```cpp
http://blog.fizyk.net.pl/blog/configure-gitlab-with-smtp-mail-server.html
https://github.com/gitlabhq/gitlabhq/issues/5596
```

### 提示输入密码

- `git push -u orgin master`的时候提示输入密码

其它是权限问题啦，不过下面的链接也可以看看。
[http://zeusyu.com/blog/gitlab-problem.html](http://zeusyu.com/blog/gitlab-problem.html)

### 权限不足

- remote: error: insufficient permission for adding an object to repository database

```cpp
注意使用 ls -l /home/git 来查看owner是否为git:git。
如果不是，需要使用chown -R git:git /home/git
```

## 官方FAQ

[官方常见问题解答](https://github.com/gitlabhq/gitlab-public-wiki/wiki/Trouble-Shooting-Guide)

## 心得体会

虽然整个搭建过程无比之艰辛，几乎占用了我一天的时间，但是最后搭好了，还是很开心滴。最后，如果你买的是512M的乞丐版阿里云，建议一定要升级至1024M内存，同时创建sawpfile，大小1G就够了，否则跑不动就只能呵呵了。

最后，应大家的要求来几张效果图吧：

![gitlab_login](https://zilongshanren.com/img/gitlab_login-300x273.png)

![gitlab_repo](https://zilongshanren.com/img/gitlab_repo-300x116.png)

## Reference

[https://www.digitalocean.com/community/tutorials/how-to-set-up-gitlab-as-your-very-own-private-github-clone](https://www.digitalocean.com/community/tutorials/how-to-set-up-gitlab-as-your-very-own-private-github-clone)
[https://blog.huhamhire.com/topics/technic/servers](https://blog.huhamhire.com/topics/technic/servers)
[http://www.pwhack.me/archives/installation_of_gitlab.html](http://www.pwhack.me/archives/installation_of_gitlab.html)
[https://blog.huhamhire.com/viewpost-1120.html](https://blog.huhamhire.com/viewpost-1120.html)
