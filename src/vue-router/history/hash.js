import History from './base'

function ensureSlash() {
    if(window.location.hash){
        return
    }
    window.location.hash = '/'
}

class HashHistory extends History{
    constructor(router){
        super(router);
        this.router = router;

        ensureSlash() // 保证页面一加载就要有hash值
    }
    getCurrentLocation(){
        return window.location.hash.slice(1); // 除了#号后面的路径
    }
}

export default HashHistory
