+++
title = "《a little java a few patterns》读书笔记"
date = 2019-07-06T14:29:00+08:00
lastmod = 2021-12-04T20:54:04+08:00
tags = ["reading"]
categories = ["reading"]
draft = false
author = "zilongshanren"
+++

这本书其实看完有一段时间了，今天来做个总结。在此之前，想为该作者 Friedman 的其他书籍打个广告，我目前看过《The Little Schemer》----神书，看完（并实践完）能让你对递归有更深的理解，同时还能学习一门 Lisp 方言。

<!--more-->


## 本书主要内容 {#本书主要内容}

如果你去豆瓣看看书评，有人会说，本书好评（客套话），全篇只讲了一个东西，就是
Visitor 模式！！！（浅显的认知）另外，Visitor 模式本身的价值可能也被大多数 OO 程序所忽略了，这可能也是作者为什么从那么多模式里面单挑了 Visitor 来讲的原因。

作者在序言中提到，OO 编程语言可以让程序员构建可复用的代码组件，在理想的情况下，程序员不需要修改现有的代码，只需要在现有代码框架下面编写胶水代码和添加新功能的代码。但是这样设计良好的 OO 代码太难得到了，需要有很强的“编程自律”（discipline of
programing）

为什么选择 java 来讲解这些模式，是因为 java 这门语言简单，OO but not like cpp，同时提供了 GC，可以让程序员不用太担心内存问题，而只需要集中精力在程序设计上面。（我猜想也可能是 java 程序员多，用 java 这本书会好卖一点，毕竟 javascript 跟 java 没有一毛钱关系，也要趁个 ip）

谈设计模式，只提 Visitor，这显然不合理。因为我们知道 GOF 的设计模式可是有 24 个，分为创建型，行为型和结构型三大类，是 OO 编程语言的内功心法，易筋经，谈 java，必谈设计模式。所以，这可能是本书书名的由来。Orz

但是，作者意图显然并不止于此，作者更多的是从编写可重用组件的角度来讲 OO 模式的。

OO 领域有 SOLID 五大原则：单一职责原则，开闭原则，里氏替换原则，依赖倒转原则和接口隔离原则。作者把它对 pattern 的理解写成了一系列的 advice。我这里把这些 advice 总结一下，作为本书的内容精要吧。


## Advice 1： 使用抽象类进行数据类型建模 {#advice-1-使用抽象类进行数据类型建模}

`When specifying a collection of data, use abstract classes for data types and
extended classes for variants.`

（我的理解：下文同，故会省略）

OO 是不喜欢函数指针的，继承和多态可以消除函数指针，实现动态 Dispatch。同时抽象类可以让模块之间依赖减少，多种不同的派生类负责具体的业务逻辑。这里讲的应该是
datatype 的可自由组合，你可以把 datatype 跟乐高作对比，每一个 datatype 就是乐高积木的一个形状。


## Advice 2：使用派生类来扩展数据类型 {#advice-2-使用派生类来扩展数据类型}

`When writing a function over a datatype, place a method in each of the variants
that make up the datatype. If a field of a variant belongs to the same datatype,
the method may call the corresponding method of the field in computing the
function.`

里氏替换原则里面要求，派生类必须完整实现父类定义的接口，否则父类和派生类就不是可以随意替换的。如果派生类的数据成员被其他派生类所共有，通常情况下会在实现子类方法的时候调用父类的实现。（即调用 super.methodXXX())。这一层，讲的是 datatype 的可替换性，这个类似乐高里面的点槽，形状一样，点槽不一样的积木是没办法自由组合的。


## Advice 3：函数返回值使用 new 创建的对象 {#advice-3-函数返回值使用-new-创建的对象}

`When writing a function that returns values of a datatype, use new to create
these values.`

这里（敲黑板）就不再是简单的 OO 原则了，而是 FP 原则。尽量减少副作用（Side Effect），同时返回新的对象还可以实现链式调用，增强 OO 函数的可组合性。函数的参数是 datatype，返回值也是 datatype，这样就可以自由组合了，达到最大限度的灵活性（注意：datatype 必须是抽象的）


## Advice 4: 使用访问者模式来扩展类 {#advice-4-使用访问者模式来扩展类}

`When writing several functions for the same self-referential datatype, use
visitor protocols so that all methods for a function can be found in a single
class.`

