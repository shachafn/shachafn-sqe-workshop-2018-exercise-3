//import assert from 'assert';

/*
describe('Unit Testing - parseBinaryExpressionDispatcher', () => {
    //Calculations
    it('Literal - \'1\'', () => {testParseBinaryExpression('{"type":"ExpressionStatement","expression":{"type":"Literal","value":1,"raw":"1"}}','1');});
    it('Literal - \'-1\'', () => {testParseBinaryExpression('{"type":"ExpressionStatement","expression":{"type":"Literal","value":1,"raw":"1"}}','1');});
    it('MemberExpression - \'v[2]\'', () => {testParseBinaryExpression('{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"v","loc":{"start":{"line":9,"column":17},"end":{"line":9,"column":18}}},"property":{"type":"Literal","value":2,"raw":"1","loc":{"start":{"line":9,"column":19},"end":{"line":9,"column":20}}},"loc":{"start":{"line":9,"column":17},"end":{"line":9,"column":21}}}','v[2]');});
    it('BinaryExpression between Literals - \'1+2\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"Literal","value":1,"raw":"1"},"right":{"type":"Literal","value":2,"raw":"2"}}','1+2');});
    it('BinaryExpression between MemberExpressions - \'array1[2]+array2[2]\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"array1"},"property":{"type":"Literal","value":2,"raw":"2"}},"right":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"array2"},"property":{"type":"Literal","value":2,"raw":"2"}}}','array1[2]+array2[2]');});
    it('BinaryExpression between MemberExpression and literal - \'array1[2]+5\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"array1"},"property":{"type":"Literal","value":2,"raw":"2"}},"right":{"type":"Literal","value":5,"raw":"5"}}','array1[2]+5');});
    it('BinaryExpression between Identifiers - \'n+m\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"Identifier","name":"n"},"right":{"type":"Identifier","name":"m"}}','n+m');});
    it('Nested BinaryExpression between Identifiers - \'n+m+x\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"BinaryExpression","operator":"+","left":{"type":"Identifier","name":"n"},"right":{"type":"Identifier","name":"m"}},"right":{"type":"Identifier","name":"x"}}','n+m+x');});
    it('Nested BinaryExpression between Identifiers - \'v[2]+a[0]+arr[3]\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"+","left":{"type":"BinaryExpression","operator":"+","left":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"v"},"property":{"type":"Literal","value":2,"raw":"2"}},"right":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"a"},"property":{"type":"Literal","value":0,"raw":"0"}}},"right":{"type":"MemberExpression","computed":true,"object":{"type":"Identifier","name":"arr"},"property":{"type":"Literal","value":3,"raw":"3"}}}','v[2]+a[0]+arr[3]');});
    it('Nested BinaryExpression between Identifiers - \'1+2-3\'', () => {testParseBinaryExpression('{"type":"BinaryExpression","operator":"-","left":{"type":"BinaryExpression","operator":"+","left":{"type":"Literal","value":1,"raw":"1"},"right":{"type":"Literal","value":2,"raw":"2"}},"right":{"type":"Literal","value":3,"raw":"3"}}','1+2-3');});
    let expected12 = [];
    it('- null', () => { let value = [];
        parseBinaryExpressionDispatcher(null, value);  assert.deepEqual(value,expected12);
    });
});
*/