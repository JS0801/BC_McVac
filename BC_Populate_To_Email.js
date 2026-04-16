/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/log'], function(search, log) {

    function beforeLoad(context) {
        try {
            if (context.type !== context.UserEventType.CREATE) {
                return;
            }

            var rec = context.newRecord;
            var transactionId = rec.getValue({ fieldId: 'transaction' });

            if (!transactionId) {
                return;
            }

            var invoiceSearchObj = search.create({
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
                        join: 'customerMain',
                        label: 'Contact Emails'
                    })
                ]
            });

            var emailString = '';

            invoiceSearchObj.run().each(function(result) {
                emailString = result.getValue({
                    name: 'custentity_bc_contact_emails',
                    join: 'customerMain'
                }) || '';
                return false;
            });

            if (!emailString) {
                return;
            }

            var arr = emailString.split(';');
            var uniqueEmails = [];
            var seen = {};
            var i = 0;
            var email = '';

            for (i = 0; i < arr.length; i++) {
                email = (arr[i] || '').replace(/^\s+|\s+$/g, '').toLowerCase();

                if (email && !seen[email]) {
                    seen[email] = true;
                    uniqueEmails.push(email);
                }
            }

            if (uniqueEmails.length === 0) {
                return;
            }

            rec.setValue({
                fieldId: 'recipientemail',
                value: uniqueEmails[0]
            });

            log.debug({
                title: 'To email set',
                details: uniqueEmails[0]
            });

        } catch (e) {
            log.error({
                title: 'beforeLoad Error',
                details: e
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});