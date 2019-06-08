---
comments: true
date: 2014-06-07 13:50:20+00:00 +08:00
slug: jsapi-reference
title: JSAPI用户手册翻译
wordpress_id: 120
categories:
- Javascript
---

 
<!-- toc -->
本文档主要涵盖如何嵌入SpiderMonkey javascript引擎到你自己的c++程序中。

JavaScript在浏览器端已经被广泛使用了。现在，Mozilla的javascript引擎可以被嵌入到任何c++程序中，而不仅仅是应用于浏览器。许多应用程序开发可以通过脚本化的方式获益,这些程序可以使用SpiderMonkey API让c++代码里面跑js代码。

<!-- more -->

## What SpiderMonkey does?

Javascript引擎编译并执行js脚本。引擎本身负责脚本执行时的对象内存分配，垃圾收集等工作。

SpiderMonkey支持Javascript 1.0-1.8版本。Js 1.3以及后来的版本都符合ECMAScript 262-3规范。后面的版本也包含Mozilla扩展，比如数组压缩（array comprehensions）和生成器(generators).SpiderMonkey也支持E4X，但是这个是可选的。

在Javascript的世界里面，我们马上就可以想到许多特性，比如事件处理(onclick),DOM对象，window.open以及XMLHTTPRequest.但是，在Mozilla里面所有的特性都是由另外的组件提供，而不是SpiderMonkey引擎本身。SpiderMonkey引擎本身只提供javascript核心数据类型，比如number,string,array,object等。还有一些常用的方法，比如Array.push。SpiderMonkey还可以让其它程序非常方便地暴露自己程序中的对象和接口给js代码。比如，浏览器暴露的就是DOM接口。（cocos2d-x暴露的是cocos2d-x的接口）。你自己的程序也可以根据脚本的需求来设计待暴露接口。具体由程序开发者自己来决定哪些对象和方法要暴露给脚本。

## Hello World

### Using the SpiderMonkey library

你的程序可以像使用任何其它c++程序库一样来使用SpiderMonkey。如果想从源码构建SpiderMonkey，可以参考[SpiderMonkey构建文档](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Build_Documentation).你也可以把SpiderMonkey当作一个静态库或者动态库集成进来。

