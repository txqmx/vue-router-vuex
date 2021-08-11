// 入口文件
// 这里应该导出一个类，这个类上有一个install方法
import install from './install'
import createMatcher from './create-matcher'
import HashHistory from './history/hash'

class VueRouter {
    constructor(options){
        // matcher 匹配器 处理树形结构 将他扁平化

        // 返回两个方法 addRoute match 匹配对应的结果
        this.matcher = createMatcher(options.routes || [])
        // 1) 默认需要先进行数据的格式化

        // 2) 内部需要使用hash history 这里要进行路由的初始化工作
        // vue 的内部路由有三种
        this.history = new HashHistory(this); // base 表示的是基类 我们所有实现的路由功能公共方法都放在基类上，保证不同的路由api，有相同的方法
        this.beforeEachs = []
    }
    match(location){ // 只有路径一切换就调用匹配器进行匹配，将匹配的结果返回
        return this.matcher.match(location)
    }
    push(location){
        this.history.transitionTo(location, ()=>{
            window.location.hash = location
        });
    }
    // 初始化方法
    init(app){ // app是最顶层根实例// 需要获取到路由的路径，进行跳转，匹配到对应的组件进行渲染// 当第一次匹配完成后，需要监听路由的变化，之后完成后续的更新工作
        const history = this.history;
        const setupHashListener = () => { // 跳转成功后的回调
            history.setupListener(); // 监听路由变化的方法 父
        };
        history.transitionTo( // 跳转的方法 父
            history.getCurrentLocation(), // 获取当前路径的方法 子
            setupHashListener
        );
        history.listen((route) => { // 订阅，路径属性一变化执行此方法
            app._route = route
        })
    }

    beforeEach(cb){
        this.beforeEachs.push(cb); // 页面切换之前会先执行这些方法
    }
}

VueRouter.install = install;

export default VueRouter
