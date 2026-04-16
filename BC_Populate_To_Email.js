/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget'], function(search, serverWidget) {

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        var rec = context.newRecord;
        var form = context.form;
        var transactionId = rec.getValue({ fieldId: 'transaction' });
        if (!transactionId) return;

        var result = search.create({
            type: 'invoice',
            filters: [
                ['type', 'anyof', 'CustInvc'],
                'AND',
                ['internalid', 'anyof', transactionId],
                'AND',
                ['mainline', 'is', 'T'],
                'AND',
                ['customermain.custentity_bc_contact_emails', 'isnotempty', '']
            ],
            columns: [
                search.createColumn({
                    name: 'custentity_bc_contact_emails',
                    join: 'customerMain'
                })
            ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        if (!result || !result.length) return;

        var emailString = result[0].getValue({
            name: 'custentity_bc_contact_emails',
            join: 'customerMain'
        });

        if (!emailString) return;

        var emailArr = emailString.split(';');
        var added = {};
        var sublistId = 'otherrecipientslist';
        var emailFieldId = 'email';
        var lineCount = rec.getLineCount({ sublistId: sublistId }) || 0;
        var i = 0;
        var email = '';

        for (i = 0; i < lineCount; i++) {
            email = rec.getSublistValue({
                sublistId: sublistId,
                fieldId: emailFieldId,
                line: i
            });

            if (email) {
                added[email.toLowerCase().replace(/^\s+|\s+$/g, '')] = true;
            }
        }

        for (i = 0; i < emailArr.length; i++) {
            email = (emailArr[i] || '').replace(/^\s+|\s+$/g, '');
            if (!email) continue;

            var key = email.toLowerCase();
            if (added[key]) continue;

            rec.insertLine({
                sublistId: sublistId,
                line: lineCount
            });

            rec.setSublistValue({
                sublistId: sublistId,
                fieldId: emailFieldId,
                line: lineCount,
                value: email
            });

            added[key] = true;
            lineCount++;
        }

        var htmlField = form.addField({
            id: 'custpage_to_dom_fix',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'DOM Fix'
        });

        htmlField.defaultValue = ''
            + '<script>'
            + '(function(){'
            + '  function setToCheckbox(){'
            + '    try {'
            + '      var rows = document.querySelectorAll("#otherrecipientslist_splits tr");'
            + '      for (var i = 0; i < rows.length; i++) {'
            + '        var emailCell = rows[i].querySelector(\'td[data-ns-tooltip="Email"]\');'
            + '        var emailText = emailCell ? (emailCell.textContent || "").replace(/\\u00a0/g, "").trim() : "";'
            + '        var toCheckbox = rows[i].querySelector(\'input[name="toRecipients"]\');'
            + '        if (emailText && toCheckbox && !toCheckbox.checked) {'
            + '          toCheckbox.click();'
            + '        }'
            + '      }'
            + '    } catch (e) {}'
            + '  }'
            + '  setTimeout(setToCheckbox, 500);'
            + '  setTimeout(setToCheckbox, 1000);'
            + '  setTimeout(setToCheckbox, 1500);'
            + '})();'
            + '</script>';
    }

    return {
        beforeLoad: beforeLoad
    };
});