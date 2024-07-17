import layout from "!!mpts-loader!./layout.mpts";
import "!!style-loader!css-loader!sass-loader!./style.scss";
import {SubFormula} from "./subFormula.js";
import {t} from "!@green-code-studio/internationalization/i18nWebpackLoader.js!./i18n.xml";
import {LanguagesHierarchy} from "@green-code-studio/internationalization/languagesHierarchy.js";

export class MathFormulaEditor extends HTMLElement {
    nodes = [];
    availableOperations = [];

    constructor({nodes, availableOperations, lang}) {
        super();
        this.nodes = nodes ?? [];
        this.availableOperations = availableOperations ?? [];
        console.log('aaa',t);
        if(lang)
        {
            LanguagesHierarchy.default.langs.unshift(lang);
        }
        this.render();
    }

    get operations() {
        const all = [
            {
                code: 'add',
                name: t('operations.add'),
                symbol: '+'
            },
            {
                code: 'subtract',
                name: t('operations.subtract'),
                symbol: '-'
            },
            {
                code: 'multiply',
                name: t('operations.multiply'),
                symbol: '*'
            },
            {
                code: 'divide',
                name:  t('operations.divide'),
                symbol: '/'
            },
            {
                code: 'group',
                name: t('operations.group'),
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
        this.querySelector('.search').oninput = (event) => {
            const value = event.target.value.toLowerCase();
            for (const node of this.querySelectorAll('.nodes .node')) {
                if (node.dataset.code.toLowerCase().includes(value)||node.textContent.toLowerCase().includes(value)) {
                    node.style.display = 'block';
                } else {
                    node.style.display = 'none';
                }
            }}

        for (const node of this.querySelectorAll('.node')) {
            node.ondragstart = (event) => {
                event.dataTransfer.setData("math-formula-editor-element",
                    JSON.stringify({
                        type: 'node',
                        code: node.dataset.code
                    }));
            }
            node.draggable = true;
        }

        for (const operation of this.querySelectorAll('.operation')) {
            operation.ondragstart = (event) => {
                event.dataTransfer.setData("math-formula-editor-element",
                    JSON.stringify({
                        type: 'operation',
                        code: operation.dataset.code
                    }));
            }
            operation.draggable = true;
        }
        this.querySelector('.formula').append(new SubFormula(this))
        this.querySelector('.dropRemove').ondragover = (event) => {
            event.preventDefault();
        }
        this.querySelector('.dropRemove').ondrop = (event) => {
            event.preventDefault();
            if (event.dataTransfer.getData("math-formula-editor-element")) {
                const x = JSON.parse(event.dataTransfer.getData("math-formula-editor-element"));
                document.getElementById(x.id)?.remove();
            }
        }
        this.addEventListener('dragenter', (event) => {
            this.classList.add('dragover');
        });
        this.addEventListener('dragleave', (event) => {
            console.log(event)
            let x = event.relatedTarget;
            while (x) {
                if (x === this)
                    return;
                x = x.parentNode;
            }
            this.classList.remove('dragover');
        });
        this.addEventListener('drop', (event) => {
            this.classList.remove('dragover');
        });
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
