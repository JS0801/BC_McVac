/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/search', 'N/currentRecord'], function(search, currentRecord) {

    function saveRecord(context) {
        try {
            var rec = context.currentRecord;
            var recId = rec.id;
            var mode = recId ? 'edit' : 'create';
            var hasFile = false;

            if (mode === 'edit') {
                var invoiceSearchObj = search.create({
                    type: 'invoice',
                    filters: [
                        ['type', 'anyof', 'CustInvc'],
                        'AND',
                        ['internalid', 'anyof', recId],
                        'AND',
                        ['file.internalidnumber', 'isnotempty', ''],
                        'AND',
                        ['mainline', 'is', 'T']
                    ],
                    columns: [
                        search.createColumn({
                            name: 'internalid',
                            label: 'Internal ID'
                        })
                    ]
                });

                var searchResultCount = invoiceSearchObj.runPaged().count;
                console.log('invoiceSearchObj result count: ' + searchResultCount);

                if (searchResultCount > 0) {
                    hasFile = true;
                }
            }

            // CREATE MODE
            if (mode === 'create') {
                var table = document.getElementById('mediaitem_splits');
                var attachedRows = [];

                if (table) {
                    attachedRows = table.querySelectorAll('tr[id^="mediaitem_row_"], tr[id^="mediaitemrow"]');
                }

                if (attachedRows && attachedRows.length > 0) {
                    hasFile = true;
                }
            }

            if (!hasFile) {
                alert('Please attach at least one file before saving this Invoice.');
                return true;
            }

            return true;

        } catch (e) {
            log.error('Error while validating attached files: ' + e.message);
        }
    }

    return {
        saveRecord: saveRecord
    };
});