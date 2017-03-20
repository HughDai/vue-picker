<template>
    <div class="picker-wrap">
        <span @click.stop="showHandler" :class="{'defaultColor':!value}">
            <template v-if="value">
                {{display}}
            </template>
            <template v-else>
                省/市/县
            </template>
        </span>
        <div transition="fade" v-show="show" :style="{height:deviceHeight+'px'}" @touchmove.stop="_stopDef" @mousewheel="_stopDef">
        </div>
        <div transition="expand" v-show="show" @mousewheel="_stopDef">
            <div class="picker-header">
                <div class="picker-header-title cancel" @click.stop="submit(false)" v-text="cancel"></div>
                <div class="picker-header-title confirm" @click.stop="submit(true)" v-text="confirm"></div>
            </div>
            <div class="picker-content" :style="{height:wrapHeight+'px'}">
                <picker-item v-ref:province :data="provinceData" :value="selected.province" :on-change="onProvinceChange" :on-ready="onReady"></picker-item>
                <picker-item :on-ready="onReady" v-ref:city :data="cityData" :value="selected.city" :on-change="onCityChange"></picker-item>
                <picker-item :on-ready="onReady" v-ref:area :data="areaData" :value="selected.area"></picker-item>
            </div>
        </div>
    </div>
</template>
<style lang="sass" rel="stylesheet/scss" scoped>
    .picker-wrap {
        font-size: 1.33rem;
        .defaultColor {
            color: #999;
        }
        .picker-header {
            background-color: #eee;
            height: 3.67rem;
            line-height: 3.67rem;
            overflow: hidden;
            text-align: center;
            .confirm {
                float: right;
            }
            .cancel {
                float: left;
            }
            &-title {
                padding: 0 1.67rem;
                color: #333333;
            }
        }
        .picker-content {
            width: 100%;
            margin: 0 auto;
            background: #fff;
            overflow: hidden;
            height: 20.3rem;
            overflow: hidden;
            -webkit-mask-box-image: -webkit-linear-gradient(bottom, transparent, transparent 5%, #fff 20%, #fff 80%, transparent 95%, transparent);
            -webkit-mask-box-image: linear-gradient(top, transparent, transparent 5%, #fff 20%, #fff 80%, transparent 95%, transparent);
        }
        .fade-transition {
            transition: all .5s ease;
            background: rgba(0, 0, 0, .7);
            z-index: 200;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .fade-enter,
        .fade-leave {
            opacity: 0;
        }
        .expand-transition {
            transition: all .4s ease;
            position: fixed;
            z-index: 300;
            background: #fff;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .expand-leave,
        .expand-enter {
            bottom: -23.97rem;
        }
    }
</style>
<script>
    import {
            province,
            city,
            getAreaName,
            area
    } from './area'
    import PickerItem from "./picker-item.vue"
    import util from "./util";
    export default {
        data() {
            return {
                provinceData: [],
                cityData: [],
                areaData: [],
                display: "省/市/县",
                deviceHeight: 0,
                selected: {
                    province: {
                        code: "",
                        name: ""
                    },
                    city: {
                        code: "",
                        name: ""
                    },
                    area: {
                        code: "",
                        name: ""
                    }
                }
            }
        },
        props: {
            show: Boolean,
            value: {
                type: String,
                default: ""
            },
            onSubmit: {
                type: Function,
                default: function() {

                }
            },
            confirm: {
                type: String,
                default: '确定'
            },
            cancel: {
                type: String,
                default: '取消'
            },
            readOnly: {
                type: Boolean,
                default: ''
            }
        },
        components: {
            PickerItem
        },
        created() {
            this.wrapHeight = util.page.getViewHeight() / 2 - util.getRemPx() * 3.67;
            this.deviceHeight = util.page.getHeight();
        },
        ready() {
            this.province = this.$refs["province"];
            this.city = this.$refs["city"];
            this.area = this.$refs["area"];
            this._refresh();
        },
        methods: {
            init() {
                this.provinceData = province.map((p) => p);
                this._refresh();
            },
            _refresh(value) {
                this._parseResult(value);
                this._filterCity(this.selected.province.code);
                this._filterArea(this.selected.city.code);
            },
            onProvinceChange(item) {
                if (item && item.code) {
                    this._filterCity(item.code)
                    this._filterArea(this.cityData[0].code)
                } else {
                    this.cityData = []
                    this.areaData = []
                }
                this.city.setToTop()
                this.area.setToTop()
            },
            onCityChange(item) {
                if (item && item.code) {
                    this._filterArea(item.code)
                } else {
                    this.areaData = []
                }
                this.area.setToTop()
            },
            _filterCity(code) {
                this.cityData = city.filter((c, index) => {
                            return c.code.substring(0, 2).padEnd(6, '0000') == code
                        })
            },
            _filterArea(code) {
                this.areaData = area.filter((a, index) => {
                            return a.code.substring(0, 4).padEnd(6, '00') == code
                        })
            },
            _parseResult(value) {
                value = value || this.value;
                let cId = value ? value.substring(0, 4).padEnd(6, '00') : ""
                let pId = value ? cId.substring(0, 2).padEnd(6, '0000') : ""
                this.selected = {
                    province: {
                        code: pId
                    },
                    city: {
                        code: cId
                    },
                    area: {
                        code: value
                    }
                }
            },
            onReady() {
                this.setDisplay();
            },
            _stopDef(e) {
                e.preventDefault()
            },
            submit(isSubmit) {
                if (isSubmit) {
                    if (this.area.value) {
                        this.value = this.area.value.code
                    } else {
                        this.value = "";
                    }
                    this.setDisplay();
                    this.onSubmit && this.onSubmit(this.value, this.display);
                }
                this.show = false;
            },
            setDisplay() {
                if (this.province.value.code) {
                    this.display = [this.province.value.name, this.city.value.name, this.area.value.name].join('/')
                } else {
                    this.value = "";
                    this.display = "省/市/县";
                }
            },
            getDispaly() {
                return this.display
            },
            setValue(value) {
                this.value = value;
                this.init();
                this.$broadcast('setDisplay');
            },
            getValue() {
                return this.value;
            },
            isValid() {
                return this.value != ''
            },
            showHandler() {
                this._refresh(!this.value ? "110101" : "");
                if (!this.readOnly) {
                    this.show = true;
                    this.$broadcast('update');
                }
            }
        }
    }
</script>
