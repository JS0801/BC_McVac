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

            var sourceEmails = emailString.split(';');
            var cleanEmails = [];
            var seen = {};
            var i = 0;
            var email = '';

            // split + trim + remove duplicates from customer field
            for (i = 0; i < sourceEmails.length; i++) {
                email = (sourceEmails[i] || '').replace(/^\s+|\s+$/g, '').toLowerCase();

                if (email && !seen[email]) {
                    seen[email] = true;
                    cleanEmails.push(email);
                }
            }

            if (cleanEmails.length === 0) {
                return;
            }

            // =========================================
            // CHANGE THESE IDS BASED ON YOUR SUBLIST
            // =========================================
            var SUBLIST_ID = 'otherrecipientslist';
            var EMAIL_FIELD_ID = 'email';
            var TYPE_FIELD_ID = 'to'; // optional, only if your sublist has type field
            var TYPE_VALUE = 'To';    // optional
            // =========================================

            var existingEmails = {};
            var lineCount = 0;
            var existingEmail = '';
            var insertLine = 0;

            try {
                lineCount = rec.getLineCount({
                    sublistId: SUBLIST_ID
                }) || 0;
            } catch (e1) {
                log.debug({
                    title: 'Sublist not found',
                    details: SUBLIST_ID
                });
                return;
            }

            // collect already existing emails from sublist
            for (i = 0; i < lineCount; i++) {
                try {
                    existingEmail = rec.getSublistValue({
                        sublistId: SUBLIST_ID,
                        fieldId: EMAIL_FIELD_ID,
                        line: i
                    });

                    existingEmail = (existingEmail || '').replace(/^\s+|\s+$/g, '').toLowerCase();

                    if (existingEmail) {
                        existingEmails[existingEmail] = true;
                    }
                } catch (e2) {}
            }

            insertLine = lineCount;

            // add only non-duplicate emails
            for (i = 0; i < cleanEmails.length; i++) {
                if (!existingEmails[cleanEmails[i]]) {
                    rec.insertLine({
                        sublistId: SUBLIST_ID,
                        line: insertLine
                    });

                    rec.setSublistValue({
                        sublistId: SUBLIST_ID,
                        fieldId: EMAIL_FIELD_ID,
                        line: insertLine,
                        value: cleanEmails[i]
                    });

                    // only use if this field exists on your sublist
                    try {
                        rec.setSublistValue({
                            sublistId: SUBLIST_ID,
                            fieldId: TYPE_FIELD_ID,
                            line: insertLine,
                            value: TYPE_VALUE
                        });
                    } catch (e3) {}

                    existingEmails[cleanEmails[i]] = true;
                    insertLine++;
                }
            }

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