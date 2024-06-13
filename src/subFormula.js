export class SubFormula extends HTMLElement {
    constructor(editor) {
        super();
        this.editor = editor;

        this.ondragover = (event) => {
            const children = [...this.children];
            const positions = children.map(x => Math.abs(x.getBoundingClientRect().x - event.clientX));
            if (children.length > 0) {
                positions.push(Math.abs(children[children.length - 1].getBoundingClientRect().right - event.clientX))
            }
            const index = positions.indexOf(Math.min(...positions));
            // console.log({t: event.target, index, positions})
            let placeholder = this.editor.querySelector('.placeholder')
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.classList.add('placeholder');
                placeholder.ondra
            }
            const children2 = [...this.children];
            if (children2[index] != placeholder && children2[index - 1] != placeholder) {
                this.insertBefore(placeholder, children2[index]);
                console.log('dddd', index, children2.length)
            }
            event.preventDefault();
            event.stopPropagation()
        }
        this.ondragleave = (event) => {
            let x = event.relatedTarget;
            while (x) {
                if (x == this) {
                    return;
                }
                x = x.parentElement;
            }
            if (this.editor.querySelector('.placeholder')) {
                this.editor.querySelector('.placeholder').remove();
            }
        }
        this.ondrop = (event) => {
            event.preventDefault();
            event.stopPropagation()
            if (event.dataTransfer.getData("operation")) {
                const operation = this.editor.operations.find(operation => operation.code === event.dataTransfer.getData("operation"));
                const newOperation = document.createElement('div');
                if (operation.code === 'group') {
                    newOperation.append('(')
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.append(')')
                    newOperation.classList.add('group')
                } else if (operation.code === 'divide') {
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.classList.add('divide')
                } else {
                    newOperation.append(operation.symbol);
                }
                newOperation.classList.add('operation');
                newOperation.dataset.code = operation.code;
                this.querySelector('.placeholder').replaceWith(newOperation);
            }
            if (event.dataTransfer.getData("node")) {
                const code = event.dataTransfer.getData("node");
                const node = this.editor.nodes.find(node => node.code === code);
                const newNode = document.createElement('div');
                newNode.append(node.name);
                newNode.classList.add('node');
                newNode.dataset.code = node.code;
                this.querySelector('.placeholder').replaceWith(newNode);
            }
            this.dispatchEvent(new CustomEvent('change', {bubbles: true}))
        }
    }

    get value() {
        return [...this.children].map(x => {
            if (x.classList.contains('operation')) {
                if (x.classList.contains('group')) {
                    return {type: 'operation', code: x.dataset.code, content: x.querySelector('sub-formula').value}
                } else if (x.classList.contains('divide')) {
                    return {
                        type: 'operation',
                        code: x.dataset.code,
                        nominator: x.querySelector('sub-formula:first-of-type').value,
                        denominator: x.querySelector('sub-formula:first-of-type').value
                    }
                } else {
                    return {type: 'operation', code: x.dataset.code}
                }
            }
            if (x.classList.contains('node')) {
                return {type: 'node', code: x.dataset.code}
            }
        })
    }
    set value(value) {
        while(this.firstChild) {
            this.firstChild.remove()
        }
        for (const x of value) {
            if(x.type==='operation') {
                const operation = this.editor.operations.find(operation => operation.code === x.code);
                const newOperation = document.createElement('div');
                if (operation.code === 'group') {
                    newOperation.append('(')
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.append(')')
                    newOperation.classList.add('group')
                } else if (operation.code === 'divide') {
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.append(new SubFormula(this.editor))
                    newOperation.classList.add('divide')
                } else {
                    newOperation.append(operation.symbol);
                }
                newOperation.classList.add('operation');
                newOperation.dataset.code = operation.code;
                this.append(newOperation);
            }else if (x.type==='node') {
                const node = this.editor.nodes.find(node => node.code === x.code);
                const newNode = document.createElement('div');
                newNode.append(node.name);
                newNode.classList.add('node');
                newNode.dataset.code = node.code;
                this.append(newNode);
            }
        }
    }
}

customElements.define('sub-formula', SubFormula)
