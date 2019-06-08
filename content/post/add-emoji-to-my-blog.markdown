---
title: 给Octopress添加Emoji支持
date: 2015-07-03
comments: true
categories: [ Blog]
---

我非常喜欢emoji，所以，我决定给自己的博客也添加emoji支持。

Update: Saturday, October 15, 2016

目前 emoji 的功能已被我折腾 hexo 给废了，这篇博客仅供参考。

<!--more-->

添加Emoji支持:question: 
-------------
添加Emoji支持主要参考[这篇文章](http://nguyenhoan1988.github.io/blog/2014/09/30/adding-emoji-to-octopress/)

1. 给Gemfile添加gemoji,然后运行`bundle install`来安装gemoji。（注意修改成淘宝的gem镜像。）

2. Copy `emoji.rb`到你的博客的plugin目录。emoji.rb文件可以从[这里下载](https://github.com/chriskempson/jekyll-emoji).

3. 修改_config.yml, 在文件最后添加 `emoji_dir: /images/emoji`

4. 从[gemoji](https://github.com/github/gemoji)仓库下载所有的emoji，并把 `images/emoji` 中的文件移动到`source/images/emoji`中

5. 修改`sources/_includes/article.html`中的{content}为{content \| emojify}:

6. 往_styles.scss 文件中添加以下css:

```css
.emoji {
  box-shadow: none;
  border: 0;
  height: 20px;
}
```

现在就配置完了. :+1: :laughing: 

配置Spacemacs :smiling_imp:
---------
Spacemacs中集成了一个`emoji` layer, 开启之后可以用 `SPC i e`和`SPC a E`来往buffer里面插入emoji.:cool: 

![screenshot](https://zilongshanren.com/img/emoji-screenshot.png)

小结:dog: 
----

大家快来试试吧！:stuck_out_tongue_winking_eye: 

