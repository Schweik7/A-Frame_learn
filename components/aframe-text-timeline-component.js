AFRAME.registerComponent("text-timeline", {
    init: function () {
        this.el.addEventListener("text-split", evt => {
            const letter_elements = this.el.children;
            const timeline = anime.timeline({
                easing: 'spring(1, 80, 10, 0)',
                direction: 'alternate',
                loop: true,
                duration: 250
            });
            const position_offset = 0.25;
            const time_offset = 100;

            // keep the original positions so that we can use an offset position. 
            // might as well use a wrapper object
            const original_pos = [];
            for (let element of letter_elements) {
                original_pos.push(element.object3D.position.clone())
            };

            // make last letters move left - right
            timeline.add({
                targets: letter_elements[0].object3D.position,
                x: original_pos[0].x - position_offset
            })
            for (var i = 1; i < letter_elements.length - 1; i++) {
                // alternate top-down
                const yOffset = i % 2 ? position_offset : -position_offset;

                timeline.add({
                    targets: letter_elements[i].object3D.position,
                    y: yOffset
                }, i * time_offset)
            }
            timeline.add({
                targets: letter_elements[letter_elements.length - 1].object3D.position,
                x: original_pos[letter_elements.length - 1].x + position_offset,
                duration: 250
            }, (letter_elements.length - 1) * time_offset)
        })
    }
})