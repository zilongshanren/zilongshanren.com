---
author: 0owen
comments: true
date: 2014-08-10 14:29:28+00:00
layout: post
slug: 'cpp operate Lua string'
title: Lua教程:C/C++操作Lua数组和字符串(5)
wordpress_id: 705
categories:
- Lua
tags:
- Lua
---

 
<!-- toc -->
本文将介绍如何在C/C++里面操作Lua的数组和字符串类型，同时还会介绍如何在C/C++函数里面存储Lua状态（registry和upvalue），而registry在使用C/C++自定义类型时非常有用，可以方便地为userdata指定metatable。

<!-- more -->

## C/C++操作Lua数组

### Lua数组Overview

在Lua里面，数组只不过是key为整数的table而已。比如一个table为array = {12,"Hello", "World"}，它是一个数组，可以用下面的代码来访问它：

```cpp
print(array[1])  --这里会输出array的第一个元素12。
print(array[3]) --这里会输出array的第三个元素World
```

需要注意的一点就是：**Lua的数组的下标是从1开始的**。如果你使用下面的语句则会输出nil值：

```cpp
print(array[0])  --输出nil
print(array["1"])  --输出nil(想想和array[1]的区别：一个是integer作为key,一个是字符串做为key)
```

### 通用Table操作方法

