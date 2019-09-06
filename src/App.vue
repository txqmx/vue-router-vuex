<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
    {{this.$store.state}}
  </div>
</template>

<script>
export default {
    mounted(){
       // this.$store.commit('setUserName')
        this.$store.dispatch('setUserName')
    }
}
</script>
<style>

</style>
