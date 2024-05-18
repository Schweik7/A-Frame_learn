AFRAME.registerComponent('text-animation', {
  schema: {
    text: { type: 'string' },
    font: { type: 'selector' },
    fontSize: { type: 'number', default: 0.35 },
    color: { type: 'string', default: '#FFF' },
    charsPerLine: { type: 'number', default: 10 },
    indent: { type: 'number', default: 2 },
    position: { type: 'vec3', default: { x: 0, y: 1, z: 0.05 } },
    letterSpacing: { type: 'number', default: 0.2 },
    lineHeight: { type: 'number', default: 0.2 },
    curveSegments: { type: 'number', default: 4 },
    height: { type: 'number', default: 0.05 },
    signalTarget: { type: 'string', default: '' },
    childID: { type: 'string', default: 'child' },
  },
  init: function () {
    let data = this.data;
    const el = this.el;
    const functionName = data._function;
    delete this._function;
    const characters = data.text.split('');
    let currentLine = 0;
    let charLineIndex = 0;
    let index = 0;
    let oriPosition = data.position;
    let maxLineLength = 0;

    // 创建父实体
    const parentEntity = document.createElement('a-entity');
    el.appendChild(parentEntity);

    // 创建背景板
    const panel = document.createElement('a-plane');
    panel.setAttribute('color', '#333');
    panel.setAttribute('opacity', '0');// 隐藏背景板
    panel.id=el.id+'-panel';


    parentEntity.appendChild(panel);

    // 创建文本容器
    const textContainer = document.createElement('a-entity');
    parentEntity.appendChild(textContainer);
    panel.textEl=el; // 记录绑定的文本实体
    el.panelEl=panel; // 记录绑定的背景板实体

    // 添加 proxy-event 组件将 mouseenter、mouseleave 事件转发给 panel
    // el.setAttribute('proxy-event', {
    //   event: 'mouseenter',
    //   to: `#${panel.id}`,
    //   bubbles: false,
    //   enabled:true,
    //   captureBubbles:true,
    // });
    // el.setAttribute('proxy-event', {
    //   event: 'mouseleave',
    //   to: `#${panel.id}`,
    //   bubbles: false,
    //   enabled:true,
    //   captureBubbles:true,
    // });

    const animateText = () => {
      if (index >= characters.length) {
        // 动画完成后，更新背景板尺寸和位置
        const panelWidth = (maxLineLength + 1) * (data.fontSize + data.letterSpacing);
        const panelHeight = (currentLine + 1) * (data.fontSize + data.lineHeight);
        panel.setAttribute('width', panelWidth);
        panel.setAttribute('height', panelHeight);
        panel.setAttribute('opacity','0.8');
        panel.setAttribute('position', {
          x: panelWidth / 2 + oriPosition.x,
          y: -panelHeight / 2 + oriPosition.y + data.lineHeight/2+data.fontSize,
          z: -0.01 + oriPosition.z, // 使其位于文字后面
        });
        return;
      }

      let curPosition;
      ({ curPosition, charIndex: charLineIndex, currentLine } = calcPosition(charLineIndex, data, currentLine, index, characters, oriPosition));

      maxLineLength = Math.max(maxLineLength, charLineIndex);

      const char = characters[index];
      const textEl = document.createElement('a-entity');
      textEl.setAttribute('text-geometry', {
        value: char,
        font: data.font.getAttribute('src'),
        size: data.fontSize,
        bevelEnabled: false,
        curveSegments: data.curveSegments,
        height: data.height,
      });
      textEl.setAttribute('material', { color: data.color, transparent: true, opacity: 0 });
      textEl.setAttribute('position', curPosition);
      textEl.id = data.childID + index;
      textContainer.appendChild(textEl);
      charLineIndex++;
      index++;
      if (functionName && typeof window[functionName] === 'function') {
        window[functionName](textEl, index, curPosition, data, charLineIndex, currentLine, oriPosition);
      } else {
        console.log('no function provided, expected ', functionName);
      }
      requestAnimationFrame(animateText);
    };
    animateText();
  }
});

function calcPosition(charIndex, data, currentLine, index, characters, oriPosition) {
  if (charIndex >= data.charsPerLine || (currentLine === 0 && charIndex >= data.charsPerLine - data.indent) || index >= characters.length) {
    currentLine++;
    charIndex = 0;
  }
  const deltaPosition = {
    x: (charIndex + (currentLine === 0 ? data.indent : 0)) * (data.fontSize + data.letterSpacing),
    y: -currentLine * (data.fontSize + data.lineHeight),
    z: 0
  };
  const curPosition = {
    x: oriPosition.x + deltaPosition.x,
    y: oriPosition.y + deltaPosition.y,
    z: oriPosition.z + deltaPosition.z
  };
  return { curPosition, charIndex, currentLine };
}
window.calcPosition = calcPosition;
