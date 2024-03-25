AFRAME.registerComponent('text-animation', {
    schema: {
        text: { type: 'string' },
        font: { type: 'selector' },
        fontSize: { type: 'number', default: 0.5 },
        color: { type: 'string', default: '#FFF' },
        charsPerLine: { type: 'number', default: 10 },
        indent: { type: 'number', default: 2 }, 
        position: { type: 'vec3', default: { x: 0, y: 2, z: -5 } },
        letterSpacing: { type: 'number', default: 0 },
        lineHeight: { type: 'number', default: 1.5 } 
    },
    init: function () {
        const data = this.data;
        const el = this.el;
        var functionName = data._function;
        delete this._function;
        const characters = data.text.split('');
        let currentLine = 0;
        let charIndex = 0; 

        characters.forEach((char, index) => {
            if (charIndex >= data.charsPerLine || (currentLine === 0 && charIndex >= data.charsPerLine - data.indent)) {
                currentLine++;
                charIndex = 0;
            }

            const textEl = document.createElement('a-entity');
            const deltaPosition = {
                x: (charIndex + (currentLine === 0 ? data.indent : 0)) * (data.fontSize + data.letterSpacing), // 使用字间距
                y: -currentLine * (data.fontSize * data.lineHeight), 
                z: 0
            };
            var curPosition = {
                x: data.position.x+deltaPosition.x,
                y: data.position.y+deltaPosition.y,
                z: data.position.z+deltaPosition.z
            }
            textEl.setAttribute('text-geometry', {
                value: char,
                font: data.font.getAttribute('src'),
                size: data.fontSize,
                bevelEnabled: false,
                curveSegments: 4,
                height:0.05
            });
            textEl.setAttribute('material', { color: data.color, transparent: true, opacity: 0 }); // 初始透明度为0
            textEl.setAttribute('position', curPosition);
            if (functionName && typeof window[functionName] === 'function') {
                window[functionName](textEl, index, curPosition, data);
            }
            else { console.log('没有自定义动画函数'); }
            el.appendChild(textEl);
            charIndex++;
        });
    },
});
