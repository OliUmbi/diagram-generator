let classes;
let connections;

function parseEditor() {
    classes = [];
    connections = [];

    let editor = document.getElementById("editor");
    let lines = editor.value.toLowerCase().split("\n");

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.includes("create table")) {
            let tableName = line.split(" ")[2];

            i = i + 2;
            let columns = [];
            while (!lines[i].trim().includes(");")) {
                // removes all unused chars, maybe a global thing
                let attribute = lines[i]
                    .trim()
                    .replace(/ +(?= )/g, "")
                    .replace(",", "")
                    .split(" ");

                if (attribute[0].includes("foreign")) {
                    let foreign = attribute[2].substring(
                        1,
                        attribute[2].length - 1
                    );
                    let first = tableName;
                    let second = attribute[4];
                    let firstMulti = "0..*";
                    let secondMulti = "1";
                    let composition = false;

                    columns.forEach((column) => {
                        if (column.name.includes(foreign)) {
                            column.stereotype = column.stereotype.includes("PK")
                                ? "<<PFK>>"
                                : "<<FK>>";
                            if (column.properties.includes("not null")) {
                                firstMulti = "1..*";
                                composition = true;
                            }
                        }
                    });

                    connections.push(
                        createConnection(
                            first,
                            second,
                            firstMulti,
                            secondMulti,
                            composition
                        )
                    );
                    break;
                }

                let name = "";
                let datatype = "";
                let stereotype = "";
                let properties = "";

                for (let j = 0; j < attribute.length; j++) {
                    // datatype
                    if (attribute[j].includes("int")) {
                        datatype = "int";
                        continue;
                    }
                    if (attribute[j].includes("varchar")) {
                        datatype = "varchar";
                        continue;
                    }
                    if (attribute[j].includes("float")) {
                        datatype = "varchar";
                        continue;
                    }
                    if (attribute[j].includes("double")) {
                        datatype = "varchar";
                        continue;
                    }
                    if (attribute[j].includes("boolean")) {
                        datatype = "bool";
                        continue;
                    }
                    if (attribute[j].includes("blob")) {
                        datatype = "blob";
                        continue;
                    }
                    if (attribute[j].includes("enum")) {
                        datatype = "enum";
                        continue;
                    }
                    if (attribute[j].includes("date")) {
                        datatype = "enum";
                        continue;
                    }
                    if (attribute[j].includes("timestamp")) {
                        datatype = "enum";
                        continue;
                    }
                    if (attribute[j].includes("serial")) {
                        datatype = "serial";
                        continue;
                    }

                    // stereotypes
                    if (attribute[j].includes("primary")) {
                        stereotype = "<<PK>>";
                        attribute.splice(j + 1, 1);
                        continue;
                    }

                    // properties
                    if (attribute[j].includes("not")) {
                        attribute.splice(j + 1, 1);
                        properties += "not null ";
                        continue;
                    }
                    if (attribute[j].includes("auto_increment")) {
                        properties += "auto ";
                        continue;
                    }
                    if (attribute[j].includes("default")) {
                        attribute.splice(j + 1, 1);
                        properties += "default ";
                        continue;
                    }

                    name = attribute[j];
                }

                columns.push(
                    createColumn(name, datatype, stereotype, properties)
                );
                i++;
            }

            classes.push(createClass("<<Table>>", tableName, columns));
        }
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

function createColumn(name, datatype, stereotype, properties) {
    return {
        name: name,
        datatype: datatype,
        stereotype: stereotype,
        properties: properties,
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

function drawClasses() {
    parseEditor();

    const svgns = "http://www.w3.org/2000/svg";
    let svg = document.getElementById("canvas");

    while (svg.lastChild.nodeName !== 'style') {
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

            let attribute =
                column.stereotype +
                " " +
                column.name +
                ": " +
                column.datatype +
                " {" +
                column.properties +
                "}";

            let bodyColumn = document.createElementNS(svgns, "text");
            bodyColumn.setAttribute("x", "5");
            bodyColumn.setAttribute("y", 70 + 20 * j);
            bodyColumn.appendChild(document.createTextNode(attribute));

            group.appendChild(bodyColumn);
        }

        svg.appendChild(group);
    }
}

function drawConnections() {
    let svg = document.getElementById
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
        console.log(transform);
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
            transform.setTranslate(coord.x - offset.x, coord.y - offset.y);
        }
    }
    function endDrag(evt) {
        selectedElement = false;
    }
}