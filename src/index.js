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
                code: 'subtract',
                name: 'Subtract',
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
        this.querySelector('.formula').append(new SubFormula(this))
    }

    get value() {
        return this.querySelector('.formula > sub-formula').value;
    }
    set value(value) {
        this.querySelector('.formula > sub-formula').value = value;
    }
}

customElements.define('math-formula-editor', MathFormulaEditor);

export {SyntaxTreeParser} from "./syntaxTreeParser.js";
