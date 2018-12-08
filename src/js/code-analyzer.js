import * as esp from 'esprima';

import {Literal, BlockStatement,
    ExpressionStatement, Identifier, IfStatement, ReturnStatement, VariableDeclaration, WhileStatement,
    MemberExpression, BinaryExpression, UnaryExpression, SequenceExpression
    , AssignmentExpression, ForStatement} from './Literals';

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
    typeToHandlerMapping[VariableDeclaration] = parseVariabledeclarationEx2;
    typeToHandlerMapping[ExpressionStatement] = parseExpressionStatementEx2; //Wrapper type for assignment
    typeToHandlerMapping[WhileStatement] = parseWhileStatementEx2;
    typeToHandlerMapping[IfStatement] = parseIfOrElseStatementDispatcherEx2;
    typeToHandlerMapping[ReturnStatement] = parseReturnStatementEx2;
    typeToHandlerMapping[AssignmentExpression] = parseAssignmentExpressionEx2;
    typeToHandlerMapping[BlockStatement] = parseBlockStatementEx2;

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
        parseVariabledeclaratorEx2(declarator,variablesMapList, currentMap);
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
    typeToHandlerMapping[AssignmentExpression] = parseAssignmentExpressionEx2;
    let func = typeToHandlerMapping [parsedStatement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, parsedStatement, variablesMapList, currentMap);
}
function parseWhileStatementEx2(parsedStatement, variablesMapList, currentMap) {
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

    parseIfOrElseStatementDispatcherEx2(parsedStatement.alternate, variablesMapList, new Map(currentMap)); //For new route send a new mapping
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
