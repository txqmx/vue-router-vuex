let Vue;

let forEach = (obj, callback) => {
    Object.keys(obj).forEach(key => { // for in 会变量原型
        callback(key, obj[key]);
    })
};

class ModuleCollection {
    constructor(options){
        // 深度遍历将所有的子模块都遍历一遍
        this.register([], options);
    }
    register(path, rootModule) {
        let rawModule = { // 格式化后的格式
            _raw: rootModule,
            state: rootModule.state,
            _children: {}
        };
        rootModule.rawModule = rawModule; // 双向记录
        if(!this.root){
            this.root = rawModule
        }else {
            // 不停的找到要定义的模块 将这个模块定义到他的父亲上
            let parentModule = path.slice(0,-1).reduce((root, current) => {
                return root._children[current];
            }, this.root);
            parentModule._children[path[path.length-1]] = rawModule
        }
        if(rootModule.modules){
            forEach(rootModule.modules, (moduleName, module) => {
                // 将a模块进行注册 [a] , a模块的定义
                // 将b模块进行注册 [b] , b模块的定义
                // 将c模块进行注册 [b,c] , c模块的定义
                this.register(path.concat(moduleName), module)
            })
        }
    }
}
function getState(store, path) {
    return path.reduce((newState, current) => { // 每次调用mutation的时候传入的参数我们都保证他是最新获取到的，而不是默认安装时的数据
        return newState[current]
    }, store.state)
}

function installModule(store, rootState, path, rawModule) {
    // 根据当前用户传入的配置 算一下他需不需要增加一个前缀
    let root = store.modules.root; // 获取到最终整个格式化的结果
    // [a,b] a/b
    let namespace = path.reduce((str, current) => {
        // root 整个格式化
        // root._children[current] 拿到的是当前通过路径获取到的模块
        root = root._children[current]; // 拿到对应格式化的结果
        str = str+ (root._raw.namespaced? current+'/':'');
        return str;
    }, '');
    // 没有安装状态 我们需要把子模块状态定义到rootState上
    if(path.length > 0){ // 当前的path如果长度大于0 说明有子模块
        // vue响应式原理 不能增加不存在的属性
        let parentState = path.slice(0, -1).reduce((root, current)=>{
            return rootState[current]
        }, rootState);
        // 给这个根状态定义当前的模块名字是path的最后一项
        Vue.set(parentState, path[path.length-1], rawModule.state) // 递归给当前的状态赋值
    }

    let getters = rawModule._raw.getters;
    if(getters){
        forEach(getters, (getterName, value) => {
            Object.defineProperty(store.getters, namespace+getterName, {
                get: ()=>{
                    return value(getState(store,path)) // 模块中的状态
                }
            })
        })
    }
    let mutations = rawModule._raw.mutations;
    if(mutations){
        forEach(mutations, (mutationName, value) => { // [] 订阅
            let arr = store.mutations[namespace+mutationName] || (store.mutations[namespace+mutationName] = []);
            arr.push((payload) => { // 为什么要切片
                value(getState(store,path), payload)
                store.subs.forEach(fn => fn({type: namespace+mutationName, payload: payload},store.state))
            });
        })
    }

    let actions = rawModule._raw.actions; // 取用户的action
    if(actions){
        forEach(actions, (actionName, value) => { // [] 订阅
            let arr = store.actions[namespace+actionName] || (store.actions[namespace+actionName] = []);
            arr.push((payload) => {
                value(store, payload)
            });
        })
    }
    forEach(rawModule._children, (moduleName, rawModule) => {
        installModule(store, rootState, path.concat(moduleName), rawModule)
    })

}

class Store {
    constructor(options){
        this.strict = options.strict || false;
        this._committing = false; // 默认是没有提交

        // 获取用户 new 实例时传入的所有属性
        this.vm = new Vue({ // 创建vue的实例 保证状态更新可以刷新视图
            data: { // 默认这个状态 会被使用Object.defineProperty重新定义
                state: options.state
            }
        });

        // --------模块化修改
        this.getters = {};
        this.mutations = {};
        this.actions = {};
        this.subs = [];

        // 1.我需要将用户传入的数据进行格式化操作
        this.modules = new ModuleCollection(options);

        // 2.递归的安装模块 store, rootState, path, 跟模块
        installModule(this, this.state, [], this.modules.root);

        let plugins = options.plugins;
        plugins.forEach(plugin => plugin(this))

        if(this.strict){
            this.vm.$watch(() => {
                return this.vm.state
            }, function () {
                console.assert(this._committing, '不能异步调用')
                // 深度监控
            }, {deep:true, sync:true}) // 同步watcher
        }
    }

    _withCommit(fn){
        const committing = this._committing; // 保留之前的状态
        this._committing = true; // 默认调用mutation之前 更改值是true
        fn();
        this._committing = committing
    }
    replaceState(newState){
        this._withCommit(() => {
            this.vm.state = newState
        })
    }
    subscribe(fn){
        this.subs.push(fn)
    }

    commit = (mutationName, payload) => { // es7的写法 这个里面的this永远指向当前store实例
        this._withCommit(()=>{ // 装饰 切片
            this.mutations[mutationName].forEach(fn => fn(payload)); // 发布
        })
    };
    dispatch = (actionName, payload) => { // 发布的时候会找到对应的action执行
        this.actions[actionName].forEach(fn => fn(payload));
    };

    // es6 中的类的访问器
    get state(){ // 获取实例上的属性就会执行此方法 this.state = options.state
        return this.vm.state
    }

    // 动态注册模块
    registerModule(moduleName, module){
        if(!Array.isArray(moduleName)){
            moduleName = [moduleName]
        }
        this.modules.register(moduleName, module); // 只是将模块进行了格式化
        // 将当前这个模块进行安装
        installModule(this, this.state, moduleName, module.rawModule);
    }

}

const install = (_Vue)=> { // Vue构造函数
    Vue = _Vue;
    // 放到原型上 默认会给所有的实例增加
    // 只从当前的根实例开始 所有根实例的子组件才有$store方法

    Vue.mixin({ // 组件的创建过程是先父后子，混入的生命周期高于组件的生命周期
        beforeCreate(){
            // 把父组件的store属性 放到每个组件的实例上
            if(this.$options.store){ // 根实例
                this.$store = this.$options.store // 就是 Vuex.Store 的实例
            } else {
                this.$store = this.$parent && this.$parent.$store
            }
        }
    }) // 抽离公共逻辑 放一些方法
};

export const mapState = (stateArr) => {
    let obj = {};
    stateArr.forEach(stateName => {
        obj[stateName] = function () {
            return this.$store.state[stateName]
        }
    });
    return obj
};

export const mapGetters = (gettersArr) => {
    let obj = {};
    gettersArr.forEach(getterName => {
        obj[getterName] = function () {
            return this.$store.getters[getterName]
        }
    });
    return obj
};

export function mapMutations(obj) {
    let res = {};
    Object.entries(obj).forEach(([key,value]) => {
        res[key] = function (...args) {
            this.$store.commit(value, ...args)
        }
    });
    return res;
}

export function mapActions(obj) {
    let res = {};
    Object.entries(obj).forEach(([key,value]) => {
        res[key] = function (...args) {
            this.$store.dispatch(value, ...args)
        }
    });
    return res;
}

export default {
    Store,
    install
}
