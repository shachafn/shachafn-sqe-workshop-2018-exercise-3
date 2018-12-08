
import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {

        let codeToParse = $('#codePlaceholder').val();
        let syntaxTree = parseCode(codeToParse, true);$('#parsedCode').val(JSON.stringify(syntaxTree, null, 2));

    });
});

