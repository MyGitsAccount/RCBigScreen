<template>
  <div class="echart-big-case">
    <!-- <div class="echart-item">
      <div class="echart-title echart-title1">
        <span class="all-title-color title-time title-ch">2021</span>
        <span class="all-title-color title-ch">秋防实时数据</span>
        <span class="all-title-color title-en">/Real-time datas</span>
      </div>
      <div class="ball-case">
        <div class="item item0">
          <span class="num-color num-color0">{{ echarts0Datas['养殖户数'] }}</span>
          <span class="text-color">养殖户数</span>
        </div>
        <div class="item item1">
          <span class="num-color num-color1">{{ echarts0Datas['家禽数'] }}</span>
          <span class="text-color">家禽数</span>
        </div>
        <div class="item item2">
          <span class="num-color num-color2">{{ echarts0Datas['养猪户数'] }}</span>
          <span class="text-color">养猪户数</span>
        </div>
        <div class="item item3">
          <span class="num-color num-color3">{{ echarts0Datas['生猪数'] }}</span>
          <span class="text-color">生猪数</span>
        </div>
        <div class="item item4">
          <span class="num-color num-color4">{{ echarts0Datas['能繁母猪数'] }}</span>
          <span class="text-color">能繁母猪数</span>
        </div>
        <div class="item item5">
          <span class="num-color num-color5">{{ echarts0Datas['牛羊犬数'] }}</span>
          <span class="text-color">牛羊犬数</span>
        </div>
      </div>
    </div> -->
    <div class="echart-item">
      <div class="echart-title echart-title1">
        <span class="all-title-color title-ch">荣昌指数</span>
        <span class="all-title-color title-en">/RongChang Index</span>
      </div>
      <div class="chart1">
        <div v-if="isShowEchartDom" id="chart1"></div>
      </div>
    </div>
    <div class="echart-item">
      <div class="echart-title echart-title2">
        <span class="all-title-color title-ch">生猪产地检疫(当日)</span>
        <span class="all-title-color title-en">/Original area quarantine</span>
      </div>
      <div class="chart2">
        <div v-if="isShowEchartDom" id="chart2"></div>
      </div>
    </div>
    <div class="echart-item">
      <div class="echart-title echart-title3">
        <span class="all-title-color title-ch">生猪屠宰检疫(当日)</span>
        <span class="all-title-color title-en">/Slaughter quarantine</span>
      </div>
      <div class="chart3">
        <div v-if="isShowEchartDom" id="chart3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { option1, option2, option3 } from './echartOption';
import { getJson } from '@/utils/mapCommon';
// import echartsDatas from '../../../public/config/SupervisionData.json';
const componentEchartUrl = `${import.meta.env.BASE_URL}config/SupervisionData.json?time=${new Date().getTime()}`;
let echartsDatas: any;
let chartOne: any = undefined;
let chartTwo: any = undefined;
let chartThree: any = undefined;
const isShowEchartDom = ref(false);

onMounted(async () => {
  getJson({ url: componentEchartUrl }).then((data: any) => {
    echartsDatas = data;
    isShowEchartDom.value = true;
  });
  setTimeout(() => {
    const getEchartOne: any = document.getElementById('chart1');
    const getEchartTwo: any = document.getElementById('chart2');
    const getEchartThree: any = document.getElementById('chart3');

    option1.title.text = echartsDatas.echartsZSData['标题'];
    option1.xAxis.data = echartsDatas.echartsZSData['横轴类别'];
    option1.series[0].data = echartsDatas.echartsZSData['数量'];
    chartOne = echarts.init(getEchartOne);
    chartOne.setOption(option1);

    option2.title.text = echartsDatas.echartsCDData['标题'];
    option2.xAxis.data = echartsDatas.echartsCDData['横轴类别'];
    option2.series[0].data = echartsDatas.echartsCDData['数量'];
    chartTwo = echarts.init(getEchartTwo);
    chartTwo.setOption(option2);

    option3.title.text = echartsDatas.echartsTZData['标题'];
    option3.xAxis.data = echartsDatas.echartsTZData['横轴类别'];
    option3.series[0].data = echartsDatas.echartsTZData['数量'];
    chartThree = echarts.init(getEchartThree);
    chartThree.setOption(option3);
  }, 800);
});
</script>

<style lang="scss" scoped>
.echart-big-case {
  width: 100%;
  height: calc(100% - 50px);
}

.echart-item {
  width: 100%;
  height: 33.333%;
  display: flex;
  flex-direction: column;
}
.echart-title {
  width: 100%;
  height: 13%;
  line-height: 40px;
  padding-left: 55px;
}

.echart-title1 {
  // background: url(../../assets/images/echartsImgs/title_bg1.png) no-repeat;
  background: url(../../assets/images/echartsImgs/rc_index.png) no-repeat;
  background-repeat: no-repeat;
}

.echart-title2 {
  background: url(../../assets/images/echartsImgs/title_bg2.png) no-repeat;
  background-repeat: no-repeat;
}

.echart-title3 {
  background: url(../../assets/images/echartsImgs/title_bg3.png) no-repeat;
  background-repeat: no-repeat;
}

.all-title-color {
  color: white;
}

.title-ch {
  font-weight: 600;
}

.title-en {
  font-family: 14px;
  font-weight: 600;
  padding-left: 5px;
}

.ball-case {
  position: relative;
  // width: 350px;
  // height: 335px;
  width: 100%;
  height: 87%;
  background: rgba(0, 22, 43, 0.75);
}

