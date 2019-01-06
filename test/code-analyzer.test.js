import assert from 'assert';
import {subUnary,
    subMember, subBinary, sub, parseReturnStatement, parseBlockStatement,
    parseIfOrElseStatementDispatcher, parseWhileStatement, parseSecondLayerStatementDispatcher,
    parseFunctionDeclaration, parseSecondLayer, parseExpressionStatement, parseVariableDeclaration,
    parseFirstLayerDispatcher, parseFirstLayer, getRoutes} from '../src/js/code-analyzer';


describe('Unit Testing - subUnary', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'UnaryExpression','operator':'-','argument':{'type':'Identifier','name':'a'},'prefix':true};
        subUnary(b4, m);
        assert.deepEqual(b4,{'type':'UnaryExpression','operator':'-','argument':1,'prefix':true});
    });
});
describe('Unit Testing - subMember', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'MemberExpression','computed':true,'object':{'type':'Identifier','name':'arr'},'property':{'type':'Identifier','name':'a'}};
        subMember(b4, m);
        assert.deepEqual(b4,{'type':'MemberExpression','computed':true,'object':{'type':'Identifier','name':'arr'},'property':1});
    });
});
describe('Unit Testing - subBinary', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'BinaryExpression','operator':'+','left':{'type':'Identifier','name':'a'},'right':{'type':'Literal','value':2,'raw':'2'}};
        subBinary(b4, m);
        assert.deepEqual(b4,{'type':'BinaryExpression','operator':'+','left':1,'right':{'type':'Literal','value':2,'raw':'2'}});
    });
});
describe('Unit Testing - subBinary', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'BinaryExpression','operator':'+','left':{'type':'Literal','value':2,'raw':'2'},'right':{'type':'Identifier','name':'a'}};
        subBinary(b4, m);
        assert.deepEqual(b4,{'type':'BinaryExpression','operator':'+','left':{'type':'Literal','value':2,'raw':'2'},'right':1});
    });
});
describe('Unit Testing - sub', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {};
        sub(b4, m);
        assert.deepEqual(b4,{});
    });
});
describe('Unit Testing - sub', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'BinaryExpression','operator':'+','left':{'type':'Literal','value':2,'raw':'2'},'right':{'type':'Literal','value':1,'raw':'1'}};
        sub(b4, m);
        assert.deepEqual(b4,{'type':'BinaryExpression','operator':'+','left':{'type':'Literal','value':2,'raw':'2'},'right':{'type':'Literal','value':1,'raw':'1'}});
    });
});
describe('Unit Testing - parseReturnStatement', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'ReturnStatement','argument':{'type':'Identifier','name':'a'}};
        parseReturnStatement(b4, m);
        assert.deepEqual(b4,{'type':'ReturnStatement','argument':1});
    });
});
/*
describe('Unit Testing - parseBlockStatement', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'BlockStatement','body':[{'type':'ola'}]};
        parseBlockStatement(b4, m);
        assert.deepEqual(JSON.stringify(b4),JSON.stringify({'type':'BlockStatement','body':[]}));
    });
});
*/
describe('Unit Testing - parseIfOrElseStatementDispatcher', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'IfStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'consequent':{'type':'BlockStatement','body':[]},'alternate':{'type':'BlockStatement','body':[]}};
        parseIfOrElseStatementDispatcher(b4, m);
        assert.deepEqual(b4,{'type':'IfStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'consequent':{'type':'BlockStatement','body':[]},'alternate':{'type':'BlockStatement','body':[]}});
    });
});
/*
describe('Unit Testing - parseWhileStatement', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'WhileStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'body':{'type':'BlockStatement','body':[]}};
        parseWhileStatement(b4, m);
        assert.deepEqual(b4,{'type':'WhileStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'body':{'type':'BlockStatement','body':[]}});
    });
});
describe('Unit Testing - parseWhileStatement', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'WhileStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'body':{'type':'BlockStatement','body':[{'type':'ola'}]}};
        parseWhileStatement(b4, m);
        assert.deepEqual(b4,{'type':'WhileStatement','test':{'type':'BinaryExpression','operator':'<','left':{'type':'Literal','value':1,'raw':'1'},'right':{'type':'Literal','value':2,'raw':'2'}},'body':{'type':'BlockStatement','body':[]}});
    });
});
*/
describe('Unit Testing - parseSecondLayerStatementDispatcher', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'ola'};
        parseSecondLayerStatementDispatcher(b4, m);
        assert.deepEqual(b4,{'type':'ola'});
    });
});
/*
describe('Unit Testing - parseFunctionDeclaration', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[{'type':'ola'}]},'generator':false,'expression':false,'async':false};
        parseFunctionDeclaration(b4, m);
        assert.deepEqual(b4,{'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[]},'generator':false,'expression':false,'async':false});
    });
});
*/
describe('Unit Testing - parseSecondLayer', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[]},'generator':false,'expression':false,'async':false};
        parseSecondLayer(b4, m);
        assert.deepEqual(b4,{'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[]},'generator':false,'expression':false,'async':false});
    });
});
describe('Unit Testing - parseExpressionStatement', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'ExpressionStatement','expression':{'type':'AssignmentExpression','operator':'=','left':{'type':'Identifier','name':'b'},'right':{'type':'Identifier','name':'a'}}};
        parseExpressionStatement(b4, m);
        assert.deepEqual(b4,{'type':'ExpressionStatement','expression':{'type':'AssignmentExpression','operator':'=','left':{'type':'Identifier','name':'b'},'right':1}});
    });
});
describe('Unit Testing - parseVariableDeclaration', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'VariableDeclaration','declarations':[{'type':'VariableDeclarator','id':{'type':'Identifier','name':'b'},'init':{'type':'Identifier','name':'a'}}],'kind':'let'};
        parseVariableDeclaration(b4, m);
        assert.deepEqual(b4,{'type':'VariableDeclaration','declarations':[{'type':'VariableDeclarator','id':{'type':'Identifier','name':'b'},'init':1}],'kind':'let'});
    });
});
describe('Unit Testing - parseFirstLayerDispatcher', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'ola'};
        parseFirstLayerDispatcher(b4, m);
        assert.deepEqual(b4,{'type':'ola'});
    });
});
describe('Unit Testing - parseFirstLayerDispatcher', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'BlockStatement','body':[]};
        parseFirstLayerDispatcher(b4, m);
        assert.deepEqual(b4,{'type':'BlockStatement','body':[]});
    });
});
describe('Unit Testing - parseFirstLayer', () => {
    it('', () => {
        let m = new Map();
        m.set('a',1);
        let b4 = {'type':'Program','body':[{'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[]},'generator':false,'expression':false,'async':false}],'sourceType':'script'};
        parseFirstLayer(b4, m);
        assert.deepEqual(b4,{'type':'Program','body':[{'type':'FunctionDeclaration','id':{'type':'Identifier','name':'p'},'params':[],'body':{'type':'BlockStatement','body':[]},'generator':false,'expression':false,'async':false}],'sourceType':'script'});
    });
});
describe('Unit Testing - getRoutes', () => {
    it('', () => {
        let b4 = '';
        let res = getRoutes(b4);
        assert.deepEqual({'type':'Program','body':[],'loc':{'end':{'column':0,'line':0},'start':{'column':0,'line':0}},'sourceType':'script'},res);
    });
});