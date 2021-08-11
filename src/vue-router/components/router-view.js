export default {
    functional: true, // 函数式组件，没有状态 不用new，函数没有this => null
    render(h, {parent, data}){ // options.parent
        let route = parent.$route; // 这个$route 被放到了vue的原型上

        let depth = 0; // 默认我肯定需要先渲染一个

        // $vnode 表示的是"占位符"vnode ， "渲染"vnode
        while(parent){
            if(parent.$vnode && parent.$vnode.data.routerView){
                depth++;
            }
            parent = parent.$parent
        }
        data.routerView = true;

        let record = route.matched[depth];
        if(!record){
            return h()
        }
        return h(record.component, data) // 组件的参数和普通的不一样
    }
}
