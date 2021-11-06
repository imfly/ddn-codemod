/*
 * 本文件用来升级 react-navigation 
 * 
 * - 新版本只能通过 FC 函数导入 navigation 变量；
 * - 新版本只能使用 useLayoutEffect 函数定制 header；
 * - 新版本对header的定制有了更多变化，比如: header* 类方法都必须是函数
 * 
 * Created At: Thursday, 23rd September 2021 8:07:06 am By imfly (kubying@qq.com>)
 * Created By imfly (kubying@qq.com>)
 * 
 * Copyright（c) 2021 DATM FOUNDATION
 */

module.exports = function (ast, $) {
    // hack 原组件的代码，插入原类组件的上面
    const hackCodeWithObserver = (name) => {
        return `export const ${name} = observer((props) => {
            const route = useRoute()
            const navigation = useNavigation()
            const { userInforStore } = useStores()
            const isFocused = useIsFocused()
            const otherProps = { route, navigation, userInforStore }
        
            useLayoutEffect(() => {
                navigation.setOptions({
                    
                })
            }, [isFocused])
        
            return <${name}Component {...props} {...otherProps} />
        })
        `
    }

    const hackCode = (name) => {
        return `export const ${name} = (props) => {
            const route = useRoute()
            const navigation = useNavigation()
            const isFocused = useIsFocused()
            const otherProps = { route, navigation }
        
            useLayoutEffect(() => {
                navigation.setOptions({
                    
                })
            }, [isFocused])
        
            return <${name}Component {...props} {...otherProps} />
        }
        `
    }

    const insertImportsWithObserver = `
        import { useLayoutEffect } from "react"
        import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
        import { useStores } from "~/models"
        `
    const insertImports = `
        import { useLayoutEffect } from "react"
        import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
        `

    // 原类名称
    let clazzName = ''
    let headerOptions = {}
    let canBeHacked = false
    let hasObserver = false

    return ast
        // 匹配 this.props.navigation.getParam("title")  
        .find(`$_$1.navigation.getParam("$_$2")`)
        .each(item => {
            // console.log('match: ', item.match[0][0].value)
            // todo: 删除 .init() 等函数类参数
            item.replaceBy(`${item.match[1][0].value}.route.params.${item.match[2][0].value}`)
        })
        .root()
        
        // 匹配 navigation.getParam("title")
        .find(`navigation.getParam("$_$")`)
        .each(item => {
            // console.log('match: ', item.match[0][0].value)
            // todo: 删除 .init() 等函数类参数
            item.replaceBy(`route.params.${item.match[0][0].value}`)
        })
        // .replace(`navigation.getParam("$_$")`, `route.params.$_$`)
        .root()

        // 将 headerLeft，headerRight 转换为函数
        .replace(`headerLeft: () => $_$`, `headerLeft: $_$`) // 已经是函数的
        .replace(`headerRight: () => $_$`, `headerRight: $_$`) // 已经是函数的
        .replace(`headerLeft: $_$`, `headerLeft: () => $_$`)
        .replace(`headerRight: $_$`, `headerRight: () => $_$`)
        // https://reactnavigation.org/docs/headers#replacing-the-title-with-a-custom-component
        // .replace(`headerTitle: $_$`, `title: $_$`)
        .replace(`headerTitle: $_$`, `headerTitle: () => <Text>{ $_$ }</Text>`)

        // 获得原始 navigationOptions 
        .find([`static navigationOptions = () => { return $_$ }`, `static navigationOptions = () => ($_$)`])
        .each(item => {
            const itemNode = item.match[0][0].node
            // console.log('itemNode: ', itemNode)
            headerOptions = itemNode
            canBeHacked = !!(headerOptions) // 只有含有旧的 navigationOptions 才需要 hack
            
            // 删除本节点
            item.remove()
        })
        .root()

        // 判断 observer 修饰符(这里临时使用导入语句代替) fixme：无法匹配修饰符？ gogocode/buildAstByAstStr() 方法有处理
        .find(`import { $$$, observer } from "mobx-react";`, { ignoreSequence: true })
        .each(item => {
            if(item) hasObserver = true
        })
        .root()

        // 获取原类组件并改名(后缀添加 Component），然后 增加一个与原类同名的 hack 函数，将 navigation route store 等传给原类组件
        .find(`class $_$ {}`)
        .each(item => {
            if (!canBeHacked) return
            // console.log('match: ', item.match[0][0].value);
            clazzName = item.match[0][0].value
            item.match[0][0].node.name = `${clazzName}Component`
            if (hasObserver) {
                item.before(hackCodeWithObserver(clazzName))
            } else {
                item.before(hackCode(clazzName))
            }
        })
        .root()

        // 抽取 navigation.setOptions 来定制 header
        .find(`navigation.setOptions($_$)`)
        .each(item => {
            if (!canBeHacked) return
            // 这个用法尝试了好久 
            // https://gogocode.io/zh/docs/specification/cookbook#20%E5%AF%B9%E8%B1%A1%E4%B8%AD%E6%8F%92%E5%85%A5%E4%B8%80%E4%B8%AA%E6%96%B0%E5%B1%9E%E6%80%A7
            $(item.attr('arguments.0')).append('properties', headerOptions.properties) // append() 第一个是插入位置，第二个是插入内容（字符串或节点对象的对应属性）

            // 下面是一些错误的尝试
            // const node = item.match[0][0].node
            // item.replaceBy(`navigation.setOptions(${JSON.stringify(headerOptions)}）`) // 直接字面量赋值，无意义
            // const kind = typeof headerOptions 
            // console.log('typeof: ', kind) // string 所以，下面的语句错误
            // Object.keys(headerOptions).each(key => { 
            //     node[key] = headerOptions[key]
            // })
        })
        .root()

        // 插入hack里的导入()
        .find([`import React from "react"`, `import * as React from "react"`])
        .each(item => {
            console.log('can: ', canBeHacked);
            if (canBeHacked && item) {
                if (hasObserver) {
                    return item.after(insertImportsWithObserver)
                } else {
                    return item.after(insertImports)
                }
                
            } 
            return item
        })
        .root()
        // 注意不要使用下面的代码：直接在根节点root插入，无法进行条件判断，会导致所有文件都插入
        // .before(() => {
        //     if (canBeHacked) {
        //         return 
        //     } else {
        //         return '';
        //     }
        // })
        // .root()

        // 删除不必要的导入
        .find(`import { UserInforStore } from "~/models/user-infor-store/user-infor-store"`)
        .each(item => {
            if (canBeHacked && item) return item.remove()
            return item
        })
        .root()

}