let canvas;
let isDown = false;

window.onload = ev => {
    canvas = document.getElementById('yeet');

    canvas.addEventListener('mousedown', canvasDown, true);

    document.addEventListener('mouseup', canvasUp, true);

    document.addEventListener('mousemove', canvasMove, true);
}

function canvasDown(event) {
    isDown = true;
}

function canvasUp() {
    isDown = false;
}

function canvasMove(event) {
    if (isDown) {
        canvas.x = (event.clientY - 250) + 'px';
        canvas.y = (event.clientX - 750) + 'px';
        console.log(canvas);
    }
}


function parseEditor() {
    let editor = document.getElementById("editor");
    let lines = editor.value.toLowerCase().split('\n');
    let classes = [];
    let connections = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.includes('create table')) {
            let name = line.split(' ')[2];

            i = i + 2;
            let columns = [];
            while (!lines[i].trim().includes(');')) {
                // removes all unused chars, maybe a global thing
                let attribute = lines[i].trim().replace(/ +(?= )/g,'').replace(',', '').split(' ');

                if (attribute[0].includes('foreign')) {
                    let first = attribute[2].substring(1, attribute[2].length - 1);
                    let second = attribute[4];
                    let firstMulti = '0..*';
                    let secondMulti = '1';
                    let composition = false;

                    columns.forEach(column => {
                        if (column.name.includes(first)) {
                            column.stereotype = (column.stereotype.includes('PK')) ? '<<PFK>>' : '<<FK>>';
                            if (column.properties.includes('not null')) {
                                firstMulti = '1..*';
                                composition = true;
                            }
                        }
                    });

                    connections.push(createConnection(first, second, firstMulti, secondMulti, composition));
                    break;
                }

                let name = '';
                let datatype = '';
                let stereotype = '';
                let properties = '';

                for (let j = 0; j < attribute.length; j++) {
                    // datatype
                    if (attribute[j].includes('int')) {
                        datatype = 'int';
                        continue;
                    }
                    if (attribute[j].includes('varchar')) {
                        datatype = 'varchar';
                        continue;
                    }
                    if (attribute[j].includes('float')) {
                        datatype = 'varchar';
                        continue;
                    }
                    if (attribute[j].includes('double')) {
                        datatype = 'varchar';
                        continue;
                    }
                    if (attribute[j].includes('boolean')) {
                        datatype = 'bool';
                        continue;
                    }
                    if (attribute[j].includes('blob')) {
                        datatype = 'blob';
                        continue;
                    }
                    if (attribute[j].includes('enum')) {
                        datatype = 'enum';
                        continue;
                    }
                    if (attribute[j].includes('date')) {
                        datatype = 'enum';
                        continue;
                    }
                    if (attribute[j].includes('timestamp')) {
                        datatype = 'enum';
                        continue;
                    }
                    if (attribute[j].includes('serial')) {
                        datatype = 'serial';
                        continue;
                    }

                    // stereotypes
                    if (attribute[j].includes('primary')) {
                        stereotype = "<<PK>>"
                        attribute.splice((j + 1), 1);
                        continue;
                    }

                    // properties
                    if (attribute[j].includes('not')) {
                        attribute.splice((j + 1), 1)
                        properties += 'not null ';
                        continue;
                    }
                    if (attribute[j].includes('auto_increment')) {
                        properties += 'auto ';
                        continue;
                    }
                    if (attribute[j].includes('default')) {
                        attribute.splice((j + 1), 1)
                        properties += 'default ';
                        continue;
                    }

                    name = attribute[j];
                }

                columns.push(createColumn(name, datatype, stereotype, properties))
                i++;
            }

            classes.push(createClass('<<Table>>', name, columns))
        }
    }
    console.log(classes);
    console.log(connections);
}

function createClass(stereotype, name, columns) {
    return {
        stereotype: stereotype,
        name: name,
        columns: columns
    }
}

function createColumn(name, datatype, stereotype, properties) {
    return {
        name: name,
        datatype: datatype,
        stereotype: stereotype,
        properties: properties
    }
}

function createConnection(first, second, firstMulti, secondMulti, composition) {
    return {
        first: first,
        second: second,
        firstMulti: firstMulti,
        secondMulti: secondMulti,
        composition: composition
    }
}
