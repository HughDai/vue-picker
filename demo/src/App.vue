<template>
    <div id="app">
        <area-picker></area-picker>
    </div>
</template>
<style lang="sass">
    @import "./app.scss";

</style>
<script>
    import AreaPicker from './area-picker.vue'

    export default {
        name: 'app',
        components: {
            AreaPicker
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
