import * as esp from 'esprima';

const VariableDeclaration = 'VariableDeclaration';
const FunctionDeclaration = 'FunctionDeclaration';
const BlockStatement = 'BlockStatement';
const ExpressionStatement = 'ExpressionStatement';
const IfStatement = 'IfStatement';
const ReturnStatement = 'ReturnStatement';
const WhileStatement = 'WhileStatement';
const AssignmentExpression = 'AssignmentExpression';
const BinaryExpression = 'BinaryExpression';
const Identifier = 'Identifier';
const UnaryExpression = 'UnaryExpression';

import {nodes} from './app';
export {createNodes};
let nodeIndex = 1;
let conditionsIndexes;
let statementToNodeMap;
function createNodes(esprimaParsedCode) {
    //"n1 [label=\"-1-\n let a = x + 1\", shape=rectangle, style = filled, fillcolor = green];\n",
    conditionsIndexes = [];
    statementToNodeMap = new Map();
    let stmts = esprimaParsedCode.body[0].body.body.forEach(function (esprimaStatement) {
        createNodeFromStatement(esprimaStatement);
    });
}
function createNodeFromStatement(esprimaStatement) {

    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(IfStatement , createNodeFromIfStatement) ;
    typeToHandlerMapping.set(WhileStatement , createNodeFromWhileStatement) ;

    let func = typeToHandlerMapping.get(esprimaStatement.type);
    if (!(func != null )) {
        createNodeFromSimpleStatement(esprimaStatement);
        return;
    }
    func.call(this, esprimaStatement);

}
function createNodeFromSimpleStatement(esprimaStatement) {
    let shape = 'rectangle';
    let originalStatement = esco.generate(esprimaStatement);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
}
function createNodeFromIfStatement(esprimaStatement) {
    let shape = 'diamond';
    let originalStatement = esco.generate(esprimaStatement.test);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
    conditionsIndexes.push(nodeIndex); //Remember for true edge
    esprimaStatement.consequent.body.forEach(function (innerEsprimaStatement) {
        createNodeFromStatement(innerEsprimaStatement);
    });
    if (esprimaStatement.alternate !== null)
        createNodesFromAlternate(esprimaStatement.alternate);

    conditionsIndexes.push(nodeIndex); //Remember for false edge

}

function createNodesFromAlternate(esprimaStatement) {
    if (esprimaStatement.type === IfStatement){
        createNodeFromIfStatement(esprimaStatement);
    }
    else { //body
        conditionsIndexes.push(nodeIndex+1);
        esprimaStatement.body.forEach(function (innerEsprimaStatement) {
            createNodeFromStatement(innerEsprimaStatement);
        });
    }

}
function createNodeFromWhileStatement(esprimaStatement) {
    let shape = 'diamond';
    let originalStatement = esco.generate(esprimaStatement.test);
    let node = `n${nodeIndex} [label="${originalStatement}", shape = ${shape}];`;
    nodes.push(node);
    statementToNodeMap.set(originalStatement,nodeIndex);
    nodeIndex++;
    conditionsIndexes.push(nodeIndex); //Remember for true edge
    esprimaStatement.body.body.forEach(function (innerEsprimaStatement) {
        createNodeFromStatement(innerEsprimaStatement);
    });
    conditionsIndexes.push(nodeIndex); //Remember for false edge
}

import {edges} from './app';
import * as esco from 'escodegen';
export {createEdges};
function createEdges(esprimaParsedCode) {
    let stmts = esprimaParsedCode.body[0].body.body;
    stmts.forEach(function (esprimaStatement, index) {
        let prevStatement = index > 0 ? stmts[index-1] : null;
        let nextStatement = index < stmts.length - 1 ? stmts[index+1] : null;
        createEdgesFromStatement(esprimaStatement, prevStatement, nextStatement);
    });
}
function createEdgesFromStatement(esprimaStatement, prevStatement, nextStatement) {

    let typeToHandlerMapping = new Map();
    typeToHandlerMapping.set(IfStatement , createEdgeFromIfStatement) ;
    typeToHandlerMapping.set(WhileStatement , createEdgeFromWhileStatement) ;

    let func = typeToHandlerMapping.get(esprimaStatement.type);
    if (!(func != null )) {
        createEdgeFromSimpleStatement(esprimaStatement, prevStatement);
        return;
    }
    func.call(this, esprimaStatement, prevStatement, nextStatement);

}
function getNodeIndexFromStatement(esprimaStatement) {
    return statementToNodeMap.get(esco.generate(
        esprimaStatement.type === IfStatement || esprimaStatement.type === WhileStatement ?
            esprimaStatement.test : esprimaStatement));
}
function createEdgeFromSimpleStatement(esprimaStatement, prevStatement) {
    if (prevStatement == null)
        return;
    createEdgeToCurrent(esprimaStatement, prevStatement);
}

function createEdgeToCurrent(esprimaStatement, prevStatement) {
    if (prevStatement.type !== IfStatement && prevStatement !== WhileStatement) {
        let from = getNodeIndexFromStatement(prevStatement);
        let to = getNodeIndexFromStatement(esprimaStatement);
        let edge = `n${from} -> n${to};`;
        edges.push(edge);
    }
}

