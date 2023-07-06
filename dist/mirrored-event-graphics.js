/**
🪞
@file Mirrored event graphics
@summary A new event field: mirrored (tag).  When present, the event is drawn flipped on the x axis.
@license MIT
@author Violgamba (Jon Heard)
@version 1.0.0

@description
A new event field: mirrored (tag).  When present, the event is drawn flipped on the x axis.

HOW TO USE:
1. Import plugin in bipsi
2. Pick an event you'd like to be drawn mirrored (flipped on the x-axis).
3. Add a new field to the event, "mirrored" type "tag".
4. Run the game and note that the event now shows up mirrored.
*/

drawEventLayer = function(destination, tileset, tileToFrame, palette, events) {
    drawRecolorLayer(destination, (backg, color, tiles) => {
        events.forEach((event) => {
            const [tx, ty] = event.position;
            const graphicField = oneField(event, "graphic", "tile");
            if (graphicField) {
                let { fg, bg } = FIELD(event, "colors", "colors") ?? { bg: 1, fg: 3 };

                const frameIndex = tileToFrame.get(graphicField.data) ?? 0;
                const { x, y, size } = getTileCoords(tileset.canvas, frameIndex);

                if (eventIsTagged(event, "transparent")) {
                    bg = 0;
                }

                if (bg > 0) {
                    backg.fillStyle = palette.colors[bg];
                    backg.fillRect(tx * size, ty * size, size, size);
                }

                if (fg > 0) {
                    color.fillStyle = palette.colors[fg];
                    color.fillRect(tx * size, ty * size, size, size);
                }

                if (FIELD(event, "mirrored", "tag"))
                {
                    tiles.scale(-1,1);
                    tiles.drawImage(
                        tileset.canvas,
                        x, y, size, size,
                        -tx * size, ty * size, -size, size,
                    );
                    tiles.scale(-1,1);
                }
                else
                {
                    tiles.drawImage(
                        tileset.canvas,
                        x, y, size, size,
                        tx * size, ty * size, size, size,
                    );
                }
            }
        });
    });
}
