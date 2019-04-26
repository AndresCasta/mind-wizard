let cellSidesPadding = 10;
// Defines the region in which we are goig to positionate the elements.
let layoutX = 100; // layout origin (tope-left corner)
let layoutY = 100; // layout origin (tope-left corner)
let layoutWidth = 128;
let layoutHeight = 58;

// A box represents an item.
// Define box dimensions.
let cols = 5;
let boxWidth = layoutWidth / cols;
let rows = 2; // the number of rows to fit the boxes
let boxHeight = layoutHeight / rows; // the height of each row.
let contentWidth = boxWidth - cellSidesPadding;

// Where sprites is an array of MindPixiSprite instances.

for (let i = 0; i < sprites.length; i++) {
    let sprite = sprites[i];
    // adjust the sprite scale
    // Adjust critter width to box's content width
    let scaleFactor = contentWidth / sprite.width;
    // Check critter height is not outside of box's content height
    if ((sprite.width * scaleFactor) > contentHeight) {
        scaleFactor = contentHeight / sprite.height;
}

    // The position, this supports multirow positioning inside the layout area.
    let thePosition = {
        x: initX + (i % cols) * boxWidth,
        y: initY + boxHeight * Math.floor(i / cols)
    };

    // Apply the computed scale factor.
    sprite.scale.set(scaleFactor);

    // Apply the computed position.
    sprite.position.x = thePos.x;
    sprite.position.y = thePos.y;

}