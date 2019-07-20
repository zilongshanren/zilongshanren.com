+++
title = "programmer tests"
lastmod = 2019-07-20T09:17:48+08:00
tags = ["programming"]
categories = ["programming"]
draft = true
author = "zilongshanren"
+++

<https://medium.com/@kentbeck%5F7670/programmer-test-principles-d01c064d7934>


## Focus on test principles {#focus-on-test-principles}

1.  test should be fast. 一般来说一份钟以内的测试反馈周期就比较好，如果太长了，就会影响程序调试代码
2.  test should be deterministic. 测试覆盖要全，不能测试代码考虑不周全，结果测试过了，并不能反应真实的情况。
3.  test should be predictive. 测试过了，那么代码跑起来应该没有问题。不能测试过了，软件还是有问题，那么这样的测试就是有问题的
4.  test should be sensitive to behavior changes not to structure changes.如果我的程序代码非常依赖代码的执行顺序，那么我设计的代码就非常有问题。
5.  test should be cheap to write.  programmer don't be paid by tests. Code
    should be working and can be changed. less effort on test is better.
6.  programmer's test should be cheap to read.  test code is also code, it read
    more than write.
7.  programmer's test should be cheap to change.
