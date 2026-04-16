/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], function () {

      function validateLine(scriptContext) {
        try {
            var rec = scriptContext.currentRecord;
            var sublistId = scriptContext.sublistId;

            log.debug('Submitted Line Sublist ID: ' + sublistId);

            // optional: log current line values for known sublists
            if (sublistId === 'item') {
                log.debug('Current Item:', rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item'
                }));

                log.debug('Current Quantity:', rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                }));
            }

            if (sublistId === 'mediaitem') {
                log.debug('Current File Value:', rec.getCurrentSublistValue({
                    sublistId: 'mediaitem',
                    fieldId: 'mediaitem'
                }));
            }

            return true;
        } catch (e) {
            log.debug('validateLine Error: ' + e.message);
            return true;
        }
    }

    function saveRecord(context) {
        try {
            var rec = context.currentRecord;
            log.debug('rec', rec)


            // var sublists = rec.getSublists() || [];
            // log.debug('Sublists',sublists);

            // Standard Files subtab on transaction
            var sublistId = 'mediaitem';
            var lineCount = 0;
            var hasFile = false;
            var i, fileId;

            try {
                lineCount = rec.getLineCount({
                    sublistId: sublistId
                }) || 0;
                log.debug('lineCount', lineCount)
            } catch (e) {
                alert('Unable to validate attached files. Please contact admin.');
                return false;
            }

            for (i = 0; i < lineCount; i++) {
                fileId = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'mediaitem',
                    line: i
                });

                if (fileId) {
                    hasFile = true;
                    break;
                }
            }

            if (!hasFile) {
                alert('Please attach file before saving this Invoice.');
                return true;
            }

            return true;

        } catch (e) {
            alert('Error while validating attached files: ' + e.message);
            return false;
        }
    }

    return {
        saveRecord: saveRecord,
      validateLine: validateLine
    };
});