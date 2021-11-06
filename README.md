DDN Codemod 
-----------------

这是一套代码升级工具集。当有大版本升级的时候，往往需要大量的代码重构，手动耗时费力，而且容易出错，一定要使用工具。这里感谢 [gogocode]()，该工具简单直接，使用习惯非常像传统的“查找/替换”，容易上手。不过成熟度不高，文档也不是很完善，希望它越做越好。

## 目标

支持以下常用工具的升级

- [x] React Native StyleSheet 样式批量更新 【不通用 不要对生产代买进行操作】
- [x] React Native react-navigation  v4/5 升级到 v6
- [ ] React
- [ ] 其他持续添加

## 使用

命令行调用方式：

```
$ ddn-codemod ./input.tsx
```

如果对当前文件夹下的全部文件进行转换，命令如下：

```
$ ddn-codemod
```

提示你是否覆盖文件，选择 'Y’ 即可

注：如果出现 zsh 无法找到ddn-codemod命令的错误，请运行下面的命令

```
$ chmod u+x bin/cli.js // 给它执行权限
```

## TODO

- 去除样式的引号；
- 去除...引用；
- 迁移 setState
- 。。。


## 授权

MIT Licence