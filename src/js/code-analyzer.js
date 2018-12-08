import * as esp from 'esprima';

import {BlockStatement, ExpressionStatement, IfStatement, ReturnStatement, VariableDeclaration, WhileStatement,
    AssignmentExpression} from './Literals';

const parseCode = (codeToParse, useLocation) => {
    return esp.parseScript(codeToParse, { loc:useLocation });
};


/**
 * Receives an esprima statement, which is loop or initialization or assignment, parses it and updates the variablesMapList accordingly
 * @param parsedStatement The esprima statement to be parsed
 * @param variablesMapList A list of mappings, there is a collection of mappings to simulate different routes in the program (e.g if/else)
 * @param currentMap The Map for the current route.
 */
function parseGeneral(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    let typeToHandlerMapping = [];
    typeToHandlerMapping[VariableDeclaration] = parseVariabledeclaration;
    typeToHandlerMapping[ExpressionStatement] = parseExpressionStatement; //Wrapper type for assignment
    typeToHandlerMapping[WhileStatement] = parseWhileStatement;
    typeToHandlerMapping[IfStatement] = parseIfOrElseStatementDispatcher;
    typeToHandlerMapping[ReturnStatement] = parseReturnStatement;
    typeToHandlerMapping[AssignmentExpression] = parseAssignmentExpression;
    typeToHandlerMapping[BlockStatement] = parseBlockStatement;

    let func = typeToHandlerMapping [parsedStatement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, parsedStatement, variablesMapList, currentMap);
}

/**
 * Wrapper for declarations
 */
function parseVariabledeclaration(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    parsedStatement.declerations.forEach(function(declarator){
        parseVariabledeclarator(declarator,variablesMapList, currentMap);
    });
}
function parseVariabledeclarator(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    let id = parsedStatement.Identifier;
    let val = '';
    if (parsedStatement.init !== null)
        val = parsedStatement.init.toString();
    if (currentMap.has(id))
        currentMap.set(id, currentMap.get(id)+val);
    else
        currentMap.set(id,val);
}

/**
 * Wrapper for assignment expressions
 */
function parseExpressionStatement(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    let typeToHandlerMapping = [];
    typeToHandlerMapping[AssignmentExpression] = parseAssignmentExpression;
    let func = typeToHandlerMapping [parsedStatement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, parsedStatement, variablesMapList, currentMap);
}
function parseWhileStatement(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

}

function parseIfOrElseStatementDispatcher(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    let typeToHandlerMapping = [];
    typeToHandlerMapping [IfStatement] = parseIfStatement;
    typeToHandlerMapping [BlockStatement] = parseBlockStatement;

    let func = typeToHandlerMapping [parsedStatement.type];
    if (func!=null)
        func.call(this, parsedStatement,variablesMapList, currentMap);
    else
        parseGeneral(parsedStatement,variablesMapList, currentMap);
}

function parseIfStatement(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    if (parsedStatement.consequent.type === BlockStatement)  // Parse body
        parsedStatement.consequent.body.forEach(function (exp) {parseGeneral(exp,variablesMapList, currentMap);});
    else
        parseGeneral(parsedStatement.consequent,variablesMapList, currentMap);

    parseIfOrElseStatementDispatcher(parsedStatement.alternate, variablesMapList, new Map(currentMap)); //For new route send a new mapping
}

function parseBlockStatement(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

    parsedStatement.consequent.body.forEach(function (exp) {parseGeneral(exp,variablesMapList, currentMap);});
}

function parseReturnStatement(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

}
function parseAssignmentExpression(parsedStatement, variablesMapList, currentMap) {
    if (parsedStatement == null)
        return;

}




export {parseCode};
