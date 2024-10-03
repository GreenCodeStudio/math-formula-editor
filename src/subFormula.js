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
            }
            const children2 = [...this.children];
            if (children2[index] != placeholder && children2[index - 1] != placeholder) {
                this.insertBefore(placeholder, children2[index]);
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
            if (event.dataTransfer.getData("math-formula-editor-element")) {
                const x = JSON.parse(event.dataTransfer.getData("math-formula-editor-element"));
                const newElement = this.createElement(x);
                this.querySelector('.placeholder').replaceWith(newElement);
                if (!event.ctrlKey) {
                    document.getElementById(x.id)?.remove();
                }
            }
            this.editor.classList.remove('dragover');
            this.dispatchEvent(new CustomEvent('change', {bubbles: true}))
        }
    }

    createElement(x) {
        console.log('create', x)
        if (x.type === 'operation') {
            const operation = this.editor.operations.find(operation => operation.code === x.code);
            const newOperation = document.createElement('div');
            if (operation.code === 'group') {
                console.log('ggg')
                newOperation.append('(')
                const content = new SubFormula(this.editor);
                content.value = x.content
                newOperation.append(content)
                newOperation.append(')')
                newOperation.classList.add('group')
            } else if (operation.code === 'divide') {
                console.log('divide')
                const nominator = new SubFormula(this.editor);
                nominator.value = x.nominator
                const denominator = new SubFormula(this.editor);
                denominator.value = x.denominator
                newOperation.append(nominator)
                newOperation.append(denominator)
                newOperation.classList.add('divide')
            }else if(operation.code === 'abs'){
                newOperation.append('abs(')
                const content = new SubFormula(this.editor);
                content.value = x.content
                newOperation.append(content)
                newOperation.append(')')
                newOperation.classList.add('abs')
            }
            else {
                newOperation.append(operation.symbol);
            }
            newOperation.classList.add('operation');
            newOperation.dataset.code = operation.code;
            newOperation.draggable = true;
            newOperation.id = 'operation-' + (+new Date()) + '-' + Math.random().toString().slice(2, 8);
            newOperation.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData("math-formula-editor-element", JSON.stringify(this.serializeElement(newOperation, true)));
                event.stopPropagation()
            });
            return (newOperation);
        } else if (x.type === 'node') {
            const node = this.editor.nodes.find(node => node.code === x.code);
            const newNode = document.createElement('div');
            if (node.code == '__constant') {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = x.value??0;
                input.addEventListener('input', (event) => {
                    this.dispatchEvent(new CustomEvent('change', {bubbles: true}))
                });
                newNode.append(input);
            } else {
                newNode.append(node.name);
            }
            newNode.classList.add('node');
            newNode.dataset.code = node.code;
            newNode.title=node.title??'';
            newNode.draggable = true;
            newNode.id = 'node-' + (+new Date()) + '-' + Math.random().toString().slice(2, 8);
            newNode.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData("math-formula-editor-element", JSON.stringify(this.serializeElement(newNode, true)));
                event.stopPropagation()
            });
            return (newNode);
        }
    }

    serializeElement(x, addId) {
        let ret;
        if (x.classList.contains('operation')) {
            if (x.classList.contains('group')||x.classList.contains('abs')) {
                ret = {type: 'operation', code: x.dataset.code, content: x.querySelector('sub-formula').value}
            } else if (x.classList.contains('divide')) {
                console.log('dddddddd')
                ret = {
                    type: 'operation',
                    code: x.dataset.code,
                    nominator: x.children[0].value,
                    denominator: x.children[1].value
                }
            } else {
                ret = {type: 'operation', code: x.dataset.code}
            }
        }
        if (x.classList.contains('node')) {
            if (x.dataset.code == '__constant') {
                ret = {type: 'node', code: x.dataset.code, value: x.querySelector('input').value}
            } else {
                ret = {type: 'node', code: x.dataset.code}
            }
        }
        if (addId) {
            ret.id = x.id
        }
        return ret
    }

    get value() {
        return [...this.children].map(x => this.serializeElement(x))
    }

    set value(value) {
        value = value ?? [];
        while (this.firstChild) {
            this.firstChild.remove()
        }
        for (const x of value) {
            this.append(this.createElement(x));
        }
    }
}

customElements.define('sub-formula', SubFormula)
