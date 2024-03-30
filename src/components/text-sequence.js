AFRAME.registerComponent('text-sequence', {
    schema: {
        text: {default: '计算机图形学中用于字体渲染和其他图形渲染的技术，特别是在需要高效率和可扩展性时。位图字体在放大时变模糊的问题在实现细节和渲染效果上有所不同'},
        font: {type: 'selector'},
        fontSize: {default: 0.5},
        color: {default: 'green'},
        charsPerLine: {default: 10},
        indent: {default: 2},
        letterSpacing: {default: 0.2},
        lineHeight: {default: 1.5},
        delay: {default: 500} // 控制动画的延迟
    },
    init: function() {
        let data = this.data;
        let el = this.el;

        let chars = data.text.split('');
        let textToShow = '';
        let currentIndex = 0;

        function updateText() {
            if (currentIndex < chars.length) {
                textToShow += chars[currentIndex++];
                el.setAttribute('text-geometry', {
                    value: textToShow,
                    font: data.font.getAttribute('src'),
                    size: data.fontSize
                });
                el.setAttribute('material', {color: data.color});

                setTimeout(updateText, data.delay);
            }
        }

        updateText();
    }
});