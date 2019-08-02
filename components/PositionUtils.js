import { COMMON_NUMBERS } from '../Constants';

export function positionateObjects (centePosition, objects, gap, coordinateSpace = this, alignment = { x: 0.5, y: 0.5 }) {
    let gaps = [];
    if (Array.isArray(gap)) {
        gaps = gap;
    } else {
        for (let i = 0; i < objects.length - COMMON_NUMBERS.ONE; i++) {
            gaps.push(gap);
        }
    }

    let boundList = [];
    let totalWidth = 0;

    for (let i = 0; i < gaps.length; i++) {
        const gap = gaps[i];
        totalWidth += gap;
    }

    for (let i = 0; i < objects.length; i++) {
        let element = objects[i];
        let localBounds = element.getLocalBounds();
        let bounds = {
            x: localBounds.x,
            y: localBounds.y,
            left: localBounds.left * element.scale.x,
            right: localBounds.right * element.scale.x,
            top: localBounds.top * element.scale.y,
            bottom: localBounds.bottom * element.scale.y,
            width: localBounds.width * element.scale.x,
            height: localBounds.height * element.scale.y
        };
        totalWidth += bounds.width;
        boundList.push(bounds);
    }

    let initialX = centePosition.x - totalWidth * COMMON_NUMBERS.DIV_2;
    let acumulateWidth = 0;
    for (let i = 0; i < objects.length; i++) {
        let element = objects[i];
        let bounds = boundList[i];
        let pos = { x: initialX + acumulateWidth + bounds.width * alignment.x, y: centePosition.y };
        let realPos = this.calculatePositionObject(element, pos, coordinateSpace, alignment);
        element.position = realPos;
        acumulateWidth += bounds.width;
        if (gaps[i]) {
            acumulateWidth += gaps[i];
        }
    }
}

export function calculatePositionObject (obj, position, coordinateSpace = this, alignment = { x: 0.5, y: 0.5 }) {
    let localPoint = new LocalPoint(position.x, position.y, coordinateSpace);
    let alignObj = new AlignedObjectPositionalData(alignment.x, alignment.y);
    let targetPosition = alignObj.findObjectPosition(obj, localPoint);

    return { x: targetPosition.x, y: targetPosition.y };
}

export function getObjectAnchorPos (obj, anchor = { x: 0.5, y: 0.5 }, altPos) {
    let currPos = obj.position;
    if (altPos) {
        currPos = altPos;
    }
    let floraBounds = obj.getLocalBounds();

    let resultPos = {
        x: currPos.x + floraBounds.left * obj.scale.x + floraBounds.width * anchor.x * obj.scale.x,
        y: currPos.y + floraBounds.top * obj.scale.y + floraBounds.height * anchor.y * obj.scale.y
    };

    return resultPos;
}