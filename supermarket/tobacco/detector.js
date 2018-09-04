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
         * @param {string[]} [detectConfig.excludes] - 排除商品：商品名称|商品代码|所在行
         * @param {Object[]} [detectConfig.includes] - 包含商品
         * @param {string} [detectConfig.includes.name] - 商品名称|商品代码|所在行
         * @param {number} [detectConfig.includes.num] - 需求数量，如果可定数量不够自动减少
         */
        var detectConfig = window.detectConfig || {};
        var detectConfigExcludes = detectConfig.excludes || [];
        var detectConfigIncludes = detectConfig.includes || [];
        var detectFn = function() {
            inputEls.each(function(index) {
                var el = $(this);
                var tdEl = el.parent();
                var num = parseInt(el.val()); //需求数量
                var yuding_num = parseInt(tdEl.prev().find('input').val()); //预定数量
                var keding_num = parseInt(tdEl.next().find('input').val()); //可定数量
                var name = tdEl.parent().find('input[name*=".productDesc"]').val() || ''; //商品名称
                var code = tdEl.parent().find('input[name*=".productCode"]').val() || ''; //商品代码

                if (!yuding_num || num || num === 0) return;

                num = yuding_num;
                if (!isNaN(keding_num)) {
                    num = Math.min(yuding_num, keding_num);
                }

                for (var i = 0, l = detectConfigExcludes.length, item; i < l; i++) {
                    item = detectConfigExcludes[i];
                    if (item === code || item === name || item === (index + 1)) {
                        return;
                    }
                }

                for (var i = 0, l = detectConfigIncludes.length, item; i < l; i++) {
                    item = detectConfigIncludes[i] || {};
                    if (item.name === code || item.name === name || item.name === (index + 1)) {
                        if ('num' in item) {
                            num = item.num;
                        }
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