---
title: "Bash使用心得"
date: 2014-12-14
comments: true
categories: 
- bash
---

 
<!-- toc -->


由于前段时间一直在做Bash和Makefile脚本的编写，所以，本文主要是记录一些Bash使用心得.
有人可能会问了，现在Python这么流行，完全可以用来取代Bash呀。理论上是没错，但是Bash脚本有它自己独特的优点，
比如编写简单，功能强大（主要指的是与管道命令和其它命令行程序结合起来使用）,特别适合用来制作一些"简单"的自动化处理任务脚本。
很多时候，我宁愿用shell而不想编写python，因为shell实在是太方便啦。

<!-- more -->

## The Big Picture
编写bash脚本，简单来说就是编写一个批处理程序，这个程序里面的语句都可以在终端里面直接运行。比如我们熟知的“新建文件”(touch filename)，
“删除文件”(rm filename)，“增删改文件夹”(mkdir/rm -rf/mv  folername)等命令都可以直接写到bash脚本中。

一个简单的bash脚本一般是以.sh为后缀，但这个不是必须的。我们只需要在我们的脚本文件的最顶端写上下面的语句即可：

```cpp
 #!/bin/sh
```
接下来所有的语句都会按照shell的语法来解释执行。

一个简单的Hello World示例如下：

```cpp
 #!/bin/sh
echo "Hello World"
```

如果我们把此段脚本保存为ex01.sh，那么我们可以直接通过在终端运行以下命令来执行它:

```
./ex01.sh
```

不过在运行此脚本之前，我们还需要赋予它可执行权限.

```cpp
chmod +x ex01.sh
```

如果你是一个命令行重度用户，你会发现编写shell脚本相当得心应手。它可以辅助我们完成一些重复性的任务，而我自己经常也用它们来制作一些命令行小工具。

shell脚本本身的语法还是一点怪异的，不过只需要注意几点，多写几段程序就可以适应了。

shell脚本最强大的还是与管道与现有命令行工具整合起来一起使用，威力相当大。理论上你掌握的命令行工具越多，你编写shell脚本能够完成的工作也就越多.

