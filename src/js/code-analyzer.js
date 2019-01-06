import * as esp from 'esprima';

const VariableDeclaration = 'VariableDeclaration';
const FunctionDeclaration = 'FunctionDeclaration';
const BlockStatement = 'BlockStatement';
const ExpressionStatement = 'ExpressionStatement';
const IfStatement = 'IfStatement';
const ReturnStatement = 'ReturnStatement';
const WhileStatement = 'WhileStatement';
const AssignmentExpression = 'AssignmentExpression';
const UpdateExpression = 'UpdateExpression';
const BinaryExpression = 'BinaryExpression';
const Identifier = 'Identifier';
const UnaryExpression = 'UnaryExpression';

export {createNodes};
let nodeIndex = 1;
let statementToNodeMap;
function createNodes(esprimaParsedCode) {
    let appNodes = [];
    statementToNodeMap = new Map();
    esprimaParsedCode.body[0].body.body.forEach(function (esprimaStatement) {
        createNodeFromStatement(esprimaStatement, appNodes);
    });
    return appNodes;
}
export {createNodeFromStatement};
function createNodeFromStatement(esprimaStatement, appNodes) {

    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(IfStatement , createNodeFromIfStatement) ;
    typeToHandlerMapping.set(WhileStatement , createNodeFromWhileStatement) ;

    let func = typeToHandlerMapping.get(esprimaStatement.type);
    if (!(func != null )) {
        createNodeFromSimpleStatement(esprimaStatement, appNodes);
        return;
    }
    func.call(this, esprimaStatement, appNodes);

}
function createNodeFromSimpleStatement(esprimaStatement, nodes) {
    let shape = 'rectangle';
    let originalStatement = esco.generate(esprimaStatement);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
}
function createNodeFromIfStatement(esprimaStatement, nodes) {
    let shape = 'diamond';
    let originalStatement = esco.generate(esprimaStatement.test);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
    esprimaStatement.consequent.body.forEach(function (innerEsprimaStatement) {
        createNodeFromStatement(innerEsprimaStatement, nodes);
    });
    if (esprimaStatement.alternate !== null)
        createNodesFromAlternate(esprimaStatement.alternate, nodes);


}

function createNodesFromAlternate(esprimaStatement, nodes) {
    if (esprimaStatement.type === IfStatement){
        createNodeFromIfStatement(esprimaStatement, nodes);
    }
    else { //body
        esprimaStatement.body.forEach(function (innerEsprimaStatement) {
            createNodeFromStatement(innerEsprimaStatement, nodes);
        });
    }

}
function createNodeFromWhileStatement(esprimaStatement, nodes) {
    let shape = 'diamond';
    let originalStatement = esco.generate(esprimaStatement.test);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
    esprimaStatement.body.body.forEach(function (innerEsprimaStatement) {
        createNodeFromStatement(innerEsprimaStatement, nodes);
    });
}

import * as esco from 'escodegen';
export {createEdges};
function createEdges(esprimaParsedCode) {
    let edges = [];
    let stmts = esprimaParsedCode.body[0].body.body;
    stmts.forEach(function (esprimaStatement, index) {
        let prevStatement = index > 0 ? stmts[index-1] : null;
        let nextStatement = index < stmts.length - 1 ? stmts[index+1] : null;
        createEdgesFromStatement(esprimaStatement, prevStatement, nextStatement, edges);
    });
    return edges;
}
function createEdgesFromStatement(esprimaStatement, prevStatement, nextStatement, edges) {

    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(IfStatement , createEdgeFromIfStatement) ;
    typeToHandlerMapping.set(WhileStatement , createEdgeFromWhileStatement) ;

    let func = typeToHandlerMapping.get(esprimaStatement.type);
    if (!(func != null )) {
        createEdgeFromSimpleStatement(esprimaStatement, prevStatement, edges);
        return;
    }
    func.call(this, esprimaStatement, prevStatement, nextStatement, edges);

}
export {getNodeIndexFromStatement};
function getNodeIndexFromStatement(esprimaStatement) {
    return statementToNodeMap.get(esco.generate(
        esprimaStatement.type === IfStatement || esprimaStatement.type === WhileStatement ?
            esprimaStatement.test : esprimaStatement));
}
function createEdgeFromSimpleStatement(esprimaStatement, prevStatement, edges) {
    if (prevStatement == null)
        return;
    createEdgeToCurrent(esprimaStatement, prevStatement, edges);
}

