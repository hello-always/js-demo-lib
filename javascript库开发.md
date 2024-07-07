# javascript库开发

你是不是有过这样的一个想法：写一个javascript库不就是把一段通用的代码抽离出来，在按照某种范式封装一下么？

> [!NOTE]
>
> - 为什么有的人写的很受欢迎，有的反而没人用。
> - 你为什么愿意使用某个库？
> - 流行的库有什么共同的点？
> - 写的==`好`==的一个库，需要符合什么条件呢？

需要考虑稳定性、可维护性、安全性、一些攻击性的测试用例。

注重代码的可读性、易理解性。

架构设计、接口设计、文档撰写、注释情况、代码风格等。

团队内部的技术共建也是类似的。

## 1. 如何开始

![image-20240629170028152](/Users/lucia/Library/Application%20Support/typora-user-images/image-20240629170028152.png)

可以从项目中寻找灵感，对其中的一些功能进行抽象设计，提取通用逻辑等形成一个原型想法。例如获取url上的属性等。

目标确定之后就可以编写对应的代码了。

```js
function getUrlParam(name, url) {
    name = String(name);
    url = String(url);
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) {
        return '';
    }
    return results[1] || ''
}
```

这个库的第一个版本就完成了。但是当分享给别人使用时，可能会出现一些问题：

1. 使用commonjs，怎么引入我们的库？
2. 代码会在IE浏览器10以下报错。

## 2. 如何构建

在ECMAScript 2015之后推出了模块化，前端规范快速更新，但是整个生态仍然难以快速转换。库的使用者们有不同的客户端环境，使用不同的技术体系，他们是更希望使用稳定并且成熟的技术的。但是对于开发库的开发人员来说，是更想使用新技术的。

而构建流程就是为了协调库的开发者和使用者之间的对于新旧技术产生的矛盾的。

### 2.1 模块化

在ES6之前，并没有统一的模块规范。但是对于项目来说模块化又是必不可少的。于是社区中就出现了一些影响力较大的规范：AMD，CommonJS等，目前仍然被广泛使用。

#### 2.1.1 什么是模块

由于程序的扩大，项目中引入的各种第三方依赖库等，共享全局作用域会带来非常多的问题。首先就是命名冲突，为了解决命名冲突，主流编程语言都提供了语言层面的方案：

- C语言的宏编译。
- C++的命名空间。
- Java语言中的包。
- Python语言中的模块。
- ......

JavaScript社区选择了模块方案。一个合格的模块方案需要满足以下特性：

- 独立性------能够独立完成某个功能，隔绝外部环境的影响。
- 完整性------能够完成某个特定的功能。
- 可依赖------可以依赖其他的模块。
- 被依赖------可以被其他模块依赖。

也就是说，模块就是一个单独的空间能引用其他的模块，也可以被其他的模块引用。

#### 2.1.2 原始模块

如果从定义层面看，一个函数就能被称为一个模块。

```js
function add(a, b) {
  return a + b;
}
```

在ES6之前，只有函数能够创建作用域。下面是原始模块的定义代码。

```js
(function (mod, $) {
  function clone (data) {
    // 代码
  }
  mod.clone = clone；
})((window.clone = window.clone || {}), jQuery)
```

以上的mod模块不会被重复定义，依赖通过函数参数的方式注入。

这种实现，需要手动维护依赖的顺序。其中的jQuery必须先于代码被引入，否则报错。

一般的库都会提供对这种模块的支持，因为这种模块可以通过直接script标签引入。

#### 2.1.3 AMD

AMD（Asynchronous Module Definition）异步模块定义：是一种异步模块加载规范，专为浏览器端设计。定义模块如下：

```js
define(id?, dependencies?, factory);
```

浏览器并不支持AMD模块，需要借助RequireJS才能加载AMD模块。RequireJS时使用的最广泛的AMD模块加载器。

#### 2.1.4 CommonJS

CommonJS是一种同步模块加载规范，目前主要适用于Node.js中。CommonJS规范规定，每个模块内部，module变量代表当前模块。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。**加载某个模块，其实是加载该模块的module.exports属性**。定义模块的方式如下：

```js
define(function (require, exports, module) {
     // 代码  
})
```

在Node.js中，外部的define包裹函数是系统自动生成的。

```js
// 文件名就是模块名，无依赖模块
module.exports = function clone (data) {
  
}
```

使用：

