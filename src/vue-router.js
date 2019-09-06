let Vue
class Router {
    constructor({routes}){
        this.routeMap = routes.reduce((memo, current) => {
            memo[current.path] = current.component;
            return  memo
        }, {});
        // this.route = {current: '/'};
        Vue.util.defineReactive(this, 'route',{current: '/'})

        window.addEventListener('load', ()=>{
            location.hash? '': location.hash = '/'  // 默认跳转到首页
        })
        window.addEventListener('hashchange', ()=>{
            this.route.current = location.hash.slice(1)
        })
    }
}

Router.install = (_Vue)=>{
    // 扩展属性 或者组件、指令
    Vue = _Vue;
    Vue.mixin({ // 内部会把这个对象给每个组件的属性混在一起
        beforeCreate(){
            // 判断跟组件是谁
            if(this.$options && this.$options.router){
                this._router = this.$options.router
            } else {
                // 让所有的子组件 都有这个_router属性 指向当前的router
                this._router = this.$parent && this.$parent._router
            }
            // 每个组件 $route $router
            Object.defineProperty(this, '$route', {
                value: {}
            });
            Object.defineProperty(this, '$router', {
                value: {}
            });
            // router-link router-view
            Vue.component('router-link',{
                props: {
                    to: String
                },
                render(){
                    return <a href={`#${this.to}`}>{this.$slots.default}</a>
                }
            });
            Vue.component('router-view', {
                render(h){
                    return h(this._router.routeMap[this._router.route.current])
                }
            })
        }
    })
};

export default Router
