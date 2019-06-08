---
comments: true
date: 2014-07-06
slug: pass lua to cpp and vise verse
title: Lua教程:C++和Lua相互传递数据(2)
categories:
- Lua
tags:
- Lua
---

 
<!-- toc -->

这是我的Lua系列教程的第二篇，本篇文章主要介绍C++和Lua相互传递数据。如果你还不知道怎么在c/c++里面调用Lua脚本的话，请参考[这篇文章](https://zilongshanren.com/blog/2014-06-28-embeded-lua-tutorial-one.html).
本文主要介绍基本数据类型的传递，比如整形(int)，字符串(string)、数字(number)及bool值。

本系列教程源码地址：https://github.com/zilongshanren/LuaCppBindingDemo
<!-- more -->

## 加载并运行Lua脚本

由于在上一个教程里面已经介绍过如何在C/C++里面嵌入Lua，所以这一节就简单的介绍一下程序怎么用，配置就略过啦。

### 创建Lua虚拟机

```cpp
    lua_State *lua_state = luaL_newstate();
```

### 加载Lua库

```cpp
static const luaL_Reg lualibs[] =
    {
        {"base", luaopen_base},
        {"io", luaopen_io},
        {NULL, NULL}
    };
    const luaL_Reg *lib = lualibs;
    for(; lib->func != NULL; lib++)
    {
        luaL_requiref(lua_state, lib->name, lib->func, 1);
        lua_pop(lua_state,1);
    }
```

### 运行Lua脚本

```cpp
    std::string scriptPath = "lesson2.lua";
    int status = luaL_loadfile(lua_state, scriptPath.c_str());
    std::cout << " return: " << status << std::endl;
    int result = 0;
    if(status == LUA_OK)
    {
        result = lua_pcall(lua_state, 0, LUA_MULTRET, 0);
    }
    else
    {
        std::cout << " Could not load the script." << std::endl;
    }
```

这里我们使用的是luaL_loadfile而不是之前的luaL_dofile，其实luaL_dofile只是一个宏定义：

```cpp
#define luaL_dofile(L, fn) \
    (luaL_loadfile(L, fn) || lua_pcall(L, 0, LUA_MULTRET, 0))
```
我们先调用luaL_loadfile可以判断Lua脚本是否加载成功，然后再调用lua_pcall来执行Lua脚本。

## C/C++调用Lua函数

首先，我们在hello.lua里面定义一个lua函数：

```cpp
-- add two numbers
function add ( x, y )
    return x + y
end
```
Lua的函数定义是以function为keyword，然后以end结尾，同时它的参数是没有形参类型的，另外，Lua的函数可以返回多个值。不过我们这里只返回了一个值。

接下来，让我们看看如果在C++程序里面调用这个函数：

```cpp
int luaAdd(lua_State *lua_state , int x, int y)
{
    int sum;
    //获取lua里面的add函数并把它放到lua的栈顶
    lua_getglobal(lua_state, "add");
    //往lua栈里面压入两个参数
    lua_pushnumber(lua_state, x);
    lua_pushnumber(lua_state, y);
    //调用lua函数,这里的2是参数的个数，1是返回值的个数
    lua_call(lua_state, 2, 1);
    //从栈顶读取返回值,注意这里的参数是-1
    sum = lua_tonumber(lua_state, -1);
    //最后我们把返回值从栈顶拿掉
    lua_pop(lua_state, 1);
    return sum;
}
```
然后，我们就可以在程序里面调用它了：

```cpp
    std::cout<< "2 + 1= " << luaAdd(lua_state,4,1)<<std::endl;
```
注意这个方法调用要在lua_pcall调用之后。

## 操作Lua全局变量

### C++里面获取Lua全局变量的值

首先，我们在hello.lua里面定义一个全局变量

```cpp
myname = "子龙山人"
```
然后我们在C++里面访问它：

```cpp
    lua_getglobal(lua_state, "myname");
    std::string myname = lua_tostring(lua_state, -1);
    lua_pop(lua_state, 1);
    std::cout<<"Hello: "<<myname<<std::endl;
```
这一次我们又是通过lua_getglobal来把myname这个全局变量压到lua栈，然后用lua_tostring来取这个值。

### C++里面修改Lua全局变量的值

这次我们使用的是lua_setglobal来传递数据给Lua：

```cpp
 lua_pushstring(lua_state, "World");
    lua_setglobal(lua_state, "myname");
```

这时，我们只要在hello.lua的最开始部分，调用print(myname)就可以打印传递进来的值了。

## C++传递Table给Lua

```cpp
   lua_createtable(lua_state, 2, 0);
    lua_pushnumber(lua_state, 1);
    lua_pushnumber(lua_state, 49);
    lua_rawset(lua_state, -3);
    lua_pushnumber(lua_state, 2);
    lua_pushstring(lua_state, "Life is a beach");
    lua_rawset(lua_state, -3);
    lua_setglobal(lua_state, "arg");
```
这里我们传递了一个table给lua，这个table为{49,"Life is a beach"}。Lua table的索引是从1开始的，然后我们在lua脚本里面可以这样子来访问这个table:

```cpp
for i=1,#arg do
    print("      ", i, arg[i])
end 
```
这里的#arg是获得table的长度，然后使用arg[i]来获取table的索引i处的value。

## Lua返回多个值给C++

首先是Lua代码：

```cpp
local temp = {9, "hehehej"}
-- temp[1]=9
-- temp[2]="See you space cowboy!"
return temp,9,1
```

然后是C++代码：

```cpp
 std::stringstream str_buf;
    while(lua_gettop(lua_state))
    {
        str_buf.str(std::string());
        str_buf << " ";
        switch(lua_type(lua_state, lua_gettop(lua_state)))
        {
            case LUA_TNUMBER:
                str_buf << "script returned the number: "
                << lua_tonumber(lua_state, lua_gettop(lua_state));
                break;
            case LUA_TTABLE:
                str_buf << "script returned a table";
                break;
            case LUA_TSTRING:
                str_buf << "script returned the string: "
                << lua_tostring(lua_state, lua_gettop(lua_state));
                break;
            case LUA_TBOOLEAN:
                str_buf << "script returned the boolean: "
                << lua_toboolean(lua_state, lua_gettop(lua_state));
                break;
            default:
                str_buf << "script returned an unknown-type value";
        }
        lua_pop(lua_state, 1);
        std::cout << str_buf.str() << std::endl;
    }
```

最后输出结果为:

```cpp
[C++] Values returned from the script:
 script returned the number: 1
 script returned the number: 9
 script returned a table
[C++] Closing the Lua state
```

在lua里面return值的顺序是table,9,1，而在C++里面是倒过来的。因为我们是使用栈作为数据结构来传递数据，而栈是先进后出的。

下一篇文章，我们将介绍一下C++调用Lua的Table。


## Reference

  * [http://www.acamara.es/blog/2012/08/passing-variables-from-lua-5-2-to-c-and-vice-versa/](http://www.acamara.es/blog/2012/08/passing-variables-from-lua-5-2-to-c-and-vice-versa/)

  * [http://lua-users.org/wiki/CppLuaDataPassing](http://lua-users.org/wiki/CppLuaDataPassing)

  * [http://gamedevgeek.com/tutorials/calling-lua-functions/](http://gamedevgeek.com/tutorials/calling-lua-functions/)

  * [http://stackoverflow.com/questions/1438842/iterating-through-a-lua-table-from-c](http://stackoverflow.com/questions/1438842/iterating-through-a-lua-table-from-c)

  * [http://xxnull.blog.163.com/blog/static/176398157201181991147848/](http://xxnull.blog.163.com/blog/static/176398157201181991147848/)

