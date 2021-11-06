React Native Codemod 
-----------------

这是一个 React & React Native 升级工具集，感谢 [gogocode]()

## 目标

支持以下常用工具的升级

### React Native

- [x] StyleSheet 样式批量更新 【不通用 不要对生产代买进行操作】
- [ ] react-navigation  v4/5 升级到 v6
- [ ] 其他

### React

## 使用

命令行调用方式：

```
$ datm-codemod ./input.tsx
```

如果对当前文件夹下的全部文件进行转换，命令如下：

```
$ datm-codemod
```

提示你是否覆盖文件，选择 'Y’ 即可

注：如果出现 zsh 无法找到datm-codemod命令的错误，请运行下面的命令

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