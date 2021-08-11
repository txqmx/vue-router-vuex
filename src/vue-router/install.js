import RouterView from './components/router-view'
import RouterLink from './components/router-link'


const install = (Vue) => {
    // 默认我希望可以将这个router放到任何的组件使用
    Vue.mixin({
        beforeCreate(){
            // 判断是不是根
            if(this.$options.router){
                // 保存实例
                this._routerRoot = this; // 是给根实例增加_routerRoot
                this._router = this.$options.router;

                // 路由初始化
                this._router.init(this); // 这个this是根实例

                // 将current属性定义成响应式的
                // 这个对象下面挂的方法 不建议用户使用
                // 为当前根实例增加一个_route属性
                Vue.util.defineReactive(this, '_route', this._router.history.current)
                // 每次更新路径之后，需要更新_route属性 this._routerRoot._route

            }else { // 子组件中的属性 是没有router属性的
                // 子组件上都有一个_routerRoot属性可以获取到最顶层的根实例
                this._routerRoot = this.$parent && this.$parent._routerRoot;
                // 如果组件想获取到 根实例中传入的router
                // this._routerRoot._router 指代的都是当前的router实例
            }
        }
    });
    Object.defineProperty(Vue.prototype, '$route', { // 都是一些匹配属性 path matched
        get(){
            return this._routerRoot._route
        }
    });
    Object.defineProperty(Vue.prototype, '$router', {
        get(){
            return this._routerRoot._router
        }
    });

    // 全局组件
    Vue.component('RouterView', RouterView);
    Vue.component('RouterLink', RouterLink)
};


export default install