有一些平台上面（比如Debian linux）内置了SpiderMonkey包。这样子安装会变得非常容易，但是调试可能会比较复杂。[ XULRunner SDK](https://developer.mozilla.org/en-US/docs/Gecko_SDK)里面也包含一个SpiderMonkey引擎，同时还有头文件和库文件。

c++代码通过JSAPI来访问SpiderMonkey，通过导入头文件"jsapi.h"。JSAPI提供了相应的函数来建立javascript运行时环境，编译，执行脚本，创建和访问javascript数据结构，处理错误，允许安全性检查以及调试脚本。

如果想了解JSAPI的全部能力，你可以查看[JSAPI Reference](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference);

### The SpiderMonkey universe

如果想在SpiderMonkey里面跑javascript，一个程序必须包含三个关键元素:一个JSRutime,一个JSContext和一个全局对象。这一小节专门来阐述这三个关键元素。下一节主要是介绍怎么使用JSAPI来配置这三个关键元素。

_Runtimes:_ 一个JSRutime，或者说运行时。你的程序里所有的js变量，对象，脚本和上下文都由它来分配内存。每一个JSContex和每一个js对象都依托于JSRuntime。它们不能越界访问，也不能共享资源。大部分应用程序只需要一个runtime就可以了。

_Contexts:_一个JSContext，或者说上下文。它像一部小型机器，可以完成许多javascript对象相关的任务。它负责编译和执行脚本，设置和访问js对象的属性，调用js函数，把js数据类型转换成其它数据类型，创建对象等等。几乎所有的JSAPI都需要一个JSContext 对象作为第一个参数。就像<stdio.h>里面的文件操作一样，都需要一个FILE*指针。

在context和线程之间还有一层亲密关系。简单来说，单线程的程序只要使用一个context就够了。但是，一个context一次只能做一件事情。因此，在一个多线程程序中，一个线程在任何时刻应该可以使用任意给定的context。那样的程序，一般来说会设计成每一个线程拥有自己的context。而js对象，从另一个角度来说，它并不是一直与script、thread和创建它的context同生共死的。它们可以被许多脚本或者许多线程所共用。如图1。1所示：

Figure 1.1 js脚本、上下文和对象的关系

![figure1](https://zilongshanren.com/img/Over3.gif)

_Global objects:_ 最后，全局对象包含js脚本中所有的类、函数和变量。脚本里所做的任何操作，比如window.open("http://www.mozilla.org/"),
它都需要访问全局属性，在此例中就是window。JSAPI应用程序对于全局对象里面应该暴露哪些属性给js脚本拥有绝对的控制权。程序刚开始时会创建一个对象，然后使用js的标准类来操作它，比如Array和Object。然后，它会提供一些应用程序所需要的类,对象和函数，比如：window。每一次应用程序跑js脚本时（通过调用JS_EvaluateScript）,它就会提供全局的对象给脚本访问。当脚本在运行的时候，它也可以创建自己的全局函数和全局变量。所以这些函数，类，变量都被当作全局对象的属性。

### A minimal example

在上一节中描述的三种关键元素需要相应的JSAPI调用：

_The runtime:_ 使用JS_NewRuntime可以创建一个js runtime，对应的可以使用
JS_DestroyRuntime来销毁这个runtime。当你的程序里面集成SpiderMonnkey以后，你可以使用JS_ShutDown来释放掉缓存里面的资源。（虽然说，你的程序退出的时候这些缓存的资源都会被释放，手动调用JS_ShutDown显得有点多此一举。但是，调用它是一个好习惯。）

_The context:_ 使用JS_NewContext和JS_DestroyContext。为了最大化兼容ECMAScript标准，应用程序需要调用JS_SetOptions来激活JSOPTION_VAROBJFIX.为了支持最新的js语言特性，应用程序需要调用JS_SetVersion。错误处理也需要一个context，我们可以用JS_SetErrorReporter来支持它。

_The global object:_ 为了创建这个对象，你首先需要采用JSCLASS_GLOBAL_FLAGS来创建一个JSClass。下面的例子中，我们举了一个非常简单的JSClass（叫做global_class）。它本身没有任何属性和方法。使用JS_NewGlobalObject来创建一个全局对象。使用JS_InitStandardClasses方法来操作它。

下面的代码向我们展示了一个最简化版的JSAPI应用程序。它包含了我们之前介绍的所有知识点：

```cpp
#include "jsapi.h"
// The class of the global object.
static JSClass global_class = { "global",
                                JSCLASS_NEW_RESOLVE | JSCLASS_GLOBAL_FLAGS,
                                JS_PropertyStub,
                                JS_DeletePropertyStub,
                                JS_PropertyStub,
                                JS_StrictPropertyStub,
                                JS_EnumerateStub,
                                JS_ResolveStub,
                                JS_ConvertStub,
                                NULL,
                                JSCLASS_NO_OPTIONAL_MEMBERS
};
// The error reporter callback.
void reportError(JSContext *cx, const char *message, JSErrorReport *report) {
     fprintf(stderr, "%s:%u:%s\n",
             report->filename ? report->filename : "no filename",
             (unsigned int) report->lineno,
             message);
}
int run(JSContext *cx) {
    // Enter a request before running anything in the context 
    JSAutoRequest ar(cx);
    // Create the global object in a new compartment. 
    JSObject *global = JS_NewGlobalObject(cx, &global_class, NULL);
    if (global == NULL)
        return 1;
    // Set the context's global 
    JSAutoCompartment ac(cx, global);
    JS_SetGlobalObject(cx, global);
    // Populate the global object with the standard globals, like Object and Array. 
    if (!JS_InitStandardClasses(cx, global))
        return 1;
    // Your application code here. This may include JSAPI calls to create your own custom JS objects and run scripts. 
    return 0;
}
int main(int argc, const char **argv) {
    // Create a JS runtime. 
    JSRuntime *rt = JS_NewRuntime(8L * 1024L * 1024L, JS_NO_HELPER_THREADS);
    if (rt == NULL)
       return 1;
    // Create a context. 
    JSContext *cx = JS_NewContext(rt, 8192);
    if (cx == NULL)
       return 1;
    JS_SetOptions(cx, JSOPTION_VAROBJFIX);
    JS_SetErrorReporter(cx, reportError);
    int status = run(cx);
    JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();
    return status;
}
```

每一个JSNative有一样的签名，完全可以忽视Javascript那边所传递的函数参数。

传递给javascript函数的参数由argc和vp.argc来计算，一共传递了多少个参数。然后使用JS_ARGV(cx,cp)来返回这些参数的一个数组。这些参数没有基础c++类型，比如init、float之类的。它们都是一些jsval，即javascript值。这些native的函数使用JS_ConvertArgument来把这些jsval转换成相应的c++类型，然后再把它们存储在本地局部变量中。native函数还使用JS_SET_RVAL(cx,vp,val)来把c++的值返回给js端。

当函数调用成功的时候，一个JSNative对象必须调用JS_SET_RVAL，并且返回一个JS_TRUE。传递给JS_SET_RVAL的值最终被返回给js端。

当函数调用失败的时候，一个JSNative对象会调用一个错误处理函数，在本例中就是JS_ReportError,并且返回JS_FALSE。这个代码调用会导致javascript异常被触发。调用者可以在javascript代码里面使用try/catch来捕获这些异常。

要让一个native的函数可以被js端调用，我们需要声明一个JSFunctionSpec表来描述这些函数信息。然后调用JS_DefineFunction。

```cpp
static JSFunctionSpec myjs_global_functions[] = {
    JS_FS("rand",   myjs_rand,   0, 0),
    JS_FS("srand",  myjs_srand,  0, 0),
    JS_FS("system", myjs_system, 1, 0),
    JS_FS_END
};
    ...
    if (!JS_DefineFunctions(cx, global, myjs_global_functions))
        return JS_FALSE;
    ...
```

一旦函数被定义在global中，任何脚本使用global作为全局对象都可以调用它，就像每一个web页面可以调用alert函数一样。在上面的配置中，我们可以使用下面的脚本来跑"Hello World"：

```cpp
system("echo hello world");
```

## JSAPI Concepts

该部分主要任务是填JSAPI的坑。如果你想使用SpiderMonkey来开发什么程序的话，这必须仔细认真细致完整反复地阅读本节的3个部分内容。

### Javascript values

主要的文章:[jsval](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/Jsval)

Javascript是一种动态类型的语言：所有的变量和属性在编译间都是没有类型的。那么，像c、c++这种静态类型语言怎么同js交互呢？JSAPI提供了一种数据类型叫做jsval，它可以代表js里面的任何数据类型。一个jsval可以是一个数字，一个字符串，一个bool值，一个对象的引用（比如Object，Array，Data或者Function），甚至可以是null或者undefined。

对于整形和bool值，jsval自身是包含其值的。在其它情况下，jsval只是一个指针 ，要么指向一个对象或者一个数组 。

温馨提示：就像c++的指针一样，一个jsval它不会自动初始化为一个安全的值，也可能会成为一个野指针 。这一点和js中的var是有区别的。
一个悬挂的指针过去可能指向的是一个有效的地址，但是也有可能不会。使用悬挂指针会导致c++程序崩溃。
就jsval而言，javascript里面的垃圾收集器会自动收集程序里面可回收的对象，字符串数字等对象。
但是jsval对象本身，它并不保证其自身一定不被垃圾收集器所回收。你可以看Garbage
collection那一节来了解更多有关jsval安全性的细节问题。

JSAPI里面包含了一些宏，可以用来测试jsval的javascriopt数据类型。它们是：

```cpp
JSVAL_IS_OBJECT
JSVAL_IS_NUMBER
JSVAL_IS_INT
JSVAL_IS_DOUBLE
JSVAL_IS_STRING
JSVAL_IS_BOOLEAN
JSVAL_IS_NULL
JSVAL_IS_VOID
```

一个jsval指向一个JSObject，JSDouble或者JSString对象。你可以把jsval向下转型成你需要的类型。转换的api接口是JSVAL_TO_OBJECT,JSVAL_TO_DOUBLE和JSVAL_TO_STRING。这些api可以帮助我们在需要特性类型的时候去做相应的数据类型转换。类似的，你也可以把一个JSObjectt,JSDouble或者JSString对象指针转换成一个jsval。通过使用OBJECT_TO_JSVAL,DOUBLE_TO_JSVAL和STRING_TO_JSVAL.

### Gabage collection

一旦js脚本跑起来以后，所有的js对象，字符串和变量等数据结构都会分配内存。垃圾收集指的是js引擎会自动检测哪些内存没有被引用，而且也不再可能被再次使用，最终js引擎会自动回收这部分内存。

垃圾收集对于一个JSAPI的程序来讲有两个非常重大的影响。首先，应用程序需要保证js里面的任何值都是可以被GC的。垃圾收集器是会很积极地去搜寻没有被引用的内存的，一旦发现有这样的内存块，它就会释放之。其次，应用程序需要考虑垃圾收集器对程序性能的影响。

#### Keeping objects live

如果你的JSAPI程序crash了，很可能是由于垃圾收集器发生错误了。你的程序必须确保垃圾收集器可以访问到所有正常使用的js变量。否则，没有被gc引用的内存就会被gc释放掉。因为你的程序下次可能会使用到这些被释放的内存，此时，crash发生了。

我们有许多方法可以保证一个值是可以被gc管理到的：

  * 如果你想一个js value在JSNative调用期间都可以被访问，你可以把它存储到rval或者一个argv数组中。任何值存储在这两个地方都可以被访问到。如果还想使用更多的argv槽，可以使用JSFunctionSpec.extra.

  * 如果一个定制的对象需要把某些值存储在内存中，只需要把这些值当作此对象的属性存储起来即可。只要这个对象是可以被引用的，那么它的属性就是可以被访问到的。如果这些值不一定要让js代码访问，可以使用保留槽[reserved slots
](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetReservedSlot)。 也可以使用一个JSClass.mark，然后把值存储到[private data](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetPrivate)中。

  * 如果一个函数创建新的对象、字符串和数字，它可以使用JS_EnterLocalRootScope和JS_LeaveLocalRootScope来保证这些值在函数调用期间不被释放。

  * 如果想让一个值永久存在，那么可以它把存储到[GC root](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_AddRoot)中。

但是，GC bug还是有可能会发生的。这两个函数，都只有在debug模式下面才能使用，它们对于debug和gc相关的crash非常有帮助。

  * 使用[ JS_SetGCZeal ](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetGCZeal)来激活另外一个垃圾收集器。GC zeal会让GC相关的crash暴露地更多，而且富含更多信息。这个只能用于程序开发和debug阶段，因为这个额外的gc会让js跑得非常慢。

  * 使用[ JS_DumpHeap ](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_DumpHeap)来把SpiderMonkey的堆和其它有用的信息dump出来。

你可以参考[SpiderMonkey Garbage Collection Tip](https://developer.mozilla.org/en-US/docs/SpiderMonkey_Garbage_Collection_Tips)来了解更多信息。

#### GC performance

如果经常去做自动垃圾收集，会对你的程序性能造成比较大的影响。有一些程序可以通过增加JSRuntime的初始值大小来减少GC的频率。

不过，最好的技术应该是让程序在空闲的时候去做GC，这种情况下面，它对终端用户的影响最小。默认情况下，js引擎的垃圾收集时机是，它除了自动增长进程空间而别无他法时。这句话的意思是，垃圾收集发生在内存很吃紧的时候，但是，这时候做垃圾收集其实也是最坏的时机。一个应用程序可以通过调用JS_GC和JS_MaybeGC两个函数来触发垃圾收集。JS_GC会强制执行垃圾收集。而JS_MaybeGC会提醒垃圾收集器，您老是不是该收集无用的内存资源啦？

### Errors and exceptions

检查一个JSAPI函数的返回值的重要性是无需多言的。因为每一个JSAPI函数都会使用一个JSContext指针作为参数，这有可能会导致函数调用失败。因为系统可能会出现内存耗尽的问题。也有可能js脚本中存在语法错误。还有，脚本中有可能显示throw一个异常。

因为Javascript语言本身支持异常，而c++也支持异常,它两肯定不是一码事。SpiderMonkey本身并没有使用任何c++异常。JSAPI也不会抛出c++异常，当SpiderMonkey去调用一个应用程序回调时，这个回调也绝不会抛出一个c++异常。

#### Throwing and catching exceptions

我们已经看到一个JSNative函数中如何抛出异常的例子了。只需要简单地调用JS_ReportError，然后使用一个和printf风格的参数列表并且返回JS_FALSE。

```cpp
rc = system(cmd);
if (rc != 0) {
    /* Throw a JavaScript exception. */
    JS_ReportError(cx, "Command failed with exit code %d", rc);
    return JS_FALSE;
}
```

这个和js语句throw new Error("Command failed with exit code" + rc)非常相似。另外，需要注意的是，调用JS_ReportError并不会产生一个c++异常。但是SpiderMonkey的栈在展开时不会把c++函数从栈中移除。SpiderMonkey的做法是，返回一个JS_FALSE或者NULL给应用程序。

如果想了解更多有关异常抛出和异常处理的例子，可以参考[JSAPI Phrasebook](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Cookbook).

#### Error reports

（译注： 这些家伙很懒，这部分文档没有。）

#### Automatic handling of uncaught exceptions

在某些特定情况下面，JS_Compile,JS_Call,JS_Execute和JS_Evaluate函数会自动把异常信息传递给error
reporter程序。这些函数在执行的时候，都会事先检查JSContext，看其中是否有异常。如果有，那么它们会继续检查是否还有其它js代码或者js函数在此JSContext中。如果有，那么这些异常可能会被捕捉，这时SpiderMonkey什么也没做只返回JS_FALSE，并且让异常可以被传播。但是，如果js栈上什么都没有的话，那么没有被捕获的异常就会被直接传给error reporter。

最后的结果就是，顶层的应用程序设置一个error reporter，然后再开始调用JSAPI函数。应用程序永远都不需要显式去处理未捕获的异常消息。因为error reporter会自动被调用。应用程序也可以禁用这项功能，通过使用(JSOPTION_DONT_REPORT_UNCAUGHT),但是，如果这样做，你还需要显式地调用JS_IsExceptioinPending, JS_GetPendingException, JS_ReportPendingException和JS_ClearPendingException，调用时机就是在JSAPI函数返回JS_FALSE或者NULL之前。

#### Uncatchable errors

还有一种方式来让JSNative回调来报出一个错误：

```cpp
    if (p == NULL) {
        JS_ReportOutOfMemory(cx);
        return JS_FALSE;
    }
```

这里的代码和JS_ReportError所做的略微有些不同。

大部分的错误，包括由JS_ReportError所抛出的错误，都可以用javascript语言异常来表示。使用js的一些内置api
try/catch/finally。但是，有时候，我们并不想让js端去catch某一个错误，而是想让脚本直接就终止运行。如果在脚本执行期间，我们的系统内存耗尽了，我们就不想让finally那部分代码执行了。因为，脚本总需要一点点内存来执行，而此时我们已经没有内存了。如果一个脚本已经运行很长时间了，我们想杀死它，这时候就不能产生异常，因为那样的话js端的catch会捕捉到这个异常并继续执行下去。

因此，JS_ReportOutOfMemory(cx)函数被不会抛出一个异常，它会产生一个不可被捕捉的错误。

如果SpiderMonkey把内存耗尽了，或者是一个JSAPI回调返回JS_FALSE但是没有附带一个异常，那么我们就把它当作一个不可被捕捉的错误。此时，js代码的栈会展开，同时js代码中的catch和finally也不会被执行。

一个不可被捕捉的错误可以让JSContext状态良好。这样JSContext可以被重用。应用程序也不需要额外的操作来从这些错误中恢复。

下面一段代码向我们演示了如何产生一个不可被捕捉的错误:

```cpp
// Call the error reporter, if any. This part is optional.
JS_ReportError(cx, "The server room is on fire!");
JS_ReportPendingException(cx);
// Make sure the error is uncatchable.
JS_ClearPendingException(cx);
return JS_FALSE;
```

## More sample code

下面的例子使用JSAPI来实现了一些功能。

注意，最重要的例子还是“A minimal example”一节中的例子。大部分的JSAPI代码样例可以在[JSAPI Phrasebook](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Cookbook)找到。

### Defining objects and properties

```cpp
// Statically initialize a class to make "one-off" objects. 
JSClass my_class = {
    "MyClass",
    // All of these can be replaced with the corresponding JS_Stub function pointers. 
    my_addProperty, my_delProperty, my_getProperty, my_setProperty,
    my_enumerate,   my_resolve,     my_convert,     my_finalize
};
JSObject *obj;
/*
 * Define an object named in the global scope that can be enumerated by
 * for/in loops.  The parent object is passed as the second argument, as
 * with all other API calls that take an object/name pair.  The prototype
 * passed in is null, so the default object prototype will be used.
 */
obj = JS_DefineObject(cx, globalObj, "myObject", &my_class, NULL,
                      JSPROP_ENUMERATE);
/*
 * Define a bunch of properties with a JSPropertySpec array statically
 * initialized and terminated with a null-name entry.  Besides its name,
 * each property has a "tiny" identifier (MY_COLOR, e.g.) that can be used
 * in switch statements (in a common my_getProperty function, for example).
 */
enum my_tinyid {
    MY_COLOR, MY_HEIGHT, MY_WIDTH, MY_FUNNY, MY_ARRAY, MY_RDONLY
};
static JSPropertySpec my_props[] = {
    {"color",       MY_COLOR,       JSPROP_ENUMERATE},
    {"height",      MY_HEIGHT,      JSPROP_ENUMERATE},
    {"width",       MY_WIDTH,       JSPROP_ENUMERATE},
    {"funny",       MY_FUNNY,       JSPROP_ENUMERATE},
    {"array",       MY_ARRAY,       JSPROP_ENUMERATE},
    {"rdonly",      MY_RDONLY,      JSPROP_READONLY},
    {0}
};
JS_DefineProperties(cx, obj, my_props);
/*
 * Given the above definitions and call to JS_DefineProperties, obj will
 * need this sort of "getter" method in its class (my_class, above).  See
 * the example for the "It" class in js.c.
 */
static JSBool my_getProperty(JSContext *cx, JSObject *obj, jsval id, jsval *vp)
{
    if (JSVAL_IS_INT(id)) {
        switch (JSVAL_TO_INT(id)) {
          case MY_COLOR:  *vp = . . .; break;
          case MY_HEIGHT: *vp = . . .; break;
          case MY_WIDTH:  *vp = . . .; break;
          case MY_FUNNY:  *vp = . . .; break;
          case MY_ARRAY:  *vp = . . .; break;
          case MY_RDONLY: *vp = . . .; break;
        }
    }
    return JS_TRUE;
}
```

### Definning classes

这一部分内容通过使用JSAPI来定义构造函数，原型对象，原型对象的属性，以及构造函数的属性。

初始化一个类，可以通过定义构造函数，原型和一些预定义的实例属性和类属性。类属性和java中的静态属性有点相似。它们都被定义在对象的构造函数作用域内，这样MyClass.myStaticProp就可以和new MyClass()一起被js端所使用了。

[JS_InitClass](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_InitClass)接收很多参数，但是，最后4个参数是可以传递空的。如果你不想让定义的类有相应的属性的话。

注意，你不需要去调用JS_InitClass来创建一个类的实例，这是一个先有鸡还是先有蛋的问题。你只需要调用JS_InitClass，这样脚本在执行new操作的时候就可以找到相应的构造函数了。这样js端就可以通过运行时从对象的prototype对象（MYClass.prototypea）或者继承的对象中访问相应的属性。一般来讲，如果你想让多个实例共享同样的行为，可以使用JS_InitClass.

```cpp
protoObj = JS_InitClass(cx, globalObj, NULL, &my_class,
                        MyClass, 0,
                        my_props, my_methods,
                        // class constructor properties and methods /
                        my_static_props, my_static_methods);
```

### Running scripts

```cpp
/* These should indicate source location for diagnostics. */
char *filename;
uintN lineno;
/**
 * The return value comes back here -- if it could be a GC thing, you must
 * add it to the GC's "root set" with JS_AddRoot(cx, &thing) where thing
 * is a JSString *, JSObject *, or jsdouble *, and remove the root before
 * rval goes out of scope, or when rval is no longer needed.
 */
jsval rval;
JSBool ok;
/**
 * Some example source in a C string.  Larger, non-null-terminated buffers
 * can be used, if you pass the buffer length to JS_EvaluateScript.
 */
char *source = "x * f(y)";
ok = JS_EvaluateScript(cx, globalObj, source, strlen(source),
                       filename, lineno, &rval);
if (ok) {
    //Should get a number back from the example source. 
    jsdouble d;
    ok = JS_ValueToNumber(cx, rval, &d);
    . . .
}
```

### Calling functions

``` cpp
// Call a global function named "foo" that takes no arguments.
ok = JS_CallFunctionName(cx, globalObj, "foo", 0, 0, &rval);
jsval argv[2];
// Call a function in obj's scope named "method", passing two arguments. 
argv[0] = . . .;
argv[1] = . . .;
ok = JS_CallFunctionName(cx, obj, "method", 2, argv, &rval);
```

### JSContext

因为在分配和维护context时存在一定的开销，一个JSAPI程序应该：

  1. 一次只创建需要个数的context。（简言之，就是按需创建）

  2. 尽可能保持context存活时间更长，而不是反复地释放并重建。（简言之，就是cache）

如果程序创建多个runtime，你需要清楚哪一个runtime和哪一个context相关联。想了解更多，请参考[JS_GetRuntime](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetRuntime)

使用[JS_SetContextPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetContextPrivate)和[JS_GetContextPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetContextPrivate)来把应用程序相关的数据与context关联起来。

### Initializing built-in and global JS objects

如果想了解SpiderMonkey所有内置的对象，可以参考[JS_InitStandardClasses](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_InitStandardClasses).

应用程序提供的全局对象在很大程度上决定了脚本可以做哪些事情。比如，FireFox浏览器使用它自己的全局对象windows。你可以更改自已应用的全局对象，使用[JS_SetGlobalObject](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetGlobalObject)

### Creating and initializing custom objects

除了引擎内置的对象，你还可以创建、初始化和使用你自己的js对象。特别是在你想使用js引擎来自动化你的程序。定制的js对象可以提供了一些直接的服务，或者说它们充当了你的脚本和程序的接口。比如，一个定制的对象可以提供你程序中所有的网络访问功能，也可以充当你的程序与数据库交互的一个中介者。或者可以把你的程序里面原来采用c或者c++编写的功能代码映射成一种js的面向对象形式。这种内置的对象其实就是你的脚本与程序核心交流的桥梁。你可以从脚本里面传值给程序，也可以从程序里面返回值给脚本。

目前有两种方法让js引擎创建定制的对象：

  * 编写一个js脚本来创建对象，它的属性、构造器、函数，然后在运行时把这个对象传给js引擎。

  * 在你的程序中嵌入一些代码，这些代码定义了js对象的属性和方法，然后调引擎基于这些代码去创建相应的js对象。这种方法的好处是，你的程序包含了本地方法可以直接操作本地对象。

### Creating an object from a script

从脚本中创建对象，原因之一就是你只想让这个定制对象和脚本的生命周期一致。如果你想创建一些对象可以在多个脚本中使用，就应该把这个对象嵌入到应用程序中，而不是写在脚本里面。

注意：你也可以使用脚本来创建持久的对象。

使用脚本来创建定制对象：

  1. 定义和设计该对象。它的用途是什么？它有哪些数据成员？它有哪些方法？它需要一个构造函数吗？

  2. 编写js代码来定义并创建对象。比如，function myfunc(){var x = newObject()}}。注意，使用js脚本编写的js对象是在js引擎context之外的。如果想了解更多有关对象脚本化的内容，可以参考Client-Side JavaScript Guide 和 Server-side JavaScript
Guide.嵌入一个合适的js引擎到你的应用程序中，然后编译并执行这些脚本。你有两个选择：1）每次调用一个函数都使用JS_EvaluateScript和JS_EvaluateUCScript来编译来执行js脚本。2）使用JS_CompileScript或者JS_CompileUCScript来编译脚本，然后可以使用JS_ExecuteScript来重复使用之。这个"UC"版本可以支持unicode脚本。

你使用脚本创建的对象，它的生命周期与脚本本身是一致的。你也可以创建一些对象，它们在脚本执行完成之后，还可以存在。一般情况是，当脚本运行完，这些被脚本创建的对象就被销毁了。在许多情况下面，这正是你的应用程序所期待的行为。但是，也有一些特殊的情况，你可能需要让某些对象可以大多个脚本之间共享。

### Custom objects

一个应用程序可以不用JSClass来创建定制对象：

  1. 在c/c++端使用你的对象的setter/getter和方法。然后为每一个setter or getter编写一个[JSPropertyOp](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JSPropertyOp)。为每一个方法编写JSNative或者JSFastNative方法。

  2. 为你的对象的所有的属性，包括gettter and settter声明[JSPropertySpec](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JSPropertySpec)数组。

  3. 为你的定制对象的所有的方法声明[JSFunctionSpec](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JSFunctionSpec)数组。

  4. 调用[JS_NewObject](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_NewObject),[JS_ContructObject](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_ConstructObject) or
[JS_DefineObject](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_DefineObject)来创建对象。

  5. 调用[JS_DefineProperties](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_DefineProperties)来定义对象属性

  6. 调用[JS_DefineFunctions](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_DefineFunctions)来定义对象的方法.

[JS_SetProperty](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetProperty)也可以用来创建对象的属性。但是它创建的属性没有getter和setter。这些属性只是普通的Javascript属性。

### Providing private data for objects

就像context一样，你可以把很多数据与对象进行关联，而不需要显式把这些数据当作对象本身的属性。调用[JS_SetPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetPrivate)可以为对象建立一个指向私有数据的指针。然后再调用[JS_GetPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetPrivate)来访问这些私有数据。你的应用程序本身负责创建和管理这些可选的私有数据。

想要为你的私有对象创建私有数据，可以按如下方法进行：

  1. 把私有数据和一个普通的c指针关联起来。

  2. 调用[JS_SetPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_SetPrivate)，指定对象要与哪个私有数据建立联接。

比如：

```cpp
 JS_SetPrivate(cx, obj, pdata);
```

为了在后续可以访问这些数据，调用[JS_GetPrivate](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetPrivate)，然后把对象作为参数传进来。这个函数会返回此对象的私有数据指针。

```cpp
pdata = JS_GetPrivate(cx, obj);
```

后记：后面的部分比较高级，讲的是unicode，安全性，引擎debug和引擎性能调试的内容，如果想继续了解的读者可以参考下面的链接。

Reference:  [jsapi_user-guid](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_User_Guide#Error_reports)
