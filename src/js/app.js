import * as esco from 'escodegen';
import * as esp from 'esprima';
import $ from 'jquery';
import {Parser} from 'expr-eval';

const BlockStatement = 'BlockStatement';
const IfStatement = 'IfStatement';
const WhileStatement = 'WhileStatement';

let nodes;
let edges;
export {nodes,edges};
let greenStatementsIndexes;
let redStatementsIndexes;


function color(substitutedCode, initializationsInput) {
    greenStatementsIndexes = [];
    redStatementsIndexes = [];
    let environment = getEnvironment(initializationsInput, substitutedCode);
    substitutedCode.body[0].body.body.forEach(function (func) {
        parseSecondLayerStatementDispatcher(func,environment);
    });
    replaceWithColor();
}
function replaceWithColor() {
    greenStatementsIndexes.forEach(function (index) {
        let myNode = nodes.filter(node => node.includes(`n${index-1}`))[0];
        let cut = myNode.substr(0,myNode.length-2);
        let filled = cut.concat(', style = filled, fillcolor = green];');
        var deleteIndex = greenStatementsIndexes.indexOf(myNode);
        greenStatementsIndexes.splice(deleteIndex, 1);
        nodes.push(filled);
    });
}

function getEnvironment(initializationsInput, substitutedCode){
    let environment = new Map();
    if (initializationsInput !== '')
    {
        let values = initializationsInput.split(',');
        let esprimaParams = substitutedCode.body[0].params;
        esprimaParams.forEach(function (esprimaParam) {
            environment.set(esprimaParam.name,{type: 'Literal',raw: '1', value: Number(values[0])});
            values.shift();
        });
    }
    // Deep copy
    return environment;
}

import {createNodes, createEdges, getRoutes} from './code-analyzer';

import viz from 'viz.js';
import {Module, render} from 'viz.js/full.render';
$(document).ready(function () {
    $('#convert-button').click(() => {
        nodes = [];        edges = [];
        let codeToParse = $('#codePlaceHolder').val();
        let initsInput = $('#initializationsPlaceholder').val();

        let esprimaParsedCode = esp.parse(codeToParse, {loc:true});
        createNodes(esprimaParsedCode);
        createEdges(esprimaParsedCode);
        let substitutedCode = getRoutes(codeToParse);
        color(substitutedCode, initsInput);
        let nodesString = nodes.join('\n');
        let nodesAndEdges = nodesString.concat(edges.join('\n'))
        let formatted = `digraph cfg { forcelabels=true\n ${nodesAndEdges} }`;
        let vz = new viz({Module, render});
        vz.renderSVGElement(formatted)
            .then(function (element) {
                document.getElementById('svg-draw').innerHTML = '';
                document.getElementById('svg-draw').append(element);
            });
    });
});

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
        let generated = esco.generate(value)
        map[key] = JSON.parse(generated);
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
        greenStatementsIndexes.push(statement.loc.start.line-1);

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


function parseNextIf(statement, environment, cumulativeIsTrue) {
    let t = colorStatement(statement,environment);
    if (statement.alternate.type !== IfStatement)
    {
        if (!t && !cumulativeIsTrue)
            greenStatementsIndexes.push(statement.alternate.loc.start.line-1);
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

