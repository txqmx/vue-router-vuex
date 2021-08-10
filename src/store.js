import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './vuex/index'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex); // 会执行当前插件的install方法

// 通过Vuex中的一个属性 Store 创建一个store的实例
function logger(store){
  // console.log(store);
  let prevState = JSON.stringify(store.state); // 默认状态
  store.subscribe((mutation, newState) => { // 每次调用mutation 此方法会执行
    console.log(prevState);
    console.log(mutation);
    console.log(JSON.stringify(newState));
    prevState = newState
  })
}
function persists(store){ // 每次去服务器上拉取新的
  let local = localStorage.getItem('vuex');
  if(local){
    store.replaceState(JSON.parse(local)); // 会用local替换掉所有的状态
  }
  store.subscribe((mutation, state) => { // 每次调用mutation 此方法会执行
    // 这里需要做一个节流 throttle lodash
    localStorage.setItem('vuex', JSON.stringify(state))
  })
}
let store = new Vuex.Store({
  plugins:[
    logger,
    // persists
    // vue-persists 可以实现vuex的数据持久化
    // createLogger() // 每次提交的时候，希望看一下 当前提交的状态变化
  ],
  modules:{
    a:{ // 模块名不能和state名重复
      namespaced: true, // 表示给a盖一个房子
      state:{
        age: 'a100',
      },
      mutations: {
        syncChange(state, payload){ // 修改状态的方法 同步更改
          console.log('a-syncChange');
        }
      }
    },
    b:{
      namespaced: true,
      state:{
        age: 'b100'
      },
      mutations: {
        syncChange(state, payload){ // 修改状态的方法 同步更改
          console.log('b-syncChange');
        }
      },
      modules: {
        c:{
          namespaced: true,
          state:{
            age: 'c100'
          },
          mutations: {
            syncChange(state, payload){ // 修改状态的方法 同步更改
              console.log('c-syncChange');
            }
          }
        },
      }
    }

  },
  state: {  // 单一数据源
    age: 10
  },
  // strict: true, // 严格模式
  getters: {
    myAge(state){ // 以前用vue中的计算属性
      return state.age + 20
    }
  },
  // 更新状态的唯一方式就是通过mutations
  mutations: { // mutations更改状态只能采用同步（严格模式会报错）
    syncChange(state, payload){ // 修改状态的方法 同步更改
      // state.age += payload
      setTimeout(() => {
        state.age += payload
      },1000)
    }
  },
  actions: {
    asyncChange({commit}, payload){  // 第一个参数时store, {commit} = store.commit 结构
      setTimeout(() => {
        commit('syncChange', payload)
      },1000)
    }
  }
})
// 动态注册模块，就是再我们格式化后的树中进行格式化操作
// 在将当前模块进行安装
store.registerModule('d',{
  state:{
    age: 'd100'
  }
})

export default store
