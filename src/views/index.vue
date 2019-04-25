<template>
  <div class="ebook">
    <title-bar :ifTitleAndMenuShow="ifTitleAndMenuShow">
    </title-bar>
      <div class="read-wrapper">
        <div id="read"></div>
        <div class="mask">
          <div class="left" @click="prevPage"></div>
          <div class="center"
              @click="toggleTitleAndMenu"></div>
          <div class="right" @click="nextPage"></div>
        </div>
      </div> <!--电子书部分-->
    <menu-bar :ifTitleAndMenuShow="ifTitleAndMenuShow"
              :fontSizeList="fontSizeList"
              :defaultFontSize="defaultFontSize"
              @setFontSize="setFontSize"
              :themeList="themeList"
              :setTheme="defaultTheme"
              @setTheme="setTheme"
              :bookAvailable="bookAvailable"
              @onProgressChange="onProgressChange"
              :navigation="navigation"
              @jumpTo="jumpTo"
              ref="menuBar">
    </menu-bar>
  </div>
</template>

<script>
  import Epub from 'epubjs'
  import TitleBar from '@/components/TitleBar.vue'
  import MenuBar from '@/components/MenuBar.vue'
  // 这里先用一本书做示例
  const DOWNLOAD_URL = '/2014_Book_SustainableLivingWithEnvironme.epub'
  global.ePub = Epub // 需要定义一个全局的ePub对象
  export default {
    components: {
      TitleBar,
      MenuBar
    },
    data: function() {
      return {
        ifTitleAndMenuShow: false, // 控制标题栏和菜单栏的隐藏
        // 表示字号的数组
        fontSizeList: [
          { fontSize: 12 },
          { fontSize: 14 },
          { fontSize: 16 },
          { fontSize: 18 },
          { fontSize: 20 },
          { fontSize: 22 },
          { fontSize: 24 }
        ],
        defaultFontSize: 16, // 默认字号
        // 主题数组
        themeList: [
          {
            name: 'default',
            style: {
              body: {
                'color': '#000', 'background': '#fff' // 字体颜色, 背景颜色
              }
            }
          },
          {
            name: 'eye',
            style: {
              body: {
                'color': '#000', 'background': '#ceeaba' // 字体颜色, 背景颜色
              }
            }
          },
          {
            name: 'night',
            style: {
              body: {
                'color': '#fff', 'background': '#000' // 字体颜色, 背景颜色
              }
            }
          },
          {
            name: 'gold',
            style: {
              body: {
                'color': '#000', 'background': 'rgb(241, 236, 226)' // 字体颜色, 背景颜色
              }
            }
          }
        ],
        defaultTheme: 0, // 主题选择,可以保存在本地
        bookAvailable: false, // 表示Location对象是否已生成
        navigation: {}
      }
    },
    methods: {
      // 根据链接跳转到指定位置
      jumpTo(href) {
        this.rendition.display(href)
        this.hideTitleAndMenu()
      },
      hideTitleAndMenu() {
        // 隐藏标题栏和菜单栏
        this.ifTitleAndMenuShow = false
        // 隐藏菜单栏弹出的设置栏
        this.$refs.menuBar.hideSetting()
        // 隐藏目录
        this.$refs.menuBar.hideContent()
      },
      // progress 进度条的数值 (0-100),进度条变化时触发
      onProgressChange(progress) {
        const percentage = progress / 100
        const location = percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0
        this.rendition.display(location)
      },
      // 设置主题
      setTheme(index) {
        this.themes.select(this.themeList[index].name)
        this.defaultTheme = index
      },
      // 注册主题
      registerTheme() {
        this.themeList.forEach(theme => {
          this.themes.register(theme.name, theme.style)
        })
      },
      // 设置电子书字体大小,'setFontSize'事件处理程序,参数自动匹配的?
      setFontSize(fontSize) {
        this.defaultFontSize = fontSize
        if (this.themes) {
          this.themes.fontSize(fontSize + 'px') // 调用Themes对象的fontSize()方法即可,注意+'px'
        }
      },
      // 切换标题栏和菜单栏的显示状态
      toggleTitleAndMenu() {
        this.ifTitleAndMenuShow = !this.ifTitleAndMenuShow
        // 再次点击中间的话设置弹窗一同隐藏
        if (!this.ifTitleAndMenuShow) {
          this.$refs.menuBar.hideSetting() // 使用ref属性调用子组件方法
        }
      },
      // 翻页，上一页
      prevPage() {
        // Rendition.prev
        if (this.rendition) {
          this.rendition.prev()
        }
      },
      // 翻页，下一页
      nextPage() {
        if (this.rendition) {
          this.rendition.next()
        }
      },
      // 电子书的解析和渲染
      showEpub() {
        // 生成Book
        this.book = new Epub(DOWNLOAD_URL) // epubjs提供解析函数
        // 生成Rendition
        this.rendition = this.book.renderTo('read', { // 指定挂载到哪个DOM id下，然后是一些其他参数
          width: window.innerWidth,
          height: window.innerHeight,
          method: 'default'           // epubjs提供的阅读电子书的方式
        })
        // 通过Rendition.display渲染电子书
        this.rendition.display()
        // 获取Theme对象
        this.themes = this.rendition.themes
        // 设置默认字体
        this.setFontSize(this.defaultFontSize)
        // this.themes.register(name, styles) 注册主题，参数：主题名称，样式
        // this.themes.select(name) 通过主题名称快速切换主题
        this.registerTheme()
        this.setTheme(this.defaultTheme)
        // 获取Locations对象,默认不会生成该对象，很消耗性能
        // console.log(this.book.locations)
        // 通过epubjs钩子函数来实现
        this.book.ready.then(() => {
          this.navigation = this.book.navigation
          // console.log(this.navigation)
          return this.book.locations.generate() // 返回一个promise
        }).then(result => {
          // console.log(result)
          this.locations = this.book.locations
          this.bookAvailable = true
        })
      }
    },
    mounted() {
      this.showEpub()
    }
  }
</script>

<style lang='scss' scoped>
  @import '@/assets/styles/global.scss';
  .ebook {
    position: relative;

    .read-wrapper {
      .mask {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 100;
        width: 100%;
        height: 100%;
        display: flex;
          .left {
            flex: 0 0 px2rem(100);

          }
          .center {
            flex: 1; // 自动填充

          }
          .right {
            flex: 0 0 px2rem(100);

          }
      }
    }

  }
  
</style>
