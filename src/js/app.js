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

function color(substitutedCode, initializationsInput, substitutedToOriginal) {
    greenStatementsIndexes = [];
    let environment = getEnvironment(initializationsInput, substitutedCode);
    substitutedCode.body[0].body.body.forEach(function (func) {
        parseSecondLayerStatementDispatcher(func,environment, true);
    });
    replaceWithColor(substitutedToOriginal);
}
function replaceWithColor(substitutedToOriginal) {
    greenStatementsIndexes.forEach(function (exp) {
        let myNode = nodes.filter(node => {
            let original = substitutedToOriginal.get(exp);
            if (original.type === IfStatement || original.type === WhileStatement) original = original.test;
            let generated = esco.generate(original);
            if (node.includes(generated))
                return true;
            return false;
        })[0];
        let cut = myNode.substr(0,myNode.length-2);
        let filled = cut.concat(', style = filled, fillcolor = green];');
        var deleteIndex = nodes.indexOf(myNode);
        nodes.splice(deleteIndex, 1);
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

function getSubstitutedToOriginal(substitutedCode, esprimaParsedCode) {
    let map = new Map();
    for(let i = 0 ; i < substitutedCode.body[0].body.body.length ; i++) {
        if (substitutedCode.body[0].body.body[i].type === IfStatement) {
            copyIfs(substitutedCode.body[0].body.body[i],esprimaParsedCode.body[0].body.body[i], map);
        }
        else if (substitutedCode.body[0].body.body[i].type === WhileStatement) {
            let body = substitutedCode.body[0].body.body[i].body;
            for(let j = 0 ; j < body.body.length ; j++)
                map.set(body.body[j],esprimaParsedCode.body[0].body.body[i].body.body[j]);
        }
        map.set(substitutedCode.body[0].body.body[i],esprimaParsedCode.body[0].body.body[i]);
    }
    return map;
}
function copyIfs(substitutedCode, esprimaParsedCode, map) {
    for(let j = 0 ; j < substitutedCode.consequent.body.length ; j++)
        map.set(substitutedCode.consequent.body[j],esprimaParsedCode.consequent.body[j]);
    if (substitutedCode.alternate !== null && substitutedCode.alternate.type === 'BlockStatement')
        for(let i = 0 ; i < substitutedCode.alternate.body.length ; i++)
            map.set(substitutedCode.alternate.body[i],esprimaParsedCode.alternate.body[i]);
    if (substitutedCode.alternate !== null && substitutedCode.alternate.type === IfStatement) {
        copyIfs(substitutedCode.alternate,esprimaParsedCode.alternate, map);
        map.set(substitutedCode.alternate,esprimaParsedCode.alternate);
    }
}

$(document).ready(function () {
    $('#convert-button').click(() => {
        nodes = [];        edges = [];
        let codeToParse = $('#codePlaceHolder').val();
        let splitInput = codeToParse.split('\n');
        codeToParse = splitInput.filter(line => line !== '').join('\n');
        let initsInput = $('#initializationsPlaceholder').val();

        let esprimaParsedCode = esp.parse(codeToParse, {loc:true});
        createNodes(esprimaParsedCode);
        createEdges(esprimaParsedCode);
        let substitutedCode = getRoutes(codeToParse);
        let substitutedToOriginal = getSubstitutedToOriginal(substitutedCode, esprimaParsedCode);
        color(substitutedCode, initsInput, substitutedToOriginal);
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
function parseDefault(secondLayerStatement) {
    if (secondLayerStatement.type === BlockStatement)
        secondLayerStatement.body.forEach(function (exp) {
            greenStatementsIndexes.push(exp);
        });
    else
        greenStatementsIndexes.push(secondLayerStatement);
}

function parseSecondLayerStatementDispatcher(secondLayerStatement, environment, isNeedColor) {
    let typeToHandler = [];
    typeToHandler[WhileStatement] = parseWhileStatement;
    typeToHandler[IfStatement] = parseIfOrElseStatementDispatcher;
    typeToHandler[BlockStatement] = parseBlockStatement;

    let func = typeToHandler [secondLayerStatement.type];
    if (!(func != null )) {
        if (isNeedColor) parseDefault(secondLayerStatement);
        return;
    }
    func.call(this, secondLayerStatement, environment);
}

function getEnvironmentForParser(environment) {
    let map = {};
    environment.forEach(function(value,key) {
        let generated = esco.generate(value);
        map[key] = JSON.parse(generated);
    });
    return map;
}


function parseWhileStatement(statement, environment) {
    let environmentForParser = getEnvironmentForParser(environment);
    let test = statement.test;
    let codeForTest = esco.generate(test);
    let parser = new Parser({operators:{'in': true}});
    let expr = parser.parse(codeForTest);
    let isTrue = expr.evaluate(environmentForParser);
    if (isTrue)  {
        parseDefault(statement, environment);
    }
    let whileBody = statement.body;
    whileBody.body.forEach(function (innerStatement) {
        parseSecondLayerStatementDispatcher(innerStatement,environment, true);
    });
}

/**
 * There is no such thing as ElseStatement, it is the alternate of an IfStatement, as a BlockStatement
 */
function parseIfOrElseStatementDispatcher(statement, environment) {
    let environmentForParser = getEnvironmentForParser(environment);
    let test = statement.test;
    let codeForTest = esco.generate(test);
    let parser = new Parser({operators:{'in': true}});
    let expr = parser.parse(codeForTest);
    let isTrue = expr.evaluate(environmentForParser);
    if (isTrue)  {
        parseIfBody(statement.consequent, environment);
    }
    else
        parseNextIf(statement.alternate, environment);
    parseDefault(statement);
}

function parseIfBody(consequent, environment) {
    if (consequent.type === BlockStatement)
    {
        consequent.body.forEach(function (stmt) {
            parseSecondLayerStatementDispatcher(stmt,environment, true);
        });
    }
    else
        parseSecondLayerStatementDispatcher(consequent,environment, true);
}


function parseNextIf(statement, environment) {
    if (statement == null)        return;
    if (statement.type === IfStatement) {
        let environmentForParser = getEnvironmentForParser(environment);
        let test = statement.test;
        let codeForTest = esco.generate(test);
        let parser = new Parser({operators:{'in': true}});
        let expr = parser.parse(codeForTest);
        let isTrue = expr.evaluate(environmentForParser);
        if (isTrue) {
            parseIfBody(statement.consequent, environment);
        }
        else
            parseNextIf(statement.alternate, environment);
        parseDefault(statement);
    }
    else
        parseIfBody(statement, environment);
}

function parseBlockStatement(statement, environment) {
    statement.body.forEach(function (exp) {
        parseSecondLayerStatementDispatcher(exp,environment, true);
    });
}

