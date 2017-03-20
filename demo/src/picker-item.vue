<template>
    <div class="picker-content-list" @touchstart.prevent="_onTouchStart($event)"
         @touchcancel.prevent="_onTouchCancel($event)" @touchmove.prevent="_onTouchMove($event)"
         @touchend.prevent="_onTouchEnd($event)">
        <ul>
            <li :style="{'transform-origin':'center center -'+radius+'px','transform':'translateZ('+radius+'px) rotateX('+(itemAngle*$index*-1)+'deg)'}"
                v-for="item in data">{{item[fields[1]]}}
                <label v-if="!item.hideUnit">{{unit}}</label>
            </li>
        </ul>
        <div class="picker-indicator"></div>
    </div>
</template>
<style lang="sass" rel="stylesheet/scss" scoped>
    .picker-content-list {
        float: left;
        text-align: center;
        position: relative;
        height: 100%;
        overflow: hidden;
        flex: 1;
        ul {
            top: 50%;
            position: absolute;
            left: 0;
            width: 100%;
            height: 2.9rem;
            margin-top: -1.45rem;
            transform-style: preserve-3d;
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
            li {
                line-height: 2.9rem;
                height: 2.9rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 1.2rem;
                vertical-align: middle;
                text-align: center;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                width: 100%;
                height: 100%;
                position: absolute;
                box-sizing: border-box;
                visibility: hidden;
                color: #A6A6A6;
                &.highlight {
                    color: #222;
                }
                &.visible {
                    visibility: visible;
                }
            }
        }
        .picker-indicator {
            width: 100%;
            height: 2.9rem;
            border: none;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            position: absolute;
            top: 50%;
            margin-top: -1.45rem;
        }
    }
