import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/ebook' // 直接重定向
    },
    {
      path: '/ebook',
      name: 'ebook',
      component: () => import('./views/index.vue') // 组件懒加载, component:function?
    }
  ]
})
