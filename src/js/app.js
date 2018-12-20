import * as esco from 'escodegen';
import * as esp from 'esprima';
import $ from 'jquery';
import {getRoutes, getEnvironment} from './code-analyzer';
import {Parser} from 'expr-eval';

const BlockStatement = 'BlockStatement';
const IfStatement = 'IfStatement';
const WhileStatement = 'WhileStatement';

var result;
var programRows = [];

function writeResult() {
    let resultRows = esco.generate(result).split('\n');
    resultRows.forEach(function (row) {
        let p = document.createElement('P');
        programRows.push(p);
        let text = document.createTextNode(row+'\n');
        p.appendChild(text);
        document.body.appendChild(p);
    });
}

function color(initializationsInput) {
    let environment = getEnvironment(initializationsInput);
    result.body.forEach(function (func) {
        parseSecondLayer(func,environment);
    });
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {

        let codeToParse = $('#codePlaceholder').val();
        let initsInput = $('#initializationsPlaceholder').val();
        result = esp.parse(esco.generate(getRoutes(codeToParse)), {loc:true});
        writeResult();
        color(initsInput);
    });
});



function parseSecondLayer(func, environment) {
    let functionBody = func.body;
    functionBody.body.forEach(function(secondLayerStatement) {
        parseSecondLayerStatementDispatcher(secondLayerStatement, environment);
    });
}

function parseSecondLayerStatementDispatcher(secondLayerStatement, environment) {
    let typeToHandler = [];
    typeToHandler[WhileStatement] = parseWhileStatement;
    typeToHandler[IfStatement] = parseIfOrElseStatementDispatcher;
    typeToHandler[BlockStatement] = parseBlockStatement;

    let func = typeToHandler [secondLayerStatement.type];
    if (!(func != null )) {
        return;
    }
    func.call(this, secondLayerStatement, environment);
}

function getEnvironmentForParser(environment) {
    let map = {};
    environment.forEach(function(value,key) {
        map[key] = JSON.parse(esco.generate(value));
    });
    return map;
}

function colorStatement(statement, environment) {

    let environmentForParser = getEnvironmentForParser(environment);
    let test = statement.test;
    let codeForTest = esco.generate(test);
    let parser = new Parser({operators:{'in': true}});
    let expr = parser.parse(codeForTest);
    let isTrue = expr.evaluate(environmentForParser);
    if (isTrue)
        programRows[statement.loc.start.line-1].style.backgroundColor = '#739931';
    else
        programRows[statement.loc.start.line-1].style.backgroundColor = 'tomato';

    return isTrue;
}
function parseWhileStatement(statement, environment) {
    let whileBody = statement.body;
    whileBody.body.forEach(function (innerStatement) {
        parseSecondLayerStatementDispatcher(innerStatement,environment);
    });
}

/**
 * There is no such thing as ElseStatement, it is the alternate of an IfStatement, as a BlockStatement
 */
function parseIfOrElseStatementDispatcher(statement, environment) {
    cumulativeIf(statement,environment,false);
}

function cumulativeIf(statement, environment, cumulativeIsTrue) {
    parseIfBody(statement.consequent, environment);

    if (statement.alternate !== null)
    {
        parseNextIf(statement,environment,cumulativeIsTrue);
    }
    else
    {
        colorStatement(statement,environment);
    }
}

function parseIfBody(consequent, environment) {
    if (consequent.type === BlockStatement)
    {
        consequent.body.forEach(function (stmt) {
            parseSecondLayerStatementDispatcher(stmt,environment);
        });
    }
    else
        parseSecondLayerStatementDispatcher(consequent,environment);
}

function redraw(statement, environment, cumulativeIsTrue, t) {
    if (cumulativeIsTrue && t)
    {
        programRows[statement.loc.start.line-1].style.backgroundColor = 'tomato';
    }
}

function parseNextIf(statement, environment, cumulativeIsTrue) {
    let t = colorStatement(statement,environment);
    if (statement.alternate.type !== IfStatement)
    {
        if (!t && !cumulativeIsTrue)
            programRows[statement.alternate.loc.start.line-1].style.backgroundColor = '#739931';
        else
        {
            parseSecondLayerStatementDispatcher(statement.alternate,environment);
            programRows[statement.alternate.loc.start.line-1].style.backgroundColor = 'tomato';
        }
        redraw(statement, environment, cumulativeIsTrue,t);
    }
    else
    {
        nextIff(statement, environment, cumulativeIsTrue,t);
    }
}
function nextIff(statement, environment, cumulativeIsTrue, wasTrue) {
    if (statement.alternate.type === IfStatement)
    {
        cumulativeIf(statement.alternate,environment,cumulativeIsTrue || wasTrue);
    }
}

function parseBlockStatement(statement, environment) {
    statement.body.forEach(function (exp) {
        parseSecondLayerStatementDispatcher(exp,environment);
    });
}

