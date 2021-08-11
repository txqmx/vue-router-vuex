export function createRoute(record, location) {
    let res = []; // 如果匹配到了路径， 需要将这个路径都放进来
    if(record){
        while (record) {
            res.unshift(record);
            record = record.parent
        }
    }
    return {
        ...location,
        matched: res // 匹配 一个路径可能匹配多条
    }
}
function renQueue(queue, iterator, callback) {
    function step(index) {
        if(index === queue.length) return callback();
        let hook = queue[index];
        iterator(hook, ()=>step(index+1))
    }
    step(0); // 一步一步走
}
class History {
    constructor(router){
        this.router = router;
        this.current = createRoute(null, {
            path: '/' // 默认路由就是/
        });
        this.cb = undefined
    }
    transitionTo(location, callback){ // 最后屏蔽一下，路径相同不需要跳转
        // 需要根据路径 获取到对应的组件
        let r = this.router.match(location);
        if(location === this.current.path && r.matched.length === this.current.matched.length){
            return; // 保证不会多次触发页面更新
        }
        // 在更改路径之前 需要先执行刚才的那些钩子


        // 依次执行刚才定义的方法
        let queue = this.router.beforeEachs;
        const iterator = (hook, next) => {
            // 调用用户的方法，传入next，用户手动调入next()
            hook(this.current, r, next)
        };
        renQueue(queue, iterator, ()=>{
            this.updateRoute(r, callback)
        })

    }
    updateRoute(r, callback){
        this.current = r; // 将当前路径进行更新
        this.cb && this.cb(r); // 告诉_route属性来更新
        callback && callback(); // setupListener()
    }
    setupListener(){
        window.addEventListener('hashchange', () => {
            this.transitionTo(window.location.hash.slice(1));
        })
    }
    listen(cb){
        this.cb = cb
    }
}

export default History