通常，我们会选择直接给一个类添加方法来进行扩展。如果业务有变化，我们就新建子类并在子类中覆盖父类的实现来完成功能扩展和定制。但是，如果我们把某一个方法抽象成一个类，然后该类型子类所有的实现都可以聚集在一个 class 中。如下图的代码所示：

{{< figure src="/ox-hugo/visitor1.png" >}}

因为类型是可以参数化的（还记得吗？多态），所以，原本的方法抽象成类以后，我们就拥有了更强大的可组合性。另外，再多提一点，把所有子类型判断是不是 Vegetarian 都放在一个类中，其实也有利于功能内聚，很多 OO 模式（状态模式，命令模式，策略模式）关注的也是用 Class 去封装行为，而不只是封装数据。


## Advice 5 is mising {#advice-5-is-mising}

因为书里面没有写。


## Advice 6: 构建具有类型结构的 visitor {#advice-6-构建具有类型结构的-visitor}

`When the additional consumed value change for a self-referential use of a
visitor, don't forget to create a new visitor.`

每一组方法（这组方法是为该 datatype 所有的派生类准备的）抽象成一个类以后，这些类可以组成一个类的继承结构，每一个派生类都是一个 Visitor。

{{< figure src="/ox-hugo/visitor-2.png" >}}

这个就是我们的 visitor 模式的示意图了。到这里，我们基本上可以了解 visitor 模式是怎么演化过来的了。其实本来是没有什么模式的，大家都按照这样的设计原则去设计程序，最后就变成了我们熟悉的模式了。


## Advice 7: 设计 visitor 协议时考虑共享同一个基类 {#advice-7-设计-visitor-协议时考虑共享同一个基类}

`When designing visitor protocols for many different types, create a unifying
protocol using Object.`

当为许多不同类型设计 Visitor 时，尽可能统一协议，即采用 Object 作为每个 Visitor 方法的参数。因为 Java 里面所有的对象都是从 Object 派生过来的，这样子设计的 visitor 实际上扩展性是更强了。但是，这也会遇到一些向下转型（downcasting)的问题，需要使用运行时的类型信息做一些额外的处理。


## Advice 8：设计子类时尽量使用重载，保证父子类型可以替换 {#advice-8-设计子类时尽量使用重载-保证父子类型可以替换}

`When extending a class, use overriding to enchrich its functionality.`

当扩展一个类的时候，使用覆盖（overriding) 的方式来增强其功能。这里其实也是呼应前面提到的抽象类和子类的概念，利用 OO 的多态实现功能扩展。OO hierarchy between
datatypes 和 OO hierarchy between datatype's method groups，这里 visitor 类，更像是一个个高度抽象化的函数，对比函数式编程（FP），函数是可以自由组合的，只要签名一样，函数还可以自由替换。


## Advice 9: 设计扩展良好的 visitor {#advice-9-设计扩展良好的-visitor}

`If a datatype many have to be extended, be forward looking and use a
constructor-like (overridable) method so that visitors can be extended, too.`

如果一个数据类型需要被扩展，那么也需要同时考虑 visitor 是否可以兼容这种扩展。最好是使用可以被 override 的方法，这样 visitor 的子类型就可以覆盖这些方法。


## Advice 10: 尽可能使用 visitor 模式来解耦代码 {#advice-10-尽可能使用-visitor-模式来解耦代码}

`When modifications to objects are needed, use a class to insulate the operations
that modify objects. Otherwise, beware the consequences of your actions.`

当必须要对一个对象进行修改的时候，不要每次都直接在该对象的类型上添加一个方法和若干数据成员来解决。可以考虑，是否可以通过添加一个 visitor class 来解决。因为 visitor
的方式可扩展性更强，如果直接添加方法可以解决问题，并且后续需求变化不需要频繁对该方法进行修改，那么就没有必要引入 visitor，反之，则需要使用 visitor 来解耦代码。


## 总结 {#总结}

这 9 个 advice，包含了 visitor 模式的演化思路和 OO 设计思想的基本原则，聚焦在可复用面向对象软件设计“套路”上，通过 OO 提供的多态，把原本类方法拆分成一组带有类型结构信息的
visitors，提高了代码的灵活性和可复用性。学会了这个模式，以后你的 OO 代码就不再是：几个巨无霸类 + 一堆单例 + 一个 MVC 框架的祖传代码了。

这样，我们离完美世界也就不远了：

添加新功能不需要修改现有代码，只需要编写一些新的 class 和胶水代码。而 Reason 代码的时候，也不会被复杂的 Context 所吓到，只需要 Focus 到某个具体业务场景下。
