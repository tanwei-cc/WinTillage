/**
 * 天津烟草订购探测程序
 * http://www.tobaccotj.com/ebp/
 */
(function() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdn.bootcss.com/jquery/1.9.1/jquery.min.js";
    script.onload = function() {
        var container = $($('[name="mainFrame"]')[0].contentWindow.document.body);
        var formEl = container.find('[name="orderSdTJForm"]');
        var tableEl = formEl.find('#dataTable');
        var inputEls = tableEl.find('input[name*=".qtyReq"]');
        var logs = {};
        /**
         * @param {Object} detectConfig - 探测配置
         * @param {Object[]} [detectConfig.excludes] - 排除商品
         * @param {string} [detectConfig.excludes.name] - 匹配名称
         * @param {number} [detectConfig.excludes.row] - 所在行数
         * @param {boolean} [detectConfig.excludes.vague] - 是否模糊匹配
         * @param {Object} [detectConfig.numHash] - 预定需求数量
         * @param {number} [detectConfig.numHash<key>] - productCode
         * @param {number} [detectConfig.numHash<val>] - 需求数量，如果可定数量不够自动减少
         */
        var detectConfig = window.detectConfig || {};
        var detectConfigExcludes = detectConfig.excludes || [];
        var detectFn = function() {
            inputEls.each(function(index) {
                var el = $(this);
                var tdEl = el.parent();
                var num = parseInt(el.val()); //需求数量
                var yuding_num = parseInt(tdEl.prev().find('input').val()); //预定数量
                var keding_num = parseInt(tdEl.next().find('input').val()); //可定数量
                var name = tdEl.parent().find('input[name*=".productDesc"]').val() || ''; //商品名称
                var code = tdEl.parent().find('input[name*=".productCode"]').val() || ''; //商品编号

                if (!yuding_num || num || num === 0) return;

                num = yuding_num;
                if (!isNaN(keding_num)) {
                    num = Math.min(yuding_num, keding_num);
                }

                for (var i = 0, l = detectConfigExcludes.length, item; i < l; i++) {
                    item = detectConfigExcludes[i] || {};
                    if (item.name === name || item.row === (index + 1)) { //精确匹配
                        return;
                    }
                    if (item.vague && name.indexOf(item.name) > -1) { //模糊匹配
                        return;
                    }
                }

                if (num === parseInt(el.val())) return; //数量无变化

                logs[index] = {
                    row: index + 1,
                    name: name,
                    yuding_num: yuding_num,
                    num: num,
                    keding_num: keding_num || '空'
                };

                el.val(num);
            });
        }

        console.log(inputEls, tableEl, formEl, container);
        if (!inputEls.size()) {
            console.log('【探测失败】获取元素失败！！！');
            return;
        }

        console.log('开始探测...');
        tableEl.css('table-layout', 'inherit');
        detectFn();
        setTimeout(function() {
            var logCount = 0;

            detectFn();
            // console.log('行号', '商品名称', '合理定量-需求数量-订货数量');
            $.each(logs, function(idx, log) {
                logCount++;
                console.log(log.row, log.name, log.yuding_num + '-' + log.num + '-' + log.keding_num);
            });
            console.log('修改商品数量', logCount);
            console.log('探测结束');

            if (detectConfig.autoSubmit) {
                formEl.submit();
            }
        }, 5000);
    };
    document.getElementsByTagName("head")[0].appendChild(script);
})();