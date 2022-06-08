+++
title = "配置全新的 macbook pro M1 环境"
date = 2022-06-08T22:29:00+08:00
lastmod = 2022-06-08T22:40:22+08:00
draft = false
author = "zilongshanren"
+++

## 准备工作 {#准备工作}

拿到一台全新的 Macbook Pro M1, 第一件事情就是先更新一下系统，保证一些常用的软件环境是最新的。

**比如苹果在最新的系统版本 12.3 的时候移除了对 python2.7 的支持，但是我的电脑在没有更新的时候还是有 python2.7 环境的，更新系统之后 python2.7 被移除了。**

如果你不更新系统，有可能在下一次更新系统的时候依赖 python2.7 的一些设置会失效。（比如我自己依赖一个命令行工具 percol[^fn:1] 就因为更新系统的时候挂掉了,我不得不重新使用 pyenv 来安装 python 2.7.18)


## 安装开发环境 {#安装开发环境}

因为配置开发环境每次做的事情都差不多，需要使用脚本来自动化。对于一些细节，可以写文章记录一下。


### 1.安装最新的 xcode 和 command line tools {#1-dot-安装最新的-xcode-和-command-line-tools}

安装 Xcodes 可以直接去 AppStore 安装，安装命令行工具可以使用以下命令：

{{< highlight sh >}}
xcode-select --install
{{< /highlight >}}


### 2.安装命令行工具 {#2-dot-安装命令行工具}

主要是安装以下命令行工具：homebrew, oh-my-zsh, fasd, ripgrep, fd, coreutils,cmake
因为每次换电脑都需要做这些操作，所以我自己弄了一个安装脚本，放在我的 [dotfiles](https://github.com/zilongshanren/dotfiles) 仓库，具体的安装脚本放在 install.sh 中。


### 3.安装 percol {#3-dot-安装-percol}

因为我非常喜欢 percol, 所以需要安装 python2.7, 然后使用 pip 来安装 percol

{{< highlight sh >}}
  brew install pyenv
#注意在安装完pyenv 后需要修改 PATH
#export PATH="${HOME}/.pyenv/shims:$PATH"
  pyenv install 2.7.18
  pyenv global 2.7.18
  pip install percol
{{< /highlight >}}


### 4.安装 Emacs {#4-dot-安装-emacs}

注意不要直接从 [emacs-mac-port](https://github.com/railwaycat/homebrew-emacsmacport/releases/tag/emacs-28.1-mac-9.0.1) 去下载编译好的 emacs, 首先是因为它无法正常向 chrome 浏览器请求 apple events[^fn:2].
使用 homebrew 来安装 emacs-mac:

{{< highlight sh >}}
brew install emacs-mac --with-modules
{{< /highlight >}}

如果你要使用 emacs-rime 输入法，也是推荐使用 homebrew 来安装，因为编译 emacs-rime 需要一个头文件 emacs-module.h,
如果你是使用 M1 的 mac 来安装，这个头文件的地址是 **/opt/homebrew/Cellar/emacs-mac/emacs-28.1-mac-9.0/include**,
详情请参考这个帖子[^fn:3]


## 配置 Emacs {#配置-emacs}


### 1.clone 配置文件 {#1-dot-clone-配置文件}

`git clone https://github.com/zilongshanren/emacs.d ~/.emacs.d`

{{< highlight sh >}}
git submodule init
git summodule update
{{< /highlight >}}


### 2.配置 path 环境变量 {#2-dot-配置-path-环境变量}

如果你使用的是 zsh, 并且你也安装了 exec-path-from-shell 插件，你需要注意的是，默认这个插件读取的配置文件是 `~/.zshenv`
在这个配置文件里面，只需要存放 PATH 相关的设置，不要放其他设置，这个会影响你的 Emacs 的启动速度。

{{< highlight sh >}}
export LANG='en_US.UTF-8'
export LC_ALL="en_US.UTF-8"

export PATH="/usr/local/sbin":$PATH
export PATH="${HOME}/.pyenv/shims:$HOME/.emacs.d/bin:$PATH"
export PATH="/Applications/Emacs.app/Contents/MacOS/bin/:$PATH:/opt/homebrew/bin:/Users/lionqu/Library/Python/3.8/bin:~/.cargo/bin"
{{< /highlight >}}


### 3.配置 hugo 写作环境 {#3-dot-配置-hugo-写作环境}

使用 homebrew 来安装

{{< highlight sh >}}
brew install hugo
{{< /highlight >}}


### 4.配置 vterm {#4-dot-配置-vterm}

安装 vterm 需要依赖 cmake, 如果你没有安装需要提前安装一下。


### 5.配置 emacs-rime {#5-dot-配置-emacs-rime}

参考 github 上面的安装指令即可，这里要注意的是要指定 emacs-module.h 的位置

{{< highlight emacs-lisp >}}
(setq rime-emacs-module-header-root "/opt/homebrew/Cellar/emacs-mac/emacs-28.1-mac-9.0/include")
{{< /highlight >}}

之前我的配置在 Intel 芯片的 MacbookPro 上的启动时间大概在 2s 左右，现在同样的配置时间是 1s 左右 性能也提升了不少。

{{< figure src="/ox-hugo/emacs-init-time.png" >}}


## 总结 {#总结}

新的 M1 的续航是真的👍，使用了 2 个小时，电池才消耗 10%左右，而之前的 intel 芯片的 MacbookPro, 两个小时直接快没电了。

目前还没有尝试 gcc emacs, 后面得空了再看看 gcc emacs 的性能表现。后续还会对比下 lsp 比如 eglot 在不同的 Mac 下的性能表现.

[^fn:1]: <https://github.com/mooz/percol>
[^fn:2]: <https://github.com/xuchunyang/grab-mac-link.el/issues/1>
[^fn:3]: <http://localhost:1313/post/setup-macbook-pro-m1/#fn:2>
