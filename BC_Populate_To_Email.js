/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search'], function(search) {

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        var rec = context.newRecord;
        log.debug('rec', rec)
        var transactionId = rec.getValue({ fieldId: 'transaction' });
        if (!transactionId) return;

        var emailString = '';
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

        emailString = result[0].getValue({
            name: 'custentity_bc_contact_emails',
            join: 'customerMain'
        });

        if (!emailString) return;

        var emailArr = emailString.split(';');
        var added = {};
        var lineCount = rec.getLineCount({ sublistId: 'otherrecipientslist' }) || 0;
        var i = 0;
        var email = '';

        for (i = 0; i < lineCount; i++) {
            email = rec.getSublistValue({
                sublistId: 'otherrecipientslist',
                fieldId: 'email',
                line: i
            });

            if (email) {
                added[email.toLowerCase().replace(/^\s+|\s+$/g, '')] = true;
            }
        }

        for (i = 0; i < emailArr.length; i++) {
            email = (emailArr[i] || '').replace(/^\s+|\s+$/g, '').toLowerCase();

            if (email && !added[email]) {
                rec.insertLine({
                    sublistId: 'otherrecipientslist',
                    line: lineCount
                });

                rec.setSublistValue({
                    sublistId: 'otherrecipientslist',
                    fieldId: 'email',
                    line: lineCount,
                    value: email
                });

              rec.setSublistValue({
                    sublistId: 'otherrecipientslist',
                    fieldId: 'to',
                    line: lineCount,
                    value: 'T'
                });

                added[email] = true;
                lineCount++;
            }
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});