## Basic syntax
关于shell的基本语法，我就不在这里赘述了。大家可以参考[Learn X in Y minutes](http://learnxinyminutes.com/docs/bash/)，也可以读一读[Bash Programming Intro](http://tldp.org/HOWTO/Bash-Prog-Intro-HOWTO.html#toc1)
中文入门可以读[shell 快速入门](https://laoyur.com/?p=638).

需要注意的一点就是，“空格”在bash里面非常重要。如果使用不当，就会报错.

比如下面两行代码:

```cpp
foo="bar"
foo ="bar"
```

第一条语句是把"bar"这个变量字符串赋值给foo，而第二条语句是会直接执行foo这个命令。一般来讲，就会直接报错，说foo不是一个有效的外部命令。

另外还有在if语句和while等语句里面，如果在[]的两侧忘记添加空格，也是会报语法错误的。

总的来说，shell的语法是很简单的，我们只需要掌握一些基本的顺序选择循环语句怎么编写就差不多了，大部分时候我们会编写一些函数来做模块化分割，主要是为了方便编写更复杂的shell程序。

有时候，为了完成一个特定的功能，我们可能需要编写好几个shell程序，然后让它们相互调用来完成功能。此时就涉及到不同shell脚本之间如果传递数据的问题了。

一般可以通过命令行参数和export变量来传递。而命令行参数则于$1-$n来表示，export导出变量只能向下传递，不能向上传递.

一般建议少用export导出变量来传递数据，因为这样会污染bash的环境变量.

另外，我们在~/.bash_profile里面定义的export变量，默认在shell初始化的时候会全部导出，任何在此shell环境中执行的shell脚本都可以访问和操作这些变量.

接下来，主要是记录一些常用的tips.

## Tips and tricks
本小节主要记录一些小的Tips.

### Parse Command Options
Method1:

```cpp
while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        --help | -h)
            build_show_help_message=yes
            ;;
        --platform | -p)
            build_platform=$VALUE
            ;;
        --libs)
            build_library=$VALUE
            ;;
        --arch | -a)
            build_arches=$VALUE
            ;;
        --mode | -m)
            build_mode=$VALUE
            ;;
        --list | -l)
            build_list_all_libraries=yes
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done
```

Method2:

```cpp
while getopts "hvsk:a:l:" OPTION
do
     case $OPTION in
         h)
             usage
             exit 1
             ;;
         v)
             VERBOSE=yes
             ;;
         s)
             PLATFORM=Simulator
             ;;
         k)
             SDK_VERSION=$OPTARG
             ;;
         a)
             ARCH=$OPTARG
             ;;
         l)
             OPTIONS=--enable-$OPTARG
             ;;
         ?)
             usage
             exit 1
             ;;
     esac
done
```

### Use Sed, Awk and Grep

- 使用sed可以完成文件文本的查找与替换：


下面是把xxx.txt里面的xx替换成yy，同时生成一个xxx.txt.bak文件。

```
sed -i .bak 's/xx/yy/g'  xxx.txt
```

我们可以看到，这里的's/xx/yy/g'和vim里面的替换命令是一模一样的。

关于sed的入门，推荐大家看[这篇文章](http://robots.thoughtbot.com/sed-102-replace-in-place)

- 使用awk方便操作具有column结构的数据和文本

这里，我也推荐[一篇文章](http://www.hcs.harvard.edu/~dholland/computers/awk.html)

- 使用grep查找特定目录里面包含自定义正则表达式的文件

关于grep的使用，也推荐[一篇文章吧](http://www.uccs.edu/~ahitchco/grep/)

这三个命令使用的频率特别高，特别是在做文本查找和文本字符串处理的时候。当然，还有perl使用的机会也比较多，以后有时间也要好好学习一下。

### Use Various command line tools
常用的shell命令有以下几种:

```cpp
sort
find
tail
head
xargs
cat
touch
```

通过组合这些命令与前面提到的awk, grep等命令，我们可以在命令行里面完成非常复杂的操作。

比如:

```cpp
find  ../contrib/src -type f | grep SHA512SUMS | xargs cat |
awk 'match ($0, /.tgz|.tar.gz|.zip|.tar.xz/) { print substr($2,0,length($2)-RLENGTH)}'
| grep -i xxx | awk '{print $1}'

```

上述这段脚本是查找当前目录的上一级contrib目录下面的src文件夹下面包含字符串"SHA512SUMS"的文件，然后查找这些文件里面包含(.tgz, .tar.gz, .zip 和.tar.xz)的字符串，并把这些字符串中名字包含xxx的打印出来.

### Use Man page, Google and SO
因为Linux系统下面的命令行工具实在是太多了，如果我们要精通每一个命令行工具的所有用法和参数，这几乎是不可能完成的任务。
所以，善于利用man命令来实时查找特定命令行工具的用法，这一点太重要了。

当然，有时候面对密密麻麻的man page，我也经常找不到解决方案。这个时候，google和stackoverflow就能大显神威了。特别是stackoverflow，在编写shell脚本的过程中，我遇到的90%的问题都是通过它来解决的。

### Debugging
调试可以通过设置以下语句：

```
set -x
```

也可以用最简单的打印+exit来调试,业内有一种说法叫“二分调试法”，指的是在出问题的程序段里面，采用类似二分查找的方法来打印一些关键变量的值，用以判断程序执行程序及逻辑是否正确。


```
echo 'xxx' && exit
```

## Reference

- [Bash programming Introduction](http://tldp.org/HOWTO/Bash-Prog-Intro-HOWTO.html#toc1)

- [Advanced shell programming](http://www.tldp.org/LDP/abs/html/index.html)

- [Bash快速入门](https://laoyur.com/?p=638)