.item {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  position: absolute;
}

.item:hover {
  transform: scale(1.1);
}

.item0 {
  // top: 103px;
  // left: 128px;
  // width: 145px;
  // height: 145px;
  top: 30%;
  left: 30%;
  width: 38%;
  height: 56.5%;
  background: url('../../assets/images/echartsImgs/ball0.png') no-repeat;
  animation: item0 5s linear;
  -webkit-animation: item0 5s linear infinite;
}

.text-color {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.item1 {
  // top: 80px;
  // left: 35px;
  // width: 110px;
  // height: 110px;
  top: 20%;
  left: 8%;
  width: 30%;
  height: 43%;
  background: url('../../assets/images/echartsImgs/ball1.png') no-repeat;
  animation: item1 5s linear;
  -webkit-animation: item1 5s linear infinite;
}

.item2 {
  // top: 20px;
  // left: 185px;
  // width: 93px;
  // height: 93px;
  top: 2%;
  left: 40%;
  width: 24%;
  height: 36%;
  background: url('../../assets/images/echartsImgs/ball2.png') no-repeat;
  animation: item2 6s linear;
  -webkit-animation: item2 6s linear infinite;
}
.item3 {
  // top: 100px;
  // left: 275px;
  // width: 81px;
  // height: 81px;
  top: 26%;
  left: 67%;
  width: 21%;
  height: 31.5%;
  background: url('../../assets/images/echartsImgs/ball3.png') no-repeat;
  animation: item3 7s linear;
  -webkit-animation: item3 7s linear infinite;
}

.item4 {
  // top: 180px;
  // left: 245px;
  // width: 95px;
  // height: 95px;
  top: 60%;
  left: 60%;
  width: 24.5%;
  height: 37%;
  background: url('../../assets/images/echartsImgs/ball4.png') no-repeat;
  animation: item4 5s linear;
  -webkit-animation: item4 5s linear infinite;
}

.item5 {
  // top: 230px;
  // left: 105px;
  // width: 81px;
  // height: 81px;
  top: 65%;
  left: 18%;
  width: 21%;
  height: 31.5%;
  background: url('../../assets/images/echartsImgs/ball3.png') no-repeat;
  animation: item3 5s linear;
  -webkit-animation: item3 5s linear infinite;
}

@keyframes item0 {
  0% {
    transform: translate(0px, 0px), scale();
  }
  20% {
    transform: translate(-20px, -10px);
    transform: scale(1.05);
  }
  40% {
    transform: scale(1);
  }
  60% {
    transform: scale(1.05);
  }
  80% {
    transform: translate(5px, 10px);
  }
  100% {
    transform: translate(0px, 0px), scale(1);
  }
}

@keyframes item1 {
  0% {
    transform: translate(0px, 0px);
  }
  20% {
    transform: translate(-20px, -10px);
    transform: scale(1.05);
  }
  40% {
    transform: translate(-10px, 0px);
  }
  60% {
    transform: translate(10px, 20px);
    transform: scale(1.05);
  }
  80% {
    transform: translate(5px, 10px);
  }
  100% {
    transform: translate(0px, 0px);
    transform: scale(1);
  }
}

@keyframes item2 {
  0% {
    transform: translate(0px, 0px);
    transform: scale(1.05);
  }
  20% {
    transform: translate(-10px, -10px);
  }
  40% {
    transform: translate(5px, -5px);
  }
  60% {
    transform: translate(0px, 20px);
    transform: scale(1.05);
  }
  80% {
    transform: translate(15px, 0px);
  }
  100% {
    transform: translate(0px, 0px);
    transform: scale(1);
  }
}

@keyframes item3 {
  0% {
    transform: translate(0px, 0px);
  }
  20% {
    transform: translate(10px, 10px);
  }
  40% {
    transform: translate(5px, -5px);
    transform: scale(0.95);
  }
  60% {
    transform: translate(10px, 0px);
    transform: scale(1.05);
  }
  80% {
    transform: translate(-5px, -10px);
  }
  100% {
    transform: translate(0px, 0px);
    transform: scale(1);
  }
}

@keyframes item4 {
  0% {
    transform: translate(0px, 0px);
  }
  20% {
    transform: translate(-15px, 10px);
  }
  40% {
    transform: translate(5px, -5px);
    transform: scale(0.95);
  }
  60% {
    transform: translate(10px, 10px);
  }
  80% {
    transform: translate(-5px, -10px);
    transform: scale(1.05);
  }
  100% {
    transform: translate(0px, 0px);
    transform: scale(1);
  }
}

.num-color0 {
  color: rgba(64, 165, 207, 1);
}
.num-color1 {
  color: rgba(236, 171, 81, 1);
}
.num-color2 {
  color: rgba(72, 154, 236, 1);
}
.num-color3 {
  color: rgba(60, 217, 200, 1);
}
.num-color4 {
  color: rgba(236, 171, 81, 1);
}
.num-color5 {
  color: rgba(60, 217, 200, 1);
}

.chart1 {
  width: 100%;
  height: 80%;
}

#chart1 {
  width: 100%;
  height: 100%;
}

.chart2 {
  width: 100%;
  height: 80%;
}

#chart2 {
  width: 100%;
  height: 100%;
}

.chart3 {
  width: 100%;
  height: 80%;
}

#chart3 {
  width: 100%;
  height: 100%;
}

.echart-item:nth-child(3) {
  margin-top: -10px;
}
</style>
