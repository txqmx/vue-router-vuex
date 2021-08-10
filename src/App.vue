<template>
  <div id="app">
    {{$store.state.age}}<br>
    我的年龄 {{$store.getters.myAge}}
    <button @click="$store.state.age =100">更改</button>
    <button @click="syncChange()">同步更改</button>
    <button @click="asyncChange()">异步更改</button>

    <!--{{$store.state.a.age}}-->
    <!--{{$store.state.b.age}}-->
    <!--{{$store.state.b.c.age}}-->

    {{age}}{{myAge}}
  </div>
</template>

<script>
// vue 的辅助方法
import {mapState, mapGetters, mapMutations, mapActions} from './vuex/index'; // 映射状态

export default {
  mounted(){
    // this.$store.commit('setUserName')
    //  this.$store.dispatch('setUserName')
    //  console.log(this.$store);
  },
  computed: {
    ...mapGetters(['myAge']),
    ...mapState(['age'])
    // age(){
    //     return this.$store.state.age
    // }
  },
  methods: {
    // ...mapMutations(['syncChange']),
    ...mapMutations({aaa: 'syncChange'}),
    ...mapActions({bbb: 'asyncChange'}),

    syncChange(){ // 如果父亲没有命名空间 就不要增加父亲的命名空间
      // this.$store.commit('syncChange', 10)
      this.aaa(10)
    },
    asyncChange(){
      // this.$store.dispatch('asyncChange', 5)
      this.bbb(5)
    }
  }
}
</script>
<style>

</style>
