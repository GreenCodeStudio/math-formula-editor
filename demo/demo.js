console.log('aa');
import {MathFormulaEditor} from '../src/index.js';

const nodes = [{code: 'a', name: 'First'}, {code: 'b', name: 'Second'}, {code: 'c', name: 'Third'}]
const availableOperations = ['add', 'substract', 'multiply', 'divide', 'group']
const editor = new MathFormulaEditor({nodes, availableOperations});
document.body.append(editor);
const result = document.createElement('code')
document.body.append(result)
editor.addEventListener('change', (event) => {
    console.log('changed')
    result.innerText = JSON.stringify(editor.value)
});
