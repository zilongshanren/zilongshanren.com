---
layout: post
title: "A bite of Python"
date: 2014-09-21 21:22:46 +0800
comments: true
categories: python
---

 
<!-- toc -->

周五的时候，我的一个朋友让我帮忙写一个小工具。这个小工具要完成的功能如下：

1. 指定方差与均值，生成相应的随机数，默认生成一组随机数(默认为10个)
2. 使用生成出来的随机数，重新计算方差和均值，如果方差和均值在指定的误差范围内则接受
3. 生成带有固定格式的Excel表格
4. 均值、方差、误差等可以配置，且可以同时提供多组数据输入

我当时想到的第一个是C++，因为C++11支持[根据均值和方差生成随机数](http://en.cppreference.com/w/cpp/numeric/random/normal_distribution),
另外C++是我最熟悉的语言。

但是后来想到要生成excel，我就放弃了。不是因为C++做不了，而是太麻烦。最后，我考虑选择用Python.（虽然我Python不是很熟。）

但是问题来了，我从来没有使用Python生成过Excel，也不知道Python里面怎么根据方差和均值生成随机数分布。

本文主要是记录一下，自己在面对不熟悉的领域的时候，自己思考问题和解决问题的过程,希望对读者能有启发。

<!-- more -->

## Research Stage
首先是调研阶段。我认为调研阶段，最重要的是寻找解决问题的关键点，很显然，本任务的关键点有两点:

- Python怎么根据输入的均值与方差生成一组符合要求的随机数

- Python怎么操纵Excel

- Python怎么解析Json(数据配置我准备用Json)

另外，由于我的Python语法记得不是很清楚了，所以我要快速地温习一下。幸好，我们有[Learn X in Y minutes](http://learnxinyminutes.com/docs/python/).
如果你对一门语言已经比较了解了，想使用其它语言来快速上手开发一些小程序，使用Learn X in Y minutes是非常不错的选择。

通过Google搜索之后，我发现可以使用下列函数生成一个随机数:

```python
random_number = random.gauss(mean, stddev)
```

另外，使用下面两个函数，可以计算list的均值和方差:(random_list里面装了一些服从高斯分布的随机数:)

```python
generated_mean = numpy.mean(random_list)
generated_stddev = statistics.stdev(random_list)
```

最后，生成Excel，我发现可以使用xlwt。但是经过试用以后，发现python2.x不支持Unicode，于是我果断选择了python3.4.
但是，我还是要回过头去确认在python2.x里面能用的一些模块是否已经移植3.x了。最后，我发现xlwt这个库改名字了，叫做[future-xlwt](https://github.com/goinnn/xlwt-future). 调研阶段会进行一些小的程序测试，比如生成一些demo excel，主要是解决“合并单元格”，“编辑公式”和“背景上色”的一些操作。这个过程也是耗时比较久的，后面的实现过程就比较直白了.

## Implementation Stage

因为这个小工具的是没有什么算法的，主要的数学上的计算都可以借助Python的numpy和statistics模块来完成。

我在实现阶段可能经常要做的就是查询一些API和一些操作的实现方法。这里StackOverflow + Google绝对是神器，几乎99%的问题，我都在上面找到了答案。我很难想象，如果断网，我根本无法完成这个任务。

不过这里有一个小技巧，搜索问题的时候尽量使用英文，且搜索关键字要能切合主题。

另外，编写Python的过程中，使用一个好工具也是非常重要的。像Emacs的实时语法检查和代码提示功能，对我写Python有很大的帮助.

这个阶段我主要完成的是核心算法，即程序的主体。（此时Excel表格是生成好的）

## Tweak Stage
这个阶段做的事情，主要是封装一些函数, 完成此小工具要求的其它功能。 第一点是Excel表格的样式，这个还是费了我不少时间的。因为指定颜色的时候，Excel使用的ColorIndex，但是我根本不知道哪个ColorIndex对应哪个颜色值。我希望能够用RGB来指定Excel单元格的背景色。

我搜索时使用的关键词为:

> xlwt excel cell background color rgb

然后，我搜索到了[python-xlwt-set-custom-background-colour-of-a-cell](http://stackoverflow.com/questions/7746837/python-xlwt-set-custom-background-colour-of-a-cell)

另外一个就是读取Json，于是我又搜索之:

> python3 json from file

我得到[parsing-values-from-a-json-file-in-python](http://stackoverflow.com/questions/2835559/parsing-values-from-a-json-file-in-python)，测试之后，发现Python解析Json真是太TM简单了。

最后，把一些细节完善一下就ok了。整个过程大概花了我周六一下午加一晚上的时间。

## Delivery Stage
在真正交付这个工具给我的朋友之前，我肯定还需要下一点功夫。因为他是一个Windows用户，所以，我肯定要把Python脚本打包成Exe吧。这样他只需要提供一个Json文件作为数据输入，然后双击exe就可以生成excel了。
幸好Python3也提供了打包的工具，[cxfreez](http://cx-freeze.readthedocs.org/en/latest/distutils.html)

最后，我发现在打包完成之后，双击运行说找不到xlwt这个module。解决办法是下载github上面的[xlwt-future](https://github.com/goinnn/xlwt-future)，然后手动用`python setup.py install`安装好。

再配合一个打包脚本，install.py:

```python
import sys
from cx_Freeze import setup, Executable

build_exe_options = {"packages" : ["xlwt"]}

setup(
    name = "On Dijkstra's Algorithm",
    version = "3.1",
    description = "A Dijkstra's Algorithm help tool.",
    options = {"buil_exe" : build_exe_options},
    executables = [Executable("main.py", base = "Win32GUI")])
```

至此，这个小工具的制作就算全部完成了。一共耗时大概在12个小时，也算是有蛮长时间啦。

## Conclusion
从一知半解的Python理解到最后12小时的努力，最终还是完成了这个任务。感觉Python写代码确实太爽了，难怪很多Python党会说"人生苦短，我用Python".

如果使用传统的C++，然后调用Window的API去生成Excel，那估计没个1-2天时间是搞不定了。

本工具最后的[源代码](https://gist.github.com/andyque/1e31c404ff8440f49713)

## Reference

- [How to generate random numbers in Python](http://effbot.org/pyfaq/how-do-i-generate-random-numbers-in-python.htm)

- [Learn X in Y minutes](http://learnxinyminutes.com/docs/python/)

- [Unofficial windows Python installer](http://www.lfd.uci.edu/~gohlke/pythonlibs/#cx_freeze)

- [Pack python to exe:  cxfreez](http://cx-freeze.readthedocs.org/en/latest/distutils.html)

- [xlwt-future for python 3.x](https://pypi.python.org/pypi/xlwt-future)

