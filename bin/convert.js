/**
 * @file convert 收集样式文件中的font-size转化为对应dpi可用的font-size
 * @author ienix(enix@foxmail.com)
 *
 * @since 16/5/20
 */

"use strict";

let css = require('css');

module.exports = function(content, file, conf){
    if (content.match(/^\s*\/\*([^\/]+)\*\//) && RegExp.$1.match(/@norem\b/)) {
        // ignore file
        return content;
    }

    let rules = css.parse(content).stylesheet.rules;

    if (!rules.length) {
        return content;
    }
    
    let dpi2 = [];
    let dpi3 = [];
    
    rules.forEach(function (item) {

        if (item.type !== 'rule') {
            return false;
        }

        let declarations = item.declarations;

        declarations.forEach(function (val) {
            if (val.property.toLowerCase() === 'font-size'
                && !/@norem\b/g.test(val.value)) {

                let oldVal = val.value.split('px');

                if (!oldVal[0]) return;

                let rule = create(item.selectors, (' ' + oldVal[1]) || '');

                dpi2.push(rule.replace(/%s/g, oldVal[0] * 2));
                dpi3.push(rule.replace(/%s/g, oldVal[0] * 3));
            }
        });
    });

    function create(selectors, suffix) {
        return '\r'
            + '    ' + selectors + ' {\r'
            + '        font-size: %spx'+ suffix +';\r'
            + '    }\r'
    }

    function getResponsiveStyle() {
        return ''
            + '\r@media(-webkit-min-device-pixel-ratio: 2) {\r'
            + '    ' + dpi2.join('')
            + '}'
            + '\r@media(-webkit-min-device-pixel-ratio: 3) {\r'
            + '    ' + dpi3.join('')
            + '}'
    }

    if (dpi2.length) {
        return content + getResponsiveStyle();
    }
    else {
        return content;
    }
    
};
