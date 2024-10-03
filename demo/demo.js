import {SyntaxTreeParser} from "../src/syntaxTreeParser.js";

console.log('aa');
import {MathFormulaEditor} from '../src/index.js';

const nodes = [{code: '__constant', name: 'Liczba stała'},{code: 'a', name: 'First', title:'Jeden'}, {code: 'b', name: 'Second'}, {code: 'c', name: 'Third'}]
const availableOperations = ['add', 'subtract', 'multiply', 'divide', 'group', 'abs']
const editor = new MathFormulaEditor({nodes, availableOperations});
document.body.append(editor);
const result = document.createElement('code')
const textarea = document.createElement('textarea')
textarea.style.width='100%'
document.body.append(result)
document.body.append(textarea)
editor.addEventListener('change', (event) => {
    console.log('changed')
    result.innerText = JSON.stringify(editor.value)
    textarea.value = JSON.stringify(editor.value)
    result.appendChild(document.createElement('hr'))
    try {
        result.append(JSON.stringify(SyntaxTreeParser.parse(editor.value)))
    }catch (e) {
        result.append(e.message)
    }
});
textarea.oninput = (event) => {
    try {
        editor.value = JSON.parse(event.target.value)
    } catch (e) {
        console.error(e)
    }
}
