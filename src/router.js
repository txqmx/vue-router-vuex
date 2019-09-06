import Vue from 'vue'
import Router from './vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

// use 方法 会调用install方法
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})
