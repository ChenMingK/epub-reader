# epub-reader

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

## epub API
1.ePub电子书解析和渲染
``` javaScript
// 生成Book对象
this.book = new Epub(DOWNLOAD_URL)
// 通过Book.renderTo生成Rendition对象
this.rendition = this.book.renderTo('read', {
width: window.innerWidth,
height: window.innerHeight,
method: 'default'
})
// 通过Rendtion.display渲染电子书
this.rendition.display()
```

2.ePub电子书翻页
``` javaScript
// 上一页
function prevPage() {
if (this.rendition) {
this.rendition.prev()
}
}
// 下一页
function nextPage() {
if (this.rendition) {
this.rendition.next()
}
}

```

3.ePub电子书的字号设置和场景切换
``` javaScript
// 设置主题
function setTheme(index) {
this.themes.select(this.themeList[index].name)
this.defaultTheme = index
}
// 注册主题
function registerTheme() {
this.themeList.forEach(theme => {
this.themes.register(theme.name, theme.style)
})
}
// 设置字号大小
function setFontSize(fontSize) {
this.defaultFontSize = fontSize
if (this.themes) {
this.themes.fontSize(fontSize + 'px')
}
}
```

4.ePub电子书生成目录和定位信息
``` javaScript
// Book对象的钩子函数ready
this.book.ready.then(() => {
// 生成目录
this.navigation = this.book.navigation
// 生成Locations对象
return this.book.locations.generate()
}).then(result => {
// 保存locations对象
this.locations = this.book.locations
// 标记电子书为解析完毕状态
this.bookAvailable = true
})
```

5.epub电子书通过百分比定位
``` javaScript
function onProgressChange(progress) {
const percentage = progress / 100
const location = percentage > 0 ? this.locations.cfiFromPercentage(percentage) : 0
this.rendition.display(location)
}
```

## questions record
1.HTML5 range控件
``` html
<input class="progress" 
   type="range"
   max="100"
   min="0"
   step="1"
   @change="onProgressChange($event.target.value)" 
   @input="onProgressInput($event.target.value)"
   :value="progress"
   :disabled="!bookAvailable"
   ref="progress">
```

2.使用vue-cli3.0静态资源必须放在public目录下（否则会出现引入不成功的情况但是又不会给提示）