</style>
<script type="text/ecmascript-6">
    const MAX_EXCEED = 36
    const VISIBLE_RANGE = 90
    const BLUR_WIDTH = 10
    const platform = navigator.platform.toLowerCase()
    const userAgent = navigator.userAgent.toLowerCase()
    const isIos = (userAgent.indexOf('iphone') > -1 ||
            userAgent.indexOf('ipad') > -1 ||
            userAgent.indexOf('ipod') > -1) &&
            (platform.indexOf('iphone') > -1 ||
            platform.indexOf('ipad') > -1 ||
            platform.indexOf('ipod') > -1)

    export default {
        components: {},
        props: {
            data: {
                type: Array,
                default () {
                    return []
                }
            },
            fields: {
                type: Array,
                default: function () {
                    return ["code", "name"];
                }
            },
            unit: {
                type: String,
                default: ""
            },
            columns: {
                type: Number,
                default: 3
            },
            onChange: {
                type: Function,
                default () {
                }
            },
            onReady: {
                type: Function,
                default () {
                }
            },
            value: {
                type: Object
            }
        },
        data() {
            return {
                itemHeight: 0,
                radius: 0,
                d: 0,
                itemAngle: 0,
                height: 0,
                hightlightRange: 0,
                visibleRange: 0,
                beginAngle: 0,
                beginExceed: 0,
                listAngle: 0,
                lastAngle: 0,
                startY: 0,
                dragging: false
            }
        },
        events: {
            update() {
                this.resetPostion()
            },
            setDisplay() {
                this.resetPostion()
                this.$nextTick(() => {
                    this.onReady && this.onReady()
                })
            }
        },
        methods: {
            rad2deg(rad) {
                return rad / (Math.PI / 180)
            },

            deg2rad(deg) {
                return deg * (Math.PI / 180)
            },
            initInertiaParams() {
                this.lastMoveTime = 0
                this.lastMoveStart = 0
                this.stopInertiaMove = false
            },
            setToTop() {
                this.$nextTick(() => {
                    this.resetPostion()
                    this.value = this.data[0];
                    this.setSelectedIndex(0);
                })
            },
            resetPostion(value) {
                let self = this;
                if (value) {
                    this.value = value;
                }
                this.$nextTick(() => {
                    this.elementItems = this.$el.querySelectorAll('li');
                    this.itemHeight = this.elementItems.length ? this.elementItems[0].clientHeight : 0;
                    this.list = this.$el.querySelector('ul');
                    this.height = this.$el.clientHeight;
                    this.radius = this.height / 2 - BLUR_WIDTH;
                    this.d = this.radius * 2;
                    this.itemAngle = parseInt(this.calcAngle(this.itemHeight));
                    this.hightlightRange = this.itemAngle / 2;
                    this.visibleRange = VISIBLE_RANGE;
                    this.beginAngle = 0;
                    this.beginExceed = this.beginAngle - MAX_EXCEED;
                    this.listAngle = this.beginAngle;
                    this.initInertiaParams();
                    if (isIos) {
                        this.list.style.webkitTransformOrigin = "center center " + self.radius + "px"
                    }
                    self.elementItems.each(function (index, item) {
                        self.endAngle = self.itemAngle * index
                        item.angle = self.endAngle
                    })
                    self.endExceed = self.endAngle + MAX_EXCEED;
                    self.calcElementItemVisibility(self.beginAngle);
                    this.setValue();
                });
            },
            calcAngle(c) {
                let b = 0
                let a = b = parseFloat(this.radius)
                //直径的整倍数部分直接乘以 180
                c = Math.abs(c) //只算角度不关心正负值
                let intDeg = parseInt(c / this.d) * 180
                c = c % this.d
                //余弦
                let cosC = (a * a + b * b - c * c) / (2 * a * b)
                let angleC = intDeg + this.rad2deg(Math.acos(cosC))
                return angleC
            },
            calcElementItemVisibility(angle) {
                let self = this;
                if (self.elementItems) {
                    self.elementItems.each(function (i, item) {
                        let difference = Math.abs(item.angle - angle)
                        if (difference < self.hightlightRange) {
                            item.classList.('visible','highlight')
                        } else if (difference < self.visibleRange) {
                            item.classList.add('visible').remove('highlight')
                        } else {
                            item.classList.remove('visible','highlight')
                        }
                    })
                }
            },
            setAngle(angle) {
                this.listAngle = angle
                if (this.list) {
                    this.list.style.webkitTransform = "perspective(0) rotateY(0deg) rotateX(" + angle + "deg)"
                }
                this.calcElementItemVisibility(angle);
            },
            updateInertiaParams(event, isStart) {
                let point = event.changedTouches ? event.changedTouches[0] : event
                if (isStart) {
                    this.lastMoveStart = point.pageY
                    this.lastMoveTime = event.timeStamp || Date.now()
                    this.startAngle = this.listAngle
                } else {
                    let nowTime = event.timeStamp || Date.now()
                    if (nowTime - this.lastMoveTime > 300) {
                        this.lastMoveTime = nowTime
                        this.lastMoveStart = point.pageY
                    }
                }
                this.stopInertiaMove = true
            },

            startInertiaScroll(event) {
                let point = event.changedTouches ? event.changedTouches[0] : event
                /**
                 * 缓动代码
                 */
                let nowTime = event.timeStamp || Date.now()
                let v = (point.pageY - this.lastMoveStart) / (nowTime - this.lastMoveTime) //最后一段时间手指划动速度
                let dir = v > 0 ? -1 : 1 //加速度方向
                let deceleration = dir * 0.0006 * -1
                let duration = Math.abs(v / deceleration) // 速度消减至0所需时间
                let dist = v * duration / 2 //最终移动多少
                let startAngle = this.listAngle
                let distAngle = this.calcAngle(dist) * dir
                //----
                let srcDistAngle = distAngle
                if (startAngle + distAngle < self.beginExceed) {
                    distAngle = this.beginExceed - startAngle
                    duration = duration * (distAngle / srcDistAngle) * 0.6
                }
                if (startAngle + distAngle > this.endExceed) {
                    distAngle = this.endExceed - startAngle
                    duration = duration * (distAngle / srcDistAngle) * 0.6
                }
                //----
                if (distAngle == 0) {
                    this.endScroll()
                    return
                }
                this.scrollDistAngle(nowTime, startAngle, distAngle, duration)
            },
            scrollDistAngle(nowTime, startAngle, distAngle, duration) {
                let self = this
                self.stopInertiaMove = false;
                (function (nowTime, startAngle, distAngle, duration) {
                    let frameInterval = 13
                    let stepCount = duration / frameInterval
                    let stepIndex = 0;
                    (function inertiaMove() {
                        if (self.stopInertiaMove) return
                        let newAngle = self.quartEaseOut(stepIndex, startAngle, distAngle, stepCount)
                        self.setAngle(newAngle)
                        stepIndex++
                        if (stepIndex > stepCount - 1 || newAngle < self.beginExceed || newAngle > self.endExceed) {
                            self.endScroll()
                            return
                        }
                        setTimeout(inertiaMove, frameInterval)
                    })()
                })(nowTime, startAngle, distAngle, duration)
            },

            quartEaseOut(t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b
            },

            endScroll() {
                if (this.listAngle < this.beginAngle) {
                    this.list.style.webkitTransition = "150ms ease-out"
                    this.setAngle(this.beginAngle)
                } else if (this.listAngle > this.endAngle) {
                    this.list.style.webkitTransition = "150ms ease-out"
                    this.setAngle(this.endAngle)
                } else {
                    let index = parseInt((this.listAngle / this.itemAngle).toFixed(0))
                    this.list.style.webkitTransition = "100ms ease-out"
                    this.setAngle(this.itemAngle * index)
                }
                this.select()
                this.onChange && this.onChange(this.value)
            },

            select() {
                let index = this.getSelectedIndex()
                let item = this.data[index]
                this.value = item
            },

            correctAngle(angle) {
                if (angle < this.beginAngle) {
                    return this.beginAngle
                } else if (angle > this.endAngle) {
                    return this.endAngle
                } else {
                    return angle
                }
            },

            getSelectedIndex() {
                return parseInt((this.listAngle / this.itemAngle).toFixed(0))
            },

            setSelectedIndex(index, duration) {
                if (this.list) {
                    this.list.style.webkitTransition = ''
                }
                let angle = this.correctAngle(this.itemAngle * index)
                if (duration && duration > 0) {
                    let distAngle = angle - this.listAngle
                    this.scrollDistAngle(Date.now(), this.listAngle, distAngle, duration)
                } else {
                    this.setAngle(angle)
                }
            },

            getSelectedItem() {
                return this.data[this.getSelectedIndex()]
            },

            getValue() {
                return this.value
            },
            setValue() {
                let self = this;
                var initItem = {};
                var index = -1;
                for (var i = 0, len = this.data.length; i < len; i++) {
                    var item = this.data[i];
                    if (item[this.fields[0]] == self.value[this.fields[0]]) {
                        initItem = item;
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    this.value = initItem;
                    this.setSelectedIndex(index);
                } else {
                    if (this.data.length > 0) {
                        this.value = this.data[0];
                        this.setSelectedIndex(0);
                    }
                }
            },
            _onTouchStart(e) {
                if (!this.data.length) {
                    return false
                }
                this.list.style.webkitTransition = ''
                this.startY = (e.changedTouches ? e.changedTouches[0] : e).pageY
                this.lastAngle = this.listAngle;
                this.updateInertiaParams(e, true)
            },
            _onTouchCancel(e) {
                this.startInertiaScroll(e)
            },
            _onTouchMove(e) {
                let endY = (e.changedTouches ? e.changedTouches[0] : e).pageY;
                let dragRange = endY - this.startY
                let dragAngle = this.calcAngle(dragRange)
                let newAngle = dragRange > 0 ? this.lastAngle - dragAngle : this.lastAngle + dragAngle
                if (newAngle > this.endExceed) {
                    newAngle = this.endExceed
                }
                if (newAngle < this.beginExceed) {
                    newAngle = this.beginExceed
                }
                this.setAngle(newAngle)
                this.updateInertiaParams(e)
            },
            _onTouchEnd(e) {
                this.startInertiaScroll(e)
            }
        }
    }
</script>