function createEdgeFromIfStatement(esprimaStatement, prevStatement, afterIfStatement) {
    createEdgeToCurrent(esprimaStatement, prevStatement);
    let lastInnerEsprimaStatement = null;
    let from = getNodeIndexFromStatement(esprimaStatement);
    let to = getNodeIndexFromStatement(esprimaStatement.consequent.body[0]);
    let edgeTrue = `n${from} -> n${to} [label="T"];`; edges.push(edgeTrue);
    esprimaStatement.consequent.body.forEach(function (innerEsprimaStatement) {
        createEdgesFromStatement(innerEsprimaStatement, esprimaStatement, afterIfStatement);
        lastInnerEsprimaStatement = innerEsprimaStatement;
    });
    from = getNodeIndexFromStatement(lastInnerEsprimaStatement);
    to = getNodeIndexFromStatement(afterIfStatement);
    let endEdge = `n${from} -> n${to};`;   edges.push(endEdge);

    if (esprimaStatement.alternate !== null)
        createEdgeFromAlternate(esprimaStatement.alternate, esprimaStatement, afterIfStatement);
}

function createEdgeFromAlternate(esprimaStatement, prevStatement, afterIfStatement) {
    if (esprimaStatement.type === IfStatement){
        let from = getNodeIndexFromStatement(prevStatement)
        let to = getNodeIndexFromStatement(esprimaStatement);
        let edgeFalse = `n${from} -> n${to} [label="F"];`;
        edges.push(edgeFalse);
        createEdgeFromIfStatement(esprimaStatement, prevStatement, afterIfStatement);
    }
    else { //body
        let from = getNodeIndexFromStatement(prevStatement)
        let to = getNodeIndexFromStatement(esprimaStatement.body[0]);
        let edgeFalse = `n${from} -> n${to} [label="F"];`;
        edges.push(edgeFalse);
        let lastInnerEsprimaStatement = null;
        esprimaStatement.body.forEach(function (innerEsprimaStatement) {
            createEdgesFromStatement(innerEsprimaStatement, prevStatement, afterIfStatement);
            lastInnerEsprimaStatement = innerEsprimaStatement;
        });
        from = getNodeIndexFromStatement(lastInnerEsprimaStatement)
        to = getNodeIndexFromStatement(afterIfStatement);
        let endEdge = `n${from} -> n${to};`;
        edges.push(endEdge);
    }

}
function createEdgeFromWhileStatement(esprimaStatement, prevStatement, afterWhileStatement) {
    createEdgeToCurrent(esprimaStatement, prevStatement);

    let lastInnerEsprimaStatement = null;
    let from = getNodeIndexFromStatement(esprimaStatement);
    let to = getNodeIndexFromStatement(esprimaStatement.body.body[0]);
    let edgeTrue = `n${from} -> n${to} [label="T"];`;
    edges.push(edgeTrue);
    esprimaStatement.body.body.forEach(function (innerEsprimaStatement) {
        createEdgesFromStatement(innerEsprimaStatement, prevStatement, afterWhileStatement);
        lastInnerEsprimaStatement = innerEsprimaStatement;
    });
    from = getNodeIndexFromStatement(lastInnerEsprimaStatement);
    to = getNodeIndexFromStatement(esprimaStatement);
    let endEdge = `n${from} -> n${to};`;
    edges.push(endEdge);

    from = getNodeIndexFromStatement(esprimaStatement);
    to = getNodeIndexFromStatement(afterWhileStatement);
    let edgeFalse = `n${from} -> n${to} [label="F"];`;
    edges.push(edgeFalse);

}
export {getRoutes};
function getRoutes (codeInput) {
    let code = esp.parseScript(codeInput, {loc:true});
    parseFirstLayer(code,new Map());
    return code;
}

function parseFirstLayer(code, environment) {
    let toR = [];
    code.body.forEach(function(firstLayerStatement) {
        parseFirstLayerDispatcher(firstLayerStatement, environment);
        checkRem(firstLayerStatement, toR);
    });
    toR.forEach(function(r) {
        remove(r,code.body);
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
 * Wrapper for assignment
 */
function parseExpressionStatement(firstLayerStatement, environment) {
    parseAssignmentExpression(firstLayerStatement.expression, environment);
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
    let toR = [];
    functionBody.body.forEach(function(secondLayerStatement) {
        parseSecondLayerStatementDispatcher(secondLayerStatement, environment);
        checkRem(secondLayerStatement,  toR);
    });
    toR.forEach(function(r) {
        remove(r,functionBody.body);
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
    let toR = [];
    let whileBody = statement.body;
    whileBody.body.forEach(function (innerStatement) {
        parseSecondLayerStatementDispatcher(innerStatement,environment);
        checkRem(innerStatement, toR);
    });
    toR.forEach(function(r) {
        remove(r,whileBody.body);
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
    let toR = [];
    statement.body.forEach(function (exp) {
        parseSecondLayerStatementDispatcher(exp,environment);
        checkRem(exp, toR);
    });
    toR.forEach(function(r) {
        remove(r,statement.body);
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

/////////////////////// util ////////////////////////////
function remove(toRemove, array) {
    let index = array.indexOf(toRemove);
    if (index > -1) {
        array.splice(index, 1);
    }
}

function checkRem(toRemove,keep) {
    if (toRemove.type !== IfStatement && toRemove.type !== ReturnStatement && toRemove.type !== WhileStatement
        && toRemove.type !== FunctionDeclaration)
        keep.push(toRemove);
}

export {remove, checkRem, subUnary, subMember,
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