function createEdgeToCurrent(esprimaStatement, prevStatement, edges) {
    if (prevStatement.type !== IfStatement && prevStatement.type !== WhileStatement) {
        let from = getNodeIndexFromStatement(prevStatement);
        let to = getNodeIndexFromStatement(esprimaStatement);
        let edge = `n${from} -> n${to};`;
        edges.push(edge);
    }
}

function createEdgeFromIfStatement(esprimaStatement, prevStatement, afterIfStatement, edges) {
    createEdgeToCurrent(esprimaStatement, prevStatement, edges);
    let lastInnerEsprimaStatement = null;
    let from = getNodeIndexFromStatement(esprimaStatement);
    let to = getNodeIndexFromStatement(esprimaStatement.consequent.body[0]);
    let edgeTrue = `n${from} -> n${to} [label="T"];`; edges.push(edgeTrue);
    esprimaStatement.consequent.body.forEach(function (innerEsprimaStatement) {
        createEdgesFromStatement(innerEsprimaStatement, esprimaStatement, afterIfStatement, edges);
        lastInnerEsprimaStatement = innerEsprimaStatement;
    });
    from = getNodeIndexFromStatement(lastInnerEsprimaStatement);
    to = getNodeIndexFromStatement(afterIfStatement);
    let endEdge = `n${from} -> n${to};`;   edges.push(endEdge);

    if (esprimaStatement.alternate !== null)
        createEdgeFromAlternate(esprimaStatement.alternate, esprimaStatement, afterIfStatement, edges);
}

function createEdgeFromAlternate(esprimaStatement, prevStatement, afterIfStatement, edges) {
    if (esprimaStatement.type === IfStatement){
        let from = getNodeIndexFromStatement(prevStatement);   let to = getNodeIndexFromStatement(esprimaStatement);
        let edgeFalse = `n${from} -> n${to} [label="F"];`;    edges.push(edgeFalse);
        createEdgeFromIfStatement(esprimaStatement, prevStatement, afterIfStatement, edges);
    }
    else { //body
        let from = getNodeIndexFromStatement(prevStatement); let to = getNodeIndexFromStatement(esprimaStatement.body[0]);
        let edgeFalse = `n${from} -> n${to} [label="F"];`;   edges.push(edgeFalse);
        let lastInnerEsprimaStatement = null;
        esprimaStatement.body.forEach(function (innerEsprimaStatement) {
            createEdgesFromStatement(innerEsprimaStatement, prevStatement, afterIfStatement, edges);
            lastInnerEsprimaStatement = innerEsprimaStatement;
        });
        from = getNodeIndexFromStatement(lastInnerEsprimaStatement); to = getNodeIndexFromStatement(afterIfStatement);
        let endEdge = `n${from} -> n${to};`;    edges.push(endEdge);
    }

}
function createEdgeFromWhileStatement(esprimaStatement, prevStatement, afterWhileStatement, edges) {
    createEdgeToCurrent(esprimaStatement, prevStatement, edges);

    let lastInnerEsprimaStatement = esprimaStatement;
    let from = getNodeIndexFromStatement(esprimaStatement);
    let to = getNodeIndexFromStatement(esprimaStatement.body.body[0]);
    let edgeTrue = `n${from} -> n${to} [label="T"];`;
    edges.push(edgeTrue);
    esprimaStatement.body.body.forEach(function (innerEsprimaStatement) {
        createEdgesFromStatement(innerEsprimaStatement, lastInnerEsprimaStatement, afterWhileStatement, edges);
        lastInnerEsprimaStatement = innerEsprimaStatement;
    });
    from = getNodeIndexFromStatement(lastInnerEsprimaStatement); to = getNodeIndexFromStatement(esprimaStatement);
    let endEdge = `n${from} -> n${to};`;             edges.push(endEdge);

    from = getNodeIndexFromStatement(esprimaStatement); to = getNodeIndexFromStatement(afterWhileStatement);
    let edgeFalse = `n${from} -> n${to} [label="F"];`; edges.push(edgeFalse);

}
export {getRoutes};
function getRoutes (codeInput) {
    let code = esp.parseScript(codeInput, {loc:true});
    parseFirstLayer(code,new Map());
    return code;
}

