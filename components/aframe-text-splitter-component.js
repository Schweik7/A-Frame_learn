AFRAME.registerComponent("text-splitter", {
    init: function () {
        const el = this.el;
        const letter_elements = this.letter_elements = []

        // wait until the text component tells us that it's ready
        this.el.addEventListener("object3dset", function objectset(evt) {
            el.removeEventListener("object3dset", objectset); // react only once

            const mesh = el.getObject3D("text") // grab the mesh
            const geometry = mesh.geometry // grab the text geometry

            // wait until the visibleGlyphs are set
            const idx = setInterval(evt => {
                if (!geometry.visibleGlyphs) return;
                clearInterval(idx);

                // we want data.height, data.yoffset and position from each glyph
                const glyphs = geometry.visibleGlyphs

                // do as many loops as there are <entity - glyph> pairs
                const textData = el.getAttribute("text"); // original configuration
                var text = textData.value.replace(/\s+/, "") // get rid of spaces

                const letter_pos = new THREE.Vector3();
                for (var i = 0; i < glyphs.length; i++) {
                    const letter_element = document.createElement("a-entity");

                    // use the positions, heights, and offsets of the glyphs
                    letter_pos.set(glyphs[i].position[0], glyphs[i].position[1], 0);
                    letter_pos.y += (glyphs[i].data.height + glyphs[i].data.yoffset) / 2;

                    // convert the letter local position to world
                    mesh.localToWorld(letter_pos)

                    // convert the world position to the <a-text> position
                    el.object3D.worldToLocal(letter_pos)

                    // apply the text and position to the wrappers
                    const node = document.createElement("a-entity")
                    node.setAttribute("position", letter_pos)

                    node.setAttribute('text', {
                        value: text[i],
                        anchor: textData.align, // a-text binding
                        width: textData.width, // a-text binding
                        color: textData.color // original color
                    })
                    el.appendChild(node)
                    letter_elements.push(node);
                }
                // remove the original text
                el.removeAttribute("text")
                setTimeout(evt => el.emit("text-split", { elements: letter_elements }), 0) // no idea why its not instant
            }, 100)
        })
    }
})