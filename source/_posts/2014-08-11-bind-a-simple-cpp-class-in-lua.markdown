---
author: 0owen
comments: true
date: 2014-08-11 14:36:38+00:00
layout: post
slug: 'bind a simple cpp class in lua'
title: Lua教程:绑定一个简单的C++类(6)
wordpress_id: 755
categories:
- Lua
tags:
- c++
- Lua
---

* table of contents
<!-- toc -->

本文是最后一篇C/C++与Lua交互的教程，在此之后，我们会结合Cocos2D-X来介绍Lua绑定。本文主要介绍如何绑定一个简单的C++类到Lua里面，并且提供Lua的面向对象访问方式。

<!-- more -->

## 绑定C++类

### 定义C++类

首先，我们定义一个Student类，它拥有名字（字符串类型）和年龄（整型），并且提供一些getter和setter，最后还提供了一个print方法.这里有Student类的定义和实现：[Student.h](http://git.oschina.net/zilongshanren/Lua-Tutorials/blob/master/LuaCocos2D-X/Classes/Student.h)和[Student.cpp](http://git.oschina.net/zilongshanren/Lua-Tutorials/blob/master/LuaCocos2D-X/Classes/Student.cpp)

### 编写绑定代码

首先，让我们编写在Lua里面创建Student对象的方法：

```cpp
    Student **s =  (Student**)lua_newuserdata(L, sizeof(Student*));  // lua will manage Student** pointer
    *s = new Student;  //这里我们分配了内存，后面我们会介绍怎么让Lua在gc的时候释放这块内存
```

接下来是getName,setName，setAge，getAge和print方法的定义:

```cpp
int l_setName(lua_State* L)
{
    Student **s = (Student**)lua_touserdata(L, 1);
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    
    luaL_checktype(L, -1, LUA_TSTRING);
    
    std::string name = lua_tostring(L, -1);
    (*s)->setName(name);
    return 0;
}

int l_setAge(lua_State* L)
{
    Student **s = (Student**)lua_touserdata(L,1);
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    luaL_checktype(L, -1, LUA_TNUMBER);
    int age = lua_tonumber(L, -1);
    (*s)->setAge(age);
    return 0;
}

int l_getName(lua_State* L)
{
    Student **s = (Student**)lua_touserdata(L,1);
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    lua_settop(L, 0);
    lua_pushstring(L, (*s)->getName().c_str());
    return 1;
}

int l_getAge(lua_State* L)
{
    Student **s = (Student**)lua_touserdata(L,1);
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    lua_settop(L, 0);
    lua_pushnumber(L, (*s)->getAge());
    return 1;
}

int l_print(lua_State* L)
{
    Student **s = (Student**)lua_touserdata(L,1);
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    (*s)->print();
    
    return 0;
}
```
从这里我们可以看到，userdata充当了C++类和Lua的一个桥梁，另外，我们在从Lua栈里面取出数据的时候，一定要记得检查数据类型是否合法。

### 注册C API到Lua里面

最后，我们需要把刚刚编写的这些函数注册到Lua虚拟机里面去。

```cpp
static const struct luaL_Reg stuentlib_f [] = {
    {"create", newStudent},
    {"setName",l_setName},
    {"setAge", l_setAge},
    {"print", l_print},
    {"getName",l_getName},
    {"getAge", l_getAge},
    {NULL, NULL}
};
int luaopen_student (lua_State *L) {
    luaL_newlib(L, stuentlib_f);
    return 1;
}
```

现在，我们把luaopen_student函数添加到之前的注册函数里面去:

```cpp
    static const luaL_Reg lualibs[] =
    {
        {"base", luaopen_base},
        {"io", luaopen_io},
        {"cc",luaopen_student},
        {NULL, NULL}
    };
    const luaL_Reg *lib = lualibs;
    for(; lib->func != NULL; lib++)
    {
        //注意这里如果使用的不是requiref，则需要手动在Lua里面调用require "模块名"
        luaL_requiref(L, lib->name, lib->func, 1);
        lua_settop(L, 0);
    }
```

### Lua访问C++类

现在，我们在Lua里面操作这个Student类。注意，我们绑定的每一个函数都需要一个student对象作为参数，这样使用有一点不太方便。

```cpp
local s = cc.create()
cc.setName(s,"zilongshanren")
print(cc.getName(s))
cc.setAge(s,20)
print(cc.getAge(s))
cc.print(s)
```
最后，输出的结果为:

```cpp
zilongshanren
20
My name is: zilongshanren, and my age is 20
```

## 提供Lua面向对象操作API

现在我们已经可以在Lua里面创建C++类的对象了，但是，我们最好是希望可以用Lua里面的面向对象的方式来访问。

```cpp
local s = cc.create()
s:setName("zilongshanren")
s:setAge(20)
s:print()
```
而我们知道s:setName(xx)就等价于s.setName(s,xx)，此时我们只需要给s提供一个metatable,并且给这个metatable设置一个key为"__index"，value等于它本身的metatable。最后，只需要把之前Student类的一些方法添加到这个metatable里面就可以了。

### MetaTable

我们可以在Registry里面创建这个metatable,然后给它取个名字做为索引，注意，为了避免名字冲突，所以这个名字一定要是独一无二的。

```cpp
   //创建名字为tname的metatable并放在当前栈顶，同时把它与Registry的一个key为tname的项关联到一起
   int   luaL_newmetatable (lua_State *L, const char *tname);
   //从当前栈顶获取名字为tname的metatable
   void  luaL_getmetatable (lua_State *L, const char *tname);
   //把当前栈index处的userdata取出来，同时检查此userdata是否包含名字为tname的metatable
   void *luaL_checkudata   (lua_State *L, int index,const char *tname);
```
接下来，我们要利用这3个C API来为我们的student userdata关联一个metatable.

### 修改绑定代码

首先，我们需要创建一个新的metatable，并把setName/getName/getAge/setAge/print函数设置进去。
下面是一个新的函数列表，一会儿我们要把这些函数全部设置到metatable里面去。

```cpp
static const struct luaL_Reg studentlib_m [] = {
    {"setName",l_setName},
    {"setAge", l_setAge},
    {"print", l_print},
    {"getName",l_getName},
    {"getAge", l_getAge},
    {NULL, NULL}
};
```
接下来，我们创建一个metatable，并且设置metatable.__index = matatable.注意这个cc.Student的元表会被存放到Registry里面。

```cpp
int luaopen_student (lua_State *L) {
    luaL_newmetatable(L, "cc.Student");
    lua_pushvalue(L, -1);
    lua_setfield(L, -2, "__index");
    luaL_setfuncs(L, studentlib_m, 0);
    luaL_newlib(L, stuentlib_f);
    return 1;
}
```

最后，我们记得在创建Student的时候把此元表与该userdata关联起来，代码如下：

```cpp
int newStudent(lua_State * L)
{
    Student **s =  (Student**)lua_newuserdata(L, sizeof(Student*));  // lua will manage Student** pointer
    *s = new Student;
    luaL_getmetatable(L, "cc.Student");
    lua_setmetatable(L, -2);
    return 1;
}
```
另外，我们在从Lua栈里面取出Student对象的时候，使用的是下面的函数

```cpp
    Student **s = (Student**)luaL_checkudata(L,1,"cc.Student");
```
这个luaL_checkudata除了可以把index为1的栈上的元素转换为userdata外，还可以检测它是否包含“cc.Student”元表，这样代码更加健壮。
例如，我们之前的setName函数可以实现为:

```cpp
int l_setName(lua_State * L)
{
     Student **s = (Student**)luaL_checkudata(L,1,"cc.Student");
    luaL_argcheck(L, s != NULL, 1, "invalid user data");
    
    luaL_checktype(L, -1, LUA_TSTRING);
    
    std::string name = lua_tostring(L, -1);
    (*s)->setName(name);
}
```
这里有Student类的完整的新的[绑定代码](http://git.oschina.net/zilongshanren/Lua-Tutorials/blob/master/LuaCocos2D-X/Classes/CppClass.h).

### Lua访问C++类

现在，我们可以用Lua里面的面向对象方法来访问C++对象啦。

```cpp
local s = cc.create()
s:setName("zilongshanren")
print(s:getName())
s:setAge(20)
print(s:getAge())
s:print()
```

这里输出的结果为:

```cpp
zilongshanren
20
My name is: zilongshanren, and my age is 20
```

## 管理C++内存
当Lua对象被gc的时候，会调用一个__gc方法。因此，我们需要给绑定的C++类再添加一个__gc方法。

首先是C++端的实现:

```cpp
static int auto_gc(lua_State *L)
{
    Student **s = (Student**)luaL_checkudata(L,1,"cc.Student");
    if( s )
    {
        delete *s;
    }
    
    return 0;
}
```

然后，添加注册函数：

```cpp
static const struct luaL_Reg studentlib_m [] = {
    {"__tostring",student2string},
    {"setName",l_setName},
    {"setAge", l_setAge},
    {"print", l_print},
    {"getName",l_getName},
    {"getAge", l_getAge},
    {"__gc", auto_gc},
    {NULL, NULL}
};
```
最后，我们在Stendent的构造函数和析构函数里面添加输出：

```cpp
Student::Student()
:name("default")
{
cout<<"Student Contructor called"<<endl;
}

Student::~Student()
{
cout<<"Student Destructor called"<<endl;
}
```

接下来是Lua代码：

```cpp

local s = cc.create()
s:setName("zilongshanren")
s:setAge(20)
s:print()

--当一个对象设置为nil，说明没有其它对应引擎之前cc.create创建出来的对象了，此时lua返回到c程序的时候会调用gc
s = nil

--如果想在Lua里面直接手动gc，可以调用下列函数
--collectgarbage
```

最后，程序输出结果如下：

```cpp
Student Contructor called
My name is: zilongshanren, and my age is 20
Student Destructor called
```


## 总结

本文主要介绍如何使用UserData来绑定C/C++自定义类型到Lua，同时通过引入MetaTable，让我们可以在Lua里面采用更加简洁的面向对象写法来访问导出来的类。下一篇文章，我们将介绍Cococs2D-X里面的tolua++及其基本使用方法。
PS：附上[本文源代码](http://git.oschina.net/zilongshanren/Lua-Tutorials)，注意在LuaCocos2D-X工程里面。

## Reference

  * [使用cpp模板来绑定到Lua](http://lua-users.org/wiki/SimplerCppBinding)

  * [SimpleCppBinding](http://lua-users.org/wiki/SimpleCppBinding)

  * [How to return c object to lua 5.2](http://stackoverflow.com/questions/14618002/how-to-return-c-object-to-lua-5-2)

  * [Lua gc](http://stackoverflow.com/questions/14096204/does-lua-gc-metamethod-now-work-for-table-lua-5-2-1) 
