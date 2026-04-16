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

            var emailArr = emailString.split(';');
            var cleanEmails = [];
            var email = '';
            var i = 0;

            for (i = 0; i < emailArr.length; i++) {
                email = (emailArr[i] || '').replace(/^\s+|\s+$/g, '');
                if (email && cleanEmails.indexOf(email) === -1) {
                    cleanEmails.push(email);
                }
            }

            if (cleanEmails.length === 0) {
                return;
            }

            rec.setValue({
                fieldId: 'recipientemail',
                value: cleanEmails.join('; ')
            });

            log.debug({
                title: 'To field updated',
                details: cleanEmails.join('; ')
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
