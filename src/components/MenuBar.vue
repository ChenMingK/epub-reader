<template>
    <div class="menu-bar">
      <transition name="slide-up"> <!--transition是针对menu-wrapper的-->
        <div class="menu-wrapper" :class="{'hide-box-shadow': ifSettingShow || !ifTitleAndMenuShow}"
             v-show="ifTitleAndMenuShow">
          <div class="icon-wrapper">
            <span class="icon-menu icon" @click="showSetting(3)"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-progress icon" @click="showSetting(2)"></span>
          </div>
          <div class="icon-wrapper">
            <span class="icon-bright icon" @click="showSetting(1)"></span>
          </div>
          <div class="icon-wrapper" >
            <span class="icon-a icon" @click="showSetting(0)">A</span>
          </div>
        </div> <!--菜单栏-->
      </transition>
      <transition name="slide-up">
        <div class="setting-wrapper" v-show="ifSettingShow">
          <div class="setting-font-size" v-if="showTag === 0">
            <div class="preview" :style="{fontSize: fontSizeList[0].fontSize + 'px'}">A</div> <!--动态绑定字号大小-->
            <div class="select">
              <div class="select-wrapper" v-for="(item, index) in fontSizeList" :key="index"
                   @click="setFontSize(item.fontSize)">
                <div class="line"></div>
                  <div class="point-wrapper">
                    <div class="point" v-show="defaultFontSize === item.fontSize">
                      <div class="small-point"></div>
                    </div>
                  </div> <!--point 小球-->
                <div class="line"></div>
              </div> <!--sllect-wrapper end 字号选择条-->
            </div>
            <div class="preview" :style="{fontSize: fontSizeList[1].fontSize + 'px'}">A</div>
          </div> <!--setting-font-size end 设置字体的弹出层-->
          <div class="setting-theme" v-else-if="showTag === 1">
            <div class="setting-theme-item" v-for="(item, index) in themeList" :key="index"
                @click="setTheme(index)"> <!--通过v-for渲染-->
              <div class="preview" :style="{background: item.style.body.background}"
                  :class="{'no-border': item.style.body.background !== '#fff'}"></div>
              <div class="text" :class="{'selected': index === defaultTheme}">{{item.name}}</div>
            </div>
          </div> <!--setting-theme end 设置主题的弹出层-->
          <div class="setting-progress" v-else-if="showTag === 2">
            <div class="progress-wrapper">
              <input type="range" class="progress"
                     max="100"
                     min="0"
                     step="1"
                     @change="onProgressChange($event.target.value)"
                     @input="onProgressInput($event.target.value)"
                     :value="progress"
                     :disabled="!bookAvailable"
                     ref="progress"> <!--change:松手时触发的事件，input:拖动时触发的事件-->
            </div>
            <div class="text-wrapper">
              <span>{{bookAvailable ? progress + '%' : '加载中...'}}</span>
            </div>
          </div>
        </div> <!--setting-wrapper 点击菜单栏图标的弹出层-->
      </transition>
      <!--蒙版得在setting-wrapper外层-->
      <content-view :ifShowContent="ifShowContent"
                    v-show="ifShowContent"
                    :navigation="navigation"
                    :bookAvailable="bookAvailable"
                    @jumpTo="jumpTo"></content-view>
      <transition name="fade">
        <div class="content-mask"
              v-show="ifShowContent"
              @click="hideContent"></div>
      </transition>
    </div> <!--注意用一个div包裹-->
</template>

