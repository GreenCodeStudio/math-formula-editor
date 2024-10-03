export class SyntaxTreeParser {
    constructor(nodes) {
        this.nodes = nodes;
        this.position = 0

    }

    /*
    exit levels:
    0 - equation
    1 - equals
    2-add/sub
    3 - multiply/divide
     */
    static parse(nodes) {
        return new SyntaxTreeParser(nodes).parse()
    }

    static tryParse(nodes) {
        try {
            return SyntaxTreeParser.parse(nodes)
        } catch (e) {
            return null
        }
    }

    parse(exitLevel = 0) {
        console.log('parse', exitLevel)
        let lastNode = null
        for (; this.position < this.nodes.length;) {
            const node = this.nodes[this.position]
            if (node.type == 'operation') {
                if (node.code == 'add') {
                    if (exitLevel >= 2)
                        return lastNode
                    this.position++
                    if (lastNode == null)
                        throw new Error('no left')
                    lastNode = {type: 'operation', code: 'add', left: lastNode, right: this.parse(2)}
                    if (lastNode.right == null)
                        throw new Error('no right')
                } else if (node.code == 'subtract') {
                    if (exitLevel >= 2)
                        return lastNode
                    this.position++
                    lastNode = {
                        type: 'operation',
                        code: lastNode ? 'subtract' : 'negative',
                        left: lastNode,
                        right: this.parse(2)
                    }
                    if (lastNode.right == null)
                        throw new Error('no right')
                } else if (node.code == 'multiply') {
                    if (exitLevel >= 3)
                        return lastNode
                    this.position++
                    if (lastNode == null)
                        throw new Error('no left')
                    lastNode = {type: 'operation', code: 'multiply', left: lastNode, right: this.parse(3)}
                    if (lastNode.right == null)
                        throw new Error('no right')
                } else if (node.code == 'divide') {

                    if (lastNode)
                        throw new Error('error')
                    else {
                        lastNode = {
                            type: 'operation',
                            code: 'divide',
                            left: SyntaxTreeParser.parse(node.nominator),
                            right: SyntaxTreeParser.parse(node.denominator)
                        }
                        if (lastNode.right == null)
                            throw new Error('no right')
                        if (lastNode.left == null)
                            throw new Error('no left')
                        this.position++
                    }
                } else if (node.code == 'group') {
                    if (lastNode)
                        throw new Error('error')
                    else {
                        lastNode = SyntaxTreeParser.parse(node.content)
                        this.position++
                    }
                }else if (node.code == 'abs') {
                    if (lastNode)
                        throw new Error('error')
                    else {
                        lastNode = SyntaxTreeParser.parse(node.content)
                        this.position++
                    }
                }else{
                    throw new Error('error')
                }
            } else {
                if (lastNode)
                    throw new Error('error')
                else {
                    lastNode = node
                    this.position++
                }
            }
        }
        return lastNode
    }

}
