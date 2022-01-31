const svgns = "http://www.w3.org/2000/svg";
let classes;
let connections;

function parseEditor() {
    classes = [];
    connections = [];

    let editor = document.getElementById("editor");
    let lines = editor.value.toLowerCase().split("\n");

    for (let i = 0; i < lines.length; i++) {
        let tableName = lines[i];
        tableName.replace('\n', '');

        let columns = [];

        let inEntity = true;
        do {
            i++;

            if (i > lines.length) {
                break;
            }

            let line = lines[i];
            
            if (!line) {
                inEntity
                continue;
            }

            inEntity = line.startsWith(' ');

            columns.push(line.trim());
        } while (inEntity);
        
        classes.push(createClass("<<entity>>", tableName.trim(), columns));
    }
    console.log(classes);
    console.log(connections);
}

function createClass(stereotype, name, columns) {
    return {
        stereotype: stereotype,
        name: name,
        columns: columns,
    };
}

function createConnection(first, second, firstMulti, secondMulti, composition) {
    return {
        first: first,
        second: second,
        firstMulti: firstMulti,
        secondMulti: secondMulti,
        composition: composition,
    };
}

function createPosition(name, x1, y1, x2, y2) {
    return {
        name: name,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    }
}

function drawClasses() {
    parseEditor();

    let svg = document.getElementById("canvas");

    while (svg.lastChild.nodeName !== 'defs') {
        svg.removeChild(svg.lastChild);
    }

    for (let i = 0; i < classes.length; i++) {
        let clazz = classes[i];

        let group = document.createElementNS(svgns, "g");
        let headRect = document.createElementNS(svgns, "rect");
        let headStereotype = document.createElementNS(svgns, "text");
        let headName = document.createElementNS(svgns, "text");
        let bodyRect = document.createElementNS(svgns, "rect");

        group.setAttribute("transform", "translate(0, 0)");
        group.setAttribute("width", "300");
        group.setAttribute("height", 25 * clazz.columns.length + 50);
        group.setAttribute("class", "draggable-group");
        headRect.setAttribute("x", "0");
        headRect.setAttribute("y", "0");
        headRect.setAttribute("width", "300");
        headRect.setAttribute("height", "50");
        headRect.setAttribute("class", "box");
        headStereotype.setAttribute("x", "150");
        headStereotype.setAttribute("y", "15");
        headStereotype.setAttribute("class", "head");
        headName.setAttribute("x", "150");
        headName.setAttribute("y", "35");
        headName.setAttribute("font-weight", "bold");
        headName.setAttribute("class", "head");
        bodyRect.setAttribute("x", "0");
        bodyRect.setAttribute("y", "50");
        bodyRect.setAttribute("width", "300");
        bodyRect.setAttribute("height", 25 * clazz.columns.length);
        bodyRect.setAttribute("class", "box");

        headStereotype.appendChild(document.createTextNode(clazz.stereotype));
        headName.appendChild(document.createTextNode(clazz.name));

        group.appendChild(headRect);
        group.appendChild(headStereotype);
        group.appendChild(headName);
        group.appendChild(bodyRect);

        for (let j = 0; j < clazz.columns.length; j++) {
            let column = clazz.columns[j];

            let bodyColumn = document.createElementNS(svgns, "text");
            bodyColumn.setAttribute("x", "5");
            bodyColumn.setAttribute("y", 70 + 20 * j);
            bodyColumn.appendChild(document.createTextNode(column));

            group.appendChild(bodyColumn);
        }

        svg.appendChild(group);
    }
}