function parseFirstLayer(code, environment) {
    code.body.forEach(function(firstLayerStatement) {
        parseFirstLayerDispatcher(firstLayerStatement, environment);
    });

}

function parseFirstLayerDispatcher(firstLayerStatement, environment) {
    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(VariableDeclaration , parseVariableDeclaration) ;
    typeToHandlerMapping.set(ExpressionStatement , parseExpressionStatement) ;//Wrapper type for assignment
    typeToHandlerMapping.set(AssignmentExpression, parseAssignmentExpression);
    typeToHandlerMapping.set(FunctionDeclaration , parseFunctionDeclaration) ;

    let func = typeToHandlerMapping.get(firstLayerStatement.type);
    if (!(func != null )) {
        return;
    }
    func.call(this, firstLayerStatement, environment);
}

/**
 * Wrapper for VariableDeclarator
 */
function parseVariableDeclaration(firstLayerStatement, environment) {
    firstLayerStatement.declarations.forEach(function (declaration) {
        parseVariableDeclarator(declaration, environment);
    });
}

function parseVariableDeclarator(firstLayerStatement, environment) {
    if (firstLayerStatement.init.type === (Identifier))
    {
        if (environment.has(firstLayerStatement.init.name))
        {
            firstLayerStatement.init = environment.get(firstLayerStatement.init.name);
        }
    }
    sub(firstLayerStatement.init,environment);
    let value = firstLayerStatement.init;
    environment.set(firstLayerStatement.id.name,value);
}

/**
 * Wrapper for assignment, update
 */
function parseExpressionStatement(firstLayerStatement, environment) {
    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(AssignmentExpression , parseAssignmentExpression) ;
    typeToHandlerMapping.set(UpdateExpression , parseUpdateExpression) ;

    let func = typeToHandlerMapping.get(firstLayerStatement.expression.type);
    if (!(func != null )) {
        return;
    }
    func.call(this, firstLayerStatement.expression, environment);
}

function parseUpdateExpression(statement, environment) {
    if (statement.argument.type === (Identifier))
    {
        if (environment.has(statement.argument.name))
        {
            statement.argument = environment.get(statement.argument.name);
        }
    }
    let value = statement.argument;
    environment.set(statement.argument.name,value);
}
function parseAssignmentExpression(statement, environment) {

    if (statement.right.type === (Identifier))
    {
        if (environment.has(statement.right.name))
        {
            statement.right = environment.get(statement.right.name);
        }
    }
    sub(statement.right,environment);
    let value = statement.right;
    environment.set(statement.left.name,value);
}
function parseFunctionDeclaration(firstLayerStatement, environment) {
    //firstLayerStatement.params.forEach(function (param) {
    //    environment.set(param,null);
    //});
    parseSecondLayer(firstLayerStatement, environment);
}


function parseSecondLayer(func, environment) {
    let functionBody = func.body;
    functionBody.body.forEach(function(secondLayerStatement) {
        parseSecondLayerStatementDispatcher(secondLayerStatement, environment);
    });
}

