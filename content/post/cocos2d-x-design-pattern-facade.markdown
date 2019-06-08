---
comments: true
date: 2014-06-10 14:53:10+00:00 +08:00
slug: cocos2d-x-design-patterns-facade
title: Cocos2D-X设计模式:外观模式
wordpress_id: 99
categories:
- Cocos2d-x
- design pattern
tags:
- Cocos2d-x
- design pattern
---

## 1.应用场景

Cocos2d-x里面有一个非常明显的地方使用了外观模式，它就是SimpleAudioEngine。因为它为CocosDenshion这个子系统的一组接口提供了一个一致的界面，同时定义了一个高层接口，方便客户使用该子系统。

对于大多数用户来讲，游戏中操作声音，无非就是播放背景音乐和音效。CocosDenshion这个子系统封装了OpenAL，屏蔽了OpenAL操作声音的低级API。它提供了CDSoundEngine、CDAudioManager两个类来操作和管理声音。具体这两个类是如何工作的这里就不再讨论了，感兴趣的读者可以自行去研究相关代码。虽然CocosDenshion子系统已经封装了低级的操作声音的API，但是对于用户来讲，还是得了解该系统内部的类是如何一起协作来完成声音处理任务的。这样会加大用户使用此子系统的难度，同时，也使得客户程序与该子系统紧密耦合了。假如哪一天该子系统内部实现有所变化，这势必会影响到调用它的客户程序。众所周知，操作游戏音乐的代码是分散在游戏代码各处的，那样会造成“散弹式”修改。这是个严重的代码坏味道，需要引起警觉，果断重构之！

<!-- more -->

而外观模式就可以完美地解决此问题，SimpleAudioEngine就是最好的例子。如果使用过SimpleAudioEngine的人会发现，它实在是太简单了。但是，SimpleAudioEngine并不是万能的，比如，它就无法实现循环播放音效的功能。但是，没有关系，你可以使用CDSoundEngine来实现这个功能。

请注意，SimpleAudioEngine并没有增加新的功能，而只是把子系统现有的类进行组合来完成一些常用的任务，简化客户程序的使用。子系统对于外观类是不知情的，即子系统不会包含外观类的指针。

## 2.使用外观模式的优缺点

优点：

1）它对客户屏蔽子系统组件，因而减少了客户处理的对象的数目，并使得子系统使用起来更加方便。

2）它实现了子系统与客户之间的松耦合关系，而子系统内部的功能组件往往是紧密耦合的，这样当子系统功能组件发生变化的时候，只需要修改外观类的实现就可以了，避免了程序代码的“散弹式”修改。

3）同时，外观类并不限制客户直接使用子系统的功能组件，如果客户想使用子系统的更加高级的功能，可以越过外观类直接访问子系统的类。

缺点：

1）过多的或者不太合理的Façade也容易让人迷惑。到底是调用Façade好呢，还是直接调用子系统的模块好呢。

## 3.外观模式的定义及一般实现

UML图：

![uml](https://zilongshanren.com/img/FacadeDesignPattern1.png)

### 定义：

为子系统中的一组接口提供一个一致的界面，它定义了一个高层接口，这个接口使得子系统更加容易使用。它很好地体现了“最少知识原则”。

它的本质是：封装交互、简化调用。

### 实现(摘至维基百科)：

考虑下面一个例子：

设计你（You）如何与一台计算机（facade）进行交互，而计算机是一个非常复杂的系统，它内部包含CPU、HardDrive等。

```cpp
/* Complex parts */

class CPU {
    public void freeze() { ... }
    public void jump(long position) { ... }
    public void execute() { ... }
}

class Memory {
    public void load(long position, byte[] data) { ... }
}

class HardDrive {
    public byte[] read(long lba, int size) { ... }
}

/* Facade */

class Computer {
    private CPU cpu;
    private Memory memory;
    private HardDrive hardDrive;

    public Computer() {
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hardDrive = new HardDrive();
    }

    public void startComputer() {
        cpu.freeze();
        memory.load(BOOT_ADDRESS, hardDrive.read(BOOT_SECTOR, SECTOR_SIZE));
        cpu.jump(BOOT_ADDRESS);
        cpu.execute();
    }
}

/* Client */

class You {
    public static void main(String[] args) {
        Computer facade = new Computer();
        facade.startComputer();
    }
}
```

## 4.游戏开发中如何运用此模式

游戏开发过程中，暂时还没发现此模式的明显用法。不过，模式不是说学习了一定要马上就用到，那样会导致过度设计。如果读者开发游戏过程中，积累出一套比较成熟的框架，而这个框架又可以划分多个子系统，比如碰撞子系统、网络子系统、数据持久化子系统等。当外部使用此子系统时，操作的类过多，理解起来特别复杂时，这时候就可以考虑引入一个Façade类，来简化客户程序与子系统之间的调用关系。

## 5.外观模式与其它模式的关系

<del>通常来讲只需要一个外观类，所以可以采用单例模式。</del>