<script>
  import ContentView from './Content.vue'
  export default {
    props: {
      ifTitleAndMenuShow: {
        type: Boolean,
        default: false
      },
      fontSizeList: Array,
      defaultFontSize: Number,
      themeList: Array,
      defaultTheme: Number,
      bookAvailable: {
        type: Boolean,
        default: false
      },
      navigation: Object
    },
    components: {
      ContentView
    },
    data: function() {
      return {
        ifSettingShow: false, // 设置栏是否显示
        showTag: 0,
        progress: 0,
        ifShowContent: false
      }
    },
    methods: {
      // 隐藏目录
      hideContent() {
        this.ifShowContent = false
      },
      // 跳转方法，调用父组件方法
      jumpTo(target) {
        this.$emit('jumpTo', target)
      },
      // 拖动进度条时触发
      onProgressInput(progress) {
        this.progress = progress
        this.$refs.progress.style.backgroundSize = `${this.progress}% 100%` // 改变进度条左右两侧的颜色
      },
      // 进度条松开后触发事件，根据进度条数值跳转到指定位置
      onProgressChange(progress) {
        this.$emit('onProgressChange', progress)
      },
      setTheme(index) {
        this.$emit('setTheme', index)
      },
      // 改变字体需要电子书引擎支持，所以需要由父组件来完成此操作，子组件传参即可
      setFontSize(fontSize) {
        this.$emit('setFontSize', fontSize) // 触发名为"setFontSize"的事件,父组件会监听该事件并调用对应的事件处理程序
      },
      // 改变字体设置栏状态 显示/不显示
      showSetting(tag) {
        this.showTag = tag
        if (this.showTag === 3) {
          this.ifSettingShow = false
          this.ifShowContent = true
        } else {
          this.ifSettingShow = true
        }
      },
      // 隐藏字体设置栏
      hideSetting() {
        this.ifSettingShow = false
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import '@/assets/styles/global.scss';
  .menu-bar {
    .menu-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 101;
      width: 100%;
      height: px2rem(48);
      display: flex;
      background: white;
      box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
      // 动态的隐藏阴影class
      &.hide-box-shadow {
        box-shadow: none;
      }
      .icon-wrapper {
        flex: 1;
        @include center;
        .icon-progress {
          font-size: px2rem(28);
        }
        .icon-bright {
          font-size: px2rem(24);
        }
      }
    }
    .setting-wrapper {
      position: absolute;
      bottom: px2rem(48);  // 因为菜单栏是48px
      left: 0;
      width: 100%;
      height: px2rem(60);
      box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
      background: white;
      z-index: 101; // 注意z-index要大于蒙版的
      .setting-font-size {
        display: flex;
        height: 100%;
        .preview {
          flex: 0 0 px2rem(40);
          @include center;
        }
        // 需要给select-wrapper加一个父级元素
        .select {
          display: flex;
          flex: 1;
          .select-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            // first-child先找到父级，然后选择第一个子级DOM
            &:first-child {
              .line {
                &:first-child {
                  border-top: none; // 不能放在上面，因为有左右两条line，这里要选左边那条
                }
              }
            }
            &:last-child {
              .line {
                &:last-child {
                  border-top: none; 
                }
              }
            }
            .line {
              flex: 1;
              height: 0;
              border-top: px2rem(1) solid #ccc; // 用上边框表示横线
            }
            .point-wrapper {
              position: relative;
              flex: 0 0 0;
              width: 0;
              height: px2rem(7);
              border-left: px2rem(1) solid #ccc;
              .point {
                position: absolute;
                top: px2rem(-8);
                left: px2rem(-10);
                width: px2rem(20);
                height: px2rem(20);
                border-radius: 50%;
                background: white;
                border: px2rem(1) solid #ccc;
                box-shadow: 0 px2rem(4) px2rem(4) rgba(0, 0, 0, .15);
                @include center;
                .small-point {
                  width: px2rem(5);
                  height: px2rem(5);
                  background: black;
                  border-radius: 50%;
                }
              }
            }
          }
        }   
      }
      .setting-theme {
        height: 100%;
        display: flex;
        .setting-theme-item {
          flex: 1; // 均匀占据剩余空间
          display: flex;
          flex-direction: column;
          padding: px2rem(5);
          box-sizing: border-box;
          .preview {
            flex: 1;
            border: px2rem(1) solid #ccc;
            box-sizing: border-box;
            // 白色加个边框
            &.no-border {
              border: none;
            }
          }
          .text {
            flex: 0 0 px2rem(20);
            font-size: px2rem(14);
            color: #999;
            @include center;
            // 被选中时颜色突出
            &.selected {
              color: #333;
            }
          }
        }
      }
      .setting-progress {
        width: 100%;
        height: 100%;
        .progress-wrapper {
          width: 100%;
          height: 100%;
          @include center;
          padding: 0 px2rem(30);
          box-sizing: border-box;
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
        }
        .text-wrapper {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          color: #333;
          font-size: px2rem(12);
          text-align: center;
        }
      }
    }
    .content-mask {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 101;
      display: flex;
      width: 100%;
      height: 100%;
      background: rgba(51, 51, 51, .8);
    }
  }
  
</style>
