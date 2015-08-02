---
author: 0owen
comments: true
date: 2014-07-28 14:29:14+00:00
layout: post
slug: 'call lua table from cpp'
title: Lua教程：C/C++调用Lua的Table(3)
wordpress_id: 641
categories:
- Lua
series:
- C/C++与Lua交互教程
tags:
- Lua
---

* table of contents
{:toc}
从写[上一篇Lua的文章](http://4gamers.cn/blog/2014/07/06/lua-tutorials-pass-data-to-cpp-and-vice-versa/)到现在，已经过去半月有余了，是时候让自己的Lua状态refresh一下了。本教程将介绍Lua的栈及基本栈操作，同时还有如何在C/C++代码里面读取Lua的Table。
<!-- more -->

## 理解Lua栈

Lua通过一个“虚拟栈”与C/C++程序进行数据交互，所有的Lua C API都是通过操作这个栈来完成相应的数据通信。
Lua的这个“虚拟栈”解决了C/C++程序与Lua程序通信的两大问题：

  * Lua使用垃圾回收，而C/C++需要手动管理内存。

  * Lua使用动态类型，而C/C++使用的是静态类型。

因为这个栈在Lua虚拟机内部，当一个Lua的变量放在栈里面的时候，虚拟机可以知道它有没有被宿主程序所使用，从而决定是否采用GC。另外Lua采用结构体封装了类似“Lua_Value”的类型，让它可以存储任何C的类型。从而在数据交换的时候，任何类型都可以被放入栈的一个slot中。

由于栈是FILO的，所以，当我们在Lua里面操作这个栈的时候，每次操作的都是栈的顶部。而Lua的C API则有更多的控制权，它可以非常灵活地操纵这个栈的任意位置的元素。

### 基本Lua栈操作

  * 往栈里面压入一个值

```cpp
     void lua_pushnil      (lua_State *L);
     void lua_pushboolean  (lua_State *L, int bool);
     void lua_pushnumber   (lua_State *L, lua_Number n);
     void lua_pushinteger  (lua_State *L, lua_Integer n);
     void lua_pushunsigned (lua_State *L, lua_Unsigned n);
     void lua_pushlstring  (lua_State *L, const char *s, size_t len);
     void lua_pushstring   (lua_State *L, const char *s);
```

  * 查询栈里面的元素

```cpp
     int lua_is* (lua_State * L, int index);
```
这里面的*可以是boolean,nil,string,function等等

  * 获取栈内给定位置的元素值

```cpp
     xxx lua_toXXX(lua_State * L, int index);
```
这里面的xxx可以是nil, boolean, string,integer等等。

  * 其它栈操作
  
```cpp
//取得栈中元素个数
 int  lua_gettop    (lua_State *L);
//设置栈的大小为一个指定的值，而lua_settop(L,0)会把当前栈清空
//如果指定的index大于之前栈的大小，那么空余的空间会被nil填充
//如果index小于之前的栈中元素个数，则多余的元素会被丢弃
 void lua_settop    (lua_State *L, int index);
//把栈中index所在位置的元素压入栈
 void lua_pushvalue (lua_State *L, int index);
//移除栈中index所在位置的元素
void lua_remove(lua_State *L, int index);
//在栈的顶部的元素移动至index处
void lua_insert(lua_State *L, int index);
//从栈顶弹出一个值，并把它设置到给定的index处
void lua_replace(lua_State *L, int index);
//把fromidx处的元素copy一份插入到toidx，这操作不会修改fromidx处的元素
void lua_copy(lua_State *L, int fromidx, int toidx);
```

另外，根据《Programming In Lua》一书中的所讲，我们可以定义一个函数stackDump来打印当前栈的情况：

```cpp
static void stackDump(lua_State* L){
    cout<<"\nbegin dump lua stack"<<endl;
    int i = 0;
    int top = lua_gettop(L);
    for (i = 1; i <= top; ++i) {
        int t = lua_type(L, i);
        switch (t) {
            case LUA_TSTRING:
            {
                printf("'%s' ", lua_tostring(L, i));
            }
                break;
            case LUA_TBOOLEAN:
            {
                printf(lua_toboolean(L, i) ? "true " : "false ");
            }break;
            case LUA_TNUMBER:
            {
                printf("%g ", lua_tonumber(L, i));
            }
                break;
            default:
            {
                printf("%s ", lua_typename(L, t));
            }
                break;
        }
    }
    cout<<"\nend dump lua stack"<<endl;
}
```

## C/C++访问Lua的Table

假设我们的Lua文件中有一个Table为:

```cpp
me = { name = "zilongshanren", age = 27}
```

我们可以通过以下C代码来访问它的元素:

```cpp
    //从Lua里面取得me这个table，并压入栈
    lua_getglobal(L, "me");
    if (!lua_istable(L, -1)) {
        CCLOG("error! me is not a table");
    }
    //往栈里面压入一个key:name
    lua_pushstring(L, "name");
    //取得-2位置的table，然后把栈顶元素弹出，取出table[name]的值并压入栈
    lua_gettable(L, -2);
    //输出栈顶的name
    CCLOG("name = %s", lua_tostring(L, -1));
    stackDump(L);
    //把栈顶元素弹出去
    lua_pop(L, 1);
    //压入另一个key:age
    lua_pushstring(L, "age");
   //取出-2位置的table,把table[age]的值压入栈
    lua_gettable(L, -2);
    stackDump(L);
    CCLOG("age = %td", lua_tointeger(L, -1));
```

Lua5.1还引入了一个新方法：

```cpp
    lua_getfield(L, -1, "age");
```
它可以取代

```cpp
 //压入另一个key:age
    lua_pushstring(L, "age");
   //取出-2位置的table,把table[age]的值压入栈
    lua_gettable(L, -2);
```

下篇文章，我们将介绍Lua如何调用C/C++里面的函数。

## 推荐阅读

  * [http://eliasdaler.wordpress.com/2013/10/11/lua_cpp_binder/](http://eliasdaler.wordpress.com/2013/10/11/lua_cpp_binder/)

  * [http://www.cnblogs.com/stephen-liu74/archive/2012/07/30/2487201.html](http://www.cnblogs.com/stephen-liu74/archive/2012/07/30/2487201.html)

  * [深入理解Lua栈通信](http://blog.csdn.net/MaximusZhou/article/details/21331819)

