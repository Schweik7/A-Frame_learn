/* global AFRAME */
// used for event discovery, to investigate how things work
AFRAME.registerComponent('log-all-events', {
    // adapted from ttps://stackoverflow.com/a/68462435/4526479
    schema: {
      skip: {default: [], type: 'array'},
      debug: {default: false, type:'bool'},
      includeFullEventObject: {default: false, type:'bool'},
      includeEvtDetail: {default: true, type:'bool'},
      consoleMethod: {default:'log', type:'string'},
      nativeEvents: {default:true, type:'bool'},
      syntheticEvents: {default:true, type:'bool'},
      timestamp: {default:true, type:'bool'},
    },
    listenForSyntheticEvents: function addEventListenerAll(target, listener, ...otherArguments) {
        // dynamically install listeners for all manually triggered events, just-in-time before they're dispatched ;D
        const dispatchEvent_original = EventTarget.prototype.dispatchEvent;
        const self = this;
        const listening = {};
        function dispatchEvent(event) {
          if (!self.data.skip.includes(event.type) && !listening.hasOwnProperty(event.type)) {
            listening[event.type] = true;
            if (self.data.debug) console.log("adding listener dynamically for", event.type);
            target.addEventListener(event.type, listener, ...otherArguments);
          }
          else if (self.data.debug) {
            console.log("skipping event of type", event.type)
          }
          dispatchEvent_original.apply(this, arguments);
        }
        EventTarget.prototype.dispatchEvent = dispatchEvent;
        if (EventTarget.prototype.dispatchEvent !== dispatchEvent) throw new Error(`log-all-events cannot catch synthetic events!`);
    },
    listenForNativeEvents(target, listener, ...otherArguments) {
        for (const key in target) {
            if (/^on/.test(key)) {
                const eventType = key.substr(2);
                console.log(eventType, key)
                if (!this.data.skip.includes(eventType)) {
                  target.addEventListener(eventType, listener, ...otherArguments);
                }
                else if (self.data.debug) {
                  console.log("skipping event of type", event.type);
                }
            }
        }
    },
    init() {    
      let args = [
        this.el,
        (evt) => {
          let args = ['log-all-events:'];
          if (this.data.timestamp) args.push(performance.now())
          if (this.el.id) args.push(this.el.id);
          args.push(evt.type);
          if (this.data.includeFullEventObject) args.push(evt);
          if (this.data.includeEventDetail) args.push(evt.detail);
          console[this.data.consoleMethod](...args);
        }
      ];
      
      if (this.data.nativeEvents) {
          this.listenForNativeEvents(...args)
      }
      if (this.data.syntheticEvents) {
          this.listenForSyntheticEvents(...args)
      }
    }
  });