```js
const clone = require(./clone.js);
```

#### 2.1.5 UMD

UMD（Universal Module Definition）通用模块定义：是一种通用模块加载规范。是对原始模块、AMD、CommonJS的整合，支持UMD的库可以在任何模块环境中工作。

使用：

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory());
})(this, (function () { 'use strict';

    function getUrlParam(name, url) {
        name = String(name);
        url = String(url);
        const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
        if (!results) {
            return '';
        }
        return results[1] || ''
    }

    return getUrlParam;

}));
```

#### 2.1.6 ES Module

ECMAScript 2015之后有了原生的模块系统--ES Module。目前部分浏览器支持直接使用ES Module，不兼容的浏览器可以通过构建工具🔧来使用。

```js
// getUrlParam.js
export function getUrlParam(name, url) {
    name = String(name);
    url = String(url);
    const results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
    if (!results) {
        return '';
    }
    return results[1] || ''
}

// 使用
import { getUrlParam } from './getUrlParam.js'
getUrlParam();
```

库提供两个入口文件，来支持各个模块的使用者。

| 入口文件     | 支持的模块                   |
| :----------- | ---------------------------- |
| index.js     | 原始模块、AMD、CommonJS、UMD |
| index.esm.js | ES Module                    |

### 2.2 技术体系

一般JavaScript库都会依赖一些其他的库，依赖关系会很复杂。

#### 2.2.1 传统体系

如果想要使用一个库，就必须在使用之前手动引入需要使用到的库和其依赖的库。

#### 2.2.2 Node.js 

Node.js模块系统遵循CommonJS规范，其有内置的依赖解析系统，如果要依赖一个模块，可以直接使用require系统函数直接引用文件。

Node.js模块目录下需要有一个package.json文件，用于定义模块的一些属性。如果想要新建模块，可以使用`npm init`快速初始化模块。

其中`main`字段，定义的是当前模块的入口文件，当该模块被其他模块使用的时候，就通过其找到对应的文件。

#### 2.2.3 工具化

随着前端工程化的发展，构建工具已经成为中大型项目的必备。构建工具的典型代表是webpack，支持CommonJS规范。

最开始的工具仅支持CommonJS规范，随着ECMA2015的发布，rollup.js最先支持ES Module，目前的主流构建工具都已经支持ES Module。

打包工具在加载一个库的时候，需要知道这个库是支持CommonJS模块还是ES Module的，构建工具给的方案是拓展一个新的入口字段，可以通过设置这个字段来标识是否支持ES Module。由于历史原因分别是 **module**和 **jsnext**，比较主流的是**module**，也可以两个都设置。

```json
{
  "main":"index.js",
  "module":"index.esm.js",
  "jsnext":"index.esm.js"
}
```

在 **webpack**中可以通过设置**mainFields**来支持优先使用**module**字段：

```js
module.exports = {
  // ......
  resolve: {
    mainFields: ['module','main'],
  }
}
```

打包工具（rollup.js）会优先查看依赖的库是否支持ES Module，如果不支持则会遵循CommonJS规范。

所以需要提供对两种模块的支持，但是对其依赖的库不需要进行特殊处理。

总结：

| 技术体系    | 模块规范             | 依赖库的处理逻辑 |
| ----------- | -------------------- | ---------------- |
| 传统体系    | 原始模块             | 依赖打包         |
| Node.js体系 | CommonJS             | 无需处理         |
| 工具化体系  | CommonJS + ES Module | 无需处理         |

### 2.3 打包方案

对于不同模块规范和前端技术体系下，进行手动适配会很麻烦和复杂，比较好的办法是使用打包工具来自动完成打包工作。

对于不同的环境需要提供不同的入口文件。

|            | 浏览器（script、AMD） | 打包工具（webpack、rollup.js） | Node.js  |
| ---------- | --------------------- | ------------------------------ | -------- |
| 入口文件   | index.umd.js          | Index.esm.js                   | Index.js |
| 模块规范   | UMD                   | ES Module                      | CommonJS |
| 自身依赖   | 打包                  | 打包                           | 打包     |
| 第三方依赖 | 打包                  | 不打包                         | 不打包   |

#### 2.3.1 选择打包工具

虽然webpack是非常流行的打包工具，比较适合企业项目类，对于库的打包而言更推荐的是rollup.js，而我们的项目中也大量使用了rollup.js。

主要原因是在打包的输出产物中，webpack本身会加上其自身的模块系统代码，这是冗余代码。如果是业务代码问题倒是不大，但是对于一个库来说不太友好。

打包工具的使用可以参考rollup.js官方文档。

#### 2.3.2 按需加载

很多时候，我们使用一个库只会用到其中的一部分功能，这时候就需要支持按需加载。

按需加载分为两种情况：

- 我们的库要用到其他库的一些功能，这时候可以通过rollup.js的treeshaking自动屏蔽未被使用的功能。

- 使用库的项目能够按需加载。一个库如果不进行任何配置，打包工具是不会使用treeshaking对其进行优化的，因为打包工具无法知道一个库是否有副作用。比如在window中写入了一个变量，被屏蔽就会产生bug。如果我们的库没有副作用，则可以在`package.json`中添加sideEffects字段，打包工具就能够使用treeshaking进行优化。

  ```json
  {
    "sideEffects": false
  }
  ```


### 2.4 兼容方案

> [!NOTE]
>
> 为什么要确定兼容方案呢？
>
> 当库被用到生产环境的时候，用户真实的运行环境是不可控的，新的语言特性可能会产生报错。由于JavaScript的错误是中断式的，会导致整个页面失去响应，所以这是不能接受的。

#### 2.4.1 确定兼容环境

需要解决这个问题，需要库的开发者给出关于库的兼容性的说明，这样使用者可以根据自己的需求来选择。兼容性越好，那么使用的范围就越广，但是成本也会更高，需要衡量。

兼容的环境一般来说是浏览器和Node.js。

- 浏览器版本：statcounter是一款统计全球浏览器市场份额的工具，提供详细的数据。 browserslist.dev网站查看具体配置。

  对于国内的浏览器市场份额数据，可以参考百度流量研究院发布的数据。

- Node.js版本：可以参考官方提供的metrics数据。

#### 2.4.2 ES6 兼容方案

目前流行的方案是使用转换器将 **ECMAScript 2015** 代码自动编译为 **ECMAScript 5** 代码。常用的工具是**Babel**。对于API可以使用对应的polyfill库core-js来解决兼容问题。Babel同样也集成了core-js。

### 3. 测试

随着库的代码行数增多，Bug无法避免，最好的方式就是进行测试。

单元测试比较适合库的开发场景。设计测试用例的方法有两种：

- 测试驱动开发（TDD）：它的原理就是**在编写代码之前先编写测试用例**，由测试来决定我们的代码。
- 行为驱动开发（BDD）：BDD 核心目的是为了解决 TDD 模式下开发和实际功能需求不一致而诞生，BDD 不需要再面向实现细节设计测试，取而代之的是**面向行为来测试**。

#### 3.1 测试框架的选择

Stateofjs 网站提供了一份前端社区调查报告，用于确定Web开发生态中出现的趋势，用以帮助开发人员做出技术选择。其中的测试框架可以做为一种选择。

推荐使用Mocha或者Jest作为测试框架。例如Jest可以提供组织和运行单元测试并输出测试报告的能力。

#### 3.2 测试用例设计

在编写测试代码之前，要先设计测试用例，测试用例要尽可能全面的覆盖各种情况。以函数为例，可以按照参数分组，每个参数为一组，在对参数进行测试时，保证其他的参数没有影响。

#### 3.3 验证测试覆盖率

代码覆盖率是衡量测试是否严谨的指标。

##### 3.3.1 代码覆盖率

Istanbul是JavaScript中十分常用的代码覆盖率检查工具，提供的npm包为**nyc**。

四个维度来衡量代码覆盖率：

- 语句覆盖率（Statement Coverage）
- 分支覆盖率（Branch Coverage）
- 函数覆盖率（Function Coverage）
- 行覆盖率 （Line Coverage）

3.3.2 校验覆盖率

当代码覆盖率低于某个百分比时进行报错提示。

#### 3.4 模拟浏览器测试

在Nodejs中模拟浏览器环境推荐使用jsdom，其提供了对DOM和BOM的模拟。

#### 3.5 真实浏览器环境测试

Mocha是支持在浏览器环境中运行的

#### 3.6 自动化测试

Chrome的Headless特性，支持通过命令启动一个没有界面的进程，和真实浏览器没有差异。在Node.js中可以通过Puppeteer工具，其对Chrome Headless 进行了封装。

### 4. 发布

当代码开发完成之后，就需要进行代码库的发布了。

#### 4.1 开源协议

在进行开源之前需要先选择一个开源协议，主要目的是明确声明自己的权利。开源项目常用的协议主要有五个：GPL、LGPL、MIT、BSD、Apache。前端项目使用的最多的是MIT、BSD、Apache这三者。

#### 4.2 文档

当使用一个库的时候，我们希望有清晰完整的文档，一个合格的前端库文档应当需要包含以下内容：

- README：使用者最先看到的内容。

  - 库的介绍——概括介绍解决的问题。
  - 使用者指南——帮助使用者快速了解如何使用。
  - 贡献者指南——方便社区做贡献。

- 待办清单：记录即将发布的内容或者未来的计划。

- 变更日志：记录每次更新详细的变更内容（CHANGELOG）。

  - 方便使用者升级版本了解升级内容。
  - 方便开发者自身当作备忘录。

- API文档：提供详细的内容

  - 功能少可以直接放在README中。
  - 较多可以单独写一个文件。
  - 复杂可以直接生成一个网站来做介绍。

  #### 4.3 发布

  发布GitHub和npm上。

  发布npm并不是所有文件都发布，一般只发布dist目录和LICENSE，README.md、CHANGELOG.md和package.json是默认发布的。npm提供了黑名单和白名单的方式过滤文件。

  黑名单的方式：npm会自动忽略.gitignore内的文件，还会忽略node_modules和package-lock.json,如果还要忽略其他文件，在根目录下添加.npmignore文件，规则匹配的文件都会被npm忽略。

  白名单的方式：在package.json文件中添加files字段，则只有在files中的文件才会被发布，白名单的优先级高于黑名单。

  npm通过版本号来管理一个库的不同版本，发布到npm的包需要遵循语义化版本，格式为“主版本.次版本.修订号-先行版本号”，即‘x.y.z-prerelease’。

  - x代表不兼容的改动。
  - y代表新增了功能。
  - z代表修复bug，向下兼容。
  - prerelease，是可选的，可以是被“.”分割的任意字符。一般用来发布测试版本。

  正式包的发布比较简单，测试包需要借助npm提供的标签功能，如果不添加标签，则会默认发布到latest标签，发布到其他标签（如beta）的包需要制定版本号才能安装。

  ```bash
  npm publish --tag=beta # 发布测试包
  npm publish # 正式
  ```

  在包发布成功之后，添加git tag，可以帮助找到对应历史的某个版本对应的源码。

  ```git
  git tag 1.0.0 # 添加制定版本的tag
  git push --tags # 将tag推送到远端
  ```

  npm提供的version命令也可以修改版本号。其除了可以修改版本号，还可以自动添加git tag。

  ```bash
  # 初始版本 1.0.0
  npm version prerelease --preid=beta # 1.0.0-beta.1
  npm version patch # 1.0.1
  npm versiom minor # 1.1.0
  npm version magor # 2.0.0
  ```

  npm命令行为为每个执行命令提供了pre&post钩子，代表执行前和后。

  ```cmd
  npm run preinstall
  npm install
  npm postinstall
  // --ignore-scripts参数表示跳过postinstall钩子
  ```



### 5. 规范

####  5.1 一些规范

在多人协作的项目里，统一的规范对开发效率和代码质量至关重要。对于库开发中的规范主要有：编辑器、格式化、代码lint和提交信息等方面。

##### 5.1.1 格式化

代码格式化工具：prettier。

prettier可以和git集成，在使用git提交时可以将提交文件自动格式化。

其原理是git自身提供的hook功能，git在每次提交前都会检查是否存在pre-commit hook,如果存在就会执行其中的命令，那么在其中加入格式化的命令们就可以实现提交时的自动格式化了。

但是可能存在以下问题：

1. 不想要将整个项目格式化，只格式化本次提交的文件，pretty-quick工具可以实现选择性格式化，--staged实现只格式化待提交文件。
2. 添加对应的钩子，加入格式化的代码时需要处理跨平台的问题，同时需要将写好的hook让每个用户都安装。husky就是这样一个npm包。

**husky**的安装后，会在**package.json**中添加下面代码,同时会多出一个.husky目录，其中的pre-commit就是我们要用到的git hook，husky会将git的hooksPath的配置从.git/hook改为.husky。

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

##### 5.1.2 代码 Lint

同样的逻辑，实现方式可以有很多种，ESLint是社区中最流行的代码校验工具，通过插件的方式提供了对JavaScript代码的最佳实践。

ESLint是可组装的代码检查工具，内置上百个校验规则，但默认都是关闭的，如果想要使用某个校验规则，需要配置rules手动开启。但是手动配置其实是比较麻烦的，可以配置社区成熟的规则集，比如官方规范或者**Airbnb**的规范。

ESLint本身的校验规则可以分为代码风格和代码质量。

代码风格目前使用了prettier，由于两者都可以处理代码风格，所以可能会产生冲突。

避免产生这个问题，需要讲两者的规则冲突规则关闭。eslint-plugin-prettier、eslint-config-prettier。前者可以让ESLint对prettier的代码风格进行检查，如果不符合prettier的地方报错，原理是先使用prettier进行格式化，然后对比格式化之前代码，不一致报错。后者是一个规则集，作用是把ESLint和Prettier的规则冲突的规则关闭。

如果在git提交时运行ESLint，就可以多一层代码质量的保障，可以直接使用前面提到的husky，在.husky/pre-commit文件中添加**npm run lint**就可以在提交时校验整个项目。但是如果项目比较大，就会比较耽误时间。那么可以只针对本次提交的代码进行校验。可以使用**LintStaged**工具，LintStaged不仅可以对指定文件运行指定命令，还可以根据命令结果终止提交。

##### 5.1.3 提交信息

代码提交时每次都要写提交信息，提交信息需要清晰明了，说明本次提交的目的，但是不同的人有不同的理解和习惯，那么需要有一个统一的信息提交格式。

- 规范的约束作用，避免出现无意义的提交信息。
- 规范的提交信息，在对log的分类、检索时更方便。
- 当生成变更日志时，可以直接从提交信息中提取。

社区中的最佳实践使用比较多的有**Conventional Commits**，约定式提交是一种用于给提交信息增加可读含义的规范，但是其本身只有fix/feat两种。@commitlint/config-conventional是Angular团队使用的给予其的拓展规则，带来了更多的type值。

为了保证规范的执行，增加校验环境。commitlint提供了一系列校验相关工具。

```js
// 安装对应依赖
// npm install - D @commitlint/config-conventional @commitlint/cli
// 项目根目录下添加配置文件 commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

