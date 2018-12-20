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


function getEnvironment(initializationsInput){
    let environment = new Map();
    if (initializationsInput !== '')
    {
        let parsedInits = esp.parseScript(initializationsInput);
        parsedInits.body.forEach(function(init){
            parseVariableDeclaration(init,environment,null);
        });
    }
    // Deep copy
    return environment;
}
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

export {getRoutes, getEnvironment, remove, checkRem, subUnary, subMember,
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