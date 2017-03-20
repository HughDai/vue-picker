/**
 * Created by hughdai on 17/3/20.
 */
export default {
    page: {
        getWidth: function() {
            var doc = document,
                body = doc.body,
                html = doc.documentElement,
                client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
            return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
        },
        getHeight: function() {
            var doc = document,
                body = doc.body,
                html = doc.documentElement,
                client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
            return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
        },
        getViewWidth: function() {
            var doc = document,
                client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;
            return client.clientWidth;
        },
        getViewHeight: function(doc) {
            var doc = document || doc,
                client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;
            return client.clientHeight;
        }
    },
    getRemPx() {
        var pageWidth = this.page.getViewWidth();
        var REMPX = 12;
        if (pageWidth >= 320 && pageWidth < 360) {
            REMPX = 12;
        }
        if (pageWidth >= 360 && pageWidth < 375) {
            REMPX = 13.44;
        }
        if (pageWidth >= 375 && pageWidth < 414) {
            REMPX = 14;
        }
        if (pageWidth >= 414 && pageWidth < 640) {
            REMPX = 15.5;
        }
        return REMPX;
    }
}