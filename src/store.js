import Vue from 'vue'
import Vuex from './vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    name: 'xxx'
  },
  mutations: {
    setUserName(state){
      state.name = 'lll'
    }
  },
  actions: {
    setUserName({commit}){
      setTimeout(() => {
        commit('setUserName')
      },1000)
    }
  }
})