function drawConnections() {
    let svg = document.getElementById('canvas');
    let positions = [];

    svg.childNodes.forEach(child => {
        if (child.nodeName === 'g') {
            let matrix = child.transform.baseVal.consolidate().matrix;

            positions.push(createPosition(
                child.childNodes[2].childNodes[0].nodeValue,
                matrix.e,
                matrix.f,
                matrix.e + 300,
                matrix.f + parseInt(child.getAttribute('height'))
            ));
        }
    });

    while (svg.lastChild.nodeName !== 'g') {
        svg.removeChild(svg.lastChild);
    }

    connections.forEach(connection => {
        positions.forEach(first => {
            if (connection.first === first.name) {
                let line = document.createElementNS(svgns, "line");
                let firstMulti = document.createElementNS(svgns, "text");
                let secondMulti = document.createElementNS(svgns, "text");

                positions.forEach(second => {
                    if (connection.second === second.name) {
                        let offX = first.x1 - second.x1;
                        let offY = first.y1 - second.y1;
                        let firstX;
                        let firstY;
                        let secondX;
                        let secondY;

                        if (offX >= 400) {
                            // left
                            firstX = first.x1;
                            firstY = (first.y1 + first.y2) / 2;
                            secondX = second.x2;
                            secondY = (second.y1 + second.y2) / 2;
                        } else if (offX <= -400) {
                            // right
                            firstX = first.x2;
                            firstY = (first.y1 + first.y2) / 2;
                            secondX = second.x1;
                            secondY = (second.y1 + second.y2) / 2;
                        } else {
                            // center
                            if (offY >= 150) {
                                // top
                                firstX = (first.x1 + first.x2) / 2;
                                firstY = first.y1;
                                secondX = (second.x1 + second.x2) / 2;
                                secondY = second.y2;
                            } else if (offY <= -150) {
                                // bottom
                                firstX = (first.x1 + first.x2) / 2;
                                firstY = first.y2;
                                secondX = (second.x1 + second.x2) / 2;
                                secondY = second.y1;
                            } else {
                                // center
                                firstX = first.x1;
                                firstY = first.y1;
                                secondX = second.x1;
                                secondY = second.y1;
                            }
                        }

                        line.setAttribute("x1", firstX);
                        line.setAttribute("y1", firstY);

                        line.setAttribute('x2', secondX);
                        line.setAttribute('y2', secondY);

                        // association
                        if (connection.composition) {
                            line.setAttribute('marker-end', 'url(#com)')
                        } else {
                            line.setAttribute('marker-end', 'url(#agg)')
                        }

                        // multiplicity
                        if (firstX < secondX) {
                            secondMulti.setAttribute("x", secondX - 20);
                            firstMulti.setAttribute("x", firstX + 20);
                        } else {
                            secondMulti.setAttribute("x", secondX + 20);
                            firstMulti.setAttribute("x", firstX - 20);
                        }

                        if (firstY < secondY) {
                            firstMulti.setAttribute("y", firstY + 20);
                            secondMulti.setAttribute("y", secondY - 40);
                        } else {
                            firstMulti.setAttribute("y", firstY - 20);
                            secondMulti.setAttribute("y", secondY + 30);
                        }
                        firstMulti.appendChild(document.createTextNode(connection.firstMulti));
                        secondMulti.appendChild(document.createTextNode(connection.secondMulti));

                    }
                })

                svg.appendChild(line);
                svg.appendChild(firstMulti);
                svg.appendChild(secondMulti);
            }
        })
    })
}

function makeDraggable(evt) {
    var svg = evt.target;
    svg.addEventListener("mousedown", startDrag);
    svg.addEventListener("mousemove", drag);
    svg.addEventListener("mouseup", endDrag);
    svg.addEventListener("mouseleave", endDrag);

    function getMousePosition(evt) {
        var CTM = svg.getScreenCTM();
        if (evt.touches) {
            evt = evt.touches[0];
        }
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d,
        };
    }

    var selectedElement, offset, transform;

    function initialiseDragging(evt) {
        offset = getMousePosition(evt);
        // Make sure the first transform on the element is a translate transform
        var transforms = selectedElement.transform.baseVal;
        if (
            transforms.length === 0 ||
            transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
        ) {
            // Create an transform that translates by (0, 0)
            var translate = svg.createSVGTransform();
            translate.setTranslate(0, 0);
            selectedElement.transform.baseVal.insertItemBefore(translate, 0);
        }
        // Get initial translation
        transform = transforms.getItem(0);
        offset.x -= transform.matrix.e;
        offset.y -= transform.matrix.f;
    }

    function startDrag(evt) {
        if (evt.target.classList.contains("draggable")) {
            selectedElement = evt.target;
            initialiseDragging(evt);
        } else if (
            evt.target.parentNode.classList.contains("draggable-group")
        ) {
            selectedElement = evt.target.parentNode;
            initialiseDragging(evt);
        }
    }

    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            var coord = getMousePosition(evt);
            transform.setTranslate(Math.ceil((coord.x - offset.x) / 10) * 10, Math.ceil((coord.y - offset.y) / 10) * 10);
        }
    }

    function endDrag() {
        selectedElement = false;
        drawConnections();
    }
}