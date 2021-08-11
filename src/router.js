import Vue from 'vue'
import Router from './vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

// 用了这个插件之后
// 会给每个组件增加两个属性 $route 放的所有路由相关的属性 $router 放一些方法 Vue.prototype
// 还提供了两个组件 router-view router-link
Vue.use(Router);
// 钩子函数 全局钩子

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      children: [
        {
          path: 'a', // 路径前面不能加'/' 加/为根路由
          component: {
            render(h){return <h1>this is an about/a</h1>}
          }
        },
        {
          path: 'b', // 路径前面不能加'/' 加/为根路由
          component: {
            render(h){return <h1>this is an about/b</h1>}
          }
        }
      ]
    }
  ]
});

// 讲一下 vue路由钩子的实现 回调函数  express框架的逻辑是一样的
// router.beforeEach((from, to, next)=>{
//   console.log(1);
//   setTimeout(()=>{
//     next()
//   }, 1000)
// });


// 动态添加
// router.addRoute([
//     {path: '/xxx', component:[]}
// ]);

export default router
