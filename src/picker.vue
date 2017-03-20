<template>
    <div class="picker-wrap">
        <span :class="{'defaultColor':!value || value[fields[0]]==='' || value[fields[0]]===undefined}">
            <template v-if="value && value[fields[0]]!=='' && value[fields[0]]!==undefined">
                {{value[fields[1]]}}
            </template>
            <template v-else>
                {{defaultText}}
            </template>
        </span>
        <div class="fade-transition" v-show="show" :style="{height:deviceHeight+'px'}" @touchmove.stop="_stopDef" @mousewheel="_stopDef">
        </div>
        <div transition="expand" v-show="show" @mousewheel="_stopDef">
            <div class="picker-header">
                <div class="picker-header-title cancel" @click.stop="submit(false)" v-text="cancel"></div>
                <div class="picker-header-title confirm" @click.stop="submit(true)" v-text="confirm"></div>
            </div>
            <input type="hidden" :id="id" v-model="value.id">
            <div class="picker-content" :style="{height:wrapHeight+'px'}">
                <picker-item :columns="1" v-ref:select :data="data" :fields="fields" :value="value"></picker-item>
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
    import PickerItem from "./picker-item.vue"
    import util from "./util";
    export default {
        data: function() {
            return {
                deviceHeight: 0
            }
        },
        props: {
            data: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            id: {
                type: String,
                default: ""
            },
            fields: {
                type: Array,
                default: function() {
                    return [
                        "code",
                        "name"
                    ];
                }
            },
            defaultText: {
                type: String,
                default: "请选择"
            },
            show: Boolean,
            value: {
                type: Object,
                toWay: true,
                default: function() {
                    return {

                    }
                }
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
            this.select = this.$refs["select"];
        },
        watch: {
            data(newVal, oldVal) {
                if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
                    if (this.value) {
                        this.setValue(this.value);
                    }
                }
            },
            value(newVal, oldVal) {
                if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
                    if (this.value) {
                        this.setValue(this.value);
                    }
                }
            }
        },
        methods: {
            _stopDef(e) {
                e.preventDefault()
            },
            submit(isSubmit) {
                if (isSubmit) {
                    var selectVal = this.select.value;
                    if (selectVal && selectVal[this.fields[0]] !== "" && selectVal[this.fields[0]] !== undefined) {
                        this.value = selectVal;
                    } else {
                        if (this.data.length > 0) {
                            this.value = this.data[0];
                        }
                    }
                    this.onSubmit && this.onSubmit(this.value, this.display);
                }
                this.show = false;
            },
            getDispaly() {
                return this.display
            },
            setValue(value) {
                this.value = value;
                this.$broadcast('setDisplay');
            },
            getValue() {
                return this.value;
            },
            isValid() {
                return this.value[this.fields[0]] !== "" && this.value[this.fields[0]] !== undefined;
            },
            showHandler() {
                if (this.value && this.value[this.fields[0]]) {
                    this.select.resetPostion(this.value);
                } else {
                    this.select.setToTop();
                }
                if (!this.readOnly) {
                    this.show = true;
                    this.$broadcast('update');
                }
            }
        }
    }
</script>

