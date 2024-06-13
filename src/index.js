import layout from "!!mpts-loader!./layout.mpts";
import "!!style-loader!css-loader!sass-loader!./style.scss";
import {SubFormula} from "./subFormula.js";

export class MathFormulaEditor extends HTMLElement {
    nodes = [];
    availableOperations = [];

    constructor({nodes, availableOperations}) {
        super();
        this.nodes = nodes ?? [];
        this.availableOperations = availableOperations ?? [];
        this.render();
    }

    get operations() {
        const all = [
            {
                code: 'add',
                name: 'Add',
                symbol: '+'
            },
            {
                code: 'substract',
                name: 'Substract',
                symbol: '-'
            },
            {
                code: 'multiply',
                name: 'Multiply',
                symbol: '*'
            },
            {
                code: 'divide',
                name: 'Divide',
                symbol: '/'
            },
            {
                code: 'group',
                name: 'Group',
                symbol: '()'
            }
        ];
        return all.filter(operation => this.availableOperations.includes(operation.code));
    }

    dump(...args) {
        console.log(...args)
        try {
            return JSON.stringify(args)
        } catch (e) {
            return args;
        }
    }

    render() {
        this.append(layout(this))

        for (const node of this.querySelectorAll('.node')) {
            node.ondragstart = (event) => {
                event.dataTransfer.setData("node", node.dataset.code);
            }
            node.draggable = true;
        }

        for (const operation of this.querySelectorAll('.operation')) {
            operation.ondragstart = (event) => {
                event.dataTransfer.setData("operation", operation.dataset.code);
            }
            operation.draggable = true;
        }

        this.querySelector('.formula').ondragover = (event) => {
            console.log({event})

            while (this.querySelector('.placeholder')) {
                this.querySelector('.placeholder').remove();
            }
            const children = [...this.querySelector('.formula').children];
            const positions = children.map(x => Math.abs(x.getBoundingClientRect().x - event.clientX));
            if (children.length > 0) {
                positions.push(Math.abs(children[children.length - 1].getBoundingClientRect().right - event.clientX))
            }
            const index = positions.indexOf(Math.min(...positions));
            console.log({index, positions})
            const placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            const children2 = [...this.querySelector('.formula').children];
            this.querySelector('.formula').insertBefore(placeholder, children2[index]);
            event.preventDefault();
        }
        this.querySelector('.formula').ondrop = (event) => {
            event.preventDefault();
            if (event.dataTransfer.getData("operation")) {
                const operation = this.operations.find(operation => operation.code === event.dataTransfer.getData("operation"));
                const newOperation = document.createElement('div');
                if (operation.code === 'group') {
                    newOperation.append('(')
                    newOperation.append(new SubFormula())
                    newOperation.append(')')
                } else if (operation.code === 'divide') {
                } else {
                    newOperation.append(operation.symbol);
                }
                newOperation.classList.add('operation');
                this.querySelector('.placeholder').replaceWith(newOperation);
            }
            if (event.dataTransfer.getData("node")) {
                const code = event.dataTransfer.getData("node");
                const node = this.nodes.find(node => node.code === code);
                const newNode = document.createElement('div');
                newNode.append(node.name);
                newNode.classList.add('node');
                this.querySelector('.placeholder').replaceWith(newNode);
            }
        }
    }

}

customElements.define('math-formula-editor', MathFormulaEditor);