可以将commitlint和husky进行集成。执行git commit命令时会自动使用commitlint校验提交信息，如果失败则不能提交。

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

输入提交信息后再校验，虽然可以保证提交信息符合规范，但是体验并不是很好，commitlint 提供了 @commitlint/prompt-cli 交互式输入命令。

```json
// 安装依赖
// npm install -D @commitlint/prompt-cli
// package.json
{
  "script": {
    "ci": "commit"
  }
}
```

使用 **npm run ci** 代替 git commit 命令，之后就会有结构化的提醒和校验提示信息。但是commitlint的交互提示不是很好用，commitizen是一款专门用于交互式录入提交信息的工具，可以将二者结合使用。让commitizen专注于提交信息的录入，commitlint做提交信息的校验。

```json
// 安装依赖
// npm install -D @commitlint/cz-commitlint commitizen
// package.json
{
  "script": {
    "cz": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "@commitlint/zc-commitlint"
    }
  }
}
```

使用 **npm run cz** 代替 git commit 命令，提供了更友好的交互方式。

每次发布新版本都需要记录变更日志，历史提交信息是记录变更日志的重要参考，在发布新版本之前需要手动查阅提交记录，整理变更日志，符合**Conventional Commits** 规范的提交信息，可以使用 Standard Version工具自动生成变更日志。

#### 5.2 持续集成

前面讲到的很多的规范，目的是在本地进行校验，依赖于git hook的功能，但是可以被绕过，如果添加--no-verify，就可以跳过校验。

但是如果能在服务器上进行校验，就解决了校验被绕过的问题。

持续集成CI（Continuous Integration）是一种软件开发实践，团队开发成员经常集成他们的工作，通常每个成员每天至少集成一次。每次集成都通过自动化的构建（包括编译、发布、自动化测试）来验证，从而今早发现集成错误。

例如 Github actions、Jenkins等。

### 6.  未完待续

- 开发一个脚手架工具
- 跟随社区发展的脚步，采用更新的或者优质的技术，比如TypeScript，Deno，SWC，esbuild，Vite等等......







