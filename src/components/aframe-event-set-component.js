// 检查AFRAME是否已定义，确保在AFRAME可用之后再注册组件。
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

// 使用AFRAME.utils.styleParser工具解析样式字符串，它将字符串解析为对象。
var styleParser = AFRAME.utils.styleParser;

// 注册一个名为'event-set'的新组件。
AFRAME.registerComponent('event-set', {
    // 组件的schema定义了组件的数据结构。
    schema: {
        default: '',
        // parse函数用于将传入的值转换成组件内部使用的格式。
        // 这里，它将字符串解析为对象，并将对象的键从camelCase转换为hyphen-case。
        parse: function (value) {
            // console.log("value:", value);
            var obj = styleParser.parse(value);
            // console.log("obj:", obj);
            var convertedObj = {};
            Object.keys(obj).forEach(function (key) {
                var hyphened = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                convertedObj[hyphened] = obj[key];
            });
            return convertedObj;
        }
    },

    // 允许组件被多次定义在同一个实体上。
    multiple: true,

    // 组件的初始化函数，在组件第一次创建时调用。
    init: function () {
        // 初始化事件处理器和事件名称为null。
        this.eventHandler = null;
        this.eventName = null;
        // console.log("event-set init");
    },

    // 在组件的数据更新时调用，移除旧的事件监听器，并添加新的。
    update: function (oldData) {
        this.removeEventListener();
        this.updateEventListener();
        this.addEventListener();
        // console.log("event-set update");
    },

    // 组件被移除时调用，用于清理，比如移除事件监听器。
    remove: function () {
        this.removeEventListener();
        console.log("event-set remove");
    },

    // 实体暂停时调用，可以用于停止动态行为。
    pause: function () {
        this.removeEventListener();
        //   console.log("pause");
    },

    // 实体恢复时调用，可以用于继续动态行为。
    play: function () {
        this.addEventListener();
        //   console.log("play");
    },

    // 更新事件监听的内部逻辑，不直接添加监听器。
    updateEventListener: function () {
        var data = this.data; // 组件的当前数据。如"_event: mouseenter; color: #8FF7FF"
        var el = this.el; // 组件所附着的实体。比如一个box

        // 解析特殊的_event、_target、_function属性用于设置事件监听。
        var event = data._event;
        var target = data._target;
        var functionName = data._function; // 新增：用于指定要调用的函数名
        var params = data._params; // 新增：用于传递给函数的参数
        delete data._event;
        delete data._target;
        delete data._function;
        delete data._params;
        var self = this;

        // 确定目标实体，是当前实体还是场景中的其他实体。
        var targetEl = target ? el.sceneEl.querySelector(target) : el;

        this.eventName = event;

        this.eventHandler = function handler(event) {
            if (functionName && typeof window[functionName] === 'function') {
                // 如果定义了_function且对应的全局函数存在，则调用该函数
                if (params)
                    window[functionName](targetEl, params);
                else
                    window[functionName](targetEl, { eventName: event.type });
            }
            else {
                // 现在的data中只包含样式属性，
                Object.keys(data).forEach(function setAttribute(propName) {
                    AFRAME.utils.entity.setComponentProperty.call(this, targetEl, propName, data[propName]);
                });
            }

        };
    },

    //添加事件监听器到当前实体。通过这行代码，将会在mouseenter事件发生时，调用handler，遍历data中定义的属性，并设置到目标实体上。
    addEventListener: function () {
        this.el.addEventListener(this.eventName, this.eventHandler);
    },

    // 从当前实体移除事件监听器。
    removeEventListener: function () {
        this.el.removeEventListener(this.eventName, this.eventHandler);
    }
});
