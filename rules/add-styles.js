module.exports = function (ast, $) {
  const styles = [];

  const newAst = () => {
    return ast

      /**
       * 检索并归集
       * 
       * 有限无法替换的，就用 code 的 正则检索工具 `[A-Z_]+ ` 找到并选择替换
       */
      .find(`const $_$1: $_$2 = $_$3`)
      .each((item) => {
        if (!item) return // 必须保证 ast 完整返回
        if (item.match) {
          const varName = item.match[1][0].value.toLowerCase();
          const varContent = item.match[3][0].value;
          const varNode = item.match[3][0].node;

          // console.log('nameNode: ', item.match[1][0].node);
          // console.log('nameNode name: ', item.match[1][0].node.name);
          // console.log('contentNode: ', item.match[3][0].node);
          const argObj = {};

          // 如果已经重构为了 FC 函数，该函数要排除
          // 这里会把类定义里，类似 `const params: Type =` 的参数也收集删除，可以按照 Type 做个判断（只有 imageType 等才可以处理），避免误伤
          const typeNode = item.match[2][0];
          const types = ['ViewStyle', 'TextStyle', 'ImageStyle']
          if (
            typeNode.type === "TSTypeReference" &&
            typeNode.typeName &&
            // typeNode.typeName.name !== "FC" // 且不是 ['imageType', 'viewType', ...] 的
            types.includes(typeNode.typeName.name)
          ) {
            argObj.key = varName;
            argObj.value = varContent;
            styles.push(argObj);
            item.remove();
          }
        }
      })
      .root()
  };

  const doAst = () => {
    const ast = newAst();
    if (styles.length > 0) {
      return ast
        // 在最前面插入 import
        // .find(`import React from "react"`) // 可能不存在？
        // .find(`import $_$1 from '$_$2'`) // 这个通用，但是可能多插入
        .root()
        .before(
          `import EStylesheet from 'react-native-extended-stylesheet' \n`
        )
        .root()

        // .find(`class $_$ {}`)
        .after(`\nconst styles = EStylesheet.create({})`)
        .root()

        .find(`EStylesheet.create({})`)
        .each((item) => {
          styles.forEach((style) => {
            const code = `{}`
            // https://gogocode.io/zh/docs/specification/cookbook#15%E6%A0%B9%E6%8D%AE%E5%8E%9F%E8%8A%82%E7%82%B9%E7%BB%93%E6%9E%84%E6%9E%84%E9%80%A0%E6%96%B0%E8%8A%82%E7%82%B9
            $(item.attr("arguments.0")).append("properties", `${JSON.stringify(style.key)}: ${style.value}`);// 带引号了
          });
        })
        .root()

        // fixme: 去不掉引号，下面的换成了单引号
        // .find(`EStylesheet.create({})`)
        // .replace(`"$_$": {$$$}`, `$_$: {$$$}`)
        // .root()

        // 替换
        // 匹配：<View xxx style={STATUS_ITEM}> 和 <View yyy style={STATUS_ITEM}></View>
        .find(["<$$$ $$$1 style={$_$} ></$$$>", "<$$$ $$$1 style={$_$} />"], { ignoreSequence: true }) 
        .each((item) => {
          const itemValue = item.match[0][0].value;
          styles.forEach((style) => {
            if (itemValue === style.key.toUpperCase()) {
              // console.log('item: ', item);
              item.replace(
                `${item.match[0][0].value}`,
                `styles.${style.key}`
              );
            }
          });
        })
        .root()

        // 匹配：<View BBstyle={[TEXTINPUTLAYOUT, { marginTop: 0 }]}> 和 
        // styles={{
        //   topTabBarSplitLine: styles.tab_border,
        //   bottomTabBarSplitLine: styles.tab_border,
        // }}
        .find(["<$$$ $$$1 $$$2={$_$} ></$$$>", "<$$$ $$$1 $$$2={$_$} />"])
        .each(item => {
          const itemNode = item.match[0][0].node
          item.find('$_$')
          .each(i => {
            const itemValue = i.match[0][0].value

            styles.forEach(style => {
              if (itemValue === style.key.toUpperCase()) {
                // console.log('itemValue: ', itemValue);
                i.replaceBy(`styles.${style.key}`)
              }
            })

          })
        })
        .root()

        // fixme: 这个没实现，暂时提醒吧
        // https://gogocode.io/zh/docs/specification/cookbook#19%E6%9C%89%E6%9D%A1%E4%BB%B6%E7%9A%84%E4%BF%AE%E6%94%B9%E5%AF%B9%E8%B1%A1%E6%9F%90%E4%B8%AA%E5%B1%9E%E6%80%A7%E5%80%BC
        // 将嵌套的属性替换 比如：...SUBMIT_TITLE
        .find(`const styles = EStylesheet.create({})`)
        .find(`$_$: {...'$_$1', $_$2}`)
        .each(item => {
          const name = item.match[1][0].value
          // styles.forEach(style => {
          //   if (name === style.key.toUpperCase()) 
          console.log('请手动替换: ', name);
          // })
        })
        // .replace(`$_$: {$_$1, $_$2}`, (match => {
        //   const name = match[1][0].value
        //   const other = match[2][0].value
        //   // console.log('styles[name]: ', styles[name]);
        //   return styles.forEach(style => {
        //     if (name === '...' + style.key.toUpperCase()) {
        //       console.log('name: ', name);
        //       console.log('other: ', other);
        //       // console.log('style.key: ', style.key);
        //       // console.log('style.value: ', style.value);
        //       const newStyle = { ...style.value, ...other }
        //       console.log('newStyle: ', newStyle);
        //       return `$_$: ${ newStyle }`
        //     } else {
        //       return `$_$: {$_$1, $_$2}`
        //     }
        //   });
        // }))
        // .each(item => {
        //   const name1 = item.match[1][0].value
        //   const name2 = item.match[2][0].value
        //   const node2 = item.match[2][0].node
        //   // console.log('re item: ', item);
        //   // console.log('re item: ', item[0].nodePath.value.value.properties);
        //   console.log('re node2: ', node2);
        //   console.log('re name1: ', name1);
        //   console.log('re name2: ', name2);
        //   item.replaceBy(styles[name2.toUpperCase()])
        //   // item[0].nodePath.value.value.properties[0].replaceBy(styles[name2.toUpperCase()])
        // })
        .root()

    } else {
      // 什么都没做，原样返回
      return ast;
    }
  };

  return doAst();


};
