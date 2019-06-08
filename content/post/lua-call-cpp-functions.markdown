---
comments: true
date: 2014-07-30 04:04:53+00:00 +08:00
slug: 'Lua call cpp functions'
title: Lua教程：Lua调用C/C++函数(4)
wordpress_id: 680
categories:
- Lua
series:
- C/C++与Lua交互教程
tags:
- Lua
---

 
<!-- toc -->
本教程将介绍如何在Lua里面调用c/c++函数。

在Lua里面调用c/c++函数其实是比较简单，本文将通过两个示例演示具体的做法：一个是求平均数，另一个是打印lua函数的一些参数信息。

最后，本文会介绍如何把这两个函数定义成一个模块，这样lua代码里面就可以不再使用全局的名字空间了。
<!-- more -->

## 前言

当我们需要在Lua里面调用c/c++函数时，所有的函数都必须满足以下函数签名：

```cpp
typedef int (*lua_CFunction) (lua_State *L);
```
换句话说，所有的函数必须接收一个lua_State作为参数，同时返回一个整数值。因为这个函数使用Lua栈作为参数，所以它可以从栈里面读取任意数量和任意类型的参数。而这个函数的返回值则表示函数返回时有多少返回值被压入Lua栈。（因为Lua的函数是可以返回多个值的）

## 示例一

### 定义C++函数指针

```cpp
int average(lua_State *L)
{
    // get number of arguments 
    int n = lua_gettop(L);
    double sum = 0;
    int i;
    // loop through each argument 
    for (i = 1; i <= n; i++)
    {
        // total the arguments 
        sum += lua_tonumber(L, i);
    }
    // push the average 
    lua_pushnumber(L, sum / n);
    // push the sum 
    lua_pushnumber(L, sum);
    // return the number of results 
    return 2;
}
```

### 注册此函数给Lua

```cpp
    lua_register(L, "average", average);
```

### Lua里面调用此函数

```cpp
avg, sum = average(10, 20, 30, 40, 50)
print("The average is ", avg)
print("The sum is ", sum)
```

## 示例二

### 定义C++函数

```cpp
int displayLuaFunction(lua_State *l)
{
    // number of input arguments
    int argc = lua_gettop(l);
    // print input arguments
    std::cout << "[C++] Function called from Lua with " << argc 
              << " input arguments" << std::endl;
    for(int i=0; i<argc; i++)
    {
        std::cout << " input argument #" << argc-i << ": "
                  << lua_tostring(l, lua_gettop(l)) << std::endl;
        lua_pop(l, 1);
    }
    // push to the stack the multiple return values
    std::cout << "[C++] Returning some values" << std::endl;
    lua_pushnumber(l, 12);
    lua_pushstring(l, "See you space cowboy");
    // number of return values
    return 2;
}
```

### 注册此Lua函数

```cpp
 // push the C++ function to be called from Lua
    std::cout << "[C++] Pushing the C++ function" << std::endl;
    lua_pushcfunction(L, displayLuaFunction);
    lua_setglobal(L, "displayLuaFunction");
```
注意，上一个示例，我们使用的是函数是

```cpp
lua_register(L, "average", average);
```
它其实只是一个宏定义，其实现也是上面两个函数组成的。

### 在Lua里调用此函数

```cpp
io.write('[Lua] Calling the C functionn')
a,b = displayLuaFunction(12, 3.141592, 'hola')
-- print the return values
io.write('[Lua] The C function returned <' .. a .. '> and <' .. b .. '>\n')
```

## 实现一个Lua模块

首先，我们把这两个C函数封装到一个数组里面：

```cpp
static const luaL_Reg mylibs[]=
{
    {"average", average},
    {"displayLuaFunction", displayLuaFunction},
    {NULL, NULL}
};
```

接下来，我们定义另一个C函数，让它注册我们的Lua模块：

```cpp
int lua_openmylib(lua_State *L)
{
    luaL_newlib(L, mylibs);
    return 1;
};
```
这里的luaL_newlib会生成一个table,并把所有的mylibs里面的函数填充进去。最后，lua_openmylib返回值为1，表示会把刚刚生成的table压入栈。

最后，我们像之前注册Lua的标准库一样，注册我们新的库，并给它起名字为mylib:

```cpp
  static const luaL_Reg lualibs[] =
    {
        {"base", luaopen_base},
        {"io", luaopen_io},
        {"mylib", lua_openmylib},
        {NULL, NULL}
    };
```

此时，我们在Lua里面调用之前的两个函数就需要带上模块名字前缀了：

```cpp
avg, sum = mylib.average(10, 20, 30, 40, 50)
a,b = mylib.displayLuaFunction(12, 3.141592, 'hola')
```

## 结语

注意：这里C函数参数里的Lua栈是私有的，每一个函数都有自己的栈。当一个c/c++函数把返回值压入Lua栈以后，该栈会自动被清空。

## 推荐阅读

  * [Calling C++ Functions From Lua](http://gamedevgeek.com/tutorials/calling-c-functions-from-lua/)

  * [CALLING C++ FUNCTIONS FROM LUA 5.2](http://www.acamara.es/blog/2012/08/calling-c-functions-from-lua-5-2/)

  * [http://csl.name/lua/](http://csl.name/lua/)

