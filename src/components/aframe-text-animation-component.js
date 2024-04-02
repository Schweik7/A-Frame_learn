console.log('aframe-text-animation-component.js loaded');
function parsePosition(position) {
  // 如果position已经是一个对象，直接返回它
  if (typeof position === 'object' && position !== null) {
    return position;
  }

  // 如果position是一个字符串，尝试解析它
  if (typeof position === 'string') {
    // 将字符串分割为数组，基于空格
    const parts = position.split(/\s+/);
    if (parts.length === 3) {
      // 将字符串数组的每个部分转换为浮点数
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);

      // 检查转换后的x, y, z是否为有效数字
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        return { x, y, z };
      }
    }
  }

  // 如果输入无法解析为有效的位置对象，抛出错误或返回null/默认值
  console.error('Invalid position value:', position);
  return null; // 或者根据需要提供一个默认位置对象
}

AFRAME.registerComponent('text-animation', {
  schema: {
    text: { type: 'string' },
    font: { type: 'selector' },
    fontSize: { type: 'number', default: 0.5 },
    color: { type: 'string', default: '#FFF' },
    charsPerLine: { type: 'number', default: 10 },
    indent: { type: 'number', default: 2 },
    position: { type: 'vec3', default: { x: 0, y: 2, z: -5 } },
    letterSpacing: { type: 'number', default: 0.2 },
    lineHeight: { type: 'number', default: 1.5 },
    curveSegments: { type: 'number', default: 4 },
    height: { type: 'number', default: 0.05 },
    signalTarget: { type:'string', default: '' },
  },
  init: function () {
    let data = this.data;
    const el = this.el;
    const functionName = data._function;
    delete this._function;
    const characters = data.text.split('');
    let currentLine = 0;
    let charIndex = 0;
    let index = 0;
    let position = data.position;
    // console.log("data initial position:", data.position,"data text:", data.text);
    const animateText = () => {
      // data.position = parsePosition(data.position);// 从第二次执行开始，这个data.position可能会从字典变成原始的字符串，导致后续执行错误 
      if (charIndex >= data.charsPerLine || (currentLine === 0 && charIndex >= data.charsPerLine - data.indent) || index >= characters.length) {
        currentLine++; // 大于每行换行；首行且小于每行-缩进，则换行；全部打印完毕，则加一行
        charIndex = 0;
      }
      const deltaPosition = {
        x: (charIndex + (currentLine === 0 ? data.indent : 0)) * (data.fontSize + data.letterSpacing),
        y: -currentLine * (data.fontSize * data.lineHeight),
        z: 0
      };
      const curPosition = {
        x: position.x + deltaPosition.x,
        y: position.y + deltaPosition.y,
        z: position.z + deltaPosition.z
      };
      // 导出下一个位置，供外部调用
      if (index >= characters.length) { 
        // window.cur_pos = curPosition; 
        if (data.signalTarget)
        {
          let detail={ nextPosition: curPosition,nextEl:data.signalTarget};
          console.log("emit signal","detail:",detail);
          el.emit('textAnimationEnd', detail,true);
        }
        return 
      };

      const char = characters[index];
      const textEl = document.createElement('a-entity');
      textEl.setAttribute('text-geometry', {
        value: char,
        font: data.font.getAttribute('src'),
        size: data.fontSize,
        bevelEnabled: false,
        curveSegments: data.curveSegments,
        height: data.height
      });
      textEl.setAttribute('material', { color: data.color, transparent: true, opacity: 0 });
      textEl.setAttribute('position', curPosition);
      if (functionName && typeof window[functionName] === 'function') {
        window[functionName](textEl, index, curPosition, data);
      }
      else { console.log('no function provided,expected ', functionName); }
      el.appendChild(textEl);
      charIndex++;
      index++;
      requestAnimationFrame(animateText);
    };
    animateText();
  }
});