之前我们在[教程1](http://zilongshanren.com/blog/2014-06-28-embeded-lua-tutorial-one.html)中介绍了如何传递Table给Lua，以及在[教程3](http://zilongshanren.com/blog/2014-07-28-call-lua-table-from-cpp.html)中介绍了如何访问Table的数据。因为数组也是Table，所以我们可以用同样的方式来读取数组。

#### 读取数组

假设我们的Lua Table为array = {"Hello", 1, "World", 23.2},那么我们可以用下列函数来访问它：

```cpp
void readLuaArray(lua_State *L)
{
    lua_settop(L,0); //这样确保我们的array是放在当前栈的栈顶。
    lua_getglobal(L, "array");
    //如果前面不调用lua_settop(L,0),那我们必须要使用luaL_len(L,-1)
    int n = luaL_len(L, 1);   //luaL_len可以获得table的元素个数
    for (int i = 1; i <= n; ++i) {
        lua_pushnumber(L, i);  //往栈里面压入i
        lua_gettable(L, -2);  //读取table[i]，table位于-2的位置。
        //lua_rawget(L, -2);  //lua_gettable也可以用lua_rawget来替换
        cout<<lua_tostring(L, -1)<<endl;
        lua_pop(L, 1);
    }
}
```
最后输出的结果为:

```cpp
"Hello", 1, "World", 23.2
```

#### 修改数组

现在我们如果想要修改这个数组，把每一个数组的元素都变成"hehe[i]"(i = 1-n)，我们看看怎么做。

```cpp
int writeLuaArray(lua_State *L)
{
    lua_settop(L, 0);
    lua_getglobal(L, "array");
    //确保第一个函数一个要是一个table
    luaL_checktype(L, 1, LUA_TTABLE);
    int n = luaL_len(L,1);
    for (int i = 1; i <= n; ++i) {
        lua_pushnumber(L, i);
        char buf[256];
        sprintf(buf, "hehe%d", i);
        lua_pushstring(L, buf);
//        lua_settable(L, -3);
        lua_rawset(L, -3);
    }
    return 0;
}
}
```
注意这里的lua_rawset和lua_settable是等价的，只不过lua_rawset速度更快。
最后，我们在加载完Lua脚本以后调用这两个函数：

```cpp
    writeLuaArray(L);
    readLuaArray(L);
```
输出结果为:

```cpp
readLuaArray: hehe1
readLuaArray: hehe2
readLuaArray: hehe3
readLuaArray: hehe4
```

### 专门的数组操作方法

因为数组一般在程序语言里面都会被特殊对待，Lua也不例外，它的C API还提供另外一种更方便高效地方法来存取数组的元素。

```cpp
 void lua_rawgeti (lua_State *L, int index, int key);
 void lua_rawseti (lua_State *L, int index, int key);
```
这两个函数后面两个参数的意思分别是:index(table在栈中的索引），key(table中数组的索引,下标从1开始）
接下来，我会通过改造上面的示例来演示这两个API的用法。

#### 读取数组

因为lua_rawgeti(L,t,key)等价于：

```cpp
 lua_pushnumber(L, key);
 lua_rawget(L, t);
```
因此，我们的读取代码可以改写成下面这样:

```cpp
void readLuaArray(lua_State *L)
{
    lua_getglobal(L, "array");
    int n = luaL_len(L, -1);
    for (int i = 1; i <= n; ++i) {
        lua_rawgeti(L, 1, i);
        cout<<"readLuaArray: "<<lua_tostring(L, -1)<<endl;
        lua_pop(L, 1);
    }
}
```

#### 修改数组

同理，lua_rawset(L,t,key)等价于

```cpp
lua_pushnumber(L,key); //此时的栈 table->value->key
lua_insert(L,-2);  //调用完后的栈： table->key->value (table[key]=value)
lua_rawset(L,t);
```
相应的修改数组的代码可以修改为:

```cpp
int writeLuaArray(lua_State *L)
{
    lua_settop(L, 0);
    lua_getglobal(L, "array");
    //确保第一个函数一个要是一个table
    luaL_checktype(L, 1, LUA_TTABLE);
    int n = luaL_len(L,1);
    for (int i = 1; i <= n; ++i) {
        char buf[256];
        sprintf(buf, "hehe%d", i);
        lua_pushstring(L, buf);
        lua_rawseti(L, 1, i);
    }
    return 0;
}

```

## C/C++操作Lua字符串

### 基本字符串操作

Lua C API操作字符串主要包含两个操作：求子串（lua_pushlstring）和字符串拼接(lua_concat).
例如，我们求一个字符串s的子串[i,j]，它可以表示为：

```cpp
lua_pushlstring(L, s + i, j - i + 1);
```
而lua_concat(L,n)则可以把当前栈顶的n个元素转换成字符串并拼接起来，最后把结果压入栈顶。
比如，我们想定义一个函数mycontact(...,n)可以把n个字符串拼接起来，n表示字符串的个数，那么我们的代码可以写成这样:

```cpp
static int l_mycontact(lua_State* L){
    luaL_checktype(L, -1, LUA_TNUMBER);
    int n = lua_tonumber(L, -1);
    lua_pop(L, 1);
    lua_concat(L, n);
    return 1;
}
```
然后，我们需要注册此函数到libs中去，最后在Lua里面调用此函数：

```cpp
print(mylib.mycontact("zilong","shanren"," meng meng"," da",4))
```
输出结果为:

```cpp
zilongshanren meng meng da
```

### 格式化输出

当我们想要往Lua里面写入一个格式化字符串时，可以使用函数

```cpp
const char *lua_pushfstring (lua_State *L, const char *fmt, ...);
```
另外，我们还可以使用luaL_Buffer,下面是PIL书中的示例，把Lua字符串转换成大写：

```cpp
 static int str_upper (lua_State *L) {
     size_t l;
     size_t i;
     luaL_Buffer b;
     const char *s = luaL_checklstring(L, 1, &l);  //从Lua栈中取出字符串
     char *p = luaL_buffinitsize(L, &b, l); //分配一块与取出字符串同样大小的缓冲区
     for (i = 0; i < l; i++)
       p[i] = toupper(uchar(s[i]));
     luaL_pushresultsize(&b, l);  //把缓冲区结果转换为字符串
     return 1;
}
```
更多的Lua Buffer操作函数如下：

```cpp
     void luaL_buffinit   (lua_State *L, luaL_Buffer *B);
     void luaL_addvalue   (luaL_Buffer *B);
     void luaL_addlstring (luaL_Buffer *B, const char *s, size_t l);
     void luaL_addstring  (luaL_Buffer *B, const char *s);
     void luaL_addchar    (luaL_Buffer *B, char c);
     void luaL_pushresult (luaL_Buffer *B);
```
关于每一个函数的用法和每一个参数的含义，大家可以去Lua的Reference Manual上去查看，本文就不赘述了。

## 存储Lua状态

在C函数里面，当我们需要保存函数里面的一些状态的时候，我们一般采用全局变量或者静态变量的方式。但是，如果在与Lua交互时，这两种方法都不可取。
原因有二：
1. C变量很难存储各种各样的Lua变量。
2. 当存在多个Lua栈的时候，就不生效了。
在Lua里面有两种方法来存在函数内的non-local数据:registry和upvalue.

### Registry方式

Register是一个Lua的全局Table，只有在Lua的C API里面可以访问这个Table。它可以用来存储多个Lua模块之间的数据。
访问Register的方式一般为：

```cpp
 lua_getfield(L, LUA_REGISTRYINDEX, "Key");
```
我们需要提供一个LUA_REGISTRYINDEX的“伪索引”来标识它在Lua栈中的位置。我们在操作这个table的时候，最好是使用字符串做为key，而不要使用数字来做为key。关于Registry更为实际的用法，我们会在下一篇文章中讨论。

### Upvalue方式

Upvalue主要用来存储模块或者函数内部的一些私有的数据，它与C语言的静态变量有点类似。具体的用法可以参考[PIL](http://www.lua.org/pil/27.3.3.html)

## Reference

  * [Programming in Lua第27章](http://www.lua.org/pil/27.html)