function parseSecondLayerStatementDispatcher(secondLayerStatement, environment) {
    let typeToHandler = [];
    typeToHandler[VariableDeclaration] = parseVariableDeclaration;
    typeToHandler[ExpressionStatement] = parseExpressionStatement; //Wrapper type for assignment
    typeToHandler[WhileStatement] = parseWhileStatement;
    typeToHandler[IfStatement] = parseIfOrElseStatementDispatcher;
    typeToHandler[ReturnStatement] = parseReturnStatement;
    typeToHandler[AssignmentExpression] = parseAssignmentExpression;
    typeToHandler[BlockStatement] = parseBlockStatement;

    let func = typeToHandler [secondLayerStatement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, secondLayerStatement, environment);
}

function parseWhileStatement(statement, environment) {
    sub(statement.test,environment);
    let whileBody = statement.body;
    whileBody.body.forEach(function (innerStatement) {
        parseSecondLayerStatementDispatcher(innerStatement,environment);
    });
}

/**
 * There is no such thing as ElseStatement, it is the alternate of an IfStatement, as a BlockStatement
 */
function parseIfOrElseStatementDispatcher(statement, environment) {
    sub(statement.test, environment);
    let newEnvironment1 = new Map();
    environment.forEach(function (value, key) {
        newEnvironment1.set(key,value);
    });
    parseSecondLayerStatementDispatcher(statement.consequent, newEnvironment1);

    if (statement.alternate !== null)
    {
        let newEnvironment2 = new Map();
        environment.forEach(function (value, key) {
            newEnvironment2.set(key,value);
        });
        parseSecondLayerStatementDispatcher(statement.alternate,newEnvironment2);
    }
}

function parseBlockStatement(statement, environment) {
    statement.body.forEach(function (exp) {
        parseSecondLayerStatementDispatcher(exp,environment);
    });
}

function parseReturnStatement(statement, environment) {
    if (statement.argument.type === (Identifier))
    {
        if (environment.has(statement.argument.name))
        {
            statement.argument = environment.get(statement.argument.name);
        }
    }
    sub(statement.argument,environment);
}

function sub(statement, environment) {
    let typeToHandler = [];
    typeToHandler[BinaryExpression  ]   = subBinary;
    typeToHandler['MemberExpression']   = subMember; //Wrapper type for assignment
    typeToHandler[UnaryExpression   ]   = subUnary ;
    typeToHandler[UpdateExpression   ]   = subUpdate ;

    let func = typeToHandler [statement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, statement, environment);
}

function subBinary(statement, environment) {
    if (statement.left.type === (Identifier))
    {
        if (environment.has(statement.left.name))
        {
            statement.left = environment.get(statement.left.name);
        }
    }
    if (statement.right.type === (Identifier))
    {
        if (environment.has(statement.right.name))
        {
            statement.right = environment.get(statement.right.name);
        }
    }
    sub(statement.right,environment);
    sub(statement.left,environment);
}
function subMember(statement, environment) {
    if (statement.property.type === (Identifier))
    {
        if (environment.has(statement.property.name))
        {
            statement.property = environment.get(statement.property.name);
        }
    }
    sub(statement.property,environment);
}
function subUnary(statement, environment) {
    if (statement.argument.type === (Identifier))
    {
        if (environment.has(statement.argument.name))
        {
            statement.argument = environment.get(statement.argument.name);
        }
    }
    sub(statement.argument,environment);
}
function subUpdate(statement, environment) {
    if (statement.argument.type === (Identifier))
    {
        if (environment.has(statement.argument.name))
        {
            statement.argument = environment.get(statement.argument.name);
        }
    }
    sub(statement.argument,environment);
}


export {subUnary, subMember,
    subBinary, sub, parseReturnStatement, parseBlockStatement, parseIfOrElseStatementDispatcher,
    parseWhileStatement, parseSecondLayerStatementDispatcher, parseFunctionDeclaration, parseSecondLayer,
    parseExpressionStatement, parseVariableDeclaration, parseFirstLayerDispatcher, parseFirstLayer};

//////////////////////////
/*
1. Analyze the whole program, generate a collection of objects who are:
    a. A collection of inits/assignments
    b. An IfElse collection
2. Input will also be a collection as (a)
3. Recursive function which receives a list of these objects, and a environment, while parsing also write.
 */