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
### 1.HTML5 range控件
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

### 2.使用vue-cli3.0静态资源必须放在public目录下（否则会出现引入不成功的情况但是又不会给提示）
<img src="https://github.com/ChenMingK/epub-reader/blob/master/questionImgs/1.png?raw=true">

### 3.如何修改渲染出来的电子书的宽高？
要实现这一点需要使用epubjs的高级特性：css注入，因为epubjs的实现原理是iframe，而iframe中的dom不受我们的css控制，所以必须要注入css才能实现，具体做法如下：<br>
1、在static目录下创建一个test.css，填入以下内容：
``` css
.CoverFigure {
  width: 100%!important;
  height: 100%!important;
}
.CoverFigure img {
  width: 100%!important;
  max-height: 100%!important;
}
```

2、在Ebook.vue的showEpub()末尾添加以下代码：
``` css
this.rendition.hooks.render.register(view => {
  const contents = this.rendition.manager.getContents()[0]
  contents.addStylesheet('/static/test.css')
})
```

在test.css中你可以对img的大小进行控制

### 4.使用vue过渡动画
- 使用v-show动态显示或隐藏元素时，会触发过渡动画
- transition需要指定name，并包裹一个含v-show的div
- vue会为transition包裹的div动态添加class，共6种
<img src="https://github.com/ChenMingK/epub-reader/blob/master/questionImgs/2.png?raw=true">

v-enter: 显示之前 v-enter-to: 显示之后 v-enter-active: 显示的过程<br>
v-leave: 隐藏之前 v-leave-to: 隐藏之后 v-leave-active: 隐藏的过程<br>
注意transition的样式必须和包裹的div同级（scss）


### 5.当设置栏出现的时候菜单栏阴影隐藏 & 过渡动画不协调
通过动态绑定class实现
:class="{'hide-box-shadow': ifSettingShow || !ifTitleAndMenuShow}"
当设置栏出现或者菜单栏要隐藏时都设置无box-shadow

过渡问题：
菜单栏高度是48，设置栏是60px;过渡效果改成统一的108px, 否则会有不协调感
transform: translate3d(0, px2rem(108), 0);

### 6.字号选择条的布局
<img src="https://github.com/ChenMingK/epub-reader/blob/master/questionImgs/3.png?raw=true">
左右两侧固定，中间伸缩，每一个字号选择条由左侧横线 + 中间竖线 + 右侧横线来实现, 
且最左侧和最右侧横线隐藏<br>
先写好一个左中右的横线，然后有多少种字号就v-for即可，注意使用flex布局以及利用border画线<br>
中间的图形可以通过border-radius实现，再加上点击事件即可

### 7.进度条拖动效果如何实现？
利用background-size属性：该属性定义图像的尺寸<br>
``` javaScript
 // 拖动进度条时触发
onProgressInput(progress) {
  this.progress = progress
  this.$refs.progress.style.backgroundSize = `${this.progress}% 100%` // 改变进度条左右两侧的颜色
}
 ```
 
 ``` css
 .progress {
   width: 100%;
   -webkit-appearance: none; // 替换range的默认样式
   height: px2rem(2);
   background: -webkit-linear-gradient(#999, #999) no-repeat, #ddd;
   background-size: 0 100%; // 利用这个属性实现，input时动态设置这个属性
   &:focus {
     outline: none; // 去除轮廓
   }
   &::-webkit-slider-thumb { // 手柄形状设置
    -webkit-appearance: none; // 去除默认样式
     height: px2rem(20);
     width: px2rem(20);
     border-radius: 50%;
     background: white;
     box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .15);
     border: px2rem(1) solid #ddd;
   }
 }
 ```
背景属性设置线性渐变：background: linear-gradient(direction, color-stop1, color-stop2, ...);

